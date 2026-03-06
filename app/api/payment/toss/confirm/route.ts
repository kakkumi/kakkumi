import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendPurchaseReceipt } from "@/lib/email";
import { nowKST } from "@/lib/date";
import { getPurchaseCredit, CREDIT_EXPIRY_DAYS, DAY_MS } from "@/lib/constants";
import { notifyPurchaseComplete } from "@/lib/notification";

// 토스페이먼츠 결제 승인 API
// 클라이언트에서 받은 paymentKey, orderId, amount를 서버에서 검증 후 DB 저장
export async function POST(request: Request) {
    const session = await getServerSession();

    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const secretKey = process.env.TOSSPAYMENTS_SECRET_KEY;
    if (!secretKey) {
        return NextResponse.json({ error: "결제 설정 오류입니다." }, { status: 500 });
    }

    const body = (await request.json()) as {
        paymentKey: string;
        orderId: string;
        amount: number;
        themeId: string;
        versionId?: string;
    };

    const { paymentKey, orderId, amount, themeId, versionId } = body;

    if (!paymentKey || !orderId || !amount || !themeId) {
        return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
    }

    // DB에서 테마 확인 및 금액 검증 (SSOT: 클라이언트 금액을 신뢰하지 않음)
    console.log("[toss/confirm] themeId:", themeId, "amount:", amount);
    const theme = await prisma.theme.findUnique({ where: { id: themeId } });

    if (!theme) {
        console.error("[toss/confirm] 테마 없음. themeId:", themeId);
        return NextResponse.json({ error: `테마를 찾을 수 없습니다. (id: ${themeId})` }, { status: 404 });
    }

    if (theme.price !== amount) {
        console.error("[toss/confirm] 금액 불일치. DB:", theme.price, "요청:", amount);
        return NextResponse.json({ error: `결제 금액이 일치하지 않습니다. (DB: ${theme.price}원, 요청: ${amount}원)` }, { status: 400 });
    }

    // 동일 버전 이미 구매 여부 확인
    const existingRows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Purchase"
        WHERE "buyerId" = ${session.dbId}
          AND "themeId" = ${themeId}
          AND ("versionId" = ${versionId ?? null} OR ("versionId" IS NULL AND ${versionId ?? null}::text IS NULL))
          AND status = 'COMPLETED'::"PurchaseStatus"
        LIMIT 1
    `;
    if (existingRows.length > 0) {
        return NextResponse.json({ error: "이미 구매한 옵션입니다." }, { status: 409 });
    }

    // 토스페이먼츠 결제 승인 요청
    const encryptedSecretKey = Buffer.from(`${secretKey}:`).toString("base64");

    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
        method: "POST",
        headers: {
            Authorization: `Basic ${encryptedSecretKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!tossResponse.ok) {
        const errorData = (await tossResponse.json()) as { message?: string; code?: string };
        return NextResponse.json(
            { error: errorData.message ?? "결제 승인에 실패했습니다.", code: errorData.code },
            { status: 400 }
        );
    }

    const tossData = (await tossResponse.json()) as { paymentKey: string; status: string };

    const purchaseId = crypto.randomUUID();
    const now = nowKST();

    // DB에 구매 기록 저장
    await prisma.$executeRaw`
        INSERT INTO "Purchase" (id, "buyerId", "themeId", "versionId", amount, "pgTransactionId", status, "createdAt")
        VALUES (${purchaseId}, ${session.dbId}, ${themeId}, ${versionId ?? null}, ${amount}, ${tossData.paymentKey}, 'COMPLETED'::"PurchaseStatus", ${now})
    `;

    // 구매 적립금 지급
    const reward = getPurchaseCredit(theme.price);
    if (reward > 0) {
        const expiresAt = new Date(now.getTime() + CREDIT_EXPIRY_DAYS * DAY_MS);
        await prisma.$executeRaw`
            UPDATE "User" SET credit = credit + ${reward}, "updatedAt" = NOW() WHERE id = ${session.dbId}
        `;
        await prisma.$executeRaw`
            INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "expiresAt", "createdAt")
            VALUES (${crypto.randomUUID()}, ${session.dbId}, ${reward}, 'ADMIN_GRANT'::"PointType", ${`구매 적립 (+${reward}원)`}, ${expiresAt}, ${now})
        `;
    }

    // 구매 완료 알림 (알림 설정 체크)
    await notifyPurchaseComplete(session.dbId, theme.title, themeId);

    // 영수증 이메일 발송
    const userRows = await prisma.$queryRaw<{ email: string | null; name: string; nickname: string | null }[]>`
        SELECT email, name, nickname FROM "User" WHERE id = ${session.dbId} LIMIT 1
    `;
    const user = userRows[0];
    if (user?.email && theme.price > 0) {
        await sendPurchaseReceipt({
            to: user.email,
            name: user.nickname ?? user.name,
            themeTitle: theme.title,
            amount: theme.price,
            purchaseDate: now,
        }).catch(e => console.error("[receipt email]", e));
    }

    return NextResponse.json({ success: true, paymentKey: tossData.paymentKey });
}

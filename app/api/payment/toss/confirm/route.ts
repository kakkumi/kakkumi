import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendPurchaseReceipt } from "@/lib/email";
import { nowKST } from "@/lib/date";

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
        orderId: string;     // "{themeId}_{userId}_{timestamp}" 형식
        amount: number;
        themeId: string;
    };

    const { paymentKey, orderId, amount, themeId } = body;

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

    // 이미 구매한 테마인지 확인
    const existing = await prisma.purchase.findFirst({
        where: { buyerId: session.dbId, themeId, status: "COMPLETED" },
    });

    if (existing) {
        return NextResponse.json({ error: "이미 구매한 테마입니다." }, { status: 409 });
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

    // DB에 구매 기록 저장
    await prisma.purchase.create({
        data: {
            buyerId: session.dbId,
            themeId,
            amount,
            pgTransactionId: tossData.paymentKey,
            status: "COMPLETED",
        },
    });

    // 구매 적립금 지급
    function getPurchaseCredit(price: number): number {
        if (price === 0) return 0;
        if (price <= 500) return 10;
        if (price <= 1000) return 20;
        if (price <= 1500) return 30;
        return 50;
    }
    const reward = getPurchaseCredit(theme.price);
    const now = nowKST();
    if (reward > 0) {
        const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        await prisma.$executeRaw`
            UPDATE "User" SET credit = credit + ${reward}, "updatedAt" = NOW() WHERE id = ${session.dbId}
        `;
        await prisma.$executeRaw`
            INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "expiresAt", "createdAt")
            VALUES (${crypto.randomUUID()}, ${session.dbId}, ${reward}, 'ADMIN_GRANT'::"PointType", ${`구매 적립 (+${reward}원)`}, ${expiresAt}, ${now})
        `;
    }

    // 구매 완료 알림
    await prisma.$executeRaw`
        INSERT INTO "Notification" (id, "userId", type, title, body, "linkUrl", "createdAt")
        VALUES (
            ${crypto.randomUUID()},
            ${session.dbId},
            'PURCHASE_COMPLETE'::"NotificationType",
            ${'구매 완료'},
            ${`"${theme.title}" 구매가 완료되었습니다.`},
            ${'/mypage'},
            ${now}
        )
    `;

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

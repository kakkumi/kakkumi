import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendPurchaseReceipt } from "@/lib/email";
import { nowKST } from "@/lib/date";
import { getTossAuthHeader } from "@/lib/toss";
import { validateVersionId, checkAlreadyPurchased, grantPurchaseCredit } from "@/lib/purchase";
import { notifyPurchaseComplete } from "@/lib/notification";

// 토스페이먼츠 결제 승인 API
// 클라이언트에서 받은 paymentKey, orderId, amount를 서버에서 검증 후 DB 저장
export async function POST(request: Request) {
    const session = await getServerSession();

    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const authHeader = getTossAuthHeader();
    if (!authHeader) {
        return NextResponse.json({ error: "결제 설정 오류입니다." }, { status: 500 });
    }

    const body = (await request.json()) as {
        paymentKey: string;
        orderId: string;
        amount: number;
        themeId: string;
        versionId?: string;
    };

    const { paymentKey, orderId, amount, themeId, versionId: rawVersionId } = body;

    if (!paymentKey || !orderId || !amount || !themeId) {
        return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
    }

    // versionId 검증 (공통 유틸)
    const versionId = await validateVersionId(rawVersionId);

    // DB에서 테마 확인 및 금액 검증 (SSOT: 클라이언트 금액을 신뢰하지 않음)
    const themeRows = await prisma.$queryRaw<{ price: number; discountPrice: number | null; status: string; title: string }[]>`
        SELECT price, "discountPrice", status, title FROM "Theme" WHERE id = ${themeId} LIMIT 1
    `;
    const theme = themeRows[0];

    if (!theme) {
        return NextResponse.json({ error: "테마를 찾을 수 없습니다." }, { status: 404 });
    }

    // 실제 결제 금액 = 할인가 있으면 할인가, 없으면 원가
    const effectivePrice = (theme.discountPrice != null && theme.price > 0 && theme.discountPrice < theme.price)
        ? theme.discountPrice
        : theme.price;

    if (effectivePrice !== amount) {
        return NextResponse.json({ error: "결제 금액이 올바르지 않습니다." }, { status: 400 });
    }

    // 중복 구매 확인 (공통 유틸)
    if (await checkAlreadyPurchased(session.dbId, themeId)) {
        return NextResponse.json({ error: "이미 구매한 옵션입니다." }, { status: 409 });
    }

    // 토스페이먼츠 결제 승인 요청
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
        method: "POST",
        headers: {
            Authorization: authHeader,
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
        INSERT INTO "Purchase" (id, "buyerId", "themeId", "versionId", amount, "pgTransactionId", status, "isDownloaded", "createdAt")
        VALUES (${purchaseId}, ${session.dbId}, ${themeId}, ${versionId ?? null}, ${amount}, ${tossData.paymentKey}, 'COMPLETED'::"PurchaseStatus", false, ${now})
    `;

    // 구매 적립금 지급 (공통 유틸)
    await grantPurchaseCredit(session.dbId, effectivePrice, now);

    // 구매 완료 알림 (알림 설정 체크)
    await notifyPurchaseComplete(session.dbId, theme.title, themeId);

    // 영수증 이메일 발송
    const userRows = await prisma.$queryRaw<{ email: string | null; name: string; nickname: string | null }[]>`
        SELECT email, name, nickname FROM "User" WHERE id = ${session.dbId} LIMIT 1
    `;
    const user = userRows[0];
    if (user?.email && effectivePrice > 0) {
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

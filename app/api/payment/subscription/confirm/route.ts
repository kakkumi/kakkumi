// app/api/payment/subscription/confirm/route.ts
// 구독 결제 승인 API (토스페이먼츠 requestPayment 방식)
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const secretKey = process.env.TOSSPAYMENTS_SECRET_KEY;
    if (!secretKey) {
        return NextResponse.json({ error: "결제 설정 오류입니다." }, { status: 500 });
    }

    let body: { paymentKey?: string; orderId?: string; amount?: number };
    try {
        body = await request.json() as { paymentKey?: string; orderId?: string; amount?: number };
    } catch {
        return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
    }

    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
        return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
    }

    // 금액 검증 (구독료는 4900원 고정)
    const SUBSCRIPTION_AMOUNT = 4900;
    if (amount !== SUBSCRIPTION_AMOUNT) {
        return NextResponse.json({ error: "결제 금액이 올바르지 않습니다." }, { status: 400 });
    }

    // 이미 구독 중인지 확인
    const existing = await prisma.subscription.findUnique({ where: { userId: session.dbId } });
    if (existing?.status === "ACTIVE") {
        return NextResponse.json({ error: "이미 구독 중입니다." }, { status: 400 });
    }

    // 토스페이먼츠 결제 승인 요청
    const encKey = Buffer.from(`${secretKey}:`).toString("base64");
    let tossData: { paymentKey: string; method?: string; card?: { company?: string; number?: string }; easyPay?: { provider?: string } };

    try {
        const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
            method: "POST",
            headers: { Authorization: `Basic ${encKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        if (!tossRes.ok) {
            const err = await tossRes.json() as { message?: string };
            return NextResponse.json({ error: err.message ?? "결제 승인에 실패했습니다." }, { status: 400 });
        }

        tossData = await tossRes.json() as typeof tossData;
    } catch {
        return NextResponse.json({ error: "결제 승인 중 오류가 발생했습니다." }, { status: 500 });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Subscription 저장 — cardCompany/cardNumber는 컬럼이 없을 수 있으므로 별도 처리
    try {
        if (existing) {
            // status, startedAt, nextBillingAt, cancelledAt만 업데이트 (기본 컬럼만)
            await prisma.$executeRaw`
                UPDATE "Subscription"
                SET status = 'ACTIVE'::"SubscriptionStatus",
                    "cancelledAt" = NULL,
                    "startedAt" = ${now},
                    "nextBillingAt" = ${periodEnd},
                    "updatedAt" = ${now}
                WHERE "userId" = ${session.dbId}
            `;
        } else {
            const subId = crypto.randomUUID();
            await prisma.$executeRaw`
                INSERT INTO "Subscription" (id, "userId", status, amount, "startedAt", "nextBillingAt", "createdAt", "updatedAt")
                VALUES (${subId}, ${session.dbId}, 'ACTIVE'::"SubscriptionStatus", ${4900}, ${now}, ${periodEnd}, ${now}, ${now})
            `;
        }
    } catch (e) {
        console.error("[subscription confirm] Subscription 저장 오류:", e);
        return NextResponse.json({ error: "구독 정보 저장 중 오류가 발생했습니다. 관리자에게 문의해주세요." }, { status: 500 });
    }

    // 카드 정보 업데이트 — 컬럼이 없으면 무시
    try {
        const cardCompany = tossData.card?.company ?? tossData.easyPay?.provider ?? null;
        const cardNumber = tossData.card?.number ?? null;
        await prisma.$executeRaw`
            UPDATE "Subscription"
            SET "cardCompany" = ${cardCompany}, "cardNumber" = ${cardNumber}
            WHERE "userId" = ${session.dbId}
        `;
    } catch { /* cardCompany/cardNumber 컬럼 미존재 시 무시 */ }

    // 결제 내역 저장 — 테이블 없으면 무시
    try {
        const sub = await prisma.subscription.findUnique({ where: { userId: session.dbId } });
        if (sub) {
            const paymentId = crypto.randomUUID();
            await prisma.$executeRaw`
                INSERT INTO "SubscriptionPayment" (id, "subscriptionId", "userId", amount, status, "pgTransactionId", "periodStart", "periodEnd", "paidAt", "createdAt")
                VALUES (${paymentId}, ${sub.id}, ${session.dbId}, ${4900}, 'COMPLETED'::"SubscriptionPaymentStatus", ${tossData.paymentKey}, ${now}, ${periodEnd}, ${now}, ${now})
            `;
        }
    } catch { /* SubscriptionPayment 테이블 미존재 시 무시 */ }

    return NextResponse.json({ ok: true });
}

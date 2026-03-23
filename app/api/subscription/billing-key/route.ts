// app/api/subscription/billing-key/route.ts
// 토스페이먼츠 빌링키 발급 후 첫 결제 처리
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getTossAuthHeader } from "@/lib/toss";

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const authHeader = getTossAuthHeader();
    if (!authHeader) return NextResponse.json({ error: "결제 설정 오류입니다." }, { status: 500 });

    const body = await req.json() as { authKey: string; customerKey: string };
    const { authKey, customerKey } = body;
    if (!authKey || !customerKey) {
        return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
    }

    // 1. 빌링키 발급
    const issueRes = await fetch("https://api.tosspayments.com/v1/billing/authorizations/issue", {
        method: "POST",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ authKey, customerKey }),
    });

    if (!issueRes.ok) {
        const err = await issueRes.json() as { message?: string };
        return NextResponse.json({ error: err.message ?? "빌링키 발급에 실패했습니다." }, { status: 400 });
    }

    const billingData = await issueRes.json() as {
        billingKey: string;
        card?: { company?: string; number?: string };
    };
    const billingKey = billingData.billingKey;
    const cardCompany = billingData.card?.company ?? null;
    const cardNumber = billingData.card?.number ?? null;

    // 2. 중복 확인 - 이미 ACTIVE 구독이 있으면 거절
    const existing = await prisma.subscription.findUnique({ where: { userId: session.dbId } });
    if (existing?.status === "ACTIVE") {
        return NextResponse.json({ error: "이미 구독 중입니다." }, { status: 400 });
    }

    // 3. 유저 정보 조회
    const userRows = await prisma.$queryRaw<{ email: string | null; name: string; nickname: string | null }[]>`
        SELECT email, name, nickname FROM "User" WHERE id = ${session.dbId} LIMIT 1
    `;
    const user = userRows[0];
    const customerName = user?.nickname ?? user?.name ?? "사용자";
    const customerEmail = user?.email ?? "";

    // 4. 첫 결제 실행
    const amount = 4900;
    const orderId = `sub_${session.dbId}_${Date.now()}`;
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const chargeRes = await fetch(`https://api.tosspayments.com/v1/billing/${billingKey}`, {
        method: "POST",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
            customerKey,
            amount,
            orderId,
            orderName: "카꾸미 Pro 구독",
            customerName,
            customerEmail,
        }),
    });

    if (!chargeRes.ok) {
        const err = await chargeRes.json() as { message?: string };
        return NextResponse.json({ error: err.message ?? "결제에 실패했습니다." }, { status: 400 });
    }

    const chargeData = await chargeRes.json() as { paymentKey: string; status: string };

    // 5. DB 저장 — 트랜잭션으로 원자성 보장
    // Toss 결제는 이미 성공했으므로, DB 실패 시 paymentKey를 로그에 남겨 수동 처리 가능하도록 함
    try {
        const subId = crypto.randomUUID();
        const paymentId = crypto.randomUUID();

        await prisma.$transaction(async (tx) => {
            if (existing) {
                await tx.$executeRaw`
                    UPDATE "Subscription"
                    SET status = 'ACTIVE'::"SubscriptionStatus",
                        "billingKey" = ${billingKey},
                        "customerKey" = ${customerKey},
                        "cardCompany" = ${cardCompany},
                        "cardNumber" = ${cardNumber},
                        "cancelledAt" = NULL,
                        "startedAt" = ${now},
                        "nextBillingAt" = ${periodEnd},
                        "updatedAt" = ${now}
                    WHERE "userId" = ${session.dbId}
                `;
                await tx.$executeRaw`
                    INSERT INTO "SubscriptionPayment" (id, "subscriptionId", "userId", amount, status, "pgTransactionId", "periodStart", "periodEnd", "paidAt", "createdAt")
                    VALUES (${paymentId}, ${existing.id}, ${session.dbId}, ${amount}, 'COMPLETED'::"SubscriptionPaymentStatus", ${chargeData.paymentKey}, ${now}, ${periodEnd}, ${now}, ${now})
                `;
            } else {
                await tx.$executeRaw`
                    INSERT INTO "Subscription" (id, "userId", status, amount, "billingKey", "customerKey", "cardCompany", "cardNumber", "startedAt", "nextBillingAt", "createdAt", "updatedAt")
                    VALUES (${subId}, ${session.dbId}, 'ACTIVE'::"SubscriptionStatus", ${amount}, ${billingKey}, ${customerKey}, ${cardCompany}, ${cardNumber}, ${now}, ${periodEnd}, ${now}, ${now})
                `;
                await tx.$executeRaw`
                    INSERT INTO "SubscriptionPayment" (id, "subscriptionId", "userId", amount, status, "pgTransactionId", "periodStart", "periodEnd", "paidAt", "createdAt")
                    VALUES (${paymentId}, ${subId}, ${session.dbId}, ${amount}, 'COMPLETED'::"SubscriptionPaymentStatus", ${chargeData.paymentKey}, ${now}, ${periodEnd}, ${now}, ${now})
                `;
            }
        });
    } catch (dbErr) {
        // DB 저장 실패 — Toss 결제는 성공했으므로 paymentKey 로그 기록 후 오류 반환
        console.error("[billing-key] DB 저장 실패. paymentKey:", chargeData.paymentKey, dbErr);
        return NextResponse.json(
            { error: "결제는 완료되었으나 서버 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요.", paymentKey: chargeData.paymentKey },
            { status: 500 }
        );
    }

    return NextResponse.json({ ok: true });
}

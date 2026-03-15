// app/api/subscription/billing-key/route.ts
// 토스페이먼츠 빌링키 발급 후 첫 결제 처리
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const secretKey = process.env.TOSSPAYMENTS_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: "결제 설정 오류입니다." }, { status: 500 });

    const body = await req.json() as { authKey: string; customerKey: string };
    const { authKey, customerKey } = body;
    if (!authKey || !customerKey) {
        return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
    }

    const encKey = Buffer.from(`${secretKey}:`).toString("base64");

    // 1. 빌링키 발급
    const issueRes = await fetch("https://api.tosspayments.com/v1/billing/authorizations/issue", {
        method: "POST",
        headers: { Authorization: `Basic ${encKey}`, "Content-Type": "application/json" },
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
        headers: { Authorization: `Basic ${encKey}`, "Content-Type": "application/json" },
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

    // 5. DB 저장
    const subId = crypto.randomUUID();
    const paymentId = crypto.randomUUID();

    if (existing) {
        await prisma.$executeRaw`
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
        const sub = await prisma.subscription.findUnique({ where: { userId: session.dbId } });
        if (sub) {
            await prisma.$executeRaw`
                INSERT INTO "SubscriptionPayment" (id, "subscriptionId", "userId", amount, status, "pgTransactionId", "periodStart", "periodEnd", "paidAt", "createdAt")
                VALUES (${paymentId}, ${sub.id}, ${session.dbId}, ${amount}, 'COMPLETED'::"SubscriptionPaymentStatus", ${chargeData.paymentKey}, ${now}, ${periodEnd}, ${now}, ${now})
            `;
        }
    } else {
        await prisma.$executeRaw`
            INSERT INTO "Subscription" (id, "userId", status, amount, "billingKey", "customerKey", "cardCompany", "cardNumber", "startedAt", "nextBillingAt", "createdAt", "updatedAt")
            VALUES (${subId}, ${session.dbId}, 'ACTIVE'::"SubscriptionStatus", ${amount}, ${billingKey}, ${customerKey}, ${cardCompany}, ${cardNumber}, ${now}, ${periodEnd}, ${now}, ${now})
        `;
        await prisma.$executeRaw`
            INSERT INTO "SubscriptionPayment" (id, "subscriptionId", "userId", amount, status, "pgTransactionId", "periodStart", "periodEnd", "paidAt", "createdAt")
            VALUES (${paymentId}, ${subId}, ${session.dbId}, ${amount}, 'COMPLETED'::"SubscriptionPaymentStatus", ${chargeData.paymentKey}, ${now}, ${periodEnd}, ${now}, ${now})
        `;
    }

    return NextResponse.json({ ok: true });
}

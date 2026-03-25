import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const subscriptions = await prisma.$queryRaw<{
            id: string; status: string; amount: number;
            startedAt: Date; nextBillingAt: Date | null; cancelledAt: Date | null;
            cardCompany: string | null; cardNumber: string | null;
            userNickname: string | null; userName: string;
            userEmail: string | null; userId: string;
        }[]>`
            SELECT s.id, s.status, s.amount, s."startedAt", s."nextBillingAt", s."cancelledAt",
                   s."cardCompany", s."cardNumber",
                   u.id AS "userId", u.nickname AS "userNickname", u.name AS "userName", u.email AS "userEmail"
            FROM "Subscription" s
            JOIN "User" u ON s."userId" = u.id
            ORDER BY s."createdAt" DESC
        `;
        return NextResponse.json({
            subscriptions: subscriptions.map(s => ({
                ...s,
                startedAt: s.startedAt instanceof Date ? s.startedAt.toISOString() : String(s.startedAt),
                nextBillingAt: s.nextBillingAt instanceof Date ? s.nextBillingAt.toISOString() : (s.nextBillingAt ? String(s.nextBillingAt) : null),
                cancelledAt: s.cancelledAt instanceof Date ? s.cancelledAt.toISOString() : (s.cancelledAt ? String(s.cancelledAt) : null),
            })),
        });
    } catch (e) {
        console.error("[admin/subscriptions GET]", e);
        return NextResponse.json({ subscriptions: [] });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { subscriptionId, action } = await req.json() as {
            subscriptionId: string;
            action: "cancel";
        };
        if (action === "cancel") {
            await prisma.$executeRaw`
                UPDATE "Subscription"
                SET status = 'CANCELLED'::"SubscriptionStatus",
                    "cancelledAt" = NOW(),
                    "updatedAt" = NOW()
                WHERE id = ${subscriptionId}
            `;
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/subscriptions PATCH]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}


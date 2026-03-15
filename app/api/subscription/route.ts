import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 구독 상태 조회
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ subscription: null, payments: [], role: null });

    try {
        const sub = await prisma.subscription.findUnique({ where: { userId: session.dbId } });

        let payments: {
            id: string;
            amount: number;
            status: string;
            pgTransactionId: string | null;
            periodStart: Date;
            periodEnd: Date;
            paidAt: Date;
        }[] = [];

        if (sub) {
            try {
                payments = await prisma.$queryRaw<typeof payments>`
                    SELECT id, amount, status, "pgTransactionId", "periodStart", "periodEnd", "paidAt"
                    FROM "SubscriptionPayment"
                    WHERE "subscriptionId" = ${sub.id}
                    ORDER BY "paidAt" DESC
                `;
            } catch { /* SubscriptionPayment 테이블 미존재 시 빈 배열 유지 */ }
        }

        return NextResponse.json({ subscription: sub, payments, role: session.role ?? null });
    } catch {
        return NextResponse.json({ subscription: null, payments: [], role: null });
    }
}

// 구독 해지
export async function DELETE() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    try {
        const existing = await prisma.subscription.findUnique({ where: { userId: session.dbId } });
        if (!existing || existing.status !== "ACTIVE") {
            return NextResponse.json({ error: "구독 중이 아닙니다." }, { status: 400 });
        }

        await prisma.subscription.update({
            where: { userId: session.dbId },
            data: { status: "CANCELLED", cancelledAt: new Date() },
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "해지 처리 중 오류가 발생했습니다." }, { status: 500 });
    }
}


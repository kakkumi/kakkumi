import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        // 총 현황
        const [totalUsers] = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "User" WHERE "deletedAt" IS NULL
        `;
        const [totalThemes] = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "Theme" WHERE status = 'PUBLISHED'
        `;
        const [purchaseStats] = await prisma.$queryRaw<{ count: bigint; revenue: bigint }[]>`
            SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as revenue
            FROM "Purchase" WHERE status = 'COMPLETED'
        `;
        const [activeSubs] = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "Subscription" WHERE status = 'ACTIVE'
        `;
        const [subRevenue] = await prisma.$queryRaw<{ revenue: bigint }[]>`
            SELECT COALESCE(SUM(amount), 0) as revenue
            FROM "SubscriptionPayment" WHERE status = 'COMPLETED'
        `;

        // 월별 매출 (최근 6개월, 구매 + 구독)
        const monthlyPurchases = await prisma.$queryRaw<{ month: string; amount: bigint }[]>`
            SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
                   COALESCE(SUM(amount), 0) AS amount
            FROM "Purchase"
            WHERE status = 'COMPLETED'
              AND "createdAt" >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
            GROUP BY month ORDER BY month ASC
        `;
        const monthlySubPayments = await prisma.$queryRaw<{ month: string; amount: bigint }[]>`
            SELECT TO_CHAR(DATE_TRUNC('month', "paidAt"), 'YYYY-MM') AS month,
                   COALESCE(SUM(amount), 0) AS amount
            FROM "SubscriptionPayment"
            WHERE status = 'COMPLETED'
              AND "paidAt" >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
            GROUP BY month ORDER BY month ASC
        `;

        // 월별 합산
        const revenueMap = new Map<string, number>();
        for (const r of monthlyPurchases) revenueMap.set(r.month, (revenueMap.get(r.month) ?? 0) + Number(r.amount));
        for (const r of monthlySubPayments) revenueMap.set(r.month, (revenueMap.get(r.month) ?? 0) + Number(r.amount));
        const monthlyRevenue = Array.from(revenueMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, amount]) => ({ month, amount }));

        // 월별 신규 가입자 (최근 6개월)
        const monthlySignups = await prisma.$queryRaw<{ month: string; count: bigint }[]>`
            SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
                   COUNT(*) AS count
            FROM "User"
            WHERE "deletedAt" IS NULL
              AND "createdAt" >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
            GROUP BY month ORDER BY month ASC
        `;

        // 상위 테마 TOP 5 (판매량 기준)
        const topThemes = await prisma.$queryRaw<{
            id: string; title: string; salesCount: bigint; revenue: bigint; creatorName: string;
        }[]>`
            SELECT t.id, t.title,
                   COUNT(p.id) FILTER (WHERE p.status = 'COMPLETED') AS "salesCount",
                   COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'COMPLETED'), 0) AS revenue,
                   COALESCE(u.nickname, u.name) AS "creatorName"
            FROM "Theme" t
            JOIN "User" u ON t."creatorId" = u.id
            LEFT JOIN "Purchase" p ON p."themeId" = t.id
            WHERE t.status = 'PUBLISHED'
            GROUP BY t.id, u.nickname, u.name
            ORDER BY "salesCount" DESC
            LIMIT 5
        `;

        return NextResponse.json({
            totals: {
                users: Number(totalUsers.count),
                themes: Number(totalThemes.count),
                purchases: Number(purchaseStats.count),
                totalRevenue: Number(purchaseStats.revenue) + Number(subRevenue.revenue),
                activeSubscriptions: Number(activeSubs.count),
            },
            monthlyRevenue: monthlyRevenue,
            monthlySignups: monthlySignups.map(r => ({ month: r.month, count: Number(r.count) })),
            topThemes: topThemes.map(t => ({
                id: t.id,
                title: t.title,
                salesCount: Number(t.salesCount),
                revenue: Number(t.revenue),
                creatorName: t.creatorName,
            })),
        });
    } catch (e) {
        console.error("[admin/stats GET]", e);
        return NextResponse.json({ error: "통계 조회 실패" }, { status: 500 });
    }
}


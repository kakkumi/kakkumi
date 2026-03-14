import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ stats: null });

    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");   // "2025" | null
    const month = searchParams.get("month"); // "3" | null

    // 기간 필터 조건 생성
    let dateFilter = `p.status = 'COMPLETED'::"PurchaseStatus"`;
    if (year && month) {
        const from = new Date(Number(year), Number(month) - 1, 1);
        const to   = new Date(Number(year), Number(month), 1);
        dateFilter += ` AND p."createdAt" >= '${from.toISOString()}' AND p."createdAt" < '${to.toISOString()}'`;
    } else if (year) {
        const from = new Date(Number(year), 0, 1);
        const to   = new Date(Number(year) + 1, 0, 1);
        dateFilter += ` AND p."createdAt" >= '${from.toISOString()}' AND p."createdAt" < '${to.toISOString()}'`;
    }

    const rows = await prisma.$queryRawUnsafe<{
        themeId: string;
        themeTitle: string;
        price: number;
        totalSales: bigint;
        totalAmount: bigint;
    }[]>(`
        SELECT
            t.id AS "themeId",
            t.title AS "themeTitle",
            t.price,
            COUNT(p.id) AS "totalSales",
            COALESCE(SUM(p.amount), 0) AS "totalAmount"
        FROM "Theme" t
        LEFT JOIN "Purchase" p ON p."themeId" = t.id AND ${dateFilter}
        WHERE t."creatorId" = '${session.dbId}'
          AND t.status = 'PUBLISHED'::"ThemeStatus"
        GROUP BY t.id, t.title, t.price
        ORDER BY "totalSales" DESC
    `);

    // 월별 집계 (전체 또는 연도 선택 시)
    let monthly: { month: number; sales: number; amount: number }[] = [];
    if (!month) {
        let monthlyFilter = `p.status = 'COMPLETED'::"PurchaseStatus"`;
        if (year) {
            const from = new Date(Number(year), 0, 1);
            const to   = new Date(Number(year) + 1, 0, 1);
            monthlyFilter += ` AND p."createdAt" >= '${from.toISOString()}' AND p."createdAt" < '${to.toISOString()}'`;
        }
        const mRows = await prisma.$queryRawUnsafe<{ m: number; sales: bigint; amount: bigint }[]>(`
            SELECT
                EXTRACT(MONTH FROM p."createdAt")::int AS m,
                COUNT(p.id) AS sales,
                COALESCE(SUM(p.amount), 0) AS amount
            FROM "Purchase" p
            JOIN "Theme" t ON p."themeId" = t.id
            WHERE t."creatorId" = '${session.dbId}'
              AND ${monthlyFilter}
            GROUP BY m
            ORDER BY m
        `);
        monthly = mRows.map(r => ({ month: r.m, sales: Number(r.sales), amount: Number(r.amount) }));
    }

    // 연도 목록 (항상 반환)
    const yearRows = await prisma.$queryRaw<{ y: number }[]>`
        SELECT DISTINCT EXTRACT(YEAR FROM p."createdAt")::int AS y
        FROM "Purchase" p
        JOIN "Theme" t ON p."themeId" = t.id
        WHERE t."creatorId" = ${session.dbId}
          AND p.status = 'COMPLETED'
        ORDER BY y DESC
    `;
    const years = yearRows.map(r => r.y);

    const totalSales  = rows.reduce((s, r) => s + Number(r.totalSales), 0);
    const totalAmount = rows.reduce((s, r) => s + Number(r.totalAmount), 0);

    return NextResponse.json({
        stats: {
            totalSales,
            totalAmount,
            themes: rows.map(r => ({
                themeId: r.themeId,
                themeTitle: r.themeTitle,
                price: r.price,
                totalSales: Number(r.totalSales),
                totalAmount: Number(r.totalAmount),
            })),
            monthly,
            years,
        },
    });
}

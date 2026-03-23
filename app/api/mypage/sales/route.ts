import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ stats: null });

    const { searchParams } = new URL(req.url);
    const yearStr  = searchParams.get("year");
    const monthStr = searchParams.get("month");

    // 정수 or null — Prisma 템플릿에서 null은 SQL NULL로 바인딩됨
    const yearVal:  number | null = yearStr  ? parseInt(yearStr,  10) : null;
    const monthVal: number | null = monthStr ? parseInt(monthStr, 10) : null;

    // $queryRaw 파라미터 바인딩 사용 — SQL 인젝션 원천 차단
    const rows = await prisma.$queryRaw<{
        themeId: string;
        themeTitle: string;
        price: number;
        totalSales: bigint;
        totalAmount: bigint;
    }[]>`
        SELECT
            t.id AS "themeId",
            t.title AS "themeTitle",
            t.price,
            COUNT(p.id) AS "totalSales",
            COALESCE(SUM(p.amount), 0) AS "totalAmount"
        FROM "Theme" t
        LEFT JOIN "Purchase" p
            ON p."themeId" = t.id
           AND p.status = 'COMPLETED'::"PurchaseStatus"
           AND (${yearVal}::int  IS NULL OR EXTRACT(YEAR  FROM p."createdAt")::int = ${yearVal}::int)
           AND (${monthVal}::int IS NULL OR EXTRACT(MONTH FROM p."createdAt")::int = ${monthVal}::int)
        WHERE t."creatorId" = ${session.dbId}
          AND t.status = 'PUBLISHED'::"ThemeStatus"
        GROUP BY t.id, t.title, t.price
        ORDER BY "totalSales" DESC
    `;

    // 월별 집계 (전체 또는 연도 선택 시)
    let monthly: { month: number; sales: number; amount: number }[] = [];
    if (!monthVal) {
        const mRows = await prisma.$queryRaw<{ m: number; sales: bigint; amount: bigint }[]>`
            SELECT
                EXTRACT(MONTH FROM p."createdAt")::int AS m,
                COUNT(p.id) AS sales,
                COALESCE(SUM(p.amount), 0) AS amount
            FROM "Purchase" p
            JOIN "Theme" t ON p."themeId" = t.id
            WHERE t."creatorId" = ${session.dbId}
              AND p.status = 'COMPLETED'::"PurchaseStatus"
              AND (${yearVal}::int IS NULL OR EXTRACT(YEAR FROM p."createdAt")::int = ${yearVal}::int)
            GROUP BY m
            ORDER BY m
        `;
        monthly = mRows.map(r => ({ month: r.m, sales: Number(r.sales), amount: Number(r.amount) }));
    }

    // 연도 목록
    const yearRows = await prisma.$queryRaw<{ y: number }[]>`
        SELECT DISTINCT EXTRACT(YEAR FROM p."createdAt")::int AS y
        FROM "Purchase" p
        JOIN "Theme" t ON p."themeId" = t.id
        WHERE t."creatorId" = ${session.dbId}
          AND p.status = 'COMPLETED'::"PurchaseStatus"
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

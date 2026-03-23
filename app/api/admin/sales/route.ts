import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const purchases = await prisma.$queryRaw<{
            id: string; amount: number; status: string; createdAt: Date;
            pgTransactionId: string | null;
            buyerNickname: string | null; buyerName: string;
            themeTitle: string; creatorNickname: string | null; creatorName: string;
        }[]>`
            SELECT p.id, p.amount, p.status, p."createdAt", p."pgTransactionId",
                   bu.nickname AS "buyerNickname", bu.name AS "buyerName",
                   t.title AS "themeTitle",
                   cu.nickname AS "creatorNickname", cu.name AS "creatorName"
            FROM "Purchase" p
            JOIN "User" bu ON p."buyerId" = bu.id
            JOIN "Theme" t ON p."themeId" = t.id
            JOIN "User" cu ON t."creatorId" = cu.id
            ORDER BY p."createdAt" DESC
        `;

        const settlements = await prisma.$queryRaw<{
            creatorId: string; creatorNickname: string | null; creatorName: string;
            totalSales: bigint; totalAmount: bigint; settlementAmount: bigint;
        }[]>`
            SELECT cu.id AS "creatorId",
                   cu.nickname AS "creatorNickname", cu.name AS "creatorName",
                   COUNT(p.id) AS "totalSales",
                   SUM(p.amount) AS "totalAmount",
                   FLOOR(SUM(p.amount) * 0.8) AS "settlementAmount"
            FROM "Purchase" p
            JOIN "Theme" t ON p."themeId" = t.id
            JOIN "User" cu ON t."creatorId" = cu.id
            WHERE p.status = 'COMPLETED'
            GROUP BY cu.id, cu.nickname, cu.name
            ORDER BY "settlementAmount" DESC
        `;

        return NextResponse.json({
            purchases,
            settlements: settlements.map((s) => ({
                ...s,
                totalSales: Number(s.totalSales),
                totalAmount: Number(s.totalAmount),
                settlementAmount: Number(s.settlementAmount),
            })),
        });
    } catch (e) {
        console.error("[admin/sales GET]", e);
        return NextResponse.json({ purchases: [], settlements: [] });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { purchaseId, action } = (await req.json()) as {
            purchaseId: string;
            action: "refund" | "complete";
        };

        if (action === "refund") {
            await prisma.$executeRaw`UPDATE "Purchase" SET status = 'REFUNDED'::"PurchaseStatus" WHERE id = ${purchaseId}`;
        } else if (action === "complete") {
            await prisma.$executeRaw`UPDATE "Purchase" SET status = 'COMPLETED'::"PurchaseStatus" WHERE id = ${purchaseId}`;
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/sales PATCH]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}

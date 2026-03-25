import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const creators = await prisma.$queryRaw<{
            id: string; name: string; nickname: string | null;
            email: string | null; isSuspended: boolean; createdAt: Date;
            themeCount: bigint; totalSales: bigint; totalRevenue: bigint;
        }[]>`
            SELECT u.id, u.name, u.nickname, u.email, u."isSuspended", u."createdAt",
                   COUNT(DISTINCT t.id) AS "themeCount",
                   COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'COMPLETED') AS "totalSales",
                   COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'COMPLETED'), 0) AS "totalRevenue"
            FROM "User" u
            LEFT JOIN "Theme" t ON t."creatorId" = u.id AND t.status = 'PUBLISHED'
            LEFT JOIN "Purchase" p ON p."themeId" = t.id
            WHERE u.role = 'CREATOR'
            GROUP BY u.id
            ORDER BY "totalRevenue" DESC
        `;
        return NextResponse.json({
            creators: creators.map(c => ({
                ...c,
                themeCount: Number(c.themeCount),
                totalSales: Number(c.totalSales),
                totalRevenue: Number(c.totalRevenue),
                createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
            })),
        });
    } catch (e) {
        console.error("[admin/creators GET]", e);
        return NextResponse.json({ creators: [] });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { userId, action } = await req.json() as {
            userId: string;
            action: "revoke" | "suspend" | "unsuspend";
        };

        if (action === "revoke") {
            await prisma.$executeRaw`
                UPDATE "User" SET role = 'USER'::"Role", "updatedAt" = NOW()
                WHERE id = ${userId} AND role = 'CREATOR'
            `;
        } else if (action === "suspend") {
            await prisma.$executeRaw`
                UPDATE "User" SET "isSuspended" = true, "updatedAt" = NOW()
                WHERE id = ${userId}
            `;
        } else if (action === "unsuspend") {
            await prisma.$executeRaw`
                UPDATE "User" SET "isSuspended" = false, "updatedAt" = NOW()
                WHERE id = ${userId}
            `;
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/creators PATCH]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}


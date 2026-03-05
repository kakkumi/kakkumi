import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ following: [] });
    }

    try {
        const rows = await prisma.$queryRaw<{
            id: string;
            nickname: string | null;
            name: string;
            avatarUrl: string | null;
            themeCount: number;
        }[]>`
            SELECT
                u.id,
                u.nickname,
                u.name,
                u."avatarUrl",
                COUNT(DISTINCT t.id)::int AS "themeCount",
                MIN(f."createdAt") AS "followedAt"
            FROM "Follow" f
            JOIN "User" u ON u.id = f."followingId"
            LEFT JOIN "Theme" t ON t."creatorId" = u.id AND t.status = 'PUBLISHED'
            WHERE f."followerId" = ${session.dbId}
              AND u."deletedAt" IS NULL
            GROUP BY u.id, u.nickname, u.name, u."avatarUrl"
            ORDER BY "followedAt" DESC
        `;

        return NextResponse.json({ following: rows });
    } catch (e) {
        console.error("[following GET error]", e);
        return NextResponse.json({ following: [], error: String(e) });
    }
}

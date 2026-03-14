import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ likes: [] });

    const rows = await prisma.$queryRaw<{
        themeId: string;
        themeTitle: string;
        price: number;
        thumbnailUrl: string | null;
        creatorNickname: string | null;
        creatorName: string;
        likedAt: Date;
    }[]>`
        SELECT
            tl."themeId",
            t.title AS "themeTitle",
            t.price,
            t."thumbnailUrl",
            u.nickname AS "creatorNickname",
            u.name AS "creatorName",
            tl."createdAt" AS "likedAt"
        FROM "ThemeLike" tl
        JOIN "Theme" t ON tl."themeId" = t.id
        JOIN "User" u ON t."creatorId" = u.id
        WHERE tl."userId" = ${session.dbId}
          AND t.status = 'PUBLISHED'
        ORDER BY tl."createdAt" DESC
    `;

    return NextResponse.json({
        likes: rows.map(r => ({ ...r, likedAt: r.likedAt.toISOString() })),
    });
}

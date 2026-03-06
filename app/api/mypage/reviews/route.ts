import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ reviews: [] });
    }

    try {
        const reviews = await prisma.$queryRaw<{
            id: string;
            themeId: string;
            themeTitle: string;
            thumbnailUrl: string | null;
            rating: number;
            content: string | null;
            images: string[];
            createdAt: Date;
            updatedAt: Date;
        }[]>`
            SELECT
                r.id,
                r."themeId",
                t.title AS "themeTitle",
                t."thumbnailUrl",
                r.rating,
                r.content,
                r.images,
                r."createdAt",
                r."updatedAt"
            FROM "Review" r
            JOIN "Theme" t ON t.id = r."themeId"
            WHERE r."userId" = ${session.dbId}
            ORDER BY r."createdAt" DESC
        `;
        return NextResponse.json({ reviews });
    } catch (e) {
        console.error("[mypage/reviews GET]", e);
        return NextResponse.json({ reviews: [], error: "서버 오류" }, { status: 500 });
    }
}

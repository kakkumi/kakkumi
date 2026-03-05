import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

// GET /api/themes/liked - 내가 좋아요한 테마 id 목록
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ likedIds: [] });
    }

    const likes = await prisma.$queryRaw<{ themeId: string }[]>`
        SELECT "themeId" FROM "ThemeLike" WHERE "userId" = ${session.dbId}
    `;

    return NextResponse.json({ likedIds: likes.map(l => l.themeId) });
}

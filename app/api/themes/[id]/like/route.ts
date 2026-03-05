import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

// POST /api/themes/:id/like - 좋아요 토글
export async function POST(_req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: themeId } = await props.params;
    const userId = session.dbId;

    const existing = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "ThemeLike" WHERE "userId" = ${userId} AND "themeId" = ${themeId} LIMIT 1
    `;

    if (existing.length > 0) {
        await prisma.$executeRaw`
            DELETE FROM "ThemeLike" WHERE "userId" = ${userId} AND "themeId" = ${themeId}
        `;
        const [{ count }] = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*)::int AS count FROM "ThemeLike" WHERE "themeId" = ${themeId}
        `;
        return NextResponse.json({ liked: false, count: Number(count) });
    } else {
        await prisma.$executeRaw`
            INSERT INTO "ThemeLike" (id, "userId", "themeId", "createdAt")
            VALUES (gen_random_uuid(), ${userId}, ${themeId}, NOW())
            ON CONFLICT ("userId", "themeId") DO NOTHING
        `;
        const [{ count }] = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*)::int AS count FROM "ThemeLike" WHERE "themeId" = ${themeId}
        `;
        return NextResponse.json({ liked: true, count: Number(count) });
    }
}

// GET /api/themes/:id/like - 좋아요 상태 조회
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const { id: themeId } = await props.params;

    const [{ count }] = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::int AS count FROM "ThemeLike" WHERE "themeId" = ${themeId}
    `;

    if (!session?.dbId) {
        return NextResponse.json({ liked: false, count: Number(count) });
    }

    const existing = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "ThemeLike" WHERE "userId" = ${session.dbId} AND "themeId" = ${themeId} LIMIT 1
    `;

    return NextResponse.json({ liked: existing.length > 0, count: Number(count) });
}

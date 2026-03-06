import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: creatorId } = await params;
    const session = await getServerSession();

    try {
        // 크리에이터 정보
        const creatorRows = await prisma.$queryRaw<{
            id: string;
            nickname: string | null;
            name: string;
            avatarUrl: string | null;
            image: string | null;
            role: string;
            createdAt: Date;
        }[]>`
            SELECT id, nickname, name, "avatarUrl", image, role::text, "createdAt"
            FROM "User"
            WHERE id = ${creatorId} AND "deletedAt" IS NULL AND role IN ('CREATOR', 'ADMIN')
            LIMIT 1
        `;

        if (creatorRows.length === 0) {
            return NextResponse.json({ error: "크리에이터를 찾을 수 없습니다." }, { status: 404 });
        }

        const creator = creatorRows[0];

        // 공개된 테마 목록
        const themes = await prisma.$queryRaw<{
            id: string;
            title: string;
            price: number;
            thumbnailUrl: string | null;
            tags: string[];
            salesCount: number;
            createdAt: Date;
        }[]>`
            SELECT t.id, t.title, t.price, t."thumbnailUrl", t.tags, t."createdAt",
                   COUNT(p.id)::int AS "salesCount"
            FROM "Theme" t
            LEFT JOIN "Purchase" p ON p."themeId" = t.id AND p.status = 'COMPLETED'
            WHERE t."creatorId" = ${creatorId} AND t.status = 'PUBLISHED'
            GROUP BY t.id
            ORDER BY t."createdAt" DESC
        `;

        // 팔로워 수
        const followerRows = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "Follow" WHERE "followingId" = ${creatorId}
        `;
        const followerCount = Number(followerRows[0]?.count ?? 0);

        // 내가 팔로우하고 있는지
        let isFollowing = false;
        if (session?.dbId && session.dbId !== creatorId) {
            const followRows = await prisma.$queryRaw<{ id: string }[]>`
                SELECT id FROM "Follow" WHERE "followerId" = ${session.dbId} AND "followingId" = ${creatorId} LIMIT 1
            `;
            isFollowing = followRows.length > 0;
        }

        return NextResponse.json({ creator, themes, followerCount, isFollowing });
    } catch (e) {
        console.error("[creator/[id] GET]", e);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}

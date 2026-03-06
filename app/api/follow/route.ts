import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { nowKST } from "@/lib/date";
import { notifyFollow } from "@/lib/notification";

// 팔로우 상태 확인
export async function GET(req: NextRequest) {
    const session = await getServerSession();
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");

    if (!creatorId) {
        return NextResponse.json({ error: "creatorId 필요" }, { status: 400 });
    }

    // 팔로워 수 조회
    const followerCountRows = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM "Follow" WHERE "followingId" = ${creatorId}
    `;
    const followerCount = Number(followerCountRows[0]?.count ?? 0);

    if (!session?.dbId) {
        return NextResponse.json({ isFollowing: false, followerCount });
    }

    const followRows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Follow" WHERE "followerId" = ${session.dbId} AND "followingId" = ${creatorId} LIMIT 1
    `;

    return NextResponse.json({
        isFollowing: followRows.length > 0,
        followerCount,
    });
}

// 팔로우 / 언팔로우 토글
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { creatorId } = (await req.json()) as { creatorId: string };
    if (!creatorId) {
        return NextResponse.json({ error: "creatorId 필요" }, { status: 400 });
    }

    if (session.dbId === creatorId) {
        return NextResponse.json({ error: "자기 자신을 팔로우할 수 없습니다." }, { status: 400 });
    }

    try {
        const existing = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "Follow" WHERE "followerId" = ${session.dbId} AND "followingId" = ${creatorId} LIMIT 1
        `;

        if (existing.length > 0) {
            // 언팔로우
            await prisma.$executeRaw`
                DELETE FROM "Follow" WHERE "followerId" = ${session.dbId} AND "followingId" = ${creatorId}
            `;
            return NextResponse.json({ isFollowing: false });
        } else {
            // 팔로우
            await prisma.$executeRaw`
                INSERT INTO "Follow" (id, "followerId", "followingId", "createdAt")
                VALUES (${crypto.randomUUID()}, ${session.dbId}, ${creatorId}, ${nowKST()})
                ON CONFLICT ("followerId", "followingId") DO NOTHING
            `;

            // 팔로우 알림 (설정 체크 포함)
            const followerRows = await prisma.$queryRaw<{ nickname: string | null; name: string }[]>`
                SELECT nickname, name FROM "User" WHERE id = ${session.dbId} LIMIT 1
            `;
            const followerName = followerRows[0]?.nickname ?? followerRows[0]?.name ?? "누군가";
            await notifyFollow(creatorId, followerName, session.dbId);

            return NextResponse.json({ isFollowing: true });
        }
    } catch (e) {
        console.error("[follow POST]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}

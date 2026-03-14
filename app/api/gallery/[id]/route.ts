import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 단일 게시글 조회
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession();
        const myId = session?.dbId ?? null;

        type PostDetail = {
            id: string; userId: string; themeName: string; description: string | null;
            images: string[]; storeLink: string | null; themeId: string | null; createdAt: Date;
            userNickname: string | null; userName: string; userAvatar: string | null; userImage: string | null;
            likeCount: bigint; commentCount: bigint;
        };
        const rows = await prisma.$queryRaw<PostDetail[]>`
            SELECT p.id, p."userId", p."themeName", p.description, p.images, p."storeLink", p."themeId", p."createdAt",
                   u.nickname AS "userNickname", u.name AS "userName", u."avatarUrl" AS "userAvatar", u.image AS "userImage",
                   COUNT(DISTINCT l.id) AS "likeCount",
                   COUNT(DISTINCT c.id) FILTER (WHERE c."isDeleted" = false) AS "commentCount"
            FROM "GalleryPost" p
            JOIN "User" u ON p."userId" = u.id
            LEFT JOIN "GalleryLike" l ON l."postId" = p.id
            LEFT JOIN "GalleryComment" c ON c."postId" = p.id
            WHERE p.id = ${id}
            GROUP BY p.id, u.nickname, u.name, u."avatarUrl", u.image
        `;
        if (rows.length === 0) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });

        const post = rows[0];

        const liked = myId ? (await prisma.$queryRaw<[{ exists: boolean }]>`
            SELECT EXISTS(SELECT 1 FROM "GalleryLike" WHERE "userId" = ${myId} AND "postId" = ${id}) AS exists
        `)[0].exists : false;

        const reactions = await prisma.$queryRaw<{ emoji: string; count: bigint; reacted: boolean }[]>`
            SELECT emoji, COUNT(*) AS count,
                   BOOL_OR("userId" = ${myId ?? ''}) AS reacted
            FROM "GalleryReaction" WHERE "postId" = ${id}
            GROUP BY emoji ORDER BY count DESC
        `;

        type CommentRow = {
            id: string; content: string; isDeleted: boolean; createdAt: Date; parentId: string | null;
            userId: string; userNickname: string | null; userName: string; userAvatar: string | null; userImage: string | null;
            reportCount: bigint; myReported: boolean;
        };
        const comments = await prisma.$queryRaw<CommentRow[]>`
            SELECT c.id, c.content, c."isDeleted", c."createdAt", c."parentId",
                   c."userId", u.nickname AS "userNickname", u.name AS "userName",
                   u."avatarUrl" AS "userAvatar", u.image AS "userImage",
                   COUNT(r.id) AS "reportCount",
                   BOOL_OR(r."reporterId" = ${myId ?? ''}) AS "myReported"
            FROM "GalleryComment" c
            JOIN "User" u ON c."userId" = u.id
            LEFT JOIN "GalleryCommentReport" r ON r."commentId" = c.id
            WHERE c."postId" = ${id}
            GROUP BY c.id, u.nickname, u.name, u."avatarUrl", u.image
            ORDER BY c."createdAt" ASC
        `;

        return NextResponse.json({
            post: {
                ...post,
                likeCount: Number(post.likeCount),
                commentCount: Number(post.commentCount),
                liked,
                reactions: reactions.map((r) => ({ emoji: r.emoji, count: Number(r.count), reacted: r.reacted })),
                createdAt: post.createdAt.toISOString(),
            },
            comments: comments.map((c) => ({
                ...c,
                reportCount: Number(c.reportCount),
                createdAt: c.createdAt.toISOString(),
            })),
        });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

// 게시글 수정
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    try {
        const { id } = await params;
        const rows = await prisma.$queryRaw<{ userId: string }[]>`SELECT "userId" FROM "GalleryPost" WHERE id = ${id} LIMIT 1`;
        if (rows.length === 0) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
        if (rows[0].userId !== session.dbId) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

        const { themeName, description } = await req.json() as { themeName?: string; description?: string };
        if (!themeName?.trim()) return NextResponse.json({ error: "테마 이름을 입력해주세요." }, { status: 400 });
        if (description && description.length > 200) return NextResponse.json({ error: "소개는 200자 이하여야 합니다." }, { status: 400 });

        await prisma.$executeRaw`
            UPDATE "GalleryPost"
            SET "themeName" = ${themeName.trim()}, description = ${description?.trim() || null}, "updatedAt" = NOW()
            WHERE id = ${id}
        `;
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

// 게시글 삭제
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    try {
        const { id } = await params;
        const rows = await prisma.$queryRaw<{ userId: string }[]>`SELECT "userId" FROM "GalleryPost" WHERE id = ${id} LIMIT 1`;
        if (rows.length === 0) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
        if (rows[0].userId !== session.dbId && session.role !== "ADMIN") {
            return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
        }
        await prisma.$executeRaw`DELETE FROM "GalleryPost" WHERE id = ${id}`;
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

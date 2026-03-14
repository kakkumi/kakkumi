import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 댓글 삭제
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> }
) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    try {
        const { id: postId, commentId } = await params;

        const commentRows = await prisma.$queryRaw<{ userId: string; postId: string }[]>`
            SELECT "userId", "postId" FROM "GalleryComment" WHERE id = ${commentId} LIMIT 1
        `;
        if (commentRows.length === 0) return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });

        const comment = commentRows[0];
        if (comment.postId !== postId) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

        // 본인 댓글 또는 게시글 작성자 또는 관리자
        const isOwner = comment.userId === session.dbId;
        const isAdmin = session.role === "ADMIN";
        let isPostOwner = false;
        if (!isOwner && !isAdmin) {
            const postRows = await prisma.$queryRaw<{ userId: string }[]>`
                SELECT "userId" FROM "GalleryPost" WHERE id = ${postId} LIMIT 1
            `;
            isPostOwner = postRows[0]?.userId === session.dbId;
        }

        if (!isOwner && !isAdmin && !isPostOwner) {
            return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
        }

        // soft delete
        await prisma.$executeRaw`UPDATE "GalleryComment" SET "isDeleted" = true WHERE id = ${commentId}`;
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

// 댓글 신고
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> }
) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    try {
        const { commentId } = await params;

        const commentRows = await prisma.$queryRaw<{ userId: string }[]>`
            SELECT "userId" FROM "GalleryComment" WHERE id = ${commentId} LIMIT 1
        `;
        if (commentRows.length === 0) return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
        if (commentRows[0].userId === session.dbId) {
            return NextResponse.json({ error: "본인 댓글은 신고할 수 없습니다." }, { status: 400 });
        }

        const existing = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "GalleryCommentReport" WHERE "commentId" = ${commentId} AND "reporterId" = ${session.dbId} LIMIT 1
        `;
        if (existing.length > 0) return NextResponse.json({ error: "이미 신고한 댓글입니다." }, { status: 409 });

        await prisma.$executeRaw`
            INSERT INTO "GalleryCommentReport" (id, "commentId", "reporterId", "isHandled", "createdAt")
            VALUES (${crypto.randomUUID()}, ${commentId}, ${session.dbId}, false, NOW())
        `;
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

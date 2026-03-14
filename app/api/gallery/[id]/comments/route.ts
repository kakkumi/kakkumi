import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 댓글 / 대댓글 작성
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    try {
        const { id: postId } = await params;
        const { content, parentId } = await req.json() as { content: string; parentId?: string };
        if (!content?.trim()) return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });
        if (content.trim().length > 200) return NextResponse.json({ error: "댓글은 200자 이하여야 합니다." }, { status: 400 });

        const postRows = await prisma.$queryRaw<{ id: string }[]>`SELECT id FROM "GalleryPost" WHERE id = ${postId} LIMIT 1`;
        if (postRows.length === 0) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });

        // parentId 유효성 검증
        if (parentId) {
            const parentRows = await prisma.$queryRaw<{ id: string; parentId: string | null }[]>`
                SELECT id, "parentId" FROM "GalleryComment" WHERE id = ${parentId} AND "postId" = ${postId} LIMIT 1
            `;
            if (parentRows.length === 0) return NextResponse.json({ error: "부모 댓글을 찾을 수 없습니다." }, { status: 404 });
            // 대댓글의 대댓글 방지 (1단계만 허용)
            if (parentRows[0].parentId) return NextResponse.json({ error: "대댓글에는 답글을 달 수 없습니다." }, { status: 400 });
        }

        const commentId = crypto.randomUUID();
        await prisma.$executeRaw`
            INSERT INTO "GalleryComment" (id, "postId", "userId", "parentId", content, "isDeleted", "createdAt")
            VALUES (${commentId}, ${postId}, ${session.dbId}, ${parentId ?? null}, ${content.trim()}, false, NOW())
        `;

        const rows = await prisma.$queryRaw<{
            id: string; content: string; isDeleted: boolean; createdAt: Date; parentId: string | null;
            userId: string; userNickname: string | null; userName: string; userAvatar: string | null; userImage: string | null;
        }[]>`
            SELECT c.id, c.content, c."isDeleted", c."createdAt", c."parentId",
                   c."userId", u.nickname AS "userNickname", u.name AS "userName",
                   u."avatarUrl" AS "userAvatar", u.image AS "userImage"
            FROM "GalleryComment" c JOIN "User" u ON c."userId" = u.id
            WHERE c.id = ${commentId}
        `;

        return NextResponse.json({
            comment: { ...rows[0], createdAt: rows[0].createdAt.toISOString(), reportCount: 0, myReported: false },
        }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

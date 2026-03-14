import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// 댓글 신고 목록
export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        type ReportRow = {
            id: string; isHandled: boolean; createdAt: Date;
            commentId: string; commentContent: string; commentIsDeleted: boolean;
            postId: string; postThemeName: string;
            reporterNickname: string | null; reporterName: string;
        };
        const reports = await prisma.$queryRaw<ReportRow[]>`
            SELECT r.id, r."isHandled", r."createdAt",
                   c.id AS "commentId", c.content AS "commentContent", c."isDeleted" AS "commentIsDeleted",
                   p.id AS "postId", p."themeName" AS "postThemeName",
                   u.nickname AS "reporterNickname", u.name AS "reporterName"
            FROM "GalleryCommentReport" r
            JOIN "GalleryComment" c ON r."commentId" = c.id
            JOIN "GalleryPost" p ON c."postId" = p.id
            JOIN "User" u ON r."reporterId" = u.id
            ORDER BY r."isHandled" ASC, r."createdAt" DESC
        `;
        return NextResponse.json({
            reports: reports.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
        });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

// 신고 처리 / 댓글 삭제
export async function PATCH(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { reportId, action, commentId } = await req.json() as {
            reportId: string;
            action: "handle" | "delete_comment";
            commentId?: string;
        };

        const ALLOWED = ["handle", "delete_comment"] as const;
        if (!reportId || !ALLOWED.includes(action)) {
            return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
        }

        if (action === "handle") {
            await prisma.$executeRaw`UPDATE "GalleryCommentReport" SET "isHandled" = true WHERE id = ${reportId}`;
        } else if (action === "delete_comment" && commentId) {
            await prisma.$executeRaw`UPDATE "GalleryComment" SET "isDeleted" = true WHERE id = ${commentId}`;
            await prisma.$executeRaw`UPDATE "GalleryCommentReport" SET "isHandled" = true WHERE id = ${reportId}`;
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const posts = await prisma.$queryRaw<{
            id: string; themeName: string; description: string | null;
            images: string[]; storeLink: string | null; createdAt: Date;
            userNickname: string | null; userName: string;
            likeCount: bigint; commentCount: bigint;
        }[]>`
            SELECT gp.id, gp."themeName", gp.description, gp.images, gp."storeLink", gp."createdAt",
                   u.nickname AS "userNickname", u.name AS "userName",
                   COUNT(DISTINCT gl.id) AS "likeCount",
                   COUNT(DISTINCT gc.id) FILTER (WHERE gc."isDeleted" = false) AS "commentCount"
            FROM "GalleryPost" gp
            JOIN "User" u ON gp."userId" = u.id
            LEFT JOIN "GalleryLike" gl ON gl."postId" = gp.id
            LEFT JOIN "GalleryComment" gc ON gc."postId" = gp.id
            GROUP BY gp.id, u.nickname, u.name
            ORDER BY gp."createdAt" DESC
        `;
        return NextResponse.json({
            posts: posts.map(p => ({
                ...p,
                likeCount: Number(p.likeCount),
                commentCount: Number(p.commentCount),
                createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
            })),
        });
    } catch (e) {
        console.error("[admin/gallery-posts GET]", e);
        return NextResponse.json({ posts: [] });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { postId, action } = await req.json() as { postId: string; action: "delete" };
        if (action === "delete") {
            await prisma.$executeRaw`DELETE FROM "GalleryPost" WHERE id = ${postId}`;
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/gallery-posts PATCH]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}


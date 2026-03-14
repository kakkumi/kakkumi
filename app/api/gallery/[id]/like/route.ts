import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 좋아요 토글
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    try {
        const { id: postId } = await params;
        const existing = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "GalleryLike" WHERE "userId" = ${session.dbId} AND "postId" = ${postId} LIMIT 1
        `;
        if (existing.length > 0) {
            await prisma.$executeRaw`DELETE FROM "GalleryLike" WHERE "userId" = ${session.dbId} AND "postId" = ${postId}`;
            return NextResponse.json({ liked: false });
        } else {
            await prisma.$executeRaw`
                INSERT INTO "GalleryLike" (id, "userId", "postId", "createdAt") VALUES (${crypto.randomUUID()}, ${session.dbId}, ${postId}, NOW())
            `;
            return NextResponse.json({ liked: true });
        }
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

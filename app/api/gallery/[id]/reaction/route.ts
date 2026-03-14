import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 이모지 반응 토글
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    try {
        const { id: postId } = await params;
        const { emoji } = await req.json() as { emoji: string };
        if (!emoji) return NextResponse.json({ error: "이모지가 필요합니다." }, { status: 400 });

        const existing = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "GalleryReaction" WHERE "userId" = ${session.dbId} AND "postId" = ${postId} AND emoji = ${emoji} LIMIT 1
        `;
        if (existing.length > 0) {
            await prisma.$executeRaw`DELETE FROM "GalleryReaction" WHERE "userId" = ${session.dbId} AND "postId" = ${postId} AND emoji = ${emoji}`;
            return NextResponse.json({ reacted: false });
        } else {
            await prisma.$executeRaw`
                INSERT INTO "GalleryReaction" (id, "userId", "postId", emoji, "createdAt") VALUES (${crypto.randomUUID()}, ${session.dbId}, ${postId}, ${emoji}, NOW())
            `;
            return NextResponse.json({ reacted: true });
        }
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

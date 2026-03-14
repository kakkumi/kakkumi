import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 내가 스토어에 등록한 테마 목록 (갤러리 링크 선택용)
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    try {
        const themes = await prisma.$queryRaw<{ id: string; title: string; thumbnailUrl: string | null }[]>`
            SELECT id, title, "thumbnailUrl"
            FROM "Theme"
            WHERE "creatorId" = ${session.dbId}
            ORDER BY "createdAt" DESC
        `;
        return NextResponse.json({ themes });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

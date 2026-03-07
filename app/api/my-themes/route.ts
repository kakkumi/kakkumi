import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/my-themes
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    // 30일 지난 휴지통 항목 자동 삭제
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await prisma.myTheme.deleteMany({
        where: {
            userId: session.dbId,
            trashed: true,
            trashedAt: { lt: thirtyDaysAgo },
        },
    });

    const themes = await prisma.myTheme.findMany({
        where: { userId: session.dbId },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ themes });
}

// POST /api/my-themes  { name, os, previewImageUrl? }
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { name, os, previewImageUrl } = await req.json() as {
        name: string;
        os: string;
        previewImageUrl?: string | null;
    };

    if (!name?.trim()) return NextResponse.json({ error: "테마 이름을 입력해주세요." }, { status: 400 });

    const theme = await prisma.myTheme.create({
        data: {
            userId: session.dbId,
            name: name.trim(),
            os,
            previewImageUrl: previewImageUrl ?? null,
        },
    });

    return NextResponse.json({ theme });
}

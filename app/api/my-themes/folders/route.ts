import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/my-themes/folders
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const folders = await prisma.myThemeFolder.findMany({
        where: { userId: session.dbId },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ folders });
}

// POST /api/my-themes/folders  { name }
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { name } = await req.json() as { name: string };
    if (!name?.trim()) return NextResponse.json({ error: "폴더 이름을 입력해주세요." }, { status: 400 });

    const folder = await prisma.myThemeFolder.create({
        data: { userId: session.dbId, name: name.trim() },
    });

    return NextResponse.json({ folder });
}

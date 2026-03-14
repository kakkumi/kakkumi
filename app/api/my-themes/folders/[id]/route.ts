import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// PATCH /api/my-themes/folders/[id] — 이름 변경
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { id } = await params;
    const { name } = (await req.json()) as { name?: string };

    if (!name?.trim()) return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });

    const folder = await prisma.myThemeFolder.findUnique({ where: { id } });
    if (!folder || folder.userId !== session.dbId) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const updated = await prisma.myThemeFolder.update({
        where: { id },
        data: { name: name.trim() },
    });

    return NextResponse.json({ folder: updated });
}

// DELETE /api/my-themes/folders/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { id } = await params;

    const folder = await prisma.myThemeFolder.findUnique({ where: { id } });
    if (!folder || folder.userId !== session.dbId) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    await prisma.myThemeFolder.delete({ where: { id } });

    return NextResponse.json({ ok: true });
}

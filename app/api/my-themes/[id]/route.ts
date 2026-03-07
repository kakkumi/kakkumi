import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// PATCH /api/my-themes/[id]  { trashed?, folderId?, name? }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { id } = await params;
    const body = await req.json() as {
        trashed?: boolean;
        folderId?: string | null;
        name?: string;
        duplicate?: boolean;
    };

    const theme = await prisma.myTheme.findUnique({ where: { id } });
    if (!theme || theme.userId !== session.dbId) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 사본 만들기
    if (body.duplicate) {
        const copy = await prisma.myTheme.create({
            data: {
                userId: session.dbId,
                name: `${theme.name} 사본`,
                os: theme.os,
                previewImageUrl: theme.previewImageUrl,
                folderId: theme.folderId,
            },
        });
        return NextResponse.json({ theme: copy });
    }

    const updated = await prisma.myTheme.update({
        where: { id },
        data: {
            ...(body.name !== undefined && { name: body.name }),
            ...(body.folderId !== undefined && { folderId: body.folderId }),
            ...(body.trashed !== undefined && {
                trashed: body.trashed,
                trashedAt: body.trashed ? new Date() : null,
            }),
        },
    });

    return NextResponse.json({ theme: updated });
}

// DELETE /api/my-themes/[id]  (완전 삭제)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { id } = await params;

    const theme = await prisma.myTheme.findUnique({ where: { id } });
    if (!theme || theme.userId !== session.dbId) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    await prisma.myTheme.delete({ where: { id } });

    return NextResponse.json({ ok: true });
}

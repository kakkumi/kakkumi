import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; replyId: string }> };

// 관리자 답변 수정
export async function PUT(req: NextRequest, { params }: Params) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.dbId }, select: { role: true } });
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "관리자만 수정할 수 있습니다." }, { status: 403 });

    const { replyId } = await params;
    const { content } = (await req.json()) as { content: string };

    if (!content?.trim()) {
        return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<{ id: string; isAdmin: boolean }[]>`
        SELECT id, "isAdmin" FROM "InquiryReply" WHERE id = ${replyId}
    `;
    if (!rows[0]) return NextResponse.json({ error: "답변을 찾을 수 없습니다." }, { status: 404 });
    if (!rows[0].isAdmin) return NextResponse.json({ error: "관리자 답변만 수정할 수 있습니다." }, { status: 403 });

    await prisma.$executeRaw`
        UPDATE "InquiryReply" SET content = ${content.trim()} WHERE id = ${replyId}
    `;

    return NextResponse.json({ success: true });
}

// 관리자 답변 삭제
export async function DELETE(req: NextRequest, { params }: Params) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.dbId }, select: { role: true } });
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "관리자만 삭제할 수 있습니다." }, { status: 403 });

    const { replyId } = await params;

    const rows = await prisma.$queryRaw<{ id: string; isAdmin: boolean }[]>`
        SELECT id, "isAdmin" FROM "InquiryReply" WHERE id = ${replyId}
    `;
    if (!rows[0]) return NextResponse.json({ error: "답변을 찾을 수 없습니다." }, { status: 404 });
    if (!rows[0].isAdmin) return NextResponse.json({ error: "관리자 답변만 삭제할 수 있습니다." }, { status: 403 });

    await prisma.$executeRaw`
        DELETE FROM "InquiryReply" WHERE id = ${replyId}
    `;

    return NextResponse.json({ success: true });
}

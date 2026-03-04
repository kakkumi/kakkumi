import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 답글 작성
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { id } = await params;
    const { content } = (await req.json()) as { content: string };

    if (!content?.trim()) {
        return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
    }

    // 본인 문의 또는 관리자만 답글 가능
    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.dbId }, select: { role: true } });
    const isAdmin = user?.role === "ADMIN";

    if (inquiry.userId !== session.dbId && !isAdmin) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const reply = await prisma.inquiryReply.create({
        data: {
            inquiryId: id,
            authorId: session.dbId,
            content: content.trim(),
            isAdmin,
        },
        include: { author: { select: { name: true, image: true, role: true } } },
    });

    // 관리자 답글이면 문의 상태를 ANSWERED로 변경
    if (isAdmin) {
        await prisma.inquiry.update({ where: { id }, data: { status: "ANSWERED" } });
    }

    return NextResponse.json({ reply });
}

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

    const [inquiry] = await prisma.$queryRaw<{ id: string; userId: string }[]>`
        SELECT id, "userId" FROM "Inquiry" WHERE id = ${id}
    `;
    if (!inquiry) return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.dbId }, select: { role: true, name: true, nickname: true, image: true } });
    const isAdmin = user?.role === "ADMIN";

    if (inquiry.userId !== session.dbId && !isAdmin) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const replyId = crypto.randomUUID();
    const now = new Date();

    await prisma.$executeRaw`
        INSERT INTO "InquiryReply" (id, "inquiryId", "authorId", content, "isAdmin", "createdAt")
        VALUES (${replyId}, ${id}, ${session.dbId}, ${content.trim()}, ${isAdmin}, ${now})
    `;

    if (isAdmin) {
        await prisma.$executeRaw`
            UPDATE "Inquiry" SET status = 'ANSWERED', "updatedAt" = ${now} WHERE id = ${id}
        `;
    }

    const reply = {
        id: replyId,
        inquiryId: id,
        content: content.trim(),
        isAdmin,
        createdAt: now,
        author: { name: user?.nickname ?? user?.name ?? "", image: user?.image ?? null, role: user?.role ?? "USER" },
    };

    return NextResponse.json({ reply });
}

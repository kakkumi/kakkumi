import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 내 문의 목록 조회
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const inquiries = await prisma.inquiry.findMany({
        where: { userId: session.dbId },
        include: {
            replies: {
                include: { author: { select: { name: true, image: true, role: true } } },
                orderBy: { createdAt: "asc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ inquiries });
}

// 문의 작성
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { title, content, category } = (await req.json()) as { title: string; content: string; category: string };

    if (!title?.trim() || !content?.trim()) {
        return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.create({
        data: {
            userId: session.dbId,
            title: title.trim(),
            content: content.trim(),
            category: category ?? "기타",
        },
        include: { replies: true },
    });

    return NextResponse.json({ inquiry });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 내 문의 목록 조회
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const inquiries = await prisma.$queryRaw<
        {
            id: string; userId: string; category: string; title: string;
            content: string; status: string; createdAt: Date; updatedAt: Date;
        }[]
    >`
        SELECT * FROM "Inquiry"
        WHERE "userId" = ${session.dbId}
        ORDER BY "createdAt" DESC
    `;

    const replies = inquiries.length > 0
        ? await prisma.$queryRaw<
            {
                id: string; inquiryId: string; authorId: string; content: string;
                isAdmin: boolean; createdAt: Date;
                authorName: string; authorNickname: string | null; authorImage: string | null; authorRole: string;
            }[]
        >`
            SELECT r.*, u.name AS "authorName", u.nickname AS "authorNickname", u.image AS "authorImage", u.role AS "authorRole"
            FROM "InquiryReply" r
            JOIN "User" u ON u.id = r."authorId"
            WHERE r."inquiryId" = ANY(${inquiries.map((i) => i.id)}::text[])
            ORDER BY r."createdAt" ASC
        `
        : [];

    const result = inquiries.map((inq) => ({
        ...inq,
        replies: replies
            .filter((r) => r.inquiryId === inq.id)
            .map((r) => ({
                id: r.id,
                inquiryId: r.inquiryId,
                content: r.content,
                isAdmin: r.isAdmin,
                createdAt: r.createdAt,
                author: { name: r.authorNickname ?? r.authorName, image: r.authorImage, role: r.authorRole },
            })),
    }));

    return NextResponse.json({ inquiries: result });
}

// 문의 작성
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { title, content, category } = (await req.json()) as { title: string; content: string; category: string };

    if (!title?.trim() || !content?.trim()) {
        return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const cat = category ?? "기타";

    try {
        await prisma.$executeRaw`
            INSERT INTO "Inquiry" (id, "userId", category, title, content, status, "createdAt", "updatedAt")
            VALUES (${id}, ${session.dbId}, ${cat}, ${title.trim()}, ${content.trim()}, 'OPEN'::"InquiryStatus", ${now}, ${now})
        `;
        return NextResponse.json({ inquiry: { id, userId: session.dbId, category: cat, title, content, status: "OPEN", createdAt: now, updatedAt: now, replies: [] } });
    } catch (e) {
        console.error("[inquiry POST]", e);
        return NextResponse.json({ error: "문의 접수에 실패했습니다." }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// 전체 문의 목록
export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const inquiries = await prisma.$queryRaw<{
            id: string; title: string; content: string; category: string;
            status: string; createdAt: Date;
            userNickname: string | null; userName: string;
            replyCount: bigint;
        }[]>`
            SELECT i.id, i.title, i.content, i.category, i.status, i."createdAt",
                   u.nickname AS "userNickname", u.name AS "userName",
                   COUNT(r.id) AS "replyCount"
            FROM "Inquiry" i
            JOIN "User" u ON i."userId" = u.id
            LEFT JOIN "InquiryReply" r ON r."inquiryId" = i.id
            GROUP BY i.id, i.title, i.content, i.category, i.status, i."createdAt", u.nickname, u.name
            ORDER BY i."createdAt" DESC
        `;
        return NextResponse.json({
            inquiries: inquiries.map((i) => ({ ...i, replyCount: Number(i.replyCount) })),
        });
    } catch (e) {
        console.error("[admin/inquiries GET]", e);
        return NextResponse.json({ inquiries: [] });
    }
}

// 관리자 답변 작성
export async function POST(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { inquiryId, content } = (await req.json()) as { inquiryId: string; content: string };

        await prisma.$executeRaw`
            INSERT INTO "InquiryReply" (id, "inquiryId", "authorId", content, "isAdmin", "createdAt")
            VALUES (gen_random_uuid(), ${inquiryId}, ${session.dbId}, ${content}, true, NOW())
        `;
        await prisma.$executeRaw`
            UPDATE "Inquiry" SET status = 'ANSWERED', "updatedAt" = NOW() WHERE id = ${inquiryId}
        `;
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/inquiries POST]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}

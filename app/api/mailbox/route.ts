import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const { type, title, content } = await req.json() as {
            type: string;
            title: string;
            content: string;
        };

        if (!type || !title?.trim() || !content?.trim()) {
            return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
        }
        if (!["SUGGESTION", "BUG_REPORT"].includes(type)) {
            return NextResponse.json({ error: "올바르지 않은 유형입니다." }, { status: 400 });
        }
        if (title.trim().length > 50) {
            return NextResponse.json({ error: "제목은 최대 50자까지 입력할 수 있습니다." }, { status: 400 });
        }
        if (content.trim().length > 500) {
            return NextResponse.json({ error: "내용은 최대 500자까지 입력할 수 있습니다." }, { status: 400 });
        }

        const id = crypto.randomUUID();
        await prisma.$executeRaw`
            INSERT INTO "Mailbox" (id, "userId", type, title, content, status, "createdAt", "updatedAt")
            VALUES (
                ${id},
                ${session.dbId},
                ${type}::"MailboxType",
                ${title.trim()},
                ${content.trim()},
                'PENDING'::"MailboxStatus",
                NOW(),
                NOW()
            )
        `;

        return NextResponse.json({ mailbox: { id } }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

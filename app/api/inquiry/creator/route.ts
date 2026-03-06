import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { title, content, creatorId, themeId, themeName } = (await req.json()) as {
        title: string;
        content: string;
        creatorId: string;
        themeId: string;
        themeName: string;
    };

    if (!title?.trim() || !content?.trim()) {
        return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
    }

    if (session.dbId === creatorId) {
        return NextResponse.json({ error: "본인 테마에는 문의할 수 없습니다." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const category = `크리에이터 문의 · ${themeName}`;

    try {
        await prisma.$executeRaw`
            INSERT INTO "Inquiry" (id, "userId", category, title, content, status, "createdAt", "updatedAt")
            VALUES (${id}, ${session.dbId}, ${category}, ${title.trim()}, ${content.trim()}, 'OPEN'::"InquiryStatus", ${now}, ${now})
        `;


        try {
            const notifId = crypto.randomUUID();
            const msg = `${session.nickname ?? session.name ?? "누군가"}님이 테마 [${themeName}]에 문의를 남겼어요.`;
            await prisma.$executeRaw`
                INSERT INTO "Notification" (id, "userId", type, message, "isRead", "createdAt")
                VALUES (${notifId}, ${creatorId}, 'INQUIRY'::"NotificationType", ${msg}, false, ${now})
            `;
        } catch {
            // 알림 실패는 무시
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[creator inquiry POST]", e);
        return NextResponse.json({ error: "문의 접수에 실패했습니다." }, { status: 500 });
    }
}

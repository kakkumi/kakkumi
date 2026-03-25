import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { title, body, linkUrl, target, userId } = await req.json() as {
            title: string;
            body: string;
            linkUrl?: string;
            target: "all" | "creators" | "user";
            userId?: string;
        };

        if (!title?.trim() || !body?.trim()) {
            return NextResponse.json({ error: "제목과 내용을 입력하세요." }, { status: 400 });
        }

        if (target === "user") {
            if (!userId) return NextResponse.json({ error: "userId 필요" }, { status: 400 });
            const rows = await prisma.$queryRaw<{ id: string }[]>`
                SELECT id FROM "User" WHERE id = ${userId} OR nickname = ${userId} LIMIT 1
            `;
            if (rows.length === 0) return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
            await prisma.$executeRaw`
                INSERT INTO "Notification" (id, "userId", type, title, body, "linkUrl", "isRead", "createdAt")
                VALUES (gen_random_uuid(), ${rows[0].id}, 'SYSTEM'::"NotificationType", ${title}, ${body}, ${linkUrl ?? null}, false, NOW())
            `;
        } else if (target === "creators") {
            await prisma.$executeRaw`
                INSERT INTO "Notification" (id, "userId", type, title, body, "linkUrl", "isRead", "createdAt")
                SELECT gen_random_uuid(), id, 'SYSTEM'::"NotificationType", ${title}, ${body}, ${linkUrl ?? null}, false, NOW()
                FROM "User"
                WHERE role = 'CREATOR' AND "deletedAt" IS NULL AND "isSuspended" = false
            `;
        } else {
            // all
            await prisma.$executeRaw`
                INSERT INTO "Notification" (id, "userId", type, title, body, "linkUrl", "isRead", "createdAt")
                SELECT gen_random_uuid(), id, 'SYSTEM'::"NotificationType", ${title}, ${body}, ${linkUrl ?? null}, false, NOW()
                FROM "User"
                WHERE "deletedAt" IS NULL AND "isSuspended" = false
            `;
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/broadcast POST]", e);
        return NextResponse.json({ error: "발송 실패" }, { status: 500 });
    }
}


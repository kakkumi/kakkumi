import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 알림 목록 조회
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    try {
        const notifications = await prisma.$queryRaw<{
            id: string;
            type: string;
            title: string;
            body: string;
            linkUrl: string | null;
            isRead: boolean;
            createdAt: Date;
        }[]>`
            SELECT id, type, title, body, "linkUrl", "isRead", "createdAt"
            FROM "Notification"
            WHERE "userId" = ${session.dbId}
            ORDER BY "createdAt" DESC
            LIMIT 30
        `;

        const unreadCount = notifications.filter(n => !n.isRead).length;

        return NextResponse.json({ notifications, unreadCount });
    } catch (e) {
        console.error("[notifications GET]", e);
        return NextResponse.json({ notifications: [], unreadCount: 0 });
    }
}

// 알림 읽음 처리
export async function PATCH(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인 필요" }, { status: 401 });
    }

    try {
        const body = await req.json() as { id?: string; all?: boolean };

        if (body.all) {
            await prisma.$executeRaw`
                UPDATE "Notification" SET "isRead" = true
                WHERE "userId" = ${session.dbId} AND "isRead" = false
            `;
        } else if (body.id) {
            await prisma.$executeRaw`
                UPDATE "Notification" SET "isRead" = true
                WHERE id = ${body.id} AND "userId" = ${session.dbId}
            `;
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[notifications PATCH]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}

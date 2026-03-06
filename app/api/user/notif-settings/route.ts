import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const DEFAULT_NOTIF_SETTINGS = {
    purchaseComplete: true,
    newReview: true,
    inquiryReply: true,
    newTheme: false,
    promotionEvent: false,
    serviceBroadcast: true,
    followAlert: true,
    creditExpiry: true,
    priceDropAlert: false,
};

export type NotifSettings = typeof DEFAULT_NOTIF_SETTINGS;

// GET - 알림 설정 불러오기
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ settings: DEFAULT_NOTIF_SETTINGS });
    }

    try {
        const rows = await prisma.$queryRaw<{ notifSettings: unknown }[]>`
            SELECT "notifSettings" FROM "User" WHERE id = ${session.dbId} LIMIT 1
        `;
        const raw = rows[0]?.notifSettings;
        const settings = raw && typeof raw === "object"
            ? { ...DEFAULT_NOTIF_SETTINGS, ...(raw as Partial<NotifSettings>) }
            : DEFAULT_NOTIF_SETTINGS;

        return NextResponse.json({ settings });
    } catch (e) {
        console.error("[user/notif-settings GET]", e);
        return NextResponse.json({ settings: DEFAULT_NOTIF_SETTINGS });
    }
}

// PATCH - 알림 설정 저장
export async function PATCH(req: Request) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const body = await req.json() as Partial<NotifSettings>;
        const merged = { ...DEFAULT_NOTIF_SETTINGS, ...body };

        await prisma.$executeRaw`
            UPDATE "User"
            SET "notifSettings" = ${JSON.stringify(merged)}::jsonb, "updatedAt" = NOW()
            WHERE id = ${session.dbId}
        `;

        return NextResponse.json({ ok: true, settings: merged });
    } catch (e) {
        console.error("[user/notif-settings PATCH]", e);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}

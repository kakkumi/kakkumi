import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 신고 접수
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { themeId, reason, detail } = (await req.json()) as {
        themeId: string;
        reason: string;
        detail?: string;
    };

    if (!themeId || !reason) {
        return NextResponse.json({ error: "테마 ID와 신고 사유는 필수입니다." }, { status: 400 });
    }

    // 테마 존재 확인
    const themes = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Theme" WHERE id = ${themeId} LIMIT 1
    `;
    if (!themes || themes.length === 0) {
        return NextResponse.json({ error: "테마를 찾을 수 없습니다." }, { status: 404 });
    }

    // 중복 신고 확인
    const existing = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Report"
        WHERE "reporterId" = ${session.dbId}
          AND "themeId" = ${themeId}
          AND status = 'PENDING'
        LIMIT 1
    `.catch(() => []);

    if (existing && existing.length > 0) {
        return NextResponse.json({ error: "이미 신고가 접수된 테마입니다." }, { status: 409 });
    }

    const reportId = crypto.randomUUID();
    const now = new Date();

    await prisma.$executeRaw`
        INSERT INTO "Report" (id, "reporterId", "themeId", reason, detail, status, "createdAt")
        VALUES (${reportId}, ${session.dbId}, ${themeId}, ${reason}, ${detail ?? null}, 'PENDING', ${now})
    `;

    return NextResponse.json({ ok: true, reportId });
}

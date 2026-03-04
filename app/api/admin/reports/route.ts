import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// 전체 신고 목록
export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const reports = await prisma.$queryRaw<{
            id: string; reason: string; detail: string | null; status: string; createdAt: Date;
            reporterNickname: string | null; reporterName: string;
            themeId: string; themeTitle: string; themeStatus: string;
        }[]>`
            SELECT r.id, r.reason, r.detail, r.status, r."createdAt",
                   u.nickname AS "reporterNickname", u.name AS "reporterName",
                   t.id AS "themeId", t.title AS "themeTitle", t.status AS "themeStatus"
            FROM "Report" r
            JOIN "User" u ON r."reporterId" = u.id
            JOIN "Theme" t ON r."themeId" = t.id
            ORDER BY r."createdAt" DESC
        `;
        return NextResponse.json({ reports });
    } catch (e) {
        console.error("[admin/reports GET]", e);
        return NextResponse.json({ reports: [] });
    }
}

// 신고 처리 (상태 변경 + 테마 숨김)
export async function PATCH(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { reportId, action, themeId } = (await req.json()) as {
            reportId: string;
            action: "resolve" | "dismiss" | "hide_theme";
            themeId?: string;
        };

        if (action === "resolve") {
            await prisma.$executeRaw`UPDATE "Report" SET status = 'RESOLVED' WHERE id = ${reportId}`;
        } else if (action === "dismiss") {
            await prisma.$executeRaw`UPDATE "Report" SET status = 'DISMISSED' WHERE id = ${reportId}`;
        } else if (action === "hide_theme" && themeId) {
            await prisma.$executeRaw`UPDATE "Theme" SET status = 'HIDDEN', "updatedAt" = NOW() WHERE id = ${themeId}`;
            await prisma.$executeRaw`UPDATE "Report" SET status = 'RESOLVED' WHERE id = ${reportId}`;
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/reports PATCH]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}

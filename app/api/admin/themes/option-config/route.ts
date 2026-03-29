import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// GET /api/admin/themes/option-config?optionId=xxx&pending=1
// 관리자 전용: 옵션의 configJson + imageData 반환 (미리보기용)
export async function GET(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const optionId = searchParams.get("optionId");
    const usePending = searchParams.get("pending") === "1";

    if (!optionId) {
        return NextResponse.json({ error: "optionId가 필요합니다." }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<{
        configJson: unknown;
        pendingConfigJson: unknown;
        imageData: unknown;
        pendingImageData: unknown;
        os: string;
        name: string;
        themeTitle: string;
        myThemeName: string | null;
    }[]>`
        SELECT
            o."configJson",
            o."pendingConfigJson",
            o."imageData",
            o."pendingImageData",
            o.os,
            o.name,
            t.title AS "themeTitle",
            mt.name AS "myThemeName"
        FROM "ThemeOption" o
        JOIN "Theme" t ON t.id = o."themeId"
        LEFT JOIN "MyTheme" mt ON mt.id = COALESCE(o."pendingMyThemeId", o."myThemeId")
        WHERE o.id = ${optionId}
        LIMIT 1
    `;

    if (rows.length === 0) {
        return NextResponse.json({ error: "옵션을 찾을 수 없습니다." }, { status: 404 });
    }

    const row = rows[0];
    const configJson = usePending
        ? (row.pendingConfigJson ?? row.configJson) ?? {}
        : row.configJson ?? {};
    const imageData = usePending
        ? (row.pendingImageData ?? row.imageData) ?? {}
        : row.imageData ?? {};

    return NextResponse.json({
        configJson,
        imageData,
        os: row.os,
        optionName: row.name,
        themeTitle: row.themeTitle,
        myThemeName: row.myThemeName,
    });
}


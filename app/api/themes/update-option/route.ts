import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { nowKST } from "@/lib/date";

// 크리에이터가 테마 옵션 업데이트 심사 요청
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const optionId = (formData.get("optionId") as string | null) ?? "";
        const myThemeId = (formData.get("myThemeId") as string | null) ?? null;
        const file = formData.get("file") as File | null;

        if (!optionId) return NextResponse.json({ error: "optionId가 필요합니다." }, { status: 400 });

        // 옵션 확인 + 본인 테마인지 검증
        const rows = await prisma.$queryRaw<{
            id: string; themeId: string; os: string; status: string; creatorId: string;
        }[]>`
            SELECT o.id, o."themeId", o.os, o.status, t."creatorId"
            FROM "ThemeOption" o
            JOIN "Theme" t ON o."themeId" = t.id
            WHERE o.id = ${optionId} LIMIT 1
        `;
        if (rows.length === 0) {
            return NextResponse.json({ error: "옵션을 찾을 수 없습니다." }, { status: 404 });
        }
        const opt = rows[0];
        if (opt.creatorId !== session.dbId && session.role !== "ADMIN") {
            return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
        }
        if (opt.status === "PENDING_NEW" || opt.status === "PENDING_UPDATE") {
            return NextResponse.json({ error: "이미 심사 중인 옵션입니다." }, { status: 409 });
        }

        const now = nowKST();
        const ext = (f: File) => f.name.split(".").pop() ?? "bin";

        let pendingFileUrl: string | null = null;
        let pendingConfigJson: string | null = null;
        let pendingImageData: string | null = null;

        if (myThemeId) {
            // MyTheme 스냅샷
            const myTheme = await prisma.myTheme.findFirst({
                where: { id: myThemeId, userId: session.dbId, trashed: false },
            });
            if (!myTheme) return NextResponse.json({ error: "내 테마를 찾을 수 없습니다." }, { status: 404 });
            pendingConfigJson = JSON.stringify(myTheme.configJson ?? {});
            pendingImageData = JSON.stringify(myTheme.imageData ?? {});
        } else if (file && file.size > 0) {
            const osFolder = opt.os === "android" ? "android" : "ios";
            const tempId = crypto.randomUUID();
            pendingFileUrl = await uploadFile("theme-files", `${opt.themeId}/${osFolder}/update-${tempId}.${ext(file)}`, file);
        } else {
            return NextResponse.json({ error: "파일 또는 내 테마를 지정해주세요." }, { status: 400 });
        }

        await prisma.$executeRaw`
            UPDATE "ThemeOption"
            SET
                status = 'PENDING_UPDATE'::"ThemeOptionStatus",
                "pendingFileUrl" = ${pendingFileUrl},
                "pendingConfigJson" = ${pendingConfigJson}::jsonb,
                "pendingImageData" = ${pendingImageData}::jsonb,
                "pendingMyThemeId" = ${myThemeId ?? null},
                "pendingAdminNote" = NULL,
                "updatedAt" = ${now}
            WHERE id = ${optionId}
        `;

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[themes/update-option POST]", e);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

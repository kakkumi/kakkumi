import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { themeId } = (await request.json()) as { themeId: string };
    if (!themeId) {
        return NextResponse.json({ error: "themeId가 필요합니다." }, { status: 400 });
    }

    // 구매 권한 확인
    const purchase = await prisma.purchase.findFirst({
        where: { buyerId: session.dbId, themeId, status: "COMPLETED" },
    });
    if (!purchase) {
        return NextResponse.json({ error: "구매한 테마가 아닙니다." }, { status: 403 });
    }

    // 최신 버전 파일 URL 조회
    const rows = await prisma.$queryRaw<{ kthemeFileUrl: string | null; apkFileUrl: string | null; title: string }[]>`
        SELECT v."kthemeFileUrl", v."apkFileUrl", t.title
        FROM "ThemeVersion" v
        JOIN "Theme" t ON t.id = v."themeId"
        WHERE v."themeId" = ${themeId} AND v."buildStatus" = 'SUCCESS'
        ORDER BY v."createdAt" DESC
        LIMIT 1
    `;

    const latest = rows[0] ?? null;
    const downloadUrl = latest?.kthemeFileUrl ?? latest?.apkFileUrl ?? null;

    return NextResponse.json({
        success: true,
        downloadUrl,
        themeName: latest?.title ?? "",
    });
}

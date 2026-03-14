import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await getServerSession();

    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const body = (await request.json()) as { themeId: string; versionId?: string };
        const { themeId, versionId: rawVersionId } = body;

        if (!themeId) {
            return NextResponse.json({ error: "themeId가 필요합니다." }, { status: 400 });
        }

        const theme = await prisma.theme.findUnique({ where: { id: themeId } });

        if (!theme) {
            return NextResponse.json({ error: "테마를 찾을 수 없습니다." }, { status: 404 });
        }

        if (theme.price !== 0) {
            return NextResponse.json({ error: "유료 테마는 결제 후 다운로드 가능합니다." }, { status: 403 });
        }

        // versionId가 실제 ThemeVersion에 존재하는지 확인 (ThemeOption ID인 경우 null 처리)
        let versionId: string | null = null;
        if (rawVersionId) {
            const verCheck = await prisma.$queryRaw<{ id: string }[]>`
                SELECT id FROM "ThemeVersion" WHERE id = ${rawVersionId} LIMIT 1
            `;
            versionId = verCheck.length > 0 ? rawVersionId : null;
        }

        const existing = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "Purchase"
            WHERE "buyerId" = ${session.dbId}
              AND "themeId" = ${themeId}
              AND status = 'COMPLETED'::"PurchaseStatus"
            LIMIT 1
        `.then(rows => rows[0] ?? null);

        if (!existing) {
            await prisma.$executeRaw`
                INSERT INTO "Purchase" (id, "buyerId", "themeId", "versionId", amount, status, "isDownloaded", "createdAt")
                VALUES (${crypto.randomUUID()}, ${session.dbId}, ${themeId}, ${versionId}, ${0}, 'COMPLETED'::"PurchaseStatus", false, NOW())
            `;
        }

        return NextResponse.json({ success: true, alreadyOwned: !!existing });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

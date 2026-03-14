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
        const { themeId, versionId } = body;

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

        const existing = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "Purchase"
            WHERE "buyerId" = ${session.dbId}
              AND "themeId" = ${themeId}
              AND ("versionId" = ${versionId ?? null} OR ("versionId" IS NULL AND ${versionId ?? null}::text IS NULL))
              AND status = 'COMPLETED'::"PurchaseStatus"
            LIMIT 1
        `.then(rows => rows[0] ?? null);

        if (!existing) {
            await prisma.$executeRaw`
                INSERT INTO "Purchase" (id, "buyerId", "themeId", "versionId", amount, status, "createdAt")
                VALUES (${crypto.randomUUID()}, ${session.dbId}, ${themeId}, ${versionId ?? null}, ${0}, 'COMPLETED'::"PurchaseStatus", NOW())
            `;
        }

        return NextResponse.json({ success: true, alreadyOwned: !!existing });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

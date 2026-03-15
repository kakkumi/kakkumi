import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 크리에이터가 자신의 테마 공개/비공개/판매중단 전환
export async function PATCH(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const { themeId, action } = (await req.json()) as {
            themeId: string;
            action: "setPublic" | "setPrivate" | "discontinue" | "resume";
        };

        if (!themeId || !action) {
            return NextResponse.json({ error: "themeId, action 필요" }, { status: 400 });
        }

        // 본인 테마인지 확인
        const rows = await prisma.$queryRaw<{ id: string; creatorId: string }[]>`
            SELECT id, "creatorId" FROM "Theme" WHERE id = ${themeId} LIMIT 1
        `;
        if (rows.length === 0) {
            return NextResponse.json({ error: "테마를 찾을 수 없습니다." }, { status: 404 });
        }
        if (rows[0].creatorId !== session.dbId && session.role !== "ADMIN") {
            return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
        }

        if (action === "setPublic") {
            await prisma.$executeRaw`UPDATE "Theme" SET "isPublic" = true, "updatedAt" = NOW() WHERE id = ${themeId}`;
        } else if (action === "setPrivate") {
            await prisma.$executeRaw`UPDATE "Theme" SET "isPublic" = false, "updatedAt" = NOW() WHERE id = ${themeId}`;
        } else if (action === "discontinue") {
            await prisma.$executeRaw`UPDATE "Theme" SET "isSelling" = false, "updatedAt" = NOW() WHERE id = ${themeId}`;
        } else if (action === "resume") {
            await prisma.$executeRaw`UPDATE "Theme" SET "isSelling" = true, "updatedAt" = NOW() WHERE id = ${themeId}`;
        } else {
            return NextResponse.json({ error: "잘못된 action" }, { status: 400 });
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("isPublic") || msg.includes("isSelling") || msg.includes("column")) {
            return NextResponse.json({ error: "npx prisma db push 를 먼저 실행해주세요." }, { status: 503 });
        }
        console.error("[themes/manage PATCH]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 테마 이름 중복 확인
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title")?.trim();

    if (!title) {
        return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
    }

    try {
        const rows = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "Theme" WHERE title = ${title} LIMIT 1
        `;
        const isDuplicate = rows.length > 0;
        return NextResponse.json({ isDuplicate });
    } catch (e) {
        console.error("[themes/check-name]", e);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}

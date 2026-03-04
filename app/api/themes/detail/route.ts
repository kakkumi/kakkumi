import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id 없음" }, { status: 400 });

    try {
        const rows = await prisma.$queryRaw<{
            id: string; title: string; price: number;
            thumbnailUrl: string | null;
            creatorNickname: string | null; creatorName: string;
        }[]>`
            SELECT t.id, t.title, t.price, t."thumbnailUrl",
                   u.nickname AS "creatorNickname", u.name AS "creatorName"
            FROM "Theme" t
            JOIN "User" u ON t."creatorId" = u.id
            WHERE t.id = ${id} AND t.status = 'PUBLISHED'
            LIMIT 1
        `;

        if (!rows[0]) return NextResponse.json({ error: "테마 없음" }, { status: 404 });

        const r = rows[0];
        return NextResponse.json({
            theme: {
                id: r.id,
                title: r.title,
                price: r.price,
                thumbnailUrl: r.thumbnailUrl,
                author: r.creatorNickname ?? r.creatorName,
            },
        });
    } catch (e) {
        console.error("[themes/detail]", e);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}

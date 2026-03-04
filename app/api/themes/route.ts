import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const themes = await prisma.$queryRaw<{
            id: string;
            title: string;
            description: string | null;
            price: number;
            thumbnailUrl: string | null;
            images: string[];
            tags: string[];
            createdAt: Date;
            creatorNickname: string | null;
            creatorName: string;
            salesCount: number;
        }[]>`
            SELECT
                t.id,
                t.title,
                t.description,
                t.price,
                t."thumbnailUrl",
                t.images,
                t.tags,
                t."createdAt",
                u.nickname AS "creatorNickname",
                u.name     AS "creatorName",
                COUNT(p.id)::int AS "salesCount"
            FROM "Theme" t
            JOIN "User" u ON t."creatorId" = u.id
            LEFT JOIN "Purchase" p ON p."themeId" = t.id AND p.status = 'COMPLETED'
            WHERE t.status = 'PUBLISHED'
            GROUP BY t.id, u.nickname, u.name
            ORDER BY t."createdAt" DESC
        `;

        return NextResponse.json({ themes });
    } catch (e) {
        console.error("[themes GET]", e);
        return NextResponse.json({ themes: [] });
    }
}

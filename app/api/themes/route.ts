import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        let themes;
        try {
            themes = await prisma.$queryRaw<{
                id: string;
                title: string;
                description: string | null;
                price: number;
                thumbnailUrl: string | null;
                images: string[];
                tags: string[];
                createdAt: Date;
                creatorId: string;
                creatorNickname: string | null;
                creatorName: string;
                salesCount: number;
                likeCount: number;
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
                    t."creatorId",
                    u.nickname AS "creatorNickname",
                    u.name     AS "creatorName",
                    COUNT(DISTINCT p.id)::int AS "salesCount",
                    COUNT(DISTINCT l.id)::int AS "likeCount"
                FROM "Theme" t
                JOIN "User" u ON t."creatorId" = u.id
                LEFT JOIN "Purchase" p ON p."themeId" = t.id AND p.status = 'COMPLETED'
                LEFT JOIN "ThemeLike" l ON l."themeId" = t.id
                WHERE t.status = 'PUBLISHED'
                  AND (t."isPublic" IS NULL OR t."isPublic" = true)
                  AND (t."isSelling" IS NULL OR t."isSelling" = true)
                GROUP BY t.id, t."creatorId", u.nickname, u.name
                ORDER BY t."createdAt" DESC
            `;
        } catch {
            themes = await prisma.$queryRaw<{
                id: string;
                title: string;
                description: string | null;
                price: number;
                thumbnailUrl: string | null;
                images: string[];
                tags: string[];
                createdAt: Date;
                creatorId: string;
                creatorNickname: string | null;
                creatorName: string;
                salesCount: number;
                likeCount: number;
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
                    t."creatorId",
                    u.nickname AS "creatorNickname",
                    u.name     AS "creatorName",
                    COUNT(DISTINCT p.id)::int AS "salesCount",
                    0::int AS "likeCount"
                FROM "Theme" t
                JOIN "User" u ON t."creatorId" = u.id
                LEFT JOIN "Purchase" p ON p."themeId" = t.id AND p.status = 'COMPLETED'
                WHERE t.status = 'PUBLISHED'
                GROUP BY t.id, t."creatorId", u.nickname, u.name
                ORDER BY t."createdAt" DESC
            `;
        }

        return NextResponse.json({ themes });
    } catch (e) {
        console.error("[themes GET]", e);
        return NextResponse.json({ themes: [] });
    }
}


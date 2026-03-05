import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // isPublic/isSelling 컬럼이 존재하는지 먼저 시도, 없으면 기본 쿼리 사용
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
                    COUNT(p.id)::int AS "salesCount"
                FROM "Theme" t
                JOIN "User" u ON t."creatorId" = u.id
                LEFT JOIN "Purchase" p ON p."themeId" = t.id AND p.status = 'COMPLETED'
                WHERE t.status = 'PUBLISHED'
                  AND (t."isPublic" IS NULL OR t."isPublic" = true)
                  AND (t."isSelling" IS NULL OR t."isSelling" = true)
                GROUP BY t.id, t."creatorId", u.nickname, u.name
                ORDER BY t."createdAt" DESC
            `;
        } catch {
            // isPublic/isSelling 컬럼이 없는 경우 (db push 전)
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
                    COUNT(p.id)::int AS "salesCount"
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





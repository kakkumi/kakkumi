import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    const versionId = req.nextUrl.searchParams.get("versionId");
    if (!id) return NextResponse.json({ error: "id 없음" }, { status: 400 });

    try {
        const rows = await prisma.$queryRaw<{
            id: string; title: string; price: number; discountPrice: number | null;
            thumbnailUrl: string | null;
            creatorNickname: string | null; creatorName: string;
        }[]>`
            SELECT t.id, t.title, t.price, t."discountPrice", t."thumbnailUrl",
                   u.nickname AS "creatorNickname", u.name AS "creatorName"
            FROM "Theme" t
            JOIN "User" u ON t."creatorId" = u.id
            WHERE t.id = ${id} AND t.status = 'PUBLISHED'
            LIMIT 1
        `;

        if (!rows[0]) return NextResponse.json({ error: "테마 없음" }, { status: 404 });

        const r = rows[0];

        let selectedVersion: { id: string; os: "iOS" | "Android"; optionName: string; label: string } | null = null;

        if (versionId) {
            const versionRows = await prisma.$queryRaw<{
                id: string;
                version: string;
                kthemeFileUrl: string | null;
                apkFileUrl: string | null;
            }[]>`
                SELECT id, version, "kthemeFileUrl", "apkFileUrl"
                FROM "ThemeVersion"
                WHERE id = ${versionId} AND "themeId" = ${id}
                LIMIT 1
            `;

            const version = versionRows[0] ?? null;

            if (version) {
                const matched = version.version.match(/^(android|ios)\s*·\s*(.+)$/i);
                const os = matched
                    ? (matched[1].toLowerCase() === "android" ? "Android" : "iOS")
                    : (version.apkFileUrl ? "Android" : "iOS");
                const optionName = matched?.[2]?.trim() || version.version;

                selectedVersion = {
                    id: version.id,
                    os,
                    optionName,
                    label: `${os} · ${optionName}`,
                };
            } else {
                const optionRows = await prisma.$queryRaw<{
                    id: string;
                    os: string;
                    name: string;
                }[]>`
                    SELECT id, os, name
                    FROM "ThemeOption"
                    WHERE id = ${versionId} AND "themeId" = ${id}
                    LIMIT 1
                `;

                const option = optionRows[0] ?? null;
                if (option) {
                    const os = option.os.toLowerCase() === "android" ? "Android" : "iOS";
                    selectedVersion = {
                        id: option.id,
                        os,
                        optionName: option.name,
                        label: `${os} · ${option.name}`,
                    };
                }
            }
        }

        return NextResponse.json({
            theme: {
                id: r.id,
                title: r.title,
                price: r.price,
                discountPrice: r.discountPrice ?? null,
                thumbnailUrl: r.thumbnailUrl,
                author: r.creatorNickname ?? r.creatorName,
            },
            selectedVersion,
        });
    } catch (e) {
        console.error("[themes/detail]", e);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}

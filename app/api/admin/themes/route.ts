import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sendThemeRejectionEmail } from "@/lib/email";
import { notifyThemeApproved, notifyThemeRejected, notifyNewThemeToFollowers } from "@/lib/notification";

// 전체 테마 목록 (DRAFT 포함)
export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const themes = await prisma.$queryRaw<{
            id: string; title: string; description: string | null;
            price: number; status: string; adminNote: string | null;
            createdAt: Date; creatorNickname: string | null; creatorName: string;
            thumbnailUrl: string | null; images: string[]; tags: string[];
            versions: { version: string; kthemeFileUrl: string | null; apkFileUrl: string | null }[];
        }[]>`
            SELECT t.id, t.title, t.description, t.price, t.status, t."adminNote", t."createdAt",
                   t."thumbnailUrl", t.images, t.tags,
                   u.nickname AS "creatorNickname", u.name AS "creatorName",
                   COALESCE(
                       (SELECT json_agg(json_build_object(
                           'version', v.version,
                           'kthemeFileUrl', v."kthemeFileUrl",
                           'apkFileUrl', v."apkFileUrl"
                       ) ORDER BY v."createdAt" ASC)
                        FROM "ThemeVersion" v WHERE v."themeId" = t.id),
                       '[]'::json
                   ) AS versions
            FROM "Theme" t
            JOIN "User" u ON t."creatorId" = u.id
            ORDER BY t."createdAt" DESC
        `;
        return NextResponse.json({ themes });
    } catch (e) {
        console.error("[admin/themes GET]", e);
        return NextResponse.json({ themes: [] });
    }
}

// 테마 승인 / 반려 / 숨김 처리
export async function PATCH(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { themeId, action, adminNote } = (await req.json()) as {
            themeId: string;
            action: "approve" | "reject" | "hide" | "unhide";
            adminNote?: string;
        };

        const themeRows = await prisma.$queryRaw<{
            title: string; creatorId: string; creatorEmail: string | null;
            creatorName: string; creatorNickname: string | null;
        }[]>`
            SELECT t.title, t."creatorId", u.email AS "creatorEmail",
                   u.name AS "creatorName", u.nickname AS "creatorNickname"
            FROM "Theme" t JOIN "User" u ON t."creatorId" = u.id
            WHERE t.id = ${themeId} LIMIT 1
        `;
        const theme = themeRows[0];

        if (action === "approve") {
            await prisma.$executeRaw`UPDATE "Theme" SET status = 'PUBLISHED', "adminNote" = NULL, "updatedAt" = NOW() WHERE id = ${themeId}`;
            if (theme) {
                await notifyThemeApproved(theme.creatorId, theme.title, themeId);
                await notifyNewThemeToFollowers(theme.creatorId, theme.title, themeId);
            }
        } else if (action === "reject") {
            await prisma.$executeRaw`UPDATE "Theme" SET status = 'DRAFT', "adminNote" = ${adminNote ?? ""}, "updatedAt" = NOW() WHERE id = ${themeId}`;
            if (theme) {
                await notifyThemeRejected(theme.creatorId, theme.title, adminNote);
                if (theme.creatorEmail) {
                    await sendThemeRejectionEmail({
                        to: theme.creatorEmail,
                        name: theme.creatorNickname ?? theme.creatorName,
                        themeTitle: theme.title,
                        reason: adminNote ?? "사유 없음",
                    }).catch(e => console.error("[rejection email]", e));
                }
            }
        } else if (action === "hide") {
            await prisma.$executeRaw`UPDATE "Theme" SET status = 'HIDDEN', "updatedAt" = NOW() WHERE id = ${themeId}`;
        } else if (action === "unhide") {
            await prisma.$executeRaw`UPDATE "Theme" SET status = 'PUBLISHED', "updatedAt" = NOW() WHERE id = ${themeId}`;
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/themes PATCH]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}

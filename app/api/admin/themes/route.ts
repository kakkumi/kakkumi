import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sendThemeRejectionEmail } from "@/lib/email";
import { notifyThemeApproved, notifyThemeRejected, notifyNewThemeToFollowers, notifyThemeUpdateApproved } from "@/lib/notification";

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
            contentBlocks: string | null;
            pendingTitle: string | null; pendingDescription: string | null;
            pendingPrice: number | null; pendingTags: string[] | null;
            pendingThumbnailUrl: string | null; pendingImages: string[] | null;
            pendingContentBlocks: string | null; pendingReviewVisibility: string | null;
            versions: { version: string; kthemeFileUrl: string | null; apkFileUrl: string | null }[];
            options: {
                id: string; os: string; name: string; status: string; adminNote: string | null;
                fileUrl: string | null; myThemeId: string | null;
                pendingFileUrl: string | null; pendingMyThemeId: string | null; pendingAdminNote: string | null;
            }[];
        }[]>`
            SELECT t.id, t.title, t.description, t.price, t.status, t."adminNote", t."createdAt",
                   t."thumbnailUrl", t.images, t.tags,
                   t."contentBlocks",
                   t."pendingTitle", t."pendingDescription", t."pendingPrice",
                   t."pendingTags", t."pendingThumbnailUrl", t."pendingImages",
                   t."pendingContentBlocks", t."pendingReviewVisibility",
                   u.nickname AS "creatorNickname", u.name AS "creatorName",
                   COALESCE(
                       (SELECT json_agg(json_build_object(
                           'version', v.version,
                           'kthemeFileUrl', v."kthemeFileUrl",
                           'apkFileUrl', v."apkFileUrl"
                       ) ORDER BY v."createdAt" ASC)
                        FROM "ThemeVersion" v WHERE v."themeId" = t.id),
                       '[]'::json
                   ) AS versions,
                   COALESCE(
                       (SELECT json_agg(json_build_object(
                           'id', o.id,
                           'os', o.os,
                           'name', o.name,
                           'status', o.status,
                           'adminNote', o."adminNote",
                           'fileUrl', o."fileUrl",
                           'myThemeId', o."myThemeId",
                           'pendingFileUrl', o."pendingFileUrl",
                           'pendingMyThemeId', o."pendingMyThemeId",
                           'pendingAdminNote', o."pendingAdminNote"
                       ) ORDER BY o."createdAt" ASC)
                        FROM "ThemeOption" o WHERE o."themeId" = t.id),
                       '[]'::json
                   ) AS options
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
        const { themeId, action, adminNote, optionId } = (await req.json()) as {
            themeId: string;
            action: "approve" | "reject" | "hide" | "unhide" | "approveOption" | "rejectOption";
            adminNote?: string;
            optionId?: string;
        };

        // ── 옵션 단위 승인/반려 ──
        if (action === "approveOption" || action === "rejectOption") {
            if (!optionId) return NextResponse.json({ error: "optionId 필요" }, { status: 400 });

            const optRows = await prisma.$queryRaw<{ status: string }[]>`
                SELECT status FROM "ThemeOption" WHERE id = ${optionId} LIMIT 1
            `;
            if (optRows.length === 0) return NextResponse.json({ error: "옵션 없음" }, { status: 404 });

            if (action === "approveOption") {
                const isNew = optRows[0].status === "PENDING_NEW";
                if (isNew) {
                    // 신규 옵션 승인 → pending 데이터를 active 로 승격
                    await prisma.$executeRaw`
                        UPDATE "ThemeOption"
                        SET
                            status = 'ACTIVE'::"ThemeOptionStatus",
                            "fileUrl" = COALESCE("pendingFileUrl", "fileUrl"),
                            "configJson" = COALESCE("pendingConfigJson", "configJson"),
                            "imageData" = COALESCE("pendingImageData", "imageData"),
                            "myThemeId" = COALESCE("pendingMyThemeId", "myThemeId"),
                            "pendingFileUrl" = NULL,
                            "pendingConfigJson" = NULL,
                            "pendingImageData" = NULL,
                            "pendingMyThemeId" = NULL,
                            "pendingAdminNote" = NULL,
                            "adminNote" = NULL,
                            "updatedAt" = NOW()
                        WHERE id = ${optionId}
                    `;
                } else {
                    // 업데이트 승인 → pending 데이터를 active로 교체
                    await prisma.$executeRaw`
                        UPDATE "ThemeOption"
                        SET
                            status = 'ACTIVE'::"ThemeOptionStatus",
                            "fileUrl" = COALESCE("pendingFileUrl", "fileUrl"),
                            "configJson" = COALESCE("pendingConfigJson", "configJson"),
                            "imageData" = COALESCE("pendingImageData", "imageData"),
                            "myThemeId" = COALESCE("pendingMyThemeId", "myThemeId"),
                            "pendingFileUrl" = NULL,
                            "pendingConfigJson" = NULL,
                            "pendingImageData" = NULL,
                            "pendingMyThemeId" = NULL,
                            "pendingAdminNote" = NULL,
                            "adminNote" = NULL,
                            "updatedAt" = NOW()
                        WHERE id = ${optionId}
                    `;
                }
            } else {
                // 반려
                const wasNew = optRows[0].status === "PENDING_NEW";
                if (wasNew) {
                    // 신규 반려 → 옵션 자체 삭제
                    await prisma.$executeRaw`DELETE FROM "ThemeOption" WHERE id = ${optionId}`;
                } else {
                    // 업데이트 반려 → pending 데이터만 초기화, 기존 ACTIVE 유지
                    await prisma.$executeRaw`
                        UPDATE "ThemeOption"
                        SET
                            status = 'ACTIVE'::"ThemeOptionStatus",
                            "pendingFileUrl" = NULL,
                            "pendingConfigJson" = NULL,
                            "pendingImageData" = NULL,
                            "pendingMyThemeId" = NULL,
                            "pendingAdminNote" = ${adminNote ?? null},
                            "adminNote" = ${adminNote ?? null},
                            "updatedAt" = NOW()
                        WHERE id = ${optionId}
                    `;
                }
            }
            return NextResponse.json({ ok: true });
        }

        // ── 테마 단위 승인/반려/숨김 ──
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
            // pending 수정사항이 있으면 실제 컬럼에 반영
            const pendingRows = await prisma.$queryRaw<{
                pendingTitle: string | null;
                pendingDescription: string | null;
                pendingPrice: number | null;
                pendingTags: string[] | null;
                pendingThumbnailUrl: string | null;
                pendingImages: string[] | null;
                pendingContentBlocks: unknown;
                pendingReviewVisibility: string | null;
                isUpdate: boolean;
            }[]>`
                SELECT
                    "pendingTitle", "pendingDescription", "pendingPrice",
                    "pendingTags", "pendingThumbnailUrl", "pendingImages",
                    "pendingContentBlocks", "pendingReviewVisibility",
                    ("pendingTitle" IS NOT NULL) AS "isUpdate"
                FROM "Theme" WHERE id = ${themeId} LIMIT 1
            `.catch(() => []);

            const pending = pendingRows[0];
            const isUpdate = pending?.isUpdate ?? false;

            if (isUpdate && pending) {
                // 수정 승인: pending → 실제 반영
                await prisma.$executeRaw`
                    UPDATE "Theme" SET
                        title = COALESCE("pendingTitle", title),
                        description = COALESCE("pendingDescription", description),
                        price = COALESCE("pendingPrice", price),
                        tags = COALESCE("pendingTags", tags),
                        "thumbnailUrl" = COALESCE("pendingThumbnailUrl", "thumbnailUrl"),
                        images = COALESCE("pendingImages", images),
                        "contentBlocks" = COALESCE("pendingContentBlocks", "contentBlocks"),
                        "pendingTitle" = NULL, "pendingDescription" = NULL,
                        "pendingPrice" = NULL, "pendingTags" = NULL,
                        "pendingThumbnailUrl" = NULL, "pendingImages" = NULL,
                        "pendingContentBlocks" = NULL, "pendingReviewVisibility" = NULL,
                        status = 'PUBLISHED'::"ThemeStatus",
                        "isPublic" = true,
                        "adminNote" = NULL, "updatedAt" = NOW()
                    WHERE id = ${themeId}
                `.catch(() =>
                    prisma.$executeRaw`
                        UPDATE "Theme" SET status = 'PUBLISHED'::"ThemeStatus", "isPublic" = true, "adminNote" = NULL, "updatedAt" = NOW() WHERE id = ${themeId}
                    `
                );
            } else {
                // 신규 승인
                await prisma.$executeRaw`UPDATE "Theme" SET status = 'PUBLISHED', "adminNote" = NULL, "updatedAt" = NOW() WHERE id = ${themeId}`;
            }

            // PENDING_NEW 옵션 ACTIVE 승격
            await prisma.$executeRaw`
                UPDATE "ThemeOption"
                SET
                    status = 'ACTIVE'::"ThemeOptionStatus",
                    "fileUrl" = COALESCE("pendingFileUrl", "fileUrl"),
                    "configJson" = COALESCE("pendingConfigJson", "configJson"),
                    "imageData" = COALESCE("pendingImageData", "imageData"),
                    "myThemeId" = COALESCE("pendingMyThemeId", "myThemeId"),
                    "pendingFileUrl" = NULL, "pendingConfigJson" = NULL,
                    "pendingImageData" = NULL, "pendingMyThemeId" = NULL,
                    "pendingAdminNote" = NULL, "updatedAt" = NOW()
                WHERE "themeId" = ${themeId} AND status = 'PENDING_NEW'::"ThemeOptionStatus"
            `;
            // PENDING_UPDATE 옵션도 ACTIVE 승격
            await prisma.$executeRaw`
                UPDATE "ThemeOption"
                SET
                    status = 'ACTIVE'::"ThemeOptionStatus",
                    "fileUrl" = COALESCE("pendingFileUrl", "fileUrl"),
                    "configJson" = COALESCE("pendingConfigJson", "configJson"),
                    "imageData" = COALESCE("pendingImageData", "imageData"),
                    "myThemeId" = COALESCE("pendingMyThemeId", "myThemeId"),
                    "pendingFileUrl" = NULL, "pendingConfigJson" = NULL,
                    "pendingImageData" = NULL, "pendingMyThemeId" = NULL,
                    "pendingAdminNote" = NULL, "updatedAt" = NOW()
                WHERE "themeId" = ${themeId} AND status = 'PENDING_UPDATE'::"ThemeOptionStatus"
            `.catch(() => null);

            await prisma.$executeRaw`
                UPDATE "ThemeVersion" tv
                SET
                    "kthemeFileUrl" = CASE WHEN to_.os = 'ios' THEN to_."fileUrl" ELSE tv."kthemeFileUrl" END,
                    "apkFileUrl"    = CASE WHEN to_.os = 'android' THEN to_."fileUrl" ELSE tv."apkFileUrl" END,
                    "buildStatus"   = 'COMPLETED'::"BuildStatus"
                FROM "ThemeOption" to_
                WHERE tv."themeId" = ${themeId}
                  AND to_."themeId" = ${themeId}
                  AND to_."fileUrl" IS NOT NULL
                  AND tv.version = (CASE WHEN to_.os = 'android' THEN 'Android' ELSE 'iOS' END || ' · ' || to_.name)
            `.catch(() => null);

            if (theme) {
                if (isUpdate) {
                    await notifyThemeUpdateApproved(theme.creatorId, theme.title, themeId);
                } else {
                    await notifyThemeApproved(theme.creatorId, theme.title, themeId);
                    await notifyNewThemeToFollowers(theme.creatorId, theme.title, themeId);
                }
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

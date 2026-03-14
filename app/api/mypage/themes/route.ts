import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession();

    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 구매한 테마 목록 (versionId, purchaseId 포함)
    type PurchaseRow = { purchaseId: string; themeId: string; versionId: string | null; createdAt: Date; themeTitle: string; themePrice: number; themeThumbnailUrl: string | null };
    const purchases = await prisma.$queryRaw<PurchaseRow[]>`
        SELECT p.id AS "purchaseId", p."themeId", p."versionId", p."createdAt",
               t.title AS "themeTitle", t.price AS "themePrice", t."thumbnailUrl" AS "themeThumbnailUrl"
        FROM "Purchase" p
        JOIN "Theme" t ON t.id = p."themeId"
        WHERE p."buyerId" = ${session.dbId} AND p.status = 'COMPLETED'::"PurchaseStatus"
        ORDER BY p."createdAt" DESC
    `;

    let myThemes: { id: string; title: string; price: number; status: string; isPublic: boolean; isSelling: boolean; thumbnailUrl: string | null }[];
    try {
        myThemes = await prisma.$queryRaw<{
            id: string; title: string; price: number;
            status: string; isPublic: boolean; isSelling: boolean; thumbnailUrl: string | null;
        }[]>`
            SELECT id, title, price, status, "isPublic", "isSelling", "thumbnailUrl"
            FROM "Theme"
            WHERE "creatorId" = ${session.dbId}
            ORDER BY "createdAt" DESC
        `;
    } catch {
        const rows = await prisma.$queryRaw<{ id: string; title: string; price: number; status: string; }[]>`
            SELECT id, title, price, status
            FROM "Theme"
            WHERE "creatorId" = ${session.dbId}
            ORDER BY "createdAt" DESC
        `;
        myThemes = rows.map(r => ({ ...r, isPublic: true, isSelling: true, thumbnailUrl: null }));
    }

    // 구매한 버전 정보 조회 (구매별로 정확한 버전 1개씩 매핑)
    type VersionRow = { id: string; themeId: string; version: string; kthemeFileUrl: string | null; apkFileUrl: string | null };

    // versionId가 있는 구매들의 버전 조회
    const versionIds = purchases.map(p => p.versionId).filter((v): v is string => !!v);
    const versionMap: Record<string, VersionRow> = {};
    if (versionIds.length > 0) {
        const versionRows = await prisma.$queryRaw<VersionRow[]>`
            SELECT id, "themeId", version, "kthemeFileUrl", "apkFileUrl"
            FROM "ThemeVersion"
            WHERE id = ANY(${versionIds}::text[])
        `;
        for (const v of versionRows) {
            versionMap[v.id] = v;
        }
    }

    // versionId 없는 구매의 fallback: themeId 기준 전체 버전
    const themesWithoutVersion = [...new Set(purchases.filter(p => !p.versionId).map(p => p.themeId))];
    const fallbackVersionsByTheme: Record<string, VersionRow[]> = {};
    if (themesWithoutVersion.length > 0) {
        const fallbackVersions = await prisma.$queryRaw<VersionRow[]>`
            SELECT id, "themeId", version, "kthemeFileUrl", "apkFileUrl"
            FROM "ThemeVersion"
            WHERE "themeId" = ANY(${themesWithoutVersion}::text[])
            ORDER BY "createdAt" ASC
        `;
        for (const v of fallbackVersions) {
            if (!fallbackVersionsByTheme[v.themeId]) fallbackVersionsByTheme[v.themeId] = [];
            fallbackVersionsByTheme[v.themeId].push(v);
        }
    }

    const purchasedList = purchases.map((p) => {
        // versionId가 있으면 해당 버전 1개만, 없으면 fallback 전체
        const versions = p.versionId
            ? (versionMap[p.versionId] ? [versionMap[p.versionId]] : [])
            : (fallbackVersionsByTheme[p.themeId] ?? []);
        return {
            purchaseId: p.purchaseId,
            id: p.themeId,
            name: p.themeTitle,
            price: p.themePrice,
            thumbnailUrl: p.themeThumbnailUrl ?? null,
            purchasedAt: p.createdAt,
            versions,
        };
    });

    const mineList = myThemes.map((t) => ({
        id: t.id,
        name: t.title,
        price: t.price,
        thumbnailUrl: t.thumbnailUrl ?? null,
        status: t.status,
        isPublic: t.isPublic ?? true,
        isSelling: t.isSelling ?? true,
    }));

    // 구매 테마 중 내가 만든 테마는 제외 (타인 테마만)
    const myThemeIds = new Set(mineList.map(t => t.id));
    const purchasedOthers = purchasedList.filter(p => !myThemeIds.has(p.id));

    return NextResponse.json({
        mine: mineList,
        purchased: purchasedOthers,
        purchasedCount: purchasedOthers.length,
        mineCount: myThemes.length,
    });
}

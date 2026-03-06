import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession();

    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 구매한 테마 목록 (versionId 포함)
    type PurchaseRow = { themeId: string; versionId: string | null; createdAt: Date; themeTitle: string; themePrice: number; themeThumbnailUrl: string | null };
    const purchases = await prisma.$queryRaw<PurchaseRow[]>`
        SELECT p."themeId", p."versionId", p."createdAt",
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

    // 구매한 버전 정보 조회
    type VersionRow = { themeId: string; id: string; version: string; kthemeFileUrl: string | null; apkFileUrl: string | null };
    const versionsByTheme: Record<string, VersionRow[]> = {};

    // versionId가 있는 구매 → 해당 버전만
    const versionIds = purchases.map(p => p.versionId).filter((v): v is string => !!v);
    if (versionIds.length > 0) {
        const specificVersions = await prisma.$queryRaw<VersionRow[]>`
            SELECT "themeId", id, version, "kthemeFileUrl", "apkFileUrl"
            FROM "ThemeVersion"
            WHERE id = ANY(${versionIds}::text[])
        `;
        for (const v of specificVersions) {
            if (!versionsByTheme[v.themeId]) versionsByTheme[v.themeId] = [];
            versionsByTheme[v.themeId].push(v);
        }
    }
    // versionId 없는 구매 → 전체 버전 (구버전 데이터 호환)
    const themesWithoutVersion = purchases.filter(p => !p.versionId).map(p => p.themeId);
    if (themesWithoutVersion.length > 0) {
        const fallbackVersions = await prisma.$queryRaw<VersionRow[]>`
            SELECT "themeId", id, version, "kthemeFileUrl", "apkFileUrl"
            FROM "ThemeVersion"
            WHERE "themeId" = ANY(${themesWithoutVersion}::text[])
            ORDER BY "createdAt" ASC
        `;
        for (const v of fallbackVersions) {
            if (!versionsByTheme[v.themeId]) versionsByTheme[v.themeId] = [];
            versionsByTheme[v.themeId].push(v);
        }
    }

    const purchasedList = purchases.map((p) => ({
        id: p.themeId,
        name: p.themeTitle,
        price: p.themePrice,
        thumbnailUrl: p.themeThumbnailUrl ?? null,
        purchasedAt: p.createdAt,
        versions: versionsByTheme[p.themeId] ?? [],
    }));

    const mineList = myThemes.map((t) => ({
        id: t.id,
        name: t.title,
        price: t.price,
        thumbnailUrl: t.thumbnailUrl ?? null,
        status: t.status,
        isPublic: t.isPublic ?? true,
        isSelling: t.isSelling ?? true,
    }));

    // 전체 = 내 테마 + 구매한 테마 (중복 제거)
    const allList = [
        ...mineList.map((t) => ({ ...t, tag: "내 테마" as const })),
        ...purchasedList
            .filter((p) => !mineList.some((m) => m.id === p.id))
            .map((p) => ({ ...p, tag: "구매" as const })),
    ];

    return NextResponse.json({
        mine: mineList,
        purchased: purchasedList,
        all: allList,
        purchasedCount: purchases.length,
        mineCount: myThemes.length,
    });
}

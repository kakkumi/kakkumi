import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ThemeDetailLayout from "./ThemeDetailLayout";
import ThemeDetailTabs from "./ThemeDetailTabs";
import ThemeMockupPreview from "./ThemeMockupPreview";
import type { ThemeOptionData } from "./ThemeMockupPreview";

export default async function ThemeDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;

    type DbThemeRow = {
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
        contentBlocks: unknown;
        isSelling: boolean;
    };

    let dbTheme: DbThemeRow | null = null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
        const rows = await prisma.$queryRaw<DbThemeRow[]>`
            SELECT
                t.id, t.title, t.description, t.price,
                t."thumbnailUrl", t.images, t.tags, t."createdAt",
                t."creatorId", t."contentBlocks",
                COALESCE(t."isSelling", true) AS "isSelling",
                u.nickname AS "creatorNickname", u.name AS "creatorName",
                COUNT(DISTINCT p.id)::int AS "salesCount"
            FROM "Theme" t
            JOIN "User" u ON t."creatorId" = u.id
            LEFT JOIN "Purchase" p ON p."themeId" = t.id AND p.status = 'COMPLETED'
            WHERE t.id = ${id} AND t.status = 'PUBLISHED'
            GROUP BY t.id, t."creatorId", u.nickname, u.name
            LIMIT 1
        `;
        dbTheme = rows[0] ?? null;
    }

    if (!dbTheme) return notFound();

    const session = await getServerSession();
    const isLoggedIn = !!session?.dbId;

    // 구매한 versionId 목록 조회
    let ownedVersionIds: string[] = [];
    if (session?.dbId) {
        const ownedRows = await prisma.$queryRaw<{ versionId: string | null }[]>`
            SELECT "versionId" FROM "Purchase"
            WHERE "buyerId" = ${session.dbId} AND "themeId" = ${id} AND status = 'COMPLETED'::"PurchaseStatus"
        `;
        ownedVersionIds = ownedRows.map(r => r.versionId).filter((v): v is string => !!v);
    }

    // 다운로드 옵션 (ThemeVersion) 조회
    type VersionRow = { id: string; version: string; kthemeFileUrl: string | null; apkFileUrl: string | null };
    let versions = await prisma.$queryRaw<VersionRow[]>`
        SELECT id, version, "kthemeFileUrl", "apkFileUrl"
        FROM "ThemeVersion"
        WHERE "themeId" = ${id}
        ORDER BY "createdAt" ASC
    `;

    // ThemeVersion이 없으면 ThemeOption.fileUrl 기반으로 fallback 생성
    if (versions.length === 0) {
        type OptionFileRow = { id: string; name: string; os: string; fileUrl: string | null; hasConfigJson: boolean };
        const optFileRows = await prisma.$queryRaw<OptionFileRow[]>`
            SELECT id, name, os, "fileUrl",
                   ("configJson" IS NOT NULL AND "configJson"::text != 'null') AS "hasConfigJson"
            FROM "ThemeOption"
            WHERE "themeId" = ${id} AND status = 'ACTIVE'::"ThemeOptionStatus"
            ORDER BY "createdAt" ASC
        `;
        versions = optFileRows.map(o => ({
            id: o.id,
            version: `${o.os === "android" ? "Android" : "iOS"} · ${o.name}`,
            // 내 테마 기반(configJson 있음)이면 kthemeFileUrl에 특수 마커 사용 → 클라이언트에서 동적 생성 API 호출
            kthemeFileUrl: o.os === "ios"
                ? (o.hasConfigJson ? `__ktheme_generate__:${o.id}` : o.fileUrl)
                : null,
            apkFileUrl: o.os === "android"
                ? (o.hasConfigJson ? null : o.fileUrl)
                : null,
        }));
    }

    // ThemeOption 조회 (내 테마 기반 목업 미리보기용)
    type OptionRow = { id: string; name: string; os: string; configJson: unknown; imageData: unknown };
    let themeOptions: ThemeOptionData[] = [];
    try {
        const optRows = await prisma.$queryRaw<OptionRow[]>`
            SELECT id, name, os, "configJson", "imageData"
            FROM "ThemeOption"
            WHERE "themeId" = ${id} AND status = 'ACTIVE'::"ThemeOptionStatus"
            ORDER BY "createdAt" ASC
        `;
        themeOptions = optRows.map(r => ({
            id: r.id,
            name: r.name,
            os: r.os,
            configJson: (r.configJson && typeof r.configJson === "object") ? r.configJson as Record<string, unknown> : null,
            imageData: (r.imageData && typeof r.imageData === "object") ? r.imageData as Record<string, string> : null,
        }));
    } catch { /* ThemeOption 테이블 없으면 무시 */ }

    // 같은 크리에이터의 다른 테마 5개 조회
    type OtherThemeRow = { id: string; title: string; thumbnailUrl: string | null; price: number };
    let otherThemes: OtherThemeRow[] = [];
    try {
        otherThemes = await prisma.$queryRaw<OtherThemeRow[]>`
            SELECT id, title, "thumbnailUrl", price
            FROM "Theme"
            WHERE "creatorId" = ${dbTheme.creatorId}
              AND id != ${dbTheme.id}
              AND status = 'PUBLISHED'
            ORDER BY "createdAt" DESC
            LIMIT 5
        `;
    } catch { /* 무시 */ }

    const now = new Date();
    const created = new Date(dbTheme.createdAt);

    // 날짜만 비교 (시간 무시)
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const createdDate = new Date(created.getFullYear(), created.getMonth(), created.getDate());
    const diffDays = Math.floor((nowDate.getTime() - createdDate.getTime()) / 86400000);

    let publishedLabel: string;
    if (diffDays <= 0) {
        publishedLabel = "오늘";
    } else if (diffDays === 1) {
        publishedLabel = "어제";
    } else {
        const y = created.getFullYear().toString().slice(2);
        const m = String(created.getMonth() + 1).padStart(2, "0");
        const d = String(created.getDate()).padStart(2, "0");
        publishedLabel = `${y}.${m}.${d}`;
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#fff" }}>
            <Header />
            <div className="flex-1 w-full max-w-[1080px] mx-auto px-8 py-10 pb-24">
                {/* 뒤로가기 */}
                <Link
                    href="/store"
                    className="inline-flex items-center gap-1.5 mb-10 group"
                    style={{ fontSize: 12, color: "#aaa", textDecoration: "none" }}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:opacity-70 transition-opacity">
                        <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                    </svg>
                    <span className="group-hover:opacity-70 transition-opacity">스토어</span>
                </Link>

                <ThemeDetailLayout
                    images={dbTheme.thumbnailUrl ? [dbTheme.thumbnailUrl] : []}
                    previews={dbTheme.images ?? []}
                    name={dbTheme.title}
                    tag={dbTheme.price === 0 ? "무료" : undefined}
                    price={dbTheme.price === 0 ? "무료" : `${dbTheme.price.toLocaleString()}원`}
                    priceNum={dbTheme.price}
                    author={dbTheme.creatorNickname ?? dbTheme.creatorName}
                    creatorId={dbTheme.creatorId}
                    description={dbTheme.description ?? ""}
                    category={dbTheme.tags ?? []}
                    stats={{
                        sales: dbTheme.salesCount,
                        createdAt: publishedLabel,
                        likes: 0,
                        rating: 0,
                        reviews: 0,
                    }}
                    dbId={dbTheme.id}
                    isLoggedIn={isLoggedIn}
                    userId={session?.dbId ?? undefined}
                    isOwned={ownedVersionIds.length > 0}
                    ownedVersionIds={ownedVersionIds}
                    versions={versions as { id: string; version: string; kthemeFileUrl: string | null; apkFileUrl: string | null }[]}
                    isSelling={dbTheme.isSelling ?? true}
                />

                {/* 내 테마 기반 목업 미리보기 (configJson 있는 옵션이 있을 때만 표시) */}
                <ThemeMockupPreview options={themeOptions} />

                <ThemeDetailTabs
                    themeId={dbTheme.id}
                    themeName={dbTheme.title}
                    thumbnailUrl={dbTheme.thumbnailUrl}
                    isOwned={ownedVersionIds.length > 0}
                    userId={session?.dbId ?? undefined}
                    contentBlocks={typeof dbTheme.contentBlocks === "string" ? dbTheme.contentBlocks : ""}
                    otherThemes={otherThemes}
                    creatorId={dbTheme.creatorId}
                    creatorName={dbTheme.creatorNickname ?? dbTheme.creatorName}
                />
            </div>
            <Footer />
        </div>
    );
}

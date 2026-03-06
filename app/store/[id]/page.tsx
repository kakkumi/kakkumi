import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ThemeDetailLayout from "./ThemeDetailLayout";
import ThemeDetailTabs from "./ThemeDetailTabs";

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
    };

    let dbTheme: DbThemeRow | null = null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
        const rows = await prisma.$queryRaw<DbThemeRow[]>`
            SELECT
                t.id, t.title, t.description, t.price,
                t."thumbnailUrl", t.images, t.tags, t."createdAt",
                t."creatorId",
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

    // 보유 여부 확인
    let isOwned = false;
    if (session?.dbId) {
        const purchase = await prisma.purchase.findFirst({
            where: { buyerId: session.dbId, themeId: id, status: "COMPLETED" },
        });
        isOwned = !!purchase;
    }

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
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}
        >
            <Header />

            <div className="flex-1 w-full max-w-[1100px] mx-auto px-6 py-10 pb-24">
                {/* 뒤로가기 */}
                <Link
                    href="/store"
                    className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-400 hover:text-gray-800 transition-colors mb-10"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                    스토어로 돌아가기
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
                    isOwned={isOwned}
                />

                <ThemeDetailTabs
                    themeId={dbTheme.id}
                    themeName={dbTheme.title}
                    thumbnailUrl={dbTheme.thumbnailUrl}
                    isOwned={isOwned}
                    userId={session?.dbId ?? undefined}
                />
            </div>
            <Footer />
        </div>
    );
}

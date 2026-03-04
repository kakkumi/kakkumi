import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ThemeDetailLayout from "./ThemeDetailLayout";

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
                u.nickname AS "creatorNickname", u.name AS "creatorName",
                COUNT(DISTINCT p.id)::int AS "salesCount"
            FROM "Theme" t
            JOIN "User" u ON t."creatorId" = u.id
            LEFT JOIN "Purchase" p ON p."themeId" = t.id AND p.status = 'COMPLETED'
            WHERE t.id = ${id} AND t.status = 'PUBLISHED'
            GROUP BY t.id, u.nickname, u.name
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

    const daysSince = Math.floor((Date.now() - new Date(dbTheme.createdAt).getTime()) / 86400000);

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
                    description={dbTheme.description ?? ""}
                    category={dbTheme.tags ?? []}
                    stats={{
                        sales: dbTheme.salesCount,
                        createdAt: daysSince,
                        likes: 0,
                        rating: 0,
                        reviews: 0,
                    }}
                    dbId={dbTheme.id}
                    isLoggedIn={isLoggedIn}
                    userId={session?.dbId ?? undefined}
                    isOwned={isOwned}
                />

                {/* 하단 탭 영역 */}
                <div className="mt-20 border-t border-gray-100 pt-10">
                    <div className="flex items-center gap-6 mb-8">
                        <button className="pb-3 border-b-2 border-gray-900 font-bold text-[15px] text-gray-900">상세 이미지</button>
                        <button className="pb-3 border-b-2 border-transparent text-gray-400 font-medium text-[15px] hover:text-gray-700 transition-colors">리뷰 (0)</button>
                        <button className="pb-3 border-b-2 border-transparent text-gray-400 font-medium text-[15px] hover:text-gray-700 transition-colors">제작자 다른 테마</button>
                    </div>

                    <div className="bg-white rounded-2xl p-10 min-h-[360px] flex items-center justify-center border border-gray-100">
                        <div className="text-center">
                            <p className="text-[14px] text-gray-400">테마 상세 소개 이미지가 들어갈 영역입니다.</p>
                            <p className="text-[13px] text-gray-300 mt-1">스크린샷, 적용 예시 등 다양한 이미지를 확인하세요.</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

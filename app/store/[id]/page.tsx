import { THEMES } from "../data";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ThemeActionButtons from "./ThemeActionButtons";

export function generateStaticParams() {
    return THEMES.map((theme) => ({
        id: theme.id.toString(),
    }));
}

export default async function ThemeDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const theme = THEMES.find((t) => t.id === Number(params.id));

    if (!theme) {
        return notFound();
    }

    const session = await getServerSession();
    const isLoggedIn = !!session?.dbId;

    // 보유 여부 확인
    let isOwned = false;
    if (session?.dbId && theme.dbId) {
        const purchase = await prisma.purchase.findFirst({
            where: { buyerId: session.dbId, themeId: theme.dbId, status: "COMPLETED" },
        });
        isOwned = !!purchase;
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

                <div className="grid grid-cols-1 lg:grid-cols-[580px_1fr] gap-16">
                    {/* 왼쪽: 메인 이미지 */}
                    <div
                        className="rounded-[28px] overflow-hidden relative bg-gray-100"
                        style={{ width: "580px", height: "580px", boxShadow: "0 8px 40px rgba(0,0,0,0.10)", border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <Image
                            src={theme.images && theme.images.length > 0 ? theme.images[0] : "/back.jpg"}
                            alt={theme.name}
                            fill
                            className="object-cover"
                        />
                        {theme.tag && (
                            <span
                                className="absolute top-5 left-5 text-[12px] font-bold px-3 py-1 rounded-full backdrop-blur-md"
                                style={{
                                    background: theme.tag === "무료" ? "rgba(255, 239, 154, 0.92)" : "rgba(170, 189, 232, 0.92)",
                                    color: "#1c1c1e",
                                }}
                            >
                                {theme.tag}
                            </span>
                        )}
                    </div>

                    {/* 오른쪽: 상세 정보 */}
                    <div className="flex flex-col justify-between py-2">
                        {/* 상단 고정 영역 */}
                        <div>
                            {/* 제목 영역 */}
                            <div className="mb-6">
                                <div className="flex items-start justify-between gap-4 mt-1">
                                    <h1 className="text-[28px] font-extrabold leading-tight text-gray-900" style={{ fontFamily: "'ChosunIlboMyungjo', serif" }}>
                                        {theme.name}
                                    </h1>
                                    <div className="flex flex-col items-end shrink-0 pt-1">
                                        <span className="text-[28px] font-bold text-gray-900">{theme.price}</span>
                                        {theme.priceNum > 0 && theme.priceNum < 2000 && (
                                            <p className="text-[12px] text-red-400 font-medium mt-0.5">✨ 출시 기념 할인 중</p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[14px] text-gray-400 mt-2">
                                    by <span className="text-gray-600 font-semibold">{theme.author}</span>
                                </p>
                            </div>

                            {/* 카테고리 태그 */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {theme.category && theme.category.map((cat) => (
                                    <span
                                        key={cat}
                                        className="text-[12px] font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-default"
                                    >
                                        # {cat}
                                    </span>
                                ))}
                            </div>

                            {/* 미니 미리보기 이미지 5개 */}
                            <div className="grid grid-cols-5 gap-2">
                                {(theme.previews ?? ["/back.jpg", "/back.jpg", "/back.jpg", "/back.jpg", "/back.jpg"]).map((src, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-[10px] overflow-hidden relative bg-gray-100 cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-blue-400 transition-all"
                                        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                                    >
                                        <Image src={src} alt={`preview-${i + 1}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 하단 올라오는 영역 */}
                        <div className="flex flex-col gap-6">
                            {/* 설명 */}
                            <p className="text-[15px] leading-relaxed text-gray-500">
                                {theme.description || "이 테마는 작가가 정성스럽게 제작한 카카오톡 테마입니다.\n당신의 일상 대화를 더욱 특별하게 만들어보세요."}
                            </p>

                            {/* 통계 + 평점 */}
                            <div className="flex items-center gap-12">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Sales</span>
                                    <span className="text-[16px] font-bold text-gray-800">{theme.sales.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Published</span>
                                    <span className="text-[16px] font-bold text-gray-800">{theme.createdAt}일 전</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Likes</span>
                                    <span className="text-[16px] font-bold text-gray-800">{theme.likes}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Rating</span>
                                    <div className="flex items-center gap-1">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                        <span className="text-[16px] font-bold text-gray-800">{theme.rating}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Reviews</span>
                                    <span className="text-[16px] font-bold text-gray-800 underline cursor-pointer hover:text-blue-500">{theme.reviews.toLocaleString()}개</span>
                                </div>
                            </div>

                            {/* 액션 버튼 */}
                            <ThemeActionButtons
                                themeId={theme.dbId}
                                themeMockId={theme.id}
                                priceNum={theme.priceNum}
                                priceName={theme.price}
                                isLoggedIn={isLoggedIn}
                                userId={session?.dbId ?? undefined}
                                isOwned={isOwned}
                            />
                        </div>
                    </div>
                </div>

                {/* 하단 탭 영역 */}
                <div className="mt-20 border-t border-gray-100 pt-10">
                    <div className="flex items-center gap-6 mb-8">
                        <button className="pb-3 border-b-2 border-gray-900 font-bold text-[15px] text-gray-900">상세 이미지</button>
                        <button className="pb-3 border-b-2 border-transparent text-gray-400 font-medium text-[15px] hover:text-gray-700 transition-colors">리뷰 ({theme.reviews})</button>
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

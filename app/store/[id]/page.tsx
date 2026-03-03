import { THEMES } from "../data";
import Header from "../../components/Header";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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

            <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-10 pb-20">
                {/* 뒤로가기 버튼 */}
                <Link
                    href="/store"
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                    스토어로 돌아가기
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* 왼쪽: 이미지 갤러리 */}
                    <div className="flex flex-col gap-4">
                        <div
                            className="aspect-square rounded-[32px] overflow-hidden shadow-2xl relative flex items-center justify-center bg-gray-100"
                            style={{
                                border: "1px solid rgba(0,0,0,0.05)",
                            }}
                        >
                            {/* 대표 이미지 (현재 임시 이미지 사용) */}
                            <Image
                                src={theme.images && theme.images.length > 0 ? theme.images[0] : "/back.jpg"}
                                alt={theme.name}
                                fill
                                className="object-cover"
                            />
                            {theme.tag && (
                                <span
                                    className="absolute top-6 left-6 text-[12px] font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-md"
                                    style={{
                                        background: theme.tag === "무료" ? "rgba(255, 239, 154, 0.9)" : "rgba(170, 189, 232, 0.9)",
                                        color: "#1c1c1e",
                                    }}
                                >
                                    {theme.tag}
                                </span>
                            )}
                        </div>
                        {/* 썸네일 리스트 (예시) */}
                        <div className="grid grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer opacity-70 hover:opacity-100 transition-all border border-transparent hover:border-blue-500">
                                    <div className="w-full h-full bg-gray-200" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 오른쪽: 상세 정보 */}
                    <div className="flex flex-col h-full">
                        <div className="flex flex-col gap-2 mb-6">
                            <span className="text-[14px] font-bold tracking-wider text-blue-600 uppercase">THEME</span>
                            <h1 className="text-[42px] font-extrabold leading-tight text-gray-900" style={{ fontFamily: "'ChosunIlboMyungjo', serif" }}>
                                {theme.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[16px] text-gray-500">Created by</span>
                                <span className="text-[16px] font-semibold text-gray-900">{theme.author}</span>
                            </div>
                        </div>

                        {/* 가격 및 평점 */}
                        <div className="flex items-end justify-between pb-8 border-b border-gray-200 mb-8">
                            <div className="flex flex-col">
                                <span className="text-[32px] font-bold text-gray-900">{theme.price}</span>
                                {theme.priceNum > 0 && theme.priceNum < 2000 && (
                                    <span className="text-[13px] text-red-500 font-medium">✨ 출시 기념 할인 중</span>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                    <span className="text-[20px] font-bold text-gray-900">{theme.rating}</span>
                                    <span className="text-[14px] text-gray-500">/ 5.0</span>
                                </div>
                                <span className="text-[13px] text-gray-500 underline cursor-pointer hover:text-blue-600">
                                    {theme.reviews.toLocaleString()}개의 리뷰 보기
                                </span>
                            </div>
                        </div>

                        {/* 설명 */}
                        <div className="flex-1 mb-8">
                            <h3 className="text-[16px] font-bold text-gray-900 mb-3">테마 소개</h3>
                            <p className="text-[16px] leading-relaxed text-gray-600 whitespace-pre-wrap">
                                {theme.description || "이 테마는 작가가 정성스럽게 제작한 카카오톡 테마입니다. \n당신의 일상 대화를 더욱 특별하게 만들어보세요."}
                            </p>

                            <div className="flex gap-8 mt-8">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[12px] text-gray-400 font-medium uppercase">Total Sales</span>
                                    <span className="text-[18px] font-bold text-gray-900">{theme.sales.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[12px] text-gray-400 font-medium uppercase">Published</span>
                                    <span className="text-[18px] font-bold text-gray-900">{theme.createdAt}일 전</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[12px] text-gray-400 font-medium uppercase">Likes</span>
                                    <span className="text-[18px] font-bold text-gray-900">{theme.likes}</span>
                                </div>
                            </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-4 mt-auto">
                            <button
                                className="flex-1 py-4 rounded-xl text-[16px] font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all active:scale-[0.98]"
                                style={{ background: "#4A7BF7" }}
                            >
                                {theme.priceNum === 0 ? "무료 다운로드" : "구매하기"}
                            </button>
                            <button
                                className="w-16 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all active:scale-[0.98]"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 하단 상세 탭 영역 (추가 정보) */}
                <div className="mt-20 pt-10 border-t border-gray-200">
                    <div className="flex items-center gap-8 mb-8 border-b border-gray-200 pb-1">
                        <button className="pb-4 border-b-2 border-black font-bold text-[16px]">상세 이미지</button>
                        <button className="pb-4 border-b-2 border-transparent text-gray-500 font-medium text-[16px] hover:text-gray-900">리뷰 ({theme.reviews})</button>
                        <button className="pb-4 border-b-2 border-transparent text-gray-500 font-medium text-[16px] hover:text-gray-900">제작자 다른 테마</button>
                    </div>

                    <div className="bg-white rounded-3xl p-10 min-h-[400px] flex items-center justify-center border border-gray-100 shadow-sm">
                        <div className="text-center text-gray-400">
                            <p className="text-[15px]">테마 상세 소개 이미지가 들어갈 영역입니다.</p>
                            <p className="text-[13px] mt-2">스크린샷, 적용 예시 등 다양한 이미지를 확인하세요.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

const THEMES = [
    { id: 1, name: "봄 벚꽃", author: "카꾸미", price: "1,200원", priceNum: 1200, tag: "", sales: 842, createdAt: 3, likes: 312, reviews: 98, rating: 4.8 },
    { id: 2, name: "다크 미니멀", author: "카꾸미", price: "1,500원", priceNum: 1500, tag: "신규", sales: 231, createdAt: 1, likes: 87, reviews: 34, rating: 4.2 },
    { id: 3, name: "오션 블루", author: "카꾸미", price: "1,000원", priceNum: 1000, tag: "", sales: 654, createdAt: 5, likes: 245, reviews: 76, rating: 4.6 },
    { id: 4, name: "선셋 오렌지", author: "카꾸미", price: "1,200원", priceNum: 1200, tag: "", sales: 318, createdAt: 7, likes: 103, reviews: 41, rating: 4.3 },
    { id: 5, name: "민트 그린", author: "카꾸미", price: "무료", priceNum: 0, tag: "무료", sales: 1204, createdAt: 10, likes: 521, reviews: 203, rating: 4.9 },
    { id: 6, name: "라벤더 드림", author: "카꾸미", price: "1,000원", priceNum: 1000, tag: "", sales: 402, createdAt: 8, likes: 178, reviews: 55, rating: 4.5 },
    { id: 7, name: "로즈 골드", author: "카꾸미", price: "1,500원", priceNum: 1500, tag: "", sales: 573, createdAt: 6, likes: 299, reviews: 88, rating: 4.7 },
    { id: 8, name: "네온 퍼플", author: "카꾸미", price: "1,200원", priceNum: 1200, tag: "신규", sales: 89, createdAt: 2, likes: 44, reviews: 12, rating: 4.1 },
    { id: 9, name: "파스텔 옐로우", author: "카꾸미", price: "무료", priceNum: 0, tag: "무료", sales: 987, createdAt: 9, likes: 410, reviews: 167, rating: 4.7 },
];

const SIDEBAR_MENUS = [
    {
        category: "카테고리",
        items: ["전체", "인기", "신규", "무료", "다크", "밝은 계열"],
    },
    {
        category: "가격",
        items: ["전체", "무료", "500원", "1,000원", "1,500원", "2,000원"],
    },
];

const SORT_OPTIONS = [
    { key: "newest", label: "최신순" },
    { key: "priceAsc", label: "낮은 가격순" },
    { key: "priceDesc", label: "높은 가격순" },
    { key: "sales", label: "판매량순" },
    { key: "likes", label: "찜 많은 순" },
    { key: "rating", label: "평점 높은 순" },
    { key: "reviewCount", label: "리뷰 많은 순" },
];

type SortKey = "priceAsc" | "priceDesc" | "sales" | "newest" | "likes" | "rating" | "reviewCount";

export default function StoreContent() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState("전체");
    const [activePrice, setActivePrice] = useState("전체");
    const [activeSort, setActiveSort] = useState<SortKey>("newest");
    const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

    const toggleLike = (id: number) => {
        setLikedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const filtered = THEMES.filter((t) => {
        const catMatch =
            activeCategory === "전체" ||
            activeCategory === "인기" && t.tag === "인기" ||
            activeCategory === "신규" && t.tag === "신규" ||
            activeCategory === "무료" && t.tag === "무료" ||
            activeCategory === "다크" && t.name.includes("다크") ||
            activeCategory === "밝은 계열" && t.priceNum < 1500;

        const priceMatch =
            activePrice === "전체" ||
            activePrice === "무료" && t.priceNum === 0 ||
            activePrice === "500원" && t.priceNum <= 500 ||
            activePrice === "1,000원" && t.priceNum <= 1000 ||
            activePrice === "1,500원" && t.priceNum <= 1500 ||
            activePrice === "2,000원" && t.priceNum <= 2000;

        return catMatch && priceMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (activeSort === "priceAsc") return a.priceNum - b.priceNum;
        if (activeSort === "priceDesc") return b.priceNum - a.priceNum;
        if (activeSort === "sales") return b.sales - a.sales;
        if (activeSort === "newest") return a.createdAt - b.createdAt;
        if (activeSort === "likes") return b.likes - a.likes;
        if (activeSort === "rating") return b.rating - a.rating;
        if (activeSort === "reviewCount") return b.reviews - a.reviews;
        return 0;
    });

    return (
        <div className="flex flex-1 w-full px-6 pt-12 pb-20 gap-8" style={{ maxWidth: 1400, margin: "0 auto" }}>

            {/* ── 사이드바 ── */}
            <aside className="w-[180px] shrink-0 flex flex-col gap-1">
                {SIDEBAR_MENUS.map((group, index) => (
                    <div key={group.category} className="flex flex-col gap-0.5">
                        <span
                            className="text-[11px] font-bold tracking-[0.15em] uppercase px-3 mb-1"
                            style={{ color: "#8e8e93" }}
                        >
                            {group.category}
                        </span>
                        {group.items.map((item) => {
                            const isActive =
                                group.category === "카테고리" ? activeCategory === item : activePrice === item;
                            return (
                                <button
                                    key={item}
                                    onClick={() =>
                                        group.category === "카테고리"
                                            ? setActiveCategory(item)
                                            : setActivePrice(item)
                                    }
                                    className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                                    style={{
                                        color: isActive ? "#FF9500" : "#3a3a3c",
                                        fontWeight: isActive ? 700 : 500,
                                    }}
                                >
                                    {item}
                                </button>
                            );
                        })}
                        {index < SIDEBAR_MENUS.length - 1 && (
                            <div className="my-3 h-[1px]" style={{ background: "rgba(0,0,0,0.18)" }} />
                        )}
                    </div>
                ))}
            </aside>

            {/* ── 메인 콘텐츠 ── */}
            <main className="flex-1 flex flex-col gap-5">
                {/* 헤더 텍스트 */}
                <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-bold tracking-[0.2em] text-black/40 uppercase">테마 스토어</span>
                        <h1 className="text-[28px] font-extrabold leading-tight" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                            마음에 드는 테마를 골라보세요
                        </h1>
                        <p className="text-[13px]" style={{ color: "#8e8e93" }}>카꾸미에서 만든 다양한 카카오톡 테마를 바로 적용해보세요.</p>
                    </div>
                    <button
                        onClick={() => router.push("/store/register")}
                        className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium transition-all active:scale-95 hover:opacity-80 shrink-0"
                        style={{ border: "2px solid #e11d48", color: "#e11d48", borderRadius: 8 }}
                    >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        테마 등록하기
                    </button>
                </div>

                {/* 정렬 옵션 */}
                <div className="flex gap-2 flex-wrap">
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.key}
                            onClick={() => setActiveSort(opt.key as SortKey)}
                            className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all"
                            style={{
                                background: activeSort === opt.key ? "#1c1c1e" : "rgba(0,0,0,0.05)",
                                color: activeSort === opt.key ? "#fff" : "#3a3a3c",
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                    <span className="ml-auto text-[12px] self-center" style={{ color: "#8e8e93" }}>
                        {sorted.length}개
                    </span>
                </div>

                {/* 테마 그리드 — 4열 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sorted.map((theme) => (
                        <div
                            key={theme.id}
                            className="flex flex-col rounded-[20px] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                            style={{
                                background: "rgba(255,255,255,0.5)",
                                border: "1px solid rgba(255,255,255,0.8)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                                backdropFilter: "blur(20px)",
                            }}
                        >
                            {/* 미리보기 */}
                            <div
                                className="relative aspect-square flex items-center justify-center"
                                style={{ background: "rgba(0,0,0,0.06)" }}
                            >
                                {theme.tag && (
                                    <span
                                        className="absolute top-2.5 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{
                                            background: theme.tag === "무료" ? "#FFEF9A" : "#aabde8",
                                            color: "#1c1c1e",
                                        }}
                                    >
                                        {theme.tag}
                                    </span>
                                )}
                                {/* 하트 버튼 */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleLike(theme.id); }}
                                    className="absolute top-2.5 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                                    style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill={likedIds.has(theme.id) ? "#ff3b30" : "none"} stroke={likedIds.has(theme.id) ? "#ff3b30" : "rgba(255,255,255,0.95)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            </div>

                            {/* 정보 */}
                            <div className="flex flex-col gap-2.5 p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-0.5">
                                        <h3 className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>{theme.name}</h3>
                                        <span className="text-[12px]" style={{ color: "#3f3f45" }}>by {theme.author}</span>
                                    </div>
                                    <span className="text-[14px] font-medium" style={{ color: "#1c1c1e" }}>
                                        {theme.price}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="flex items-center gap-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                        </svg>
                                        <span className="text-[12px] font-semibold" style={{ color: "#1c1c1e" }}>{theme.rating.toFixed(1)}</span>
                                    </div>
                                    <span className="text-[12px]" style={{ color: "#b0b0b5" }}>·</span>
                                    <span className="text-[12px]" style={{ color: "#3a3a3c" }}>리뷰 {theme.reviews.toLocaleString()}개</span>
                                    <span className="text-[12px]" style={{ color: "#b0b0b5" }}>·</span>
                                    <div className="flex items-center gap-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/>
                                        </svg>
                                        <span className="text-[12px]" style={{ color: "#3a3a3c" }}>{theme.sales.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

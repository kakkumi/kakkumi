'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { THEMES, THEME_COLORS } from "./data";

const SIDEBAR_MENUS = [
    {
        category: "카테고리",
        items: ["전체", "인기", "파스텔", "귀여운", "다크", "밝은", "감성"],
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
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState<"전체" | "테마명" | "제작자" | "카테고리">("전체");
    const [ownedDbIds, setOwnedDbIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch("/api/mypage/owned")
            .then((r) => r.json())
            .then((d: { ownedIds: string[] }) => setOwnedDbIds(new Set(d.ownedIds)))
            .catch(() => {});
    }, []);

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

        const q = searchQuery.trim().toLowerCase();
        const searchMatch =
            q === "" ||
            (searchType === "전체" && (
                t.name.toLowerCase().includes(q) ||
                t.author.toLowerCase().includes(q) ||
                (t.category ?? []).some((c) => c.toLowerCase().includes(q)) ||
                (t.description ?? "").toLowerCase().includes(q)
            )) ||
            (searchType === "테마명" && t.name.toLowerCase().includes(q)) ||
            (searchType === "제작자" && t.author.toLowerCase().includes(q)) ||
            (searchType === "카테고리" && (t.category ?? []).some((c) => c.toLowerCase().includes(q)));

        return catMatch && priceMatch && searchMatch;
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
        <div className="flex w-full" style={{ maxWidth: 1400, margin: "0 auto" }}>

            {/* ── 사이드바 ── */}
            <aside className="fixed w-[180px] flex flex-col gap-1 px-6 pt-12">
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
            <main className="flex-1 flex flex-col gap-5 px-6 pt-12 pb-20" style={{ marginLeft: 180 }}>
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

                {/* 검색바 */}
                <div
                    className="flex items-center p-1 gap-1.5"
                    style={{
                        background: "#dde4ee",
                        borderRadius: 999,
                        maxWidth: 480,
                    }}
                >
                    {/* 검색 타입 선택 */}
                    <div className="relative shrink-0">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as typeof searchType)}
                            className="appearance-none pl-3 pr-7 text-[12px] font-bold outline-none cursor-pointer"
                            style={{
                                background: "transparent",
                                color: "#1c1c1e",
                                border: "none",
                                height: 34,
                            }}
                        >
                            {(["전체", "테마명", "제작자", "카테고리"] as const).map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <svg
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke="#1c1c1e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>

                    {/* 구분선 */}
                    <div className="w-[1px] h-4 shrink-0" style={{ background: "rgba(0,0,0,0.15)" }} />

                    <div
                        className="flex-1 flex items-center px-3"
                        style={{
                            background: "#fff",
                            borderRadius: 999,
                            height: 34,
                        }}
                    >
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={
                                searchType === "테마명" ? "테마 이름을 검색하세요" :
                                searchType === "제작자" ? "제작자 이름을 검색하세요" :
                                searchType === "카테고리" ? "카테고리를 검색하세요" :
                                "테마명, 제작자, 카테고리 검색"
                            }
                            className="flex-1 text-[13px] outline-none bg-transparent"
                            style={{ color: "#1c1c1e" }}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="mr-1 shrink-0 flex items-center justify-center w-5 h-5 rounded-full transition-all hover:opacity-70"
                                style={{ background: "rgba(0,0,0,0.1)" }}
                            >
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        )}
                    </div>
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
                            onClick={() => router.push(`/store/${theme.id}`)}
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
                                style={{ background: THEME_COLORS[theme.id]?.main ?? "rgba(0,0,0,0.06)" }}
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
                                {ownedDbIds.has(theme.dbId) && (
                                    <span
                                        className="absolute top-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{
                                            background: "rgba(52,199,89,0.9)",
                                            color: "#fff",
                                            left: theme.tag ? "calc(0.75rem + 3rem)" : "0.75rem",
                                        }}
                                    >
                                        보유중
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

            {/* ── 페이지업 버튼 ── */}
            <button
                onClick={() => document.getElementById("store-scroll")?.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-8 right-8 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ background: "rgba(28,28,30,0.3)", backdropFilter: "blur(10px)", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 15l-6-6-6 6"/>
                    </svg>
            </button>
        </div>
    );
}

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// data.ts의 THEME_COLORS는 시드 데이터용 색상이므로 DB 테마엔 플레이스홀더 사용
import { THEME_COLORS } from "./data";

const SIDEBAR_MENUS = [
    {
        category: "플랫폼",
        items: ["전체", "iOS", "Android"],
    },
    {
        category: "카테고리",
        items: ["전체", "인기", "파스텔", "귀여운", "다크", "밝은", "감성"],
    },
    {
        category: "가격",
        items: ["전체", "무료", "500원", "1,000원", "1,500원", "2,000원", "2,500원"],
    },
];

const SORT_OPTIONS = [
    { key: "newest",      label: "최신순" },
    { key: "priceAsc",    label: "낮은 가격순" },
    { key: "priceDesc",   label: "높은 가격순" },
    { key: "sales",       label: "판매량순" },
    { key: "likes",       label: "찜 많은 순" },
    { key: "rating",      label: "평점 높은 순" },
    { key: "reviews",     label: "리뷰 많은 순" },
];

type SortKey = "priceAsc" | "priceDesc" | "sales" | "newest" | "likes" | "rating" | "reviews";

type DbTheme = {
    id: string;
    title: string;
    description: string | null;
    price: number;
    thumbnailUrl: string | null;
    images: string[];
    tags: string[];
    createdAt: string;
    creatorId: string;
    creatorNickname: string | null;
    creatorName: string;
    salesCount: number;
    likeCount: number;
    reviewCount: number;
    avgRating: number;
};

// 시드 데이터용 숫자 id 테마 타입
type LegacyTheme = {
    id: number;
    dbId: string;
    name: string;
    author: string;
    price: string;
    priceNum: number;
    tag: string;
    category: string[];
    sales: number;
    createdAt: number;
    likes: number;
    reviews: number;
    rating: number;
    description: string;
};

// DB 테마를 통합 타입으로 변환
type UnifiedTheme = {
    key: string;
    name: string;
    author: string;
    creatorId: string;
    price: string;
    priceNum: number;
    tag: string;
    category: string[];
    sales: number;
    createdAt: number;
    likes: number;
    rating: number;
    reviews: number;
    thumbnailUrl: string | null;
    description: string;
    isLegacy: boolean;
    legacyId?: number;
};

function dbThemeToUnified(t: DbTheme): UnifiedTheme {
    const daysSince = Math.floor((Date.now() - new Date(t.createdAt).getTime()) / 86400000);
    return {
        key: t.id,
        name: t.title,
        author: t.creatorNickname ?? t.creatorName,
        creatorId: t.creatorId,
        price: t.price === 0 ? "무료" : `${t.price.toLocaleString()}원`,
        priceNum: t.price,
        tag: t.price === 0 ? "무료" : "",
        category: t.tags,
        sales: t.salesCount,
        createdAt: daysSince,
        likes: t.likeCount ?? 0,
        rating: Number(t.avgRating ?? 0),
        reviews: t.reviewCount ?? 0,
        thumbnailUrl: t.thumbnailUrl,
        description: t.description ?? "",
        isLegacy: false,
    };
}

const PLACEHOLDER_GRADIENTS = [
    "linear-gradient(135deg,#e0c3fc,#9d4edd)",
    "linear-gradient(135deg,#90e0ef,#0077b6)",
    "linear-gradient(135deg,#ffcb77,#f83600)",
    "linear-gradient(135deg,#b7e4c7,#1b4332)",
    "linear-gradient(135deg,#ffd6e7,#ff8fab)",
];

export default function StoreContent() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState("전체");
    const [activePlatform, setActivePlatform] = useState("전체");
    const [activePrice, setActivePrice]       = useState("전체");
    const [activeSort, setActiveSort]         = useState<SortKey>("newest");
    const [likedIds, setLikedIds]             = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery]       = useState("");
    const [searchType, setSearchType]         = useState<"전체" | "테마명" | "제작자" | "카테고리">("전체");
    const [ownedIds, setOwnedIds]             = useState<Set<string>>(new Set());
    const [dbThemes, setDbThemes]             = useState<UnifiedTheme[]>([]);
    const [loading, setLoading]               = useState(true);
    const [currentPage, setCurrentPage]       = useState(1);
    const PAGE_SIZE = 36; // 4 × 9

    // DB에서 PUBLISHED 테마 불러오기
    useEffect(() => {
        fetch("/api/themes")
            .then(r => r.json())
            .then((d: { themes: DbTheme[] }) => {
                setDbThemes((d.themes ?? []).map(dbThemeToUnified));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // 보유 테마 불러오기
    useEffect(() => {
        fetch("/api/mypage/owned")
            .then(r => r.json())
            .then((d: { ownedIds: string[] }) => setOwnedIds(new Set(d.ownedIds)))
            .catch(() => {});
    }, []);

    // 좋아요한 테마 초기 로드
    useEffect(() => {
        fetch("/api/themes/liked")
            .then(r => r.json())
            .then((d: { likedIds: string[] }) => setLikedIds(new Set(d.likedIds ?? [])))
            .catch(() => {});
    }, []);

    const toggleLike = async (key: string) => {
        // 낙관적 업데이트
        setLikedIds(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
        setDbThemes(prev => prev.map(t =>
            t.key === key ? { ...t, likes: likedIds.has(key) ? t.likes - 1 : t.likes + 1 } : t
        ));
        try {
            await fetch(`/api/themes/${key}/like`, { method: "POST" });
        } catch {
            // 실패 시 롤백
            setLikedIds(prev => {
                const next = new Set(prev);
                next.has(key) ? next.delete(key) : next.add(key);
                return next;
            });
        }
    };

    const themes = dbThemes;

    const filtered = themes.filter(t => {
        const platformMatch =
            activePlatform === "전체" ||
            t.category.some(c => c.toLowerCase().includes(activePlatform.toLowerCase()));

        const catMatch =
            activeCategory === "전체" ||
            (activeCategory === "인기" && t.sales > 100) ||
            t.category.some(c => c.includes(activeCategory));

        const priceMatch =
            activePrice === "전체" ||
            (activePrice === "무료"    && t.priceNum === 0) ||
            (activePrice === "500원"   && t.priceNum <= 500) ||
            (activePrice === "1,000원" && t.priceNum <= 1000) ||
            (activePrice === "1,500원" && t.priceNum <= 1500) ||
            (activePrice === "2,000원" && t.priceNum <= 2000) ||
            (activePrice === "2,500원" && t.priceNum <= 2500);

        const q = searchQuery.trim().toLowerCase();
        const searchMatch =
            q === "" ||
            (searchType === "전체" && (
                t.name.toLowerCase().includes(q) ||
                t.author.toLowerCase().includes(q) ||
                t.category.some(c => c.toLowerCase().includes(q)) ||
                t.description.toLowerCase().includes(q)
            )) ||
            (searchType === "테마명"   && t.name.toLowerCase().includes(q)) ||
            (searchType === "제작자"   && t.author.toLowerCase().includes(q)) ||
            (searchType === "카테고리" && t.category.some(c => c.toLowerCase().includes(q)));

        return platformMatch && catMatch && priceMatch && searchMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (activeSort === "priceAsc")  return a.priceNum - b.priceNum;
        if (activeSort === "priceDesc") return b.priceNum - a.priceNum;
        if (activeSort === "sales")     return b.sales - a.sales;
        if (activeSort === "newest")    return a.createdAt - b.createdAt;
        if (activeSort === "likes")     return b.likes - a.likes;
        if (activeSort === "rating")    return b.rating - a.rating;
        if (activeSort === "reviews")   return b.reviews - a.reviews;
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // 필터·정렬·검색 바뀌면 1페이지로 리셋
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setCurrentPage(1); }, [activeCategory, activePlatform, activePrice, activeSort, searchQuery, searchType]);

    return (
        <div className="flex w-full" style={{ maxWidth: 1400, margin: "0 auto" }}>

            {/* ── 사이드바 ── */}
            <aside className="fixed w-[180px] flex flex-col gap-1 px-6 pt-12">
                {SIDEBAR_MENUS.map((group, index) => (
                    <div key={group.category} className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold tracking-[0.15em] uppercase px-3 mb-1" style={{ color: "#8e8e93" }}>
                            {group.category}
                        </span>
                        {group.items.map(item => {
                            const isActive =
                                group.category === "플랫폼" ? activePlatform === item :
                                group.category === "카테고리" ? activeCategory === item :
                                activePrice === item;
                            return (
                                <button
                                    key={item}
                                    onClick={() =>
                                        group.category === "플랫폼" ? setActivePlatform(item) :
                                        group.category === "카테고리" ? setActiveCategory(item) :
                                        setActivePrice(item)
                                    }
                                    className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                                    style={{ color: isActive ? "#FF9500" : "#3a3a3c", fontWeight: isActive ? 700 : 500 }}
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
                {/* 헤더 */}
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
                <div className="flex items-center p-1 gap-1.5" style={{ background: "#dde4ee", borderRadius: 999, maxWidth: 480 }}>
                    <div className="relative shrink-0">
                        <select
                            value={searchType}
                            onChange={e => setSearchType(e.target.value as typeof searchType)}
                            className="appearance-none pl-3 pr-7 text-[12px] font-bold outline-none cursor-pointer"
                            style={{ background: "transparent", color: "#1c1c1e", border: "none", height: 34 }}
                        >
                            {(["전체", "테마명", "제작자", "카테고리"] as const).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>
                    <div className="w-[1px] h-4 shrink-0" style={{ background: "rgba(0,0,0,0.15)" }} />
                    <div className="flex-1 flex items-center px-3" style={{ background: "#fff", borderRadius: 999, height: 34 }}>
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
                            <button type="button" onClick={() => setSearchQuery("")}
                                className="mr-1 shrink-0 flex items-center justify-center w-5 h-5 rounded-full transition-all hover:opacity-70"
                                style={{ background: "rgba(0,0,0,0.1)" }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* 정렬 */}
                <div className="flex gap-2 flex-wrap">
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setActiveSort(opt.key as SortKey)}
                            className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all"
                            style={{ background: activeSort === opt.key ? "#1c1c1e" : "rgba(0,0,0,0.05)", color: activeSort === opt.key ? "#fff" : "#3a3a3c" }}
                        >
                            {opt.label}
                        </button>
                    ))}
                    <span className="ml-auto text-[12px] self-center" style={{ color: "#8e8e93" }}>
                        {loading ? "로딩 중..." : `${sorted.length}개`}
                    </span>
                </div>

                {/* 테마 그리드 */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <span className="text-[14px]" style={{ color: "#8e8e93" }}>테마를 불러오는 중...</span>
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>
                        </svg>
                        <p className="text-[14px]" style={{ color: "#8e8e93" }}>조건에 맞는 테마가 없어요.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {paginated.map((theme, idx) => {
                            const legacyColor = theme.legacyId ? THEME_COLORS[theme.legacyId]?.main : null;
                            const bg = legacyColor ?? PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length];
                            return (
                                <div
                                    key={theme.key}
                                    onClick={() => router.push(`/store/${theme.key}`)}
                                    className="flex flex-col rounded-[20px] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                                    style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", backdropFilter: "blur(20px)" }}
                                >
                                    {/* 미리보기 */}
                                    <div className="relative aspect-square flex items-center justify-center overflow-hidden">
                                        {theme.thumbnailUrl ? (
                                            <img src={theme.thumbnailUrl} alt={theme.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full" style={{ background: bg }} />
                                        )}
                                        {theme.tag && (
                                            <span className="absolute top-2.5 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: theme.tag === "무료" ? "#FFEF9A" : "#aabde8", color: "#1c1c1e" }}>
                                                {theme.tag}
                                            </span>
                                        )}
                                        {ownedIds.has(theme.key) && (
                                            <span className="absolute top-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: "rgba(52,199,89,0.9)", color: "#fff", left: theme.tag ? "calc(0.75rem + 3rem)" : "0.75rem" }}>
                                                보유중
                                            </span>
                                        )}
                                        <button
                                            onClick={e => { e.stopPropagation(); toggleLike(theme.key); }}
                                            className="absolute top-2.5 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                                            style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24"
                                                fill={likedIds.has(theme.key) ? "#ff3b30" : "none"}
                                                stroke={likedIds.has(theme.key) ? "#ff3b30" : "rgba(255,255,255,0.95)"}
                                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* 정보 */}
                                    <div className="flex flex-col gap-2 p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex flex-col gap-0.5">
                                                <h3 className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>{theme.name}</h3>
                                                <span
                                                    className="text-[12px] hover:underline cursor-pointer"
                                                    style={{ color: "#3f3f45" }}
                                                    onClick={e => { e.stopPropagation(); router.push(`/creator/${theme.creatorId}`); }}
                                                >by {theme.author}</span>
                                            </div>
                                            <span className="text-[14px] font-medium shrink-0 ml-2" style={{ color: "#1c1c1e" }}>{theme.price}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-[11px] flex-wrap" style={{ color: "#4e4e53" }}>
                                            {/* 다운로드 */}
                                            <span className="flex items-center gap-0.5">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4e4e53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/>
                                                </svg>
                                                {theme.sales.toLocaleString()}
                                            </span>
                                            <span style={{ color: "#d1d1d6" }}>·</span>
                                            {/* 찜 */}
                                            <span className="flex items-center gap-0.5">
                                                <svg width="10" height="10" viewBox="0 0 24 24"
                                                    fill={theme.likes > 0 ? "#ff3b30" : "none"}
                                                    stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                </svg>
                                                <span style={{ color: "#ff3b30" }}>{theme.likes.toLocaleString()}</span>
                                            </span>
                                            <span style={{ color: "#d1d1d6" }}>·</span>
                                            {/* 별점 */}
                                            <span className="flex items-center gap-0.5">
                                                <svg width="10" height="10" viewBox="0 0 24 24"
                                                    fill={theme.rating > 0 ? "#FF9500" : "none"}
                                                    stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                </svg>
                                                <span style={{ color: "#FF9500" }}>
                                                    {theme.rating > 0 ? theme.rating.toFixed(1) : "-"}
                                                </span>
                                            </span>
                                            <span style={{ color: "#d1d1d6" }}>·</span>
                                            {/* 리뷰 수 */}
                                            <span className="flex items-center gap-0.5">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4e4e53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                                </svg>
                                                {theme.reviews.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 페이지네이션 */}
                {!loading && sorted.length > 0 && (
                    <div className="flex items-center justify-center gap-1 pt-4 pb-2">
                        {/* 이전 */}
                        <button
                            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            disabled={currentPage === 1}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70 active:scale-95 disabled:opacity-25"
                            style={{ background: "rgba(0,0,0,0.06)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>

                        {/* 페이지 번호 */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                            .reduce<(number | "...")[]>((acc, p, i, arr) => {
                                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === "..." ? (
                                    <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-[13px]" style={{ color: "#8e8e93" }}>···</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => { setCurrentPage(p as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                        className="w-9 h-9 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80 active:scale-95"
                                        style={{
                                            background: currentPage === p ? "#4c4a4a" : "rgba(0,0,0,0.06)",
                                            color: currentPage === p ? "#fff" : "#3a3a3c",
                                        }}
                                    >
                                        {p}
                                    </button>
                                )
                            )
                        }

                        {/* 다음 */}
                        <button
                            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            disabled={currentPage === totalPages}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70 active:scale-95 disabled:opacity-25"
                            style={{ background: "rgba(0,0,0,0.06)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                    </div>
                )}
            </main>

            {/* 페이지업 버튼 */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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

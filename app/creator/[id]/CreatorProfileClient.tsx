"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoginRequiredModal from "../../components/LoginRequiredModal";

type Theme = {
    id: string;
    title: string;
    price: number;
    thumbnailUrl: string | null;
    tags: string[];
    salesCount: number;
    createdAt: string;
    os: string | null;
    likeCount: number;
    reviewCount: number;
    avgRating: number;
};

type Creator = {
    id: string;
    nickname: string | null;
    name: string;
    avatarUrl: string | null;
    image: string | null;
    role: string;
    createdAt: string;
};

const PLACEHOLDER_GRADIENTS = [
    "linear-gradient(135deg,#e0c3fc,#9d4edd)",
    "linear-gradient(135deg,#90e0ef,#0077b6)",
    "linear-gradient(135deg,#ffcb77,#f83600)",
    "linear-gradient(135deg,#b7e4c7,#1b4332)",
    "linear-gradient(135deg,#ffd6e7,#ff8fab)",
];

export default function CreatorProfileClient({ creatorId }: { creatorId: string }) {
    const router = useRouter();
    const [creator, setCreator] = useState<Creator | null>(null);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [followerCount, setFollowerCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [error, setError] = useState("");
    const [loginModal, setLoginModal] = useState(false);
    const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch(`/api/creator/${creatorId}`)
            .then(r => r.json())
            .then((data: { creator?: Creator; themes?: Theme[]; followerCount?: number; isFollowing?: boolean; error?: string }) => {
                if (data.error) { setError(data.error); return; }
                setCreator(data.creator ?? null);
                setThemes(data.themes ?? []);
                setFollowerCount(data.followerCount ?? 0);
                setIsFollowing(data.isFollowing ?? false);
            })
            .catch(() => setError("크리에이터 정보를 불러올 수 없습니다."))
            .finally(() => setLoading(false));
    }, [creatorId]);

    useEffect(() => {
        fetch("/api/mypage/owned")
            .then(r => r.json())
            .then((d: { ownedIds: string[] }) => setOwnedIds(new Set(d.ownedIds)))
            .catch(() => {});
    }, []);

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            const res = await fetch("/api/follow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ creatorId }),
            });
            if (res.status === 401) {
                setLoginModal(true);
                return;
            }
            const data = await res.json() as { isFollowing?: boolean; error?: string };
            if (data.isFollowing !== undefined) {
                setIsFollowing(data.isFollowing);
                setFollowerCount(prev => data.isFollowing ? prev + 1 : Math.max(0, prev - 1));
            }
        } catch { /* ignore */ } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-40">
                <span className="text-[13px]" style={{ color: "#c7c7cc" }}>불러오는 중...</span>
            </div>
        );
    }

    if (error || !creator) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-3">
                <p className="text-[14px]" style={{ color: "#8e8e93" }}>사용자를 찾을 수 없습니다.</p>
                <button onClick={() => router.back()} className="text-[12px] transition-opacity hover:opacity-50" style={{ color: "#c7c7cc" }}>← 뒤로 가기</button>
            </div>
        );
    }

    const displayName = creator.nickname ?? creator.name;
    const avatarSrc =
        (creator.avatarUrl && !creator.avatarUrl.startsWith("/"))
            ? creator.avatarUrl
            : (creator.role === "CREATOR" || creator.role === "ADMIN" ? "/creator.png" : "/user.png");

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

            {/* 뒤로 가기 */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1 mb-10 transition-opacity hover:opacity-50"
                style={{ color: "#aeaeb2", fontSize: 12 }}
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                뒤로
            </button>

            {/* ── 프로필 섹션 ── */}
            <div className="flex items-center gap-8 mb-10">
                {/* 아바타 */}
                <div className="relative shrink-0 rounded-full overflow-hidden" style={{ width: 88, height: 88, background: "#efefef" }}>
                    <Image src={avatarSrc} alt={displayName} fill className="object-cover" />
                </div>

                {/* 이름 + 뱃지 + 통계 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-3">
                        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>
                            {displayName}
                        </h1>
                        {creator.role === "CREATOR" && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,149,0,0.1)", color: "#FF9500" }}>
                                크리에이터
                            </span>
                        )}
                        {creator.role === "ADMIN" && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,59,48,0.1)", color: "#FF3B30" }}>
                                관리자
                            </span>
                        )}
                    </div>

                    {/* 통계 */}
                    <div className="flex items-center gap-6">
                        <div>
                            <span className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>{themes.length}</span>
                            <span className="text-[12px] ml-1.5" style={{ color: "#aeaeb2" }}>테마</span>
                        </div>
                        <div>
                            <span className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>{followerCount.toLocaleString()}</span>
                            <span className="text-[12px] ml-1.5" style={{ color: "#aeaeb2" }}>팔로워</span>
                        </div>
                        <div>
                            <span className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>
                                {themes.reduce((s, t) => s + t.salesCount, 0).toLocaleString()}
                            </span>
                            <span className="text-[12px] ml-1.5" style={{ color: "#aeaeb2" }}>판매</span>
                        </div>
                    </div>
                </div>

                {/* 팔로우 버튼 */}
                <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className="shrink-0 px-5 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-40"
                    style={{
                        background: isFollowing ? "transparent" : "#1c1c1e",
                        color: isFollowing ? "#3a3a3c" : "#fff",
                        border: isFollowing ? "1.5px solid rgba(0,0,0,0.15)" : "none",
                    }}
                >
                    {isFollowing ? "팔로잉" : "팔로우"}
                </button>
            </div>

            {/* 구분선 */}
            <div style={{ height: 1, background: "rgba(0,0,0,0.07)", marginBottom: 32 }} />

            {/* ── 테마 목록 ── */}
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-6" style={{ color: "#aeaeb2" }}>
                테마 {themes.length}
            </p>

            {themes.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                    <p className="text-[13px]" style={{ color: "#c7c7cc" }}>아직 등록된 테마가 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
                    {themes.map((theme, idx) => (
                        <div
                            key={theme.id}
                            onClick={() => router.push(`/store/${theme.id}`)}
                            className="flex flex-col cursor-pointer group"
                        >
                            {/* 썸네일 */}
                            <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "1/1", background: "#efefef" }}>
                                {theme.thumbnailUrl ? (
                                    <Image
                                        src={theme.thumbnailUrl}
                                        alt={theme.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                                        style={{ background: PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length] }} />
                                )}

                                {/* 배지들 */}
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                                    {theme.os?.includes("ios") && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: "rgba(88,86,214,0.88)", color: "#fff" }}>
                                            iOS
                                        </span>
                                    )}
                                    {theme.os?.includes("android") && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: "rgba(52,199,89,0.88)", color: "#fff" }}>
                                            Android
                                        </span>
                                    )}
                                    {theme.price === 0 && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: "rgba(255,239,154,0.95)", color: "#1c1c1e" }}>
                                            무료
                                        </span>
                                    )}
                                    {ownedIds.has(theme.id) && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: "rgba(52,199,89,0.9)", color: "#fff" }}>
                                            보유중
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* 정보 */}
                            <div className="flex flex-col gap-1 pt-3">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-[13px] font-semibold leading-tight truncate" style={{ color: "#1c1c1e" }}>
                                        {theme.title}
                                    </h3>
                                    <span className="text-[13px] font-semibold shrink-0" style={{ color: theme.price === 0 ? "rgb(74,123,247)" : "#1c1c1e" }}>
                                        {theme.price === 0 ? "무료" : `${theme.price.toLocaleString()}원`}
                                    </span>
                                </div>

                                {/* 통계 */}
                                <div className="flex items-center gap-2 text-[11px] mt-0.5" style={{ color: "#c7c7cc" }}>
                                    {/* 다운로드 */}
                                    <span className="flex items-center gap-0.5">
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/>
                                        </svg>
                                        {theme.salesCount.toLocaleString()}
                                    </span>
                                    <span>·</span>
                                    {/* 좋아요 */}
                                    <span className="flex items-center gap-0.5">
                                        <svg width="9" height="9" viewBox="0 0 24 24"
                                            fill={theme.likeCount > 0 ? "#ff3b30" : "none"}
                                            stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                        <span style={{ color: "#ff3b30" }}>{theme.likeCount.toLocaleString()}</span>
                                    </span>
                                    <span>·</span>
                                    {/* 별점 */}
                                    <span className="flex items-center gap-0.5">
                                        <svg width="9" height="9" viewBox="0 0 24 24"
                                            fill={theme.avgRating > 0 ? "#FF9500" : "none"}
                                            stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                        </svg>
                                        <span style={{ color: "#FF9500" }}>
                                            {theme.avgRating > 0 ? Number(theme.avgRating).toFixed(1) : "-"}
                                        </span>
                                    </span>
                                    <span>·</span>
                                    {/* 리뷰 */}
                                    <span className="flex items-center gap-0.5">
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                        {theme.reviewCount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loginModal && (
                <LoginRequiredModal
                    message="팔로우는 로그인이 필요한 기능이에요."
                    onClose={() => setLoginModal(false)}
                />
            )}
        </div>
    );
}

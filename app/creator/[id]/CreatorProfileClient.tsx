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

    useEffect(() => {
        fetch(`/api/creator/${creatorId}`)
            .then(r => r.json())
            .then((data: { creator?: Creator; themes?: Theme[]; followerCount?: number; isFollowing?: boolean; error?: string }) => {
                if (data.error) {
                    setError(data.error);
                    return;
                }
                setCreator(data.creator ?? null);
                setThemes(data.themes ?? []);
                setFollowerCount(data.followerCount ?? 0);
                setIsFollowing(data.isFollowing ?? false);
            })
            .catch(() => setError("크리에이터 정보를 불러올 수 없습니다."))
            .finally(() => setLoading(false));
    }, [creatorId]);

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
            <div className="min-h-screen flex items-center justify-center">
                <span className="text-[14px]" style={{ color: "#8e8e93" }}>불러오는 중...</span>
            </div>
        );
    }

    if (error || !creator) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <p className="text-[16px]" style={{ color: "#1c1c1e" }}>사용자를 찾을 수 없습니다.</p>
                <button onClick={() => router.back()} className="text-[13px]" style={{ color: "#8e8e93" }}>← 뒤로 가기</button>
            </div>
        );
    }

    const displayName = creator.nickname ?? creator.name;
    // role 기반 아바타: CREATOR/ADMIN → creator.png, USER → avatarUrl(PRO 커스텀) or user.png
    const avatarSrc =
        creator.role === "CREATOR" || creator.role === "ADMIN"
            ? "/creator.png"
            : (creator.avatarUrl ?? creator.image ?? "/user.png");

    return (
        <div className="min-h-screen" style={{ background: "#f3f3f3" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
                {/* 뒤로 가기 */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 mb-8 text-[13px] font-medium transition-opacity hover:opacity-60"
                    style={{ color: "#8e8e93" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    뒤로 가기
                </button>

                {/* 프로필 카드 */}
                <div
                    className="rounded-[24px] p-8 mb-8"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.9)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    }}
                >
                    <div className="flex items-start gap-6">
                        {/* 아바타 */}
                        <div
                            className="relative shrink-0 rounded-full overflow-hidden"
                            style={{ width: 80, height: 80, background: "#e7e5e4" }}
                        >
                            <Image src={avatarSrc} alt={displayName} fill className="object-cover" />
                        </div>

                        {/* 정보 */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e" }}>{displayName}</h1>
                                {creator.role === "CREATOR" && (
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,149,0,0.12)", color: "#FF9500" }}>크리에이터</span>
                                )}
                                {creator.role === "ADMIN" && (
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FF3B30", color: "#fff" }}>관리자</span>
                                )}
                            </div>

                            <div className="flex items-center gap-6 mt-3">
                                <div className="flex flex-col">
                                    <span className="text-[20px] font-bold" style={{ color: "#1c1c1e" }}>{themes.length}</span>
                                    <span className="text-[12px]" style={{ color: "#8e8e93" }}>테마</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[20px] font-bold" style={{ color: "#1c1c1e" }}>{followerCount.toLocaleString()}</span>
                                    <span className="text-[12px]" style={{ color: "#8e8e93" }}>팔로워</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[20px] font-bold" style={{ color: "#1c1c1e" }}>
                                        {themes.reduce((s, t) => s + t.salesCount, 0).toLocaleString()}
                                    </span>
                                    <span className="text-[12px]" style={{ color: "#8e8e93" }}>총 판매</span>
                                </div>
                            </div>
                        </div>

                        {/* 팔로우 버튼 */}
                        <button
                            onClick={handleFollow}
                            disabled={followLoading}
                            className="px-5 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95 shrink-0"
                            style={{
                                background: isFollowing ? "rgba(0,0,0,0.06)" : "#1c1c1e",
                                color: isFollowing ? "#3a3a3c" : "#fff",
                                border: isFollowing ? "1.5px solid rgba(0,0,0,0.12)" : "none",
                                opacity: followLoading ? 0.6 : 1,
                            }}
                        >
                            {isFollowing ? "팔로잉" : "팔로우"}
                        </button>
                    </div>
                </div>

                {/* 테마 목록 */}
                <h2 className="text-[17px] font-bold mb-4" style={{ color: "#1c1c1e" }}>등록 테마 {themes.length}개</h2>

                {themes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 rounded-[20px]"
                        style={{ background: "rgba(255,255,255,0.5)" }}>
                        <p className="text-[14px]" style={{ color: "#8e8e93" }}>아직 등록된 테마가 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {themes.map((theme, idx) => (
                            <div
                                key={theme.id}
                                onClick={() => router.push(`/store/${theme.id}`)}
                                className="flex flex-col rounded-[20px] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                                style={{
                                    background: "rgba(255,255,255,0.6)",
                                    border: "1px solid rgba(255,255,255,0.9)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                                }}
                            >
                                <div className="aspect-square relative overflow-hidden">
                                    {theme.thumbnailUrl ? (
                                        <Image src={theme.thumbnailUrl} alt={theme.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full" style={{ background: PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length] }} />
                                    )}
                                    {theme.price === 0 && (
                                        <span className="absolute top-2.5 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: "#FFEF9A", color: "#1c1c1e" }}>
                                            무료
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col gap-1">
                                    <h3 className="text-[13px] font-bold truncate" style={{ color: "#1c1c1e" }}>{theme.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] font-semibold" style={{ color: "#1c1c1e" }}>
                                            {theme.price === 0 ? "무료" : `${theme.price.toLocaleString()}원`}
                                        </span>
                                        <span className="text-[11px]" style={{ color: "#8e8e93" }}>
                                            {theme.salesCount.toLocaleString()}회 판매
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {loginModal && (
                <LoginRequiredModal
                    message="팔로우는 로그인이 필요한 기능이에요."
                    onClose={() => setLoginModal(false)}
                />
            )}
        </div>
    );
}

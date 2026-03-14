"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type LikedTheme = {
    themeId: string;
    themeTitle: string;
    price: number;
    thumbnailUrl: string | null;
    creatorNickname: string | null;
    creatorName: string;
    likedAt: string;
};

export default function LikePage() {
    const router = useRouter();
    const [likes, setLikes] = useState<LikedTheme[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/mypage/likes")
            .then(r => r.json())
            .then((d: { likes: LikedTheme[] }) => setLikes(d.likes ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Likes</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>좋아요</h2>
                </div>
                <span className="text-[13px]" style={{ color: "#a8a29e" }}>{likes.length}개</span>
            </div>
            <p className="text-[13px] mb-8" style={{ color: "#78716c" }}>좋아요를 누른 테마 목록이에요.</p>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
                </div>
            ) : likes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <p className="text-[14px]" style={{ color: "#a8a29e" }}>아직 좋아요한 테마가 없어요.</p>
                    <button onClick={() => router.push("/store")}
                        className="mt-1 text-[13px] font-semibold transition-opacity hover:opacity-60"
                        style={{ color: "#FF9500" }}>
                        테마 스토어 둘러보기 →
                    </button>
                </div>
            ) : (
                <div className="flex flex-col">
                    {likes.map((item, idx) => (
                        <div key={item.themeId}>
                            <button
                                onClick={() => router.push(`/store/${item.themeId}`)}
                                className="w-full flex items-center gap-4 py-4 text-left transition-opacity hover:opacity-70"
                            >
                                {/* 썸네일 */}
                                <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden" style={{ background: "#f5f5f4" }}>
                                    {item.thumbnailUrl ? (
                                        <Image
                                            src={item.thumbnailUrl}
                                            alt={item.themeTitle}
                                            width={56} height={56}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round">
                                                <rect x="3" y="3" width="18" height="18" rx="3"/>
                                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                                <path d="M21 15l-5-5L5 21"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                {/* 정보 */}
                                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                    <p className="text-[14px] font-semibold truncate" style={{ color: "#1c1917" }}>
                                        {item.themeTitle}
                                    </p>
                                    <p className="text-[12px]" style={{ color: "#a8a29e" }}>
                                        {item.creatorNickname ?? item.creatorName}
                                    </p>
                                </div>
                                {/* 가격 */}
                                <span className="text-[13px] font-semibold shrink-0" style={{ color: "#1c1917" }}>
                                    {item.price === 0 ? "무료" : `${item.price.toLocaleString()}원`}
                                </span>
                            </button>
                            {idx < likes.length - 1 && <div className="h-px" style={{ background: "#f5f5f4" }} />}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

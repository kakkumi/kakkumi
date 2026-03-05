"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { THEME_COLORS } from "@/app/store/data";
import { getPreviewSlots } from "./ThemeImageViewer";
import ThemeActionButtons from "./ThemeActionButtons";
import CreatorInquiryModal from "./CreatorInquiryModal";

type Stats = {
    sales: number;
    createdAt: string;
    likes: number;
    rating: number;
    reviews: number;
};

type Props = {
    images: string[];
    previews: string[];
    name: string;
    tag?: string;
    themeId?: number;
    price: string;
    priceNum: number;
    author: string;
    creatorId: string;
    description: string;
    category: string[];
    stats: Stats;
    dbId: string;
    isLoggedIn: boolean;
    userId?: string;
    isOwned?: boolean;
};

export default function ThemeDetailLayout({
    images, previews, name, tag, themeId,
    price, priceNum, author, creatorId, description, category,
    stats, dbId, isLoggedIn, userId, isOwned,
}: Props) {
    const router = useRouter();
    const colors = themeId ? THEME_COLORS[themeId] : undefined;
    const realImages = [...(images ?? []), ...(previews ?? [])].filter((s) => s && s !== "/back.jpg");
    const useColor = realImages.length === 0 && !!colors;
    const [activeIdx, setActiveIdx] = useState(0);
    const [likeCount, setLikeCount] = useState(stats.likes);
    const [showInquiryModal, setShowInquiryModal] = useState(false);

    const { slots } = getPreviewSlots(themeId, images, previews);

    // 좋아요 수 초기 로드
    useEffect(() => {
        fetch(`/api/themes/${dbId}/like`)
            .then(r => r.json())
            .then((d: { liked: boolean; count: number }) => {
                setLikeCount(d.count);
            })
            .catch(() => {});
    }, [dbId, setLikeCount]);

    const mainBg = useColor ? (slots[activeIdx] as string) ?? colors!.main : undefined;
    const mainSrc = useColor ? null : (realImages[activeIdx] ?? null);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[580px_1fr] gap-16">
            {/* 왼쪽: 메인 이미지 */}
            <div
                className="rounded-[28px] overflow-hidden relative shrink-0"
                style={{
                    width: "580px",
                    height: "580px",
                    background: mainBg ?? "rgba(0,0,0,0.06)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    transition: "background 0.25s ease",
                }}
            >
                {mainSrc && (
                    <Image src={mainSrc} alt={name} fill className="object-cover transition-opacity duration-200" />
                )}
                {useColor && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/50 text-[15px] font-semibold tracking-wide">{name}</span>
                    </div>
                )}
                {tag && (
                    <span
                        className="absolute top-5 left-5 text-[12px] font-bold px-3 py-1 rounded-full backdrop-blur-md"
                        style={{
                            background: tag === "무료" ? "rgba(255, 239, 154, 0.92)" : "rgba(170, 189, 232, 0.92)",
                            color: "#1c1c1e",
                        }}
                    >
                        {tag}
                    </span>
                )}
            </div>

            {/* 오른쪽: 상세 정보 */}
            <div className="flex flex-col justify-between py-2 min-w-0">
                {/* 상단 */}
                <div>
                    <div className="mb-6">
                        <div className="flex items-start justify-between gap-4 mt-1">
                            <h1 className="text-[28px] font-extrabold leading-tight text-gray-900 break-words min-w-0" style={{ fontFamily: "'ChosunIlboMyungjo', serif" }}>
                                {name}
                            </h1>
                            <div className="flex flex-col items-end shrink-0 pt-1">
                                <span className="text-[28px] font-bold text-gray-900">{price}</span>
                                {priceNum > 0 && priceNum < 2000 && (
                                    <p className="text-[12px] text-red-400 font-medium mt-0.5">✨ 출시 기념 할인 중</p>
                                )}
                            </div>
                        </div>
                        <p className="text-[14px] text-gray-400 mt-2">
                            by{" "}
                            <button
                                onClick={() => router.push(`/creator/${creatorId}`)}
                                className="text-gray-600 font-semibold hover:underline transition-all"
                            >
                                {author}
                            </button>
                        </p>
                    </div>

                    {/* 카테고리 태그 */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {category.map((cat) => (
                            <span
                                key={cat}
                                className="text-[12px] font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-default"
                            >
                                # {cat}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 하단 */}
                <div className="flex flex-col gap-6">
                    {/* 미니 프리뷰 — 설명 텍스트 위 */}
                    <div className="grid grid-cols-5 gap-2">
                        {slots.slice(0, 5).map((slot, i) => (
                            <button
                                key={i}
                                onMouseEnter={() => setActiveIdx(i)}
                                onClick={() => setActiveIdx(i)}
                                className="aspect-square rounded-[10px] overflow-hidden relative"
                                style={{
                                    background: useColor ? (slot as string) : "rgba(0,0,0,0.06)",
                                    border: activeIdx === i ? "2px solid #4A7BF7" : "1px solid rgba(0,0,0,0.08)",
                                    opacity: activeIdx === i ? 1 : 0.6,
                                    transition: "opacity 0.15s, border 0.15s",
                                }}
                            >
                                {!useColor && (
                                    <Image src={slot as string} alt={`preview-${i + 1}`} fill className="object-cover" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* 설명 */}
                    <p className="text-[15px] leading-relaxed text-gray-500 break-words overflow-hidden">{description}</p>

                    {/* 통계 */}
                    <div className="flex items-center gap-12">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Sales</span>
                            <span className="text-[16px] font-bold text-gray-800">{stats.sales.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Published</span>
                            <span className="text-[16px] font-bold text-gray-800">{stats.createdAt}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Likes</span>
                                <span className="text-[16px] font-bold text-gray-800">{likeCount}</span>
                            </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Rating</span>
                            <div className="flex items-center gap-1">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                <span className="text-[16px] font-bold text-gray-800">{stats.rating}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Reviews</span>
                            <span className="text-[16px] font-bold text-gray-800 underline cursor-pointer hover:text-blue-500">{stats.reviews.toLocaleString()}개</span>
                        </div>
                    </div>

                    {/* 액션 버튼 */}
                    <ThemeActionButtons
                        themeId={dbId}
                        themeMockId={themeId ?? 0}
                        priceNum={priceNum}
                        priceName={price}
                        isLoggedIn={isLoggedIn}
                        userId={userId}
                        isOwned={isOwned}
                        onInquiryAction={() => setShowInquiryModal(true)}
                    />
                </div>
            </div>

            {/* 제작자 문의 모달 */}
            {showInquiryModal && (
                <CreatorInquiryModal
                    creatorId={creatorId}
                    creatorName={author}
                    themeId={dbId}
                    themeName={name}
                    onCloseAction={() => setShowInquiryModal(false)}
                />
            )}
        </div>
    );
}

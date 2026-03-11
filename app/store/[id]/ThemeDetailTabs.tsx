"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ReviewModal from "@/app/components/ReviewModal";

type Review = {
    id: string;
    userId: string;
    rating: number;
    content: string | null;
    images: string[];
    createdAt: Date | string;
    nickname: string | null;
    name: string;
    avatarUrl: string | null;
};

export type ContentBlock = string; // HTML string

export type Props = {
    themeId: string;
    themeName: string;
    thumbnailUrl?: string | null;
    isOwned?: boolean;
    userId?: string;
    contentBlocks?: ContentBlock;
};

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <svg key={s} width={size} height={size} viewBox="0 0 24 24"
                    fill={rating >= s ? "#FFB800" : "none"}
                    stroke={rating >= s ? "#FFB800" : "#c8c8cd"}
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    );
}

function formatDate(d: Date | string) {
    const date = new Date(d);
    const y = date.getFullYear().toString().slice(2);
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
}

export default function ThemeDetailTabs({ themeId, themeName, thumbnailUrl, isOwned, userId, contentBlocks = "" }: Props) {
    const [activeTab, setActiveTab] = useState<"detail" | "reviews" | "more">("detail");
    const [reviews, setReviews] = useState<Review[]>([]);
    const [myReview, setMyReview] = useState<Review | null>(null);
    const [avgRating, setAvgRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/themes/${themeId}/review`);
            const data = await res.json() as { reviews: Review[]; myReview: Review | null; avgRating: number; reviewCount: number };
            setReviews(data.reviews ?? []);
            setMyReview(data.myReview ?? null);
            setAvgRating(data.avgRating ?? 0);
            setReviewCount(data.reviewCount ?? 0);
        } catch {
            //
        } finally {
            setLoading(false);
        }
    }, [themeId]);

    useEffect(() => {
        if (activeTab === "reviews") {
            fetchReviews();
        }
    }, [activeTab, fetchReviews]);

    const handleDeleteReview = async () => {
        if (!confirm("리뷰를 삭제할까요?")) return;
        setDeleting(true);
        await fetch(`/api/themes/${themeId}/review`, { method: "DELETE" });
        setDeleting(false);
        fetchReviews();
    };

    const tabs = [
        { key: "detail", label: "테마 정보" },
        { key: "reviews", label: `리뷰 (${reviewCount})` },
        { key: "more", label: "크리에이터 다른 테마" },
    ] as const;

    return (
        <div className="mt-20 border-t border-gray-100 pt-10">
            {/* 탭 헤더 */}
            <div className="flex items-center gap-6 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-3 border-b-2 font-${activeTab === tab.key ? "bold" : "medium"} text-[15px] transition-colors`}
                        style={{
                            borderColor: activeTab === tab.key ? "#1c1c1e" : "transparent",
                            color: activeTab === tab.key ? "#1c1c1e" : "#9ca3af",
                        }}
                    >
                        {tab.key === "reviews" ? `리뷰 (${reviewCount})` : tab.label}
                    </button>
                ))}
            </div>

            {/* 탭 콘텐츠 */}
            {activeTab === "detail" && (
                <div className="flex flex-col gap-6">
                    {!contentBlocks || contentBlocks === "<p></p>" || contentBlocks.trim() === "" ? (
                        <div className="bg-white rounded-2xl p-10 min-h-[200px] flex items-center justify-center border border-gray-100">
                            <p className="text-[14px] text-gray-400">등록된 테마 정보가 없어요.</p>
                        </div>
                    ) : (
                        <div
                            className="theme-detail-content prose prose-sm max-w-none px-1"
                            dangerouslySetInnerHTML={{ __html: contentBlocks }}
                        />
                    )}
                    <style>{`
                        .theme-detail-content h2 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; color: #1a1a1a; }
                        .theme-detail-content h3 { font-size: 16px; font-weight: 600; margin: 12px 0 6px; color: #1a1a1a; }
                        .theme-detail-content p { margin: 6px 0; color: #3a3a3c; font-size: 15px; line-height: 1.8; }
                        .theme-detail-content ul { list-style: disc; padding-left: 22px; margin: 8px 0; }
                        .theme-detail-content ol { list-style: decimal; padding-left: 22px; margin: 8px 0; }
                        .theme-detail-content li { margin: 3px 0; color: #3a3a3c; font-size: 15px; }
                        .theme-detail-content blockquote { border-left: 3px solid rgba(255,149,0,0.5); padding-left: 14px; margin: 10px 0; color: #6e6e73; font-style: italic; }
                        .theme-detail-content hr { border: none; border-top: 1.5px solid rgba(0,0,0,0.1); margin: 18px 0; }
                        .theme-detail-content img { max-width: 100%; border-radius: 12px; margin: 12px 0; display: block; }
                        .theme-detail-content strong { font-weight: 700; }
                        .theme-detail-content em { font-style: italic; }
                        .theme-detail-content s { text-decoration: line-through; }
                        .theme-detail-content u { text-decoration: underline; }
                    `}</style>
                </div>
            )}

            {activeTab === "reviews" && (
                <div className="flex flex-col gap-6">
                    {/* 평점 요약 */}
                    <div className="flex items-center gap-6 p-6 rounded-2xl bg-white border border-gray-100">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[40px] font-extrabold" style={{ color: "#1c1c1e" }}>
                                {reviewCount > 0 ? avgRating.toFixed(1) : "-"}
                            </span>
                            <StarRow rating={Math.round(avgRating)} size={16} />
                            <span className="text-[12px]" style={{ color: "#8e8e93" }}>리뷰 {reviewCount}개</span>
                        </div>
                    </div>

                    {/* 내 리뷰 / 작성 유도 */}
                    {isOwned && (
                        <div className="p-5 rounded-2xl border border-dashed flex flex-col gap-3"
                            style={{ borderColor: myReview ? "rgba(255,149,0,0.3)" : "rgba(0,0,0,0.1)", background: myReview ? "rgba(255,149,0,0.04)" : "rgba(0,0,0,0.02)" }}>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>
                                    {myReview ? "내 리뷰" : "이 테마를 보유하고 있어요!"}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all hover:opacity-70"
                                        style={{ background: "rgb(255,149,0)", color: "#fff" }}
                                    >
                                        {myReview ? "수정" : "리뷰 작성"}
                                    </button>
                                    {myReview && (
                                        <button
                                            onClick={handleDeleteReview}
                                            disabled={deleting}
                                            className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all hover:opacity-70 disabled:opacity-40"
                                            style={{ border: "1px solid rgba(255,59,48,0.3)", color: "#ff3b30" }}
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            </div>
                            {myReview ? (
                                <div className="flex flex-col gap-1.5">
                                    <StarRow rating={myReview.rating} />
                                    {myReview.content && (
                                        <p className="text-[13px] leading-relaxed" style={{ color: "#3a3a3c" }}>{myReview.content}</p>
                                    )}
                                    {myReview.images?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {myReview.images.map((url, i) => (
                                                <div key={i} className="relative w-[64px] h-[64px] rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                                                    <Image src={url} alt={`리뷰 이미지 ${i + 1}`} fill className="object-cover" unoptimized />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <span className="text-[11px]" style={{ color: "#8e8e93" }}>{formatDate(myReview.createdAt)}</span>
                                </div>
                            ) : (
                                <p className="text-[13px]" style={{ color: "#8e8e93" }}>리뷰를 작성하고 적립금을 받아보세요.</p>
                            )}
                        </div>
                    )}

                    {/* 전체 리뷰 목록 */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <span className="text-[14px]" style={{ color: "#8e8e93" }}>불러오는 중...</span>
                        </div>
                    ) : reviews.filter(r => r.userId !== userId).length === 0 && !myReview ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-2xl border border-gray-100">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <p className="text-[14px]" style={{ color: "#8e8e93" }}>아직 리뷰가 없어요. 첫 번째 리뷰를 남겨보세요!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {reviews.filter(r => r.userId !== userId).map((review, idx) => (
                                <div key={review.id}>
                                    <div className="flex items-start gap-3 bg-white p-5 rounded-2xl border border-gray-100">
                                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "rgba(195,195,195,0.4)" }}>
                                            {review.avatarUrl ? (
                                                <Image src={review.avatarUrl} alt={review.nickname ?? review.name} width={36} height={36} className="w-full h-full object-cover" unoptimized />
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[13px] font-bold truncate" style={{ color: "#1c1c1e" }}>
                                                    {review.nickname ?? review.name}
                                                </span>
                                                <span className="text-[11px] shrink-0" style={{ color: "#8e8e93" }}>{formatDate(review.createdAt)}</span>
                                            </div>
                                            <StarRow rating={review.rating} />
                                            {review.content && (
                                                <p className="text-[13px] leading-relaxed" style={{ color: "#3a3a3c" }}>{review.content}</p>
                                            )}
                                            {review.images?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {review.images.map((url, i) => (
                                                        <div key={i} className="relative w-[64px] h-[64px] rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                                                            <Image src={url} alt={`리뷰 이미지 ${i + 1}`} fill className="object-cover" unoptimized />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {idx < reviews.filter(r => r.userId !== userId).length - 1 && (
                                        <div className="h-[1px] mt-1" style={{ background: "transparent" }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "more" && (
                <div className="bg-white rounded-2xl p-10 min-h-[200px] flex items-center justify-center border border-gray-100">
                    <p className="text-[14px] text-gray-400">크리에이터의 다른 테마가 표시될 영역입니다.</p>
                </div>
            )}

            {/* 리뷰 작성/수정 모달 */}
            {showModal && (
                <ReviewModal
                    themeId={themeId}
                    themeName={themeName}
                    thumbnailUrl={thumbnailUrl}
                    onCloseAction={() => setShowModal(false)}
                    onSuccessAction={() => {
                        setShowModal(false);
                        fetchReviews();
                    }}
                    initialRating={myReview?.rating ?? 0}
                    initialContent={myReview?.content ?? ""}
                    initialImages={myReview?.images ?? []}
                    isEdit={!!myReview}
                />
            )}
        </div>
    );
}

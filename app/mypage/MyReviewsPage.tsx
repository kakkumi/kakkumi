"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type Review = {
    id: string;
    themeId: string;
    themeTitle: string;
    thumbnailUrl: string | null;
    rating: number;
    content: string | null;
    images: string[];
    createdAt: string;
    updatedAt: string;
};

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
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

function formatDate(d: string) {
    const date = new Date(d);
    const y = date.getFullYear().toString().slice(2);
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
}

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/mypage/reviews");
            const data = await res.json() as { reviews: Review[] };
            setReviews(data.reviews ?? []);
        } catch {
            //
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleDelete = async (themeId: string) => {
        if (!confirm("리뷰를 삭제할까요?")) return;
        setDeletingId(themeId);
        await fetch(`/api/themes/${themeId}/review`, { method: "DELETE" });
        setDeletingId(null);
        fetchReviews();
    };

    return (
        <>
            {/* 섹션 헤더 */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Reviews</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>리뷰</h2>
                </div>
            </div>
            <p className="text-[13px] mb-8" style={{ color: "#78716c" }}>내가 작성한 리뷰 목록입니다.</p>

            <div className="flex flex-col">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <span className="text-[14px]" style={{ color: "#a8a29e" }}>불러오는 중...</span>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <p className="text-[14px]" style={{ color: "#a8a29e" }}>아직 작성한 리뷰가 없어요.</p>
                    </div>
                ) : (
                    reviews.map((review, idx) => (
                        <div key={review.id}>
                            <div className="flex items-start gap-4 py-4">
                                <Link href={`/store/${review.themeId}`} className="shrink-0 w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center transition-opacity hover:opacity-75"
                                    style={{ background: "#f5f5f4" }}>
                                    {review.thumbnailUrl ? (
                                        <Image src={review.thumbnailUrl} alt={review.themeTitle} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="3" />
                                        </svg>
                                    )}
                                </Link>
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <Link href={`/store/${review.themeId}`} className="text-[14px] font-semibold truncate transition-opacity hover:opacity-60" style={{ color: "#1c1917" }}>
                                        {review.themeTitle}
                                    </Link>
                                    <StarRow rating={review.rating} />
                                    {review.content && (
                                        <p className="text-[13px] leading-relaxed mt-0.5" style={{ color: "#78716c" }}>{review.content}</p>
                                    )}
                                    {review.images?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                            {review.images.map((url, i) => (
                                                <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden" style={{ border: "1px solid #f5f5f4" }}>
                                                    <Image src={url} alt={`리뷰 이미지 ${i + 1}`} fill className="object-cover" unoptimized />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <span className="text-[11px] mt-0.5" style={{ color: "#a8a29e" }}>{formatDate(review.createdAt)}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(review.themeId)}
                                    disabled={deletingId === review.themeId}
                                    className="shrink-0 text-[12px] font-medium transition-opacity hover:opacity-50 disabled:opacity-30"
                                    style={{ color: "#ff3b30" }}
                                >
                                    {deletingId === review.themeId ? "삭제 중..." : "삭제"}
                                </button>
                            </div>
                            {idx < reviews.length - 1 && (
                                <div className="h-px" style={{ background: "#f5f5f4" }} />
                            )}
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

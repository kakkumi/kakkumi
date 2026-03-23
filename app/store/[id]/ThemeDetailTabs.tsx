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

export type ContentBlock = string;
type OtherTheme = { id: string; title: string; thumbnailUrl: string | null; price: number };

export type Props = {
    themeId: string;
    themeName: string;
    thumbnailUrl?: string | null;
    isOwned?: boolean;
    userId?: string;
    contentBlocks?: ContentBlock;
    otherThemes?: OtherTheme[];
    creatorId?: string;
    creatorName?: string;
};

function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <svg key={s} width={size} height={size} viewBox="0 0 24 24"
                    fill={rating >= s ? "#FFB800" : "none"}
                    stroke={rating >= s ? "#FFB800" : "#e5e7eb"}
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

export default function ThemeDetailTabs({ themeId, themeName, thumbnailUrl, isOwned, userId, contentBlocks = "", otherThemes = [], creatorId, creatorName }: Props) {
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
        } catch { /**/ } finally {
            setLoading(false);
        }
    }, [themeId]);

    useEffect(() => {
        if (activeTab === "reviews") fetchReviews();
    }, [activeTab, fetchReviews]);

    const handleDeleteReview = async () => {
        if (!confirm("리뷰를 삭제할까요?")) return;
        setDeleting(true);
        await fetch(`/api/themes/${themeId}/review`, { method: "DELETE" });
        setDeleting(false);
        fetchReviews();
    };

    const tabs = [
        { key: "detail" as const, label: "테마 정보" },
        { key: "reviews" as const, label: `리뷰${reviewCount > 0 ? ` (${reviewCount})` : ""}` },
        { key: "more" as const, label: "다른 테마" },
    ];

    const otherReviews = reviews.filter(r => r.userId !== userId);

    return (
        /* 카드 없음 — 페이지에 직접 */
        <div style={{ marginTop: 52 }}>

            {/* ── 탭 내비게이션 ── */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: 28 }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            position: "relative",
                            padding: "10px 20px 12px",
                            fontSize: 13,
                            fontWeight: activeTab === tab.key ? 600 : 400,
                            color: activeTab === tab.key ? "#111827" : "#b0b8c8",
                            background: "none", border: "none", cursor: "pointer",
                            transition: "color 0.15s",
                        }}
                    >
                        {tab.label}
                        {activeTab === tab.key && (
                            <span style={{
                                position: "absolute", bottom: -1, left: 0, right: 0,
                                height: 2, background: "#111827",
                            }} />
                        )}
                    </button>
                ))}
            </div>

            {/* ── 테마 정보 ── */}
            {activeTab === "detail" && (
                <>
                    {!contentBlocks || contentBlocks === "<p></p>" || contentBlocks.trim() === "" ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", gap: 10 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            <p style={{ fontSize: 13, color: "#c4c9d4", margin: 0 }}>등록된 테마 정보가 없어요.</p>
                        </div>
                    ) : (
                        <div className="theme-detail-content prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: contentBlocks }} />
                    )}
                    <style>{`
                        .theme-detail-content h2 { font-size: 18px; font-weight: 700; margin: 22px 0 10px; color: #111827; letter-spacing: -0.02em; }
                        .theme-detail-content h3 { font-size: 15px; font-weight: 600; margin: 14px 0 6px; color: #1f2937; }
                        .theme-detail-content p { margin: 8px 0; color: #64748b; font-size: 13px; line-height: 1.9; }
                        .theme-detail-content ul { list-style: disc; padding-left: 18px; margin: 8px 0; }
                        .theme-detail-content ol { list-style: decimal; padding-left: 18px; margin: 8px 0; }
                        .theme-detail-content li { margin: 4px 0; color: #64748b; font-size: 13px; line-height: 1.75; }
                        .theme-detail-content blockquote { border-left: 2px solid rgb(255,149,0); padding-left: 14px; margin: 12px 0; color: #9ca3af; }
                        .theme-detail-content hr { border: none; border-top: 1px solid rgba(0,0,0,0.07); margin: 20px 0; }
                        .theme-detail-content img { max-width: 100%; border-radius: 12px; margin: 12px 0; display: block; }
                        .theme-detail-content strong { font-weight: 700; color: #374151; }
                        .theme-detail-content em { font-style: italic; }
                        .theme-detail-content s { text-decoration: line-through; }
                        .theme-detail-content u { text-decoration: underline; }
                    `}</style>
                </>
            )}

            {/* ── 리뷰 ── */}
            {activeTab === "reviews" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                    {/* 평점 요약 — 인라인, 박스 없음 */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                        <span style={{ fontSize: 40, fontWeight: 900, color: "#111827", lineHeight: 1, letterSpacing: "-0.05em" }}>
                            {reviewCount > 0 ? avgRating.toFixed(1) : "—"}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <StarRow rating={Math.round(avgRating)} size={13} />
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>총 {reviewCount}개 리뷰</span>
                        </div>
                    </div>

                    {/* 내 리뷰 */}
                    {isOwned && (
                        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                                    {myReview ? "내 리뷰" : "이 테마를 보유 중이에요"}
                                </span>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        style={{
                                            padding: "5px 14px", borderRadius: 999,
                                            fontSize: 11, fontWeight: 700,
                                            background: "rgb(255,149,0)", color: "#fff",
                                            border: "none", cursor: "pointer",
                                        }}
                                    >
                                        {myReview ? "수정" : "리뷰 작성"}
                                    </button>
                                    {myReview && (
                                        <button
                                            onClick={handleDeleteReview}
                                            disabled={deleting}
                                            style={{
                                                padding: "5px 10px", borderRadius: 999,
                                                fontSize: 11, fontWeight: 500,
                                                background: "none", color: "#f87171",
                                                border: "none", cursor: "pointer",
                                                opacity: deleting ? 0.4 : 1,
                                            }}
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            </div>
                            {myReview ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <StarRow rating={myReview.rating} />
                                    {myReview.content && (
                                        <p style={{ fontSize: 13, lineHeight: 1.75, color: "#64748b", margin: 0 }}>{myReview.content}</p>
                                    )}
                                    {myReview.images?.length > 0 && (
                                        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                                            {myReview.images.map((url, i) => (
                                                <div key={i} style={{ position: "relative", width: 52, height: 52, borderRadius: 8, overflow: "hidden" }}>
                                                    <Image src={url} alt="" fill className="object-cover" unoptimized />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <span style={{ fontSize: 10, color: "#d1d5db" }}>{formatDate(myReview.createdAt)}</span>
                                </div>
                            ) : (
                                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>리뷰를 작성하고 적립금을 받아보세요.</p>
                            )}
                        </div>
                    )}

                    {/* 전체 리뷰 */}
                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 20 }}>
                        {loading ? (
                            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                                <div style={{
                                    width: 16, height: 16, borderRadius: "50%",
                                    border: "2px solid #e5e7eb",
                                    borderTop: "2px solid #111827",
                                    animation: "spin 0.7s linear infinite",
                                }} />
                            </div>
                        ) : otherReviews.length === 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 10 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                <p style={{ fontSize: 13, color: "#c4c9d4", margin: 0 }}>아직 작성된 리뷰가 없어요.</p>
                            </div>
                        ) : (
                            <div>
                                {otherReviews.map((review, idx) => (
                                    <div key={review.id}>
                                        <div style={{ display: "flex", gap: 12, padding: "16px 0" }}>
                                            <div style={{
                                                width: 30, height: 30, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                                                background: "#f2f3f7", display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                {review.avatarUrl ? (
                                                    <Image src={review.avatarUrl} alt="" width={30} height={30} className="w-full h-full object-cover" unoptimized />
                                                ) : (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8d0e0" strokeWidth="2" strokeLinecap="round">
                                                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1f2937" }}>{review.nickname ?? review.name}</span>
                                                    <span style={{ fontSize: 10, color: "#d1d5db" }}>{formatDate(review.createdAt)}</span>
                                                </div>
                                                <StarRow rating={review.rating} />
                                                {review.content && (
                                                    <p style={{ fontSize: 12, lineHeight: 1.75, color: "#64748b", margin: 0 }}>{review.content}</p>
                                                )}
                                                {review.images?.length > 0 && (
                                                    <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                                                        {review.images.map((url, i) => (
                                                            <div key={i} style={{ position: "relative", width: 52, height: 52, borderRadius: 8, overflow: "hidden" }}>
                                                                <Image src={url} alt="" fill className="object-cover" unoptimized />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {idx < otherReviews.length - 1 && (
                                            <div style={{ height: 1, background: "rgba(0,0,0,0.05)" }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── 다른 테마 ── */}
            {activeTab === "more" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {creatorId && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0 }}>
                                {creatorName ?? "크리에이터"}의 다른 테마
                            </p>
                            <a href={`/creator/${creatorId}`} style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                fontSize: 11, color: "#b0b8c8", textDecoration: "none",
                            }} className="hover:text-blue-400 transition-colors">
                                전체 보기
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                    )}
                    {otherThemes.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 0", gap: 10 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="3"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <path d="M21 15l-5-5L5 21"/>
                            </svg>
                            <p style={{ fontSize: 13, color: "#c4c9d4", margin: 0 }}>다른 테마가 없어요.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
                            {otherThemes.map(t => (
                                <a key={t.id} href={`/store/${t.id}`}
                                    style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 8 }}
                                    className="group"
                                >
                                    <div style={{
                                        width: "100%", aspectRatio: "1 / 1",
                                        borderRadius: 12, overflow: "hidden",
                                        background: "#f2f3f7",
                                    }} className="group-hover:opacity-75 transition-opacity">
                                        {t.thumbnailUrl ? (
                                            <img src={t.thumbnailUrl} alt={t.title}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                className="group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8d0e0" strokeWidth="1.5" strokeLinecap="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                                    <path d="M21 15l-5-5L5 21"/>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: "#374151", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {t.title}
                                        </p>
                                        <p style={{ fontSize: 10, color: t.price === 0 ? "rgb(74,123,247)" : "#9ca3af", margin: 0, fontWeight: t.price === 0 ? 700 : 400 }}>
                                            {t.price === 0 ? "무료" : `${t.price.toLocaleString()}원`}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <ReviewModal
                    themeId={themeId}
                    themeName={themeName}
                    thumbnailUrl={thumbnailUrl}
                    onCloseAction={() => setShowModal(false)}
                    onSuccessAction={() => { setShowModal(false); fetchReviews(); }}
                    initialRating={myReview?.rating ?? 0}
                    initialContent={myReview?.content ?? ""}
                    initialImages={myReview?.images ?? []}
                    isEdit={!!myReview}
                />
            )}
        </div>
    );
}

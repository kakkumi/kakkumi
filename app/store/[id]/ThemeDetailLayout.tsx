"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { THEME_COLORS } from "@/app/store/data";
import { getPreviewSlots } from "./ThemeImageViewer";
import ThemeActionButtons from "./ThemeActionButtons";
import CreatorInquiryModal from "./CreatorInquiryModal";

function getPurchaseCredit(price: number): number {
    if (price === 0) return 0;
    if (price <= 500) return 10;
    if (price <= 1000) return 20;
    if (price <= 1500) return 30;
    if (price <= 2000) return 40;
    return 50;
}

function getReviewCredit(price: number): number {
    if (price === 0) return 0;
    if (price <= 500) return 30;
    if (price <= 1000) return 70;
    if (price <= 1500) return 120;
    if (price <= 2000) return 180;
    return 250;
}

type Stats = {
    sales: number;
    createdAt: string;
    likes: number;
    rating: number;
    reviews: number;
};

type ThemeVersion = { id: string; version: string; kthemeFileUrl: string | null; apkFileUrl: string | null };

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
    ownedVersionIds?: string[];
    versions?: ThemeVersion[];
    isSelling?: boolean;
};

export default function ThemeDetailLayout({
    images, previews, name, tag, themeId,
    price, priceNum, author, creatorId, description, category,
    stats, dbId, isLoggedIn, userId, isOwned, ownedVersionIds = [], versions = [],
    isSelling = true,
}: Props) {
    const colors = themeId ? THEME_COLORS[themeId] : undefined;
    const realImages = [...(images ?? []), ...(previews ?? [])].filter((s) => s && s !== "/back.jpg");
    const useColor = realImages.length === 0 && !!colors;
    const [activeIdx, setActiveIdx] = useState(0);
    const [likeCount, setLikeCount] = useState(stats.likes);
    const [showInquiryModal, setShowInquiryModal] = useState(false);

    const { slots } = getPreviewSlots(themeId, images, previews);

    useEffect(() => {
        fetch(`/api/themes/${dbId}/like`)
            .then(r => r.json())
            .then((d: { liked: boolean; count: number }) => { setLikeCount(d.count); })
            .catch(() => {});
    }, [dbId, setLikeCount]);

    const mainBg = useColor ? (slots[activeIdx] as string) ?? colors!.main : undefined;
    const mainSrc = useColor ? null : (realImages[activeIdx] ?? null);
    const purchaseCredit = getPurchaseCredit(priceNum);
    const reviewCredit = getReviewCredit(priceNum);

    return (
        <>
            {/* 카드 없는 2컬럼 레이아웃 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                {/* ── 왼쪽: 이미지 뷰어 ── */}
                <div className="flex flex-col gap-3">
                    {/* 메인 이미지 */}
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "1 / 1",
                            borderRadius: 16,
                            overflow: "hidden",
                            background: mainBg ?? "#f2f3f7",
                            transition: "background 0.3s ease",
                        }}
                    >
                        {mainSrc && (
                            <Image
                                src={mainSrc}
                                alt={name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                quality={90}
                            />
                        )}
                        {useColor && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em" }}>{name}</span>
                            </div>
                        )}
                        {tag && (
                            <span style={{
                                position: "absolute", top: 14, left: 14,
                                fontSize: 10, fontWeight: 800,
                                padding: "4px 10px", borderRadius: 999,
                                background: tag === "무료" ? "rgb(255,149,0)" : "rgb(74,123,247)",
                                color: "#fff", letterSpacing: "0.05em",
                            }}>
                                {tag}
                            </span>
                        )}
                    </div>

                    {/* 썸네일 스트립 */}
                    {slots.length > 1 && (
                        <div style={{ display: "flex", gap: 6 }}>
                            {slots.slice(0, 5).map((slot, i) => (
                                <button
                                    key={i}
                                    onMouseEnter={() => setActiveIdx(i)}
                                    onClick={() => setActiveIdx(i)}
                                    style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 8,
                                        overflow: "hidden",
                                        position: "relative",
                                        padding: 0,
                                        cursor: "pointer",
                                        flexShrink: 0,
                                        background: useColor ? (slot as string) : "#e8eaf0",
                                        outline: activeIdx === i ? "2px solid rgb(74,123,247)" : "2px solid transparent",
                                        outlineOffset: 2,
                                        opacity: activeIdx === i ? 1 : 0.45,
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {!useColor && (
                                        <Image
                                            src={slot as string}
                                            alt={`preview-${i + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                            quality={85}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── 오른쪽: 상품 정보 ── */}
                <div className="flex flex-col" style={{ paddingTop: 4 }}>

                    {/* 크리에이터 */}
                    <Link
                        href={`/creator/${creatorId}`}
                        style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 14 }}
                        className="group w-fit"
                    >
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }} className="group-hover:text-blue-400 transition-colors">
                            {author}
                        </span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            className="group-hover:stroke-blue-400 transition-colors">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </Link>

                    {/* 제목 */}
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", lineHeight: 1.2, margin: 0 }}>
                        {name}
                    </h1>

                    {/* 가격 */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                        <span style={{
                            fontSize: 24, fontWeight: 800,
                            color: priceNum === 0 ? "rgb(74,123,247)" : "#111827",
                            letterSpacing: "-0.03em",
                        }}>
                            {price}
                        </span>
                    </div>

                    {/* 태그 */}
                    {category.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 14 }}>
                            {category.map((cat) => (
                                <span key={cat} style={{
                                    fontSize: 10, fontWeight: 600,
                                    padding: "3px 9px", borderRadius: 999,
                                    background: "rgba(74,123,247,0.06)", color: "rgb(74,123,247)",
                                }}>
                                    {cat}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* 얇은 선 */}
                    <div style={{ height: 1, background: "rgba(0,0,0,0.07)", margin: "20px 0" }} />

                    {/* 설명 */}
                    {description && (
                        <p style={{ fontSize: 13, lineHeight: 1.85, color: "#64748b", margin: 0 }}>
                            {description}
                        </p>
                    )}

                    {/* 통계 — 배경 없이 세로선만 */}
                    <div style={{ display: "flex", margin: "20px 0" }}>
                        {[
                            { label: "판매", value: stats.sales.toLocaleString() },
                            { label: "등록", value: stats.createdAt },
                            { label: "좋아요", value: likeCount.toLocaleString() },
                            { label: "리뷰", value: `${stats.reviews}개` },
                        ].map((s, i, arr) => (
                            <div key={s.label} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{s.value}</div>
                                <div style={{ fontSize: 10, color: "#c4c9d4", marginTop: 3 }}>{s.label}</div>
                                {i < arr.length - 1 && (
                                    <div style={{ position: "absolute", right: 0, top: "15%", bottom: "15%", width: 1, background: "rgba(0,0,0,0.08)" }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 얇은 선 */}
                    <div style={{ height: 1, background: "rgba(0,0,0,0.07)", marginBottom: 20 }} />

                    {/* 액션 버튼 */}
                    <ThemeActionButtons
                        themeId={dbId}
                        priceNum={priceNum}
                        priceName={price}
                        isLoggedIn={isLoggedIn}
                        userId={userId}
                        isOwned={isOwned}
                        ownedVersionIds={ownedVersionIds}
                        versions={versions}
                        onInquiryAction={() => setShowInquiryModal(true)}
                        isSelling={isSelling}
                    />

                    {/* 적립 혜택 — 한 줄 인라인 */}
                    {priceNum > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 6px", marginTop: 14 }}>
                            <span style={{ fontSize: 10, color: "#d1d5db" }}>구매</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "rgb(74,123,247)" }}>+{purchaseCredit}원</span>
                            <span style={{ fontSize: 10, color: "#e5e7eb" }}>·</span>
                            <span style={{ fontSize: 10, color: "#d1d5db" }}>리뷰</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "rgb(255,149,0)" }}>+{reviewCredit}원</span>
                            <span style={{ fontSize: 10, color: "#e5e7eb" }}>·</span>
                            <span style={{ fontSize: 10, color: "#d1d5db" }}>예상 총</span>
                            <span style={{ fontSize: 10, fontWeight: 800, color: "#22c55e" }}>+{(purchaseCredit + reviewCredit).toLocaleString()}원</span>
                        </div>
                    )}
                </div>
            </div>

            {showInquiryModal && (
                <CreatorInquiryModal
                    creatorId={creatorId}
                    creatorName={author}
                    themeId={dbId}
                    themeName={name}
                    onCloseAction={() => setShowInquiryModal(false)}
                />
            )}
        </>
    );
}

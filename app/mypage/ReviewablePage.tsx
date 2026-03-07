"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ReviewModal from "@/app/components/ReviewModal";

type ReviewableItem = {
    purchaseId: string;
    themeId: string;
    themeTitle: string;
    thumbnailUrl: string | null;
    amount: number;
    purchasedAt: string;
};

function formatDate(d: string) {
    const date = new Date(d);
    const y = date.getFullYear().toString().slice(2);
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
}

export default function ReviewablePage() {
    const [items, setItems] = useState<ReviewableItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<ReviewableItem | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/mypage/reviewable");
            const data = await res.json() as { items: ReviewableItem[] };
            setItems(data.items ?? []);
        } catch {
            //
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    return (
        <>
            {/* 섹션 헤더 */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Reviews</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>작성 가능한 후기</h2>
                </div>
            </div>
            <p className="text-[13px] mb-8" style={{ color: "#78716c" }}>리뷰를 아직 작성하지 않은 구매 테마입니다.</p>

            <div className="flex flex-col">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <span className="text-[14px]" style={{ color: "#a8a29e" }}>불러오는 중...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        <p className="text-[14px]" style={{ color: "#a8a29e" }}>모든 리뷰를 작성했어요!</p>
                    </div>
                ) : (
                    items.map((item, idx) => (
                        <div key={item.purchaseId}>
                            <div className="flex items-center gap-4 py-4">
                                <Link href={`/store/${item.themeId}`} className="shrink-0 w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center transition-opacity hover:opacity-75"
                                    style={{ background: "#f5f5f4" }}>
                                    {item.thumbnailUrl ? (
                                        <Image src={item.thumbnailUrl} alt={item.themeTitle} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="3" />
                                        </svg>
                                    )}
                                </Link>
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                    <Link href={`/store/${item.themeId}`} className="text-[14px] font-semibold truncate transition-opacity hover:opacity-60" style={{ color: "#1c1917" }}>
                                        {item.themeTitle}
                                    </Link>
                                    <span className="text-[12px]" style={{ color: "#a8a29e" }}>
                                        {item.amount === 0 ? "무료" : `${item.amount.toLocaleString()}원`} · {formatDate(item.purchasedAt)} 구매
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="shrink-0 text-[12px] font-semibold transition-opacity hover:opacity-60"
                                    style={{ color: "#FF9500" }}
                                >
                                    리뷰 작성
                                </button>
                            </div>
                            {idx < items.length - 1 && (
                                <div className="h-px" style={{ background: "#f5f5f4" }} />
                            )}
                        </div>
                    ))
                )}
            </div>

            {selectedItem && (
                <ReviewModal
                    themeId={selectedItem.themeId}
                    themeName={selectedItem.themeTitle}
                    thumbnailUrl={selectedItem.thumbnailUrl}
                    onCloseAction={() => setSelectedItem(null)}
                    onSuccessAction={() => {
                        setSelectedItem(null);
                        fetchItems();
                    }}
                />
            )}
        </>
    );
}

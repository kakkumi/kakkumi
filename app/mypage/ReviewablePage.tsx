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
            <div>
                <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>작성 가능한 후기</h1>
                <p className="text-[13px] mt-1" style={{ color: "#8e8e93" }}>리뷰를 아직 작성하지 않은 구매 테마입니다.</p>
            </div>
            <div className="p-7 rounded-[24px] flex flex-col gap-4"
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <span className="text-[14px]" style={{ color: "#8e8e93" }}>불러오는 중...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        <p className="text-[14px]" style={{ color: "#8e8e93" }}>작성 가능한 후기가 없어요. 모든 리뷰를 작성했어요!</p>
                    </div>
                ) : (
                    items.map((item, idx) => (
                        <div key={item.purchaseId}>
                            <div className="flex items-center gap-4">
                                <Link href={`/store/${item.themeId}`} className="shrink-0 w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center transition-all hover:opacity-80"
                                    style={{ background: "rgba(0,0,0,0.05)" }}>
                                    {item.thumbnailUrl ? (
                                        <Image src={item.thumbnailUrl} alt={item.themeTitle} width={56} height={56} className="w-full h-full object-cover" unoptimized />
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="3" />
                                        </svg>
                                    )}
                                </Link>
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                    <Link href={`/store/${item.themeId}`} className="text-[14px] font-bold truncate hover:underline" style={{ color: "#1c1c1e" }}>
                                        {item.themeTitle}
                                    </Link>
                                    <span className="text-[12px]" style={{ color: "#8e8e93" }}>
                                        {item.amount === 0 ? "무료" : `${item.amount.toLocaleString()}원`} · {formatDate(item.purchasedAt)} 구매
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="shrink-0 px-4 py-2 rounded-xl text-[13px] font-medium transition-all hover:opacity-80 active:scale-95"
                                    style={{ background: "rgb(255,149,0)", color: "#fff" }}
                                >
                                    리뷰 작성
                                </button>
                            </div>
                            {idx < items.length - 1 && (
                                <div className="mt-4 h-[1px]" style={{ background: "rgba(0,0,0,0.06)" }} />
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

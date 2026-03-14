"use client";

import { useEffect, useState } from "react";

type PurchaseItem = {
    id: string;
    themeId: string;
    themeTitle: string;
    amount: number;
    status: string;
    createdAt: string;
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
    COMPLETED: { label: "결제 완료", color: "#34c759", bg: "rgba(52,199,89,0.12)" },
    PENDING:   { label: "대기 중",   color: "#FF9500", bg: "rgba(255,149,0,0.12)" },
};

export default function OrderPage() {
    const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/mypage/purchases")
            .then(r => r.json())
            .then((d: { purchases: PurchaseItem[] }) => {
                // COMPLETED, PENDING만 표시 (REFUNDED 제외)
                setPurchases((d.purchases ?? []).filter(p => p.status !== "REFUNDED"));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Orders</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>주문 내역</h2>
                </div>
            </div>
            <p className="text-[13px] mb-8" style={{ color: "#78716c" }}>구매 완료된 테마 목록입니다.</p>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
                </div>
            ) : purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                    <p className="text-[14px]" style={{ color: "#a8a29e" }}>주문 내역이 없어요.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {purchases.map((p, idx) => {
                        const st = STATUS_LABEL[p.status] ?? { label: p.status, color: "#a8a29e", bg: "rgba(0,0,0,0.06)" };
                        const date = new Date(p.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
                        return (
                            <div key={p.id}>
                                <div className="flex items-center justify-between py-4">
                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                        <a href={`/store/${p.themeId}`} className="text-[14px] font-semibold hover:opacity-60 transition-opacity truncate" style={{ color: "#1c1917" }}>
                                            {p.themeTitle}
                                        </a>
                                        <span className="text-[12px]" style={{ color: "#a8a29e" }}>{date}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-4">
                                        <span className="text-[13px] font-semibold" style={{ color: "#1c1917" }}>
                                            {p.amount === 0 ? "무료" : `${p.amount.toLocaleString()}원`}
                                        </span>
                                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                                            {st.label}
                                        </span>
                                    </div>
                                </div>
                                {idx < purchases.length - 1 && <div className="h-px" style={{ background: "#f5f5f4" }} />}
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

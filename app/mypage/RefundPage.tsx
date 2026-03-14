"use client";

import { useEffect, useState } from "react";

type PurchaseItem = {
    id: string;
    themeId: string;
    themeTitle: string;
    amount: number;
    status: string;
    createdAt: string;
    refundedAt: string | null;
    refundReason: string | null;
    canRefund: boolean;
};

export default function RefundPage() {
    const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/mypage/purchases")
            .then(r => r.json())
            .then((d: { purchases: PurchaseItem[] }) => {
                // 취소/환불 완료된 것만 표시
                setPurchases((d.purchases ?? []).filter(p => p.status === "REFUNDED"));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Refunds</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>취소 / 환불 내역</h2>
                </div>
            </div>
            <p className="text-[13px] mb-8" style={{ color: "#78716c" }}>환불이 완료된 내역입니다.</p>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
                </div>
            ) : purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
                    </svg>
                    <p className="text-[14px]" style={{ color: "#a8a29e" }}>취소/환불 내역이 없어요.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {purchases.map((p, idx) => (
                        <div key={p.id}>
                            <div className="flex items-start justify-between gap-3 py-4">
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                    <p className="text-[14px] font-semibold truncate" style={{ color: "#1c1917" }}>{p.themeTitle}</p>
                                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                        <span className="text-[12px]" style={{ color: "#a8a29e" }}>구매일 {formatDate(p.createdAt)}</span>
                                        {p.refundedAt && (
                                            <span className="text-[12px]" style={{ color: "#a8a29e" }}>· 환불일 {formatDate(p.refundedAt)}</span>
                                        )}
                                    </div>
                                    {p.refundReason && (
                                        <p className="text-[12px] mt-0.5" style={{ color: "#78716c" }}>사유: {p.refundReason}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[13px] font-semibold" style={{ color: "#1c1917" }}>
                                        {p.amount === 0 ? "무료" : `${p.amount.toLocaleString()}원`}
                                    </span>
                                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: "rgba(255,59,48,0.12)", color: "#ff3b30" }}>
                                        환불 완료
                                    </span>
                                </div>
                            </div>
                            {idx < purchases.length - 1 && <div className="h-px" style={{ background: "#f5f5f4" }} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

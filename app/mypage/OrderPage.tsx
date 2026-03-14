"use client";

import { useEffect, useState } from "react";

type PurchaseItem = {
    id: string;
    themeId: string;
    themeTitle: string;
    amount: number;
    status: string;
    createdAt: string;
    canRefund: boolean;
    isDownloaded: boolean;
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
    COMPLETED: { label: "결제 완료", color: "#34c759", bg: "rgba(52,199,89,0.12)" },
    PENDING:   { label: "대기 중",   color: "#FF9500", bg: "rgba(255,149,0,0.12)" },
};

export default function OrderPage() {
    const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [refundingId, setRefundingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadPurchases = () => {
        fetch("/api/mypage/purchases")
            .then(r => r.json())
            .then((d: { purchases: PurchaseItem[] }) => {
                setPurchases((d.purchases ?? []).filter(p => p.status !== "REFUNDED"));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadPurchases(); }, []);

    const handleRefund = async (purchaseId: string) => {
        setRefundingId(purchaseId);
        setError(""); setSuccess("");
        try {
            const res = await fetch("/api/payment/refund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ purchaseId, reason: reason || "고객 요청" }),
            });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) { setError(data.error ?? "환불 처리에 실패했습니다."); return; }
            setSuccess("환불이 완료되었습니다. 영업일 기준 3~5일 내 원결제 수단으로 환불됩니다.");
            setSelectedId(null); setReason("");
            loadPurchases();
        } catch { setError("환불 처리 중 오류가 발생했습니다."); }
        finally { setRefundingId(null); }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

    return (
        <>
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Orders</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>주문 내역</h2>
                </div>
            </div>
                        <p className="text-[13px] mb-2" style={{ color: "#78716c" }}>구매 완료된 테마 목록입니다.</p>
                        <p className="text-[12px] mb-8" style={{ color: "#a8a29e" }}>다운로드 전에만 환불 신청이 가능하며, 원결제 수단으로 환불됩니다.</p>

            {success && <p className="text-[13px] mb-4" style={{ color: "#34c759" }}>✓ {success}</p>}
            {error && <p className="text-[13px] mb-4" style={{ color: "#ff3b30" }}>{error}</p>}

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
                        const isSelected = selectedId === p.id;
                        return (
                            <div key={p.id}>
                                <div className="py-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                            <a href={`/store/${p.themeId}`}
                                                className="text-[14px] font-semibold hover:opacity-60 transition-opacity truncate"
                                                style={{ color: "#1c1917" }}>
                                                {p.themeTitle}
                                            </a>
                                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                                <span className="text-[12px]" style={{ color: "#a8a29e" }}>{formatDate(p.createdAt)}</span>
                                                <span className="text-[12px] font-semibold" style={{ color: "#1c1917" }}>
                                                    {p.amount === 0 ? "무료" : `${p.amount.toLocaleString()}원`}
                                                </span>
                                                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                                                    style={{ background: st.bg, color: st.color }}>{st.label}
                                                </span>
                                                {p.isDownloaded && (
                                                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                                                        style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>
                                                        다운로드 완료 · 환불불가
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {/* 환불 신청 버튼: 유료 & COMPLETED & 다운로드 안 한 경우만 */}
                                        {p.status === "COMPLETED" && p.amount > 0 && !p.isDownloaded && (
                                            <button
                                                onClick={() => { setSelectedId(isSelected ? null : p.id); setError(""); setSuccess(""); }}
                                                className="text-[12px] font-medium transition-opacity hover:opacity-50 shrink-0"
                                                style={{ color: isSelected ? "#ff3b30" : "#78716c" }}>
                                                {isSelected ? "취소" : "환불 신청"}
                                            </button>
                                        )}
                                    </div>

                                    {/* 환불 신청 폼 */}
                                    {isSelected && (
                                        <div className="mt-4 flex flex-col gap-3">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#ff3b30" }}>환불 신청</span>
                                                <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,59,48,0.15)" }} />
                                            </div>
                                            <div className="flex items-start gap-2 px-3 py-2 rounded-xl"
                                                style={{ background: "rgba(255,149,0,0.06)", border: "1px solid rgba(255,149,0,0.15)" }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                                </svg>
                                                <p className="text-[11px] leading-relaxed" style={{ color: "#78716c" }}>
                                                    다운로드 전에만 환불이 가능합니다. 카드 결제는 원결제 수단으로, 적립금 결제는 적립금으로 환불됩니다.
                                                </p>
                                            </div>
                                            <textarea
                                                value={reason}
                                                onChange={e => setReason(e.target.value)}
                                                placeholder="환불 사유를 입력해주세요. (선택)"
                                                rows={2}
                                                className="w-full px-0 py-2 text-[13px] outline-none resize-none bg-transparent"
                                                style={{ borderBottom: "1.5px solid #d6d3d1", color: "#1c1917" }}
                                            />
                                            <p className="text-[11px]" style={{ color: "#a8a29e" }}>
                                                환불 금액 {p.amount.toLocaleString()}원이 원결제 수단으로 환불됩니다. (적립금 결제 시 적립금으로 환불)
                                            </p>
                                            <div className="flex gap-3">
                                                <button onClick={() => { setSelectedId(null); setReason(""); }}
                                                    className="text-[13px] font-medium transition-opacity hover:opacity-50"
                                                    style={{ color: "#78716c" }}>취소</button>
                                                <button
                                                    onClick={() => handleRefund(p.id)}
                                                    disabled={refundingId === p.id}
                                                    className="text-[13px] font-semibold transition-opacity hover:opacity-60 disabled:opacity-30"
                                                    style={{ color: "#ff3b30" }}>
                                                    {refundingId === p.id ? "처리 중..." : `${p.amount.toLocaleString()}원 환불 신청`}
                                                </button>
                                            </div>
                                        </div>
                                    )}
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

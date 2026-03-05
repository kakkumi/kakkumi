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

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
    COMPLETED: { label: "결제 완료", color: "#34c759", bg: "rgba(52,199,89,0.12)" },
    PENDING:   { label: "대기 중",   color: "#FF9500", bg: "rgba(255,149,0,0.12)" },
    REFUNDED:  { label: "환불 완료", color: "#ff3b30", bg: "rgba(255,59,48,0.12)" },
};

export default function RefundPage() {
    const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refundingId, setRefundingId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadPurchases = () => {
        fetch("/api/mypage/purchases")
            .then(r => r.json())
            .then((d: { purchases: PurchaseItem[] }) => setPurchases(d.purchases ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadPurchases(); }, []);

    const handleRefund = async (purchaseId: string) => {
        setRefundingId(purchaseId);
        setError("");
        setSuccess("");
        try {
            const res = await fetch("/api/payment/refund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ purchaseId, reason: reason || "고객 요청" }),
            });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) {
                setError(data.error ?? "환불 처리에 실패했습니다.");
            } else {
                setSuccess("환불이 완료되었습니다. 적립금으로 지급됩니다.");
                setSelectedId(null);
                setReason("");
                loadPurchases();
            }
        } catch {
            setError("환불 처리 중 오류가 발생했습니다.");
        } finally {
            setRefundingId(null);
        }
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    };

    const CARD_STYLE = {
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>취소 / 환불 내역</h1>
                <p className="text-[13px] mt-1" style={{ color: "#8e8e93" }}>구매 후 7일 이내 환불 신청이 가능합니다.</p>
            </div>

            {/* 환불 안내 */}
            <div className="flex items-start gap-3 px-5 py-4 rounded-[16px]" style={{ background: "rgba(255,149,0,0.07)", border: "1px solid rgba(255,149,0,0.15)" }}>
                <span className="text-[16px] shrink-0">💡</span>
                <div className="flex flex-col gap-1">
                    <p className="text-[13px] font-semibold" style={{ color: "#c97000" }}>환불 안내</p>
                    <ul className="text-[12px] leading-relaxed list-disc list-inside flex flex-col gap-0.5" style={{ color: "#8e8e93" }}>
                        <li>구매 후 <strong>7일 이내</strong>만 환불 신청 가능합니다.</li>
                        <li>환불 금액은 <strong>적립금</strong>으로 즉시 지급됩니다.</li>
                        <li>무료 테마는 환불 대상이 아닙니다.</li>
                        <li>환불된 적립금의 유효기간은 지급일로부터 1년입니다.</li>
                    </ul>
                </div>
            </div>

            {/* 성공/에러 메시지 */}
            {success && (
                <div className="px-5 py-3 rounded-[14px] flex items-center gap-2" style={{ background: "rgba(52,199,89,0.1)", border: "1px solid rgba(52,199,89,0.2)" }}>
                    <span className="text-[14px]">✅</span>
                    <p className="text-[13px] font-medium" style={{ color: "#34c759" }}>{success}</p>
                </div>
            )}
            {error && (
                <div className="px-5 py-3 rounded-[14px] flex items-center gap-2" style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)" }}>
                    <span className="text-[14px]">⚠️</span>
                    <p className="text-[13px] font-medium" style={{ color: "#ff3b30" }}>{error}</p>
                </div>
            )}

            {/* 주문 목록 */}
            <div className="flex flex-col gap-3 p-7 rounded-[24px]" style={CARD_STYLE}>
                <h3 className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>주문 내역</h3>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                        </svg>
                        <p className="text-[13px]" style={{ color: "#8e8e93" }}>구매 내역이 없습니다.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {purchases.map(p => {
                            const statusStyle = STATUS_LABEL[p.status] ?? { label: p.status, color: "#8e8e93", bg: "rgba(0,0,0,0.06)" };
                            const isSelected = selectedId === p.id;
                            return (
                                <div key={p.id} className="flex flex-col rounded-[16px] overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
                                    <div className="flex items-center justify-between px-5 py-4" style={{ background: "rgba(0,0,0,0.02)" }}>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[14px] font-semibold" style={{ color: "#1c1c1e" }}>{p.themeTitle}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px]" style={{ color: "#8e8e93" }}>{formatDate(p.createdAt)}</span>
                                                <span className="text-[12px] font-bold" style={{ color: "#1c1c1e" }}>
                                                    {p.amount === 0 ? "무료" : `${p.amount.toLocaleString()}원`}
                                                </span>
                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                                                    {statusStyle.label}
                                                </span>
                                            </div>
                                            {p.status === "REFUNDED" && p.refundedAt && (
                                                <p className="text-[11px]" style={{ color: "#8e8e93" }}>
                                                    환불일: {formatDate(p.refundedAt)}
                                                    {p.refundReason && ` · ${p.refundReason}`}
                                                </p>
                                            )}
                                        </div>

                                        {p.canRefund && p.status === "COMPLETED" && (
                                            <button
                                                onClick={() => { setSelectedId(isSelected ? null : p.id); setError(""); setSuccess(""); }}
                                                className="px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-all hover:brightness-95 active:scale-95 shrink-0"
                                                style={{ background: isSelected ? "rgba(255,59,48,0.12)" : "rgba(0,0,0,0.06)", color: isSelected ? "#ff3b30" : "#3a3a3c" }}
                                            >
                                                {isSelected ? "취소" : "환불 신청"}
                                            </button>
                                        )}
                                    </div>

                                    {/* 환불 신청 폼 */}
                                    {isSelected && (
                                        <div className="px-5 py-4 flex flex-col gap-3" style={{ background: "rgba(255,59,48,0.03)", borderTop: "1px solid rgba(255,59,48,0.1)" }}>
                                            <p className="text-[12px] font-semibold" style={{ color: "#ff3b30" }}>환불 신청</p>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[12px]" style={{ color: "#8e8e93" }}>환불 사유 (선택)</label>
                                                <textarea
                                                    value={reason}
                                                    onChange={e => setReason(e.target.value)}
                                                    placeholder="환불 사유를 입력해주세요."
                                                    rows={2}
                                                    className="w-full px-4 py-3 rounded-[10px] text-[13px] outline-none resize-none"
                                                    style={{ border: "1.5px solid rgba(0,0,0,0.1)", background: "#fff", color: "#1c1c1e" }}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setSelectedId(null); setReason(""); }}
                                                    className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all hover:opacity-70"
                                                    style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={() => handleRefund(p.id)}
                                                    disabled={refundingId === p.id}
                                                    className="flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-all hover:brightness-95 active:scale-95 disabled:opacity-40"
                                                    style={{ background: "#ff3b30", color: "#fff" }}
                                                >
                                                    {refundingId === p.id ? "처리 중..." : `${p.amount.toLocaleString()}원 환불 신청`}
                                                </button>
                                            </div>
                                            <p className="text-[11px]" style={{ color: "#8e8e93" }}>
                                                ※ 환불 금액 {p.amount.toLocaleString()}원이 적립금으로 즉시 지급됩니다.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { REFUND_ALLOWED_DAYS, CREDIT_EXPIRY_DAYS } from "@/lib/constants";

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

    return (
        <div className="flex flex-col">
            {/* 섹션 헤더 */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Orders</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>취소 / 환불 내역</h2>
                </div>
            </div>
            <p className="text-[13px] mb-8" style={{ color: "#78716c" }}>구매 후 {REFUND_ALLOWED_DAYS}일 이내 환불 신청이 가능합니다.</p>

            {/* 환불 안내 */}
            <div className="flex items-start gap-3 mb-8 pt-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <ul className="text-[12px] leading-relaxed flex flex-col gap-0.5" style={{ color: "#78716c" }}>
                    <li>구매 후 <strong>{REFUND_ALLOWED_DAYS}일 이내</strong>만 환불 신청 가능합니다.</li>
                    <li>환불 금액은 <strong>적립금</strong>으로 즉시 지급됩니다.</li>
                    <li>무료 테마는 환불 대상이 아닙니다.</li>
                    <li>환불된 적립금의 유효기간은 지급일로부터 {CREDIT_EXPIRY_DAYS}일입니다.</li>
                </ul>
            </div>

            {/* 성공/에러 메시지 */}
            {success && (
                <p className="text-[13px] mb-4" style={{ color: "#34c759" }}>✓ {success}</p>
            )}
            {error && (
                <p className="text-[13px] mb-4" style={{ color: "#ff3b30" }}>{error}</p>
            )}

            {/* 주문 목록 */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>주문 내역</span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="text-[14px]" style={{ color: "#a8a29e" }}>불러오는 중...</span>
                </div>
            ) : purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                    </svg>
                    <p className="text-[14px]" style={{ color: "#a8a29e" }}>구매 내역이 없습니다.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {purchases.map((p, idx) => {
                        const statusStyle = STATUS_LABEL[p.status] ?? { label: p.status, color: "#a8a29e", bg: "rgba(0,0,0,0.06)" };
                        const isSelected = selectedId === p.id;
                        return (
                            <div key={p.id}>
                                <div className="py-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                            <p className="text-[14px] font-semibold truncate" style={{ color: "#1c1917" }}>{p.themeTitle}</p>
                                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                                <span className="text-[12px]" style={{ color: "#a8a29e" }}>{formatDate(p.createdAt)}</span>
                                                <span className="text-[12px] font-semibold" style={{ color: "#1c1917" }}>
                                                    {p.amount === 0 ? "무료" : `${p.amount.toLocaleString()}원`}
                                                </span>
                                                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                                                    {statusStyle.label}
                                                </span>
                                            </div>
                                            {p.status === "REFUNDED" && p.refundedAt && (
                                                <p className="text-[11px] mt-0.5" style={{ color: "#a8a29e" }}>
                                                    환불일 {formatDate(p.refundedAt)}{p.refundReason && ` · ${p.refundReason}`}
                                                </p>
                                            )}
                                        </div>
                                        {p.canRefund && p.status === "COMPLETED" && (
                                            <button
                                                onClick={() => { setSelectedId(isSelected ? null : p.id); setError(""); setSuccess(""); }}
                                                className="text-[12px] font-medium transition-opacity hover:opacity-50 shrink-0"
                                                style={{ color: isSelected ? "#ff3b30" : "#78716c" }}
                                            >
                                                {isSelected ? "취소" : "환불 신청"}
                                            </button>
                                        )}
                                    </div>

                                    {/* 환불 신청 폼 */}
                                    {isSelected && (
                                        <div className="mt-4 flex flex-col gap-3 pl-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#ff3b30" }}>환불 신청</span>
                                                <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,59,48,0.15)" }} />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[12px]" style={{ color: "#a8a29e" }}>환불 사유 (선택)</label>
                                                <textarea
                                                    value={reason}
                                                    onChange={e => setReason(e.target.value)}
                                                    placeholder="환불 사유를 입력해주세요."
                                                    rows={2}
                                                    className="w-full px-0 py-2 text-[13px] outline-none resize-none bg-transparent"
                                                    style={{ borderBottom: "1.5px solid #d6d3d1", color: "#1c1917" }}
                                                />
                                            </div>
                                            <p className="text-[11px]" style={{ color: "#a8a29e" }}>
                                                환불 금액 {p.amount.toLocaleString()}원이 적립금으로 즉시 지급됩니다.
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => { setSelectedId(null); setReason(""); }}
                                                    className="text-[13px] font-medium transition-opacity hover:opacity-50"
                                                    style={{ color: "#78716c" }}
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={() => handleRefund(p.id)}
                                                    disabled={refundingId === p.id}
                                                    className="text-[13px] font-semibold transition-opacity hover:opacity-60 disabled:opacity-30"
                                                    style={{ color: "#ff3b30" }}
                                                >
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
        </div>
    );
}

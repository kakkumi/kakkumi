"use client";

import { useEffect, useState } from "react";

type Payment = {
    id: string;
    amount: number;
    status: string;
    pgTransactionId: string | null;
    periodStart: string;
    periodEnd: string;
    paidAt: string;
};

type Subscription = {
    status: string;
    cardCompany: string | null;
    cardNumber: string | null;
};

function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateShort(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    COMPLETED: { label: "결제 완료", color: "#34c759", bg: "rgba(52,199,89,0.1)" },
    FAILED: { label: "결제 실패", color: "#ff3b30", bg: "rgba(255,59,48,0.1)" },
    REFUNDED: { label: "환불", color: "#aeaeb2", bg: "rgba(0,0,0,0.06)" },
};

export default function SubscriptionPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [sub, setSub] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/subscription");
                const data = await res.json() as { subscription: Subscription | null; payments: Payment[] };
                setSub(data.subscription);
                setPayments(data.payments ?? []);
            } catch { /* ignore */ } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-orange-200 border-t-orange-400 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Billing History</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>결제 내역</h2>
                </div>
            </div>

            {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <p className="text-[14px]" style={{ color: "#a8a29e" }}>결제 내역이 없어요.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {/* 헤더 */}
                    <div className="grid pb-3 mb-1"
                        style={{ gridTemplateColumns: "140px 200px 120px 100px 100px", borderBottom: "1px solid #e7e5e4", gap: "0 16px" }}>
                        {["결제일", "PRO 이용기간", "결제 수단", "결제 금액", "결제 상태"].map(h => (
                            <span key={h} className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#a8a29e" }}>{h}</span>
                        ))}
                    </div>

                    {/* 목록 */}
                    {payments.map((p, idx) => {
                        const statusInfo = STATUS_MAP[p.status] ?? { label: p.status, color: "#aeaeb2", bg: "rgba(0,0,0,0.05)" };
                        const cardLabel = sub?.cardCompany
                            ? `${sub.cardCompany}${sub.cardNumber ? ` *${sub.cardNumber.slice(-4)}` : ""}`
                            : "카드";
                        return (
                            <div key={p.id}
                                className="grid py-4 items-center"
                                style={{
                                    gridTemplateColumns: "140px 200px 120px 100px 100px",
                                    gap: "0 16px",
                                    borderBottom: idx < payments.length - 1 ? "1px solid #f5f5f4" : "none",
                                }}>
                                <span className="text-[13px]" style={{ color: "#1c1917" }}>{formatDate(p.paidAt)}</span>
                                <span className="text-[12px]" style={{ color: "#78716c" }}>
                                    {formatDateShort(p.periodStart)} ~ {formatDateShort(p.periodEnd)}
                                </span>
                                <span className="text-[13px]" style={{ color: "#78716c" }}>{cardLabel}</span>
                                <span className="text-[13px] font-semibold" style={{ color: "#1c1917" }}>
                                    {p.amount.toLocaleString()}원
                                </span>
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit"
                                    style={{ background: statusInfo.bg, color: statusInfo.color }}>
                                    {statusInfo.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 결제 취소 안내 */}
            <div className="mt-12 flex items-start gap-2.5 pt-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-semibold" style={{ color: "#a8a29e" }}>결제 취소 안내</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#c4c4c6" }}>
                        구독 결제는 결제일로부터 7일 이내에 취소 요청이 가능합니다. 이미 이용 기간이 시작된 경우 취소가 제한될 수 있습니다.
                        취소 문의는 고객센터 1:1 문의 또는 이메일(support@kakkumi.com)로 접수해 주세요.
                        환불은 원래 결제 수단으로 영업일 기준 3~5일 이내에 처리됩니다.
                    </p>
                </div>
            </div>
        </>
    );
}

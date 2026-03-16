"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Subscription = {
    id: string;
    status: string;
    amount: number;
    cardCompany?: string | null;
    cardNumber?: string | null;
    startedAt: string;
    nextBillingAt: string | null;
    cancelledAt: string | null;
};

function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
}

export default function SubscriptionInfoPage() {
    const router = useRouter();
    const [sub, setSub] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [toast, setToast] = useState("");

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/subscription");
                const data = await res.json() as { subscription: Subscription | null; payments?: unknown[]; role?: string | null };
                setSub(data.subscription);
            } catch { /* ignore */ } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            const res = await fetch("/api/subscription", { method: "DELETE" });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) {
                showToast(data.error ?? "해지 처리 중 오류가 발생했습니다.");
            } else {
                showToast("구독이 해지됐어요. 기간 만료 전까지 Pro 혜택은 유지돼요.");
                setCancelConfirm(false);
                // 상태 갱신
                setSub(prev => prev ? { ...prev, status: "CANCELLED", cancelledAt: new Date().toISOString() } : prev);
                // 헤더 등 사이트 전체 프로필 사진 기본값으로 즉시 갱신
                window.dispatchEvent(new CustomEvent("avatar-updated"));
                setTimeout(() => router.refresh(), 1000);
                setTimeout(() => window.dispatchEvent(new CustomEvent("avatar-updated")), 1200);
            }
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-orange-200 border-t-orange-400 animate-spin" />
            </div>
        );
    }

    return (
        <>
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl text-[13px] font-medium shadow-lg"
                    style={{ background: "#18181b", color: "#fff" }}>
                    {toast}
                </div>
            )}

            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Subscription</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>결제 정보</h2>
                </div>
            </div>

            {!sub || sub.status?.toUpperCase() !== "ACTIVE" ? (
                /* 구독 없음 */
                <div className="flex flex-col items-center justify-center py-24 gap-5">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,149,0,0.08)" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-[16px] font-semibold mb-1" style={{ color: "#1c1917" }}>현재 구독 중인 요금제가 없어요</p>
                        <p className="text-[13px]" style={{ color: "#a8a29e" }}>Pro 플랜을 구독하면 더 많은 기능을 이용할 수 있어요.</p>
                    </div>
                    <button
                        onClick={() => router.push("/pricing")}
                        className="px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:brightness-110"
                        style={{ background: "linear-gradient(135deg, #FF9500, #FF6B00)", color: "#fff" }}>
                        Pro 구독하기
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-0">
                    {/* 현재 요금제 */}
                    <div className="flex flex-col gap-4 pb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>사용 중인 요금제</span>
                            <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[15px] font-bold" style={{ color: "#1c1917" }}>Pro</span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,149,0,0.1)", color: "#FF9500" }}>구독 중</span>
                        </div>
                        <p className="text-[13px]" style={{ color: "#78716c" }}>월 {sub.amount.toLocaleString()}원 · 자동 결제</p>
                    </div>

                    {/* 결제 수단 */}
                    <div className="flex flex-col gap-4 py-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>결제 수단</span>
                            <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                        </div>
                        {sub.cardCompany || sub.cardNumber ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-9 h-6 rounded-md" style={{ background: "rgba(0,0,0,0.06)" }}>
                                    <svg width="16" height="12" viewBox="0 0 24 16" fill="none">
                                        <rect x="0" y="0" width="24" height="16" rx="2" fill="#1c1c1e"/>
                                        <rect x="1" y="5" width="22" height="3" fill="rgba(255,255,255,0.15)"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[14px] font-medium" style={{ color: "#1c1917" }}>
                                        {sub.cardCompany ?? "카드"} {sub.cardNumber ? `**** **** **** ${sub.cardNumber.slice(-4)}` : ""}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[13px]" style={{ color: "#a8a29e" }}>등록된 카드 정보가 없습니다.</p>
                        )}
                    </div>

                    {/* 등록일 / 다음 결제일 */}
                    <div className="flex flex-col gap-4 py-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>구독 정보</span>
                            <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px]" style={{ color: "#78716c" }}>구독 시작일</span>
                                <span className="text-[13px] font-medium" style={{ color: "#1c1917" }}>{formatDate(sub.startedAt)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px]" style={{ color: "#78716c" }}>다음 결제일</span>
                                <span className="text-[13px] font-medium" style={{ color: "#1c1917" }}>{formatDate(sub.nextBillingAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 구독 해지 */}
                    <div className="flex flex-col gap-4 pt-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>구독 관리</span>
                            <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                        </div>

                        {!cancelConfirm ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[14px] font-medium" style={{ color: "#1c1917" }}>구독 해지</p>
                                    <p className="text-[12px] mt-0.5" style={{ color: "#a8a29e" }}>해지해도 기간 만료 전까지 Pro 혜택은 유지돼요.</p>
                                </div>
                                <button
                                    onClick={() => setCancelConfirm(true)}
                                    className="text-[12px] font-medium px-4 py-2 rounded-xl transition-opacity hover:opacity-70"
                                    style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>
                                    해지하기
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "rgba(255,59,48,0.05)", border: "1px solid rgba(255,59,48,0.1)" }}>
                                <p className="text-[13px] font-medium" style={{ color: "#ff3b30" }}>정말 구독을 해지하시겠어요?</p>
                                <p className="text-[12px]" style={{ color: "#78716c" }}>
                                    해지 후에도 <strong>{formatDate(sub.nextBillingAt)}</strong>까지는 Pro 혜택이 유지됩니다.
                                    이후에는 무료 플랜으로 전환됩니다.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCancelConfirm(false)}
                                        className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-opacity hover:opacity-70"
                                        style={{ background: "rgba(0,0,0,0.06)", color: "#78716c" }}>
                                        취소
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-40"
                                        style={{ background: "rgba(255,59,48,0.12)", color: "#ff3b30" }}>
                                        {cancelling ? "처리 중..." : "해지 확인"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

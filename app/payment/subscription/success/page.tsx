"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";

function SubscriptionSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const paymentKey = searchParams.get("paymentKey");
        const orderId = searchParams.get("orderId");
        const amount = searchParams.get("amount");

        const confirm = async () => {
            if (!paymentKey || !orderId || !amount) {
                setStatus("error");
                setErrorMessage("결제 정보가 올바르지 않습니다.");
                return;
            }
            try {
                const res = await fetch("/api/payment/subscription/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
                });
                const data = await res.json() as { ok?: boolean; error?: string };
                if (data.ok) {
                    setStatus("success");
                } else {
                    setErrorMessage(data.error ?? "구독 처리 중 오류가 발생했습니다.");
                    setStatus("error");
                }
            } catch {
                setErrorMessage("네트워크 오류가 발생했습니다.");
                setStatus("error");
            }
        };

        void confirm();
    }, [searchParams]);

    return (
        <div className="flex-1 flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-6 text-center max-w-md w-full px-6">
                {status === "loading" && (
                    <>
                        <div className="w-14 h-14 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                        <p className="text-[15px]" style={{ color: "#8e8e93" }}>구독을 처리하고 있습니다...</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,149,0,0.12)" }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-[22px] font-extrabold mb-2" style={{ color: "#1c1c1e" }}>Pro 구독이 시작됐어요! 🎉</h1>
                            <p className="text-[14px]" style={{ color: "#8e8e93" }}>지금부터 모든 Pro 기능을 무제한으로 이용할 수 있어요.</p>
                        </div>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => router.push("/mypage?menu=결제+정보")}
                                className="flex-1 py-3 rounded-[12px] text-[14px] font-bold text-white transition-all active:scale-[0.98]"
                                style={{ background: "linear-gradient(135deg, #FF9500, #FF6B00)" }}
                            >
                                결제 정보 확인
                            </button>
                            <button
                                onClick={() => router.push("/create")}
                                className="flex-1 py-3 rounded-[12px] text-[14px] font-bold transition-all active:scale-[0.98]"
                                style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}
                            >
                                테마 만들러 가기
                            </button>
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,59,48,0.1)" }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-[22px] font-extrabold mb-2" style={{ color: "#1c1c1e" }}>구독에 실패했어요</h1>
                            <p className="text-[14px]" style={{ color: "#8e8e93" }}>{errorMessage}</p>
                        </div>
                        <button
                            onClick={() => router.push("/pricing")}
                            className="w-full py-3 rounded-[12px] text-[14px] font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #FF9500, #FF6B00)" }}
                        >
                            다시 시도하기
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function SubscriptionSuccessPage() {
    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#f7f7f8" }}>
            <Header />
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                </div>
            }>
                <SubscriptionSuccessContent />
            </Suspense>
        </div>
    );
}

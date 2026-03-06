"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const paymentKey = searchParams.get("paymentKey");
        const orderId = searchParams.get("orderId");
        const amount = searchParams.get("amount");
        const themeId = searchParams.get("themeId") ?? "";

        const confirm = async () => {
            if (!paymentKey || !orderId || !amount || !themeId) {
                setStatus("error");
                setErrorMessage("결제 정보가 올바르지 않습니다.");
                return;
            }
            const versionId = searchParams.get("versionId") ?? undefined;
            try {
                const res = await fetch("/api/payment/toss/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount), themeId, versionId }),
                });
                const data = await res.json() as { success?: boolean; error?: string };
                if (data.success) {
                    setStatus("success");
                } else {
                    setErrorMessage(data.error ?? "결제 처리 중 오류가 발생했습니다.");
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
                        <div className="w-14 h-14 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
                        <p className="text-[15px] text-gray-500">결제를 확인하고 있습니다...</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(52,199,89,0.15)" }}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-[22px] font-extrabold text-gray-900 mb-2">구매 완료!</h1>
                            <p className="text-[14px] text-gray-500">테마가 성공적으로 구매되었습니다.<br />마이페이지에서 다운로드할 수 있습니다.</p>
                        </div>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => router.push("/mypage?menu=구매+테마")}
                                className="flex-1 py-3 rounded-[12px] text-[14px] font-bold text-white transition-all active:scale-[0.98]"
                                style={{ background: "#4A7BF7" }}
                            >
                                구매 테마 바로가기
                            </button>
                            <button
                                onClick={() => router.push("/store")}
                                className="flex-1 py-3 rounded-[12px] text-[14px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-400 transition-all active:scale-[0.98]"
                            >
                                스토어 보러가기
                            </button>
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(255,59,48,0.12)" }}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-[22px] font-extrabold text-gray-900 mb-2">결제 실패</h1>
                            <p className="text-[14px] text-gray-500">{errorMessage}</p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="w-full py-3 rounded-[12px] text-[14px] font-bold text-white transition-all active:scale-[0.98]"
                            style={{ background: "#4A7BF7" }}
                        >
                            다시 시도하기
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>
            <Header />
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" /></div>}>
                <PaymentSuccessContent />
            </Suspense>
            <Footer />
        </div>
    );
}

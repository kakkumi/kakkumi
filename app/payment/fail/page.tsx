"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

function PaymentFailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const errorCode = searchParams.get("code") ?? "";
    const errorMessage = searchParams.get("message") ?? "결제가 취소되었거나 오류가 발생했습니다.";

    return (
        <div className="flex-1 flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-6 text-center max-w-md w-full px-6">
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
                    {errorCode && (
                        <p className="text-[12px] text-gray-300 mt-1">오류 코드: {errorCode}</p>
                    )}
                </div>
                <div className="flex gap-3 w-full">
                    <button
                        onClick={() => router.back()}
                        className="flex-1 py-3 rounded-[12px] text-[14px] font-bold text-white transition-all active:scale-[0.98]"
                        style={{ background: "#4A7BF7" }}
                    >
                        다시 시도하기
                    </button>
                    <button
                        onClick={() => router.push("/store")}
                        className="flex-1 py-3 rounded-[12px] text-[14px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-400 transition-all active:scale-[0.98]"
                    >
                        스토어로 이동
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PaymentFailPage() {
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>
            <Header />
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" /></div>}>
                <PaymentFailContent />
            </Suspense>
            <Footer />
        </div>
    );
}

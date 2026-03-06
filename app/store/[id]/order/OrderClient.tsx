"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";

// 구매 적립금 테이블
function getPurchaseCredit(price: number): number {
    if (price === 0) return 0;
    if (price <= 500) return 10;
    if (price <= 1000) return 20;
    if (price <= 1500) return 30;
    if (price <= 2000) return 40;
    return 50;
}

// 리뷰 적립금 테이블
function getReviewCredit(price: number): number {
    if (price === 0) return 0;
    if (price <= 500) return 30;
    if (price <= 1000) return 70;
    if (price <= 1500) return 120;
    if (price <= 2000) return 180;
    return 250;
}

type TossPaymentsFn = (clientKey: string) => {
    requestPayment: (method: string, options: Record<string, unknown>) => Promise<void>;
};

type OrderInfo = {
    id: string;
    title: string;
    price: number;
    thumbnailUrl: string | null;
    author: string;
};

export default function OrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const themeId = searchParams.get("themeId") ?? "";

    const [theme, setTheme] = useState<OrderInfo | null>(null);
    const [myCredit, setMyCredit] = useState(0);
    const [useCredit, setUseCredit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [userId, setUserId] = useState<string | undefined>();

    // 세션 & 크레딧 조회
    useEffect(() => {
        Promise.all([
            fetch("/api/themes/detail?id=" + themeId).then(r => r.json()),
            fetch("/api/mypage/credit").then(r => r.json()),
            fetch("/api/auth/session").then(r => r.json()),
        ]).then(([themeData, creditData, sessionData]: [
            { theme?: OrderInfo; error?: string },
            { credit: number },
            { dbId?: string }
        ]) => {
            if (themeData.theme) setTheme(themeData.theme);
            setMyCredit(creditData.credit ?? 0);
            setUserId(sessionData.dbId);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [themeId]);

    // 토스 SDK 로드
    useEffect(() => {
        if (!theme || theme.price === 0) return;
        const win = window as unknown as Record<string, unknown>;
        if (typeof win["TossPayments"] !== "undefined") { setSdkLoaded(true); return; }
        const script = document.createElement("script");
        script.src = "https://js.tosspayments.com/v1/payment";
        script.async = true;
        script.onload = () => setSdkLoaded(true);
        document.head.appendChild(script);
    }, [theme]);

    if (!themeId) { router.push("/store"); return null; }

    const price = theme?.price ?? 0;
    const isFree = price === 0;
    const purchaseCreditReward = getPurchaseCredit(price);
    const reviewCreditReward = getReviewCredit(price);

    // 실제 결제 금액 (적립금 사용 시 차감)
    const creditToUse = useCredit ? Math.min(myCredit, price) : 0;
    const payAmount = price - creditToUse;

    const handlePay = async () => {
        if (!theme) return;
        setPaying(true);
        setError("");

        // 적립금만으로 전액 결제 가능한 경우
        if (useCredit && creditToUse >= price) {
            try {
                const res = await fetch("/api/payment/credit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ themeId }),
                });
                const data = await res.json() as { success?: boolean; error?: string };
                if (data.success) {
                    router.push(`/payment/success?themeId=${encodeURIComponent(themeId)}&method=credit`);
                } else {
                    setError(data.error ?? "결제에 실패했습니다.");
                }
            } catch {
                setError("오류가 발생했습니다.");
            } finally {
                setPaying(false);
            }
            return;
        }

        // 카드 결제 (적립금 부분 사용 포함)
        const clientKey = process.env.NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY;
        if (!clientKey) { setError("결제 설정 오류입니다."); setPaying(false); return; }
        const win = window as unknown as Record<string, unknown>;
        if (!sdkLoaded || typeof win["TossPayments"] === "undefined") {
            setError("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            setPaying(false);
            return;
        }

        const shortThemeId = themeId.replace(/-/g, "").slice(0, 16);
        const shortUserId = (userId ?? "guest").replace(/-/g, "").slice(0, 16);
        const orderId = `${shortThemeId}-${shortUserId}-${Date.now().toString(36)}`;

        try {
            const toss = (win["TossPayments"] as TossPaymentsFn)(clientKey);
            await toss.requestPayment("카드", {
                amount: payAmount,
                orderId,
                orderName: theme.title,
                customerName: "카꾸미 고객",
                successUrl: `${window.location.origin}/payment/success?themeId=${encodeURIComponent(themeId)}&creditUsed=${creditToUse}`,
                failUrl: `${window.location.origin}/payment/fail`,
            });
        } catch (err: unknown) {
            const e = err as { code?: string; message?: string };
            if (e?.code !== "USER_CANCEL") {
                setError(e?.message ?? "결제 중 오류가 발생했습니다.");
            }
            setPaying(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}>
            <Header />

            <div className="flex-1 w-full max-w-[960px] mx-auto px-6 py-10 pb-24">
                {/* 뒤로가기 */}
                <Link href={`/store/${themeId}`}
                    className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-400 hover:text-gray-800 transition-colors mb-8">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                    </svg>
                    상세페이지로 돌아가기
                </Link>

                <h1 className="text-[24px] font-extrabold mb-8" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                    주문 확인
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-500 animate-spin" />
                    </div>
                ) : !theme ? (
                    <div className="text-center py-24 text-gray-400">테마 정보를 불러올 수 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

                        {/* 왼쪽: 주문 정보 */}
                        <div className="flex flex-col gap-4">

                            {/* 주문 상품 */}
                            <div className="flex flex-col gap-4 p-6 rounded-[20px]"
                                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", backdropFilter: "blur(20px)" }}>
                                <h2 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>주문 상품</h2>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-[14px] overflow-hidden shrink-0 relative"
                                        style={{ background: "rgba(0,0,0,0.06)" }}>
                                        {theme.thumbnailUrl ? (
                                            <Image src={theme.thumbnailUrl} alt={theme.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1">
                                        <span className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>{theme.title}</span>
                                        <span className="text-[13px]" style={{ color: "#8e8e93" }}>by {theme.author}</span>
                                    </div>
                                    <span className="text-[18px] font-bold shrink-0" style={{ color: "#1c1c1e" }}>
                                        {price === 0 ? "무료" : `${price.toLocaleString()}원`}
                                    </span>
                                </div>
                            </div>

                            {/* 할인 / 적립금 사용 */}
                            {!isFree && (
                                <div className="flex flex-col gap-4 p-6 rounded-[20px]"
                                    style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", backdropFilter: "blur(20px)" }}>
                                    <h2 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>할인 / 적립금</h2>

                                    {/* 쿠폰 (준비중) */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                                            </svg>
                                            <span className="text-[13px]" style={{ color: "#3a3a3c" }}>쿠폰</span>
                                        </div>
                                        <span className="text-[12px] px-3 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.05)", color: "#8e8e93" }}>보유 쿠폰 없음</span>
                                    </div>

                                    <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.06)" }} />

                                    {/* 적립금 사용 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                                            </svg>
                                            <span className="text-[13px]" style={{ color: "#3a3a3c" }}>적립금 사용</span>
                                            <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
                                                style={{ background: "rgba(52,199,89,0.1)", color: "#1a7a3a" }}>
                                                보유 {myCredit.toLocaleString()}원
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setUseCredit(v => !v)}
                                            disabled={myCredit === 0}
                                            className="relative w-11 h-6 rounded-full transition-all duration-200 disabled:opacity-40"
                                            style={{ background: useCredit ? "#34c759" : "rgba(0,0,0,0.15)" }}>
                                            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
                                                style={{ left: useCredit ? "calc(100% - 22px)" : "2px" }} />
                                        </button>
                                    </div>
                                    {useCredit && myCredit > 0 && (
                                        <div className="flex items-center justify-between px-4 py-2.5 rounded-[12px]"
                                            style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.2)" }}>
                                            <span className="text-[12px]" style={{ color: "#1a7a3a" }}>
                                                적립금 {creditToUse.toLocaleString()}원 차감
                                            </span>
                                            <span className="text-[13px] font-bold" style={{ color: "#ff3b30" }}>
                                                -{creditToUse.toLocaleString()}원
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 최종 결제 금액 */}
                            <div className="flex flex-col gap-3 p-6 rounded-[20px]"
                                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", backdropFilter: "blur(20px)" }}>
                                <h2 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>결제 금액</h2>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between">
                                        <span className="text-[13px]" style={{ color: "#8e8e93" }}>상품 금액</span>
                                        <span className="text-[13px]" style={{ color: "#3a3a3c" }}>
                                            {price === 0 ? "무료" : `${price.toLocaleString()}원`}
                                        </span>
                                    </div>
                                    {useCredit && creditToUse > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-[13px]" style={{ color: "#8e8e93" }}>적립금 할인</span>
                                            <span className="text-[13px] font-semibold" style={{ color: "#ff3b30" }}>-{creditToUse.toLocaleString()}원</span>
                                        </div>
                                    )}
                                    <div className="h-[1px] my-1" style={{ background: "rgba(0,0,0,0.07)" }} />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>최종 결제 금액</span>
                                        <span className="text-[22px] font-extrabold" style={{ color: "#1c1c1e" }}>
                                            {isFree ? "무료" : payAmount === 0 ? "0원 (적립금 전액 사용)" : `${payAmount.toLocaleString()}원`}
                                        </span>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-[12px] font-medium px-3 py-2 rounded-lg" style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>{error}</p>
                                )}

                                <button
                                    onClick={handlePay}
                                    disabled={paying}
                                    className="w-full py-4 rounded-[14px] text-[16px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60 mt-1"
                                    style={{ background: "#4A7BF7", boxShadow: "0 4px 20px rgba(74,123,247,0.3)" }}>
                                    {paying ? "처리 중..." : isFree ? "무료 다운로드" : payAmount === 0 ? "적립금으로 결제하기" : `${payAmount.toLocaleString()}원 결제하기`}
                                </button>
                            </div>
                        </div>

                        {/* 오른쪽: 포인트 혜택 */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4 p-6 rounded-[20px]"
                                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", backdropFilter: "blur(20px)" }}>
                                <h2 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>포인트 혜택</h2>

                                {/* 구매 적립 */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4A7BF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                        <span className="text-[12px] font-bold" style={{ color: "#4A7BF7" }}>구매 적립</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 rounded-[12px]"
                                        style={{ background: "rgba(74,123,247,0.06)", border: "1px solid rgba(74,123,247,0.15)" }}>
                                        <span className="text-[12px]" style={{ color: "#3a3a3c" }}>구매 완료 시 적립</span>
                                        <span className="text-[16px] font-extrabold" style={{ color: isFree ? "#8e8e93" : "#4A7BF7" }}>
                                            {isFree ? "0원" : `+${purchaseCreditReward}원`}
                                        </span>
                                    </div>
                                </div>

                                <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.06)" }} />

                                {/* 리뷰 적립 */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                        <span className="text-[12px] font-bold" style={{ color: "#FF9500" }}>리뷰 적립</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 rounded-[12px]"
                                        style={{ background: "rgba(255,149,0,0.06)", border: "1px solid rgba(255,149,0,0.15)" }}>
                                        <span className="text-[12px]" style={{ color: "#3a3a3c" }}>리뷰 작성 시 적립</span>
                                        <span className="text-[16px] font-extrabold" style={{ color: isFree ? "#8e8e93" : "#FF9500" }}>
                                            {isFree ? "0원" : `+${reviewCreditReward}원`}
                                        </span>
                                    </div>
                                    <p className="text-[11px]" style={{ color: "#b0b0b5" }}>리뷰 작성 후 승인 시 자동 지급됩니다.</p>
                                </div>

                                <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.06)" }} />

                                {/* 예상 총 적립 */}
                                <div className="flex items-center justify-between px-4 py-3 rounded-[12px]"
                                    style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.15)" }}>
                                    <span className="text-[12px] font-semibold" style={{ color: "#1a7a3a" }}>예상 총 적립</span>
                                    <span className="text-[16px] font-extrabold" style={{ color: isFree ? "#8e8e93" : "#34c759" }}>
                                        {isFree ? "0원" : `+${(purchaseCreditReward + reviewCreditReward).toLocaleString()}원`}
                                    </span>
                                </div>
                            </div>

                            {/* 안내 */}
                            <div className="flex flex-col gap-2 px-4 py-4 rounded-[16px]"
                                style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.06)" }}>
                                <p className="text-[11px] font-semibold" style={{ color: "#3a3a3c" }}>안내사항</p>
                                <ul className="flex flex-col gap-1 text-[11px] leading-relaxed" style={{ color: "#8e8e93" }}>
                                    <li>• 구매 적립금은 결제 완료 즉시 지급됩니다.</li>
                                    <li>• 리뷰 적립금은 리뷰 작성 및 승인 후 지급됩니다.</li>
                                    <li>• 적립금은 테마 구매 시 현금처럼 사용 가능합니다.</li>
                                    <li>• 회원 탈퇴 시 보유 적립금은 전액 소멸됩니다.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

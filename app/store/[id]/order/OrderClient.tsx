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

type SelectedVersionInfo = {
    id: string;
    os: "iOS" | "Android";
    optionName: string;
    label: string;
};

export default function OrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const themeId = searchParams.get("themeId") ?? "";
    const versionId = searchParams.get("versionId") ?? undefined;

    const [theme, setTheme] = useState<OrderInfo | null>(null);
    const [myCredit, setMyCredit] = useState(0);
    const [useCredit, setUseCredit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [userId, setUserId] = useState<string | undefined>();
    const [selectedVersion, setSelectedVersion] = useState<SelectedVersionInfo | null>(null);

    // 세션 & 크레딧 조회
    useEffect(() => {
        Promise.all([
            fetch("/api/themes/detail?id=" + themeId + (versionId ? `&versionId=${encodeURIComponent(versionId)}` : "")).then(r => r.json()),
            fetch("/api/mypage/credit").then(r => r.json()),
            fetch("/api/auth/session").then(r => r.json()),
        ]).then(([themeData, creditData, sessionData]: [
            { theme?: OrderInfo; selectedVersion?: SelectedVersionInfo | null; error?: string },
            { credit: number },
            { dbId?: string }
        ]) => {
            if (themeData.theme) setTheme(themeData.theme);
            setSelectedVersion(themeData.selectedVersion ?? null);
            setMyCredit(creditData.credit ?? 0);
            setUserId(sessionData.dbId);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [themeId, versionId]);

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
                    body: JSON.stringify({ themeId, versionId }),
                });
                const data = await res.json() as { success?: boolean; error?: string };
                if (data.success) {
                    window.location.href = "/mypage?menu=구매+테마";
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
                successUrl: `${window.location.origin}/payment/success?themeId=${encodeURIComponent(themeId)}&creditUsed=${creditToUse}${versionId ? `&versionId=${encodeURIComponent(versionId)}` : ""}`,
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
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: "#f3f3f3" }}
        >
            <Header />

            <div className="flex-1 w-full max-w-[1120px] mx-auto px-6 lg:px-8 py-6 lg:py-8 pb-14">
                <Link
                    href={`/store/${themeId}`}
                    className="inline-flex items-center gap-1.5 mb-7 group"
                    style={{ color: "#a3a3a3", fontSize: 12, letterSpacing: "0.02em" }}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:opacity-70 transition-opacity">
                        <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                    </svg>
                    <span className="group-hover:opacity-70 transition-opacity">상세페이지로 돌아가기</span>
                </Link>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div
                            className="w-9 h-9 rounded-full border-[3px] animate-spin"
                            style={{ borderColor: "#e5e5e5", borderTopColor: "#3b82f6" }}
                        />
                    </div>
                ) : !theme ? (
                    <div className="text-center py-24 text-[14px]" style={{ color: "#a3a3a3" }}>
                        테마 정보를 불러올 수 없습니다.
                    </div>
                ) : (
                    <>
                        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-12 lg:gap-14 items-start lg:min-h-[calc(100vh-235px)]">
                            <div className="min-w-0 flex flex-col gap-10 lg:gap-12">
                                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px] gap-8 lg:gap-10 items-start">
                                    <div className="min-w-0">
                                        <p
                                            className="text-[11px] font-semibold mb-4"
                                            style={{ color: "#9ca3af", letterSpacing: "0.18em" }}
                                        >
                                            ORDER CHECK
                                        </p>
                                        <h1
                                            className="text-[36px] lg:text-[46px] font-black leading-[0.98]"
                                            style={{ color: "#111827", letterSpacing: "-0.05em" }}
                                        >
                                            주문 확인
                                        </h1>
                                        <p className="mt-5 max-w-[520px] text-[14px] leading-[1.9]" style={{ color: "#6b7280" }}>
                                            선택한 옵션, 가격, 적립 혜택을 여유 있게 확인한 뒤 결제를 진행할 수 있어요.
                                        </p>
                                    </div>

                                    <div className="flex justify-center md:justify-end">
                                        <div
                                            className="relative w-full max-w-[170px] overflow-hidden"
                                            style={{
                                                aspectRatio: "0.92 / 1",
                                                borderRadius: 18,
                                                background: "#e5e7eb",
                                            }}
                                        >
                                            {theme.thumbnailUrl ? (
                                                <Image src={theme.thumbnailUrl} alt={theme.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c4c7ce" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                                        <path d="M21 15l-5-5L5 21"/>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_240px] gap-10 lg:gap-12 pt-8" style={{ borderTop: "1px solid rgba(17,24,39,0.08)" }}>
                                    <div className="min-w-0">
                                        <div className="pb-6" style={{ borderBottom: "1px solid rgba(17,24,39,0.08)" }}>
                                            <p className="text-[11px] font-semibold mb-4" style={{ color: "#9ca3af", letterSpacing: "0.18em" }}>
                                                SELECTED THEME
                                            </p>
                                            <h2 className="text-[24px] lg:text-[30px] font-bold leading-[1.2]" style={{ color: "#111827", letterSpacing: "-0.04em" }}>
                                                {theme.title}
                                            </h2>
                                            <p className="text-[13px] mt-3" style={{ color: "#6b7280" }}>
                                                by {theme.author}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-7">
                                            {selectedVersion && (
                                                <>
                                                    <div className="space-y-2">
                                                        <p className="text-[11px] font-medium" style={{ color: "#9ca3af", letterSpacing: "0.08em" }}>테마 종류</p>
                                                        <p className="text-[15px] font-semibold" style={{ color: "#111827" }}>{selectedVersion.os}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[11px] font-medium" style={{ color: "#9ca3af", letterSpacing: "0.08em" }}>옵션 이름</p>
                                                        <p className="text-[15px] font-semibold" style={{ color: "#111827" }}>{selectedVersion.optionName}</p>
                                                    </div>
                                                </>
                                            )}

                                            <div className="space-y-2">
                                                <p className="text-[11px] font-medium" style={{ color: "#9ca3af", letterSpacing: "0.08em" }}>상품 금액</p>
                                                <p className="text-[15px] font-semibold" style={{ color: "#111827" }}>
                                                    {price === 0 ? "무료" : `${price.toLocaleString()}원`}
                                                </p>
                                            </div>

                                            {!isFree ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <p className="text-[11px] font-medium" style={{ color: "#9ca3af", letterSpacing: "0.08em" }}>적립금 사용</p>
                                                        <button
                                                            onClick={() => setUseCredit((v) => !v)}
                                                            disabled={myCredit === 0}
                                                            className="relative w-[46px] h-[25px] rounded-full transition-all duration-300 disabled:opacity-30"
                                                            style={{ background: useCredit ? "#111827" : "#d1d5db" }}
                                                        >
                                                            <div
                                                                className="absolute top-[3px] w-[19px] h-[19px] rounded-full bg-white transition-all duration-300"
                                                                style={{
                                                                    left: useCredit ? "calc(100% - 22px)" : "3px",
                                                                    boxShadow: "0 1px 4px rgba(0,0,0,0.16)",
                                                                }}
                                                            />
                                                        </button>
                                                    </div>
                                                    <p className="text-[13px]" style={{ color: "#6b7280" }}>
                                                        보유 {myCredit.toLocaleString()}원
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <p className="text-[11px] font-medium" style={{ color: "#9ca3af", letterSpacing: "0.08em" }}>구매 방식</p>
                                                    <p className="text-[15px] font-semibold" style={{ color: "#111827" }}>무료 다운로드</p>
                                                </div>
                                            )}

                                            {useCredit && creditToUse > 0 && (
                                                <div className="space-y-2 md:col-span-2">
                                                    <p className="text-[11px] font-medium" style={{ color: "#9ca3af", letterSpacing: "0.08em" }}>차감 예정 적립금</p>
                                                    <p className="text-[15px] font-semibold" style={{ color: "#ef4444" }}>
                                                        −{creditToUse.toLocaleString()}원
                                                    </p>
                                                </div>
                                            )}

                                            <div className="space-y-2 md:col-span-2">
                                                <p className="text-[11px] font-medium" style={{ color: "#9ca3af", letterSpacing: "0.08em" }}>결제 후 이동</p>
                                                <p className="text-[14px] leading-[1.7]" style={{ color: "#4b5563" }}>
                                                    마이페이지의 구매 테마 페이지로 이동해요.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="min-w-0 xl:pt-[38px]">
                                        <p className="text-[11px] font-semibold mb-5" style={{ color: "#9ca3af", letterSpacing: "0.18em" }}>
                                            BENEFITS
                                        </p>
                                        <div className="space-y-7">
                                            <div>
                                                <p className="text-[11px] mb-2" style={{ color: "#9ca3af" }}>구매 적립</p>
                                                <p className="text-[24px] lg:text-[26px] font-black leading-none" style={{ color: isFree ? "#9ca3af" : "#111827", letterSpacing: "-0.04em" }}>
                                                    {isFree ? "0원" : `+${purchaseCreditReward}원`}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] mb-2" style={{ color: "#9ca3af" }}>리뷰 적립</p>
                                                <p className="text-[24px] lg:text-[26px] font-black leading-none" style={{ color: isFree ? "#9ca3af" : "#111827", letterSpacing: "-0.04em" }}>
                                                    {isFree ? "0원" : `+${reviewCreditReward}원`}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] mb-2" style={{ color: "#9ca3af" }}>예상 총 적립</p>
                                                <p className="text-[24px] lg:text-[26px] font-black leading-none" style={{ color: isFree ? "#9ca3af" : "#111827", letterSpacing: "-0.04em" }}>
                                                    {isFree ? "0원" : `+${(purchaseCreditReward + reviewCreditReward).toLocaleString()}원`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="min-w-0 lg:pt-[6px]">
                                <div className="pb-6" style={{ borderBottom: "1px solid rgba(17,24,39,0.08)" }}>
                                    <p className="text-[11px] font-semibold mb-4" style={{ color: "#9ca3af", letterSpacing: "0.18em" }}>
                                        PAYMENT
                                    </p>
                                    <p className="text-[12px] mb-3" style={{ color: "#9ca3af" }}>최종 결제 금액</p>
                                    <p className="text-[32px] lg:text-[38px] font-black leading-none" style={{ color: "#111827", letterSpacing: "-0.04em" }}>
                                        {isFree ? "무료" : payAmount === 0 ? "0원" : `${payAmount.toLocaleString()}원`}
                                    </p>
                                    {!isFree && payAmount !== price && (
                                        <p className="text-[12px] font-semibold mt-4" style={{ color: "#ef4444" }}>
                                            −{creditToUse.toLocaleString()}원 적용
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <p className="mt-5 text-[12px] font-medium" style={{ color: "#ef4444" }}>
                                        {error}
                                    </p>
                                )}

                                <button
                                    onClick={handlePay}
                                    disabled={paying}
                                    className="mt-8 w-full py-[16px] rounded-[14px] text-[15px] font-semibold text-white transition-all duration-150 active:scale-[0.985] disabled:opacity-40"
                                    style={{
                                        background: "#111827",
                                        boxShadow: "0 12px 30px rgba(17,24,39,0.12)",
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {paying
                                        ? "처리 중..."
                                        : isFree
                                            ? "무료 다운로드"
                                            : payAmount === 0
                                                ? "적립금으로 결제하기"
                                                : `${payAmount.toLocaleString()}원 결제하기`}
                                </button>

                                <ul className="mt-8 space-y-3 text-[12px] leading-[1.7]" style={{ color: "#6b7280" }}>
                                    <li>• 구매 적립금은 결제 완료 즉시 지급됩니다.</li>
                                    <li>• 리뷰 적립금은 승인 후 지급됩니다.</li>
                                    <li>• 적립금은 테마 구매 시 현금처럼 사용할 수 있습니다.</li>
                                    <li>• 회원 탈퇴 시 보유 적립금은 소멸됩니다.</li>
                                </ul>
                            </div>
                        </section>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}

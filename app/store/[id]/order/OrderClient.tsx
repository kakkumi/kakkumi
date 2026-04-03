"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";

// --- 디자인 시스템 상수 ---
const COLORS = {
    MAIN_BLUE: "#4A7BF7",
    SUB_ORANGE: "#FF9500",
    BASE_WHITE: "#FFFFFF",
    TEXT_PRIMARY: "#1A1C1E",
    TEXT_SECONDARY: "#606770",
    TEXT_TERTIARY: "#94A3B8",
    BORDER: "#E2E8F0",
};

function getPurchaseCredit(price: number): number {
    if (price === 0) return 0;
    if (price <= 500) return 10;
    if (price <= 1000) return 20;
    if (price <= 1500) return 30;
    if (price <= 2000) return 40;
    return 50;
}

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
    discountPrice: number | null;
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
    const [creditEnabled, setCreditEnabled] = useState(false);
    const [creditInput, setCreditInput] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [userId, setUserId] = useState<string | undefined>();
    const [selectedVersion, setSelectedVersion] = useState<SelectedVersionInfo | null>(null);

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

    const price = (theme?.discountPrice != null && (theme?.price ?? 0) > 0)
        ? theme.discountPrice
        : (theme?.price ?? 0);
    const originalPrice = theme?.price ?? 0;
    const hasDiscount = theme?.discountPrice != null && originalPrice > 0 && theme.discountPrice < originalPrice;
    const isFree = price === 0;
    const purchaseCreditReward = getPurchaseCredit(price);
    const reviewCreditReward = getReviewCredit(price);
    const maxCredit = Math.min(myCredit, price);
    const creditToUse = creditEnabled ? Math.min(creditInput, maxCredit) : 0;
    const payAmount = price - creditToUse;

    const handlePay = async () => {
        if (!theme) return;
        setPaying(true);
        setError("");
        if (creditToUse >= price && price > 0) {  // 🔄 적립금 전액 결제 조건
            try {
                const res = await fetch("/api/payment/credit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ themeId, versionId }),
                });
                const data = await res.json() as { success?: boolean; error?: string };
                if (data.success) { window.location.href = "/mypage?menu=구매+테마"; }
                else { setError(data.error ?? "결제에 실패했습니다."); }
            } catch { setError("오류가 발생했습니다."); }
            finally { setPaying(false); }
            return;
        }
        const clientKey = process.env.NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY;
        if (!clientKey) { setError("결제 설정 오류입니다."); setPaying(false); return; }
        const win = window as unknown as Record<string, unknown>;
        if (!sdkLoaded || typeof win["TossPayments"] === "undefined") {
            setError("결제 모듈을 불러오는 중입니다."); setPaying(false); return;
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
            if (e?.code !== "USER_CANCEL") setError(e?.message ?? "결제 중 오류가 발생했습니다.");
            setPaying(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.BASE_WHITE }}>
            <Header />

            <main className="flex-1 w-full max-w-[950px] mx-auto px-6 py-12 lg:py-16">
                {loading ? (
                    <div className="flex items-center justify-center py-40">
                        <div className="w-10 h-10 rounded-full border-[3px] animate-spin" style={{ borderColor: COLORS.BORDER, borderTopColor: COLORS.MAIN_BLUE }} />
                    </div>
                ) : !theme ? (
                    <div className="text-center py-40" style={{ color: COLORS.TEXT_TERTIARY }}>테마 정보를 불러올 수 없습니다.</div>
                ) : (
                    /* gap-16 -> gap-10 으로 양측 간격 축소 */
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0 items-start">

                        {/* --- LEFT SECTION --- */}
                        <div className="space-y-10">
                            <div>
                                <Link
                                    href={`/store/${themeId}`}
                                    className="inline-flex items-center gap-1.5 mb-7 group"
                                    style={{ color: COLORS.MAIN_BLUE, fontSize: 12, letterSpacing: "0.02em" }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:opacity-70 transition-opacity">
                                        <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                                    </svg>
                                    <span className="group-hover:opacity-70 transition-opacity">상세페이지로 돌아가기</span>
                                </Link>
                                <h1 style={{ fontSize: 44, fontWeight: 800, color: COLORS.TEXT_PRIMARY, letterSpacing: "-0.04em" }}>주문 확인</h1>
                            </div>

                            {/* 메인 썸네일 */}
                            <div className="relative w-full aspect-square max-w-[320px] rounded-[40px] overflow-hidden shadow-sm bg-[#f9f9f9]">
                                {theme.thumbnailUrl ? (
                                    <Image src={theme.thumbnailUrl} alt={theme.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">이미지 없음</div>
                                )}
                            </div>

                            {/* 테마 정보 */}
                            <div className="space-y-8">
                                <div>
                                    <h2 style={{ fontSize: 32, fontWeight: 700, color: COLORS.TEXT_PRIMARY }}>{theme.title}</h2>
                                    <p style={{ fontSize: 16, color: COLORS.TEXT_SECONDARY, marginTop: 4 }}>by {theme.author}</p>
                                </div>

                                <div className="flex gap-16">
                                    {selectedVersion && (
                                        <>
                                            <div className="space-y-2">
                                                <p style={{ fontSize: 12, color: COLORS.TEXT_TERTIARY, fontWeight: 500 }}>운영체제</p>
                                                <p style={{ fontSize: 18, fontWeight: 700, color: COLORS.MAIN_BLUE }}>{selectedVersion.os}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p style={{ fontSize: 12, color: COLORS.TEXT_TERTIARY, fontWeight: 500 }}>옵션</p>
                                                <p style={{ fontSize: 18, fontWeight: 700, color: COLORS.SUB_ORANGE }}>{selectedVersion.optionName}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {/* 🗑️ 상품 금액 블록 제거 */}
                            </div>
                        </div>

                        {/* --- RIGHT SECTION (SIDEBAR) --- */}
                        <aside className="lg:sticky lg:top-10 space-y-10 pt-28">
                            {/* 적립금 사용: 토글로 활성화 후 금액 입력 */}
                            {!isFree && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.TEXT_PRIMARY }}>적립금 사용</p>
                                            <p style={{ fontSize: 12, color: COLORS.TEXT_TERTIARY, marginTop: 2 }}>보유 {myCredit.toLocaleString()}원</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const next = !creditEnabled;
                                                setCreditEnabled(next);
                                                if (!next) setCreditInput(0);
                                            }}
                                            disabled={myCredit === 0}
                                            className="relative w-[46px] h-[25px] rounded-full transition-all duration-300 disabled:opacity-30"
                                            style={{ background: creditEnabled ? COLORS.MAIN_BLUE : COLORS.BORDER }}
                                        >
                                            <div
                                                className="absolute top-[3px] w-[19px] h-[19px] rounded-full bg-white transition-all duration-300"
                                                style={{
                                                    left: creditEnabled ? "calc(100% - 22px)" : "3px",
                                                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                                }}
                                            />
                                        </button>
                                    </div>

                                    {creditEnabled && (
                                        <>
                                            <div
                                                className="flex items-center rounded-[10px] overflow-hidden border"
                                                style={{ borderColor: COLORS.BORDER }}
                                            >
                                                <input
                                                    type="number"
                                                    value={creditInput === 0 ? "" : creditInput}
                                                    onChange={(e) => {
                                                        const val = Math.max(0, Math.min(Number(e.target.value) || 0, maxCredit));
                                                        setCreditInput(val);
                                                    }}
                                                    min={0}
                                                    max={maxCredit}
                                                    placeholder="0"
                                                    className="flex-1 px-3 py-2.5 text-[14px] font-medium outline-none bg-transparent"
                                                    style={{ color: COLORS.TEXT_PRIMARY }}
                                                />
                                                <span className="px-2 text-[13px]" style={{ color: COLORS.TEXT_SECONDARY }}>원</span>
                                                <button
                                                    onClick={() => setCreditInput(maxCredit)}
                                                    className="px-4 py-2.5 text-[12px] font-semibold border-l transition-opacity hover:opacity-70"
                                                    style={{ borderColor: COLORS.BORDER, color: COLORS.MAIN_BLUE, background: "rgba(74,123,247,0.05)" }}
                                                >
                                                    전액
                                                </button>
                                            </div>
                                            {creditToUse > 0 && (
                                                <p className="text-[12px]" style={{ color: COLORS.MAIN_BLUE }}>
                                                    {creditToUse.toLocaleString()}원 차감 예정
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 혜택 정보 */}
                            <div className="space-y-4">
                                <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.TEXT_TERTIARY }}>멤버십 혜택</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[14px]">
                                        <span style={{ color: COLORS.TEXT_SECONDARY }}>구매 적립</span>
                                        <span style={{ fontWeight: 600, color: COLORS.MAIN_BLUE }}>+{purchaseCreditReward}원</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[14px]">
                                        <span style={{ color: COLORS.TEXT_SECONDARY }}>리뷰 적립</span>
                                        <span style={{ fontWeight: 600, color: COLORS.MAIN_BLUE }}>+{reviewCreditReward}원</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t" style={{ borderColor: COLORS.BORDER }}>
                                    <div className="flex justify-between items-center">
                                        <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.TEXT_PRIMARY }}>총 예상 혜택</span>
                                        <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.MAIN_BLUE }}>+{(purchaseCreditReward + reviewCreditReward).toLocaleString()}원</span>
                                    </div>
                                </div>
                            </div>

                            {/* 최종 결제 금액 및 버튼 */}
                            <div className="pt-10 space-y-6">
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.TEXT_TERTIARY, marginBottom: 4 }}>최종 결제 금액</p>
                                    {hasDiscount && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: "rgb(255,59,48)", color: "#fff" }}>
                                                {Math.round((1 - price / originalPrice) * 100)}% 할인
                                            </span>
                                            <span className="text-[14px]" style={{ color: COLORS.TEXT_TERTIARY, textDecoration: "line-through" }}>
                                                {originalPrice.toLocaleString()}원
                                            </span>
                                        </div>
                                    )}
                                    <p style={{ fontSize: 32, fontWeight: 800, color: hasDiscount ? "rgb(255,59,48)" : COLORS.TEXT_PRIMARY, letterSpacing: "-0.02em" }}>
                                        {payAmount.toLocaleString()}원
                                    </p>
                                </div>

                                {error && <p className="text-red-500 text-[12px] font-medium">{error}</p>}

                                <button
                                    onClick={handlePay}
                                    disabled={paying}
                                    className="w-full py-5 rounded-[14px] text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98]"
                                    style={{
                                        backgroundColor: COLORS.MAIN_BLUE,
                                        boxShadow: "0 8px 20px rgba(74, 123, 247, 0.25)",
                                        fontSize: 17
                                    }}
                                >
                                    {paying ? "처리 중..." : `${payAmount.toLocaleString()}원 결제하기`}
                                    {!paying && <span>→</span>}
                                </button>
                                <p className="text-center text-[11px]" style={{ color: COLORS.TEXT_TERTIARY }}>위 버튼을 클릭함으로써 디지털 콘텐츠 구매 약관에 동의하게 됩니다.</p>
                            </div>

                            {/* 하단 아이콘 */}
                            <div className="flex justify-center gap-6 pt-6 border-t" style={{ borderColor: COLORS.BORDER }}>
                                <div className="flex items-center gap-1.5" style={{ color: COLORS.TEXT_TERTIARY, fontSize: 12 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                    <span>보안 결제</span>
                                </div>
                                <div className="flex items-center gap-1.5" style={{ color: COLORS.TEXT_TERTIARY, fontSize: 12 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                    <span>즉시 이용</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

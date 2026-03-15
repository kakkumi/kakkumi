"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import LoginRequiredModal from "@/app/components/LoginRequiredModal";

type Props = {
    isLoggedIn: boolean;
    isSubscribed: boolean;
    subscriptionStatus: string | null;
    role: string | null;
};

const FREE_FEATURES = [
    { label: "테마 에디터 기본 기능", included: true },
    { label: "내 테마 저장 (최대 5개)", included: true },
    { label: "테마 스토어 이용", included: true },
    { label: "꾸미 갤러리 이용", included: true },
    { label: "무료 테마 다운로드", included: true },
    { label: "테마 복사/복제", included: false },
    { label: "내 테마 저장 무제한", included: false },
    { label: "Pro 전용 프리셋 팔레트", included: false },
    { label: "Pro 전용 프로필 뱃지 ✦", included: false },
    { label: "광고 없는 UI (추후 적용)", included: false },
];

const PRO_FEATURES = [
    { label: "테마 에디터 기본 기능", included: true },
    { label: "내 테마 저장 무제한", included: true },
    { label: "테마 스토어 이용", included: true },
    { label: "꾸미 갤러리 이용", included: true },
    { label: "무료 테마 다운로드", included: true },
    { label: "테마 복사/복제", included: true },
    { label: "Pro 전용 프리셋 팔레트", included: true },
    { label: "Pro 전용 프로필 뱃지 ✦", included: true },
    { label: "광고 없는 UI (추후 적용)", included: true },
];

export default function PricingClient({ isLoggedIn, isSubscribed }: Props) {
    const router = useRouter();
    const [loginModal, setLoginModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const handleSubscribe = async () => {
        if (!isLoggedIn) { setLoginModal(true); return; }
        if (isSubscribed) { showToast("이미 구독 중입니다."); return; }

        setLoading(true);
        try {
            const clientKey = process.env.NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY;
            if (!clientKey) {
                showToast("결제 설정 오류입니다.");
                setLoading(false);
                return;
            }

            const win = window as unknown as Record<string, unknown>;
            const TossPayments = win["TossPayments"] as ((key: string) => { requestPayment: (method: string, opts: Record<string, unknown>) => Promise<void> }) | undefined;
            if (!TossPayments) {
                showToast("결제 모듈 로딩 중입니다. 잠시 후 다시 시도해주세요.");
                setLoading(false);
                return;
            }

            const toss = TossPayments(clientKey);
            const orderId = `sub_${Date.now().toString(36)}`;

            await toss.requestPayment("카드", {
                amount: 4900,
                orderId,
                orderName: "카꾸미 Pro 구독 (1개월)",
                customerName: "카꾸미 고객",
                successUrl: `${window.location.origin}/payment/subscription/success`,
                failUrl: `${window.location.origin}/pricing?fail=1`,
            });
            // requestPayment는 페이지 리다이렉트됨 — 이후 코드 실행 안 됨
        } catch (e: unknown) {
            if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "USER_CANCEL") {
                showToast("결제가 취소되었습니다.");
            } else {
                showToast("결제 처리 중 오류가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 pt-16 pb-24">
            {/* 토스트 */}
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl text-[13px] font-medium shadow-lg"
                    style={{ background: "#18181b", color: "#fff" }}>
                    {toast}
                </div>
            )}

            {loginModal && (
                <LoginRequiredModal
                    message="구독하려면 로그인이 필요해요."
                    onClose={() => setLoginModal(false)}
                />
            )}

            {/* 헤더 */}
            <div className="text-center mb-16">
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#FF9500" }}>Pricing</p>
                <h1 className="text-[40px] font-extrabold leading-tight mb-4" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                    카꾸미 요금제
                </h1>
                <p className="text-[16px]" style={{ color: "#8e8e93" }}>
                    더 자유롭게, 더 창의적으로 나만의 테마를 만들어보세요.
                </p>
            </div>

            {/* 플랜 카드 */}
            <div className="grid grid-cols-2 gap-6 max-w-[860px] mx-auto mb-20">

                {/* 무료 플랜 */}
                <div className="rounded-3xl p-8 flex flex-col gap-6"
                    style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.07)" }}>
                    <div>
                        <p className="text-[12px] font-bold tracking-widest uppercase mb-2" style={{ color: "#aeaeb2" }}>Free</p>
                        <div className="flex items-end gap-1 mb-1">
                            <span className="text-[40px] font-extrabold" style={{ color: "#1c1c1e" }}>0</span>
                            <span className="text-[18px] font-medium mb-2" style={{ color: "#8e8e93" }}>원 / 월</span>
                        </div>
                        <p className="text-[13px]" style={{ color: "#aeaeb2" }}>기본적인 테마 제작과 스토어 이용</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {FREE_FEATURES.map((f) => (
                            <div key={f.label} className="flex items-center gap-2.5">
                                {f.included ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                                        <circle cx="12" cy="12" r="12" fill="rgba(52,199,89,0.12)" />
                                        <path d="M7 12l4 4 6-6" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                                        <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.05)" />
                                        <path d="M8 12h8" stroke="#c7c7cc" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                )}
                                <span className="text-[13px]" style={{ color: f.included ? "#3a3a3c" : "#c7c7cc" }}>{f.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto pt-2">
                        <div className="w-full py-3 rounded-2xl text-[14px] font-semibold text-center"
                            style={{ background: "rgba(0,0,0,0.05)", color: "#aeaeb2" }}>
                            현재 플랜
                        </div>
                    </div>
                </div>

                {/* Pro 플랜 */}
                <div className="rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden"
                    style={{ background: "linear-gradient(145deg, #1c1c1e 0%, #2c2c2e 100%)", border: "1.5px solid rgba(255,255,255,0.08)" }}>

                    {/* 추천 뱃지 */}
                    <div className="absolute top-6 right-6 px-3 py-1 rounded-full text-[11px] font-bold"
                        style={{ background: "rgba(255,149,0,0.2)", color: "#FF9500", border: "1px solid rgba(255,149,0,0.3)" }}>
                        추천
                    </div>

                    <div>
                        <p className="text-[12px] font-bold tracking-widest uppercase mb-2" style={{ color: "#FF9500" }}>Pro</p>
                        <div className="flex items-end gap-1 mb-1">
                            <span className="text-[40px] font-extrabold" style={{ color: "#fff" }}>4,900</span>
                            <span className="text-[18px] font-medium mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>원 / 월</span>
                        </div>
                        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>제한 없이 마음껏 테마를 만들어보세요</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {PRO_FEATURES.map((f) => (
                            <div key={f.label} className="flex items-center gap-2.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                                    <circle cx="12" cy="12" r="12" fill="rgba(255,149,0,0.2)" />
                                    <path d="M7 12l4 4 6-6" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.85)" }}>{f.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto pt-2">
                        {isSubscribed ? (
                            <div className="flex flex-col gap-2">
                                <div className="w-full py-3 rounded-2xl text-[14px] font-semibold text-center"
                                    style={{ background: "rgba(255,149,0,0.15)", color: "#FF9500" }}>
                                    ✦ 구독 중
                                </div>
                                <button
                                    onClick={() => router.push("/mypage?menu=결제+정보")}
                                    className="w-full py-2 rounded-2xl text-[12px] font-medium transition-opacity hover:opacity-70"
                                    style={{ color: "rgba(255,255,255,0.35)" }}>
                                    결제 정보 관리
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleSubscribe} disabled={loading}
                                className="w-full py-3 rounded-2xl text-[14px] font-bold transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #FF9500, #FF6B00)", color: "#fff", boxShadow: "0 4px 20px rgba(255,149,0,0.35)" }}>
                                {loading ? "처리 중..." : "Pro 시작하기"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 기능 비교 테이블 */}
            <div className="max-w-[860px] mx-auto">
                <h2 className="text-[20px] font-bold mb-8 text-center" style={{ color: "#1c1c1e" }}>상세 기능 비교</h2>
                <div className="rounded-3xl overflow-hidden" style={{ border: "1.5px solid rgba(0,0,0,0.07)" }}>
                    {/* 테이블 헤더 */}
                    <div className="grid grid-cols-3 px-6 py-4" style={{ background: "#f7f7f8", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                        <div className="text-[12px] font-bold" style={{ color: "#aeaeb2" }}>기능</div>
                        <div className="text-[13px] font-bold text-center" style={{ color: "#aeaeb2" }}>Free</div>
                        <div className="text-[13px] font-bold text-center" style={{ color: "#FF9500" }}>Pro</div>
                    </div>

                    {[
                        { category: "테마 에디터", rows: [
                            { label: "테마 에디터 기본 이용", free: "✓", pro: "✓" },
                            { label: "내 테마 저장", free: "최대 5개", pro: "무제한" },
                            { label: "테마 복사/복제", free: "✗", pro: "✓" },
                            { label: "Pro 전용 프리셋 팔레트", free: "✗", pro: "✓" },
                            { label: "Ctrl+Z / 실행취소·복구", free: "✗", pro: "✓" },
                        ]},
                        { category: "스토어 & 커뮤니티", rows: [
                            { label: "테마 스토어 이용", free: "✓", pro: "✓" },
                            { label: "무료 테마 다운로드", free: "✓", pro: "✓" },
                            { label: "유료 테마 구매", free: "✓", pro: "✓" },
                            { label: "꾸미 갤러리 이용", free: "✓", pro: "✓" },
                        ]},
                        { category: "혜택", rows: [
                            { label: "Pro 전용 프로필 뱃지 ✦", free: "✗", pro: "✓" },
                            { label: "광고 없는 UI", free: "✗", pro: "✓ (추후 적용)" },
                        ]},
                    ].map((section) => (
                        <div key={section.category}>
                            <div className="px-6 py-3" style={{ background: "rgba(255,149,0,0.04)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#FF9500" }}>{section.category}</span>
                            </div>
                            {section.rows.map((row, i) => (
                                <div key={row.label} className="grid grid-cols-3 px-6 py-4 items-center"
                                    style={{ borderBottom: i < section.rows.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none", background: "#fff" }}>
                                    <span className="text-[13px]" style={{ color: "#3a3a3c" }}>{row.label}</span>
                                    <span className="text-[13px] text-center font-medium"
                                        style={{ color: row.free === "✗" ? "#e5e5ea" : row.free === "✓" ? "#34c759" : "#3a3a3c" }}>
                                        {row.free}
                                    </span>
                                    <span className="text-[13px] text-center font-semibold"
                                        style={{ color: row.pro === "✗" ? "#e5e5ea" : "#FF9500" }}>
                                        {row.pro}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* 하단 CTA */}
            {!isSubscribed && (
                <div className="text-center mt-16">
                    <button onClick={handleSubscribe} disabled={loading}
                        className="px-10 py-4 rounded-2xl text-[15px] font-bold transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #FF9500, #FF6B00)", color: "#fff", boxShadow: "0 8px 30px rgba(255,149,0,0.3)" }}>
                        {loading ? "처리 중..." : "지금 Pro 시작하기 — 월 4,900원"}
                    </button>
                    <p className="text-[12px] mt-3" style={{ color: "#aeaeb2" }}>언제든지 해지 가능 · 해지 후 기간 만료까지 혜택 유지</p>
                </div>
            )}

            {/* 토스페이먼츠 SDK */}
            <Script src="https://js.tosspayments.com/v1/payment" strategy="beforeInteractive" />
        </main>
    );
}

"use client";

import { useState } from "react";
import type { SessionUser } from "@/lib/session";

type Props = {
    session: SessionUser | null;
};

type NotifKey =
    | "purchaseComplete"
    | "newReview"
    | "reviewReply"
    | "inquiryReply"
    | "newTheme"
    | "promotionEvent"
    | "serviceBroadcast";

type NotifSettings = Record<NotifKey, boolean>;

const NOTIFICATION_GROUPS: {
    category: string;
    items: { key: NotifKey; label: string; desc: string }[];
}[] = [
    {
        category: "구매 / 다운로드",
        items: [
            { key: "purchaseComplete", label: "구매 완료 알림", desc: "테마 결제가 완료되면 알려드립니다." },
        ],
    },
    {
        category: "리뷰 & 문의",
        items: [
            { key: "newReview", label: "새 리뷰 알림", desc: "내 테마에 리뷰가 등록되면 알려드립니다." },
            { key: "reviewReply", label: "리뷰 답글 알림", desc: "내가 작성한 리뷰에 답글이 달리면 알려드립니다." },
            { key: "inquiryReply", label: "문의 답변 알림", desc: "1:1 문의에 답변이 등록되면 알려드립니다." },
        ],
    },
    {
        category: "테마 스토어",
        items: [
            { key: "newTheme", label: "신규 테마 알림", desc: "팔로우한 크리에이터가 새 테마를 등록하면 알려드립니다." },
            { key: "promotionEvent", label: "할인 / 이벤트 알림", desc: "관심 테마의 가격 변동이나 이벤트를 알려드립니다." },
        ],
    },
    {
        category: "서비스",
        items: [
            { key: "serviceBroadcast", label: "공지 및 서비스 알림", desc: "카꾸미의 공지사항과 업데이트 소식을 알려드립니다." },
        ],
    },
];

export default function NotificationsClient({ session }: Props) {
    const [settings, setSettings] = useState<NotifSettings>({
        purchaseComplete: true,
        newReview: true,
        reviewReply: true,
        inquiryReply: true,
        newTheme: false,
        promotionEvent: false,
        serviceBroadcast: true,
    });
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const toggle = (key: NotifKey) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
        setSaveSuccess(false);
    };

    const handleSaveAll = async () => {
        setSaving(true);
        // TODO: 실제 API 연동 시 여기서 fetch("/api/user/notifications", ...) 호출
        await new Promise((r) => setTimeout(r, 600));
        setSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    if (!session?.dbId) {
        return (
            <div className="flex flex-1 max-w-[1200px] mx-auto w-full px-6 pt-12 pb-20 justify-center">
                <div
                    className="flex flex-col items-center gap-6 p-12 rounded-[32px] w-full max-w-[500px]"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                    }}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#f5f5f5" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </div>
                    <div className="flex flex-col gap-2 text-center">
                        <h2 className="text-[22px] font-bold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>로그인이 필요해요</h2>
                        <p className="text-[14px]" style={{ color: "#8e8e93" }}>알림 설정을 이용하려면 로그인을 해주세요.</p>
                    </div>
                    <a href="/api/auth/kakao">
                        <button
                            className="px-8 py-3.5 rounded-xl text-[15px] font-bold transition-all active:scale-95 hover:brightness-105"
                            style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.3)" }}
                        >
                            카카오 로그인
                        </button>
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 max-w-[1200px] mx-auto w-full px-6 pt-12 pb-20 gap-8">
            {/* 사이드바 */}
            <aside className="w-[220px] shrink-0 flex flex-col gap-1">
                <a href="/mypage">
                    <button
                        className="flex items-center gap-2 text-[13px] font-medium px-3 py-2 rounded-xl transition-all hover:opacity-70 mb-2"
                        style={{ color: "#8e8e93" }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        마이페이지로
                    </button>
                </a>
                <div className="h-[1px] mb-3" style={{ background: "rgba(0,0,0,0.08)" }} />
                {[
                    { label: "기본 정보", href: "/mypage/settings", active: false },
                    { label: "알림 설정", href: "/mypage/settings/notifications", active: true },
                ].map((item) => (
                    <a key={item.label} href={item.href}>
                        <button
                            className="w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                            style={{
                                color: item.active ? "#FF9500" : "#3a3a3c",
                                background: "transparent",
                                fontWeight: item.active ? 700 : 500,
                            }}
                        >
                            {item.label}
                        </button>
                    </a>
                ))}
                <div className="my-3 h-[1px]" style={{ background: "rgba(0,0,0,0.08)" }} />
                <a href="/mypage/settings/withdraw">
                    <button
                        className="w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all hover:opacity-70"
                        style={{ color: "#ff3b30" }}
                    >
                        회원 탈퇴
                    </button>
                </a>
            </aside>

            {/* 메인 */}
            <main className="flex-1 flex flex-col gap-6">
                {/* 타이틀 */}
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>알림 설정</h1>
                        <p className="text-[13px] mt-1" style={{ color: "#8e8e93" }}>받고 싶은 알림을 직접 선택하세요.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {saveSuccess && (
                            <span className="text-[12px] font-medium" style={{ color: "#34c759" }}>✓ 저장되었습니다.</span>
                        )}
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 active:scale-95 disabled:opacity-40"
                            style={{ background: "#FF9500", color: "#fff" }}
                        >
                            {saving ? "저장 중..." : "변경사항 저장"}
                        </button>
                    </div>
                </div>

                {/* 알림 그룹 */}
                {NOTIFICATION_GROUPS.map((group) => (
                    <div
                        key={group.category}
                        className="p-7 rounded-[24px] flex flex-col gap-5"
                        style={{
                            background: "rgba(255,255,255,0.7)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(255,255,255,0.8)",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                        }}
                    >
                        <h3 className="text-[13px] font-bold tracking-[0.08em] uppercase" style={{ color: "#8e8e93" }}>
                            {group.category}
                        </h3>
                        <div className="flex flex-col gap-1">
                            {group.items.map((item, idx) => (
                                <div key={item.key}>
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[14px] font-medium" style={{ color: "#1c1c1e" }}>{item.label}</span>
                                            <span className="text-[12px]" style={{ color: "#8e8e93" }}>{item.desc}</span>
                                        </div>
                                        {/* 토글 */}
                                        <button
                                            type="button"
                                            onClick={() => toggle(item.key)}
                                            className="relative shrink-0 transition-all active:scale-95"
                                            style={{ width: 44, height: 24 }}
                                            aria-label={settings[item.key] ? "끄기" : "켜기"}
                                        >
                                            <div
                                                className="absolute inset-0 rounded-full transition-colors duration-200"
                                                style={{ background: settings[item.key] ? "#FF9500" : "rgba(0,0,0,0.12)" }}
                                            />
                                            <div
                                                className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all duration-200"
                                                style={{
                                                    left: settings[item.key] ? 23 : 3,
                                                    boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                                                }}
                                            />
                                        </button>
                                    </div>
                                    {idx < group.items.length - 1 && (
                                        <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.06)" }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* 안내 */}
                <div
                    className="px-5 py-4 rounded-[16px] flex items-start gap-3"
                    style={{ background: "rgba(74,123,247,0.07)", border: "1px solid rgba(74,123,247,0.12)" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-[12px] leading-relaxed" style={{ color: "#3a5a8a" }}>
                        알림은 서비스 내 알림으로 제공됩니다. 이메일·푸시 알림은 추후 지원 예정입니다.
                        법적 필수 공지(이용약관 변경 등)는 설정과 관계없이 발송될 수 있습니다.
                    </p>
                </div>
            </main>
        </div>
    );
}

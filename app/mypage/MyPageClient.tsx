'use client';

import { useState } from "react";
import ThemeVaultTabs from "./ThemeVaultTabs";

type SidebarMenu = {
    category: string;
    items: { label: string }[];
};

type Tab = "mine" | "purchased" | "all";

const THEME_TAB_MAP: Record<string, Tab> = {
    "내 테마": "mine",
    "구매 테마": "purchased",
    "전체 테마": "all",
};

type Props = {
    session: { name?: string | null; image?: string | null } | null;
    purchasedCount: number;
    sidebarMenus: SidebarMenu[];
};

const ORDERS = [
    { name: "봄 벚꽃 테마", date: "2026.02.28", status: "결제완료" },
    { name: "다크 미니멀 테마", date: "2026.02.20", status: "결제완료" },
    { name: "파스텔 블루 테마", date: "2026.02.10", status: "결제완료" },
];

const RECENT_THEMES = [
    { name: "네온 퍼플", bg: "#e8d4f5" },
    { name: "오션 블루", bg: "#aabde8" },
    { name: "선셋 오렌지", bg: "#fdd8c4" },
    { name: "민트 그린", bg: "#d4f5e8" },
];

export default function MyPageClient({ session, purchasedCount, sidebarMenus }: Props) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [themeTab, setThemeTab] = useState<Tab>("purchased");

    const isThemeMenu = activeMenu !== null && THEME_TAB_MAP[activeMenu] !== undefined;

    const handleMenuClick = (label: string) => {
        if (THEME_TAB_MAP[label] !== undefined) {
            setThemeTab(THEME_TAB_MAP[label]);
            setActiveMenu(label);
        } else {
            setActiveMenu(label);
        }
    };

    return (
        <div className="flex flex-1 max-w-[1200px] mx-auto w-full px-6 pt-12 pb-20 gap-8">
            {/* ── 사이드바 ── */}
            <aside className="w-[220px] shrink-0 flex flex-col gap-1">
                {sidebarMenus.map((group, index) => (
                    <div key={group.category} className="flex flex-col gap-0.5">
                        <span
                            className="text-[11px] font-bold tracking-[0.15em] uppercase px-3 mb-1"
                            style={{ color: "#8e8e93" }}
                        >
                            {group.category}
                        </span>
                        {group.items.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleMenuClick(item.label)}
                                className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                                style={{
                                    color: activeMenu === item.label ? "#FF9500" : "#3a3a3c",
                                    background: activeMenu === item.label ? "rgba(255,149,0,0.08)" : "transparent",
                                    fontWeight: activeMenu === item.label ? 700 : 500,
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                        {index < sidebarMenus.length - 1 && (
                            <div className="my-3 h-[1px]" style={{ background: "rgba(0,0,0,0.18)" }} />
                        )}
                    </div>
                ))}
            </aside>

            {/* ── 메인 콘텐츠 ── */}
            <main className="flex-1 flex flex-col gap-6">
                {session ? (
                    <>
                        {/* 프로필 */}
                        <div
                            className="flex items-center gap-5 p-7 rounded-[24px]"
                            style={{
                                background: "rgba(255,255,255,0.35)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(255,255,255,0.6)",
                                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                            }}
                        >
                            <div
                                className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                                style={{ background: "#ffe500", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
                            >
                                {session.image ? (
                                    <img src={session.image} alt={session.name ?? "프로필"} className="w-full h-full object-cover" />
                                ) : (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3A1D1D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[20px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                                    {session.name ?? "사용자"}
                                </h2>
                                <p className="text-[12px]" style={{ color: "#8e8e93" }}>가입일 · 2026년 3월</p>
                            </div>
                        </div>

                        {/* 수치 카드 */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: "제작한 테마", value: "0개", color: "rgba(255,239,154,0.7)" },
                                { label: "구매한 테마", value: `${purchasedCount}개`, color: "rgba(170,189,232,0.6)" },
                                { label: "적립금", value: "0원", color: "rgba(212,245,212,0.8)" },
                                { label: "쿠폰", value: "0장", color: "rgba(253,216,229,0.7)" },
                            ].map((card) => (
                                <div
                                    key={card.label}
                                    className="flex flex-col gap-2 p-5 rounded-[20px] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
                                    style={{ background: card.color, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                                >
                                    <span className="text-[11px] font-semibold" style={{ color: "rgba(0,0,0,0.45)" }}>{card.label}</span>
                                    <span className="text-[22px] font-extrabold" style={{ color: "#1c1c1e" }}>{card.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* 테마 메뉴 or 최근 활동 */}
                        {isThemeMenu ? (
                            <ThemeVaultTabs initialTab={themeTab} />
                        ) : (
                            <div
                                className="flex flex-col gap-5 p-7 rounded-[24px]"
                                style={{
                                    background: "rgba(255,255,255,0.7)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255,255,255,0.8)",
                                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                                }}
                            >
                                <h3 className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>최근 활동</h3>

                                <div className="flex flex-col gap-2">
                                    <span className="text-[12px] font-bold tracking-[0.1em] uppercase" style={{ color: "#8e8e93" }}>최근 주문 내역</span>
                                    <div className="flex flex-col gap-2">
                                        {ORDERS.map((order) => (
                                            <div
                                                key={order.name}
                                                className="flex items-center justify-between px-4 py-3 rounded-[14px]"
                                                style={{ background: "rgba(0,0,0,0.03)" }}
                                            >
                                                <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>{order.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[12px]" style={{ color: "#8e8e93" }}>{order.date}</span>
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FFEF9A", color: "#3A1D1D" }}>{order.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.07)" }} />

                                <div className="flex flex-col gap-2">
                                    <span className="text-[12px] font-bold tracking-[0.1em] uppercase" style={{ color: "#8e8e93" }}>작성 가능한 리뷰</span>
                                    <div
                                        className="flex items-center justify-between px-4 py-3 rounded-[14px]"
                                        style={{ background: "rgba(0,0,0,0.03)" }}
                                    >
                                        <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>봄 벚꽃 테마 리뷰를 작성해보세요</span>
                                        <button
                                            className="text-[12px] font-semibold px-3 py-1 rounded-full transition-all hover:brightness-105"
                                            style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D" }}
                                        >
                                            리뷰 쓰기
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.07)" }} />

                                <div className="flex flex-col gap-2">
                                    <span className="text-[12px] font-bold tracking-[0.1em] uppercase" style={{ color: "#8e8e93" }}>최근 본 테마</span>
                                    <div className="flex gap-3">
                                        {RECENT_THEMES.map((theme) => (
                                            <div
                                                key={theme.name}
                                                className="flex flex-col items-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
                                            >
                                                <div
                                                    className="w-14 h-14 rounded-[14px]"
                                                    style={{ background: theme.bg, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                                                />
                                                <span className="text-[11px] font-medium" style={{ color: "#3a3a3c" }}>{theme.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div
                        className="flex flex-col items-center gap-6 p-12 rounded-[32px]"
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
                            <p className="text-[14px]" style={{ color: "#8e8e93" }}>마이페이지를 이용하려면 카카오 로그인을 해주세요.</p>
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
                )}
            </main>
        </div>
    );
}

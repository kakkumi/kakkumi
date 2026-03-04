'use client';

import { useState, useEffect, useRef } from "react";
import ThemeVaultTabs from "./ThemeVaultTabs";
import { validateNickname } from "@/lib/nickname";

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
    session: { name?: string | null; nickname?: string | null; image?: string | null } | null;
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

    // 닉네임 수정 상태
    const [displayNickname, setDisplayNickname] = useState<string>(
        session?.nickname ?? session?.name ?? "사용자"
    );
    const [editingNick, setEditingNick] = useState(false);
    const [nickInput, setNickInput] = useState(displayNickname);
    const [nickError, setNickError] = useState("");
    const [nickCheckStatus, setNickCheckStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
    const [nickSaving, setNickSaving] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!editingNick) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const validationError = validateNickname(nickInput);
        if (validationError) {
            setNickError(validationError);
            setNickCheckStatus("idle");
            return;
        }
        // 현재 닉네임과 동일하면 체크 불필요
        if (nickInput.trim() === displayNickname) {
            setNickError("");
            setNickCheckStatus("available");
            return;
        }

        setNickError("");
        setNickCheckStatus("checking");

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/user/nickname/check?nickname=${encodeURIComponent(nickInput.trim())}`);
                const data = await res.json() as { available: boolean; error?: string };
                if (data.error) {
                    setNickError(data.error);
                    setNickCheckStatus("idle");
                } else {
                    setNickCheckStatus(data.available ? "available" : "taken");
                    if (!data.available) setNickError("이미 사용 중인 닉네임입니다.");
                }
            } catch {
                setNickCheckStatus("idle");
            }
        }, 500);
    }, [nickInput, editingNick, displayNickname]);

    const handleNickSave = async () => {
        if (nickCheckStatus !== "available" || nickSaving) return;
        setNickSaving(true);
        setNickError("");
        const res = await fetch("/api/user/nickname", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname: nickInput.trim() }),
        });
        const data = await res.json() as { nickname?: string; error?: string };
        setNickSaving(false);
        if (!res.ok) {
            setNickError(data.error ?? "저장 실패");
        } else {
            setDisplayNickname(data.nickname ?? nickInput.trim());
            setEditingNick(false);
            setNickCheckStatus("idle");
        }
    };

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
                                    background: "transparent",
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
                            <div className="flex flex-col gap-1.5">
                                {editingNick ? (
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <input
                                                    value={nickInput}
                                                    onChange={(e) => setNickInput(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === "Enter") handleNickSave(); if (e.key === "Escape") setEditingNick(false); }}
                                                    maxLength={10}
                                                    autoFocus
                                                    className="text-[18px] font-extrabold px-3 py-1.5 rounded-xl outline-none pr-8"
                                                    style={{
                                                        border: `1.5px solid ${nickCheckStatus === "available" ? "#34c759" : nickCheckStatus === "taken" || nickError ? "#ff3b30" : "#FF9500"}`,
                                                        color: "#1c1c1e",
                                                        width: 200,
                                                        fontFamily: "'ChosunIlboMyungjo', serif",
                                                    }}
                                                />
                                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                                    {nickCheckStatus === "checking" && <div className="w-3.5 h-3.5 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />}
                                                    {nickCheckStatus === "available" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                                                    {nickCheckStatus === "taken" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleNickSave}
                                                disabled={nickSaving || nickCheckStatus !== "available"}
                                                className="px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all hover:brightness-105 active:scale-95 disabled:opacity-40"
                                                style={{ background: "#FF9500", color: "#fff" }}
                                            >
                                                {nickSaving ? "저장 중..." : "저장"}
                                            </button>
                                            <button
                                                onClick={() => { setEditingNick(false); setNickInput(displayNickname); setNickError(""); setNickCheckStatus("idle"); }}
                                                className="px-3 py-1.5 rounded-xl text-[12px] font-medium text-gray-400 hover:text-gray-700 transition-all"
                                            >
                                                취소
                                            </button>
                                        </div>
                                        <p className="text-[11px]" style={{ color: nickCheckStatus === "available" ? "#34c759" : "#ff3b30", minHeight: 16 }}>
                                            {nickCheckStatus === "available" && !nickError ? "사용 가능한 닉네임입니다." : nickError}
                                        </p>
                                        <p className="text-[11px]" style={{ color: "#8e8e93" }}>{nickInput.trim().length} / 10자</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[20px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                                            {displayNickname}
                                        </h2>
                                        <button
                                            onClick={() => { setEditingNick(true); setNickInput(displayNickname); }}
                                            className="flex items-center gap-1 text-[11px] font-medium transition-all hover:opacity-70"
                                            style={{ color: "#8e8e93" }}
                                            title="닉네임 변경"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                            닉네임 변경
                                        </button>
                                    </div>
                                )}
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

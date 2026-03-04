"use client";

import { useState } from "react";
import { formatKST } from "@/lib/date";

type Stats = {
    userCount: number;
    themeCount: number;
    purchaseCount: number;
    inquiryCount: number;
};

type User = {
    id: string;
    name: string;
    nickname: string | null;
    email: string | null;
    role: string;
    createdAt: string;
};

type Purchase = {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    buyerName: string;
    themeTitle: string;
};

type Tab = "overview" | "users" | "purchases" | "inquiries";

type Props = {
    stats: Stats;
    recentUsers: User[];
    recentPurchases: Purchase[];
};

const ROLE_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    ADMIN:   { label: "관리자",    bg: "rgba(255,59,48,0.12)",   color: "#ff3b30" },
    CREATOR: { label: "크리에이터", bg: "rgba(255,149,0,0.12)",   color: "#FF9500" },
    USER:    { label: "일반 회원",  bg: "rgba(0,122,255,0.10)",   color: "#007aff" },
};

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    COMPLETED: { label: "결제 완료", bg: "rgba(52,199,89,0.12)",  color: "#34c759" },
    PENDING:   { label: "대기 중",   bg: "rgba(255,149,0,0.12)",  color: "#FF9500" },
    REFUNDED:  { label: "환불",      bg: "rgba(255,59,48,0.12)",  color: "#ff3b30" },
};

export default function AdminClient({ stats, recentUsers, recentPurchases }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("overview");

    const TABS: { key: Tab; label: string }[] = [
        { key: "overview",   label: "대시보드" },
        { key: "users",      label: "회원 관리" },
        { key: "purchases",  label: "구매 내역" },
        { key: "inquiries",  label: "문의 관리" },
    ];

    const STAT_CARDS = [
        { label: "전체 회원", value: stats.userCount, icon: "user",     color: "#007aff" },
        { label: "등록 테마", value: stats.themeCount, icon: "theme",    color: "#FF9500" },
        { label: "완료 구매", value: stats.purchaseCount, icon: "cart",  color: "#34c759" },
        { label: "전체 문의", value: stats.inquiryCount, icon: "inquiry", color: "#af52de" },
    ];

    return (
        <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 pt-10 pb-20 flex flex-col gap-7">
            {/* 타이틀 */}
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(255,59,48,0.12)" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </div>
                <div>
                    <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>관리자 페이지</h1>
                    <p className="text-[12px]" style={{ color: "#8e8e93" }}>카꾸미 서비스 전체 현황을 관리합니다.</p>
                </div>
            </div>

            {/* 탭 */}
            <div className="flex gap-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                        style={{
                            background: activeTab === tab.key ? "#1c1c1e" : "rgba(0,0,0,0.05)",
                            color: activeTab === tab.key ? "#fff" : "#3a3a3c",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── 대시보드 ── */}
            {activeTab === "overview" && (
                <div className="flex flex-col gap-6">
                    {/* 통계 카드 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {STAT_CARDS.map((card) => (
                            <div
                                key={card.label}
                                className="p-6 rounded-[20px] flex flex-col gap-3"
                                style={{
                                    background: "rgba(255,255,255,0.7)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255,255,255,0.8)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                                }}
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: `${card.color}18` }}
                                >
                                    {card.icon === "user" && (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                                        </svg>
                                    )}
                                    {card.icon === "theme" && (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>
                                        </svg>
                                    )}
                                    {card.icon === "cart" && (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                        </svg>
                                    )}
                                    {card.icon === "inquiry" && (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[28px] font-extrabold leading-none" style={{ color: "#1c1c1e" }}>
                                        {card.value.toLocaleString()}
                                    </p>
                                    <p className="text-[12px] mt-1" style={{ color: "#8e8e93" }}>{card.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 최근 가입 회원 + 최근 구매 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* 최근 가입 회원 */}
                        <div
                            className="p-6 rounded-[20px] flex flex-col gap-4"
                            style={{
                                background: "rgba(255,255,255,0.7)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(255,255,255,0.8)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                            }}
                        >
                            <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>최근 가입 회원</h3>
                            <div className="flex flex-col gap-3">
                                {recentUsers.slice(0, 5).map((user) => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>
                                                {user.nickname ?? user.name}
                                            </span>
                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>{formatKST(user.createdAt, false)}</span>
                                        </div>
                                        <span
                                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{
                                                background: ROLE_STYLE[user.role]?.bg ?? "rgba(0,0,0,0.07)",
                                                color: ROLE_STYLE[user.role]?.color ?? "#8e8e93",
                                            }}
                                        >
                                            {ROLE_STYLE[user.role]?.label ?? user.role}
                                        </span>
                                    </div>
                                ))}
                                {recentUsers.length === 0 && (
                                    <p className="text-[13px]" style={{ color: "#8e8e93" }}>가입 회원이 없습니다.</p>
                                )}
                            </div>
                        </div>

                        {/* 최근 구매 */}
                        <div
                            className="p-6 rounded-[20px] flex flex-col gap-4"
                            style={{
                                background: "rgba(255,255,255,0.7)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(255,255,255,0.8)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                            }}
                        >
                            <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>최근 구매</h3>
                            <div className="flex flex-col gap-3">
                                {recentPurchases.slice(0, 5).map((p) => (
                                    <div key={p.id} className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>{p.themeTitle}</span>
                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>
                                                {p.buyerName} · {formatKST(p.createdAt, false)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] font-bold" style={{ color: "#1c1c1e" }}>
                                                {p.amount.toLocaleString()}원
                                            </span>
                                            <span
                                                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                                style={{
                                                    background: STATUS_STYLE[p.status]?.bg ?? "rgba(0,0,0,0.07)",
                                                    color: STATUS_STYLE[p.status]?.color ?? "#8e8e93",
                                                }}
                                            >
                                                {STATUS_STYLE[p.status]?.label ?? p.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {recentPurchases.length === 0 && (
                                    <p className="text-[13px]" style={{ color: "#8e8e93" }}>구매 내역이 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 회원 관리 ── */}
            {activeTab === "users" && (
                <div
                    className="rounded-[20px] overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    }}
                >
                    <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                        <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>회원 목록 (최근 10명)</h3>
                    </div>
                    <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                        {recentUsers.map((user) => (
                            <div key={user.id} className="px-6 py-4 flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-[13px] font-semibold truncate" style={{ color: "#1c1c1e" }}>
                                        {user.nickname ?? user.name}
                                    </span>
                                    <span className="text-[11px] truncate" style={{ color: "#8e8e93" }}>
                                        {user.email ?? "이메일 없음"} · 가입 {formatKST(user.createdAt, false)}
                                    </span>
                                </div>
                                <span
                                    className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                    style={{
                                        background: ROLE_STYLE[user.role]?.bg ?? "rgba(0,0,0,0.07)",
                                        color: ROLE_STYLE[user.role]?.color ?? "#8e8e93",
                                    }}
                                >
                                    {ROLE_STYLE[user.role]?.label ?? user.role}
                                </span>
                            </div>
                        ))}
                        {recentUsers.length === 0 && (
                            <div className="px-6 py-10 text-center text-[13px]" style={{ color: "#8e8e93" }}>회원이 없습니다.</div>
                        )}
                    </div>
                </div>
            )}

            {/* ── 구매 내역 ── */}
            {activeTab === "purchases" && (
                <div
                    className="rounded-[20px] overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    }}
                >
                    <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                        <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>구매 내역 (최근 10건)</h3>
                    </div>
                    <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                        {recentPurchases.map((p) => (
                            <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-[13px] font-semibold truncate" style={{ color: "#1c1c1e" }}>{p.themeTitle}</span>
                                    <span className="text-[11px]" style={{ color: "#8e8e93" }}>
                                        구매자: {p.buyerName} · {formatKST(p.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>
                                        {p.amount.toLocaleString()}원
                                    </span>
                                    <span
                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                        style={{
                                            background: STATUS_STYLE[p.status]?.bg ?? "rgba(0,0,0,0.07)",
                                            color: STATUS_STYLE[p.status]?.color ?? "#8e8e93",
                                        }}
                                    >
                                        {STATUS_STYLE[p.status]?.label ?? p.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {recentPurchases.length === 0 && (
                            <div className="px-6 py-10 text-center text-[13px]" style={{ color: "#8e8e93" }}>구매 내역이 없습니다.</div>
                        )}
                    </div>
                </div>
            )}

            {/* ── 문의 관리 ── */}
            {activeTab === "inquiries" && (
                <div
                    className="p-10 rounded-[20px] flex flex-col items-center gap-4"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    }}
                >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p className="text-[14px] font-medium" style={{ color: "#8e8e93" }}>
                        문의 관리는 고객센터 페이지에서 직접 확인하세요.
                    </p>
                    <a href="/support">
                        <button
                            className="px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 active:scale-95"
                            style={{ background: "#FF9500", color: "#fff" }}
                        >
                            고객센터로 이동
                        </button>
                    </a>
                </div>
            )}
        </div>
    );
}

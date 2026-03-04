'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { THEMES } from "@/app/store/data";

type Tab = "mine" | "purchased" | "all";

const TABS: { key: Tab; label: string }[] = [
    { key: "mine", label: "내 테마" },
    { key: "purchased", label: "구매 테마" },
    { key: "all", label: "전체 테마" },
];

type ThemeItem = {
    id: string;
    name: string;
    price: number;
    tag?: "내 테마" | "구매";
    purchasedAt?: string;
};

type ApiResponse = {
    mine: ThemeItem[];
    purchased: ThemeItem[];
    all: ThemeItem[];
    purchasedCount: number;
    mineCount: number;
};

function formatPrice(price: number) {
    return price === 0 ? "무료" : `${price.toLocaleString()}원`;
}

function getMockId(dbId: string) {
    return THEMES.find((t) => t.dbId === dbId)?.id ?? null;
}

export default function ThemeVaultTabs({ initialTab }: { initialTab?: Tab }) {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? "purchased");
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        fetch("/api/mypage/themes")
            .then((r) => r.json())
            .then((d: ApiResponse) => setData(d))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    const renderThemeList = (themes: ThemeItem[], emptyMsg: string, emptyLink?: { href: string; label: string }) => {
        if (loading) {
            return (
                <div className="flex items-center gap-2 py-2">
                    <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />
                    <span className="text-[13px]" style={{ color: "#48484a" }}>불러오는 중...</span>
                </div>
            );
        }
        if (!themes || themes.length === 0) {
            return (
                <div className="flex flex-col gap-4">
                    <p className="text-[14px] leading-relaxed" style={{ color: "#48484a" }}>{emptyMsg}</p>
                    {emptyLink && (
                        <Link href={emptyLink.href}>
                            <button
                                className="px-7 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:opacity-80 w-fit"
                                style={{ background: "rgba(0,0,0,0.07)", color: "#3a3a3c" }}
                            >
                                {emptyLink.label} →
                            </button>
                        </Link>
                    )}
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-2">
                {themes.map((theme) => {
                    const mockId = getMockId(theme.id);
                    return (
                        <div
                            key={theme.id}
                            className="flex items-center justify-between px-4 py-3 rounded-[14px] transition-all hover:brightness-95"
                            style={{ background: "rgba(255,255,255,0.7)" }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                                    style={{ background: "rgba(0,0,0,0.07)" }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="3" />
                                        <path d="M3 9h18" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{theme.name}</p>
                                    <p className="text-[11px] flex items-center gap-1.5" style={{ color: "#8e8e93" }}>
                                        {formatPrice(theme.price)}
                                        {theme.tag && (
                                            <span
                                                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                                style={{
                                                    background: theme.tag === "내 테마" ? "rgba(255,149,0,0.15)" : "#FFEF9A",
                                                    color: "#3A1D1D",
                                                }}
                                            >
                                                {theme.tag}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            {mockId && (
                                <Link href={`/store/${mockId}`}>
                                    <button className="text-[12px] font-semibold px-3 py-1.5 rounded-[10px] transition-all hover:brightness-95" style={{ background: "rgba(0,0,0,0.07)", color: "#3a3a3c" }}>
                                        보기
                                    </button>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div
            className="rounded-[28px] flex flex-col overflow-hidden"
            style={{ backgroundColor: "#FFEF9A", boxShadow: "0 24px 80px rgba(0,0,0,0.03)" }}
        >
            {/* 헤더 */}
            <div className="px-8 pt-8 pb-0 flex flex-col gap-2">
                <span className="text-[12px] font-bold tracking-[0.2em] text-black/50 uppercase">테마</span>
                <h2 className="text-[22px] font-bold leading-tight" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                    {TABS.find((t) => t.key === activeTab)?.label}
                </h2>
            </div>

            {/* 탭 */}
            <div className="px-8 pt-5 flex gap-1">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="px-4 py-2 rounded-xl text-[13px] font-bold transition-all"
                        style={{
                            background: activeTab === tab.key ? "rgba(255,255,255,0.85)" : "transparent",
                            color: activeTab === tab.key ? "#1c1c1e" : "rgba(0,0,0,0.4)",
                            boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                        }}
                    >
                        {tab.label}
                        {tab.key === "mine" && data && data.mineCount > 0 && (
                            <span className="ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.1)", color: "#1c1c1e" }}>
                                {data.mineCount}
                            </span>
                        )}
                        {tab.key === "purchased" && data && data.purchasedCount > 0 && (
                            <span className="ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.1)", color: "#1c1c1e" }}>
                                {data.purchasedCount}
                            </span>
                        )}
                        {tab.key === "all" && data && data.all.length > 0 && (
                            <span className="ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.1)", color: "#1c1c1e" }}>
                                {data.all.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* 탭 콘텐츠 */}
            <div className="px-8 py-6">
                {activeTab === "mine" && renderThemeList(
                    data?.mine ?? [],
                    "아직 만든 테마가 없어요. 지금 바로 첫 번째 테마를 만들어보세요!",
                    { href: "/create", label: "첫 테마 만들기" }
                )}
                {activeTab === "purchased" && renderThemeList(
                    data?.purchased ?? [],
                    "아직 구매한 테마가 없어요. 테마 스토어를 둘러보세요!",
                    { href: "/store", label: "테마 스토어 구경하기" }
                )}
                {activeTab === "all" && renderThemeList(
                    data?.all ?? [],
                    "보유한 테마가 없어요.",
                    { href: "/store", label: "테마 스토어 구경하기" }
                )}
            </div>
        </div>
    );
}

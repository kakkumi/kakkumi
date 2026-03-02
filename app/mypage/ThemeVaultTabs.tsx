'use client';

import { useState } from "react";
import Link from "next/link";

type Tab = "mine" | "purchased" | "all";

const TABS: { key: Tab; label: string }[] = [
    { key: "mine", label: "내 테마" },
    { key: "purchased", label: "구매 테마" },
    { key: "all", label: "전체 테마" },
];

export default function ThemeVaultTabs() {
    const [activeTab, setActiveTab] = useState<Tab>("mine");

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
                    </button>
                ))}
            </div>

            {/* 탭 콘텐츠 */}
            <div className="px-8 py-6">
                {activeTab === "mine" && (
                    <div className="flex flex-col gap-4">
                        <p className="text-[14px] leading-relaxed" style={{ color: "#48484a" }}>
                            아직 만든 테마가 없어요. 지금 바로 첫 번째 테마를 만들어보세요!
                        </p>
                        <Link href="/create">
                            <button
                                className="px-7 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:brightness-105"
                                style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.3)" }}
                            >
                                첫 테마 만들기 →
                            </button>
                        </Link>
                    </div>
                )}
                {activeTab === "purchased" && (
                    <div className="flex flex-col gap-4">
                        <p className="text-[14px] leading-relaxed" style={{ color: "#48484a" }}>
                            아직 구매한 테마가 없어요. 테마 스토어를 둘러보세요!
                        </p>
                        <button
                            className="px-7 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:opacity-80 w-fit"
                            style={{ background: "rgba(0,0,0,0.07)", color: "#3a3a3c" }}
                        >
                            테마 스토어 구경하기 →
                        </button>
                    </div>
                )}
                {activeTab === "all" && (
                    <div className="flex flex-col gap-4">
                        <p className="text-[14px] leading-relaxed" style={{ color: "#48484a" }}>
                            카꾸미에 등록된 모든 테마를 둘러볼 수 있어요.
                        </p>
                        <button
                            className="px-7 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:opacity-80 w-fit"
                            style={{ background: "rgba(0,0,0,0.07)", color: "#3a3a3c" }}
                        >
                            전체 테마 보기 →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

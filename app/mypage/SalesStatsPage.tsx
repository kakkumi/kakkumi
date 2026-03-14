"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type ThemeStat = {
    themeId: string;
    themeTitle: string;
    price: number;
    totalSales: number;
    totalAmount: number;
};

type MonthStat = { month: number; sales: number; amount: number };

type SalesStats = {
    totalSales: number;
    totalAmount: number;
    themes: ThemeStat[];
    monthly: MonthStat[];
    years: number[];
};

type ViewMode = "all" | "year" | "month";

const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

// 간단한 막대 차트
function MiniBarChart({ data, maxVal }: { data: MonthStat[]; maxVal: number }) {
    if (data.length === 0) return null;
    const allMonths = Array.from({ length: 12 }, (_, i) => {
        const found = data.find(d => d.month === i + 1);
        return { month: i + 1, amount: found?.amount ?? 0, sales: found?.sales ?? 0 };
    });

    return (
        <div className="flex items-end gap-1.5" style={{ height: 80 }}>
            {allMonths.map(m => {
                const ratio = maxVal > 0 ? m.amount / maxVal : 0;
                const barH = Math.max(ratio * 72, m.amount > 0 ? 4 : 2);
                return (
                    <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
                        <div className="w-full rounded-sm transition-all"
                            style={{
                                height: barH,
                                background: m.amount > 0 ? "#FF9500" : "rgba(0,0,0,0.06)",
                                opacity: m.amount > 0 ? 1 : 0.4,
                            }} />
                        <span className="text-[9px]" style={{ color: "#c4b5a0" }}>{m.month}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function SalesStatsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<SalesStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("all");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

    const fetchStats = useCallback((year?: number, month?: number) => {
        setLoading(true);
        const params = new URLSearchParams();
        if (year) params.set("year", String(year));
        if (month) params.set("month", String(month));
        const url = `/api/mypage/sales${params.toString() ? `?${params}` : ""}`;
        fetch(url)
            .then(r => r.json())
            .then((d: { stats: SalesStats | null }) => {
                setStats(d.stats);
                // 연도 목록에서 현재 연도 기본 선택
                if (!year && d.stats?.years?.length) {
                    setSelectedYear(d.stats.years[0]);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleViewMode = (mode: ViewMode) => {
        setViewMode(mode);
        setSelectedMonth(null);
        if (mode === "all") {
            fetchStats();
        } else if (mode === "year" && selectedYear) {
            fetchStats(selectedYear);
        } else if (mode === "month" && selectedYear && selectedMonth) {
            fetchStats(selectedYear, selectedMonth);
        }
    };

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        setSelectedMonth(null);
        if (viewMode === "year") fetchStats(year);
        if (viewMode === "month") fetchStats(year);
    };

    const handleMonthChange = (month: number) => {
        setSelectedMonth(month);
        if (selectedYear) fetchStats(selectedYear, month);
    };

    const maxMonthlyAmount = stats?.monthly?.length
        ? Math.max(...stats.monthly.map(m => m.amount))
        : 0;

    const periodLabel = viewMode === "all"
        ? "전체"
        : viewMode === "year"
        ? `${selectedYear}년`
        : `${selectedYear}년 ${selectedMonth}월`;

    return (
        <>
            {/* 헤더 */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Sales</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>판매 통계</h2>
                </div>
            </div>
            <p className="text-[13px] mb-6" style={{ color: "#78716c" }}>내가 등록한 테마의 판매 현황이에요.</p>

            {/* 기간 필터 */}
            <div className="flex flex-col gap-4 mb-8">
                {/* 전체 / 연도별 / 월별 탭 */}
                <div className="flex gap-1.5">
                    {(["all", "year", "month"] as ViewMode[]).map(mode => {
                        const labels = { all: "전체", year: "연도별", month: "월별" };
                        const isActive = viewMode === mode;
                        return (
                            <button key={mode} onClick={() => handleViewMode(mode)}
                                className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-all"
                                style={{
                                    background: isActive ? "rgba(255,149,0,0.10)" : "rgba(0,0,0,0.04)",
                                    color: isActive ? "rgb(180,90,0)" : "#78716c",
                                    border: isActive ? "1.5px solid rgba(255,149,0,0.3)" : "1.5px solid transparent",
                                }}>
                                {labels[mode]}
                            </button>
                        );
                    })}
                </div>

                {/* 연도 선택 (연도별·월별 모드) */}
                {(viewMode === "year" || viewMode === "month") && stats?.years && stats.years.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {stats.years.map(y => (
                            <button key={y} onClick={() => handleYearChange(y)}
                                className="px-3 py-1 rounded-lg text-[12px] font-medium transition-all"
                                style={{
                                    background: selectedYear === y ? "#FF9500" : "rgba(0,0,0,0.04)",
                                    color: selectedYear === y ? "#fff" : "#78716c",
                                }}>
                                {y}년
                            </button>
                        ))}
                    </div>
                )}

                {/* 월 선택 (월별 모드) */}
                {viewMode === "month" && selectedYear && (
                    <div className="flex flex-wrap gap-1.5">
                        {MONTH_NAMES.map((name, i) => {
                            const m = i + 1;
                            return (
                                <button key={m} onClick={() => handleMonthChange(m)}
                                    className="px-3 py-1 rounded-lg text-[12px] font-medium transition-all"
                                    style={{
                                        background: selectedMonth === m ? "#FF9500" : "rgba(0,0,0,0.04)",
                                        color: selectedMonth === m ? "#fff" : "#78716c",
                                    }}>
                                    {name}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
                </div>
            ) : !stats || stats.themes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                    <p className="text-[14px]" style={{ color: "#a8a29e" }}>
                        {viewMode === "all" ? "아직 등록된 테마가 없어요." : `${periodLabel} 판매 내역이 없어요.`}
                    </p>
                    {viewMode === "all" && (
                        <button onClick={() => router.push("/store/register")}
                            className="mt-1 text-[13px] font-semibold transition-opacity hover:opacity-60"
                            style={{ color: "#FF9500" }}>
                            테마 등록하러 가기 →
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* 요약 카드 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="px-5 py-4 rounded-2xl flex flex-col gap-1"
                            style={{ background: "rgba(255,149,0,0.06)", border: "1px solid rgba(255,149,0,0.15)" }}>
                            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#FF9500" }}>
                                {periodLabel} 판매 수
                            </p>
                            <p className="text-[28px] font-bold" style={{ color: "#1c1917" }}>
                                {stats.totalSales.toLocaleString()}
                                <span className="text-[14px] font-medium ml-1" style={{ color: "#a8a29e" }}>건</span>
                            </p>
                        </div>
                        <div className="px-5 py-4 rounded-2xl flex flex-col gap-1"
                            style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.15)" }}>
                            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#34c759" }}>
                                {periodLabel} 판매 금액
                            </p>
                            <p className="text-[28px] font-bold" style={{ color: "#1c1917" }}>
                                {stats.totalAmount.toLocaleString()}
                                <span className="text-[14px] font-medium ml-1" style={{ color: "#a8a29e" }}>원</span>
                            </p>
                        </div>
                    </div>

                    {/* 월별 막대 차트 (전체·연도별 모드) */}
                    {viewMode !== "month" && stats.monthly.length > 0 && (
                        <div className="flex flex-col gap-3 px-5 py-4 rounded-2xl"
                            style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.07)" }}>
                            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#a8a29e" }}>
                                {viewMode === "year" && selectedYear ? `${selectedYear}년 ` : ""}월별 판매 금액
                            </p>
                            <MiniBarChart data={stats.monthly} maxVal={maxMonthlyAmount} />
                            {/* 최고 달 표시 */}
                            {maxMonthlyAmount > 0 && (() => {
                                const best = stats.monthly.reduce((a, b) => a.amount >= b.amount ? a : b);
                                return (
                                    <p className="text-[11px]" style={{ color: "#a8a29e" }}>
                                        최고 판매 {best.month}월 · {best.amount.toLocaleString()}원 ({best.sales}건)
                                    </p>
                                );
                            })()}
                        </div>
                    )}

                    {/* 테마별 통계 */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>테마별 판매</span>
                            <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                            <span className="text-[11px]" style={{ color: "#c4b5a0" }}>{periodLabel}</span>
                        </div>
                        <div className="flex flex-col">
                            {stats.themes.map((t, idx) => (
                                <div key={t.themeId}>
                                    <button
                                        onClick={() => router.push(`/store/${t.themeId}`)}
                                        className="w-full flex items-center justify-between py-4 text-left transition-opacity hover:opacity-70"
                                    >
                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                            <p className="text-[14px] font-semibold truncate" style={{ color: "#1c1917" }}>{t.themeTitle}</p>
                                            <p className="text-[12px]" style={{ color: "#a8a29e" }}>
                                                {t.price === 0 ? "무료" : `${t.price.toLocaleString()}원`} · 판매 {t.totalSales}건
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0 ml-4 gap-0.5">
                                            <p className="text-[14px] font-bold" style={{ color: "#FF9500" }}>
                                                {t.totalAmount.toLocaleString()}원
                                            </p>
                                            {/* 비율 바 */}
                                            {stats.totalAmount > 0 && (
                                                <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                                                    <div className="h-full rounded-full" style={{
                                                        width: `${Math.round((t.totalAmount / stats.totalAmount) * 100)}%`,
                                                        background: "#FF9500",
                                                    }} />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                    {idx < stats.themes.length - 1 && <div className="h-px" style={{ background: "#f5f5f4" }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

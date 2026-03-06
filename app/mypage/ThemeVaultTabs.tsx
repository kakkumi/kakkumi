'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { THEMES } from "@/app/store/data";

type Tab = "mine" | "purchased" | "all";

const TABS: { key: Tab; label: string }[] = [
    { key: "mine", label: "내 테마" },
    { key: "purchased", label: "구매 테마" },
    { key: "all", label: "전체 테마" },
];

type Version = { id: string; version: string; kthemeFileUrl: string | null; apkFileUrl: string | null };

type ThemeItem = {
    purchaseId?: string;
    id: string;
    name: string;
    price: number;
    thumbnailUrl?: string | null;
    tag?: "내 테마" | "구매";
    purchasedAt?: string;
    isPublic?: boolean;
    isSelling?: boolean;
    status?: string;
    versions?: Version[];
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
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    // 버전 선택 모달
    const [versionModal, setVersionModal] = useState<{ themeId: string; themeName: string; versions: Version[] } | null>(null);

    // 다운로드 버튼 클릭 → 버전이 1개면 바로 파일 다운로드, 여러 개면 모달 표시
    const handleDownload = (themeId: string, themeName: string, versions: Version[]) => {
        setDownloadError(null);
        const available = versions.filter(v => v.kthemeFileUrl || v.apkFileUrl);
        if (available.length === 0) {
            setDownloadError("아직 다운로드 파일이 준비되지 않았습니다.");
            return;
        }
        if (available.length === 1) {
            void handleFileDownload(available[0], themeName);
        } else {
            setVersionModal({ themeId, themeName, versions: available });
        }
    };

    // 실제 파일 다운로드 (fetch 없이 파일 URL로 바로 다운로드)
    const handleFileDownload = async (ver: Version, themeName: string) => {
        const fileUrl = ver.kthemeFileUrl ?? ver.apkFileUrl;
        if (!fileUrl) { setDownloadError("파일을 찾을 수 없습니다."); return; }
        setDownloadingId(ver.id);
        setVersionModal(null);
        try {
            const res = await fetch(fileUrl);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `${themeName}_${ver.version}.${ver.kthemeFileUrl ? "ktheme" : "apk"}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } catch {
            setDownloadError("다운로드 중 오류가 발생했습니다.");
        } finally {
            setDownloadingId(null);
        }
    };

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    const loadData = () => {
        fetch("/api/mypage/themes")
            .then((r) => r.json())
            .then((d: ApiResponse) => setData(d))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleThemeAction = async (themeId: string, action: "setPublic" | "setPrivate" | "discontinue" | "resume") => {
        setActionLoading(themeId + action);
        try {
            await fetch("/api/themes/manage", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ themeId, action }),
            });
            loadData();
        } catch { /* ignore */ } finally {
            setActionLoading(null);
        }
    };

    const renderMineList = (themes: ThemeItem[]) => {
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
                    <p className="text-[14px] leading-relaxed" style={{ color: "#48484a" }}>아직 만든 테마가 없어요. 지금 바로 첫 번째 테마를 만들어보세요!</p>
                    <Link href="/create">
                        <button className="px-7 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:opacity-80 w-fit" style={{ background: "rgba(0,0,0,0.07)", color: "#3a3a3c" }}>
                            첫 테마 만들기 →
                        </button>
                    </Link>
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-2">
                {themes.map((theme) => {
                    const isDisabled = actionLoading !== null;
                    const statusLabel = theme.status === "DRAFT" ? "심사중" : theme.status === "HIDDEN" ? "숨김" : !theme.isSelling ? "판매중단" : !theme.isPublic ? "비공개" : "공개중";
                    const statusColor = theme.status === "DRAFT" ? "#FF9500" : theme.status === "HIDDEN" ? "#8e8e93" : !theme.isSelling ? "#ff3b30" : !theme.isPublic ? "#8e8e93" : "#34c759";
                    return (
                        <div key={theme.id} className="flex flex-col gap-2 px-4 py-3 rounded-[14px]" style={{ background: "rgba(255,255,255,0.7)" }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.07)" }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{theme.name}</p>
                                        <p className="text-[11px] flex items-center gap-1.5" style={{ color: "#8e8e93" }}>
                                            {formatPrice(theme.price)}
                                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${statusColor}22`, color: statusColor }}>
                                                {statusLabel}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <Link href={`/store/${theme.id}`}>
                                    <button className="text-[12px] font-semibold px-3 py-1.5 rounded-[10px] transition-all hover:brightness-95" style={{ background: "rgba(0,0,0,0.07)", color: "#3a3a3c" }}>
                                        보기
                                    </button>
                                </Link>
                            </div>
                            {/* 공개/비공개/판매중단 컨트롤 (PUBLISHED 상태인 경우만) */}
                            {theme.status === "PUBLISHED" && (
                                <div className="flex gap-1.5 flex-wrap">
                                    {theme.isPublic ? (
                                        <button
                                            disabled={isDisabled}
                                            onClick={() => handleThemeAction(theme.id, "setPrivate")}
                                            className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] transition-all hover:brightness-95 disabled:opacity-50"
                                            style={{ background: "rgba(142,142,147,0.15)", color: "#8e8e93" }}
                                        >
                                            비공개로 전환
                                        </button>
                                    ) : (
                                        <button
                                            disabled={isDisabled}
                                            onClick={() => handleThemeAction(theme.id, "setPublic")}
                                            className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] transition-all hover:brightness-95 disabled:opacity-50"
                                            style={{ background: "rgba(52,199,89,0.15)", color: "#34c759" }}
                                        >
                                            공개로 전환
                                        </button>
                                    )}
                                    {theme.isSelling ? (
                                        <button
                                            disabled={isDisabled}
                                            onClick={() => handleThemeAction(theme.id, "discontinue")}
                                            className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] transition-all hover:brightness-95 disabled:opacity-50"
                                            style={{ background: "rgba(255,59,48,0.12)", color: "#ff3b30" }}
                                        >
                                            판매 중단
                                        </button>
                                    ) : (
                                        <button
                                            disabled={isDisabled}
                                            onClick={() => handleThemeAction(theme.id, "resume")}
                                            className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] transition-all hover:brightness-95 disabled:opacity-50"
                                            style={{ background: "rgba(0,122,255,0.12)", color: "#007aff" }}
                                        >
                                            판매 재개
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderThemeList = (themes: ThemeItem[], emptyMsg: string, emptyLink?: { href: string; label: string }, isPurchased = false) => {
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
                            <button className="px-7 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:opacity-80 w-fit" style={{ background: "rgba(0,0,0,0.07)", color: "#3a3a3c" }}>
                                {emptyLink.label} →
                            </button>
                        </Link>
                    )}
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-2">
                {downloadError && (
                    <p className="text-[12px] px-1" style={{ color: "#ff3b30" }}>{downloadError}</p>
                )}
                {/* 버전 선택 모달 */}
                {versionModal && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-4 sm:pb-0"
                        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(5px)" }}
                        onClick={(e) => { if (e.target === e.currentTarget) setVersionModal(null); }}>
                        <div className="w-full max-w-[400px] rounded-[24px] overflow-hidden flex flex-col bg-white"
                            style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <h3 className="text-[15px] font-bold text-gray-900">버전 선택</h3>
                                <button onClick={() => setVersionModal(null)} className="text-gray-400 hover:text-gray-700 p-1">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="flex flex-col gap-2 px-6 py-5">
                                {versionModal.versions.map(ver => (
                                    <button key={ver.id}
                                        onClick={() => void handleFileDownload(ver, versionModal.themeName)}
                                        disabled={downloadingId === ver.id}
                                        className="flex items-center justify-between px-4 py-3 rounded-[12px] transition-all hover:brightness-95 disabled:opacity-50"
                                        style={{ background: "rgba(0,0,0,0.04)" }}>
                                        <div className="text-left">
                                            <p className="text-[13px] font-semibold text-gray-800">{ver.version}</p>
                                            <p className="text-[11px] text-gray-400">{ver.kthemeFileUrl ? ".ktheme (iOS)" : ".apk (Android)"}</p>
                                        </div>
                                        {downloadingId === ver.id ? (
                                            <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                                        ) : (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4A7BF7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {themes.map((theme) => {
                    const mockId = getMockId(theme.id);
                    const isDownloading = downloadingId !== null;
                    return (
                        <div key={theme.purchaseId ?? theme.id} className="flex flex-col gap-2 px-4 py-3 rounded-[14px]" style={{ background: "rgba(255,255,255,0.7)" }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-[10px] overflow-hidden flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.07)" }}>
                                        {theme.thumbnailUrl ? (
                                            <Image src={theme.thumbnailUrl} alt={theme.name} width={36} height={36} className="w-full h-full object-cover" unoptimized />
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{theme.name}</p>
                                        <p className="text-[11px] flex items-center gap-1.5 flex-wrap" style={{ color: "#8e8e93" }}>
                                            {formatPrice(theme.price)}
                                            {/* 구매 테마일 때 옵션명 표시 */}
                                            {isPurchased && theme.versions && theme.versions.length > 0 && (
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(74,123,247,0.12)", color: "#4A7BF7" }}>
                                                    {theme.versions[0].version}
                                                </span>
                                            )}
                                            {theme.tag && !isPurchased && (
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: theme.tag === "내 테마" ? "rgba(255,149,0,0.15)" : "#FFEF9A", color: "#3A1D1D" }}>
                                                    {theme.tag}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isPurchased && (
                                        <button
                                            onClick={() => handleDownload(theme.id, theme.name, theme.versions ?? [])}
                                            disabled={downloadingId !== null}
                                            className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-[10px] transition-all hover:brightness-95 disabled:opacity-50 active:scale-95"
                                            style={{ background: "rgba(0,122,255,0.12)", color: "#007aff" }}
                                        >
                                            {isDownloading ? (
                                                <div className="w-3 h-3 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin" />
                                            ) : (
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line x1="12" y1="15" x2="12" y2="3" />
                                                </svg>
                                            )}
                                            {isDownloading ? "다운로드 중..." : "다운로드"}
                                        </button>
                                    )}
                                    <Link href={mockId ? `/store/${mockId}` : `/store/${theme.id}`}>
                                        <button className="text-[12px] font-semibold px-3 py-1.5 rounded-[10px] transition-all hover:brightness-95" style={{ background: "rgba(0,0,0,0.07)", color: "#3a3a3c" }}>
                                            보기
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="rounded-[28px] flex flex-col overflow-hidden" style={{ backgroundColor: "#FFEF9A", boxShadow: "0 24px 80px rgba(0,0,0,0.03)" }}>
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
                            <span className="ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.1)", color: "#1c1c1e" }}>{data.mineCount}</span>
                        )}
                        {tab.key === "purchased" && data && data.purchasedCount > 0 && (
                            <span className="ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.1)", color: "#1c1c1e" }}>{data.purchasedCount}</span>
                        )}
                        {tab.key === "all" && data && data.all.length > 0 && (
                            <span className="ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.1)", color: "#1c1c1e" }}>{data.all.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* 탭 콘텐츠 */}
            <div className="px-8 py-6">
                {activeTab === "mine" && renderMineList(data?.mine ?? [])}
                {activeTab === "purchased" && renderThemeList(data?.purchased ?? [], "아직 구매한 테마가 없어요. 테마 스토어를 둘러보세요!", { href: "/store", label: "테마 스토어 구경하기" }, true)}
                {activeTab === "all" && renderThemeList(data?.all ?? [], "보유한 테마가 없어요.", { href: "/store", label: "테마 스토어 구경하기" })}
            </div>
        </div>
    );
}

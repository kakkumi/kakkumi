'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { THEMES } from "@/app/store/data";

type Tab = "mine" | "purchased";

const TABS: { key: Tab; label: string }[] = [
    { key: "mine", label: "업로드 테마" },
    { key: "purchased", label: "구매 테마" },
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
                <div className="flex items-center justify-center py-20">
                    <span className="text-[14px]" style={{ color: "#a8a29e" }}>불러오는 중...</span>
                </div>
            );
        }
        if (!themes || themes.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18" />
                    </svg>
                    <p className="text-[14px]" style={{ color: "#a8a29e" }}>아직 스토어에 업로드한 테마가 없어요.</p>
                    <Link href="/store/register">
                        <button className="mt-1 text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#FF9500" }}>
                            테마 업로드하러 가기 →
                        </button>
                    </Link>
                </div>
            );
        }
        return (
            <div className="flex flex-col">
                {themes.map((theme, idx) => {
                    const isDisabled = actionLoading !== null;
                    const statusLabel = theme.status === "DRAFT" ? "심사중" : theme.status === "HIDDEN" ? "숨김" : !theme.isSelling ? "판매중단" : !theme.isPublic ? "비공개" : "공개중";
                    const statusColor = theme.status === "DRAFT" ? "#FF9500" : theme.status === "HIDDEN" ? "#a8a29e" : !theme.isSelling ? "#ff3b30" : !theme.isPublic ? "#a8a29e" : "#34c759";
                    return (
                        <div key={theme.id}>
                            <div className="flex items-start gap-4 py-4">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#f5f5f4" }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[14px] font-semibold" style={{ color: "#1c1917" }}>{theme.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px]" style={{ color: "#a8a29e" }}>{formatPrice(theme.price)}</span>
                                                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${statusColor}18`, color: statusColor }}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                        </div>
                                        <Link href={`/store/${theme.id}`}>
                                            <button className="text-[12px] font-medium transition-opacity hover:opacity-50 shrink-0" style={{ color: "#78716c" }}>
                                                보기
                                            </button>
                                        </Link>
                                    </div>
                                    {theme.status === "PUBLISHED" && (
                                        <div className="flex gap-3 mt-2.5 flex-wrap">
                                            {theme.isPublic ? (
                                                <button disabled={isDisabled} onClick={() => handleThemeAction(theme.id, "setPrivate")}
                                                    className="text-[11px] font-medium transition-opacity hover:opacity-50 disabled:opacity-30"
                                                    style={{ color: "#a8a29e" }}>
                                                    비공개로 전환
                                                </button>
                                            ) : (
                                                <button disabled={isDisabled} onClick={() => handleThemeAction(theme.id, "setPublic")}
                                                    className="text-[11px] font-medium transition-opacity hover:opacity-50 disabled:opacity-30"
                                                    style={{ color: "#34c759" }}>
                                                    공개로 전환
                                                </button>
                                            )}
                                            <span style={{ color: "#e7e5e4", fontSize: 11 }}>·</span>
                                            {theme.isSelling ? (
                                                <button disabled={isDisabled} onClick={() => handleThemeAction(theme.id, "discontinue")}
                                                    className="text-[11px] font-medium transition-opacity hover:opacity-50 disabled:opacity-30"
                                                    style={{ color: "#ff3b30" }}>
                                                    판매 중단
                                                </button>
                                            ) : (
                                                <button disabled={isDisabled} onClick={() => handleThemeAction(theme.id, "resume")}
                                                    className="text-[11px] font-medium transition-opacity hover:opacity-50 disabled:opacity-30"
                                                    style={{ color: "#4a7bf7" }}>
                                                    판매 재개
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {idx < themes.length - 1 && <div className="h-px" style={{ background: "#f5f5f4" }} />}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderThemeList = (themes: ThemeItem[], emptyMsg: string, emptyLink?: { href: string; label: string }, isPurchased = false) => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <span className="text-[14px]" style={{ color: "#a8a29e" }}>불러오는 중...</span>
                </div>
            );
        }
        if (!themes || themes.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18" />
                    </svg>
                    <p className="text-[14px]" style={{ color: "#a8a29e" }}>{emptyMsg}</p>
                    {emptyLink && (
                        <Link href={emptyLink.href}>
                            <button className="mt-1 text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#FF9500" }}>
                                {emptyLink.label} →
                            </button>
                        </Link>
                    )}
                </div>
            );
        }
        return (
            <div className="flex flex-col">
                {downloadError && (
                    <p className="text-[12px] mb-3" style={{ color: "#ff3b30" }}>{downloadError}</p>
                )}
                {/* 버전 선택 모달 */}
                {versionModal && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-4 sm:pb-0"
                        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(5px)" }}
                        onClick={(e) => { if (e.target === e.currentTarget) setVersionModal(null); }}>
                        <div className="w-full max-w-[400px] rounded-[20px] overflow-hidden flex flex-col bg-white"
                            style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
                            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #f5f5f4" }}>
                                <h3 className="text-[15px] font-semibold" style={{ color: "#1c1917" }}>버전 선택</h3>
                                <button onClick={() => setVersionModal(null)} className="transition-opacity hover:opacity-50">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="flex flex-col gap-2 px-6 py-5">
                                {versionModal.versions.map(ver => (
                                    <button key={ver.id}
                                        onClick={() => void handleFileDownload(ver, versionModal.themeName)}
                                        disabled={downloadingId === ver.id}
                                        className="flex items-center justify-between py-3 transition-opacity hover:opacity-60 disabled:opacity-30">
                                        <div className="text-left">
                                            <p className="text-[13px] font-semibold" style={{ color: "#1c1917" }}>{ver.version}</p>
                                            <p className="text-[11px]" style={{ color: "#a8a29e" }}>{ver.kthemeFileUrl ? ".ktheme (iOS)" : ".apk (Android)"}</p>
                                        </div>
                                        {downloadingId === ver.id ? (
                                            <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                                        ) : (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                {themes.map((theme, idx) => {
                    const mockId = getMockId(theme.id);
                    const isDownloading = downloadingId !== null;
                    return (
                        <div key={theme.purchaseId ?? theme.id}>
                            <div className="flex items-center gap-4 py-4">
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0" style={{ background: "#f5f5f4" }}>
                                    {theme.thumbnailUrl ? (
                                        <Image src={theme.thumbnailUrl} alt={theme.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                    ) : (
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-semibold truncate" style={{ color: "#1c1917" }}>{theme.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[12px]" style={{ color: "#a8a29e" }}>{formatPrice(theme.price)}</span>
                                        {isPurchased && theme.versions && theme.versions.length > 0 && (
                                            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(74,123,247,0.1)", color: "#4a7bf7" }}>
                                                {theme.versions[0].version}
                                            </span>
                                        )}
                                        {theme.tag && !isPurchased && (
                                            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,149,0,0.1)", color: "#FF9500" }}>
                                                {theme.tag}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {isPurchased && (
                                        <button
                                            onClick={() => handleDownload(theme.id, theme.name, theme.versions ?? [])}
                                            disabled={downloadingId !== null}
                                            className="flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-50 disabled:opacity-30"
                                            style={{ color: "#4a7bf7" }}
                                        >
                                            {isDownloading ? (
                                                <div className="w-3 h-3 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin" />
                                            ) : (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line x1="12" y1="15" x2="12" y2="3" />
                                                </svg>
                                            )}
                                            {isDownloading ? "..." : "다운로드"}
                                        </button>
                                    )}
                                    <Link href={mockId ? `/store/${mockId}` : `/store/${theme.id}`}>
                                        <button className="text-[12px] font-medium transition-opacity hover:opacity-50" style={{ color: "#78716c" }}>
                                            보기
                                        </button>
                                    </Link>
                                </div>
                            </div>
                            {idx < themes.length - 1 && <div className="h-px" style={{ background: "#f5f5f4" }} />}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col">
            {/* 섹션 헤더 */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Themes</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>
                        {TABS.find((t) => t.key === activeTab)?.label}
                    </h2>
                </div>
            </div>

            {/* 탭 필터 */}
            <div className="flex items-center gap-1 mb-8 overflow-x-auto no-scrollbar -mx-1">
                {TABS.map((tab) => {
                    const count = tab.key === "mine" ? data?.mineCount : data?.purchasedCount;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150"
                            style={{
                                backgroundColor: active ? "#1c1917" : "transparent",
                                color: active ? "#fafaf9" : "#78716c",
                                border: `1px solid ${active ? "#1c1917" : "#e7e5e4"}`,
                            }}
                        >
                            {tab.label}
                            {count !== undefined && count > 0 && (
                                <span className="text-[11px] font-bold" style={{ opacity: active ? 0.55 : 0.7 }}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 탭 콘텐츠 */}
            {activeTab === "mine" && renderMineList(data?.mine ?? [])}
            {activeTab === "purchased" && renderThemeList(data?.purchased ?? [], "아직 구매한 테마가 없어요. 테마 스토어를 둘러보세요!", { href: "/store", label: "테마 스토어 구경하기" }, true)}
        </div>
    );
}

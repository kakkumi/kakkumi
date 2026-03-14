'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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
    isDownloaded?: boolean;
    versions?: Version[];
};

type ApiResponse = {
    mine: ThemeItem[];
    purchased: ThemeItem[];
    purchasedCount: number;
    mineCount: number;
};

const REFUND_ALLOWED_DAYS = 7;
const DAY_MS = 1000 * 60 * 60 * 24;

function formatPrice(price: number) {
    return price === 0 ? "무료" : `${price.toLocaleString()}원`;
}

export default function ThemeVaultTabs({ initialTab }: { initialTab?: Tab }) {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? "purchased");
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    // 환불 관련 상태
    const [refundSelectedId, setRefundSelectedId] = useState<string | null>(null);
    const [refundReason, setRefundReason] = useState("");
    const [refundingId, setRefundingId] = useState<string | null>(null);
    const [refundError, setRefundError] = useState("");
    const [refundSuccess, setRefundSuccess] = useState("");

    // 다운로드 버튼 클릭 → 구매 테마는 항상 첫 번째 1개만 바로 다운로드 (버전 선택 없음)
    const handleDownload = (themeId: string, themeName: string, versions: Version[], purchaseId?: string) => {
        setDownloadError(null);
        const available = versions.filter(v => v.kthemeFileUrl || v.apkFileUrl);
        if (available.length === 0) {
            setDownloadError("아직 다운로드 파일이 준비되지 않았습니다.");
            return;
        }
        // 항상 첫 번째 파일만 바로 다운로드
        void handleFileDownload(available[0], themeName, purchaseId, themeId);
    };

    // 실제 파일 다운로드 후 isDownloaded 마킹
    const handleFileDownload = async (ver: Version, themeName: string, purchaseId?: string, themeId?: string) => {
        const fileUrl = ver.kthemeFileUrl ?? ver.apkFileUrl;
        if (!fileUrl) { setDownloadError("파일을 찾을 수 없습니다."); return; }
        setDownloadingId(ver.id);
        try {
            let blob: Blob;

            // 내 테마 기반 동적 ktheme 생성
            if (fileUrl.startsWith("__ktheme_generate__:") && themeId) {
                const optionId = fileUrl.replace("__ktheme_generate__:", "");
                const dlRes = await fetch("/api/download/ktheme", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ optionId, themeId }),
                });
                if (!dlRes.ok) { setDownloadError("ktheme 파일 생성에 실패했습니다."); return; }
                blob = await dlRes.blob();
            } else {
                const res = await fetch(fileUrl);
                if (!res.ok) { setDownloadError("파일을 가져올 수 없습니다."); return; }
                blob = await res.blob();
            }

            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `${themeName}_${ver.version}.${ver.kthemeFileUrl ? "ktheme" : "apk"}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

            // 다운로드 완료 → 환불 불가 처리
            if (purchaseId) {
                await fetch("/api/mypage/mark-downloaded", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ purchaseId }),
                });
                setData(prev => prev ? {
                    ...prev,
                    purchased: prev.purchased.map(t =>
                        t.purchaseId === purchaseId ? { ...t, isDownloaded: true } : t
                    ),
                } : prev);
            }
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
        setLoading(true);
        fetch("/api/mypage/themes", { cache: "no-store" })
            .then((r) => r.json())
            .then((d: ApiResponse) => setData(d))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    };

    const handleRefund = async (purchaseId: string) => {
        setRefundingId(purchaseId);
        setRefundError(""); setRefundSuccess("");
        try {
            const res = await fetch("/api/payment/refund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ purchaseId, reason: refundReason || "고객 요청" }),
            });
            const result = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) { setRefundError(result.error ?? "환불 처리에 실패했습니다."); return; }
            setRefundSuccess("환불이 완료되었습니다. 영업일 기준 3~5일 내 원결제 수단으로 환불됩니다.");
            setRefundSelectedId(null);
            setRefundReason("");
            loadData();
        } catch { setRefundError("환불 처리 중 오류가 발생했습니다."); }
        finally { setRefundingId(null); }
    };

    useEffect(() => { loadData(); }, []);

    // 탭 전환 후 다른 창에서 돌아오면 최신 데이터 반영
    useEffect(() => {
        const onFocus = () => loadData();
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, []);

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

        const now = Date.now();

        return (
            <div className="flex flex-col">
                {downloadError && (
                    <p className="text-[12px] mb-3" style={{ color: "#ff3b30" }}>{downloadError}</p>
                )}
                {refundSuccess && (
                    <p className="text-[13px] mb-4" style={{ color: "#34c759" }}>✓ {refundSuccess}</p>
                )}
                {refundError && (
                    <p className="text-[13px] mb-4" style={{ color: "#ff3b30" }}>{refundError}</p>
                )}
                {themes.map((theme, idx) => {
                    const isDownloading = downloadingId !== null;
                    // 환불 가능 여부: 유료 + 미다운로드 + 7일 이내
                    const canRefund = isPurchased &&
                        theme.price > 0 &&
                        !theme.isDownloaded &&
                        theme.purchasedAt != null &&
                        (now - new Date(theme.purchasedAt).getTime()) / DAY_MS <= REFUND_ALLOWED_DAYS;
                    const isRefundOpen = refundSelectedId === (theme.purchaseId ?? theme.id);
                    return (
                        <div key={theme.purchaseId ?? theme.id}>
                            <div className="py-4">
                                <div className="flex items-center gap-4">
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
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="text-[12px]" style={{ color: "#a8a29e" }}>{formatPrice(theme.price)}</span>
                                            {isPurchased && theme.versions && theme.versions.length > 0 && (
                                                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(74,123,247,0.1)", color: "#4a7bf7" }}>
                                                    {theme.versions[0].version}
                                                </span>
                                            )}
                                            {isPurchased && theme.isDownloaded && (
                                                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>
                                                    환불불가
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {isPurchased && (
                                            <button
                                                onClick={() => handleDownload(theme.id, theme.name, theme.versions ?? [], theme.purchaseId)}
                                                disabled={isDownloading}
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
                                        {canRefund && (
                                            <button
                                                onClick={() => {
                                                    setRefundSelectedId(isRefundOpen ? null : (theme.purchaseId ?? theme.id));
                                                    setRefundError(""); setRefundSuccess("");
                                                }}
                                                className="text-[12px] font-medium transition-opacity hover:opacity-50"
                                                style={{ color: isRefundOpen ? "#ff3b30" : "#78716c" }}
                                            >
                                                {isRefundOpen ? "취소" : "환불 신청"}
                                            </button>
                                        )}
                                        <Link href={`/store/${theme.id}`}>
                                            <button className="text-[12px] font-medium transition-opacity hover:opacity-50" style={{ color: "#78716c" }}>
                                                보기
                                            </button>
                                        </Link>
                                    </div>
                                </div>

                                {/* 환불 신청 폼 */}
                                {isRefundOpen && theme.purchaseId && (
                                    <div className="mt-4 flex flex-col gap-3 pl-14">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#ff3b30" }}>환불 신청</span>
                                            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,59,48,0.15)" }} />
                                        </div>
                                        <div className="flex items-start gap-2 px-3 py-2 rounded-xl"
                                            style={{ background: "rgba(255,149,0,0.06)", border: "1px solid rgba(255,149,0,0.15)" }}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                            <p className="text-[11px] leading-relaxed" style={{ color: "#78716c" }}>
                                                다운로드 전에만 환불이 가능합니다. 카드 결제는 원결제 수단으로, 적립금 결제는 적립금으로 환불됩니다.
                                            </p>
                                        </div>
                                        <textarea
                                            value={refundReason}
                                            onChange={e => setRefundReason(e.target.value)}
                                            placeholder="환불 사유를 입력해주세요. (선택)"
                                            rows={2}
                                            className="w-full px-0 py-2 text-[13px] outline-none resize-none bg-transparent"
                                            style={{ borderBottom: "1.5px solid #d6d3d1", color: "#1c1917" }}
                                        />
                                        <p className="text-[11px]" style={{ color: "#a8a29e" }}>
                                            환불 금액 {theme.price.toLocaleString()}원이 원결제 수단으로 환불됩니다. (적립금 결제 시 적립금으로 환불)
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setRefundSelectedId(null); setRefundReason(""); }}
                                                className="text-[13px] font-medium transition-opacity hover:opacity-50"
                                                style={{ color: "#78716c" }}>취소</button>
                                            <button
                                                onClick={() => handleRefund(theme.purchaseId!)}
                                                disabled={refundingId === theme.purchaseId}
                                                className="text-[13px] font-semibold transition-opacity hover:opacity-60 disabled:opacity-30"
                                                style={{ color: "#ff3b30" }}>
                                                {refundingId === theme.purchaseId ? "처리 중..." : `${theme.price.toLocaleString()}원 환불 신청`}
                                            </button>
                                        </div>
                                    </div>
                                )}
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

'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type Tab = "mine" | "purchased";

const TABS: { key: Tab; label: string }[] = [
    { key: "mine", label: "업로드" },
    { key: "purchased", label: "구매" },
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

// OS 태그
function OsTag({ label, color, bg }: { label: string; color: string; bg: string }) {
    return (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: bg, color }}>
            {label}
        </span>
    );
}

export default function ThemeVaultTabs({ initialTab, onTabChange }: { initialTab?: Tab; onTabChange?: (tab: Tab) => void }) {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? "purchased");
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const [refundSelectedId, setRefundSelectedId] = useState<string | null>(null);
    const [refundReason, setRefundReason] = useState("");
    const [refundingId, setRefundingId] = useState<string | null>(null);
    const [refundError, setRefundError] = useState("");
    const [refundSuccess, setRefundSuccess] = useState("");

    const handleDownload = (themeId: string, themeName: string, versions: Version[], purchaseId?: string) => {
        setDownloadError(null);
        const available = versions.filter(v => v.kthemeFileUrl || v.apkFileUrl);
        if (available.length === 0) { setDownloadError("아직 다운로드 파일이 준비되지 않았습니다."); return; }
        void handleFileDownload(available[0], themeName, purchaseId, themeId);
    };

    const handleFileDownload = async (ver: Version, themeName: string, purchaseId?: string, themeId?: string) => {
        const fileUrl = ver.kthemeFileUrl ?? ver.apkFileUrl;
        if (!fileUrl) { setDownloadError("파일을 찾을 수 없습니다."); return; }
        setDownloadingId(ver.id);
        try {
            let blob: Blob;
            if (fileUrl.startsWith("__ktheme_generate__:") && themeId) {
                const optionId = fileUrl.replace("__ktheme_generate__:", "");
                const dlRes = await fetch("/api/download/ktheme", {
                    method: "POST", headers: { "Content-Type": "application/json" },
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
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            if (purchaseId) {
                await fetch("/api/mypage/mark-downloaded", {
                    method: "PATCH", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ purchaseId }),
                });
                setData(prev => prev ? {
                    ...prev,
                    purchased: prev.purchased.map(t => t.purchaseId === purchaseId ? { ...t, isDownloaded: true } : t),
                } : prev);
            }
        } catch { setDownloadError("다운로드 중 오류가 발생했습니다."); }
        finally { setDownloadingId(null); }
    };

    useEffect(() => { if (initialTab) setActiveTab(initialTab); }, [initialTab]);

    const loadData = () => {
        setLoading(true);
        fetch("/api/mypage/themes", { cache: "no-store" })
            .then(r => r.json()).then((d: ApiResponse) => setData(d))
            .catch(() => setData(null)).finally(() => setLoading(false));
    };

    const handleRefund = async (purchaseId: string) => {
        setRefundingId(purchaseId); setRefundError(""); setRefundSuccess("");
        try {
            const res = await fetch("/api/payment/refund", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ purchaseId, reason: refundReason || "고객 요청" }),
            });
            const result = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) { setRefundError(result.error ?? "환불 처리에 실패했습니다."); return; }
            setRefundSuccess("환불이 완료되었습니다. 영업일 기준 3~5일 내 환불됩니다.");
            setRefundSelectedId(null); setRefundReason(""); loadData();
        } catch { setRefundError("환불 처리 중 오류가 발생했습니다."); }
        finally { setRefundingId(null); }
    };

    useEffect(() => { loadData(); }, []);
    useEffect(() => {
        const onFocus = () => loadData();
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, []);

    const handleThemeAction = async (themeId: string, action: "setPublic" | "setPrivate" | "discontinue" | "resume") => {
        setActionLoading(themeId + action);
        try {
            await fetch("/api/themes/manage", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ themeId, action }),
            });
            loadData();
        } catch { /* ignore */ } finally { setActionLoading(null); }
    };

    // ── 업로드 테마 ──
    const renderMineList = (themes: ThemeItem[]) => {
        if (loading) return (
            <div className="py-12 text-center">
                <span className="text-[12px]" style={{ color: "#d6d3d1" }}>불러오는 중</span>
            </div>
        );
        if (!themes || themes.length === 0) return (
            <div className="py-12 flex flex-col items-center gap-2">
                <p className="text-[13px]" style={{ color: "#a8a29e" }}>아직 업로드한 테마가 없어요.</p>
                <Link href="/store/register">
                    <span className="text-[12px]" style={{ color: "#FF9500" }}>업로드하러 가기 →</span>
                </Link>
            </div>
        );

        return (
            <div className="flex flex-col">
                {themes.map((theme, idx) => {
                    const isDisabled = actionLoading !== null;
                    const statusLabel =
                        theme.status === "DRAFT"   ? "심사중"
                        : theme.status === "HIDDEN"  ? "숨김"
                        : !theme.isSelling           ? "판매중단"
                        : !theme.isPublic            ? "비공개"
                        : "공개중";
                    const statusColor =
                        theme.status === "DRAFT"   ? "#e08000"
                        : theme.status === "HIDDEN"  ? "#a8a29e"
                        : !theme.isSelling           ? "#ff3b30"
                        : !theme.isPublic            ? "#a8a29e"
                        : "#22a34a";

                    return (
                        <div key={theme.id}>
                            <div className="flex items-center gap-3 py-4">

                                {/* 상태 도트 */}
                                <div className="shrink-0">
                                    <div className="w-[6px] h-[6px] rounded-full" style={{ background: statusColor }} />
                                </div>

                                {/* 썸네일 */}
                                <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden" style={{ background: "#f0eeec" }}>
                                    {theme.thumbnailUrl && (
                                        <Image src={theme.thumbnailUrl} alt={theme.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                    )}
                                </div>

                                {/* 이름 + 메타 */}
                                <div className="flex-1 min-w-0">
                                    <Link href={`/store/${theme.id}`}>
                                        <p className="text-[13px] font-medium truncate hover:opacity-60 transition-opacity" style={{ color: "#1c1917" }}>
                                            {theme.name}
                                        </p>
                                    </Link>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className="text-[12px]" style={{ color: "#a8a29e" }}>{formatPrice(theme.price)}</span>
                                        <span style={{ color: "#e0dbd6", fontSize: 10 }}>·</span>
                                        <span className="text-[11px] font-medium" style={{ color: statusColor }}>{statusLabel}</span>
                                        <span style={{ color: "#e0dbd6", fontSize: 10 }}>·</span>
                                        <Link href={`/store/${theme.id}`}>
                                            <span className="text-[11px] transition-opacity hover:opacity-50" style={{ color: "#c8c5c1" }}>보기</span>
                                        </Link>
                                        {theme.status === "DRAFT" && (
                                            <>
                                                <span style={{ color: "#e0dbd6", fontSize: 10 }}>·</span>
                                                <span className="text-[11px]" style={{ color: "#c8c5c1" }}>승인 후 반영</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* 오른쪽: 관리 액션 */}
                                {theme.status === "PUBLISHED" && (
                                    <div className="flex items-center gap-2.5 shrink-0">
                                        {theme.isPublic ? (
                                            <button disabled={isDisabled} onClick={() => handleThemeAction(theme.id, "setPrivate")}
                                                className="text-[11px] transition-opacity hover:opacity-50 disabled:opacity-30"
                                                style={{ color: "#a8a29e" }} title="스토어 목록에서 숨겨집니다.">
                                                비공개
                                            </button>
                                        ) : (
                                            <button disabled={isDisabled} onClick={() => handleThemeAction(theme.id, "setPublic")}
                                                className="text-[11px] transition-opacity hover:opacity-50 disabled:opacity-30"
                                                style={{ color: "#22a34a" }}>
                                                공개
                                            </button>
                                        )}
                                        <span style={{ color: "#e0dbd6", fontSize: 8 }}>|</span>
                                        {theme.isSelling ? (
                                            <button disabled={isDisabled} onClick={() => handleThemeAction(theme.id, "discontinue")}
                                                className="text-[11px] transition-opacity hover:opacity-50 disabled:opacity-30"
                                                style={{ color: "#ff3b30" }} title="구매 버튼이 비활성화돼요.">
                                                판매중단
                                            </button>
                                        ) : (
                                            <button disabled={isDisabled} onClick={() => handleThemeAction(theme.id, "resume")}
                                                className="text-[11px] transition-opacity hover:opacity-50 disabled:opacity-30"
                                                style={{ color: "#4a7bf7" }}>
                                                판매재개
                                            </button>
                                        )}
                                        <span style={{ color: "#e0dbd6", fontSize: 8 }}>|</span>
                                        <Link href={`/store/edit/${theme.id}`}>
                                            <span className="text-[11px] transition-opacity hover:opacity-50" style={{ color: "#FF9500" }}>수정신청</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                            {idx < themes.length - 1 && <div style={{ height: 1, background: "rgba(0,0,0,0.1)" }} />}
                        </div>
                    );
                })}
            </div>
        );
    };

    // ── 구매 테마 ──
    const renderThemeList = (themes: ThemeItem[], emptyMsg: string, emptyLink?: { href: string; label: string }, isPurchased = false) => {
        if (loading) return <div className="py-12 text-center"><span className="text-[12px]" style={{ color: "#d6d3d1" }}>불러오는 중</span></div>;
        if (!themes || themes.length === 0) return (
            <div className="py-12 flex flex-col items-center gap-2">
                <p className="text-[13px]" style={{ color: "#a8a29e" }}>{emptyMsg}</p>
                {emptyLink && <Link href={emptyLink.href}><span className="text-[12px]" style={{ color: "#FF9500" }}>{emptyLink.label} →</span></Link>}
            </div>
        );

        const now = Date.now();

        return (
            <div className="flex flex-col">
                {downloadError && <p className="text-[12px] mb-3" style={{ color: "#ff3b30" }}>{downloadError}</p>}
                {refundSuccess && <p className="text-[12px] mb-3" style={{ color: "#22a34a" }}>{refundSuccess}</p>}
                {refundError && <p className="text-[12px] mb-3" style={{ color: "#ff3b30" }}>{refundError}</p>}

                {themes.map((theme, idx) => {
                    const isDownloading = downloadingId !== null;
                    const canRefund =
                        isPurchased && theme.price > 0 && !theme.isDownloaded &&
                        theme.purchasedAt != null &&
                        (now - new Date(theme.purchasedAt).getTime()) / DAY_MS <= REFUND_ALLOWED_DAYS;
                    const isRefundOpen = refundSelectedId === (theme.purchaseId ?? theme.id);

                    // OS 판별
                    const ver = theme.versions?.[0];
                    const verStr = ver?.version ?? "";
                    const showIos = !!(ver?.kthemeFileUrl) || verStr.includes("iOS");
                    const showAndroid = !!(ver?.apkFileUrl) || verStr.includes("Android");

                    // 도트 색상: 다운로드 완료 → 파랑, 환불 가능 → 주황, 기본 → 없음
                    const dotColor = theme.isDownloaded ? "#4a7bf7" : canRefund ? "#FF9500" : "transparent";

                    return (
                        <div key={theme.purchaseId ?? theme.id}>
                            <div className="flex items-center gap-3 py-4">

                                {/* 상태 도트 */}
                                <div className="shrink-0">
                                    <div className="w-[6px] h-[6px] rounded-full" style={{ background: dotColor }} />
                                </div>

                                {/* 썸네일 */}
                                <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden" style={{ background: "#f0eeec" }}>
                                    {theme.thumbnailUrl && (
                                        <Image src={theme.thumbnailUrl} alt={theme.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                    )}
                                </div>

                                {/* 이름 + 메타 */}
                                <div className="flex-1 min-w-0">
                                    <Link href={`/store/${theme.id}`}>
                                        <p className="text-[13px] font-medium truncate hover:opacity-60 transition-opacity" style={{ color: "#1c1917" }}>
                                            {theme.name}
                                        </p>
                                    </Link>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className="text-[12px]" style={{ color: "#a8a29e" }}>{formatPrice(theme.price)}</span>
                                        {showIos && (
                                            <>
                                                <span style={{ color: "#e0dbd6", fontSize: 10 }}>·</span>
                                                <OsTag label="iOS" color="#5856d6" bg="rgba(88,86,214,0.1)" />
                                            </>
                                        )}
                                        {showAndroid && (
                                            <>
                                                <span style={{ color: "#e0dbd6", fontSize: 10 }}>·</span>
                                                <OsTag label="Android" color="#22a34a" bg="rgba(34,163,74,0.1)" />
                                            </>
                                        )}
                                        <span style={{ color: "#e0dbd6", fontSize: 10 }}>·</span>
                                        <Link href={`/store/${theme.id}`}>
                                            <span className="text-[11px] transition-opacity hover:opacity-50" style={{ color: "#c8c5c1" }}>보기</span>
                                        </Link>
                                    </div>
                                </div>

                                {/* 오른쪽: 환불불가 + 환불 + 다운로드 */}
                                <div className="flex items-center gap-2.5 shrink-0">
                                    {isPurchased && theme.isDownloaded && (
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                            style={{ background: "rgba(255,59,48,0.1)", color: "#ff3b30" }}>
                                            환불불가
                                        </span>
                                    )}
                                    {canRefund && (
                                        <button
                                            onClick={() => { setRefundSelectedId(isRefundOpen ? null : (theme.purchaseId ?? theme.id)); setRefundError(""); setRefundSuccess(""); }}
                                            className="text-[11px] transition-opacity hover:opacity-50"
                                            style={{ color: isRefundOpen ? "#ff3b30" : "#a8a29e" }}
                                        >
                                            {isRefundOpen ? "취소" : "환불"}
                                        </button>
                                    )}
                                    {isPurchased && (
                                        <button
                                            onClick={() => handleDownload(theme.id, theme.name, theme.versions ?? [], theme.purchaseId)}
                                            disabled={isDownloading}
                                            className="flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-50 disabled:opacity-30"
                                            style={{ color: "#4a7bf7" }}
                                        >
                                            {isDownloading
                                                ? <div className="w-3 h-3 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                                                : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                                </svg>}
                                            {isDownloading ? "" : "다운로드"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 환불 폼 */}
                            {isRefundOpen && theme.purchaseId && (
                                <div className="pb-4 pl-[58px] flex flex-col gap-2">
                                    <p className="text-[11px]" style={{ color: "#c8c5c1" }}>
                                        다운로드 전에만 환불 가능 · 결제 수단으로 환불
                                    </p>
                                    <textarea
                                        value={refundReason}
                                        onChange={e => setRefundReason(e.target.value)}
                                        placeholder="환불 사유 (선택)"
                                        rows={2}
                                        className="w-full px-0 py-1.5 text-[12px] outline-none resize-none bg-transparent"
                                        style={{ borderBottom: "1px solid #ece9e6", color: "#1c1917" }}
                                    />
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => { setRefundSelectedId(null); setRefundReason(""); }}
                                            className="text-[12px] transition-opacity hover:opacity-50"
                                            style={{ color: "#c8c5c1" }}>취소</button>
                                        <button
                                            onClick={() => handleRefund(theme.purchaseId!)}
                                            disabled={refundingId === theme.purchaseId}
                                            className="text-[12px] font-medium transition-opacity hover:opacity-60 disabled:opacity-30"
                                            style={{ color: "#ff3b30" }}>
                                            {refundingId === theme.purchaseId ? "처리 중..." : `${theme.price.toLocaleString()}원 환불 신청`}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {idx < themes.length - 1 && <div style={{ height: 1, background: "rgba(0,0,0,0.1)" }} />}
                        </div>
                    );
                })}
            </div>
        );
    };

    const mineCount = data?.mineCount ?? 0;
    const purchasedCount = data?.purchasedCount ?? 0;

    return (
        <div className="flex flex-col">
            {/* 탭 스위처 */}
            <div className="flex items-center gap-0 mb-5">
                {TABS.map((tab, i) => {
                    const count = tab.key === "mine" ? mineCount : purchasedCount;
                    const active = activeTab === tab.key;
                    return (
                        <div key={tab.key} className="flex items-center">
                            {i > 0 && <span className="mx-2.5 text-[12px]" style={{ color: "#e7e5e4" }}>/</span>}
                            <button onClick={() => {
                                    setActiveTab(tab.key);
                                    onTabChange?.(tab.key);
                                }}
                                className="text-[13px] transition-colors"
                                style={{ color: active ? "#1c1917" : "#c8c5c1", fontWeight: active ? 600 : 400 }}>
                                {tab.label}
                                {count > 0 && (
                                    <span className="ml-1 text-[11px]" style={{ color: active ? "#a8a29e" : "#d6d3d1" }}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {activeTab === "mine" && renderMineList(data?.mine ?? [])}
            {activeTab === "purchased" && renderThemeList(
                data?.purchased ?? [],
                "아직 구매한 테마가 없어요.",
                { href: "/store", label: "테마 스토어 구경하기" },
                true
            )}
        </div>
    );
}

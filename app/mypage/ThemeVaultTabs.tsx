'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";


// ── 환불 모달 ──
function RefundModal({
    theme,
    refundReason,
    setRefundReason,
    onClose,
    onConfirm,
    loading,
}: {
    theme: { name: string; price: number; purchaseId: string };
    refundReason: string;
    setRefundReason: (v: string) => void;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}) {
    // 배경 클릭 시 닫기
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.35)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-[400px] mx-4 rounded-2xl flex flex-col"
                style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
                onClick={e => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#ff3b30" }}>환불 신청</p>
                    <p className="text-[15px] font-semibold truncate" style={{ color: "#1c1917" }}>{theme.name}</p>
                    <p className="text-[13px] mt-0.5" style={{ color: "#a8a29e" }}>환불 금액 {theme.price.toLocaleString()}원</p>
                </div>

                {/* 본문 */}
                <div className="px-6 py-5 flex flex-col gap-4">
                    <p className="text-[12px] leading-relaxed" style={{ color: "#a8a29e" }}>
                        다운로드 전에만 환불이 가능합니다.<br />
                        카드 결제는 원결제 수단으로, 적립금 결제는 적립금으로 환불됩니다.
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium" style={{ color: "#78716c" }}>환불 사유 (선택)</label>
                        <textarea
                            value={refundReason}
                            onChange={e => setRefundReason(e.target.value)}
                            placeholder="환불 사유를 입력해주세요."
                            rows={3}
                            className="w-full px-0 py-2 text-[13px] outline-none resize-none bg-transparent"
                            style={{ borderBottom: "1.5px solid #e7e5e4", color: "#1c1917" }}
                            autoFocus
                        />
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="flex" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-[14px] font-medium transition-opacity hover:opacity-50"
                        style={{ color: "#a8a29e", borderRight: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-4 text-[14px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-30"
                        style={{ color: "#ff3b30" }}
                    >
                        {loading ? "처리 중..." : `${theme.price.toLocaleString()}원 환불`}
                    </button>
                </div>
            </div>
        </div>
    );
}

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
    discountPrice?: number | null;
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

export default function ThemeVaultTabs({ initialTab, onTabChangeAction }: { initialTab?: Tab; onTabChangeAction?: (tab: Tab) => void }) {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? "purchased");
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const [refundModalTheme, setRefundModalTheme] = useState<{ name: string; price: number; purchaseId: string } | null>(null);
    const [refundReason, setRefundReason] = useState("");
    const [refundingId, setRefundingId] = useState<string | null>(null);
    const [refundError, setRefundError] = useState("");
    const [refundSuccess, setRefundSuccess] = useState("");

    // 할인 모달 상태
    const [discountModal, setDiscountModal] = useState<{ id: string; name: string; price: number; current: number | null } | null>(null);
    const [discountInput, setDiscountInput] = useState("");
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState("");

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
            setRefundModalTheme(null); setRefundReason(""); loadData();
        } catch { setRefundError("환불 처리 중 오류가 발생했습니다."); }
        finally { setRefundingId(null); }
    };

    const handleDiscountSave = async () => {
        if (!discountModal) return;
        setDiscountLoading(true); setDiscountError("");
        const val = discountInput.trim() === "" ? null : parseInt(discountInput, 10);
        if (val !== null && (isNaN(val) || val < 0)) { setDiscountError("올바른 금액을 입력하세요."); setDiscountLoading(false); return; }
        if (val !== null && val >= discountModal.price) { setDiscountError("할인가는 원가보다 낮아야 합니다."); setDiscountLoading(false); return; }
        try {
            const res = await fetch(`/api/themes/${discountModal.id}/discount`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ discountPrice: val }),
            });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) { setDiscountError(data.error ?? "저장에 실패했습니다."); return; }
            setDiscountModal(null); setDiscountInput(""); loadData();
        } catch { setDiscountError("오류가 발생했습니다."); }
        finally { setDiscountLoading(false); }
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
                                        {/* 가격 표시 */}
                                        {theme.discountPrice != null && theme.price > 0 ? (
                                            <>
                                                <span className="text-[11px] font-bold" style={{ color: "rgb(255,59,48)" }}>
                                                    {theme.discountPrice === 0 ? "무료" : `${theme.discountPrice.toLocaleString()}원`}
                                                </span>
                                                <span className="text-[10px]" style={{ color: "#c8c5c1", textDecoration: "line-through" }}>{formatPrice(theme.price)}</span>
                                                <span className="text-[10px] font-bold px-1 rounded" style={{ background: "rgba(255,59,48,0.1)", color: "rgb(255,59,48)" }}>
                                                    {Math.round((1 - theme.discountPrice / theme.price) * 100)}%
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-[12px]" style={{ color: "#a8a29e" }}>{formatPrice(theme.price)}</span>
                                        )}
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
                                        {theme.price > 0 && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setDiscountModal({ id: theme.id, name: theme.name, price: theme.price, current: theme.discountPrice ?? null });
                                                        setDiscountInput(theme.discountPrice != null ? String(theme.discountPrice) : "");
                                                        setDiscountError("");
                                                    }}
                                                    className="text-[11px] transition-opacity hover:opacity-50"
                                                    style={{ color: theme.discountPrice != null ? "rgb(255,59,48)" : "#a8a29e" }}>
                                                    {theme.discountPrice != null ? "할인중" : "할인"}
                                                </button>
                                                <span style={{ color: "#e0dbd6", fontSize: 8 }}>|</span>
                                            </>
                                        )}
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
                    const isDownloading = downloadingId !== null && (theme.versions ?? []).some(v => v.id === downloadingId);
                    const canRefund =
                        isPurchased && theme.price > 0 && !theme.isDownloaded &&
                        theme.purchasedAt != null &&
                        (now - new Date(theme.purchasedAt).getTime()) / DAY_MS <= REFUND_ALLOWED_DAYS;

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
                                            onClick={() => {
                                                setRefundModalTheme({ name: theme.name, price: theme.price, purchaseId: theme.purchaseId! });
                                                setRefundReason("");
                                                setRefundError("");
                                                setRefundSuccess("");
                                            }}
                                            className="text-[11px] transition-opacity hover:opacity-50"
                                            style={{ color: "#a8a29e" }}
                                        >
                                            환불
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
            {/* 환불 모달 */}
            {refundModalTheme && (
                <RefundModal
                    theme={refundModalTheme}
                    refundReason={refundReason}
                    setRefundReason={setRefundReason}
                    onClose={() => { setRefundModalTheme(null); setRefundReason(""); setRefundError(""); }}
                    onConfirm={() => handleRefund(refundModalTheme.purchaseId)}
                    loading={refundingId === refundModalTheme.purchaseId}
                />
            )}

            {/* 할인 모달 */}
            {discountModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}
                    onClick={() => { setDiscountModal(null); setDiscountError(""); }}>
                    <div className="w-full max-w-[360px] mx-4 rounded-2xl flex flex-col"
                        style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
                        onClick={e => e.stopPropagation()}>
                        <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "rgb(255,59,48)" }}>할인 설정</p>
                            <p className="text-[15px] font-semibold truncate" style={{ color: "#1c1917" }}>{discountModal.name}</p>
                            <p className="text-[12px] mt-0.5" style={{ color: "#a8a29e" }}>원가: {discountModal.price.toLocaleString()}원</p>
                        </div>
                        <div className="px-6 py-5 flex flex-col gap-3">
                            <p className="text-[12px]" style={{ color: "#a8a29e" }}>할인가를 입력하면 스토어에 할인이 표시됩니다. 비워두면 할인이 해제됩니다.</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number" min="0" max={discountModal.price - 1}
                                    value={discountInput}
                                    onChange={e => setDiscountInput(e.target.value)}
                                    placeholder={`0 ~ ${discountModal.price - 1} 사이 금액`}
                                    className="flex-1 px-0 py-2 text-[14px] outline-none bg-transparent"
                                    style={{ borderBottom: "1.5px solid #e7e5e4", color: "#1c1917" }}
                                    autoFocus
                                />
                                <span className="text-[13px]" style={{ color: "#a8a29e" }}>원</span>
                            </div>
                            {/* 미리보기 */}
                            {discountInput.trim() !== "" && !isNaN(parseInt(discountInput)) && parseInt(discountInput) >= 0 && parseInt(discountInput) < discountModal.price && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,59,48,0.05)" }}>
                                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgb(255,59,48)", color: "#fff" }}>
                                        {Math.round((1 - parseInt(discountInput) / discountModal.price) * 100)}% 할인
                                    </span>
                                    <span className="text-[12px]" style={{ color: "#a8a29e", textDecoration: "line-through" }}>{discountModal.price.toLocaleString()}원</span>
                                    <span className="text-[13px] font-bold" style={{ color: "rgb(255,59,48)" }}>
                                        → {parseInt(discountInput) === 0 ? "무료" : `${parseInt(discountInput).toLocaleString()}원`}
                                    </span>
                                </div>
                            )}
                            {discountError && <p className="text-[12px]" style={{ color: "#ff3b30" }}>{discountError}</p>}
                        </div>
                        <div className="flex" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                            <button onClick={() => { setDiscountModal(null); setDiscountError(""); }}
                                className="flex-1 py-4 text-[14px] font-medium transition-opacity hover:opacity-50"
                                style={{ color: "#a8a29e", borderRight: "1px solid rgba(0,0,0,0.06)" }}>
                                취소
                            </button>
                            <button onClick={handleDiscountSave} disabled={discountLoading}
                                className="flex-1 py-4 text-[14px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-30"
                                style={{ color: discountInput.trim() === "" ? "#a8a29e" : "rgb(255,59,48)" }}>
                                {discountLoading ? "저장 중..." : discountInput.trim() === "" ? "할인 해제" : "저장"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                    onTabChangeAction?.(tab.key);
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

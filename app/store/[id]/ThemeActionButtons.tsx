"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Siren } from "lucide-react";
import LoginRequiredModal from "../../components/LoginRequiredModal";

type Version = { id: string; version: string; kthemeFileUrl: string | null; apkFileUrl: string | null };

type Props = {
    themeId: string;
    priceNum: number;
    priceName: string;
    discountPrice?: number | null;
    isLoggedIn: boolean;
    userId?: string;
    isOwned?: boolean;
    ownedVersionIds?: string[];
    versions?: Version[];
    onInquiryAction?: () => void;
    isSelling?: boolean;
};

export default function ThemeActionButtons(props: Props) {
    const { priceNum, discountPrice, isLoggedIn, ownedVersionIds = [], versions = [], onInquiryAction, isSelling = true } = props;
    const effectivePrice = (discountPrice != null && priceNum > 0 && discountPrice < priceNum) ? discountPrice : priceNum;
    const effectivePriceName = effectivePrice === 0 ? "무료" : `${effectivePrice.toLocaleString()}원`;
    const router = useRouter();
    const [liked, setLiked] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

    // 초기 찜 상태 로드
    useEffect(() => {
        fetch(`/api/themes/${props.themeId}/like`)
            .then(r => r.json())
            .then((d: { liked: boolean }) => setLiked(d.liked))
            .catch(() => {});
    }, [props.themeId]);

    const [optionModal, setOptionModal] = useState<"download" | "buy" | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const [reportModal, setReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDetail, setReportDetail] = useState("");
    const [reportAgreed, setReportAgreed] = useState(false);
    const [reportSubmitted, setReportSubmitted] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState("");
    const [loginModal, setLoginModal] = useState<string | null>(null);

    const isFree = effectivePrice === 0;
    const hasVersions = versions.length > 0;
    // __ktheme_generate__ 마커도 다운로드 가능한 옵션으로 취급
    const iosVersions = versions.filter(v =>
        v.version.toLowerCase().startsWith("ios") &&
        (v.kthemeFileUrl !== null && v.kthemeFileUrl !== undefined)
    );
    const androidVersions = versions.filter(v => v.version.toLowerCase().startsWith("android") && v.apkFileUrl);

    // 버전별 보유 여부
    const isVersionOwned = (verId: string) => ownedVersionIds.includes(verId);

    const handleMainAction = () => {
        if (!isLoggedIn) {
            setLoginModal(isFree ? "다운로드는 로그인이 필요한 기능이에요." : "구매하기는 로그인이 필요한 기능이에요.");
            return;
        }
        if (isFree) {
            setOptionModal("download");
            setSelectedVersion(null);
        } else {
            if (hasVersions) { setOptionModal("buy"); setSelectedVersion(null); }
            else { router.push(`/store/${props.themeId}/order?themeId=${props.themeId}`); }
        }
    };

    // 무료 다운로드 or 구매 후 즉시 다운로드
    const handleRegisterAndGo = async (ver: Version) => {
        setDownloadingId(ver.id);
        try {
            // 먼저 purchase 기록 등록
            const freeRes = await fetch("/api/download/free", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ themeId: props.themeId, versionId: ver.id }),
            });
            const freeData = await freeRes.json() as { success?: boolean; error?: string };
            if (!freeRes.ok) {
                setResult({ success: false, message: freeData.error ?? "처리 중 오류가 발생했습니다." });
                return;
            }

            // 내 테마 기반(configJson) → 동적 ktheme 파일 생성 후 즉시 다운로드
            if (ver.kthemeFileUrl?.startsWith("__ktheme_generate__:")) {
                const optionId = ver.kthemeFileUrl.replace("__ktheme_generate__:", "");
                const dlRes = await fetch("/api/download/ktheme", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ optionId, themeId: props.themeId }),
                });
                if (!dlRes.ok) {
                    setResult({ success: false, message: "ktheme 파일 생성에 실패했습니다." });
                    return;
                }
                const blob = await dlRes.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = `${ver.version}.ktheme`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                setOptionModal(null);
                return;
            }

            setOptionModal(null);
            window.location.href = "/mypage?menu=구매+테마";
        } catch {
            setResult({ success: false, message: "오류가 발생했습니다." });
        } finally {
            setDownloadingId(null);
        }
    };

    const handleBuyWithVersion = () => {
        setOptionModal(null);
        const versionParam = selectedVersion ? `&versionId=${selectedVersion.id}` : "";
        router.push(`/store/${props.themeId}/order?themeId=${props.themeId}${versionParam}`);
    };

    const handleLike = async () => {
        if (!isLoggedIn) { setLoginModal("찜하기는 로그인이 필요한 기능이에요."); return; }
        // 낙관적 업데이트
        setLiked(prev => !prev);
        try {
            const res = await fetch(`/api/themes/${props.themeId}/like`, { method: "POST" });
            const data = await res.json() as { liked: boolean };
            setLiked(data.liked);
        } catch {
            // 실패 시 롤백
            setLiked(prev => !prev);
        }
    };

    const handleReport = () => {
        if (!isLoggedIn) { setLoginModal("신고하기는 로그인이 필요한 기능이에요."); return; }
        setReportModal(true);
        setReportSubmitted(false);
        setReportReason("");
        setReportDetail("");
        setReportAgreed(false);
        setReportError("");
    };

    const handleReportSubmit = async () => {
        if (!reportReason || !reportAgreed || !reportDetail.trim()) return;
        setReportLoading(true);
        setReportError("");
        try {
            const res = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ themeId: props.themeId, reason: reportReason, detail: reportDetail.trim() }),
            });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) { setReportError(data.error ?? "신고 접수에 실패했습니다."); return; }
            setReportSubmitted(true);
            setTimeout(() => setReportModal(false), 2000);
        } catch {
            setReportError("오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setReportLoading(false);
        }
    };

    const handleInquiry = () => {
        if (!isLoggedIn) { setLoginModal("크리에이터 문의는 로그인이 필요한 기능이에요."); return; }
        if (onInquiryAction) onInquiryAction();
    };

    // 옵션 이름에서 OS 제거 (예: "iOS · 핑크 ver." → "핑크 ver.")
    const shortName = (ver: Version) => ver.version.replace(/^(ios|android)\s*·\s*/i, "");

    return (
        <div className="flex flex-col gap-3">

            {/* ── 옵션 선택 모달 ── */}
            {optionModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-4 sm:pb-0"
                    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(5px)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setOptionModal(null); }}>
                    <div className="w-full max-w-[460px] rounded-[24px] overflow-hidden flex flex-col"
                        style={{ background: "#fff", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <h3 className="text-[16px] font-bold text-gray-900">
                                {optionModal === "download" ? "버전 선택 후 다운로드" : "구매 옵션 선택"}
                            </h3>
                            <button onClick={() => setOptionModal(null)} className="text-gray-400 hover:text-gray-700 p-1">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex flex-col gap-4 px-6 py-5">
                            {/* iOS 섹션 */}
                            {iosVersions.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                                        </svg>
                                        <span className="text-[12px] font-bold text-gray-500">iOS (.ktheme)</span>
                                    </div>
                                    {iosVersions.map(ver => {
                                        const owned = isVersionOwned(ver.id);
                                        return (
                                            <button key={ver.id}
                                                onClick={() => {
                                                    if (owned) return;
                                                    if (optionModal === "download") handleRegisterAndGo(ver);
                                                    else setSelectedVersion(ver);
                                                }}
                                                disabled={downloadingId === ver.id || (optionModal === "buy" && owned)}
                                                className="flex items-center justify-between px-4 py-3 rounded-[12px] text-left transition-all disabled:opacity-60"
                                                style={{
                                                    background: owned ? "rgba(52,199,89,0.08)" : selectedVersion?.id === ver.id ? "rgba(74,123,247,0.08)" : "rgba(0,0,0,0.03)",
                                                    border: owned ? "1.5px solid rgba(52,199,89,0.4)" : selectedVersion?.id === ver.id ? "1.5px solid rgba(74,123,247,0.5)" : "1.5px solid transparent",
                                                    cursor: owned ? "default" : "pointer",
                                                }}>
                                                <span className="text-[14px] font-semibold text-gray-800">{shortName(ver)}</span>
                                                {owned ? (
                                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(52,199,89,0.15)", color: "#34c759" }}>보유중</span>
                                                ) : optionModal === "download" ? (
                                                    downloadingId === ver.id ? (
                                                        <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                                                    ) : (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A7BF7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                                                        </svg>
                                                    )
                                                ) : selectedVersion?.id === ver.id ? (
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4A7BF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 6L9 17l-5-5"/>
                                                    </svg>
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {/* Android 섹션 */}
                            {androidVersions.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 16v-4a7 7 0 0 1 14 0v4"/>
                                            <rect x="3" y="16" width="4" height="4" rx="1"/>
                                            <rect x="17" y="16" width="4" height="4" rx="1"/>
                                        </svg>
                                        <span className="text-[12px] font-bold text-gray-500">Android (.apk)</span>
                                    </div>
                                    {androidVersions.map(ver => {
                                        const owned = isVersionOwned(ver.id);
                                        return (
                                            <button key={ver.id}
                                                onClick={() => {
                                                    if (owned) return;
                                                    if (optionModal === "download") handleRegisterAndGo(ver);
                                                    else setSelectedVersion(ver);
                                                }}
                                                disabled={downloadingId === ver.id || (optionModal === "buy" && owned)}
                                                className="flex items-center justify-between px-4 py-3 rounded-[12px] text-left transition-all disabled:opacity-60"
                                                style={{
                                                    background: owned ? "rgba(52,199,89,0.08)" : selectedVersion?.id === ver.id ? "rgba(74,123,247,0.08)" : "rgba(0,0,0,0.03)",
                                                    border: owned ? "1.5px solid rgba(52,199,89,0.4)" : selectedVersion?.id === ver.id ? "1.5px solid rgba(74,123,247,0.5)" : "1.5px solid transparent",
                                                    cursor: owned ? "default" : "pointer",
                                                }}>
                                                <span className="text-[14px] font-semibold text-gray-800">{shortName(ver)}</span>
                                                {owned ? (
                                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(52,199,89,0.15)", color: "#34c759" }}>보유중</span>
                                                ) : optionModal === "download" ? (
                                                    downloadingId === ver.id ? (
                                                        <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                                                    ) : (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A7BF7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                                                        </svg>
                                                    )
                                                ) : selectedVersion?.id === ver.id ? (
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4A7BF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 6L9 17l-5-5"/>
                                                    </svg>
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {/* 버전 없음 */}
                            {iosVersions.length === 0 && androidVersions.length === 0 && (
                                <p className="text-[14px] text-gray-400 text-center py-4">다운로드 파일이 아직 준비되지 않았습니다.</p>
                            )}
                            {/* 구매 버튼 (buy 모드일 때) */}
                            {optionModal === "buy" && (iosVersions.length > 0 || androidVersions.length > 0) && (
                                <button
                                    onClick={handleBuyWithVersion}
                                    disabled={!selectedVersion}
                                    className="w-full py-3.5 rounded-[14px] text-[15px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 mt-1"
                                    style={{ background: "#4A7BF7", boxShadow: "0 4px 20px rgba(74,123,247,0.3)" }}>
                                    {selectedVersion ? `${effectivePriceName} 구매하기` : "옵션을 선택해주세요"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── 신고 모달 ── */}
            {reportModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(5px)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setReportModal(false); }}
                >
                    <div className="flex flex-col w-full max-w-[460px] rounded-[24px] overflow-hidden"
                        style={{ background: "#fff", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
                        {reportSubmitted ? (
                            <div className="flex flex-col items-center gap-4 py-12 px-8">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(52,199,89,0.12)" }}>
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                </div>
                                <p className="text-[17px] font-bold text-gray-900">신고가 접수되었습니다</p>
                                <p className="text-[13px] text-gray-400 text-center leading-relaxed">검토 후 필요한 조치를 취하겠습니다.<br />허위 신고로 판명될 경우 서비스 이용이 제한될 수 있습니다.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Siren size={17} color="#ef4444" />
                                        <h3 className="text-[16px] font-bold text-gray-900">테마 신고</h3>
                                    </div>
                                    <button onClick={() => setReportModal(false)} className="text-gray-400 hover:text-gray-700 p-1">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex flex-col gap-5 px-6 py-6">
                                    <div className="flex gap-3 px-4 py-3 rounded-[12px]" style={{ background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.15)" }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                        <p className="text-[12px] leading-relaxed" style={{ color: "#c0392b" }}>
                                            <strong>허위 신고 주의</strong><br />
                                            사실과 다른 신고를 반복할 경우 서비스 이용이 <strong>영구 제한</strong>될 수 있습니다.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[13px] font-semibold text-gray-700">신고 사유 <span className="text-red-500">*</span></label>
                                        <div className="flex flex-col gap-1.5">
                                            {[
                                                { value: "copyright", label: "저작권 침해", desc: "타인의 저작물을 무단 사용" },
                                                { value: "obscene", label: "음란물 · 부적절한 콘텐츠", desc: "성인물, 혐오 표현 등" },
                                                { value: "fraud", label: "사기 · 허위 정보", desc: "실제와 다른 내용으로 판매" },
                                                { value: "spam", label: "스팸 · 광고성 콘텐츠", desc: "반복적인 홍보성 게시물" },
                                                { value: "privacy", label: "개인정보 침해", desc: "타인의 정보 무단 노출" },
                                                { value: "etc", label: "기타", desc: "위 항목에 해당하지 않는 사유" },
                                            ].map((item) => (
                                                <button key={item.value} type="button"
                                                    onClick={() => setReportReason(item.value)}
                                                    className="flex items-center justify-between px-4 py-3 rounded-[10px] text-left transition-all"
                                                    style={{
                                                        background: reportReason === item.value ? "rgba(74,123,247,0.08)" : "rgba(0,0,0,0.03)",
                                                        border: reportReason === item.value ? "1.5px solid rgba(74,123,247,0.5)" : "1.5px solid transparent",
                                                    }}>
                                                    <div>
                                                        <p className="text-[13px] font-semibold" style={{ color: reportReason === item.value ? "#4A7BF7" : "#1c1c1e" }}>{item.label}</p>
                                                        <p className="text-[11px] mt-0.5" style={{ color: "#8e8e93" }}>{item.desc}</p>
                                                    </div>
                                                    {reportReason === item.value && (
                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4A7BF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M20 6L9 17l-5-5" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[13px] font-semibold text-gray-700">상세 내용 <span className="text-red-500">*</span></label>
                                        <textarea rows={3} value={reportDetail}
                                            onChange={(e) => setReportDetail(e.target.value)}
                                            placeholder="신고 사유를 구체적으로 적어주세요." maxLength={300}
                                            className="px-4 py-3 rounded-[10px] text-[13px] outline-none resize-none"
                                            style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)", color: "#1c1c1e" }}
                                        />
                                        <p className="text-[11px] text-right" style={{ color: "#8e8e93" }}>{reportDetail.length} / 300</p>
                                    </div>
                                    <button type="button" className="flex items-start gap-2.5 text-left"
                                        onClick={() => setReportAgreed(v => !v)}>
                                        <div className="w-5 h-5 rounded-[5px] shrink-0 mt-0.5 flex items-center justify-center transition-all"
                                            style={{ background: reportAgreed ? "#4A7BF7" : "rgba(0,0,0,0.07)", border: reportAgreed ? "none" : "1.5px solid rgba(0,0,0,0.15)" }}>
                                            {reportAgreed && (
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 6L9 17l-5-5" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-[12px] leading-relaxed" style={{ color: "#3a3a3c" }}>
                                            허위 신고 시 서비스 이용이 제한될 수 있음을 확인했으며, 위 내용이 사실임을 동의합니다.
                                        </span>
                                    </button>
                                    {reportError && (
                                        <p className="text-[12px] font-medium px-3 py-2 rounded-lg" style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>{reportError}</p>
                                    )}
                                    <button onClick={handleReportSubmit}
                                        disabled={!reportReason || !reportAgreed || !reportDetail.trim() || reportLoading}
                                        className="w-full py-3.5 rounded-[12px] text-[14px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
                                        style={{ background: "#ef4444" }}>
                                        {reportLoading ? "접수 중..." : "신고 접수하기"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── 결과 메시지 ── */}
            {result && (
                <div className="text-[13px] font-medium px-4 py-2.5 rounded-[10px]"
                    style={{ background: result.success ? "rgba(52,199,89,0.1)" : "rgba(255,59,48,0.1)", color: result.success ? "#34c759" : "#ff3b30" }}>
                    {result.message}
                </div>
            )}

            {/* ── 버튼 행 ── */}
            <div className="flex gap-3">
                {!isSelling ? (
                    <div className="flex-[3] py-[14px] rounded-[14px] text-[15px] font-bold text-center"
                        style={{ background: "rgba(0,0,0,0.06)", color: "#aeaeb2" }}>
                        판매가 중단된 테마예요
                    </div>
                ) : (
                    <button
                        onClick={handleMainAction}
                        className="flex-[3] py-[14px] rounded-[14px] text-[15px] font-bold text-white transition-all active:scale-[0.98]"
                        style={{
                            background: "#4A7BF7",
                            boxShadow: "0 4px 20px rgba(74,123,247,0.3)",
                        }}
                    >
                        {isFree ? "무료 다운로드" : `${effectivePriceName} 구매하기`}
                    </button>
                )}
                <button
                    onClick={handleLike}
                    className="w-[52px] flex items-center justify-center rounded-[14px] transition-all active:scale-[0.98] hover:bg-red-50"
                    title={liked ? "찜 해제" : "찜하기"}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24"
                        fill={liked ? "#ff3b30" : "none"}
                        stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
                <button
                    onClick={handleReport}
                    className="w-[52px] flex items-center justify-center rounded-[14px] transition-all active:scale-[0.98] hover:bg-red-50"
                    title="신고하기"
                >
                    <Siren size={20} color="#ef4444" />
                </button>
            </div>

            {/* ── 문의하기 ── */}
            <button
                onClick={handleInquiry}
                className="w-full py-[13px] rounded-[14px] text-[14px] font-semibold text-gray-600 bg-white border border-gray-200 hover:border-gray-400 hover:text-gray-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                크리에이터에게 문의하기
            </button>
            {loginModal && (
                <LoginRequiredModal message={loginModal} onClose={() => setLoginModal(null)} />
            )}
        </div>
    );
}

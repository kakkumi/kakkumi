"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Siren } from "lucide-react";

type Props = {
    themeId: string;
    themeMockId: number;
    priceNum: number;
    priceName: string;
    isLoggedIn: boolean;
    userId?: string;
    isOwned?: boolean;
};

export default function ThemeActionButtons(props: Props) {
    const { themeMockId, priceNum, priceName, isLoggedIn, isOwned = false } = props;
    const router = useRouter();
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);
    const [ownedState, setOwnedState] = useState(isOwned);

    const [reportModal, setReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDetail, setReportDetail] = useState("");
    const [reportAgreed, setReportAgreed] = useState(false);
    const [reportSubmitted, setReportSubmitted] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState("");

    const isFree = priceNum === 0;

    const handleMainAction = async () => {
        if (!isLoggedIn) { router.push("/api/auth/kakao"); return; }
        if (isFree) {
            setLoading(true);
            setResult(null);
            try {
                const res = await fetch("/api/download/free", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ themeId: props.themeId }),
                });
                const data = await res.json() as { success?: boolean; error?: string; alreadyOwned?: boolean; downloadUrl?: string };
                if (!res.ok) { setResult({ success: false, message: data.error ?? "다운로드 실패" }); return; }
                if (data.downloadUrl) window.open(data.downloadUrl, "_blank");
                setOwnedState(true);
                if (!data.alreadyOwned) {
                    setResult({ success: true, message: "다운로드가 완료되었습니다!" });
                    setTimeout(() => setResult(null), 2000);
                }
            } catch {
                setResult({ success: false, message: "오류가 발생했습니다. 다시 시도해주세요." });
            } finally {
                setLoading(false);
            }
        } else {
            router.push(`/store/${props.themeId}/order?themeId=${props.themeId}`);
        }
    };

    const handleLike = () => {
        if (!isLoggedIn) { router.push("/api/auth/kakao"); return; }
        setLiked(prev => !prev);
    };

    const handleReport = () => {
        if (!isLoggedIn) { router.push("/api/auth/kakao"); return; }
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
        if (!isLoggedIn) { router.push("/api/auth/kakao"); return; }
        router.push(`/support?themeId=${themeMockId}`);
    };

    return (
        <div className="flex flex-col gap-3">

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
                                <p className="text-[13px] text-gray-400 text-center leading-relaxed">
                                    검토 후 필요한 조치를 취하겠습니다.<br />
                                    허위 신고로 판명될 경우 서비스 이용이 제한될 수 있습니다.
                                </p>
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
                                        <p className="text-[12px] font-medium px-3 py-2 rounded-lg" style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>
                                            {reportError}
                                        </p>
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
                <button
                    onClick={handleMainAction}
                    disabled={loading || ownedState}
                    className="flex-[3] py-[14px] rounded-[14px] text-[15px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                    style={{
                        background: ownedState ? "#34c759" : "#4A7BF7",
                        boxShadow: ownedState ? "0 4px 20px rgba(52,199,89,0.3)" : "0 4px 20px rgba(74,123,247,0.3)",
                    }}
                >
                    {loading ? "처리 중..."
                        : ownedState ? "보유중"
                        : isLoggedIn
                            ? isFree ? "무료 다운로드" : `${priceName} 구매하기`
                            : isFree ? "로그인 후 무료 다운로드" : "로그인 후 구매하기"}
                </button>
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
                제작자에게 문의하기
            </button>
        </div>
    );
}

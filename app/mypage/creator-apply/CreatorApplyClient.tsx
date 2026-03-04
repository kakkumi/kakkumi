"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Application = {
    id: string;
    status: string;
    reason: string;
    portfolio: string | null;
    adminNote: string | null;
    createdAt: string;
};

const STATUS_INFO: Record<string, { label: string; color: string; bg: string; desc: string }> = {
    PENDING:  { label: "검토 중",   color: "#c97000", bg: "rgba(255,149,0,0.10)",  desc: "신청서를 검토 중입니다. 영업일 기준 3일 이내에 결과를 안내해 드려요." },
    APPROVED: { label: "승인 완료", color: "#1a7a3a", bg: "rgba(52,199,89,0.10)",  desc: "크리에이터 권한이 부여되었습니다. 이제 테마를 등록할 수 있어요!" },
    REJECTED: { label: "반려",      color: "#c0392b", bg: "rgba(255,59,48,0.08)",   desc: "신청이 반려되었습니다. 아래 사유를 확인하고 재신청해 주세요." },
};

export default function CreatorApplyPage() {
    const router = useRouter();
    const [application, setApplication] = useState<Application | null | undefined>(undefined);
    const [reason, setReason] = useState("");
    const [portfolio, setPortfolio] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    useEffect(() => {
        fetch("/api/creator/apply")
            .then(r => r.json())
            .then((d: { application: Application | null }) => setApplication(d.application))
            .catch(() => setApplication(null));
    }, []);

    const handleSubmit = async () => {
        if (reason.trim().length < 10) { setError("신청 사유를 10자 이상 입력해주세요."); return; }
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/creator/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: reason.trim(), portfolio: portfolio.trim() || null }),
            });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) { setError(data.error ?? "오류가 발생했습니다."); return; }
            setDone(true);
            setTimeout(() => router.push("/mypage"), 2000);
        } catch {
            setError("오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    if (application === undefined) {
        return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gray-500 animate-spin" /></div>;
    }

    const cardStyle = { background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" };

    // 기존 신청이 있는 경우
    if (application) {
        const info = STATUS_INFO[application.status] ?? STATUS_INFO.PENDING;
        return (
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 p-7 rounded-[24px]" style={cardStyle}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>입점 신청 현황</h3>
                        <span className="text-[12px] font-bold px-3 py-1 rounded-full"
                            style={{ background: info.bg, color: info.color }}>
                            {info.label}
                        </span>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: "#8e8e93" }}>{info.desc}</p>

                    {application.adminNote && application.status === "REJECTED" && (
                        <div className="flex flex-col gap-1.5 px-4 py-3 rounded-[12px]"
                            style={{ background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.15)" }}>
                            <p className="text-[12px] font-semibold" style={{ color: "#c0392b" }}>반려 사유</p>
                            <p className="text-[13px]" style={{ color: "#3a3a3c" }}>{application.adminNote}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 px-4 py-3 rounded-[12px]" style={{ background: "rgba(0,0,0,0.03)" }}>
                        <div className="flex justify-between">
                            <span className="text-[12px]" style={{ color: "#8e8e93" }}>신청일</span>
                            <span className="text-[12px]" style={{ color: "#3a3a3c" }}>
                                {new Date(application.createdAt).toLocaleDateString("ko-KR")}
                            </span>
                        </div>
                    </div>

                    {/* 반려 시 재신청 가능 */}
                    {application.status === "REJECTED" && (
                        <button
                            onClick={() => setApplication(null)}
                            className="w-full py-3 rounded-[12px] text-[14px] font-bold transition-all active:scale-[0.98]"
                            style={{ background: "rgba(255,149,0,0.95)", color: "#fff" }}>
                            재신청하기
                        </button>
                    )}

                    {/* 승인 시 테마 등록으로 */}
                    {application.status === "APPROVED" && (
                        <button
                            onClick={() => router.push("/store/register")}
                            className="w-full py-3 rounded-[12px] text-[14px] font-bold text-white transition-all active:scale-[0.98]"
                            style={{ background: "#4A7BF7", boxShadow: "0 4px 16px rgba(74,123,247,0.3)" }}>
                            테마 등록하러 가기
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // 신청 폼
    if (done) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 rounded-[24px]" style={cardStyle}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(52,199,89,0.12)" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </div>
                <p className="text-[17px] font-bold" style={{ color: "#1c1c1e" }}>신청이 완료되었습니다!</p>
                <p className="text-[13px]" style={{ color: "#8e8e93" }}>검토 후 결과를 알려드릴게요. 마이페이지로 이동합니다.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 p-7 rounded-[24px]" style={cardStyle}>
                <div>
                    <h3 className="text-[16px] font-bold" style={{ color: "#1c1c1e" }}>크리에이터 입점 신청</h3>
                    <p className="text-[12px] mt-1" style={{ color: "#8e8e93" }}>심사 후 영업일 기준 3일 이내에 결과를 안내드립니다.</p>
                </div>

                {/* 안내 */}
                <div className="flex flex-col gap-1.5 px-4 py-3 rounded-[12px]"
                    style={{ background: "rgba(255,149,0,0.06)", border: "1px solid rgba(255,149,0,0.15)" }}>
                    <p className="text-[12px] font-semibold" style={{ color: "#c97000" }}>입점 심사 기준</p>
                    <ul className="flex flex-col gap-0.5 text-[12px] leading-relaxed" style={{ color: "#7a5500" }}>
                        <li>• 직접 제작한 카카오톡 테마 포트폴리오 필요</li>
                        <li>• 타인의 저작물 사용 불가</li>
                        <li>• 최소 1개 이상의 완성된 테마 보유</li>
                    </ul>
                </div>

                {/* 신청 사유 */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold" style={{ color: "#3a3a3c" }}>
                        신청 사유 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        rows={5}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="제작한 테마 소개, 스토어에 등록하고 싶은 이유 등을 자유롭게 작성해주세요. (최소 10자)"
                        maxLength={500}
                        className="px-4 py-3 rounded-[12px] text-[13px] outline-none resize-none"
                        style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)", color: "#1c1c1e" }}
                    />
                    <p className="text-[11px] text-right" style={{ color: "#8e8e93" }}>{reason.length} / 500</p>
                </div>

                {/* 포트폴리오 URL */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold" style={{ color: "#3a3a3c" }}>
                        포트폴리오 URL <span className="text-[11px] font-normal" style={{ color: "#8e8e93" }}>(선택 · SNS, 블로그 등)</span>
                    </label>
                    <input
                        type="url"
                        value={portfolio}
                        onChange={e => setPortfolio(e.target.value)}
                        placeholder="https://..."
                        className="px-4 py-3 rounded-[12px] text-[13px] outline-none"
                        style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)", color: "#1c1c1e" }}
                    />
                </div>

                {error && (
                    <p className="text-[12px] px-3 py-2 rounded-lg" style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>{error}</p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting || reason.trim().length < 10}
                    className="w-full py-4 rounded-[14px] text-[15px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{ background: "rgba(255,149,0,0.95)", boxShadow: "0 4px 20px rgba(255,149,0,0.25)" }}>
                    {submitting ? "신청 중..." : "입점 신청하기"}
                </button>
            </div>
        </div>
    );
}

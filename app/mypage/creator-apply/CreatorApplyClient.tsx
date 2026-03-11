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
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
            </div>
        );
    }

    // 기존 신청이 있는 경우
    if (application) {
        const info = STATUS_INFO[application.status] ?? STATUS_INFO.PENDING;
        return (
            <div className="flex flex-col gap-10">
                {/* 페이지 타이틀 */}
                <div className="flex flex-col gap-1">
                    <h2 className="text-[22px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>입점 신청 현황</h2>
                    <p className="text-[14px]" style={{ color: "#8e8e93" }}>신청 상태를 확인할 수 있어요.</p>
                </div>

                {/* 상태 표시 */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium uppercase tracking-widest" style={{ color: "#aeaeb2" }}>STATUS</span>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[13px] font-bold px-3 py-1 rounded-full"
                            style={{ background: info.bg, color: info.color }}>
                            {info.label}
                        </span>
                    </div>
                    <p className="text-[14px] leading-relaxed mt-1" style={{ color: "#636366" }}>{info.desc}</p>
                </div>

                <div style={{ height: "1px", background: "rgba(0,0,0,0.07)" }} />

                {/* 반려 사유 */}
                {application.adminNote && application.status === "REJECTED" && (
                    <>
                        <div className="flex flex-col gap-2">
                            <span className="text-[12px] font-medium uppercase tracking-widest" style={{ color: "#aeaeb2" }}>반려 사유</span>
                            <p className="text-[14px] leading-relaxed" style={{ color: "#3a3a3c" }}>{application.adminNote}</p>
                        </div>
                        <div style={{ height: "1px", background: "rgba(0,0,0,0.07)" }} />
                    </>
                )}

                {/* 신청일 */}
                <div className="flex items-center justify-between">
                    <span className="text-[13px]" style={{ color: "#8e8e93" }}>신청일</span>
                    <span className="text-[13px]" style={{ color: "#3a3a3c" }}>
                        {new Date(application.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                </div>

                {/* 반려 시 재신청 가능 */}
                {application.status === "REJECTED" && (
                    <button
                        onClick={() => setApplication(null)}
                        className="w-full py-3.5 text-[14px] font-semibold transition-all active:scale-[0.99]"
                        style={{
                            background: "#ff9500",
                            color: "#fff",
                            borderRadius: "10px",
                            letterSpacing: "-0.01em",
                        }}>
                        재신청하기
                    </button>
                )}

                {/* 승인 시 테마 등록으로 */}
                {application.status === "APPROVED" && (
                    <button
                        onClick={() => router.push("/store/register")}
                        className="w-full py-3.5 text-[14px] font-semibold text-white transition-all active:scale-[0.99]"
                        style={{
                            background: "#4A7BF7",
                            borderRadius: "10px",
                            letterSpacing: "-0.01em",
                        }}>
                        테마 등록하러 가기
                    </button>
                )}
            </div>
        );
    }

    // 신청 폼
    if (done) {
        return (
            <div className="flex flex-col items-center gap-5 py-20">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(52,199,89,0.10)" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                    <p className="text-[18px] font-bold" style={{ color: "#1c1c1e" }}>신청이 완료되었습니다!</p>
                    <p className="text-[13px]" style={{ color: "#8e8e93" }}>검토 후 결과를 알려드릴게요. 마이페이지로 이동합니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            {/* 페이지 타이틀 */}
            <div className="flex flex-col gap-1 pt-12">
                <h2 className="text-[22px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>크리에이터 입점 신청</h2>
                <p className="text-[14px]" style={{ color: "#8e8e93" }}>심사 후 영업일 기준 3일 이내에 결과를 안내드립니다.</p>
            </div>

            {/* 입점 심사 기준 */}
            <div className="flex flex-col gap-3">
                <span className="text-[12px] font-medium uppercase tracking-widest" style={{ color: "#aeaeb2" }}>심사 기준</span>
                <ul className="flex flex-col gap-2.5">
                    {[
                        "직접 제작한 테마 포트폴리오 필요",
                        "타인의 저작물 사용 불가",
                        "최소 1개 이상의 완성된 테마 보유",
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13px]" style={{ color: "#636366" }}>
                            <span className="mt-[3px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#ff9500" }} />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ height: "1px", background: "rgba(0,0,0,0.07)" }} />

            {/* 신청 사유 */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                    <label className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>
                        신청 사유 <span style={{ color: "#ff3b30" }}>*</span>
                    </label>
                    <p className="text-[12px]" style={{ color: "#aeaeb2" }}>제작한 테마 소개, 스토어에 등록하고 싶은 이유 등을 자유롭게 작성해주세요.</p>
                </div>
                <textarea
                    rows={5}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="최소 10자 이상 입력해주세요."
                    maxLength={500}
                    className="w-full px-0 py-3 text-[14px] outline-none resize-none bg-transparent"
                    style={{
                        color: "#1c1c1e",
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        borderBottom: "1.5px solid rgba(0,0,0,0.12)",
                        borderRadius: 0,
                        transition: "border-color 0.15s",
                    }}
                    onFocus={e => { e.currentTarget.style.borderBottomColor = "#ff9500"; }}
                    onBlur={e => { e.currentTarget.style.borderBottomColor = "rgba(0,0,0,0.12)"; }}
                />
                <p className="text-[11px] text-right" style={{ color: "#aeaeb2" }}>{reason.length} / 500</p>
            </div>

            {/* 포트폴리오 URL */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                    <label className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>
                        포트폴리오 URL{" "}
                        <span className="text-[12px] font-normal" style={{ color: "#aeaeb2" }}>(선택 · SNS, 블로그 등)</span>
                    </label>
                </div>
                <input
                    type="url"
                    value={portfolio}
                    onChange={e => setPortfolio(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-0 py-3 text-[14px] outline-none bg-transparent"
                    style={{
                        color: "#1c1c1e",
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        borderBottom: "1.5px solid rgba(0,0,0,0.12)",
                        borderRadius: 0,
                        transition: "border-color 0.15s",
                    }}
                    onFocus={e => { e.currentTarget.style.borderBottomColor = "#ff9500"; }}
                    onBlur={e => { e.currentTarget.style.borderBottomColor = "rgba(0,0,0,0.12)"; }}
                />
            </div>

            {error && (
                <p className="text-[13px]" style={{ color: "#ff3b30" }}>{error}</p>
            )}

            <button
                onClick={handleSubmit}
                disabled={submitting || reason.trim().length < 10}
                className="w-full py-3.5 text-[14px] font-semibold text-white transition-all active:scale-[0.99] disabled:opacity-40"
                style={{
                    background: "#ff9500",
                    borderRadius: "10px",
                    letterSpacing: "-0.01em",
                }}>
                {submitting ? "신청 중..." : "입점 신청하기"}
            </button>
        </div>
    );
}

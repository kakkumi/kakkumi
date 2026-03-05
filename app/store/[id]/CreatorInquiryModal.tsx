"use client";

import { useState } from "react";

type Props = {
    creatorId: string;
    creatorName: string;
    themeId: string;
    themeName: string;
    onCloseAction: () => void;
};

export default function CreatorInquiryModal({ creatorId, creatorName, themeId, themeName, onCloseAction }: Props) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/inquiry/creator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, creatorId, themeId, themeName }),
            });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) {
                setError(data.error ?? "문의 접수에 실패했습니다.");
            } else {
                setDone(true);
            }
        } catch {
            setError("문의 접수에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        /* 배경 오버레이 */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={onCloseAction}
        >
            <div
                className="w-full max-w-[520px] rounded-[28px] p-8 flex flex-col gap-6"
                style={{
                    background: "rgba(255,255,255,0.97)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                    border: "1px solid rgba(255,255,255,0.9)",
                }}
                onClick={e => e.stopPropagation()}
            >
                {done ? (
                    /* 완료 상태 */
                    <div className="flex flex-col items-center gap-5 py-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(52,199,89,0.12)" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>
                        <div className="text-center flex flex-col gap-1.5">
                            <h2 className="text-[18px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>문의가 접수됐어요!</h2>
                            <p className="text-[13px]" style={{ color: "#8e8e93" }}>마이페이지 &gt; 1:1 문의에서 확인하실 수 있어요.</p>
                        </div>
                        <button
                            onClick={onCloseAction}
                            className="px-8 py-3 rounded-xl text-[14px] font-bold transition-all hover:brightness-105 active:scale-95"
                            style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D" }}
                        >
                            확인
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 헤더 */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <h2 className="text-[18px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>제작자에게 문의하기</h2>
                                <p className="text-[12px]" style={{ color: "#8e8e93" }}>
                                    <span className="font-semibold" style={{ color: "#3a3a3c" }}>{creatorName}</span> 님 · {themeName}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onCloseAction}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-70"
                                style={{ background: "rgba(0,0,0,0.06)" }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* 폼 */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* 제목 */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold" style={{ color: "#3a3a3c" }}>
                                    제목 <span style={{ color: "#FF3B30" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="문의 제목을 입력해주세요"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    maxLength={100}
                                    className="px-4 py-3 rounded-xl text-[13px] outline-none"
                                    style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.1)", color: "#1c1c1e" }}
                                />
                            </div>

                            {/* 문의 내용 */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold" style={{ color: "#3a3a3c" }}>
                                    문의 내용 <span style={{ color: "#FF3B30" }}>*</span>
                                </label>
                                <textarea
                                    required
                                    rows={7}
                                    placeholder="문의하실 내용을 자세히 적어주세요"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="px-4 py-3 rounded-xl text-[13px] outline-none resize-none"
                                    style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.1)", color: "#1c1c1e" }}
                                />
                            </div>

                            {error && (
                                <p className="text-[12px]" style={{ color: "#FF3B30" }}>{error}</p>
                            )}

                            {/* 안내 문구 */}
                            <div className="flex items-start gap-2 px-4 py-3 rounded-[12px]" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <p className="text-[11px] leading-relaxed" style={{ color: "#8e8e93" }}>
                                    허위 내용이나 반복 문의 시 이용이 제한될 수 있으니 정확한 내용을 작성해주세요.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !title.trim() || !content.trim()}
                                className="self-start px-8 py-3 rounded-xl text-[14px] font-bold transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
                                style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.3)" }}
                            >
                                {submitting ? "접수 중..." : "문의 접수하기"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

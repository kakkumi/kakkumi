"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { SessionUser } from "@/lib/session";

type Props = {
    session: SessionUser | null;
};

const CHECKLIST = [
    "구매한 테마는 탈퇴 후 사용할 수 없으며 환불되지 않습니다.",
    "등록한 테마, 리뷰, 문의 내역이 모두 삭제됩니다.",
    "삭제된 계정과 데이터는 복구할 수 없습니다.",
    "같은 카카오 계정으로 재가입하면 새 계정으로 처음부터 시작합니다.",
];

export default function WithdrawClient({ session }: Props) {
    const router = useRouter();
    const [checked, setChecked] = useState<boolean[]>(CHECKLIST.map(() => false));
    const [confirmInput, setConfirmInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const allChecked = checked.every(Boolean);
    const confirmMatch = confirmInput === "탈퇴하겠습니다";
    const canSubmit = allChecked && confirmMatch && !loading;

    const toggleCheck = (idx: number) => {
        setChecked((prev) => prev.map((v, i) => (i === idx ? !v : v)));
    };

    const handleWithdraw = async () => {
        if (!canSubmit) return;
        setLoading(true);
        setError("");

        const res = await fetch("/api/auth/withdraw", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirm: "탈퇴하겠습니다" }),
        });
        const data = await res.json() as { ok?: boolean; error?: string };

        if (!res.ok) {
            setError(data.error ?? "탈퇴 처리 중 오류가 발생했습니다.");
            setLoading(false);
            return;
        }

        router.push("/?withdrawn=1");
    };

    if (!session?.dbId) {
        return (
            <div className="flex flex-1 max-w-[1200px] mx-auto w-full px-6 pt-12 pb-20 justify-center">
                <div
                    className="flex flex-col items-center gap-6 p-12 rounded-[32px] w-full max-w-[500px]"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                    }}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#f5f5f5" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </div>
                    <div className="flex flex-col gap-2 text-center">
                        <h2 className="text-[22px] font-bold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>로그인이 필요해요</h2>
                        <p className="text-[14px]" style={{ color: "#8e8e93" }}>회원 탈퇴를 진행하려면 로그인을 해주세요.</p>
                    </div>
                    <a href="/api/auth/kakao">
                        <button
                            className="px-8 py-3.5 rounded-xl text-[15px] font-bold transition-all active:scale-95 hover:brightness-105"
                            style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.3)" }}
                        >
                            카카오 로그인
                        </button>
                    </a>
                </div>
            </div>
        );
    }

    const displayName = session.nickname ?? session.name ?? "사용자";

    return (
        <div className="flex flex-1 max-w-[1200px] mx-auto w-full px-6 pt-12 pb-20 gap-8">
            {/* 사이드바 */}
            <aside className="w-[220px] shrink-0 flex flex-col gap-1">
                <a href="/mypage">
                    <button
                        className="flex items-center gap-2 text-[13px] font-medium px-3 py-2 rounded-xl transition-all hover:opacity-70 mb-2"
                        style={{ color: "#8e8e93" }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        마이페이지로
                    </button>
                </a>
                <div className="h-[1px] mb-3" style={{ background: "rgba(0,0,0,0.08)" }} />
                {[
                    { label: "기본 정보", href: "/mypage/settings" },
                    { label: "알림 설정", href: "/mypage/settings/notifications" },
                    { label: "연결된 계정", href: "/mypage/settings/connected" },
                ].map((item) => (
                    <a key={item.label} href={item.href}>
                        <button
                            className="w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all hover:opacity-70"
                            style={{ color: "#3a3a3c", background: "transparent" }}
                        >
                            {item.label}
                        </button>
                    </a>
                ))}
                <div className="my-3 h-[1px]" style={{ background: "rgba(0,0,0,0.08)" }} />
                <a href="/mypage/settings/withdraw">
                    <button
                        className="w-full text-left px-3 py-2 rounded-xl text-[13px] font-bold transition-all"
                        style={{ color: "#ff3b30", background: "transparent" }}
                    >
                        회원 탈퇴
                    </button>
                </a>
            </aside>

            {/* 메인 */}
            <main className="flex-1 flex flex-col gap-6 max-w-[600px]">
                {/* 타이틀 */}
                <div>
                    <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>회원 탈퇴</h1>
                    <p className="text-[13px] mt-1" style={{ color: "#8e8e93" }}>탈퇴 전 아래 내용을 꼭 확인해주세요.</p>
                </div>

                {/* 프로필 확인 */}
                <div
                    className="flex items-center gap-4 p-5 rounded-[20px]"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    }}
                >
                    <div
                        className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                        style={{ background: "#ffe500" }}
                    >
                        {session.image ? (
                            <Image src={session.image} alt={displayName} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3A1D1D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <p className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>{displayName}</p>
                        <p className="text-[12px]" style={{ color: "#8e8e93" }}>{session.email ?? "이메일 없음"}</p>
                    </div>
                    <span
                        className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(255,59,48,0.10)", color: "#ff3b30" }}
                    >
                        탈퇴 예정
                    </span>
                </div>

                {/* 주의사항 체크리스트 */}
                <div
                    className="p-6 rounded-[24px] flex flex-col gap-4"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    }}
                >
                    <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <h3 className="text-[14px] font-bold" style={{ color: "#ff3b30" }}>탈퇴 전 반드시 확인하세요</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        {CHECKLIST.map((text, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => toggleCheck(idx)}
                                className="flex items-start gap-3 text-left transition-all hover:opacity-80"
                            >
                                <div
                                    className="shrink-0 w-5 h-5 rounded-md mt-0.5 flex items-center justify-center transition-all"
                                    style={{
                                        background: checked[idx] ? "#ff3b30" : "transparent",
                                        border: `1.5px solid ${checked[idx] ? "#ff3b30" : "rgba(0,0,0,0.18)"}`,
                                    }}
                                >
                                    {checked[idx] && (
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-[13px] leading-relaxed" style={{ color: "#3a3a3c" }}>{text}</span>
                            </button>
                        ))}
                    </div>
                    {!allChecked && (
                        <p className="text-[11px]" style={{ color: "#8e8e93" }}>위 항목을 모두 체크해야 탈퇴를 진행할 수 있습니다.</p>
                    )}
                </div>

                {/* 확인 문구 입력 */}
                <div
                    className="p-6 rounded-[24px] flex flex-col gap-4"
                    style={{
                        background: allChecked ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)",
                        backdropFilter: "blur(20px)",
                        border: `1px solid ${allChecked ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)"}`,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                        opacity: allChecked ? 1 : 0.5,
                        pointerEvents: allChecked ? "auto" : "none",
                    }}
                >
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>
                            탈퇴 확인
                        </label>
                        <p className="text-[12px]" style={{ color: "#8e8e93" }}>
                            아래 입력창에 <span className="font-bold" style={{ color: "#ff3b30" }}>탈퇴하겠습니다</span> 를 입력하세요.
                        </p>
                    </div>
                    <input
                        type="text"
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                        placeholder="탈퇴하겠습니다"
                        className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                        style={{
                            border: `1.5px solid ${confirmMatch ? "#ff3b30" : "rgba(0,0,0,0.12)"}`,
                            background: "rgba(255,255,255,0.9)",
                            color: "#1c1c1e",
                        }}
                    />
                </div>

                {/* 오류 메시지 */}
                {error && (
                    <p className="text-[13px] font-medium" style={{ color: "#ff3b30" }}>{error}</p>
                )}

                {/* 버튼 */}
                <div className="flex gap-3">
                    <a href="/mypage/settings" className="flex-1">
                        <button
                            className="w-full py-3.5 rounded-xl text-[14px] font-semibold transition-all hover:opacity-80 active:scale-95"
                            style={{
                                background: "rgba(0,0,0,0.06)",
                                color: "#3a3a3c",
                            }}
                        >
                            취소
                        </button>
                    </a>
                    <button
                        onClick={handleWithdraw}
                        disabled={!canSubmit}
                        className="flex-1 py-3.5 rounded-xl text-[14px] font-bold transition-all active:scale-95 disabled:opacity-30"
                        style={{
                            background: canSubmit ? "#ff3b30" : "rgba(255,59,48,0.3)",
                            color: "#fff",
                            boxShadow: canSubmit ? "0 4px 16px rgba(255,59,48,0.3)" : "none",
                        }}
                    >
                        {loading ? "탈퇴 처리 중..." : "탈퇴하기"}
                    </button>
                </div>
            </main>
        </div>
    );
}

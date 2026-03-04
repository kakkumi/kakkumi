"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { validateNickname } from "@/lib/nickname";
import Image from "next/image";

export default function OnboardingPage() {
    const router = useRouter();
    const [nickname, setNickname] = useState("");
    const [error, setError] = useState("");
    const [checkStatus, setCheckStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
    const [saving, setSaving] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 입력할 때마다 실시간 중복 체크 (debounce)
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const validationError = validateNickname(nickname);
            if (validationError) {
                setError(validationError);
                setCheckStatus("idle");
                return;
            }

            setError("");
            setCheckStatus("checking");

            fetch(`/api/user/nickname/check?nickname=${encodeURIComponent(nickname)}`)
                .then((res) => res.json())
                .then((data: { available: boolean; error?: string }) => {
                    if (data.error) {
                        setError(data.error);
                        setCheckStatus("idle");
                    } else {
                        setCheckStatus(data.available ? "available" : "taken");
                        if (!data.available) setError("이미 사용 중인 닉네임입니다.");
                    }
                })
                .catch(() => setCheckStatus("idle"));
        }, 500);
    }, [nickname]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (checkStatus !== "available" || saving) return;

        setSaving(true);
        const res = await fetch("/api/user/nickname", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname }),
        });
        const data = await res.json() as { nickname?: string; error?: string };
        setSaving(false);

        if (!res.ok) {
            setError(data.error ?? "저장 실패");
        } else {
            router.push("/");
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}
        >
            <div
                className="w-full max-w-[420px] flex flex-col gap-8 p-10 rounded-[28px]"
                style={{
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(255,255,255,0.9)",
                }}
            >
                {/* 로고 */}
                <div className="flex flex-col items-center gap-3">
                    <Image src="/카꾸미.png" alt="카꾸미" width={52} height={52} className="rounded-[14px]" />
                    <div className="flex flex-col items-center gap-1">
                        <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                            카꾸미에 오신 걸 환영해요!
                        </h1>
                        <p className="text-[13px] text-center leading-relaxed" style={{ color: "#8e8e93" }}>
                            카꾸미에서 사용할 닉네임을 설정해주세요.
                        </p>
                    </div>
                </div>

                {/* 규칙 안내 */}
                <div
                    className="flex flex-col gap-1.5 px-4 py-3 rounded-[12px] text-[12px] leading-relaxed"
                    style={{ background: "rgba(74,123,247,0.07)", color: "#3a5a8a" }}
                >
                    <p className="font-semibold">닉네임 규칙</p>
                    <ul className="flex flex-col gap-0.5 list-disc list-inside" style={{ color: "#48484a" }}>
                        <li>2~10자 이내</li>
                        <li>한글, 영문, 숫자 사용 가능</li>
                        <li>특수문자 불가</li>
                        <li>숫자만으로는 설정 불가</li>
                    </ul>
                </div>

                {/* 입력 폼 */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-semibold" style={{ color: "#3a3a3c" }}>
                            닉네임 <span style={{ color: "#FF3B30" }}>*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임을 입력해주세요"
                                maxLength={10}
                                autoFocus
                                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none pr-10"
                                style={{
                                    background: "rgba(255,255,255,0.9)",
                                    border: `1.5px solid ${
                                        checkStatus === "available" ? "#34c759"
                                        : checkStatus === "taken" || error ? "#ff3b30"
                                        : "rgba(0,0,0,0.12)"
                                    }`,
                                    color: "#1c1c1e",
                                    transition: "border-color 0.15s",
                                }}
                            />
                            {/* 상태 아이콘 */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {checkStatus === "checking" && (
                                    <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />
                                )}
                                {checkStatus === "available" && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                )}
                                {checkStatus === "taken" && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* 상태 메시지 */}
                        <div className="flex items-center justify-between">
                            <p className="text-[11px]" style={{ color: checkStatus === "available" ? "#34c759" : "#ff3b30", minHeight: 16 }}>
                                {checkStatus === "available" ? "사용 가능한 닉네임입니다." : error}
                            </p>
                            <p className="text-[11px]" style={{ color: "#8e8e93" }}>{nickname.length} / 10</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={checkStatus !== "available" || saving}
                        className="w-full py-3.5 rounded-xl text-[15px] font-bold transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-40"
                        style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.25)" }}
                    >
                        {saving ? "저장 중..." : "시작하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}

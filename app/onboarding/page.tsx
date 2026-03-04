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

    // 프로필 이미지 상태
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setAvatarError("이미지 파일만 업로드할 수 있습니다.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setAvatarError("이미지 크기는 2MB 이하여야 합니다.");
            return;
        }
        setAvatarError("");
        const reader = new FileReader();
        reader.onload = (ev) => {
            setAvatarPreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (checkStatus !== "available" || saving) return;

        setSaving(true);

        // 1) 닉네임 저장
        const res = await fetch("/api/user/nickname", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname }),
        });
        const data = await res.json() as { nickname?: string; error?: string };

        if (!res.ok) {
            setError(data.error ?? "저장 실패");
            setSaving(false);
            return;
        }

        // 2) 프로필 이미지 저장 (선택한 경우만)
        if (avatarPreview) {
            await fetch("/api/user/avatar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatarUrl: avatarPreview }),
            });
        }

        setSaving(false);
        router.push("/");
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
                className="w-full max-w-[440px] flex flex-col gap-7 p-10 rounded-[28px]"
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
                            프로필을 설정하고 시작해보세요.
                        </p>
                    </div>
                </div>

                {/* 입력 폼 */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* 프로필 이미지 (선택) */}
                    <div className="flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="relative group w-24 h-24 rounded-full overflow-hidden flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
                            style={{ background: "#ffe500", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}
                        >
                            {avatarPreview ? (
                                <Image src={avatarPreview} alt="프로필 미리보기" fill className="object-cover" unoptimized />
                            ) : (
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3A1D1D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                            )}
                            {/* 오버레이 */}
                            <div
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: "rgba(0,0,0,0.35)" }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[12px] font-medium" style={{ color: "#3a3a3c" }}>
                                프로필 사진 <span className="text-[11px]" style={{ color: "#8e8e93" }}>(선택)</span>
                            </span>
                            {avatarPreview && (
                                <button
                                    type="button"
                                    onClick={() => { setAvatarPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                    className="text-[11px] transition-all hover:opacity-70"
                                    style={{ color: "#ff3b30" }}
                                >
                                    사진 제거
                                </button>
                            )}
                            {avatarError && <p className="text-[11px]" style={{ color: "#ff3b30" }}>{avatarError}</p>}
                        </div>
                    </div>

                    {/* 닉네임 */}
                    <div className="flex flex-col gap-3">
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

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { validateNickname } from "@/lib/nickname";

type Session = {
    name?: string | null;
    nickname?: string | null;
    avatarUrl?: string | null;
    id?: string | null;
    dbId?: string | null;
    email?: string | null;
    role?: string | null;
} | null;

type Props = {
    session: Session;
};

export default function SettingsClient({ session }: Props) {
    const router = useRouter();

    // 닉네임 상태
    const [nickInput, setNickInput] = useState(session?.nickname ?? session?.name ?? "");
    const [nickError, setNickError] = useState("");
    const [nickCheckStatus, setNickCheckStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
    const [nickSaving, setNickSaving] = useState(false);
    const [nickSuccess, setNickSuccess] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 프로필 이미지 상태
    const [avatarPreview, setAvatarPreview] = useState<string | null>(session?.avatarUrl ?? null);
    const [avatarError, setAvatarError] = useState("");
    const [avatarSaving, setAvatarSaving] = useState(false);
    const [avatarSuccess, setAvatarSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentNickname = session?.nickname ?? session?.name ?? "";

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const trimmed = nickInput.trim();

        debounceRef.current = setTimeout(async () => {
            if (!trimmed || trimmed === currentNickname) {
                setNickError("");
                setNickCheckStatus("idle");
                return;
            }

            const validationError = validateNickname(trimmed);
            if (validationError) {
                setNickError(validationError);
                setNickCheckStatus("idle");
                return;
            }

            setNickError("");
            setNickCheckStatus("checking");
            try {
                const res = await fetch(`/api/user/nickname/check?nickname=${encodeURIComponent(trimmed)}`);
                const data = await res.json() as { available: boolean; error?: string };
                if (data.error) {
                    setNickError(data.error);
                    setNickCheckStatus("idle");
                } else {
                    setNickCheckStatus(data.available ? "available" : "taken");
                    if (!data.available) setNickError("이미 사용 중인 닉네임입니다.");
                }
            } catch {
                setNickCheckStatus("idle");
            }
        }, 500);
    }, [nickInput, currentNickname]);

    const handleNickSave = async () => {
        if (nickSaving) return;
        const trimmed = nickInput.trim();

        if (trimmed === currentNickname) {
            setNickError("현재 닉네임과 동일합니다.");
            return;
        }
        if (nickCheckStatus !== "available") return;

        setNickSaving(true);
        setNickError("");
        const res = await fetch("/api/user/nickname", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname: trimmed }),
        });
        const data = await res.json() as { nickname?: string; error?: string };
        setNickSaving(false);
        if (!res.ok) {
            setNickError(data.error ?? "저장 실패");
        } else {
            setNickSuccess(true);
            setTimeout(() => setNickSuccess(false), 3000);
            router.refresh();
        }
    };

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

    const handleAvatarSave = async (url: string | null) => {
        setAvatarSaving(true);
        setAvatarError("");
        const res = await fetch("/api/user/avatar", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatarUrl: url }),
        });
        const data = await res.json() as { avatarUrl?: string | null; error?: string };
        setAvatarSaving(false);
        if (!res.ok) {
            setAvatarError(data.error ?? "저장 실패");
        } else {
            setAvatarPreview(url);
            setAvatarSuccess(true);
            setTimeout(() => setAvatarSuccess(false), 3000);
            router.refresh();
        }
    };

    if (!session?.dbId) {
        return (
            <div className="max-w-[1100px] mx-auto w-full px-6 pt-14 pb-24">
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#f5f5f4" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </div>
                    <div className="flex flex-col gap-1.5 text-center">
                        <h2 className="text-[20px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>로그인이 필요해요</h2>
                        <p className="text-[13px]" style={{ color: "#a8a29e" }}>회원정보 수정을 이용하려면 로그인을 해주세요.</p>
                    </div>
                    <a href="/api/auth/kakao" className="mt-2">
                        <button className="px-7 py-3 rounded-xl text-[14px] font-bold transition-opacity hover:opacity-80" style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D" }}>
                            카카오 로그인
                        </button>
                    </a>
                </div>
            </div>
        );
    }

    const displayName = session.nickname ?? session.name ?? "사용자";

    return (
        <div className="max-w-[1100px] mx-auto w-full px-6 pt-14 pb-24">
            <main className="flex flex-col">
                {/* 페이지 제목 */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Account</p>
                        <h1 className="text-[26px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>회원정보 수정</h1>
                    </div>
                </div>

                {/* 프로필 이미지 */}
                <div className="flex flex-col gap-4 pb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>프로필 이미지</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="relative group shrink-0 rounded-full overflow-hidden flex items-center justify-center transition-opacity hover:opacity-80"
                            style={{ width: 72, height: 72, background: avatarPreview ? "transparent" : "#e7e5e4" }}
                        >
                            {avatarPreview ? (
                                <Image src={avatarPreview} alt={displayName} width={72} height={72} className="w-full h-full object-cover" unoptimized />
                            ) : (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full" style={{ background: "rgba(0,0,0,0.3)" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[12px] font-medium transition-opacity hover:opacity-60" style={{ color: "#78716c" }}>
                                    사진 선택
                                </button>
                                {avatarPreview && avatarPreview !== (session?.avatarUrl ?? null) && (
                                    <>
                                        <span style={{ color: "#e7e5e4" }}>·</span>
                                        <button type="button" onClick={() => handleAvatarSave(avatarPreview)} disabled={avatarSaving} className="text-[12px] font-semibold transition-opacity hover:opacity-60 disabled:opacity-30" style={{ color: "#FF9500" }}>
                                            {avatarSaving ? "저장 중..." : "저장"}
                                        </button>
                                    </>
                                )}
                                {(avatarPreview ?? session?.avatarUrl) && (
                                    <>
                                        <span style={{ color: "#e7e5e4" }}>·</span>
                                        <button type="button" onClick={() => { setAvatarPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; handleAvatarSave(null); }} disabled={avatarSaving} className="text-[12px] font-medium transition-opacity hover:opacity-60 disabled:opacity-30" style={{ color: "#ff3b30" }}>
                                            사진 제거
                                        </button>
                                    </>
                                )}
                            </div>
                            {avatarSuccess && <p className="text-[11px]" style={{ color: "#34c759" }}>✓ 프로필 사진이 저장되었습니다.</p>}
                            {avatarError && <p className="text-[11px]" style={{ color: "#ff3b30" }}>{avatarError}</p>}
                            {!avatarSuccess && !avatarError && <p className="text-[11px]" style={{ color: "#a8a29e" }}>JPG, PNG, GIF · 최대 2MB</p>}
                        </div>
                    </div>
                </div>

                {/* 닉네임 */}
                <div className="flex flex-col gap-4 py-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>닉네임</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    value={nickInput}
                                    onChange={(e) => { setNickInput(e.target.value); setNickSuccess(false); }}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleNickSave(); }}
                                    maxLength={10}
                                    placeholder="닉네임을 입력하세요"
                                    className="text-[14px] px-0 py-2 outline-none pr-7 bg-transparent"
                                    style={{
                                        borderBottom: `1.5px solid ${nickCheckStatus === "available" ? "#34c759" : nickCheckStatus === "taken" || nickError ? "#ff3b30" : "#d6d3d1"}`,
                                        color: "#1c1917", width: 220,
                                    }}
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                    {nickCheckStatus === "checking" && <div className="w-3.5 h-3.5 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />}
                                    {nickCheckStatus === "available" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                                    {nickCheckStatus === "taken" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                                </div>
                            </div>
                            <button onClick={handleNickSave} disabled={nickSaving || nickCheckStatus !== "available" || nickInput.trim() === currentNickname} className="text-[12px] font-semibold transition-opacity hover:opacity-60 disabled:opacity-30" style={{ color: "#FF9500" }}>
                                {nickSaving ? "저장 중..." : "저장"}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-[11px]" style={{ color: nickSuccess ? "#34c759" : nickCheckStatus === "available" && !nickError ? "#34c759" : nickError ? "#ff3b30" : "#a8a29e" }}>
                                {nickSuccess ? "✓ 닉네임이 저장되었습니다." : nickCheckStatus === "available" && !nickError ? "✓ 사용 가능한 닉네임입니다." : nickError ? nickError : "한글, 영문, 숫자 2~10자 (특수문자 불가, 숫자만 불가)"}
                            </p>
                            <p className="text-[11px]" style={{ color: "#a8a29e" }}>{nickInput.trim().length} / 10</p>
                        </div>
                    </div>
                </div>

                {/* 이메일 */}
                <div className="flex flex-col gap-4 py-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>이메일</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[14px]" style={{ color: session.email ? "#1c1917" : "#a8a29e" }}>{session.email ?? "이메일 정보 없음"}</span>
                        {session.email && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(52,199,89,0.1)", color: "#34c759" }}>인증됨</span>}
                    </div>
                    <p className="text-[11px]" style={{ color: "#a8a29e" }}>이메일은 카카오 계정과 연동되어 있습니다. 변경을 원하시면 카카오 계정에서 수정해주세요.</p>
                </div>

                {/* 계정 정보 */}
                <div className="flex flex-col gap-1 py-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>계정 정보</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                    </div>
                    <div className="flex items-center justify-between py-3.5">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[14px]" style={{ color: "#1c1917" }}>연결된 소셜 계정</span>
                            <span className="text-[12px]" style={{ color: "#a8a29e" }}>카카오 계정으로 로그인 중</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,231,58,0.15)", border: "1px solid rgba(255,231,58,0.4)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#3A1D1D">
                                <path d="M12 3C7.029 3 3 6.582 3 11c0 2.67 1.416 5.03 3.6 6.6L5.4 21l4.2-2.1C10.5 19.26 11.23 19.4 12 19.4c4.971 0 9-3.582 9-8S16.971 3 12 3z" />
                            </svg>
                            <span className="text-[11px] font-semibold" style={{ color: "#3A1D1D" }}>카카오</span>
                        </div>
                    </div>
                    <div className="h-px" style={{ background: "#f5f5f4" }} />
                    <div className="flex items-center justify-between py-3.5">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[14px]" style={{ color: "#1c1917" }}>계정 등급</span>
                            <span className="text-[12px]" style={{ color: "#a8a29e" }}>현재 서비스 이용 등급</span>
                        </div>
                        <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{
                            background: session.role === "ADMIN" ? "rgba(255,59,48,0.1)" : session.role === "CREATOR" ? "rgba(255,149,0,0.1)" : "rgba(74,123,247,0.1)",
                            color: session.role === "ADMIN" ? "#ff3b30" : session.role === "CREATOR" ? "#FF9500" : "#4a7bf7",
                        }}>
                            {session.role === "ADMIN" ? "관리자" : session.role === "CREATOR" ? "크리에이터" : "일반 회원"}
                        </span>
                    </div>
                    <div className="h-px" style={{ background: "#f5f5f4" }} />
                    <div className="flex items-center justify-between py-3.5">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[14px]" style={{ color: "#1c1917" }}>카카오 이름</span>
                            <span className="text-[12px]" style={{ color: "#a8a29e" }}>카카오 계정에 등록된 이름</span>
                        </div>
                        <span className="text-[13px]" style={{ color: "#78716c" }}>{session.name ?? "-"}</span>
                    </div>
                </div>

                {/* 위험 영역 */}
                <div className="pt-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#ff3b30" }}>위험 영역</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,59,48,0.15)" }} />
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[14px]" style={{ color: "#1c1917" }}>회원 탈퇴</span>
                            <span className="text-[12px]" style={{ color: "#a8a29e" }}>탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</span>
                        </div>
                        <button className="text-[13px] font-medium transition-opacity hover:opacity-50" style={{ color: "#ff3b30" }}>
                            탈퇴하기
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

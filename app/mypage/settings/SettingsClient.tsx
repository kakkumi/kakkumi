"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { validateNickname } from "@/lib/nickname";

type Session = {
    name?: string | null;
    nickname?: string | null;
    image?: string | null;
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
                        <p className="text-[14px]" style={{ color: "#8e8e93" }}>회원정보 수정을 이용하려면 로그인을 해주세요.</p>
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
                    { label: "기본 정보", href: "/mypage/settings", active: true },
                    { label: "알림 설정", href: "/mypage/settings/notifications", active: false },
                ].map((item) => (
                    <a key={item.label} href={item.href}>
                        <button
                            className="w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                            style={{
                                color: item.active ? "#FF9500" : "#3a3a3c",
                                background: "transparent",
                                fontWeight: item.active ? 700 : 500,
                            }}
                        >
                            {item.label}
                        </button>
                    </a>
                ))}
                <div className="my-3 h-[1px]" style={{ background: "rgba(0,0,0,0.08)" }} />
                <button
                    className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all hover:opacity-70"
                    style={{ color: "#ff3b30" }}
                >
                    회원 탈퇴
                </button>
            </aside>

            {/* 메인 */}
            <main className="flex-1 flex flex-col gap-6">
                {/* 페이지 제목 */}
                <div>
                    <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>회원정보 수정</h1>
                    <p className="text-[13px] mt-1" style={{ color: "#8e8e93" }}>계정 정보를 관리하세요.</p>
                </div>

                {/* 프로필 섹션 */}
                <div
                    className="p-7 rounded-[24px] flex flex-col gap-7"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    }}
                >
                    {/* 프로필 이미지 */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>
                            프로필 이미지 <span className="text-[11px] font-normal" style={{ color: "#8e8e93" }}>(선택)</span>
                        </label>
                        <div className="flex items-center gap-5">
                            {/* 프로필 원형 버튼 */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative group w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0 transition-all hover:opacity-90 active:scale-95"
                                style={{ background: "#ffe500", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}
                            >
                                {avatarPreview ? (
                                    <Image src={avatarPreview} alt={displayName} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                                ) : session?.image ? (
                                    <Image src={session.image} alt={displayName} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                                ) : (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3A1D1D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                    </svg>
                                )}
                                <div
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: "rgba(0,0,0,0.35)" }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all hover:brightness-105 active:scale-95"
                                        style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}
                                    >
                                        사진 선택
                                    </button>
                                    {/* 선택된 미리보기가 현재 저장된 것과 다를 때만 저장 버튼 표시 */}
                                    {avatarPreview && avatarPreview !== (session?.avatarUrl ?? null) && (
                                        <button
                                            type="button"
                                            onClick={() => handleAvatarSave(avatarPreview)}
                                            disabled={avatarSaving}
                                            className="px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all hover:brightness-105 active:scale-95 disabled:opacity-40"
                                            style={{ background: "#FF9500", color: "#fff" }}
                                        >
                                            {avatarSaving ? "저장 중..." : "저장"}
                                        </button>
                                    )}
                                    {/* 커스텀 이미지가 있으면 삭제 버튼 */}
                                    {(avatarPreview ?? session?.avatarUrl) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAvatarPreview(null);
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                                handleAvatarSave(null);
                                            }}
                                            disabled={avatarSaving}
                                            className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-70 disabled:opacity-40"
                                            style={{ color: "#ff3b30", border: "1px solid rgba(255,59,48,0.3)" }}
                                        >
                                            사진 제거
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    {avatarSuccess && <p className="text-[11px]" style={{ color: "#34c759" }}>✓ 프로필 사진이 저장되었습니다.</p>}
                                    {avatarError && <p className="text-[11px]" style={{ color: "#ff3b30" }}>{avatarError}</p>}
                                    <p className="text-[11px]" style={{ color: "#8e8e93" }}>JPG, PNG, GIF · 최대 2MB</p>
                                    {!session?.avatarUrl && (
                                        <p className="text-[11px]" style={{ color: "#8e8e93" }}>현재 카카오 프로필 이미지를 사용 중입니다.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.07)" }} />

                    {/* 닉네임 */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>닉네임</label>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <input
                                        value={nickInput}
                                        onChange={(e) => { setNickInput(e.target.value); setNickSuccess(false); }}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleNickSave(); }}
                                        maxLength={10}
                                        placeholder="닉네임을 입력하세요"
                                        className="text-[14px] font-medium px-4 py-2.5 rounded-xl outline-none pr-10"
                                        style={{
                                            border: `1.5px solid ${nickCheckStatus === "available" ? "#34c759" : nickCheckStatus === "taken" || nickError ? "#ff3b30" : "rgba(0,0,0,0.12)"}`,
                                            color: "#1c1c1e",
                                            width: 260,
                                            background: "rgba(255,255,255,0.8)",
                                        }}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {nickCheckStatus === "checking" && (
                                            <div className="w-3.5 h-3.5 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />
                                        )}
                                        {nickCheckStatus === "available" && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                        )}
                                        {nickCheckStatus === "taken" && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleNickSave}
                                    disabled={nickSaving || nickCheckStatus !== "available" || nickInput.trim() === currentNickname}
                                    className="px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 active:scale-95 disabled:opacity-40"
                                    style={{ background: "#FF9500", color: "#fff" }}
                                >
                                    {nickSaving ? "저장 중..." : "저장"}
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <p
                                    className="text-[11px]"
                                    style={{
                                        color: nickSuccess ? "#34c759" : nickCheckStatus === "available" && !nickError ? "#34c759" : nickError ? "#ff3b30" : "#8e8e93",
                                        minHeight: 16,
                                    }}
                                >
                                    {nickSuccess
                                        ? "✓ 닉네임이 저장되었습니다."
                                        : nickCheckStatus === "available" && !nickError
                                            ? "✓ 사용 가능한 닉네임입니다."
                                            : nickError
                                                ? nickError
                                                : "한글, 영문, 숫자 2~10자 (특수문자 불가, 숫자만 불가)"}
                                </p>
                                <p className="text-[11px]" style={{ color: "#8e8e93" }}>{nickInput.trim().length} / 10</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.07)" }} />

                    {/* 이메일 */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>이메일</label>
                        <div className="flex items-center gap-3">
                            <div
                                className="text-[14px] px-4 py-2.5 rounded-xl flex-1 max-w-[320px]"
                                style={{
                                    border: "1.5px solid rgba(0,0,0,0.08)",
                                    color: session.email ? "#1c1c1e" : "#8e8e93",
                                    background: "rgba(0,0,0,0.03)",
                                }}
                            >
                                {session.email ?? "이메일 정보 없음"}
                            </div>
                            {session.email && (
                                <span
                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                    style={{ background: "rgba(52,199,89,0.12)", color: "#34c759" }}
                                >
                                    인증됨
                                </span>
                            )}
                        </div>
                        <p className="text-[11px]" style={{ color: "#8e8e93" }}>
                            이메일은 카카오 계정과 연동되어 있습니다. 변경을 원하시면 카카오 계정에서 수정해주세요.
                        </p>
                    </div>
                </div>

                {/* 계정 정보 섹션 */}
                <div
                    className="p-7 rounded-[24px] flex flex-col gap-5"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    }}
                >
                    <h3 className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>계정 정보</h3>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>연결된 소셜 계정</span>
                                <span className="text-[11px]" style={{ color: "#8e8e93" }}>카카오 계정으로 로그인 중</span>
                            </div>
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                style={{ background: "rgba(255,231,58,0.2)", border: "1px solid rgba(255,231,58,0.5)" }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#3A1D1D">
                                    <path d="M12 3C7.029 3 3 6.582 3 11c0 2.67 1.416 5.03 3.6 6.6L5.4 21l4.2-2.1C10.5 19.26 11.23 19.4 12 19.4c4.971 0 9-3.582 9-8S16.971 3 12 3z" />
                                </svg>
                                <span className="text-[12px] font-semibold" style={{ color: "#3A1D1D" }}>카카오</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>계정 등급</span>
                                <span className="text-[11px]" style={{ color: "#8e8e93" }}>현재 서비스 이용 등급</span>
                            </div>
                            <span
                                className="text-[12px] font-semibold px-3 py-1 rounded-full"
                                style={{
                                    background: session.role === "ADMIN"
                                        ? "rgba(255,59,48,0.12)"
                                        : session.role === "CREATOR"
                                            ? "rgba(255,149,0,0.12)"
                                            : "rgba(0,122,255,0.12)",
                                    color: session.role === "ADMIN"
                                        ? "#ff3b30"
                                        : session.role === "CREATOR"
                                            ? "#FF9500"
                                            : "#007aff",
                                }}
                            >
                                {session.role === "ADMIN" ? "관리자" : session.role === "CREATOR" ? "크리에이터" : "일반 회원"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>카카오 이름</span>
                                <span className="text-[11px]" style={{ color: "#8e8e93" }}>카카오 계정에 등록된 이름</span>
                            </div>
                            <span className="text-[13px] font-medium" style={{ color: "#3a3a3c" }}>
                                {session.name ?? "-"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 위험 영역 */}
                <div
                    className="p-7 rounded-[24px] flex flex-col gap-4"
                    style={{
                        background: "rgba(255,59,48,0.04)",
                        border: "1px solid rgba(255,59,48,0.12)",
                    }}
                >
                    <h3 className="text-[15px] font-bold" style={{ color: "#ff3b30" }}>위험 영역</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>회원 탈퇴</span>
                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</span>
                        </div>
                        <button
                            className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:bg-red-50 active:scale-95"
                            style={{
                                border: "1.5px solid rgba(255,59,48,0.4)",
                                color: "#ff3b30",
                                background: "transparent",
                            }}
                        >
                            탈퇴하기
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

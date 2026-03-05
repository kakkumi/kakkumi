'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ThemeVaultTabs from "./ThemeVaultTabs";
import CreditPage from "./CreditPage";
import { formatKST } from "@/lib/date";
import { validateNickname } from "@/lib/nickname";

type SidebarMenu = {
    category: string;
    items: { label: string; href?: string }[];
};

type Tab = "mine" | "purchased" | "all";

const THEME_TAB_MAP: Record<string, Tab> = {
    "내 테마": "mine",
    "구매 테마": "purchased",
    "전체 테마": "all",
};

type Props = {
    session: {
        name?: string | null;
        nickname?: string | null;
        image?: string | null;
        avatarUrl?: string | null;
        id?: string | null;
        dbId?: string | null;
        email?: string | null;
        role?: string | null;
    } | null;
    purchasedCount: number;
    sidebarMenus: SidebarMenu[];
    createdAt?: string | null;
    credit?: number;
};

export default function MyPageClient({ session, purchasedCount, sidebarMenus, createdAt, credit = 0 }: Props) {
    const router = useRouter();
    const [activeMenu, setActiveMenu] = useState<string>("회원정보 수정");
    const [themeTab, setThemeTab] = useState<Tab>("purchased");

    // 닉네임 상태
    const currentNickname = session?.nickname ?? session?.name ?? "";
    const [nickInput, setNickInput] = useState(currentNickname);
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

    // 알림 설정 상태
    type NotifKey = "purchaseComplete" | "newReview" | "reviewReply" | "inquiryReply" | "newTheme" | "promotionEvent" | "serviceBroadcast";
    type NotifSettings = Record<NotifKey, boolean>;
    const NOTIFICATION_GROUPS: { category: string; items: { key: NotifKey; label: string; desc: string }[] }[] = [
        { category: "구매 / 다운로드", items: [{ key: "purchaseComplete", label: "구매 완료 알림", desc: "테마 결제가 완료되면 알려드립니다." }] },
        { category: "리뷰 & 문의", items: [{ key: "newReview", label: "새 리뷰 알림", desc: "내 테마에 리뷰가 등록되면 알려드립니다." }, { key: "reviewReply", label: "리뷰 답글 알림", desc: "내가 작성한 리뷰에 답글이 달리면 알려드립니다." }, { key: "inquiryReply", label: "문의 답변 알림", desc: "1:1 문의에 답변이 등록되면 알려드립니다." }] },
        { category: "테마 스토어", items: [{ key: "newTheme", label: "신규 테마 알림", desc: "팔로우한 크리에이터가 새 테마를 등록하면 알려드립니다." }, { key: "promotionEvent", label: "할인 / 이벤트 알림", desc: "관심 테마의 가격 변동이나 이벤트를 알려드립니다." }] },
        { category: "서비스", items: [{ key: "serviceBroadcast", label: "공지 및 서비스 알림", desc: "카꾸미의 공지사항과 업데이트 소식을 알려드립니다." }] },
    ];
    const [notifSettings, setNotifSettings] = useState<NotifSettings>({ purchaseComplete: true, newReview: true, reviewReply: true, inquiryReply: true, newTheme: false, promotionEvent: false, serviceBroadcast: true });
    const [notifSaving, setNotifSaving] = useState(false);
    const [notifSaveSuccess, setNotifSaveSuccess] = useState(false);
    const toggleNotif = (key: NotifKey) => { setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] })); setNotifSaveSuccess(false); };
    const handleNotifSaveAll = async () => {
        setNotifSaving(true);
        await new Promise((r) => setTimeout(r, 600));
        setNotifSaving(false);
        setNotifSaveSuccess(true);
        setTimeout(() => setNotifSaveSuccess(false), 3000);
    };

    // 회원 탈퇴 상태
    const CHECKLIST = [
        "구매한 테마는 탈퇴 후 사용할 수 없으며 환불되지 않습니다.",
        "등록한 테마, 리뷰, 문의 내역이 모두 삭제됩니다.",
        "삭제된 계정과 데이터는 복구할 수 없습니다.",
        "같은 카카오 계정으로 재가입하면 새 계정으로 처음부터 시작합니다.",
        "탈퇴 후 3일이 지나야 동일 카카오 계정으로 재가입할 수 있습니다.",
    ];
    const [withdrawChecked, setWithdrawChecked] = useState<boolean[]>(CHECKLIST.map(() => false));
    const [withdrawConfirmInput, setWithdrawConfirmInput] = useState("");
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawError, setWithdrawError] = useState("");
    const withdrawAllChecked = withdrawChecked.every(Boolean);
    const withdrawConfirmMatch = withdrawConfirmInput === "탈퇴하겠습니다";
    const canWithdraw = withdrawAllChecked && withdrawConfirmMatch && !withdrawLoading;
    const toggleWithdrawCheck = (idx: number) => { setWithdrawChecked((prev) => prev.map((v, i) => (i === idx ? !v : v))); };
    const handleWithdraw = async () => {
        if (!canWithdraw) return;
        setWithdrawLoading(true);
        setWithdrawError("");
        const res = await fetch("/api/auth/withdraw", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: "탈퇴하겠습니다" }) });
        const data = await res.json() as { ok?: boolean; error?: string };
        if (!res.ok) { setWithdrawError(data.error ?? "탈퇴 처리 중 오류가 발생했습니다."); setWithdrawLoading(false); return; }
        router.push("/?withdrawn=1");
    };

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
        reader.onload = (ev) => { setAvatarPreview(ev.target?.result as string); };
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

    const displayNickname = session?.nickname ?? session?.name ?? "사용자";
    const isThemeMenu = activeMenu !== null && THEME_TAB_MAP[activeMenu] !== undefined;
    const isCreditMenu = activeMenu === "적립금";
    const isSettingsMenu = activeMenu === "회원정보 수정";
    const isNotifMenu = activeMenu === "알림 설정";
    const isWithdrawMenu = activeMenu === "회원 탈퇴";

    const handleMenuClick = (label: string) => {
        if (THEME_TAB_MAP[label] !== undefined) {
            setThemeTab(THEME_TAB_MAP[label]);
        }
        setActiveMenu(label);
    };

    return (
        <div className="flex flex-1 max-w-[1200px] mx-auto w-full px-6 pt-12 pb-20 gap-8">
            {/* ── 사이드바 ── */}
            <aside className="w-[220px] shrink-0 flex flex-col gap-1">
                {sidebarMenus.map((group, index) => (
                    <div key={group.category} className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold tracking-[0.15em] uppercase px-3 mb-1" style={{ color: "#8e8e93" }}>
                            {group.category}
                        </span>
                        {group.items.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleMenuClick(item.label)}
                                className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                                style={{
                                    color: item.label === "회원 탈퇴"
                                        ? (activeMenu === item.label ? "#c0392b" : "#ff3b30")
                                        : (activeMenu === item.label ? "#FF9500" : "#3a3a3c"),
                                    background: "transparent",
                                    fontWeight: activeMenu === item.label ? 700 : 500,
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                        {index < sidebarMenus.length - 1 && (
                            <div className="my-3 h-[1px]" style={{ background: "rgba(0,0,0,0.18)" }} />
                        )}
                    </div>
                ))}
            </aside>

            {/* ── 메인 콘텐츠 ── */}
            <main className="flex-1 flex flex-col gap-6">
                {session ? (
                    <>
                        {/* 프로필 헤더 - 테마/쇼핑/수익 메뉴에서만 표시 */}
                        {!isSettingsMenu && !isNotifMenu && !isWithdrawMenu && (
                            <div className="flex items-center gap-5 p-7 rounded-[24px]" style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "#ffe500", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                                    {session.image ? (
                                        <Image src={session.image} alt={session.name ?? "프로필"} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                                    ) : (
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3A1D1D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <h2 className="text-[20px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>{displayNickname}</h2>
                                    <p className="text-[12px]" style={{ color: "#8e8e93" }}>가입일 · {createdAt ? formatKST(createdAt, false) : "-"}</p>
                                </div>
                            </div>
                        )}

                        {/* 수치 카드 - 테마/쇼핑/수익 메뉴에서만 표시 */}
                        {!isSettingsMenu && !isNotifMenu && !isWithdrawMenu && (
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: "제작한 테마", value: "0개", color: "rgba(255,239,154,0.7)" },
                                    { label: "구매한 테마", value: `${purchasedCount}개`, color: "rgba(170,189,232,0.6)" },
                                    { label: "적립금", value: `${credit.toLocaleString()}원`, color: "rgba(212,245,212,0.8)" },
                                    { label: "쿠폰", value: "0장", color: "rgba(253,216,229,0.7)" },
                                ].map((card) => (
                                    <div key={card.label} className="flex flex-col gap-2 p-5 rounded-[20px] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ background: card.color, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                                        <span className="text-[11px] font-semibold" style={{ color: "rgba(0,0,0,0.45)" }}>{card.label}</span>
                                        <span className="text-[22px] font-extrabold" style={{ color: "#1c1c1e" }}>{card.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isThemeMenu ? (
                            <ThemeVaultTabs initialTab={themeTab} />
                        ) : isCreditMenu ? (
                            <CreditPage />
                        ) : isSettingsMenu ? (
                            /* ── 회원정보 수정 ── */
                            <>
                                <div>
                                    <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>회원정보 수정</h1>
                                    <p className="text-[13px] mt-1" style={{ color: "#8e8e93" }}>계정 정보를 관리하세요.</p>
                                </div>

                                {/* 프로필 섹션 */}
                                <div className="p-7 rounded-[24px] flex flex-col gap-7" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                                    {/* 프로필 이미지 */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>
                                            프로필 이미지 <span className="text-[11px] font-normal" style={{ color: "#8e8e93" }}>(선택)</span>
                                        </label>
                                        <div className="flex items-center gap-5">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="relative group w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0 transition-all hover:opacity-90 active:scale-95"
                                                style={{ background: "#ffe500", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}
                                            >
                                                {avatarPreview ? (
                                                    <Image src={avatarPreview} alt={displayNickname} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                                                ) : session?.image ? (
                                                    <Image src={session.image} alt={displayNickname} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                                                ) : (
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3A1D1D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="8" r="4" />
                                                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                                    </svg>
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.35)" }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="17 8 12 3 7 8" />
                                                        <line x1="12" y1="3" x2="12" y2="15" />
                                                    </svg>
                                                </div>
                                            </button>
                                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all hover:brightness-105 active:scale-95" style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}>
                                                        사진 선택
                                                    </button>
                                                    {avatarPreview && avatarPreview !== (session?.avatarUrl ?? null) && (
                                                        <button type="button" onClick={() => handleAvatarSave(avatarPreview)} disabled={avatarSaving} className="px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all hover:brightness-105 active:scale-95 disabled:opacity-40" style={{ background: "#FF9500", color: "#fff" }}>
                                                            {avatarSaving ? "저장 중..." : "저장"}
                                                        </button>
                                                    )}
                                                    {(avatarPreview ?? session?.avatarUrl) && (
                                                        <button type="button" onClick={() => { setAvatarPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; handleAvatarSave(null); }} disabled={avatarSaving} className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-70 disabled:opacity-40" style={{ color: "#ff3b30", border: "1px solid rgba(255,59,48,0.3)" }}>
                                                            사진 제거
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    {avatarSuccess && <p className="text-[11px]" style={{ color: "#34c759" }}>✓ 프로필 사진이 저장되었습니다.</p>}
                                                    {avatarError && <p className="text-[11px]" style={{ color: "#ff3b30" }}>{avatarError}</p>}
                                                    <p className="text-[11px]" style={{ color: "#8e8e93" }}>JPG, PNG, GIF · 최대 2MB</p>
                                                    {!session?.avatarUrl && <p className="text-[11px]" style={{ color: "#8e8e93" }}>현재 카카오 프로필 이미지를 사용 중입니다.</p>}
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
                                                        style={{ border: `1.5px solid ${nickCheckStatus === "available" ? "#34c759" : nickCheckStatus === "taken" || nickError ? "#ff3b30" : "rgba(0,0,0,0.12)"}`, color: "#1c1c1e", width: 260, background: "rgba(255,255,255,0.8)" }}
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        {nickCheckStatus === "checking" && <div className="w-3.5 h-3.5 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />}
                                                        {nickCheckStatus === "available" && (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                                        )}
                                                        {nickCheckStatus === "taken" && (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <button onClick={handleNickSave} disabled={nickSaving || nickCheckStatus !== "available" || nickInput.trim() === currentNickname} className="px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 active:scale-95 disabled:opacity-40" style={{ background: "#FF9500", color: "#fff" }}>
                                                    {nickSaving ? "저장 중..." : "저장"}
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[11px]" style={{ color: nickSuccess ? "#34c759" : nickCheckStatus === "available" && !nickError ? "#34c759" : nickError ? "#ff3b30" : "#8e8e93", minHeight: 16 }}>
                                                    {nickSuccess ? "✓ 닉네임이 저장되었습니다." : nickCheckStatus === "available" && !nickError ? "✓ 사용 가능한 닉네임입니다." : nickError ? nickError : "한글, 영문, 숫자 2~10자 (특수문자 불가, 숫자만 불가)"}
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
                                            <div className="text-[14px] px-4 py-2.5 rounded-xl flex-1 max-w-[320px]" style={{ border: "1.5px solid rgba(0,0,0,0.08)", color: session.email ? "#1c1c1e" : "#8e8e93", background: "rgba(0,0,0,0.03)" }}>
                                                {session.email ?? "이메일 정보 없음"}
                                            </div>
                                            {session.email && (
                                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(52,199,89,0.12)", color: "#34c759" }}>인증됨</span>
                                            )}
                                        </div>
                                        <p className="text-[11px]" style={{ color: "#8e8e93" }}>이메일은 카카오 계정과 연동되어 있습니다. 변경을 원하시면 카카오 계정에서 수정해주세요.</p>
                                    </div>
                                </div>

                                {/* 계정 정보 섹션 */}
                                <div className="p-7 rounded-[24px] flex flex-col gap-5" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                                    <h3 className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>계정 정보</h3>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>연결된 소셜 계정</span>
                                                <span className="text-[11px]" style={{ color: "#8e8e93" }}>카카오 계정으로 로그인 중</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,231,58,0.2)", border: "1px solid rgba(255,231,58,0.5)" }}>
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
                                            <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: session.role === "ADMIN" ? "rgba(255,59,48,0.12)" : session.role === "CREATOR" ? "rgba(255,149,0,0.12)" : "rgba(0,122,255,0.12)", color: session.role === "ADMIN" ? "#ff3b30" : session.role === "CREATOR" ? "#FF9500" : "#007aff" }}>
                                                {session.role === "ADMIN" ? "관리자" : session.role === "CREATOR" ? "크리에이터" : "일반 회원"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>카카오 이름</span>
                                                <span className="text-[11px]" style={{ color: "#8e8e93" }}>카카오 계정에 등록된 이름</span>
                                            </div>
                                            <span className="text-[13px] font-medium" style={{ color: "#3a3a3c" }}>{session.name ?? "-"}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : isNotifMenu ? (
                            /* ── 알림 설정 ── */
                            <>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>알림 설정</h1>
                                        <p className="text-[13px] mt-1" style={{ color: "#8e8e93" }}>받고 싶은 알림을 직접 선택하세요.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {notifSaveSuccess && <span className="text-[12px] font-medium" style={{ color: "#34c759" }}>✓ 저장되었습니다.</span>}
                                        <button onClick={handleNotifSaveAll} disabled={notifSaving} className="px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 active:scale-95 disabled:opacity-40" style={{ background: "#FF9500", color: "#fff" }}>
                                            {notifSaving ? "저장 중..." : "변경사항 저장"}
                                        </button>
                                    </div>
                                </div>
                                {NOTIFICATION_GROUPS.map((group) => (
                                    <div key={group.category} className="p-7 rounded-[24px] flex flex-col gap-5" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                                        <h3 className="text-[13px] font-bold tracking-[0.08em] uppercase" style={{ color: "#8e8e93" }}>{group.category}</h3>
                                        <div className="flex flex-col gap-1">
                                            {group.items.map((item, idx) => (
                                                <div key={item.key}>
                                                    <div className="flex items-center justify-between py-3">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[14px] font-medium" style={{ color: "#1c1c1e" }}>{item.label}</span>
                                                            <span className="text-[12px]" style={{ color: "#8e8e93" }}>{item.desc}</span>
                                                        </div>
                                                        <button type="button" onClick={() => toggleNotif(item.key)} className="relative shrink-0 transition-all active:scale-95" style={{ width: 44, height: 24 }} aria-label={notifSettings[item.key] ? "끄기" : "켜기"}>
                                                            <div className="absolute inset-0 rounded-full transition-colors duration-200" style={{ background: notifSettings[item.key] ? "#FF9500" : "rgba(0,0,0,0.12)" }} />
                                                            <div className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all duration-200" style={{ left: notifSettings[item.key] ? 23 : 3, boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }} />
                                                        </button>
                                                    </div>
                                                    {idx < group.items.length - 1 && <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.06)" }} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="px-5 py-4 rounded-[16px] flex items-start gap-3" style={{ background: "rgba(74,123,247,0.07)", border: "1px solid rgba(74,123,247,0.12)" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <p className="text-[12px] leading-relaxed" style={{ color: "#3a5a8a" }}>알림은 서비스 내 알림으로 제공됩니다. 이메일·푸시 알림은 추후 지원 예정입니다. 법적 필수 공지(이용약관 변경 등)는 설정과 관계없이 발송될 수 있습니다.</p>
                                </div>
                            </>
                        ) : isWithdrawMenu ? (
                            /* ── 회원 탈퇴 ── */
                            <>
                                <div>
                                    <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>회원 탈퇴</h1>
                                    <p className="text-[13px] mt-1" style={{ color: "#8e8e93" }}>탈퇴 전 아래 내용을 꼭 확인해주세요.</p>
                                </div>
                                {/* 프로필 확인 */}
                                <div className="flex items-center gap-4 p-5 rounded-[20px]" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: "#ffe500" }}>
                                        {session.image ? (
                                            <Image src={session.image} alt={displayNickname} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                                        ) : (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3A1D1D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>{displayNickname}</p>
                                        <p className="text-[12px]" style={{ color: "#8e8e93" }}>{session.email ?? "이메일 없음"}</p>
                                    </div>
                                    <span className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,59,48,0.10)", color: "#ff3b30" }}>탈퇴 예정</span>
                                </div>
                                {/* 주의사항 체크리스트 */}
                                <div className="p-6 rounded-[24px] flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                                    <div className="flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                        <h3 className="text-[14px] font-bold" style={{ color: "#ff3b30" }}>탈퇴 전 반드시 확인하세요</h3>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {CHECKLIST.map((text, idx) => (
                                            <button key={idx} type="button" onClick={() => toggleWithdrawCheck(idx)} className="flex items-start gap-3 text-left transition-all hover:opacity-80">
                                                <div className="shrink-0 w-5 h-5 rounded-md mt-0.5 flex items-center justify-center transition-all" style={{ background: withdrawChecked[idx] ? "#ff3b30" : "transparent", border: `1.5px solid ${withdrawChecked[idx] ? "#ff3b30" : "rgba(0,0,0,0.18)"}` }}>
                                                    {withdrawChecked[idx] && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                                                </div>
                                                <span className="text-[13px] leading-relaxed" style={{ color: "#3a3a3c" }}>{text}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {!withdrawAllChecked && <p className="text-[11px]" style={{ color: "#8e8e93" }}>위 항목을 모두 체크해야 탈퇴를 진행할 수 있습니다.</p>}
                                </div>
                                {/* 확인 문구 입력 */}
                                <div className="p-6 rounded-[24px] flex flex-col gap-4" style={{ background: withdrawAllChecked ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)", backdropFilter: "blur(20px)", border: `1px solid ${withdrawAllChecked ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)"}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", opacity: withdrawAllChecked ? 1 : 0.5, pointerEvents: withdrawAllChecked ? "auto" : "none" }}>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>탈퇴 확인</label>
                                        <p className="text-[12px]" style={{ color: "#8e8e93" }}>아래 입력창에 <span className="font-bold" style={{ color: "#ff3b30" }}>탈퇴하겠습니다</span> 를 입력하세요.</p>
                                    </div>
                                    <input type="text" value={withdrawConfirmInput} onChange={(e) => setWithdrawConfirmInput(e.target.value)} placeholder="탈퇴하겠습니다" className="w-full px-4 py-3 rounded-xl text-[14px] outline-none" style={{ border: `1.5px solid ${withdrawConfirmMatch ? "#ff3b30" : "rgba(0,0,0,0.12)"}`, background: "rgba(255,255,255,0.9)", color: "#1c1c1e" }} />
                                </div>
                                {withdrawError && <p className="text-[13px] font-medium" style={{ color: "#ff3b30" }}>{withdrawError}</p>}
                                <div className="flex gap-3">
                                    <button onClick={() => setActiveMenu("회원정보 수정")} className="flex-1 py-3.5 rounded-xl text-[14px] font-semibold transition-all hover:opacity-80 active:scale-95" style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}>취소</button>
                                    <button onClick={handleWithdraw} disabled={!canWithdraw} className="flex-1 py-3.5 rounded-xl text-[14px] font-bold transition-all active:scale-95 disabled:opacity-30" style={{ background: canWithdraw ? "#ff3b30" : "rgba(255,59,48,0.3)", color: "#fff", boxShadow: canWithdraw ? "0 4px 16px rgba(255,59,48,0.3)" : "none" }}>
                                        {withdrawLoading ? "탈퇴 처리 중..." : "탈퇴하기"}
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-6 p-12 rounded-[32px]" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#f5f5f5" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-2 text-center">
                            <h2 className="text-[22px] font-bold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>로그인이 필요해요</h2>
                            <p className="text-[14px]" style={{ color: "#8e8e93" }}>마이페이지를 이용하려면 카카오 로그인을 해주세요.</p>
                        </div>
                        <a href="/api/auth/kakao">
                            <button className="px-8 py-3.5 rounded-xl text-[15px] font-bold transition-all active:scale-95 hover:brightness-105" style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.3)" }}>
                                카카오 로그인
                            </button>
                        </a>
                    </div>
                )}
            </main>
        </div>
    );
}

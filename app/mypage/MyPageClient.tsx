'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ThemeVaultTabs from "./ThemeVaultTabs";
import CreditPage from "./CreditPage";
import RefundPage from "./RefundPage";
import OrderPage from "./OrderPage";
import LikePage from "./LikePage";
import SalesStatsPage from "./SalesStatsPage";
import SettlementPage from "./SettlementPage";
import BankAccountPage from "./BankAccountPage";
import MyReviewsPage from "./MyReviewsPage";
import ReviewablePage from "./ReviewablePage";
import SubscriptionInfoPage from "./SubscriptionInfoPage";
import SubscriptionPaymentsPage from "./SubscriptionPaymentsPage";
import { formatKST } from "@/lib/date";
import { validateNickname } from "@/lib/nickname";
import { WITHDRAW_CONFIRM_TEXT, AVATAR_MAX_SIZE_MB } from "@/lib/constants";

type SidebarMenu = {
    category: string;
    items: { label: string; href?: string }[];
};

type Tab = "mine" | "purchased";

const THEME_TAB_MAP: Record<string, Tab> = {
    "업로드 테마": "mine",
    "구매 테마": "purchased",
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
    isPro?: boolean;
};

export default function MyPageClient({ session, purchasedCount: _purchasedCount, sidebarMenus, createdAt, credit: _credit = 0, isPro: isProProp = false }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const menuFromUrl = searchParams.get("menu") ?? "";
    const [activeMenu, setActiveMenu] = useState<string>(menuFromUrl || "회원 정보");
    const [themeTab, setThemeTab] = useState<Tab>(() => THEME_TAB_MAP[menuFromUrl] ?? "purchased");

    // URL menu 파라미터가 바뀌면 activeMenu, themeTab 동기화
    useEffect(() => {
        if (!menuFromUrl) return;
        setActiveMenu(menuFromUrl);
        const tab = THEME_TAB_MAP[menuFromUrl];
        if (tab) setThemeTab(tab);
    }, [menuFromUrl]);

    // 구독 상태 클라이언트에서 재확인 (서버 캐시 우회)
    const [isPro, setIsPro] = useState<boolean>(isProProp);
    useEffect(() => {
        if (session?.role === "ADMIN") { setIsPro(true); return; }
        fetch("/api/subscription")
            .then(r => r.json())
            .then((d: { subscription?: { status: string } | null }) => {
                const status = d?.subscription?.status;
                const active = !!status && status.toUpperCase() === "ACTIVE";
                // 서버 prop이 true인 경우 클라이언트 일시적 오류로 false로 강등되지 않도록 함
                setIsPro(prev => prev || active);
            })
            .catch(() => { /* 기본값(서버 prop) 유지 */ });
    }, [session?.role]);

    // 닉네임 상태
    const currentNickname = session?.nickname ?? session?.name ?? "";
    const [nickInput, setNickInput] = useState(currentNickname);
    const [nickError, setNickError] = useState("");
    const [nickCheckStatus, setNickCheckStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
    const [nickSaving, setNickSaving] = useState(false);
    const [nickSuccess, setNickSuccess] = useState(false);

    // 프로필 이미지 상태
    const [avatarPreview, setAvatarPreview] = useState<string | null>(session?.avatarUrl ?? null);
    const [avatarError, setAvatarError] = useState("");
    const [avatarSaving, setAvatarSaving] = useState(false);
    const [avatarSuccess, setAvatarSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 알림 설정 상태
    type NotifKey = "purchaseComplete" | "newReview" | "inquiryReply" | "newTheme" | "promotionEvent" | "serviceBroadcast" | "followAlert" | "creditExpiry" | "priceDropAlert";
    type NotifSettings = Record<NotifKey, boolean>;
    const isCreatorOrAdmin = session?.role === "CREATOR" || session?.role === "ADMIN";
    const NOTIFICATION_GROUPS: { category: string; items: { key: NotifKey; label: string; desc: string }[] }[] = [
        { category: "구매 / 다운로드", items: [{ key: "purchaseComplete", label: "구매 완료 알림", desc: "테마 결제가 완료되면 알려드립니다." }] },
        { category: "리뷰 & 문의", items: [
            { key: "newReview", label: "새 리뷰 알림", desc: "내 테마에 리뷰가 등록되면 알려드립니다." },
            { key: "inquiryReply", label: "문의 답변 알림", desc: "1:1 문의에 답변이 등록되면 알려드립니다." },
        ]},
        { category: "테마 스토어", items: [
            { key: "newTheme", label: "신규 테마 알림", desc: "팔로우한 크리에이터가 새 테마를 등록하면 알려드립니다." },
            { key: "promotionEvent", label: "할인 / 이벤트 알림", desc: "관심 테마의 가격 변동이나 이벤트를 알려드립니다." },
            { key: "priceDropAlert", label: "찜한 테마 가격 인하 알림", desc: "좋아요한 테마의 가격이 내려가면 알려드립니다." },
        ]},
        { category: "적립금", items: [
            { key: "creditExpiry", label: "적립금 만료 알림", desc: "적립금 만료 7일·1일 전에 미리 알려드립니다." },
        ]},
        ...(isCreatorOrAdmin ? [{ category: "크리에이터", items: [
            { key: "followAlert" as NotifKey, label: "팔로우 알림", desc: "누군가 나를 팔로우하면 알려드립니다." },
        ]}] : []),
        { category: "서비스", items: [{ key: "serviceBroadcast", label: "공지 및 서비스 알림", desc: "카꾸미의 공지사항과 업데이트 소식을 알려드립니다." }] },
    ];
    const [notifSettings, setNotifSettings] = useState<NotifSettings>({ purchaseComplete: true, newReview: true, inquiryReply: true, newTheme: false, promotionEvent: false, serviceBroadcast: true, followAlert: true, creditExpiry: true, priceDropAlert: false });
    const [notifSaving, setNotifSaving] = useState(false);
    const [notifSaveSuccess, setNotifSaveSuccess] = useState(false);
    const [notifLoaded, setNotifLoaded] = useState(false);

    // 알림 설정 메뉴 진입 시 서버에서 불러오기
    useEffect(() => {
        if (activeMenu !== "알림 설정" || notifLoaded) return;
        const load = async () => {
            try {
                const res = await fetch("/api/user/notif-settings");
                const data = await res.json() as { settings: NotifSettings };
                if (data.settings) setNotifSettings(data.settings);
            } catch { /* 기본값 유지 */ } finally {
                setNotifLoaded(true);
            }
        };
        void load();
    }, [activeMenu, notifLoaded]);

    const toggleNotif = (key: NotifKey) => { setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] })); setNotifSaveSuccess(false); };
    const handleNotifSaveAll = async () => {
        setNotifSaving(true);
        try {
            const res = await fetch("/api/user/notif-settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(notifSettings),
            });
            if (res.ok) {
                setNotifSaveSuccess(true);
                setTimeout(() => setNotifSaveSuccess(false), 3000);
            }
        } catch { /* ignore */ } finally {
            setNotifSaving(false);
        }
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
    const withdrawConfirmMatch = withdrawConfirmInput === WITHDRAW_CONFIRM_TEXT;
    const canWithdraw = withdrawAllChecked && withdrawConfirmMatch && !withdrawLoading;
    const toggleWithdrawCheck = (idx: number) => { setWithdrawChecked((prev) => prev.map((v, i) => (i === idx ? !v : v))); };
    const handleWithdraw = async () => {
        if (!canWithdraw) return;
        setWithdrawLoading(true);
        setWithdrawError("");
        const res = await fetch("/api/auth/withdraw", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: WITHDRAW_CONFIRM_TEXT }) });
        const data = await res.json() as { ok?: boolean; error?: string };
        if (!res.ok) { setWithdrawError(data.error ?? "탈퇴 처리 중 오류가 발생했습니다."); setWithdrawLoading(false); return; }
        router.push("/?withdrawn=1");
    };

    const handleNickCheck = async () => {
        const trimmed = nickInput.trim();
        if (!trimmed || trimmed === currentNickname) {
            setNickError("현재 닉네임과 동일합니다.");
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
    };

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
        if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
            setAvatarError(`이미지 크기는 ${AVATAR_MAX_SIZE_MB}MB 이하여야 합니다.`);
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
        try {
            const res = await fetch("/api/user/avatar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatarUrl: url }),
            });
            let data: { avatarUrl?: string | null; error?: string } = {};
            try { data = await res.json() as typeof data; } catch { /* non-JSON response */ }
            if (!res.ok) {
                setAvatarError(data.error ?? "저장 실패");
            } else {
                setAvatarPreview(url);
                setAvatarSuccess(true);
                setTimeout(() => setAvatarSuccess(false), 3000);
                router.refresh();
            }
        } catch {
            setAvatarError("네트워크 오류가 발생했습니다.");
        } finally {
            setAvatarSaving(false);
        }
    };

    const displayNickname = session?.nickname ?? session?.name ?? "사용자";
    const isThemeMenu = activeMenu !== null && THEME_TAB_MAP[activeMenu] !== undefined;
    const isCreditMenu = activeMenu === "적립금";
    const isRefundMenu = activeMenu === "취소/환불 내역";
    const isOrderMenu = activeMenu === "주문 내역";
    const isLikeMenu = activeMenu === "좋아요";
    const isSalesStatsMenu = activeMenu === "판매 통계";
    const isSettlementMenu = activeMenu === "정산 내역";
    const isBankMenu = activeMenu === "정산 계좌";
    const isSettingsMenu = activeMenu === "회원 정보";
    const isNotifMenu = activeMenu === "알림 설정";
    const isWithdrawMenu = activeMenu === "회원 탈퇴";
    const isFollowMenu = activeMenu === "팔로우";
    const isReviewMenu = activeMenu === "리뷰";
    const isReviewableMenu = activeMenu === "작성 가능한 후기";
    const isSubInfoMenu = activeMenu === "결제 정보";
    const isSubPaymentsMenu = activeMenu === "결제 내역";

    type FollowingUser = { id: string; nickname: string | null; name: string; avatarUrl: string | null; role: string; themeCount: number };
    const [followingList, setFollowingList] = useState<FollowingUser[]>([]);
    const [followingLoading, setFollowingLoading] = useState(false);
    const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isFollowMenu) return;
        const load = async () => {
            setFollowingLoading(true);
            try {
                const r = await fetch("/api/mypage/following");
                const d = await r.json() as { following: FollowingUser[]; error?: string };
                if (d.error) console.error("[following]", d.error);
                setFollowingList(d.following ?? []);
            } catch {
                //
            } finally {
                setFollowingLoading(false);
            }
        };
        void load();
    }, [isFollowMenu]);

    const handleUnfollow = async (targetId: string) => {
        setUnfollowingId(targetId);
        await fetch("/api/follow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ creatorId: targetId }),
        });
        setFollowingList(prev => prev.filter(u => u.id !== targetId));
        setUnfollowingId(null);
    };

    const handleMenuClick = (label: string) => {
        if (THEME_TAB_MAP[label] !== undefined) {
            setThemeTab(THEME_TAB_MAP[label]);
        }
        setActiveMenu(label);
    };

    return (
        <div className="flex w-full" style={{ maxWidth: 1400, margin: "0 auto" }}>

            {/* ── 사이드바 ── */}
            <aside className="fixed w-[160px] flex flex-col gap-1 px-5 pt-12" style={{ zIndex: 10 }}>
                {sidebarMenus.map((group, index) => (
                    <div key={group.category} className="flex flex-col gap-0.5">
                        <span className="text-[10.5px] font-bold tracking-[0.15em] uppercase px-2 mb-1" style={{ color: "#8e8e93" }}>
                            {group.category}
                        </span>
                        {group.items.map((item) => {
                            const isActive = activeMenu === item.label;
                            const isWithdrawItem = item.label === "회원 탈퇴";
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => handleMenuClick(item.label)}
                                    className="text-left px-2 py-[7px] rounded-xl text-[12.5px] font-medium transition-all"
                                    style={{
                                        color: isWithdrawItem
                                            ? (isActive ? "#c0392b" : "#ff3b30")
                                            : isActive ? "#FF9500" : "#3a3a3c",
                                        fontWeight: isActive ? 700 : 500,
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                        {index < sidebarMenus.length - 1 && (
                            <div className="my-2.5 h-[1px]" style={{ background: "rgba(0,0,0,0.18)" }} />
                        )}
                    </div>
                ))}
            </aside>

            {/* ── 메인 콘텐츠 ── */}
            <main className="flex-1 flex flex-col min-w-0 px-8 pt-12 pb-24" style={{ marginLeft: 200 }}>
                {session ? (
                    <>
                        {isThemeMenu ? (
                            <ThemeVaultTabs key={activeMenu} initialTab={themeTab} />
                        ) : isCreditMenu ? (
                            <CreditPage />
                        ) : isOrderMenu ? (
                            <OrderPage />
                        ) : isRefundMenu ? (
                            <RefundPage />
                        ) : isLikeMenu ? (
                            <LikePage />
                        ) : isSalesStatsMenu ? (
                            <SalesStatsPage />
                        ) : isSettlementMenu ? (
                            <SettlementPage role={session?.role} />
                        ) : isBankMenu ? (
                            <BankAccountPage role={session?.role} />
                        ) : isReviewMenu ? (
                            <MyReviewsPage />
                        ) : isReviewableMenu ? (
                            <ReviewablePage />
                        ) : isSubInfoMenu ? (
                            <SubscriptionInfoPage />
                        ) : isSubPaymentsMenu ? (
                            <SubscriptionPaymentsPage />
                        ) : isFollowMenu ? (
                            <>
                                {/* 섹션 헤더 */}
                                <div className="flex items-end justify-between mb-8">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Following</p>
                                        <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>팔로우</h2>
                                    </div>
                                </div>
                                <p className="text-[13px] mb-8" style={{ color: "#78716c" }}>내가 팔로우한 크리에이터 목록입니다.</p>
                                <div className="flex flex-col">
                                    {followingLoading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <span className="text-[14px]" style={{ color: "#a8a29e" }}>불러오는 중...</span>
                                        </div>
                                    ) : followingList.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            </svg>
                                            <p className="text-[14px]" style={{ color: "#a8a29e" }}>아직 팔로우한 크리에이터가 없어요.</p>
                                        </div>
                                    ) : (
                                        followingList.map((user, idx) => (
                                            <div key={user.id}>
                                                <div className="flex items-center gap-4 py-4">
                                                    {/* 프로필 이미지 */}
                                                    <button onClick={() => router.push(`/creator/${user.id}`)} className="shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center transition-all hover:opacity-75" style={{ background: "#e7e5e4" }}>
                                                        <Image
                                                            src={
                                                                user.role === "CREATOR" || user.role === "ADMIN"
                                                                    ? "/creator.png"
                                                                    : (user.avatarUrl ?? "/user.png")
                                                            }
                                                            alt={user.nickname ?? user.name}
                                                            width={40} height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                    {/* 이름 + 테마 수 */}
                                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                                        <button onClick={() => router.push(`/creator/${user.id}`)} className="text-left text-[14px] font-semibold hover:opacity-60 transition-opacity truncate" style={{ color: "#1c1917" }}>
                                                            {user.nickname ?? user.name}
                                                        </button>
                                                        <span className="text-[12px]" style={{ color: "#a8a29e" }}>테마 {user.themeCount}개</span>
                                                    </div>
                                                    {/* 언팔로우 버튼 */}
                                                    <button
                                                        onClick={() => handleUnfollow(user.id)}
                                                        disabled={unfollowingId === user.id}
                                                        className="text-[12px] font-medium transition-opacity hover:opacity-50 disabled:opacity-30 shrink-0"
                                                        style={{ color: "#78716c" }}
                                                    >
                                                        {unfollowingId === user.id ? "처리 중..." : "팔로우 취소"}
                                                    </button>
                                                </div>
                                                {idx < followingList.length - 1 && (
                                                    <div className="h-px" style={{ background: "#f5f5f4" }} />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : isSettingsMenu ? (
                            /* ── 회원 정보 ── */
                            <>
                                <div className="flex items-end justify-between mb-8">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Account</p>
                                        <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>회원 정보</h2>
                                    </div>
                                </div>

                                {/* 프로필 이미지 */}
                                <div className="flex flex-col gap-4 pb-8">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>프로필 이미지</span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                                    </div>
                                    {isPro ? (
                                        /* PRO / ADMIN: 자유롭게 변경 가능 */
                                        (() => {
                                            // 역할에 따른 기본 이미지
                                            const defaultImg = isCreatorOrAdmin ? "/creator.png" : "/user.png";
                                            // 커스텀 사진: 사용자가 업로드한 data URL 또는 기본 경로가 아닌 외부 URL
                                            const isCustomPhoto = !!avatarPreview && !avatarPreview.startsWith("/");
                                            const displaySrc = avatarPreview ?? defaultImg;
                                            return (
                                                <div className="flex items-center gap-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="relative group shrink-0 rounded-full overflow-hidden flex items-center justify-center transition-opacity hover:opacity-80"
                                                        style={{ width: 72, height: 72, background: "#e7e5e4" }}
                                                    >
                                                        <Image
                                                            src={displaySrc}
                                                            alt={displayNickname}
                                                            width={72} height={72}
                                                            className="w-full h-full object-cover"
                                                            unoptimized={isCustomPhoto}
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full" style={{ background: "rgba(0,0,0,0.3)" }}>
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                <polyline points="17 8 12 3 7 8" />
                                                                <line x1="12" y1="3" x2="12" y2="15" />
                                                            </svg>
                                                        </div>
                                                    </button>
                                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[12px] font-medium transition-opacity hover:opacity-60" style={{ color: "#78716c" }}>
                                                                사진 선택
                                                            </button>
                                                            {avatarPreview && avatarPreview !== (session?.avatarUrl ?? defaultImg) && (
                                                                <>
                                                                    <span style={{ color: "#e7e5e4" }}>·</span>
                                                                    <button type="button" onClick={() => handleAvatarSave(avatarPreview)} disabled={avatarSaving} className="text-[12px] font-semibold transition-opacity hover:opacity-60 disabled:opacity-30" style={{ color: "#FF9500" }}>
                                                                        {avatarSaving ? "저장 중..." : "저장"}
                                                                    </button>
                                                                </>
                                                            )}
                                                            {isCustomPhoto && (
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
                                            );
                                        })()
                                    ) : session?.role === "CREATOR" ? (
                                        /* 크리에이터: creator.png 고정 */
                                        <div className="flex items-center gap-6">
                                            <div className="relative shrink-0 rounded-full overflow-hidden" style={{ width: 72, height: 72, background: "#e7e5e4" }}>
                                                <Image src="/creator.png" alt="크리에이터 프로필" width={72} height={72} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[13px] font-medium" style={{ color: "#1c1917" }}>크리에이터 기본 이미지</p>
                                                <p className="text-[12px] leading-relaxed" style={{ color: "#a8a29e" }}>크리에이터는 기본 이미지가 적용됩니다.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        /* 일반 유저 (FREE): user.png 고정 */
                                        <div className="flex items-center gap-6">
                                            <div className="relative shrink-0 rounded-full overflow-hidden" style={{ width: 72, height: 72, background: "#e7e5e4" }}>
                                                <Image src="/user.png" alt="기본 프로필" width={72} height={72} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[13px] font-medium" style={{ color: "#1c1917" }}>기본 프로필 이미지</p>
                                                <p className="text-[12px] leading-relaxed" style={{ color: "#a8a29e" }}>
                                                    <a href="/pricing" className="font-semibold" style={{ color: "#FF9500" }}>PRO 구독</a> 시 프로필 사진을 자유롭게 변경할 수 있습니다.
                                                </p>
                                            </div>
                                        </div>
                                    )}
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
                                                    onChange={(e) => { setNickInput(e.target.value); setNickSuccess(false); setNickCheckStatus("idle"); setNickError(""); }}
                                                    onKeyDown={(e) => { if (e.key === "Enter") handleNickCheck(); }}
                                                    maxLength={10}
                                                    placeholder="닉네임을 입력하세요"
                                                    className="text-[14px] px-0 py-2 outline-none pr-7 bg-transparent"
                                                    style={{
                                                        borderBottom: `1.5px solid ${nickCheckStatus === "available" ? "#34c759" : nickCheckStatus === "taken" || nickError ? "#ff3b30" : "#d6d3d1"}`,
                                                        color: "#1c1917",
                                                        width: 220,
                                                    }}
                                                />
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                                    {nickCheckStatus === "checking" && <div className="w-3.5 h-3.5 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />}
                                                    {nickCheckStatus === "available" && (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                                    )}
                                                    {nickCheckStatus === "taken" && (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                    )}
                                                </div>
                                            </div>
                                            <button onClick={handleNickCheck} disabled={nickCheckStatus === "checking" || !nickInput.trim()} className="text-[12px] font-medium transition-opacity hover:opacity-60 disabled:opacity-30" style={{ color: "#4a7bf7" }}>
                                                {nickCheckStatus === "checking" ? "확인 중..." : "중복 확인"}
                                            </button>
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
                                        <span className="text-[14px]" style={{ color: session.email ? "#1c1917" : "#a8a29e" }}>
                                            {session.email ?? "이메일 정보 없음"}
                                        </span>
                                        {session.email && (
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(52,199,89,0.1)", color: "#34c759" }}>인증됨</span>
                                        )}
                                    </div>
                                    <p className="text-[11px]" style={{ color: "#a8a29e" }}>이메일은 카카오 계정과 연동되어 있습니다. 변경을 원하시면 카카오 계정에서 수정해주세요.</p>
                                </div>

                                {/* 계정 등급 */}
                                <div className="flex flex-col gap-4 py-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>계정 등급</span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                                    </div>
                                    <div>
                                        <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: session.role === "ADMIN" ? "rgba(255,59,48,0.1)" : session.role === "CREATOR" ? "rgba(255,149,0,0.1)" : "rgba(74,123,247,0.1)", color: session.role === "ADMIN" ? "#ff3b30" : session.role === "CREATOR" ? "#FF9500" : "#4a7bf7" }}>
                                            {session.role === "ADMIN" ? "관리자" : session.role === "CREATOR" ? "크리에이터" : "일반 회원"}
                                        </span>
                                    </div>
                                    <p className="text-[11px]" style={{ color: "#a8a29e" }}>현재 서비스 이용 등급입니다.</p>
                                </div>

                                {/* 가입일 */}
                                <div className="flex flex-col gap-2 pt-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>가입일</span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                                    </div>
                                    <span className="text-[14px]" style={{ color: "#78716c" }}>{createdAt ? formatKST(createdAt, false) : "-"}</span>
                                </div>
                            </>
                        ) : isNotifMenu ? (
                            /* ── 알림 설정 ── */
                            <>
                                <div className="flex items-end justify-between mb-8">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Notifications</p>
                                        <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>알림 설정</h2>
                                    </div>
                                    <div className="flex items-center gap-4 pb-1">
                                        {notifSaveSuccess && <span className="text-[12px]" style={{ color: "#34c759" }}>✓ 저장되었습니다.</span>}
                                        <button onClick={handleNotifSaveAll} disabled={notifSaving} className="text-[13px] font-semibold transition-opacity hover:opacity-60 disabled:opacity-30" style={{ color: "#FF9500" }}>
                                            {notifSaving ? "저장 중..." : "변경사항 저장"}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[13px] mb-10" style={{ color: "#78716c" }}>받고 싶은 알림을 직접 선택하세요.</p>

                                {NOTIFICATION_GROUPS.map((group, gi) => (
                                    <div key={group.category}>
                                        <div className={`flex items-center gap-3 ${gi > 0 ? "mt-10" : ""} mb-1`}>
                                            <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>
                                                {group.category}
                                            </span>
                                            <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                                        </div>
                                        <div className="flex flex-col">
                                            {group.items.map((item, idx) => (
                                                <div key={item.key}>
                                                    <div className="flex items-center justify-between py-4">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[14px]" style={{ color: "#1c1917", fontWeight: notifSettings[item.key] ? 600 : 400 }}>{item.label}</span>
                                                            <span className="text-[12px]" style={{ color: "#a8a29e" }}>{item.desc}</span>
                                                        </div>
                                                        <button type="button" onClick={() => toggleNotif(item.key)} className="relative shrink-0 transition-all active:scale-95" style={{ width: 44, height: 24 }} aria-label={notifSettings[item.key] ? "끄기" : "켜기"}>
                                                            <div className="absolute inset-0 rounded-full transition-colors duration-200" style={{ background: notifSettings[item.key] ? "#FF9500" : "#e7e5e4" }} />
                                                            <div className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all duration-200" style={{ left: notifSettings[item.key] ? 23 : 3, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                                                        </button>
                                                    </div>
                                                    {idx < group.items.length - 1 && <div className="h-px" style={{ background: "#f5f5f4" }} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-12 flex items-start gap-3 pt-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <p className="text-[12px] leading-relaxed" style={{ color: "#78716c" }}>알림은 서비스 내 알림으로 제공됩니다. 이메일·푸시 알림은 추후 지원 예정입니다. 법적 필수 공지(이용약관 변경 등)는 설정과 관계없이 발송될 수 있습니다.</p>
                                </div>
                            </>
                        ) : isWithdrawMenu ? (
                            /* ── 회원 탈퇴 ── */
                            <>
                                <div className="flex items-end justify-between mb-8">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Account</p>
                                        <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>회원 탈퇴</h2>
                                    </div>
                                </div>
                                <p className="text-[13px] mb-10" style={{ color: "#78716c" }}>탈퇴 전 아래 내용을 꼭 확인해주세요.</p>

                                {/* 프로필 확인 */}
                                <div className="flex items-center gap-4 py-5" style={{ borderBottom: "1px solid #e7e5e4" }}>
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: "#ffe500" }}>
                                        {session.avatarUrl ? (
                                            <Image src={session.avatarUrl} alt={displayNickname} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A1D1D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[14px] font-semibold" style={{ color: "#1c1917" }}>{displayNickname}</p>
                                        <p className="text-[12px]" style={{ color: "#a8a29e" }}>{session.email ?? "이메일 없음"}</p>
                                    </div>
                                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>탈퇴 예정</span>
                                </div>

                                {/* 주의사항 체크리스트 */}
                                <div className="mt-8 mb-2">
                                    <div className="flex items-center gap-3 mb-6">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#ff3b30" }}>탈퇴 전 반드시 확인하세요</span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,59,48,0.15)" }} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {CHECKLIST.map((text, idx) => (
                                            <button key={idx} type="button" onClick={() => toggleWithdrawCheck(idx)} className="flex items-start gap-3 text-left py-3 transition-opacity hover:opacity-70">
                                                <div className="shrink-0 w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-all" style={{ background: withdrawChecked[idx] ? "#ff3b30" : "transparent", border: `1.5px solid ${withdrawChecked[idx] ? "#ff3b30" : "#d6d3d1"}` }}>
                                                    {withdrawChecked[idx] && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                                                </div>
                                                <span className="text-[13px] leading-relaxed" style={{ color: "#78716c" }}>{text}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {!withdrawAllChecked && <p className="mt-3 text-[11px]" style={{ color: "#a8a29e" }}>위 항목을 모두 체크해야 탈퇴를 진행할 수 있습니다.</p>}
                                </div>

                                {/* 확인 문구 입력 */}
                                <div className="mt-8 flex flex-col gap-3" style={{ opacity: withdrawAllChecked ? 1 : 0.4, pointerEvents: withdrawAllChecked ? "auto" : "none" }}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>탈퇴 확인</span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                                    </div>
                                    <p className="text-[12px]" style={{ color: "#78716c" }}>아래 입력창에 <span className="font-bold" style={{ color: "#ff3b30" }}>{WITHDRAW_CONFIRM_TEXT}</span> 를 입력하세요.</p>
                                    <input type="text" value={withdrawConfirmInput} onChange={(e) => setWithdrawConfirmInput(e.target.value)} placeholder={WITHDRAW_CONFIRM_TEXT} className="px-0 py-2.5 text-[14px] outline-none bg-transparent w-full max-w-[280px]" style={{ borderBottom: `1.5px solid ${withdrawConfirmMatch ? "#ff3b30" : "#d6d3d1"}`, color: "#1c1917" }} />
                                </div>

                                {withdrawError && <p className="mt-4 text-[13px]" style={{ color: "#ff3b30" }}>{withdrawError}</p>}

                                <div className="flex gap-3 mt-10">
                                    <button onClick={() => setActiveMenu("회원 정보")} className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-opacity hover:opacity-60" style={{ border: "1px solid #e7e5e4", color: "#78716c", background: "transparent" }}>취소</button>
                                    <button onClick={handleWithdraw} disabled={!canWithdraw} className="flex-1 py-3 rounded-xl text-[14px] font-semibold transition-opacity disabled:opacity-30" style={{ background: canWithdraw ? "#ff3b30" : "#ff3b30", color: "#fff" }}>
                                        {withdrawLoading ? "탈퇴 처리 중..." : "탈퇴하기"}
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#f5f5f4" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1.5 text-center">
                            <h2 className="text-[20px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>로그인이 필요해요</h2>
                            <p className="text-[13px]" style={{ color: "#a8a29e" }}>마이페이지를 이용하려면 카카오 로그인을 해주세요.</p>
                        </div>
                        <a href="/api/auth/kakao" className="mt-2">
                            <button className="px-7 py-3 rounded-xl text-[14px] font-bold transition-opacity hover:opacity-80 active:scale-95" style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D" }}>
                                카카오 로그인
                            </button>
                        </a>
                    </div>
                )}
            </main>
        </div>
    );
}

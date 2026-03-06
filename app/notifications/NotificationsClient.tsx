"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Notification = {
    id: string;
    type: string;
    title: string;
    body: string;
    linkUrl: string | null;
    isRead: boolean;
    createdAt: string;
};

type Props = {
    initialNotifications: Notification[];
};

const TYPE_META: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
    FOLLOW: {
        label: "팔로우",
        bg: "rgba(74,123,247,0.12)", color: "#4a7bf7",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    NEW_THEME: {
        label: "신규 테마",
        bg: "rgba(255,149,0,0.12)", color: "#FF9500",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>,
    },
    CREDIT_EXPIRY: {
        label: "적립금 만료",
        bg: "rgba(255,59,48,0.12)", color: "#ff3b30",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    },
    PURCHASE_COMPLETE: {
        label: "구매 완료",
        bg: "rgba(52,199,89,0.12)", color: "#34c759",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>,
    },
    REFUND_COMPLETE: {
        label: "환불 완료",
        bg: "rgba(74,123,247,0.12)", color: "#4a7bf7",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    THEME_APPROVED: {
        label: "테마 승인",
        bg: "rgba(255,149,0,0.12)", color: "#FF9500",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>,
    },
    THEME_REJECTED: {
        label: "테마 반려",
        bg: "rgba(255,59,48,0.12)", color: "#ff3b30",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    },
    SYSTEM: {
        label: "시스템",
        bg: "rgba(142,142,147,0.12)", color: "#8e8e93",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    },
    INQUIRY: {
        label: "문의 답변",
        bg: "rgba(74,123,247,0.12)", color: "#4a7bf7",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    },
};

const DEFAULT_META = {
    label: "기타",
    bg: "rgba(142,142,147,0.12)", color: "#8e8e93",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}


export default function NotificationsClient({ initialNotifications }: Props) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [markingAll, setMarkingAll] = useState(false);

    const totalCount = notifications.length;
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // 타입별 카운트
    const typeCounts = notifications.reduce<Record<string, number>>((acc, n) => {
        acc[n.type] = (acc[n.type] ?? 0) + 1;
        return acc;
    }, {});
    const usedTypes = Object.keys(typeCounts);

    const filtered = notifications.filter((n) =>
        typeFilter === "all" || n.type === typeFilter
    );

    const handleClick = async (n: Notification) => {
        if (!n.isRead) {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: n.id }),
            });
            setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
        }
        if (n.linkUrl) router.push(n.linkUrl);
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setMarkingAll(false);
    };

    // 날짜별 그룹핑
    const grouped = filtered.reduce<Record<string, Notification[]>>((acc, n) => {
        const d = new Date(n.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
        const key =
            diffDays === 0 ? "오늘" :
            diffDays === 1 ? "어제" :
            diffDays < 7 ? "이번 주" :
            `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(n);
        return acc;
    }, {});
    const groupOrder = ["오늘", "어제", "이번 주"];
    const sortedGroups = [
        ...groupOrder.filter((k) => grouped[k]),
        ...Object.keys(grouped).filter((k) => !groupOrder.includes(k)),
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f3f3f3" }}>
            <div className="max-w-[720px] mx-auto px-5 pt-16 pb-24">

                {/* 페이지 헤더 */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: "#a8a29e" }}>
                            Notifications
                        </p>
                        <h1 className="text-[28px] font-bold tracking-tight" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>
                            알림
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 pb-1">
                        {unreadCount > 0 && (
                            <>
                                <span className="text-[13px]" style={{ color: "#a8a29e" }}>
                                    읽지 않은 알림{" "}
                                    <span className="font-semibold" style={{ color: "#1c1917" }}>{unreadCount}</span>개
                                </span>
                                <button
                                    onClick={handleMarkAllRead}
                                    disabled={markingAll}
                                    className="text-[13px] font-medium transition-opacity hover:opacity-60 disabled:opacity-30"
                                    style={{ color: "#78716c" }}
                                >
                                    {markingAll ? "처리 중…" : "모두 읽음"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* 필터 탭 */}
                <div className="flex items-center gap-1 mb-8 -mx-1 overflow-x-auto no-scrollbar">
                    {[{ key: "all", label: "전체", count: totalCount }, ...usedTypes.map((t) => ({ key: t, label: (TYPE_META[t] ?? DEFAULT_META).label, count: typeCounts[t] }))].map(({ key, label, count }) => {
                        const active = typeFilter === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setTypeFilter(key)}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150"
                                style={{
                                    backgroundColor: active ? "#1c1917" : "transparent",
                                    color: active ? "#fafaf9" : "#78716c",
                                    border: `1px solid ${active ? "#1c1917" : "#e7e5e4"}`,
                                }}
                            >
                                {label}
                                <span className="text-[11px] font-bold" style={{ opacity: active ? 0.55 : 0.7 }}>{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 알림 피드 */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        <p className="text-[14px]" style={{ color: "#a8a29e" }}>새로운 알림이 없습니다.</p>
                    </div>
                ) : (
                    <div>
                        {sortedGroups.map((group, gi) => (
                            <div key={group}>
                                {/* 날짜 그룹 레이블 */}
                                <div className={`flex items-center gap-3 ${gi > 0 ? "mt-10" : ""} mb-1`}>
                                    <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>
                                        {group}
                                    </span>
                                    <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                                </div>

                                {/* 그룹 내 알림 목록 */}
                                {grouped[group].map((n) => {
                                    const meta = TYPE_META[n.type] ?? DEFAULT_META;
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => handleClick(n)}
                                            className="group flex items-start gap-4 py-4 cursor-pointer transition-all duration-150"
                                            style={{
                                                opacity: n.isRead ? 0.55 : 1,
                                            }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = n.isRead ? "0.55" : "1"; }}
                                        >
                                            {/* 왼쪽: 읽음 여부 인디케이터 + 아이콘 */}
                                            <div className="relative shrink-0 mt-0.5">
                                                <div
                                                    className="flex items-center justify-center w-9 h-9 rounded-xl"
                                                    style={{ backgroundColor: meta.bg }}
                                                >
                                                    {meta.icon}
                                                </div>
                                                {!n.isRead && (
                                                    <div
                                                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: "#3b82f6", border: "1.5px solid #fafaf9" }}
                                                    />
                                                )}
                                            </div>

                                            {/* 오른쪽: 텍스트 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline justify-between gap-3 mb-0.5">
                                                    <span
                                                        className="text-[14px] leading-snug"
                                                        style={{
                                                            color: "#1c1917",
                                                            fontWeight: n.isRead ? 400 : 600,
                                                        }}
                                                    >
                                                        {n.title}
                                                    </span>
                                                    <span className="shrink-0 text-[12px]" style={{ color: "#a8a29e" }}>
                                                        {timeAgo(n.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: "#78716c" }}>
                                                    {n.body}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

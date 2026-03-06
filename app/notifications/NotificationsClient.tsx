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

const typeIcon: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
    FOLLOW: {
        bg: "rgba(74,123,247,0.12)",
        color: "#4a7bf7",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        ),
    },
    NEW_THEME: {
        bg: "rgba(255,149,0,0.12)",
        color: "#FF9500",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12h8M12 8v8"/>
            </svg>
        ),
    },
    CREDIT_EXPIRY: {
        bg: "rgba(255,59,48,0.12)",
        color: "#ff3b30",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        ),
    },
    PURCHASE_COMPLETE: {
        bg: "rgba(52,199,89,0.12)",
        color: "#34c759",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
            </svg>
        ),
    },
    REFUND_COMPLETE: {
        bg: "rgba(74,123,247,0.12)",
        color: "#4a7bf7",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
        ),
    },
    THEME_APPROVED: {
        bg: "rgba(255,149,0,0.12)",
        color: "#FF9500",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
            </svg>
        ),
    },
    THEME_REJECTED: {
        bg: "rgba(255,59,48,0.12)",
        color: "#ff3b30",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
        ),
    },
    SYSTEM: {
        bg: "rgba(142,142,147,0.12)",
        color: "#8e8e93",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
        ),
    },
    INQUIRY: {
        bg: "rgba(74,123,247,0.12)",
        color: "#4a7bf7",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        ),
    },
};

const defaultIcon = {
    bg: "rgba(142,142,147,0.12)",
    color: "#8e8e93",
    icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
    ),
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

type FilterType = "all" | "unread";

export default function NotificationsClient({ initialNotifications }: Props) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [filter, setFilter] = useState<FilterType>("all");
    const [markingAll, setMarkingAll] = useState(false);

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

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

    return (
        <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-10">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-black/5 active:scale-95"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                            알림
                        </h1>
                        {unreadCount > 0 && (
                            <p className="text-[12px] mt-0.5" style={{ color: "#8e8e93" }}>
                                읽지 않은 알림 {unreadCount}개
                            </p>
                        )}
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markingAll}
                        className="text-[13px] font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-70 disabled:opacity-40 active:scale-95"
                        style={{ background: "rgba(74,123,247,0.08)", color: "#4a7bf7" }}
                    >
                        {markingAll ? "처리 중..." : "모두 읽음"}
                    </button>
                )}
            </div>

            {/* 필터 탭 */}
            <div className="flex gap-2 mb-5">
                {(["all", "unread"] as FilterType[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                        style={{
                            background: filter === f ? "#1c1c1e" : "rgba(0,0,0,0.05)",
                            color: filter === f ? "#fff" : "#636366",
                        }}
                    >
                        {f === "all" ? "전체" : `읽지 않음${unreadCount > 0 ? ` ${unreadCount}` : ""}`}
                    </button>
                ))}
            </div>

            {/* 알림 목록 */}
            <div
                className="rounded-[20px] overflow-hidden"
                style={{
                    background: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
            >
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <p className="text-[14px]" style={{ color: "#aeaeb2" }}>
                            {filter === "unread" ? "읽지 않은 알림이 없습니다." : "알림이 없습니다."}
                        </p>
                    </div>
                ) : (
                    filtered.map((n, idx) => {
                        const iconData = typeIcon[n.type] ?? defaultIcon;
                        return (
                            <div key={n.id}>
                                <button
                                    onClick={() => handleClick(n)}
                                    className="w-full flex items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-black/[0.02] active:bg-black/[0.04]"
                                    style={{ background: n.isRead ? "transparent" : "rgba(74,123,247,0.03)" }}
                                >
                                    {/* 아이콘 */}
                                    <div
                                        className="shrink-0 flex items-center justify-center"
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: "50%",
                                            background: n.isRead ? "rgba(0,0,0,0.04)" : iconData.bg,
                                            border: `1.5px solid ${n.isRead ? "rgba(0,0,0,0.06)" : iconData.color + "33"}`,
                                            opacity: n.isRead ? 0.5 : 1,
                                        }}
                                    >
                                        {iconData.icon}
                                    </div>

                                    {/* 텍스트 */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <p
                                                className="text-[14px] font-semibold leading-snug"
                                                style={{ color: n.isRead ? "#aeaeb2" : "#1c1c1e" }}
                                            >
                                                {n.title}
                                            </p>
                                            <span
                                                className="text-[11px] shrink-0 mt-[2px]"
                                                style={{ color: n.isRead ? "#c8c8cd" : "#aeaeb2" }}
                                            >
                                                {timeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                        <p
                                            className="text-[13px] leading-snug mt-1"
                                            style={{ color: n.isRead ? "#c8c8cd" : "#636366" }}
                                        >
                                            {n.body}
                                        </p>
                                    </div>

                                    {/* 읽지 않음 점 */}
                                    {!n.isRead && (
                                        <div
                                            className="shrink-0 mt-2"
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                background: "#4a7bf7",
                                            }}
                                        />
                                    )}
                                </button>
                                {idx < filtered.length - 1 && (
                                    <div className="mx-5" style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </main>
    );
}

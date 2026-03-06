"use client";

import { useState, useEffect, useRef } from "react";
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

export default function NotificationBell() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json() as { notifications: Notification[]; unreadCount: number };
            setNotifications(data.notifications ?? []);
            setUnreadCount(data.unreadCount ?? 0);
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = async () => {
        setOpen(prev => !prev);
        if (!open) {
            await fetchNotifications();
        }
    };

    const handleMarkAllRead = async () => {
        await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const handleClick = async (n: Notification) => {
        if (!n.isRead) {
            await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id }) });
            setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setOpen(false);
        if (n.linkUrl) router.push(n.linkUrl);
    };

    const typeIcon: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
        FOLLOW: {
            bg: "rgba(74,123,247,0.12)",
            color: "#4a7bf7",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            ),
        },
        NEW_THEME: {
            bg: "rgba(255,149,0,0.12)",
            color: "#FF9500",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12h8M12 8v8"/>
                </svg>
            ),
        },
        CREDIT_EXPIRY: {
            bg: "rgba(255,59,48,0.12)",
            color: "#ff3b30",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
            ),
        },
        PURCHASE_COMPLETE: {
            bg: "rgba(52,199,89,0.12)",
            color: "#34c759",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="M22 4L12 14.01l-3-3"/>
                </svg>
            ),
        },
        REFUND_COMPLETE: {
            bg: "rgba(74,123,247,0.12)",
            color: "#4a7bf7",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
            ),
        },
        THEME_APPROVED: {
            bg: "rgba(255,149,0,0.12)",
            color: "#FF9500",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="M22 4L12 14.01l-3-3"/>
                </svg>
            ),
        },
        THEME_REJECTED: {
            bg: "rgba(255,59,48,0.12)",
            color: "#ff3b30",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            ),
        },
        SYSTEM: {
            bg: "rgba(142,142,147,0.12)",
            color: "#8e8e93",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
            ),
        },
        INQUIRY: {
            bg: "rgba(74,123,247,0.12)",
            color: "#4a7bf7",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a7bf7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            ),
        },
    };

    const defaultIcon = {
        bg: "rgba(142,142,147,0.12)",
        color: "#8e8e93",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
        ),
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "방금 전";
        if (mins < 60) return `${mins}분 전`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}시간 전`;
        return `${Math.floor(hours / 24)}일 전`;
    };

    const visibleNotifications = notifications.slice(0, 5);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleOpen}
                className="relative w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-black/5 active:scale-95"
                aria-label="알림"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span
                        className="absolute top-0.5 right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                        style={{ background: "#FF3B30" }}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="absolute right-0 z-50"
                    style={{
                        top: "calc(100% + 18px)",
                        width: "400px",
                        right: "-80px",
                        borderRadius: "18px",
                        background: "#ffffff",
                        boxShadow: "0 12px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
                        border: "1px solid rgba(0,0,0,0.07)",
                        overflow: "hidden",
                    }}
                >
                    {/* 헤더 */}
                    <div
                        className="flex items-center justify-between px-5 py-3"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
                    >
                        <span className="text-[15px] font-bold" style={{ color: "#1c1c1e", letterSpacing: "-0.2px" }}>
                            알림
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[12px] font-medium transition-opacity hover:opacity-60"
                                style={{ color: "#4a7bf7" }}
                            >
                                모두 읽음
                            </button>
                        )}
                    </div>

                    {/* 목록 */}
                    <div style={{ overflowY: "auto", scrollbarWidth: "none" }}>
                        {loading && notifications.length === 0 ? (
                            <div className="flex items-center justify-center py-10">
                                <span className="text-[13px]" style={{ color: "#8e8e93" }}>불러오는 중...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                <span className="text-[13px]" style={{ color: "#8e8e93" }}>알림이 없습니다.</span>
                            </div>
                        ) : (
                            visibleNotifications.map((n, idx) => {
                                const iconData = typeIcon[n.type] ?? defaultIcon;
                                return (
                                    <div key={n.id}>
                                        <button
                                            onClick={() => handleClick(n)}
                                            className="w-full flex items-start gap-[14px] px-5 py-3.5 text-left transition-colors hover:bg-gray-50"
                                            style={{ background: n.isRead ? "rgba(0,0,0,0.04)" : "transparent" }}
                                        >
                                            {/* 아이콘 원형 */}
                                            <div
                                                className="shrink-0 flex items-center justify-center"
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: "50%",
                                                    background: n.isRead ? "rgba(0,0,0,0.04)" : iconData.bg,
                                                    border: `1.5px solid ${n.isRead ? "rgba(0,0,0,0.06)" : iconData.color + "22"}`,
                                                    opacity: n.isRead ? 0.5 : 1,
                                                }}
                                            >
                                                {iconData.icon}
                                            </div>

                                            {/* 텍스트 영역 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p
                                                        className="text-[13px] font-semibold leading-snug"
                                                        style={{ color: n.isRead ? "#aeaeb2" : "#1c1c1e" }}
                                                    >
                                                        {n.title}
                                                    </p>
                                                    <span
                                                        className="text-[11px] shrink-0 mt-[1px]"
                                                        style={{ color: n.isRead ? "#c8c8cd" : "#aeaeb2" }}
                                                    >
                                                        {timeAgo(n.createdAt)}
                                                    </span>
                                                </div>
                                                <p
                                                    className="text-[12px] leading-snug mt-0.5"
                                                    style={{ color: n.isRead ? "#c8c8cd" : "#636366" }}
                                                >
                                                    {n.body}
                                                </p>
                                            </div>

                                            {/* 읽지 않음 점 */}
                                            {!n.isRead && (
                                                <div
                                                    className="shrink-0 mt-1.5"
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: "50%",
                                                        background: "#4a7bf7",
                                                    }}
                                                />
                                            )}
                                        </button>
                                        {idx < visibleNotifications.length - 1 && (
                                            <div
                                                className="mx-5"
                                                style={{ height: 1, background: "rgba(0,0,0,0.07)" }}
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* 모든 알림 보기 */}
                    {notifications.length > 0 && (
                        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    router.push("/notifications");
                                }}
                                className="w-full py-3.5 text-center text-[13px] font-semibold transition-opacity hover:opacity-60"
                                style={{ color: "#4a7bf7" }}
                            >
                                모든 알림 보기
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
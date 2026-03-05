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

    // 폴링: 30초마다 갱신
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // 외부 클릭 시 닫기
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

    const typeIcon: Record<string, string> = {
        FOLLOW: "👤",
        NEW_THEME: "🎨",
        CREDIT_EXPIRY: "⚠️",
        PURCHASE_COMPLETE: "✅",
        REFUND_COMPLETE: "💸",
        THEME_APPROVED: "🎉",
        THEME_REJECTED: "❌",
        SYSTEM: "📢",
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
                    className="absolute right-0 top-11 w-[340px] rounded-2xl overflow-hidden z-50"
                    style={{
                        background: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
                        border: "1px solid rgba(0,0,0,0.08)",
                    }}
                >
                    {/* 헤더 */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
                        <span className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>알림</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[12px] font-medium transition-opacity hover:opacity-60"
                                style={{ color: "#FF9500" }}
                            >
                                모두 읽음
                            </button>
                        )}
                    </div>

                    {/* 목록 */}
                    <div className="max-h-[360px] overflow-y-auto">
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
                            notifications.map(n => (
                                <button
                                    key={n.id}
                                    onClick={() => handleClick(n)}
                                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-black/5"
                                    style={{ background: n.isRead ? "transparent" : "rgba(255,149,0,0.05)" }}
                                >
                                    <span className="text-[18px] shrink-0 mt-0.5">{typeIcon[n.type] ?? "📢"}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold truncate" style={{ color: "#1c1c1e" }}>{n.title}</p>
                                        <p className="text-[12px] leading-snug mt-0.5" style={{ color: "#8e8e93" }}>{n.body}</p>
                                        <p className="text-[11px] mt-1" style={{ color: "#c8c8cd" }}>{timeAgo(n.createdAt)}</p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: "#FF9500" }} />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

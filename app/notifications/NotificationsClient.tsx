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

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

type FilterType = "all" | "unread";

const CARD_STYLE = {
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(0,0,0,0.07)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
};

export default function NotificationsClient({ initialNotifications }: Props) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [filter, setFilter] = useState<FilterType>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [markingAll, setMarkingAll] = useState(false);
    const [selected, setSelected] = useState<Notification | null>(null);

    const totalCount = notifications.length;
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const readCount = totalCount - unreadCount;

    // 타입별 카운트
    const typeCounts = notifications.reduce<Record<string, number>>((acc, n) => {
        acc[n.type] = (acc[n.type] ?? 0) + 1;
        return acc;
    }, {});
    const usedTypes = Object.keys(typeCounts);

    const filtered = notifications.filter((n) => {
        const matchRead = filter === "all" || !n.isRead;
        const matchType = typeFilter === "all" || n.type === typeFilter;
        return matchRead && matchType;
    });

    const handleClick = async (n: Notification) => {
        setSelected(n);
        if (!n.isRead) {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: n.id }),
            });
            setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
            setSelected({ ...n, isRead: true });
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        if (selected) setSelected({ ...selected, isRead: true });
        setMarkingAll(false);
    };

    const handleDetailLink = () => {
        if (selected?.linkUrl) router.push(selected.linkUrl);
    };

    return (
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8">

            {/* 상단 헤더 */}
            <div className="flex items-center justify-between mb-7">
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
                        <h1 className="text-[24px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>알림</h1>
                        <p className="text-[12px] mt-0.5" style={{ color: "#8e8e93" }}>총 {totalCount}개 · 읽지 않음 {unreadCount}개</p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markingAll}
                        className="text-[13px] font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-70 disabled:opacity-40 active:scale-95"
                        style={{ background: "rgba(74,123,247,0.1)", color: "#4a7bf7" }}
                    >
                        {markingAll ? "처리 중..." : "모두 읽음 처리"}
                    </button>
                )}
            </div>

            {/* 3단 레이아웃 */}
            <div className="flex gap-5 items-start">

                {/* ── 왼쪽 사이드바 ── */}
                <aside className="w-[220px] shrink-0 flex flex-col gap-4 sticky top-6">

                    {/* 요약 카드 */}
                    <div className="rounded-[18px] p-5 flex flex-col gap-3" style={CARD_STYLE}>
                        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#aeaeb2" }}>요약</p>
                        <div className="flex flex-col gap-2">
                            {[
                                { label: "전체", value: totalCount, color: "#1c1c1e" },
                                { label: "읽지 않음", value: unreadCount, color: "#4a7bf7" },
                                { label: "읽음", value: readCount, color: "#aeaeb2" },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <span className="text-[13px]" style={{ color: "#636366" }}>{s.label}</span>
                                    <span className="text-[15px] font-bold" style={{ color: s.color }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                        {/* 읽음 진행바 */}
                        <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: "rgba(0,0,0,0.06)" }}>
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: totalCount > 0 ? `${Math.round((readCount / totalCount) * 100)}%` : "0%", background: "#34c759" }}
                            />
                        </div>
                        <p className="text-[11px]" style={{ color: "#aeaeb2" }}>
                            {totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0}% 읽음
                        </p>
                    </div>

                    {/* 필터 */}
                    <div className="rounded-[18px] p-5 flex flex-col gap-2" style={CARD_STYLE}>
                        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#aeaeb2" }}>상태 필터</p>
                        {(["all", "unread"] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-all hover:opacity-80"
                                style={{
                                    background: filter === f ? "#1c1c1e" : "transparent",
                                    color: filter === f ? "#fff" : "#636366",
                                }}
                            >
                                <span>{f === "all" ? "전체" : "읽지 않음"}</span>
                                {f === "unread" && unreadCount > 0 && (
                                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: filter === f ? "rgba(255,255,255,0.2)" : "rgba(74,123,247,0.12)", color: filter === f ? "#fff" : "#4a7bf7" }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* 카테고리 필터 */}
                    {usedTypes.length > 0 && (
                        <div className="rounded-[18px] p-5 flex flex-col gap-2" style={CARD_STYLE}>
                            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#aeaeb2" }}>카테고리</p>
                            <button
                                onClick={() => setTypeFilter("all")}
                                className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-all hover:opacity-80"
                                style={{ background: typeFilter === "all" ? "#1c1c1e" : "transparent", color: typeFilter === "all" ? "#fff" : "#636366" }}
                            >
                                <span>전체</span>
                                <span className="text-[11px] font-bold">{totalCount}</span>
                            </button>
                            {usedTypes.map((t) => {
                                const meta = TYPE_META[t] ?? DEFAULT_META;
                                const active = typeFilter === t;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setTypeFilter(t)}
                                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-all hover:opacity-80"
                                        style={{ background: active ? meta.color : "transparent", color: active ? "#fff" : "#636366" }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span style={{ opacity: active ? 1 : 0.6 }}>{meta.icon}</span>
                                            <span>{meta.label}</span>
                                        </div>
                                        <span className="text-[11px] font-bold">{typeCounts[t]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </aside>

                {/* ── 중앙 알림 목록 ── */}
                <section className="flex-1 min-w-0">
                    <div className="rounded-[20px] overflow-hidden" style={CARD_STYLE}>
                        {/* 목록 헤더 */}
                        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                            <span className="text-[13px] font-semibold" style={{ color: "#636366" }}>
                                {filtered.length}개의 알림
                            </span>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                <p className="text-[14px]" style={{ color: "#aeaeb2" }}>알림이 없습니다.</p>
                            </div>
                        ) : (
                            filtered.map((n, idx) => {
                                const meta = TYPE_META[n.type] ?? DEFAULT_META;
                                const isActive = selected?.id === n.id;
                                return (
                                    <div key={n.id}>
                                        <button
                                            onClick={() => handleClick(n)}
                                            className="w-full flex items-start gap-4 px-5 py-4 text-left transition-all"
                                            style={{
                                                background: isActive
                                                    ? "rgba(74,123,247,0.06)"
                                                    : n.isRead ? "transparent" : "rgba(74,123,247,0.02)",
                                                borderLeft: isActive ? `3px solid ${meta.color}` : "3px solid transparent",
                                            }}
                                        >
                                            {/* 아이콘 */}
                                            <div
                                                className="shrink-0 flex items-center justify-center"
                                                style={{
                                                    width: 44, height: 44, borderRadius: "50%",
                                                    background: n.isRead ? "rgba(0,0,0,0.04)" : meta.bg,
                                                    border: `1.5px solid ${n.isRead ? "rgba(0,0,0,0.06)" : meta.color + "40"}`,
                                                    opacity: n.isRead ? 0.45 : 1,
                                                }}
                                            >
                                                {meta.icon}
                                            </div>
                                            {/* 텍스트 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-[13px] font-semibold truncate" style={{ color: n.isRead ? "#aeaeb2" : "#1c1c1e" }}>{n.title}</p>
                                                    <span className="text-[11px] shrink-0" style={{ color: "#c8c8cd" }}>{timeAgo(n.createdAt)}</span>
                                                </div>
                                                <p className="text-[12px] mt-0.5 line-clamp-2" style={{ color: n.isRead ? "#c8c8cd" : "#636366" }}>{n.body}</p>
                                                <span
                                                    className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                                    style={{ background: n.isRead ? "rgba(0,0,0,0.04)" : meta.bg, color: n.isRead ? "#aeaeb2" : meta.color }}
                                                >
                                                    {meta.label}
                                                </span>
                                            </div>
                                            {/* 읽지 않음 점 */}
                                            {!n.isRead && (
                                                <div className="shrink-0 mt-1.5" style={{ width: 7, height: 7, borderRadius: "50%", background: "#4a7bf7" }} />
                                            )}
                                        </button>
                                        {idx < filtered.length - 1 && (
                                            <div className="mx-5" style={{ height: 1, background: "rgba(0,0,0,0.05)" }} />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* ── 우측 상세 패널 ── */}
                <aside className="w-[280px] shrink-0 sticky top-6">
                    {selected ? (() => {
                        const meta = TYPE_META[selected.type] ?? DEFAULT_META;
                        return (
                            <div className="rounded-[20px] overflow-hidden flex flex-col" style={CARD_STYLE}>
                                {/* 상단 컬러 헤더 */}
                                <div className="px-6 pt-6 pb-5" style={{ background: meta.bg, borderBottom: `1px solid ${meta.color}22` }}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.6)", border: `1.5px solid ${meta.color}40` }}>
                                            {meta.icon}
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: meta.color + "22", color: meta.color }}>{meta.label}</span>
                                            <p className="text-[11px] mt-1" style={{ color: "#8e8e93" }}>{formatDate(selected.createdAt)}</p>
                                        </div>
                                    </div>
                                    <p className="text-[15px] font-bold leading-snug" style={{ color: "#1c1c1e" }}>{selected.title}</p>
                                </div>

                                {/* 본문 */}
                                <div className="px-6 py-5 flex flex-col gap-4">
                                    <p className="text-[13px] leading-relaxed" style={{ color: "#3a3a3c" }}>{selected.body}</p>

                                    {/* 읽음 상태 */}
                                    <div className="flex items-center gap-2 py-3 px-4 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
                                        <div className="w-2 h-2 rounded-full" style={{ background: selected.isRead ? "#34c759" : "#4a7bf7" }} />
                                        <span className="text-[12px] font-medium" style={{ color: "#636366" }}>
                                            {selected.isRead ? "읽음" : "읽지 않음"}
                                        </span>
                                    </div>

                                    {/* 바로가기 버튼 */}
                                    {selected.linkUrl && (
                                        <button
                                            onClick={handleDetailLink}
                                            className="w-full py-3 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 active:scale-95 flex items-center justify-center gap-2"
                                            style={{ background: meta.color, color: "#fff" }}
                                        >
                                            바로가기
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setSelected(null)}
                                        className="w-full py-2.5 rounded-xl text-[13px] font-medium transition-all hover:bg-black/5 active:scale-95"
                                        style={{ color: "#8e8e93" }}
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        );
                    })() : (
                        <div className="rounded-[20px] flex flex-col items-center justify-center py-14 gap-3" style={CARD_STYLE}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d1d6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            <p className="text-[13px] text-center leading-snug" style={{ color: "#c8c8cd" }}>알림을 선택하면<br/>상세 내용이 표시됩니다.</p>
                        </div>
                    )}
                </aside>

            </div>
        </main>
    );
}

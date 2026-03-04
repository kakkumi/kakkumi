"use client";

import { useState, useEffect, useCallback } from "react";
import { formatKST } from "@/lib/date";

// ── 타입 ──────────────────────────────────────────
type Stats = { userCount: number; themeCount: number; purchaseCount: number; inquiryCount: number };
type AdminTheme = {
    id: string; title: string; description: string | null; price: number;
    status: string; adminNote: string | null; createdAt: string;
    creatorNickname: string | null; creatorName: string;
};
type AdminUser = {
    id: string; name: string; nickname: string | null; email: string | null;
    role: string; isSuspended: boolean; createdAt: string; purchaseCount: number;
};
type AdminReport = {
    id: string; reason: string; detail: string | null; status: string; createdAt: string;
    reporterNickname: string | null; reporterName: string;
    themeId: string; themeTitle: string; themeStatus: string;
};
type AdminPurchase = {
    id: string; amount: number; status: string; createdAt: string; pgTransactionId: string | null;
    buyerNickname: string | null; buyerName: string;
    themeTitle: string; creatorNickname: string | null; creatorName: string;
};
type AdminSettlement = {
    creatorId: string; creatorNickname: string | null; creatorName: string;
    totalSales: number; totalAmount: number; settlementAmount: number;
};
type AdminInquiryReply = {
    id: string; inquiryId: string; content: string; isAdmin: boolean; createdAt: string;
    author: { name: string; image: string | null; role: string };
};
type AdminInquiry = {
    id: string; title: string; content: string; category: string;
    status: string; createdAt: string; replyCount: number;
    userNickname: string | null; userName: string;
    replies?: AdminInquiryReply[];
};

type Tab = "overview" | "themes" | "users" | "reports" | "sales" | "inquiries";
type Props = {
    stats: Stats;
    recentUsers: AdminUser[];
    recentPurchases: AdminPurchase[];
};

// ── 스타일 상수 ──────────────────────────────────
const ROLE_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    ADMIN:   { label: "관리자",    bg: "rgba(255,59,48,0.12)",  color: "#ff3b30" },
    CREATOR: { label: "크리에이터", bg: "rgba(255,149,0,0.12)", color: "#FF9500" },
    USER:    { label: "일반 회원",  bg: "rgba(0,122,255,0.10)", color: "#007aff" },
};
const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    COMPLETED: { label: "결제 완료", bg: "rgba(52,199,89,0.12)",  color: "#34c759" },
    PENDING:   { label: "대기 중",   bg: "rgba(255,149,0,0.12)", color: "#FF9500" },
    REFUNDED:  { label: "환불",      bg: "rgba(255,59,48,0.12)", color: "#ff3b30" },
};
const THEME_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    PUBLISHED: { label: "공개",    bg: "rgba(52,199,89,0.12)",  color: "#34c759" },
    DRAFT:     { label: "대기 중", bg: "rgba(255,149,0,0.12)", color: "#FF9500" },
    HIDDEN:    { label: "숨김",    bg: "rgba(0,0,0,0.08)",      color: "#8e8e93" },
};
const REPORT_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    PENDING:   { label: "처리 대기", bg: "rgba(255,149,0,0.12)", color: "#FF9500" },
    RESOLVED:  { label: "처리 완료", bg: "rgba(52,199,89,0.12)", color: "#34c759" },
    DISMISSED: { label: "기각",      bg: "rgba(0,0,0,0.08)",     color: "#8e8e93" },
};
const INQUIRY_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    OPEN:     { label: "답변 대기", bg: "rgba(255,149,0,0.12)", color: "#c97000" },
    ANSWERED: { label: "답변 완료", bg: "rgba(52,199,89,0.12)", color: "#1a7a3a" },
    CLOSED:   { label: "처리 완료", bg: "rgba(0,0,0,0.07)",     color: "#8e8e93" },
};

const CARD_BG = { background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" };

// ── 사이드바 메뉴 ─────────────────────────────────
const SIDEBAR_GROUPS: { category: string; items: { key: Tab; label: string }[] }[] = [
    {
        category: "개요",
        items: [{ key: "overview", label: "대시보드" }],
    },
    {
        category: "콘텐츠",
        items: [
            { key: "themes",    label: "테마 관리" },
            { key: "reports",   label: "신고 관리" },
        ],
    },
    {
        category: "회원",
        items: [
            { key: "users",     label: "회원 관리" },
        ],
    },
    {
        category: "정산",
        items: [
            { key: "sales",     label: "매출 / 정산" },
        ],
    },
    {
        category: "지원",
        items: [
            { key: "inquiries", label: "1:1 문의" },
        ],
    },
];

// ── 공통 컴포넌트 ─────────────────────────────────
function Badge({ style }: { style: { label: string; bg: string; color: string } }) {
    return (
        <span className="shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: style.bg, color: style.color }}>
            {style.label}
        </span>
    );
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}>{children}</div>
        </div>
    );
}

// ── 메인 컴포넌트 ─────────────────────────────────
export default function AdminClient({ stats, recentUsers, recentPurchases }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("overview");

    const [themes, setThemes] = useState<AdminTheme[]>([]);
    const [users, setUsers] = useState<AdminUser[]>(recentUsers);
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [purchases, setPurchases] = useState<AdminPurchase[]>(recentPurchases);
    const [settlements, setSettlements] = useState<AdminSettlement[]>([]);
    const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
    const [loading, setLoading] = useState(false);

    const [rejectModal, setRejectModal] = useState<{ themeId: string; title: string } | null>(null);
    const [rejectNote, setRejectNote] = useState("");
    const [deleteUserModal, setDeleteUserModal] = useState<{ userId: string; name: string } | null>(null);
    const [replyText, setReplyText] = useState("");
    const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiry | null>(null);
    const [inquiryDetailLoading, setInquiryDetailLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState("");

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 2500);
    };

    const fetchTab = useCallback(async (tab: Tab) => {
        setLoading(true);
        try {
            if (tab === "themes") {
                const r = await fetch("/api/admin/themes");
                const d = await r.json() as { themes: AdminTheme[] };
                setThemes(d.themes ?? []);
            } else if (tab === "users") {
                const r = await fetch("/api/admin/users");
                const d = await r.json() as { users: AdminUser[] };
                setUsers(d.users ?? []);
            } else if (tab === "reports") {
                const r = await fetch("/api/admin/reports");
                const d = await r.json() as { reports: AdminReport[] };
                setReports(d.reports ?? []);
            } else if (tab === "sales") {
                const r = await fetch("/api/admin/sales");
                const d = await r.json() as { purchases: AdminPurchase[]; settlements: AdminSettlement[] };
                setPurchases(d.purchases ?? []);
                setSettlements(d.settlements ?? []);
            } else if (tab === "inquiries") {
                const r = await fetch("/api/admin/inquiries");
                const d = await r.json() as { inquiries: AdminInquiry[] };
                setInquiries(d.inquiries ?? []);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab !== "overview") fetchTab(activeTab);
    }, [activeTab, fetchTab]);

    // ── 액션 ──────────────────────────────────────
    const themeAction = async (themeId: string, action: string, adminNote?: string) => {
        setActionLoading(true);
        await fetch("/api/admin/themes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ themeId, action, adminNote }) });
        setActionLoading(false);
        showToast("처리 완료");
        fetchTab("themes");
    };

    const userAction = async (userId: string, action: string) => {
        setActionLoading(true);
        await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, action }) });
        setActionLoading(false);
        showToast("처리 완료");
        setDeleteUserModal(null);
        fetchTab("users");
    };

    const reportAction = async (reportId: string, action: string, themeId?: string) => {
        setActionLoading(true);
        await fetch("/api/admin/reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId, action, themeId }) });
        setActionLoading(false);
        showToast("처리 완료");
        fetchTab("reports");
    };

    const purchaseAction = async (purchaseId: string, action: string) => {
        setActionLoading(true);
        await fetch("/api/admin/sales", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchaseId, action }) });
        setActionLoading(false);
        showToast("처리 완료");
        fetchTab("sales");
    };

    const fetchInquiryDetail = async (inq: AdminInquiry) => {
        setInquiryDetailLoading(true);
        setSelectedInquiry(inq);
        setReplyText("");
        try {
            const r = await fetch(`/api/admin/inquiries?id=${inq.id}`);
            const d = await r.json() as { inquiry: AdminInquiry };
            if (d.inquiry) setSelectedInquiry(d.inquiry);
        } finally {
            setInquiryDetailLoading(false);
        }
    };

    const sendReply = async () => {
        if (!selectedInquiry || !replyText.trim()) return;
        setActionLoading(true);
        await fetch("/api/admin/inquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inquiryId: selectedInquiry.id, content: replyText.trim() }),
        });
        setActionLoading(false);
        showToast("답변 전송 완료");
        setReplyText("");
        // 상세 새로고침
        const r = await fetch(`/api/admin/inquiries?id=${selectedInquiry.id}`);
        const d = await r.json() as { inquiry: AdminInquiry };
        if (d.inquiry) setSelectedInquiry(d.inquiry);
        // 목록도 갱신
        fetchTab("inquiries");
    };

    const STAT_CARDS = [
        { label: "전체 회원", value: stats.userCount, color: "#007aff", icon: (c: string) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
        { label: "등록 테마", value: stats.themeCount, color: "#FF9500", icon: (c: string) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg> },
        { label: "완료 구매", value: stats.purchaseCount, color: "#34c759", icon: (c: string) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
        { label: "문의 요청", value: stats.inquiryCount, color: "#af52de", icon: (c: string) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    ];

    return (
        <div className="flex flex-1 max-w-[1300px] mx-auto w-full px-6 pt-12 pb-20 gap-8">
            {/* 토스트 */}
            {toast && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl text-[13px] font-semibold shadow-lg"
                    style={{ background: "#1c1c1e", color: "#fff" }}>
                    {toast}
                </div>
            )}

            {/* ── 사이드바 ── */}
            <aside className="w-[220px] shrink-0 flex flex-col gap-1">
                {/* 관리자 뱃지 */}
                <div className="flex items-center gap-2.5 px-3 py-3 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,59,48,0.12)" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-[13px] font-extrabold leading-none" style={{ color: "#1c1c1e" }}>관리자 페이지</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#8e8e93" }}>카꾸미 서비스 관리</p>
                    </div>
                </div>

                {SIDEBAR_GROUPS.map((group, index) => (
                    <div key={group.category} className="flex flex-col gap-0.5">
                        <span
                            className="text-[11px] font-bold tracking-[0.15em] uppercase px-3 mb-1"
                            style={{ color: "#8e8e93" }}
                        >
                            {group.category}
                        </span>
                        {group.items.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setActiveTab(item.key)}
                                className="text-left px-3 py-2 rounded-xl text-[13px] transition-all"
                                style={{
                                    color: activeTab === item.key ? "#FF9500" : "#3a3a3c",
                                    background: "transparent",
                                    fontWeight: activeTab === item.key ? 700 : 500,
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                        {index < SIDEBAR_GROUPS.length - 1 && (
                            <div className="my-3 h-[1px]" style={{ background: "rgba(0,0,0,0.18)" }} />
                        )}
                    </div>
                ))}
            </aside>

            {/* ── 콘텐츠 영역 ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">

                {/* ── 대시보드 ─────────────────────── */}
                {activeTab === "overview" && (
                    <div className="flex flex-col gap-6">
                        <div>
                            <h2 className="text-[20px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>대시보드</h2>
                            <p className="text-[12px] mt-0.5" style={{ color: "#8e8e93" }}>카꾸미 서비스 전체 현황을 한눈에 확인합니다.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {STAT_CARDS.map((card) => (
                                <div key={card.label} className="p-6 rounded-[20px] flex flex-col gap-3" style={CARD_BG}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}18` }}>
                                        {card.icon(card.color)}
                                    </div>
                                    <div>
                                        <p className="text-[28px] font-extrabold leading-none" style={{ color: "#1c1c1e" }}>{card.value.toLocaleString()}</p>
                                        <p className="text-[12px] mt-1" style={{ color: "#8e8e93" }}>{card.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="p-6 rounded-[20px] flex flex-col gap-4" style={CARD_BG}>
                                <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>최근 가입 회원</h3>
                                {recentUsers.slice(0, 5).map((u) => (
                                    <div key={u.id} className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>{u.nickname ?? u.name}</span>
                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>{formatKST(u.createdAt, false)}</span>
                                        </div>
                                        <Badge style={ROLE_STYLE[u.role] ?? { label: u.role, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 rounded-[20px] flex flex-col gap-4" style={CARD_BG}>
                                <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>최근 구매</h3>
                                {recentPurchases.slice(0, 5).map((p) => (
                                    <div key={p.id} className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>{p.themeTitle}</span>
                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>{p.buyerNickname ?? p.buyerName} · {formatKST(p.createdAt, false)}</span>
                                        </div>
                                        <span className="text-[12px] font-bold" style={{ color: "#1c1c1e" }}>{p.amount.toLocaleString()}원</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 테마 관리 ────────────────────── */}
                {activeTab === "themes" && (
                    <div className="flex flex-col gap-5">
                        <div>
                            <h2 className="text-[20px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>테마 관리</h2>
                            <p className="text-[12px] mt-0.5" style={{ color: "#8e8e93" }}>등록된 테마를 승인하거나 반려 · 숨김 처리합니다.</p>
                        </div>
                        <div className="rounded-[20px] overflow-hidden" style={CARD_BG}>
                            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                                <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>테마 목록 ({themes.length}개)</h3>
                                {loading && <span className="text-[12px]" style={{ color: "#8e8e93" }}>로딩 중...</span>}
                            </div>
                            <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                                {themes.map((t) => (
                                    <div key={t.id} className="px-6 py-4 flex items-center gap-4">
                                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-semibold truncate" style={{ color: "#1c1c1e" }}>{t.title}</span>
                                                <Badge style={THEME_STATUS_STYLE[t.status] ?? { label: t.status, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                            </div>
                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>
                                                {t.creatorNickname ?? t.creatorName} · {t.price === 0 ? "무료" : `${t.price.toLocaleString()}원`} · {formatKST(t.createdAt, false)}
                                            </span>
                                            {t.adminNote && <span className="text-[11px]" style={{ color: "#ff3b30" }}>반려 사유: {t.adminNote}</span>}
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            {t.status === "DRAFT" && (
                                                <>
                                                    <button onClick={() => themeAction(t.id, "approve")} disabled={actionLoading}
                                                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:brightness-105 disabled:opacity-40"
                                                        style={{ background: "rgba(52,199,89,0.12)", color: "#34c759" }}>승인</button>
                                                    <button onClick={() => setRejectModal({ themeId: t.id, title: t.title })}
                                                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:brightness-105"
                                                        style={{ background: "rgba(255,59,48,0.10)", color: "#ff3b30" }}>반려</button>
                                                </>
                                            )}
                                            {t.status === "PUBLISHED" && (
                                                <button onClick={() => themeAction(t.id, "hide")} disabled={actionLoading}
                                                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:brightness-105 disabled:opacity-40"
                                                    style={{ background: "rgba(0,0,0,0.07)", color: "#3a3a3c" }}>숨김</button>
                                            )}
                                            {t.status === "HIDDEN" && (
                                                <button onClick={() => themeAction(t.id, "unhide")} disabled={actionLoading}
                                                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:brightness-105 disabled:opacity-40"
                                                    style={{ background: "rgba(52,199,89,0.10)", color: "#34c759" }}>공개 복구</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!loading && themes.length === 0 && <div className="px-6 py-10 text-center text-[13px]" style={{ color: "#8e8e93" }}>테마가 없습니다.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 회원 관리 ────────────────────── */}
                {activeTab === "users" && (
                    <div className="flex flex-col gap-5">
                        <div>
                            <h2 className="text-[20px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>회원 관리</h2>
                            <p className="text-[12px] mt-0.5" style={{ color: "#8e8e93" }}>전체 회원 목록 및 정지 · 탈퇴 처리를 합니다.</p>
                        </div>
                        <div className="rounded-[20px] overflow-hidden" style={CARD_BG}>
                            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                                <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>전체 회원 ({users.length}명)</h3>
                            </div>
                            <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                                {users.map((u) => (
                                    <div key={u.id} className="px-6 py-4 flex items-center gap-4">
                                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-semibold truncate" style={{ color: "#1c1c1e" }}>{u.nickname ?? u.name}</span>
                                                <Badge style={ROLE_STYLE[u.role] ?? { label: u.role, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                                {u.isSuspended && <Badge style={{ label: "정지됨", bg: "rgba(255,59,48,0.12)", color: "#ff3b30" }} />}
                                            </div>
                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>
                                                {u.email ?? "이메일 없음"} · 가입 {formatKST(u.createdAt, false)} · 구매 {u.purchaseCount}건
                                            </span>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            {!u.isSuspended ? (
                                                <button onClick={() => userAction(u.id, "suspend")} disabled={actionLoading || u.role === "ADMIN"}
                                                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:brightness-105 disabled:opacity-30"
                                                    style={{ background: "rgba(255,149,0,0.12)", color: "#FF9500" }}>정지</button>
                                            ) : (
                                                <button onClick={() => userAction(u.id, "unsuspend")} disabled={actionLoading}
                                                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:brightness-105 disabled:opacity-40"
                                                    style={{ background: "rgba(52,199,89,0.12)", color: "#34c759" }}>정지 해제</button>
                                            )}
                                            <button onClick={() => setDeleteUserModal({ userId: u.id, name: u.nickname ?? u.name })} disabled={u.role === "ADMIN"}
                                                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:brightness-105 disabled:opacity-30"
                                                style={{ background: "rgba(255,59,48,0.10)", color: "#ff3b30" }}>탈퇴</button>
                                        </div>
                                    </div>
                                ))}
                                {!loading && users.length === 0 && <div className="px-6 py-10 text-center text-[13px]" style={{ color: "#8e8e93" }}>회원이 없습니다.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 신고 관리 ────────────────────── */}
                {activeTab === "reports" && (
                    <div className="flex flex-col gap-5">
                        <div>
                            <h2 className="text-[20px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>신고 관리</h2>
                            <p className="text-[12px] mt-0.5" style={{ color: "#8e8e93" }}>접수된 신고를 처리하고 테마를 숨김 처리합니다.</p>
                        </div>
                        <div className="rounded-[20px] overflow-hidden" style={CARD_BG}>
                            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                                <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>신고 목록 ({reports.length}건)</h3>
                            </div>
                            <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                                {reports.map((r) => (
                                    <div key={r.id} className="px-6 py-4 flex items-center gap-4">
                                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-semibold truncate" style={{ color: "#1c1c1e" }}>{r.themeTitle}</span>
                                                <Badge style={REPORT_STATUS_STYLE[r.status] ?? { label: r.status, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                                <Badge style={THEME_STATUS_STYLE[r.themeStatus] ?? { label: r.themeStatus, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                            </div>
                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>
                                                신고자: {r.reporterNickname ?? r.reporterName} · 사유: {r.reason} · {formatKST(r.createdAt, false)}
                                            </span>
                                            {r.detail && <span className="text-[11px]" style={{ color: "#3a3a3c" }}>{r.detail}</span>}
                                        </div>
                                        {r.status === "PENDING" && (
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={() => reportAction(r.id, "hide_theme", r.themeId)} disabled={actionLoading}
                                                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold disabled:opacity-40"
                                                    style={{ background: "rgba(255,59,48,0.10)", color: "#ff3b30" }}>테마 숨김</button>
                                                <button onClick={() => reportAction(r.id, "resolve")} disabled={actionLoading}
                                                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold disabled:opacity-40"
                                                    style={{ background: "rgba(52,199,89,0.10)", color: "#34c759" }}>처리 완료</button>
                                                <button onClick={() => reportAction(r.id, "dismiss")} disabled={actionLoading}
                                                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold disabled:opacity-40"
                                                    style={{ background: "rgba(0,0,0,0.06)", color: "#8e8e93" }}>기각</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {!loading && reports.length === 0 && <div className="px-6 py-10 text-center text-[13px]" style={{ color: "#8e8e93" }}>신고 내역이 없습니다.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 매출/정산 ────────────────────── */}
                {activeTab === "sales" && (
                    <div className="flex flex-col gap-5">
                        <div>
                            <h2 className="text-[20px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>매출 / 정산</h2>
                            <p className="text-[12px] mt-0.5" style={{ color: "#8e8e93" }}>전체 결제 내역과 제작자별 정산을 관리합니다.</p>
                        </div>
                        <div className="rounded-[20px] overflow-hidden" style={CARD_BG}>
                            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                                <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>제작자별 정산 (수수료 20% 제외)</h3>
                            </div>
                            <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                                {settlements.map((s) => (
                                    <div key={s.creatorId} className="px-6 py-4 flex items-center justify-between gap-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{s.creatorNickname ?? s.creatorName}</span>
                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>판매 {s.totalSales}건 · 총 매출 {s.totalAmount.toLocaleString()}원</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[15px] font-extrabold" style={{ color: "#1c1c1e" }}>{s.settlementAmount.toLocaleString()}원</span>
                                            <Badge style={{ label: "정산 예정", bg: "rgba(255,149,0,0.12)", color: "#FF9500" }} />
                                        </div>
                                    </div>
                                ))}
                                {!loading && settlements.length === 0 && <div className="px-6 py-10 text-center text-[13px]" style={{ color: "#8e8e93" }}>정산 내역이 없습니다.</div>}
                            </div>
                        </div>
                        <div className="rounded-[20px] overflow-hidden" style={CARD_BG}>
                            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                                <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>전체 결제 내역 ({purchases.length}건)</h3>
                            </div>
                            <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                                {purchases.map((p) => (
                                    <div key={p.id} className="px-6 py-4 flex items-center gap-4">
                                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-semibold truncate" style={{ color: "#1c1c1e" }}>{p.themeTitle}</span>
                                                <Badge style={STATUS_STYLE[p.status] ?? { label: p.status, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                            </div>
                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>
                                                구매자: {p.buyerNickname ?? p.buyerName} · 제작자: {p.creatorNickname ?? p.creatorName} · {formatKST(p.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>{p.amount.toLocaleString()}원</span>
                                            {p.status === "COMPLETED" && (
                                                <button onClick={() => purchaseAction(p.id, "refund")} disabled={actionLoading}
                                                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold disabled:opacity-40"
                                                    style={{ background: "rgba(255,59,48,0.10)", color: "#ff3b30" }}>환불</button>
                                            )}
                                            {p.status === "PENDING" && (
                                                <button onClick={() => purchaseAction(p.id, "complete")} disabled={actionLoading}
                                                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold disabled:opacity-40"
                                                    style={{ background: "rgba(52,199,89,0.10)", color: "#34c759" }}>완료 처리</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!loading && purchases.length === 0 && <div className="px-6 py-10 text-center text-[13px]" style={{ color: "#8e8e93" }}>결제 내역이 없습니다.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 1:1 문의 ─────────────────────── */}
                {activeTab === "inquiries" && (
                    <div className="flex flex-col gap-5">
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-[20px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>1:1 문의</h2>
                                <p className="text-[12px] mt-0.5" style={{ color: "#8e8e93" }}>접수된 문의에 답변을 작성합니다.</p>
                            </div>
                            {selectedInquiry && (
                                <button
                                    onClick={() => { setSelectedInquiry(null); setReplyText(""); }}
                                    className="flex items-center gap-1.5 text-[13px] font-medium transition-all hover:opacity-70"
                                    style={{ color: "#8e8e93" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                                    </svg>
                                    목록으로
                                </button>
                            )}
                        </div>

                        {selectedInquiry ? (
                            /* ── 상세 뷰 ── */
                            <div className="flex flex-col gap-4">
                                {/* 원문 */}
                                <div className="rounded-[20px] p-6 flex flex-col gap-3" style={CARD_BG}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                                style={{ background: INQUIRY_STATUS_STYLE[selectedInquiry.status]?.bg, color: INQUIRY_STATUS_STYLE[selectedInquiry.status]?.color }}>
                                                {INQUIRY_STATUS_STYLE[selectedInquiry.status]?.label ?? selectedInquiry.status}
                                            </span>
                                            <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.05)", color: "#8e8e93" }}>
                                                {selectedInquiry.category}
                                            </span>
                                        </div>
                                        <span className="text-[12px]" style={{ color: "#8e8e93" }}>{formatKST(selectedInquiry.createdAt)}</span>
                                    </div>
                                    <h2 className="text-[17px] font-bold" style={{ color: "#1c1c1e" }}>{selectedInquiry.title}</h2>
                                    <p className="text-[12px] font-medium" style={{ color: "#8e8e93" }}>
                                        작성자: {selectedInquiry.userNickname ?? selectedInquiry.userName}
                                    </p>
                                    <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.06)" }} />
                                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "#3a3a3c" }}>{selectedInquiry.content}</p>
                                </div>

                                {/* 답변 스레드 */}
                                {inquiryDetailLoading ? (
                                    <div className="flex items-center gap-2 py-4" style={{ color: "#8e8e93" }}>
                                        <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />
                                        <span className="text-[13px]">불러오는 중...</span>
                                    </div>
                                ) : (selectedInquiry.replies && selectedInquiry.replies.length > 0) && (
                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-[13px] font-bold" style={{ color: "#8e8e93" }}>답변 스레드</h3>
                                        {selectedInquiry.replies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className={`rounded-[16px] px-5 py-4 flex flex-col gap-2 ${reply.isAdmin ? "" : "ml-6"}`}
                                                style={{
                                                    background: reply.isAdmin ? "rgba(255,149,0,0.07)" : "rgba(74,123,247,0.07)",
                                                    border: `1px solid ${reply.isAdmin ? "rgba(255,149,0,0.2)" : "rgba(74,123,247,0.15)"}`,
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                                                            style={{ background: reply.isAdmin ? "rgba(255,149,0,0.2)" : "rgba(74,123,247,0.15)", color: reply.isAdmin ? "#c97000" : "#4A7BF7" }}
                                                        >
                                                            {reply.isAdmin ? "관" : "유"}
                                                        </div>
                                                        <span className="text-[12px] font-semibold" style={{ color: reply.isAdmin ? "#c97000" : "#4A7BF7" }}>
                                                            {reply.isAdmin ? "카꾸미 고객센터" : reply.author.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px]" style={{ color: "#8e8e93" }}>{formatKST(reply.createdAt)}</span>
                                                </div>
                                                <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "#3a3a3c" }}>{reply.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 답변 작성 */}
                                <div className="rounded-[20px] p-6 flex flex-col gap-3" style={CARD_BG}>
                                    <h3 className="text-[13px] font-bold" style={{ color: "#1c1c1e" }}>답변 작성</h3>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="사용자에게 보낼 답변을 입력하세요..."
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl text-[13px] outline-none resize-none"
                                        style={{ border: "1.5px solid rgba(0,0,0,0.12)", color: "#1c1c1e" }}
                                    />
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={sendReply}
                                            disabled={!replyText.trim() || actionLoading}
                                            className="px-6 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40 transition-all hover:brightness-105"
                                            style={{ background: "#FF9500", color: "#fff" }}
                                        >
                                            {actionLoading ? "전송 중..." : "답변 전송"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ── 목록 뷰 ── */
                            <div className="rounded-[20px] overflow-hidden" style={CARD_BG}>
                                <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                                    <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>1:1 문의 ({inquiries.length}건)</h3>
                                </div>
                                <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                                    {inquiries.map((inq) => (
                                        <button
                                            key={inq.id}
                                            onClick={() => fetchInquiryDetail(inq)}
                                            className="w-full px-6 py-4 flex items-center gap-4 text-left transition-all hover:bg-black/[0.02]"
                                        >
                                            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-semibold truncate" style={{ color: "#1c1c1e" }}>{inq.title}</span>
                                                    <Badge style={INQUIRY_STATUS_STYLE[inq.status] ?? { label: inq.status, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                                </div>
                                                <span className="text-[11px]" style={{ color: "#8e8e93" }}>
                                                    {inq.userNickname ?? inq.userName} · {inq.category} · 답변 {inq.replyCount}개 · {formatKST(inq.createdAt, false)}
                                                </span>
                                            </div>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                                <path d="M9 18l6-6-6-6" />
                                            </svg>
                                        </button>
                                    ))}
                                    {!loading && inquiries.length === 0 && <div className="px-6 py-10 text-center text-[13px]" style={{ color: "#8e8e93" }}>문의가 없습니다.</div>}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* ── 모달: 테마 반려 ──────────────── */}
            {rejectModal && (
                <ModalOverlay onClose={() => setRejectModal(null)}>
                    <div className="w-[440px] rounded-[24px] p-7 flex flex-col gap-5" style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                        <h3 className="text-[16px] font-bold" style={{ color: "#1c1c1e" }}>테마 반려</h3>
                        <p className="text-[13px]" style={{ color: "#3a3a3c" }}>
                            <b>{rejectModal.title}</b> 테마를 반려합니다. 반려 사유를 입력해주세요.
                        </p>
                        <textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder="반려 사유를 입력하세요..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl text-[13px] outline-none resize-none"
                            style={{ border: "1.5px solid rgba(0,0,0,0.12)", color: "#1c1c1e" }}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}>취소</button>
                            <button
                                onClick={async () => {
                                    await themeAction(rejectModal.themeId, "reject", rejectNote);
                                    setRejectModal(null);
                                    setRejectNote("");
                                }}
                                disabled={!rejectNote.trim() || actionLoading}
                                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
                                style={{ background: "#ff3b30", color: "#fff" }}>
                                반려하기
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* ── 모달: 유저 탈퇴 ──────────────── */}
            {deleteUserModal && (
                <ModalOverlay onClose={() => setDeleteUserModal(null)}>
                    <div className="w-[400px] rounded-[24px] p-7 flex flex-col gap-5" style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                        <h3 className="text-[16px] font-bold" style={{ color: "#ff3b30" }}>회원 탈퇴 처리</h3>
                        <p className="text-[13px]" style={{ color: "#3a3a3c" }}>
                            <b>{deleteUserModal.name}</b> 회원을 탈퇴 처리합니다.<br />모든 데이터가 삭제되며 복구할 수 없습니다.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteUserModal(null)} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}>취소</button>
                            <button onClick={() => userAction(deleteUserModal.userId, "delete")} disabled={actionLoading}
                                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
                                style={{ background: "#ff3b30", color: "#fff" }}>탈퇴 처리</button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

        </div>
    );
}

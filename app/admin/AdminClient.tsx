"use client";

import { useState, useEffect, useCallback } from "react";
import { formatKST } from "@/lib/date";

// ── 타입 ──────────────────────────────────────────
type Stats = { userCount: number; themeCount: number; purchaseCount: number; inquiryCount: number };
type AdminTheme = {
    id: string; title: string; description: string | null; price: number;
    status: string; adminNote: string | null; createdAt: string;
    creatorNickname: string | null; creatorName: string;
    thumbnailUrl: string | null; images: string[]; tags: string[];
    versions: { version: string; kthemeFileUrl: string | null; apkFileUrl: string | null }[];
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
    const [inquirySearch, setInquirySearch] = useState("");
    const [inquirySearchType, setInquirySearchType] = useState<"전체" | "제목" | "작성자" | "내용">("전체");
    // 답변 수정 상태
    const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
    const [editingReplyText, setEditingReplyText] = useState("");

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

    const updateReply = async (replyId: string) => {
        if (!selectedInquiry || !editingReplyText.trim()) return;
        setActionLoading(true);
        await fetch(`/api/inquiry/${selectedInquiry.id}/reply/${replyId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: editingReplyText.trim() }),
        });
        setActionLoading(false);
        setEditingReplyId(null);
        setEditingReplyText("");
        showToast("답변 수정 완료");
        const r = await fetch(`/api/admin/inquiries?id=${selectedInquiry.id}`);
        const d = await r.json() as { inquiry: AdminInquiry };
        if (d.inquiry) setSelectedInquiry(d.inquiry);
    };

    const deleteReply = async (replyId: string) => {
        if (!selectedInquiry) return;
        if (!confirm("이 답변을 삭제하시겠습니까?")) return;
        setActionLoading(true);
        await fetch(`/api/inquiry/${selectedInquiry.id}/reply/${replyId}`, { method: "DELETE" });
        setActionLoading(false);
        showToast("답변 삭제 완료");
        const r = await fetch(`/api/admin/inquiries?id=${selectedInquiry.id}`);
        const d = await r.json() as { inquiry: AdminInquiry };
        if (d.inquiry) setSelectedInquiry(d.inquiry);
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
                                onClick={() => {
                                    setActiveTab(item.key);
                                    if (item.key === "inquiries") {
                                        setSelectedInquiry(null);
                                        setReplyText("");
                                    }
                                }}
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
                    <ThemeManageTab
                        themes={themes}
                        loading={loading}
                        actionLoading={actionLoading}
                        onApprove={(id) => themeAction(id, "approve")}
                        onReject={(id, title) => setRejectModal({ themeId: id, title })}
                    />
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
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px]" style={{ color: "#8e8e93" }}>{formatKST(reply.createdAt)}</span>
                                                        {reply.isAdmin && editingReplyId !== reply.id && (
                                                            <>
                                                                <button
                                                                    onClick={() => { setEditingReplyId(reply.id); setEditingReplyText(reply.content); }}
                                                                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md transition-all hover:opacity-70"
                                                                    style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}
                                                                >수정</button>
                                                                <button
                                                                    onClick={() => deleteReply(reply.id)}
                                                                    disabled={actionLoading}
                                                                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md transition-all hover:opacity-70 disabled:opacity-40"
                                                                    style={{ background: "rgba(255,59,48,0.10)", color: "#ff3b30" }}
                                                                >삭제</button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {editingReplyId === reply.id ? (
                                                    <div className="flex flex-col gap-2 mt-1">
                                                        <textarea
                                                            value={editingReplyText}
                                                            onChange={(e) => setEditingReplyText(e.target.value)}
                                                            rows={3}
                                                            className="w-full px-3 py-2 rounded-xl text-[13px] outline-none resize-none"
                                                            style={{ border: "1.5px solid rgba(255,149,0,0.4)", color: "#1c1c1e", background: "#fff" }}
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => { setEditingReplyId(null); setEditingReplyText(""); }}
                                                                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                                                                style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}
                                                            >취소</button>
                                                            <button
                                                                onClick={() => updateReply(reply.id)}
                                                                disabled={!editingReplyText.trim() || actionLoading}
                                                                className="px-3 py-1.5 rounded-lg text-[12px] font-bold disabled:opacity-40"
                                                                style={{ background: "#FF9500", color: "#fff" }}
                                                            >{actionLoading ? "저장 중..." : "저장"}</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "#3a3a3c" }}>{reply.content}</p>
                                                )}
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
                            <div className="flex flex-col gap-4">
                                {/* 검색바 */}
                                <div
                                    className="flex items-center p-1 gap-1.5"
                                    style={{ background: "#dde4ee", borderRadius: 999, maxWidth: 480 }}
                                >
                                    {/* 드롭다운 */}
                                    <div className="relative shrink-0">
                                        <select
                                            value={inquirySearchType}
                                            onChange={(e) => setInquirySearchType(e.target.value as "전체" | "제목" | "작성자" | "내용")}
                                            className="appearance-none pl-3 pr-7 text-[12px] font-bold outline-none cursor-pointer"
                                            style={{ background: "transparent", color: "#1c1c1e", border: "none", height: 34 }}
                                        >
                                            {(["전체", "제목", "작성자", "내용"] as const).map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                        <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>

                                    {/* 구분선 */}
                                    <div className="w-[1px] h-4 shrink-0" style={{ background: "rgba(0,0,0,0.15)" }} />

                                    {/* 입력창 */}
                                    <div className="flex-1 flex items-center px-3" style={{ background: "#fff", borderRadius: 999, height: 34 }}>
                                        <input
                                            type="text"
                                            value={inquirySearch}
                                            onChange={(e) => setInquirySearch(e.target.value)}
                                            placeholder={
                                                inquirySearchType === "작성자" ? "작성자 이름을 검색하세요" :
                                                inquirySearchType === "제목" ? "제목을 검색하세요" :
                                                inquirySearchType === "내용" ? "문의 내용 또는 답변을 검색하세요" :
                                                "제목, 작성자, 내용 검색"
                                            }
                                            className="flex-1 text-[13px] outline-none bg-transparent"
                                            style={{ color: "#1c1c1e" }}
                                        />
                                        {inquirySearch && (
                                            <button
                                                type="button"
                                                onClick={() => setInquirySearch("")}
                                                className="ml-1 shrink-0 flex items-center justify-center w-5 h-5 rounded-full transition-all hover:opacity-70"
                                                style={{ background: "rgba(0,0,0,0.1)" }}
                                            >
                                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* 목록 */}
                                <div className="rounded-[20px] overflow-hidden" style={CARD_BG}>
                                    <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                                        <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>
                                            1:1 문의 ({inquiries.filter((inq) => {
                                                const q = inquirySearch.trim().toLowerCase();
                                                if (!q) return true;
                                                const author = (inq.userNickname ?? inq.userName).toLowerCase();
                                                const title = inq.title.toLowerCase();
                                                const content = (inq.content ?? "").toLowerCase();
                                                const replyTexts = (inq.replies ?? []).map(r => r.content.toLowerCase()).join(" ");
                                                if (inquirySearchType === "작성자") return author.includes(q);
                                                if (inquirySearchType === "제목") return title.includes(q);
                                                if (inquirySearchType === "내용") return content.includes(q) || replyTexts.includes(q);
                                                return author.includes(q) || title.includes(q) || content.includes(q) || replyTexts.includes(q);
                                            }).length}건)
                                        </h3>
                                    </div>
                                    <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                                        {(() => {
                                            const q = inquirySearch.trim().toLowerCase();
                                            const filtered = inquiries.filter((inq) => {
                                                if (!q) return true;
                                                const author = (inq.userNickname ?? inq.userName).toLowerCase();
                                                const title = inq.title.toLowerCase();
                                                const content = (inq.content ?? "").toLowerCase();
                                                const replyTexts = (inq.replies ?? []).map(r => r.content.toLowerCase()).join(" ");
                                                if (inquirySearchType === "작성자") return author.includes(q);
                                                if (inquirySearchType === "제목") return title.includes(q);
                                                if (inquirySearchType === "내용") return content.includes(q) || replyTexts.includes(q);
                                                return author.includes(q) || title.includes(q) || content.includes(q) || replyTexts.includes(q);
                                            });
                                            if (filtered.length === 0) return (
                                                <div className="px-6 py-10 text-center text-[13px]" style={{ color: "#8e8e93" }}>
                                                    {q ? `'${inquirySearch}'에 대한 검색 결과가 없습니다.` : "문의가 없습니다."}
                                                </div>
                                            );
                                            return filtered.map((inq) => (
                                                <button
                                                    key={inq.id}
                                                    onClick={() => fetchInquiryDetail(inq)}
                                                    className="w-full px-6 py-4 flex items-center gap-4 text-left transition-all hover:bg-black/[0.02]"
                                                >
                                                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <Badge style={INQUIRY_STATUS_STYLE[inq.status] ?? { label: inq.status, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                                            <span className="text-[13px] font-semibold truncate" style={{ color: "#1c1c1e" }}>{inq.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[11px] font-medium" style={{ color: "#3a3a3c" }}>
                                                                {inq.userNickname ?? inq.userName}
                                                            </span>
                                                            <span className="text-[11px]" style={{ color: "#c7c7cc" }}>·</span>
                                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>{inq.category}</span>
                                                            <span className="text-[11px]" style={{ color: "#c7c7cc" }}>·</span>
                                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>답변 {inq.replyCount}개</span>
                                                            <span className="text-[11px]" style={{ color: "#c7c7cc" }}>·</span>
                                                            <span className="text-[11px]" style={{ color: "#8e8e93" }}>{formatKST(inq.createdAt, false)}</span>
                                                        </div>
                                                    </div>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                                        <path d="M9 18l6-6-6-6" />
                                                    </svg>
                                                </button>
                                            ));
                                        })()}
                                    </div>
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

// ── 테마 관리 탭 ──────────────────────────────────────────────────────────────
function ThemeManageTab({
    themes,
    loading,
    actionLoading,
    onApprove,
    onReject,
}: {
    themes: AdminTheme[];
    loading: boolean;
    actionLoading: boolean;
    onApprove: (id: string) => void;
    onReject: (id: string, title: string) => void;
}) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // DRAFT(승인 대기) 만 표시
    const draftThemes = themes.filter((t) => t.status === "DRAFT");

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-[20px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>테마 관리</h2>
                <p className="text-[12px] mt-0.5" style={{ color: "#8e8e93" }}>등록 신청된 테마를 검토하고 승인 또는 반려합니다.</p>
            </div>
            <div className="rounded-[20px] overflow-hidden" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                    <h3 className="text-[14px] font-bold" style={{ color: "#1c1c1e" }}>
                        승인 대기 중
                        <span className="ml-2 text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,149,0,0.12)", color: "#c97000" }}>
                            {draftThemes.length}건
                        </span>
                    </h3>
                    {loading && <span className="text-[12px]" style={{ color: "#8e8e93" }}>로딩 중...</span>}
                </div>
                <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                    {draftThemes.map((t) => {
                        const isOpen = expandedId === t.id;
                        return (
                            <div key={t.id}>
                                {/* 행 헤더 - 클릭으로 펼치기 */}
                                <button
                                    type="button"
                                    onClick={() => setExpandedId(isOpen ? null : t.id)}
                                    className="w-full text-left px-6 py-4 flex items-center gap-4 transition-all hover:bg-black/[0.02]"
                                >
                                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[13px] font-semibold truncate" style={{ color: "#1c1c1e" }}>{t.title}</span>
                                            <span className="shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(255,149,0,0.12)", color: "#c97000" }}>승인 대기</span>
                                        </div>
                                        <span className="text-[11px]" style={{ color: "#8e8e93" }}>
                                            제작자: {t.creatorNickname ?? t.creatorName} · {t.price === 0 ? "무료" : `${t.price.toLocaleString()}원`} · {formatKST(t.createdAt, false)}
                                        </span>
                                        {t.adminNote && (
                                            <span className="text-[11px]" style={{ color: "#ff3b30" }}>이전 반려 사유: {t.adminNote}</span>
                                        )}
                                    </div>
                                    {/* 화살표 */}
                                    <svg
                                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
                                    >
                                        <path d="M6 9l6 6 6-6"/>
                                    </svg>
                                </button>

                                {/* 펼쳐진 상세 */}
                                {isOpen && (
                                    <div className="px-6 pb-5 flex flex-col gap-4" style={{ background: "rgba(0,0,0,0.015)" }}>
                                        <div className="h-px" style={{ background: "rgba(0,0,0,0.06)" }} />

                                        {/* 이미지 미리보기 */}
                                        {(t.thumbnailUrl || (t.images && t.images.length > 0)) && (
                                            <div className="flex gap-3 flex-wrap">
                                                {t.thumbnailUrl && (
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <img
                                                            src={t.thumbnailUrl}
                                                            alt="대표 이미지"
                                                            className="w-[120px] h-[120px] rounded-xl object-cover"
                                                            style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                                                        />
                                                        <span className="text-[10px]" style={{ color: "#8e8e93" }}>대표 이미지</span>
                                                    </div>
                                                )}
                                                {t.images && t.images.length > 0 && t.images.map((img, idx) => (
                                                    <div key={idx} className="flex flex-col gap-1 items-center">
                                                        <img
                                                            src={img}
                                                            alt={`프리뷰 ${idx + 1}`}
                                                            className="w-[80px] h-[80px] rounded-xl object-cover"
                                                            style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                                                        />
                                                        <span className="text-[10px]" style={{ color: "#8e8e93" }}>프리뷰 {idx + 1}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* 테마 정보 */}
                                        <div className="flex flex-col gap-3">
                                            <div className="grid grid-cols-3 gap-3 text-[12px]">
                                                <div className="rounded-xl p-3 flex flex-col gap-1" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
                                                    <span style={{ color: "#8e8e93" }}>테마 이름</span>
                                                    <span className="font-semibold" style={{ color: "#1c1c1e" }}>{t.title}</span>
                                                </div>
                                                <div className="rounded-xl p-3 flex flex-col gap-1" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
                                                    <span style={{ color: "#8e8e93" }}>가격</span>
                                                    <span className="font-semibold" style={{ color: "#1c1c1e" }}>{t.price === 0 ? "무료" : `${t.price.toLocaleString()}원`}</span>
                                                </div>
                                                <div className="rounded-xl p-3 flex flex-col gap-1" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
                                                    <span style={{ color: "#8e8e93" }}>제작자</span>
                                                    <span className="font-semibold" style={{ color: "#1c1c1e" }}>{t.creatorNickname ?? t.creatorName}</span>
                                                </div>
                                            </div>

                                            {t.tags && t.tags.length > 0 && (
                                                <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
                                                    <span className="text-[11px]" style={{ color: "#8e8e93" }}>카테고리</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {t.tags.map((tag) => (
                                                            <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.08)", color: "#1c1c1e" }}>{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {t.description && (
                                                <div className="rounded-xl p-4 flex flex-col gap-1" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
                                                    <span className="text-[11px]" style={{ color: "#8e8e93" }}>테마 설명</span>
                                                    <p className="text-[13px] leading-relaxed" style={{ color: "#1c1c1e" }}>{t.description}</p>
                                                </div>
                                            )}

                                            <div className="rounded-xl p-3 flex flex-col gap-1" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
                                                <span className="text-[11px]" style={{ color: "#8e8e93" }}>신청일</span>
                                                <span className="text-[12px] font-semibold" style={{ color: "#1c1c1e" }}>{formatKST(t.createdAt, true)}</span>
                                            </div>

                                            {/* 테마 파일 옵션 */}
                                            {t.versions && t.versions.length > 0 && (
                                                <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
                                                    <span className="text-[11px]" style={{ color: "#8e8e93" }}>첨부 파일 ({t.versions.length}개 옵션)</span>
                                                    <div className="flex flex-col gap-3">
                                                        {t.versions.map((v, vi) => (
                                                            <div key={vi} className="flex flex-col gap-1.5">
                                                                <span className="text-[11px] font-bold" style={{ color: "#1c1c1e" }}>
                                                                    옵션 {vi + 1}: {v.version}
                                                                </span>
                                                                {v.kthemeFileUrl && (
                                                                    <div className="flex items-center gap-2 pl-2">
                                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0" style={{ background: "rgba(255,149,0,0.12)", color: "#c97000" }}>iOS · PC</span>
                                                                        <a href={v.kthemeFileUrl} download target="_blank" rel="noopener noreferrer"
                                                                            className="text-[12px] font-medium truncate underline hover:opacity-70 transition-all"
                                                                            style={{ color: "#007aff" }}>
                                                                            {v.kthemeFileUrl.split("/").pop()}
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {v.apkFileUrl && (
                                                                    <div className="flex items-center gap-2 pl-2">
                                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0" style={{ background: "rgba(52,199,89,0.12)", color: "#1a7a3a" }}>Android</span>
                                                                        <a href={v.apkFileUrl} download target="_blank" rel="noopener noreferrer"
                                                                            className="text-[12px] font-medium truncate underline hover:opacity-70 transition-all"
                                                                            style={{ color: "#007aff" }}>
                                                                            {v.apkFileUrl.split("/").pop()}
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 액션 버튼 */}
                                        <div className="flex gap-3 pt-1">
                                            <button
                                                onClick={() => onApprove(t.id)}
                                                disabled={actionLoading}
                                                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 disabled:opacity-40"
                                                style={{ background: "rgba(52,199,89,0.15)", color: "#1a7a3a" }}
                                            >
                                                ✓ 승인
                                            </button>
                                            <button
                                                onClick={() => onReject(t.id, t.title)}
                                                disabled={actionLoading}
                                                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 disabled:opacity-40"
                                                style={{ background: "rgba(255,59,48,0.10)", color: "#ff3b30" }}
                                            >
                                                ✕ 반려
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {!loading && draftThemes.length === 0 && (
                        <div className="px-6 py-14 flex flex-col items-center gap-2">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>
                            </svg>
                            <p className="text-[13px]" style={{ color: "#8e8e93" }}>승인 대기 중인 테마가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}










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
    contentBlocks: string | null;
    versions: { version: string; kthemeFileUrl: string | null; apkFileUrl: string | null }[];
    options: { id: string; os: string; name: string; status: string; fileUrl: string | null; myThemeId: string | null }[];
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
type AdminApplication = {
    id: string; status: string; reason: string; portfolio: string | null;
    adminNote: string | null; createdAt: string;
    userId: string; userNickname: string | null; userName: string; userEmail: string | null;
};
type AdminMailbox = {
    id: string; type: "SUGGESTION" | "BUG_REPORT"; title: string; content: string;
    status: "PENDING" | "REVIEWED"; adminNote: string | null; createdAt: string;
    userNickname: string | null; userName: string;
};
type AdminGalleryReport = {
    id: string; isHandled: boolean; createdAt: string;
    commentId: string; commentContent: string; commentIsDeleted: boolean;
    postId: string; postThemeName: string;
    reporterNickname: string | null; reporterName: string;
};

type Tab = "overview" | "themes" | "users" | "reports" | "sales" | "inquiries" | "applications" | "mailbox" | "gallery_reports";
type Props = {
    stats: Stats;
    recentUsers: AdminUser[];
    recentPurchases: AdminPurchase[];
};

// ── 스타일 상수 ──────────────────────────────────
const ROLE_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    ADMIN:   { label: "관리자",    bg: "rgba(255,59,48,0.10)",  color: "#ff3b30" },
    CREATOR: { label: "크리에이터", bg: "rgba(255,149,0,0.10)", color: "#c97000" },
    USER:    { label: "일반 회원",  bg: "rgba(74,123,247,0.10)", color: "rgb(74,123,247)" },
};
const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    COMPLETED: { label: "결제 완료", bg: "rgba(52,199,89,0.10)",  color: "#1a7a3a" },
    PENDING:   { label: "대기 중",   bg: "rgba(255,149,0,0.10)", color: "#c97000" },
    REFUNDED:  { label: "환불",      bg: "rgba(255,59,48,0.10)", color: "#ff3b30" },
};
const THEME_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    PUBLISHED: { label: "공개",    bg: "rgba(52,199,89,0.10)",  color: "#1a7a3a" },
    DRAFT:     { label: "대기 중", bg: "rgba(255,149,0,0.10)", color: "#c97000" },
    HIDDEN:    { label: "숨김",    bg: "rgba(0,0,0,0.07)",      color: "#8e8e93" },
};
const REPORT_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    PENDING:   { label: "처리 대기", bg: "rgba(255,149,0,0.10)", color: "#c97000" },
    RESOLVED:  { label: "처리 완료", bg: "rgba(52,199,89,0.10)", color: "#1a7a3a" },
    DISMISSED: { label: "기각",      bg: "rgba(0,0,0,0.07)",     color: "#8e8e93" },
};
const INQUIRY_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    OPEN:     { label: "답변 대기", bg: "rgba(255,149,0,0.10)", color: "#c97000" },
    ANSWERED: { label: "답변 완료", bg: "rgba(52,199,89,0.10)", color: "#1a7a3a" },
    CLOSED:   { label: "처리 완료", bg: "rgba(0,0,0,0.07)",     color: "#8e8e93" },
};

// ── 사이드바 메뉴 ─────────────────────────────────
const SIDEBAR_GROUPS: { category: string; items: { key: Tab; label: string }[] }[] = [
    {
        category: "개요",
        items: [{ key: "overview", label: "대시보드" }],
    },
    {
        category: "콘텐츠",
        items: [
            { key: "themes",       label: "테마 관리" },
            { key: "applications", label: "입점 신청" },
            { key: "reports",      label: "신고 관리" },
        ],
    },
    {
        category: "회원",
        items: [{ key: "users", label: "회원 관리" }],
    },
    {
        category: "정산",
        items: [{ key: "sales", label: "매출 / 정산" }],
    },
    {
        category: "지원",
        items: [
            { key: "inquiries",      label: "1:1 문의" },
            { key: "mailbox",        label: "우체통" },
            { key: "gallery_reports", label: "갤러리 신고" },
        ],
    },
];

// ── 공통 컴포넌트 ─────────────────────────────────
function Badge({ style }: { style: { label: string; bg: string; color: string } }) {
    return (
        <span
            className="shrink-0 inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md"
            style={{ background: style.bg, color: style.color }}
        >
            {style.label}
        </span>
    );
}

function SectionHeader({ title, count, action }: { title: string; count?: number; action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <div className="flex items-center gap-3">
                <h2 className="text-[15px] font-semibold" style={{ color: "#1c1c1e" }}>{title}</h2>
                {count !== undefined && (
                    <span className="text-[12px]" style={{ color: "#aeaeb2" }}>{count.toLocaleString()}</span>
                )}
            </div>
            {action}
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="flex items-center justify-center py-16">
            <span className="text-[13px]" style={{ color: "#c7c7cc" }}>{text}</span>
        </div>
    );
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
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
    const [applications, setApplications] = useState<AdminApplication[]>([]);
    const [mailboxes, setMailboxes] = useState<AdminMailbox[]>([]);
    const [galleryReports, setGalleryReports] = useState<AdminGalleryReport[]>([]);
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
            } else if (tab === "applications") {
                const r = await fetch("/api/admin/applications");
                const d = await r.json() as { applications: AdminApplication[] };
                setApplications(d.applications ?? []);
            } else if (tab === "mailbox") {
                const r = await fetch("/api/admin/mailbox");
                const d = await r.json() as { mailboxes: AdminMailbox[] };
                setMailboxes(d.mailboxes ?? []);
            } else if (tab === "gallery_reports") {
                const r = await fetch("/api/admin/gallery-reports");
                const d = await r.json() as { reports: AdminGalleryReport[] };
                setGalleryReports(d.reports ?? []);
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
    const applicationAction = async (applicationId: string, action: "APPROVED" | "REJECTED", adminNote?: string) => {
        setActionLoading(true);
        await fetch("/api/admin/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicationId, action, adminNote }) });
        setActionLoading(false);
        showToast(action === "APPROVED" ? "승인 완료" : "반려 완료");
        fetchTab("applications");
    };
    const purchaseAction = async (purchaseId: string, action: string) => {
        setActionLoading(true);
        await fetch("/api/admin/sales", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchaseId, action }) });
        setActionLoading(false);
        showToast("처리 완료");
        fetchTab("sales");
    };
    const mailboxAction = async (mailboxId: string, status: "PENDING" | "REVIEWED", adminNote?: string) => {
        setActionLoading(true);
        await fetch("/api/admin/mailbox", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mailboxId, status, adminNote }) });
        setActionLoading(false);
        showToast("처리 완료");
        fetchTab("mailbox");
    };
    const galleryReportAction = async (reportId: string, action: "handle" | "delete_comment", commentId?: string) => {
        setActionLoading(true);
        await fetch("/api/admin/gallery-reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId, action, commentId }) });
        setActionLoading(false);
        showToast("처리 완료");
        fetchTab("gallery_reports");
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
        await fetch("/api/admin/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inquiryId: selectedInquiry.id, content: replyText.trim() }) });
        setActionLoading(false);
        showToast("답변 전송 완료");
        setReplyText("");
        const r = await fetch(`/api/admin/inquiries?id=${selectedInquiry.id}`);
        const d = await r.json() as { inquiry: AdminInquiry };
        if (d.inquiry) setSelectedInquiry(d.inquiry);
        fetchTab("inquiries");
    };
    const updateReply = async (replyId: string) => {
        if (!selectedInquiry || !editingReplyText.trim()) return;
        setActionLoading(true);
        await fetch(`/api/inquiry/${selectedInquiry.id}/reply/${replyId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: editingReplyText.trim() }) });
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
        { label: "전체 회원",  value: stats.userCount,     color: "rgb(74,123,247)" },
        { label: "등록 테마",  value: stats.themeCount,    color: "rgb(255,149,0)"  },
        { label: "완료 구매",  value: stats.purchaseCount, color: "#34c759"         },
        { label: "문의 요청",  value: stats.inquiryCount,  color: "#af52de"         },
    ];

    return (
        <div className="flex flex-1 max-w-[1300px] mx-auto w-full pb-20">
            {/* 토스트 */}
            {toast && (
                <div
                    className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-[13px] font-medium shadow-md"
                    style={{ background: "#18181b", color: "#fff", letterSpacing: "-0.01em" }}
                >
                    {toast}
                </div>
            )}

            {/* ── 사이드바 ── */}
            <aside className="fixed w-[160px] flex flex-col gap-1 px-5 pt-12">
                {SIDEBAR_GROUPS.map((group, index) => (
                    <div key={group.category} className="flex flex-col gap-0.5">
                        <span className="text-[10.5px] font-bold tracking-[0.15em] uppercase px-2 mb-1" style={{ color: "#8e8e93" }}>
                            {group.category}
                        </span>
                        {group.items.map((item) => {
                            const isActive = activeTab === item.key;
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => {
                                        setActiveTab(item.key);
                                        if (item.key === "inquiries") { setSelectedInquiry(null); setReplyText(""); }
                                    }}
                                    className="text-left px-2 py-[7px] rounded-xl text-[12.5px] font-medium transition-all"
                                    style={{ color: isActive ? "#FF9500" : "#3a3a3c", fontWeight: isActive ? 700 : 500 }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                        {index < SIDEBAR_GROUPS.length - 1 && (
                            <div className="my-2.5 h-[1px]" style={{ background: "rgba(0,0,0,0.18)" }} />
                        )}
                    </div>
                ))}
            </aside>

            {/* ── 콘텐츠 ── */}
            <div className="flex-1 min-w-0 pt-10 pl-10 flex flex-col gap-8" style={{ marginLeft: 200 }}>

                {/* ───────── 대시보드 ───────── */}
                {activeTab === "overview" && (
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>대시보드</h1>
                            <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>카꾸미 서비스 전체 현황</p>
                        </div>

                        {/* 스탯 */}
                        <div className="grid grid-cols-4 gap-px" style={{ background: "rgba(0,0,0,0.07)" }}>
                            {STAT_CARDS.map((card) => (
                                <div key={card.label} className="flex flex-col gap-1 px-6 py-5" style={{ background: "var(--bg, #fff)" }}>
                                    <p className="text-[11px] font-medium" style={{ color: "#aeaeb2" }}>{card.label}</p>
                                    <p className="text-[28px] font-bold tracking-tight" style={{ color: card.color, lineHeight: 1.1 }}>
                                        {card.value.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* 최근 데이터 */}
                        <div className="grid grid-cols-2 gap-10">
                            <div className="flex flex-col gap-3">
                                <SectionHeader title="최근 가입 회원" count={recentUsers.length} />
                                {recentUsers.slice(0, 5).map((u) => (
                                    <div key={u.id} className="flex items-center justify-between py-1">
                                        <div>
                                            <p className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>{u.nickname ?? u.name}</p>
                                            <p className="text-[11px]" style={{ color: "#aeaeb2" }}>{formatKST(u.createdAt, false)}</p>
                                        </div>
                                        <Badge style={ROLE_STYLE[u.role] ?? { label: u.role, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-3">
                                <SectionHeader title="최근 구매" count={recentPurchases.length} />
                                {recentPurchases.slice(0, 5).map((p) => (
                                    <div key={p.id} className="flex items-center justify-between py-1">
                                        <div>
                                            <p className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>{p.themeTitle}</p>
                                            <p className="text-[11px]" style={{ color: "#aeaeb2" }}>{p.buyerNickname ?? p.buyerName} · {formatKST(p.createdAt, false)}</p>
                                        </div>
                                        <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{p.amount.toLocaleString()}원</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ───────── 테마 관리 ───────── */}
                {activeTab === "themes" && (
                    <ThemeManageTab
                        themes={themes}
                        loading={loading}
                        actionLoading={actionLoading}
                        onApprove={(id) => themeAction(id, "approve")}
                        onReject={(id, title) => setRejectModal({ themeId: id, title })}
                    />
                )}

                {/* ───────── 회원 관리 ───────── */}
                {activeTab === "users" && (
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>회원 관리</h1>
                            <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>전체 회원 목록 및 정지 · 탈퇴 처리</p>
                        </div>
                        <SectionHeader title="전체 회원" count={users.length} />
                        {loading
                            ? <EmptyState text="불러오는 중..." />
                            : users.length === 0
                            ? <EmptyState text="회원이 없습니다." />
                            : users.map((u) => (
                                <div
                                    key={u.id}
                                    className="flex items-center gap-4 py-3"
                                    style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>{u.nickname ?? u.name}</span>
                                            <Badge style={ROLE_STYLE[u.role] ?? { label: u.role, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                            {u.isSuspended && <Badge style={{ label: "정지", bg: "rgba(255,59,48,0.10)", color: "#ff3b30" }} />}
                                        </div>
                                        <p className="text-[11px]" style={{ color: "#aeaeb2" }}>
                                            {u.email ?? "이메일 없음"} · 가입 {formatKST(u.createdAt, false)} · 구매 {u.purchaseCount}건
                                        </p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {!u.isSuspended
                                            ? <button onClick={() => userAction(u.id, "suspend")} disabled={actionLoading || u.role === "ADMIN"} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-30" style={{ background: "rgba(255,149,0,0.08)", color: "#c97000" }}>정지</button>
                                            : <button onClick={() => userAction(u.id, "unsuspend")} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(52,199,89,0.08)", color: "#1a7a3a" }}>해제</button>
                                        }
                                        <button onClick={() => setDeleteUserModal({ userId: u.id, name: u.nickname ?? u.name })} disabled={u.role === "ADMIN"} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-30" style={{ background: "rgba(255,59,48,0.07)", color: "#ff3b30" }}>탈퇴</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}

                {/* ───────── 신고 관리 ───────── */}
                {activeTab === "reports" && (
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>신고 관리</h1>
                            <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>접수된 신고를 처리하고 테마를 숨김 처리합니다.</p>
                        </div>
                        <SectionHeader title="신고 목록" count={reports.length} />
                        {loading
                            ? <EmptyState text="불러오는 중..." />
                            : reports.length === 0
                            ? <EmptyState text="신고 내역이 없습니다." />
                            : reports.map((r) => (
                                <div key={r.id} className="flex items-start gap-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            <span className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>{r.themeTitle}</span>
                                            <Badge style={REPORT_STATUS_STYLE[r.status] ?? { label: r.status, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                            <Badge style={THEME_STATUS_STYLE[r.themeStatus] ?? { label: r.themeStatus, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                        </div>
                                        <p className="text-[11px]" style={{ color: "#aeaeb2" }}>
                                            신고자: {r.reporterNickname ?? r.reporterName} · 사유: {r.reason} · {formatKST(r.createdAt, false)}
                                        </p>
                                        {r.detail && <p className="text-[11px] mt-0.5" style={{ color: "#6e6e73" }}>{r.detail}</p>}
                                    </div>
                                    {r.status === "PENDING" && (
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => reportAction(r.id, "hide_theme", r.themeId)} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(255,59,48,0.07)", color: "#ff3b30" }}>숨김</button>
                                            <button onClick={() => reportAction(r.id, "resolve")} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(52,199,89,0.08)", color: "#1a7a3a" }}>완료</button>
                                            <button onClick={() => reportAction(r.id, "dismiss")} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(0,0,0,0.05)", color: "#8e8e93" }}>기각</button>
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                )}

                {/* ───────── 매출/정산 ───────── */}
                {activeTab === "sales" && (
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>매출 / 정산</h1>
                            <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>전체 결제 내역과 크리에이터별 정산을 관리합니다.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <SectionHeader title="크리에이터별 정산" count={settlements.length} />
                            <p className="text-[11px] -mt-2" style={{ color: "#aeaeb2" }}>수수료 20% 제외 후 지급액</p>
                            {loading
                                ? <EmptyState text="불러오는 중..." />
                                : settlements.length === 0
                                ? <EmptyState text="정산 내역이 없습니다." />
                                : settlements.map((s) => (
                                    <div key={s.creatorId} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                        <div>
                                            <p className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>{s.creatorNickname ?? s.creatorName}</p>
                                            <p className="text-[11px]" style={{ color: "#aeaeb2" }}>판매 {s.totalSales}건 · 총 {s.totalAmount.toLocaleString()}원</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[14px] font-bold" style={{ color: "rgb(255,149,0)" }}>{s.settlementAmount.toLocaleString()}원</span>
                                            <Badge style={{ label: "정산 예정", bg: "rgba(255,149,0,0.10)", color: "#c97000" }} />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>

                        <div className="flex flex-col gap-4">
                            <SectionHeader title="전체 결제 내역" count={purchases.length} />
                            {loading
                                ? <EmptyState text="불러오는 중..." />
                                : purchases.length === 0
                                ? <EmptyState text="결제 내역이 없습니다." />
                                : purchases.map((p) => (
                                    <div key={p.id} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>{p.themeTitle}</span>
                                                <Badge style={STATUS_STYLE[p.status] ?? { label: p.status, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                            </div>
                                            <p className="text-[11px]" style={{ color: "#aeaeb2" }}>
                                                구매자: {p.buyerNickname ?? p.buyerName} · 크리에이터: {p.creatorNickname ?? p.creatorName} · {formatKST(p.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{p.amount.toLocaleString()}원</span>
                                            {p.status === "COMPLETED" && (
                                                <button onClick={() => purchaseAction(p.id, "refund")} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(255,59,48,0.07)", color: "#ff3b30" }}>환불</button>
                                            )}
                                            {p.status === "PENDING" && (
                                                <button onClick={() => purchaseAction(p.id, "complete")} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(52,199,89,0.08)", color: "#1a7a3a" }}>완료 처리</button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* ───────── 1:1 문의 ───────── */}
                {activeTab === "inquiries" && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>1:1 문의</h1>
                                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>접수된 문의에 답변을 작성합니다.</p>
                            </div>
                            {selectedInquiry && (
                                <button
                                    onClick={() => { setSelectedInquiry(null); setReplyText(""); }}
                                    className="flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-60"
                                    style={{ color: "#aeaeb2" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                                    </svg>
                                    목록으로
                                </button>
                            )}
                        </div>

                        {selectedInquiry ? (
                            /* 상세 뷰 */
                            <div className="flex flex-col gap-6">
                                {/* 원문 */}
                                <div className="flex flex-col gap-3 pb-6" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <Badge style={INQUIRY_STATUS_STYLE[selectedInquiry.status] ?? { label: selectedInquiry.status, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                            <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: "rgba(0,0,0,0.04)", color: "#8e8e93" }}>{selectedInquiry.category}</span>
                                        </div>
                                        <span className="text-[11px]" style={{ color: "#aeaeb2" }}>{formatKST(selectedInquiry.createdAt)}</span>
                                    </div>
                                    <h2 className="text-[17px] font-semibold" style={{ color: "#1c1c1e" }}>{selectedInquiry.title}</h2>
                                    <p className="text-[12px]" style={{ color: "#aeaeb2" }}>작성자: {selectedInquiry.userNickname ?? selectedInquiry.userName}</p>
                                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "#3a3a3c" }}>{selectedInquiry.content}</p>
                                </div>

                                {/* 답변 스레드 */}
                                {inquiryDetailLoading ? (
                                    <div className="flex items-center gap-2 py-4" style={{ color: "#aeaeb2" }}>
                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-black/10 border-t-black/40 animate-spin" />
                                        <span className="text-[13px]">불러오는 중...</span>
                                    </div>
                                ) : selectedInquiry.replies && selectedInquiry.replies.length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        {selectedInquiry.replies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className={`flex flex-col gap-2 px-4 py-3.5 rounded-xl ${reply.isAdmin ? "" : "ml-8"}`}
                                                style={{
                                                    background: reply.isAdmin ? "rgba(255,149,0,0.05)" : "rgba(74,123,247,0.05)",
                                                    borderLeft: `3px solid ${reply.isAdmin ? "rgba(255,149,0,0.35)" : "rgba(74,123,247,0.3)"}`,
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[12px] font-semibold" style={{ color: reply.isAdmin ? "rgb(255,149,0)" : "rgb(74,123,247)" }}>
                                                            {reply.isAdmin ? "카꾸미 고객센터" : reply.author.name}
                                                        </span>
                                                        <span className="text-[11px]" style={{ color: "#aeaeb2" }}>{formatKST(reply.createdAt)}</span>
                                                    </div>
                                                    {reply.isAdmin && editingReplyId !== reply.id && (
                                                        <div className="flex gap-1.5">
                                                            <button onClick={() => { setEditingReplyId(reply.id); setEditingReplyText(reply.content); }} className="text-[11px] px-2 py-0.5 rounded transition-opacity hover:opacity-70" style={{ background: "rgba(0,0,0,0.05)", color: "#6e6e73" }}>수정</button>
                                                            <button onClick={() => deleteReply(reply.id)} disabled={actionLoading} className="text-[11px] px-2 py-0.5 rounded transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(255,59,48,0.07)", color: "#ff3b30" }}>삭제</button>
                                                        </div>
                                                    )}
                                                </div>
                                                {editingReplyId === reply.id ? (
                                                    <div className="flex flex-col gap-2">
                                                        <textarea value={editingReplyText} onChange={(e) => setEditingReplyText(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none" style={{ border: "1px solid rgba(255,149,0,0.3)", color: "#1c1c1e", background: "#fff" }} />
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => { setEditingReplyId(null); setEditingReplyText(""); }} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ background: "rgba(0,0,0,0.05)", color: "#6e6e73" }}>취소</button>
                                                            <button onClick={() => updateReply(reply.id)} disabled={!editingReplyText.trim() || actionLoading} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold disabled:opacity-40" style={{ background: "rgb(255,149,0)", color: "#fff" }}>{actionLoading ? "저장 중..." : "저장"}</button>
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
                                <div className="flex flex-col gap-2 pt-2">
                                    <p className="text-[12px] font-medium" style={{ color: "#6e6e73" }}>답변 작성</p>
                                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="사용자에게 보낼 답변을 입력하세요..." rows={5} className="w-full px-4 py-3 rounded-xl text-[13px] outline-none resize-none" style={{ border: "1px solid rgba(0,0,0,0.09)", color: "#1c1c1e", background: "rgba(255,255,255,0.8)" }} />
                                    <div className="flex justify-end">
                                        <button onClick={sendReply} disabled={!replyText.trim() || actionLoading} className="px-5 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-40 transition-opacity hover:opacity-80" style={{ background: "rgb(255,149,0)", color: "#fff" }}>
                                            {actionLoading ? "전송 중..." : "답변 전송"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* 목록 뷰 */
                            <div className="flex flex-col gap-4">
                                {/* 검색 */}
                                <div className="flex items-center gap-2" style={{ maxWidth: 460 }}>
                                    <div className="relative shrink-0">
                                        <select value={inquirySearchType} onChange={(e) => setInquirySearchType(e.target.value as "전체" | "제목" | "작성자" | "내용")} className="appearance-none text-[12px] font-medium pl-3 pr-7 py-2 rounded-lg outline-none cursor-pointer" style={{ background: "rgba(0,0,0,0.04)", color: "#1c1c1e", border: "none" }}>
                                            {(["전체", "제목", "작성자", "내용"] as const).map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                    </div>
                                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(0,0,0,0.04)" }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                                        <input type="text" value={inquirySearch} onChange={(e) => setInquirySearch(e.target.value)} placeholder="검색" className="flex-1 text-[13px] outline-none bg-transparent" style={{ color: "#1c1c1e" }} />
                                        {inquirySearch && (
                                            <button type="button" onClick={() => setInquirySearch("")} className="shrink-0 transition-opacity hover:opacity-60">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <SectionHeader title="문의 목록" count={inquiries.length} />
                                {loading ? <EmptyState text="불러오는 중..." /> : (() => {
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
                                    if (filtered.length === 0) return <EmptyState text={q ? `'${inquirySearch}'에 대한 검색 결과가 없습니다.` : "문의가 없습니다."} />;
                                    return filtered.map((inq) => (
                                        <button
                                            key={inq.id}
                                            onClick={() => fetchInquiryDetail(inq)}
                                            className="flex items-center gap-4 py-3 text-left w-full transition-opacity hover:opacity-70"
                                            style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                    <Badge style={INQUIRY_STATUS_STYLE[inq.status] ?? { label: inq.status, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                                                    <span className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>{inq.title}</span>
                                                </div>
                                                <p className="text-[11px]" style={{ color: "#aeaeb2" }}>
                                                    {inq.userNickname ?? inq.userName} · {inq.category} · 답변 {inq.replyCount}개 · {formatKST(inq.createdAt, false)}
                                                </p>
                                            </div>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M9 18l6-6-6-6" /></svg>
                                        </button>
                                    ));
                                })()}
                            </div>
                        )}
                    </div>
                )}

                {/* ───────── 입점 신청 ───────── */}
                {activeTab === "applications" && (
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>입점 신청</h1>
                            <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>크리에이터 입점 신청을 검토하고 승인 또는 반려합니다.</p>
                        </div>
                        <SectionHeader
                            title="신청 목록"
                            count={applications.length}
                            action={
                                applications.filter(a => a.status === "PENDING").length > 0
                                    ? <Badge style={{ label: `대기 ${applications.filter(a => a.status === "PENDING").length}건`, bg: "rgba(255,149,0,0.10)", color: "#c97000" }} />
                                    : undefined
                            }
                        />
                        {loading
                            ? <EmptyState text="불러오는 중..." />
                            : applications.length === 0
                            ? <EmptyState text="입점 신청 내역이 없습니다." />
                            : applications.map((app) => (
                                <ApplicationRow key={app.id} app={app} onAction={applicationAction} actionLoading={actionLoading} />
                            ))
                        }
                    </div>
                )}

                {/* ───────── 우체통 ───────── */}
                {activeTab === "mailbox" && (
                    <MailboxAdminTab
                        mailboxes={mailboxes}
                        loading={loading}
                        actionLoading={actionLoading}
                        onAction={mailboxAction}
                    />
                )}

                {/* ───────── 갤러리 신고 ───────── */}
                {activeTab === "gallery_reports" && (
                    <GalleryReportsTab
                        reports={galleryReports}
                        loading={loading}
                        actionLoading={actionLoading}
                        onAction={galleryReportAction}
                    />
                )}

            </div>

            {/* ── 모달: 테마 반려 ── */}
            {rejectModal && (
                <ModalOverlay onClose={() => setRejectModal(null)}>
                    <div className="w-[400px] rounded-2xl p-6 flex flex-col gap-4" style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                        <div>
                            <h3 className="text-[15px] font-semibold" style={{ color: "#1c1c1e" }}>테마 반려</h3>
                            <p className="text-[13px] mt-1" style={{ color: "#6e6e73" }}><b style={{ color: "#1c1c1e" }}>{rejectModal.title}</b> 테마를 반려합니다.</p>
                        </div>
                        <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="반려 사유를 입력하세요..." rows={4} className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none" style={{ border: "1px solid rgba(0,0,0,0.10)", color: "#1c1c1e", background: "rgba(0,0,0,0.02)" }} />
                        <div className="flex gap-2">
                            <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium" style={{ background: "rgba(0,0,0,0.05)", color: "#6e6e73" }}>취소</button>
                            <button onClick={async () => { await themeAction(rejectModal.themeId, "reject", rejectNote); setRejectModal(null); setRejectNote(""); }} disabled={!rejectNote.trim() || actionLoading} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-40" style={{ background: "#ff3b30", color: "#fff" }}>반려하기</button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* ── 모달: 유저 탈퇴 ── */}
            {deleteUserModal && (
                <ModalOverlay onClose={() => setDeleteUserModal(null)}>
                    <div className="w-[380px] rounded-2xl p-6 flex flex-col gap-4" style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                        <div>
                            <h3 className="text-[15px] font-semibold" style={{ color: "#ff3b30" }}>회원 탈퇴 처리</h3>
                            <p className="text-[13px] mt-1" style={{ color: "#6e6e73" }}><b style={{ color: "#1c1c1e" }}>{deleteUserModal.name}</b> 회원을 탈퇴 처리합니다.<br />모든 데이터가 삭제되며 복구할 수 없습니다.</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setDeleteUserModal(null)} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium" style={{ background: "rgba(0,0,0,0.05)", color: "#6e6e73" }}>취소</button>
                            <button onClick={() => userAction(deleteUserModal.userId, "delete")} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-40" style={{ background: "#ff3b30", color: "#fff" }}>탈퇴 처리</button>
                        </div>
                    </div>
                </ModalOverlay>
            )}
        </div>
    );
}

// ── 테마 관리 탭 ─────────────────────────────────────────────────────────────
function ThemeManageTab({ themes, loading, actionLoading, onApprove, onReject }: {
    themes: AdminTheme[]; loading: boolean; actionLoading: boolean;
    onApprove: (id: string) => void; onReject: (id: string, title: string) => void;
}) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const draftThemes = themes.filter((t) => t.status === "DRAFT");

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>테마 관리</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>등록 신청된 테마를 검토하고 승인 또는 반려합니다.</p>
            </div>
            <SectionHeader
                title="승인 대기"
                count={draftThemes.length}
                action={loading ? <span className="text-[12px]" style={{ color: "#aeaeb2" }}>로딩 중...</span> : undefined}
            />
            {draftThemes.length === 0 && !loading
                ? <EmptyState text="승인 대기 중인 테마가 없습니다." />
                : draftThemes.map((t) => {
                    const isOpen = expandedId === t.id;
                    return (
                        <div key={t.id}>
                            <button
                                type="button"
                                onClick={() => setExpandedId(isOpen ? null : t.id)}
                                className="w-full text-left py-3 flex items-center gap-4 transition-opacity hover:opacity-70"
                                style={{ borderBottom: isOpen ? "none" : "1px solid rgba(0,0,0,0.05)" }}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>{t.title}</span>
                                        <Badge style={{ label: "승인 대기", bg: "rgba(255,149,0,0.10)", color: "#c97000" }} />
                                    </div>
                                    <p className="text-[11px]" style={{ color: "#aeaeb2" }}>
                                        {t.creatorNickname ?? t.creatorName} · {t.price === 0 ? "무료" : `${t.price.toLocaleString()}원`} · {formatKST(t.createdAt, false)}
                                    </p>
                                    {t.adminNote && <p className="text-[11px] mt-0.5" style={{ color: "#ff3b30" }}>이전 반려: {t.adminNote}</p>}
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {isOpen && (
                                <div className="flex flex-col gap-5 py-5 pl-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                    {/* 이미지 */}
                                    {(t.thumbnailUrl || t.images?.length > 0) && (
                                        <div className="flex gap-3 flex-wrap">
                                            {t.thumbnailUrl && (
                                                <div className="flex flex-col gap-1 items-center">
                                                    <img src={t.thumbnailUrl} alt="대표" className="w-[100px] h-[100px] rounded-xl object-cover" style={{ border: "1px solid rgba(0,0,0,0.07)" }} />
                                                    <span className="text-[10px]" style={{ color: "#aeaeb2" }}>대표</span>
                                                </div>
                                            )}
                                            {t.images?.map((img, idx) => (
                                                <div key={idx} className="flex flex-col gap-1 items-center">
                                                    <img src={img} alt={`프리뷰 ${idx + 1}`} className="w-[72px] h-[72px] rounded-xl object-cover" style={{ border: "1px solid rgba(0,0,0,0.07)" }} />
                                                    <span className="text-[10px]" style={{ color: "#aeaeb2" }}>프리뷰 {idx + 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 메타 정보 */}
                                    <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                                        {[
                                            { label: "테마명", value: t.title },
                                            { label: "가격",   value: t.price === 0 ? "무료" : `${t.price.toLocaleString()}원` },
                                            { label: "크리에이터", value: t.creatorNickname ?? t.creatorName },
                                            { label: "신청일", value: formatKST(t.createdAt, true) },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex flex-col gap-0.5">
                                                <p className="text-[10px] font-medium" style={{ color: "#aeaeb2" }}>{label}</p>
                                                <p className="text-[12px] font-medium" style={{ color: "#1c1c1e" }}>{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {t.tags?.length > 0 && (
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[10px] font-medium" style={{ color: "#aeaeb2" }}>카테고리</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {t.tags.map((tag) => (
                                                    <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.05)", color: "#6e6e73" }}>{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {t.description && (
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-medium" style={{ color: "#aeaeb2" }}>테마 설명</p>
                                            <p className="text-[13px] leading-relaxed" style={{ color: "#3a3a3c" }}>{t.description}</p>
                                        </div>
                                    )}

                                    {t.versions?.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[10px] font-medium" style={{ color: "#aeaeb2" }}>첨부 파일 ({t.versions.length}개 옵션)</p>
                                            {t.versions.map((v, vi) => (
                                                <div key={vi} className="flex flex-col gap-1 pl-2">
                                                    <p className="text-[11px] font-semibold" style={{ color: "#6e6e73" }}>옵션 {vi + 1}: {v.version}</p>
                                                    {v.kthemeFileUrl && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(255,149,0,0.10)", color: "#c97000" }}>iOS·PC</span>
                                                            <a href={v.kthemeFileUrl} download target="_blank" rel="noopener noreferrer" className="text-[12px] truncate underline hover:opacity-70" style={{ color: "rgb(74,123,247)" }}>{v.kthemeFileUrl.split("/").pop()}</a>
                                                        </div>
                                                    )}
                                                    {v.apkFileUrl && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(52,199,89,0.10)", color: "#1a7a3a" }}>Android</span>
                                                            <a href={v.apkFileUrl} download target="_blank" rel="noopener noreferrer" className="text-[12px] truncate underline hover:opacity-70" style={{ color: "rgb(74,123,247)" }}>{v.apkFileUrl.split("/").pop()}</a>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 테마 옵션 */}
                                    {t.options?.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[10px] font-medium" style={{ color: "#aeaeb2" }}>테마 옵션 ({t.options.length}개)</p>
                                            {t.options.map((opt, oi) => (
                                                <div key={opt.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
                                                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: "rgb(255,149,0)", color: "#fff" }}>{oi + 1}</span>
                                                    <span className="text-[12px] font-medium flex-1" style={{ color: "#1c1c1e" }}>{opt.name || `옵션 ${oi + 1}`}</span>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: opt.os === "ios" ? "rgba(255,149,0,0.10)" : "rgba(74,123,247,0.10)", color: opt.os === "ios" ? "#c97000" : "rgb(74,123,247)" }}>{opt.os === "ios" ? "iOS" : "Android"}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: opt.myThemeId ? "rgba(52,199,89,0.10)" : "rgba(0,0,0,0.05)", color: opt.myThemeId ? "#1a7a3a" : "#8e8e93" }}>{opt.myThemeId ? "내 테마" : "파일"}</span>
                                                    {opt.fileUrl && (
                                                        <a href={opt.fileUrl} download target="_blank" rel="noopener noreferrer" className="text-[11px] underline hover:opacity-70" style={{ color: "rgb(74,123,247)" }}>다운로드</a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 테마 정보 블록 */}
                                    {t.contentBlocks && t.contentBlocks.trim() !== "" && t.contentBlocks !== "<p></p>" && (
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[10px] font-medium" style={{ color: "#aeaeb2" }}>테마 정보</p>
                                            <div
                                                className="px-4 py-3 rounded-xl text-[13px] leading-relaxed admin-theme-content"
                                                style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.07)" }}
                                                dangerouslySetInnerHTML={{ __html: t.contentBlocks }}
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-1">
                                        <button onClick={() => onApprove(t.id)} disabled={actionLoading} className="flex-1 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-40 transition-opacity hover:opacity-80" style={{ background: "rgba(52,199,89,0.10)", color: "#1a7a3a" }}>✓ 승인</button>
                                        <button onClick={() => onReject(t.id, t.title)} disabled={actionLoading} className="flex-1 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-40 transition-opacity hover:opacity-80" style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>✕ 반려</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            }
        </div>
    );
}

// ── 입점 신청 행 ─────────────────────────────────────────────────────────────
const APP_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    PENDING:  { label: "검토 중",   bg: "rgba(255,149,0,0.10)",  color: "#c97000" },
    APPROVED: { label: "승인 완료", bg: "rgba(52,199,89,0.10)",  color: "#1a7a3a" },
    REJECTED: { label: "반려",      bg: "rgba(255,59,48,0.08)",  color: "#c0392b" },
};

function ApplicationRow({ app, onAction, actionLoading }: {
    app: AdminApplication;
    onAction: (id: string, action: "APPROVED" | "REJECTED", note?: string) => void;
    actionLoading: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [showReject, setShowReject] = useState(false);
    const statusStyle = APP_STATUS_STYLE[app.status] ?? APP_STATUS_STYLE.PENDING;

    return (
        <div className="flex flex-col gap-2 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>{app.userNickname ?? app.userName}</span>
                        {app.userEmail && <span className="text-[11px]" style={{ color: "#aeaeb2" }}>{app.userEmail}</span>}
                        <Badge style={statusStyle} />
                    </div>
                    <p className="text-[11px]" style={{ color: "#aeaeb2" }}>신청일 {new Date(app.createdAt).toLocaleDateString("ko-KR")}</p>
                </div>
                {app.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                        <button onClick={() => onAction(app.id, "APPROVED")} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(52,199,89,0.08)", color: "#1a7a3a" }}>승인</button>
                        <button onClick={() => setShowReject(v => !v)} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(255,59,48,0.07)", color: "#ff3b30" }}>반려</button>
                    </div>
                )}
            </div>

            <button onClick={() => setExpanded(v => !v)} className="self-start text-[12px] transition-opacity hover:opacity-60" style={{ color: "rgb(74,123,247)" }}>
                {expanded ? "▲ 접기" : "▼ 신청 사유 보기"}
            </button>

            {expanded && (
                <div className="flex flex-col gap-2 mt-1 px-4 py-3 rounded-xl" style={{ background: "rgba(74,123,247,0.04)", borderLeft: "2px solid rgba(74,123,247,0.2)" }}>
                    <p className="text-[13px] leading-relaxed" style={{ color: "#3a3a3c", whiteSpace: "pre-wrap" }}>{app.reason}</p>
                    {app.portfolio && (
                        <a href={app.portfolio} target="_blank" rel="noopener noreferrer" className="text-[12px] underline hover:opacity-70 transition-opacity" style={{ color: "rgb(74,123,247)" }}>포트폴리오 보기 →</a>
                    )}
                    {app.adminNote && (
                        <div className="mt-1 px-3 py-2 rounded-lg" style={{ background: "rgba(255,59,48,0.05)" }}>
                            <p className="text-[11px] font-semibold mb-0.5" style={{ color: "#c0392b" }}>반려 사유</p>
                            <p className="text-[12px]" style={{ color: "#3a3a3c" }}>{app.adminNote}</p>
                        </div>
                    )}
                </div>
            )}

            {showReject && (
                <div className="flex flex-col gap-2 mt-1 px-4 py-3 rounded-xl" style={{ background: "rgba(255,59,48,0.03)", border: "1px solid rgba(255,59,48,0.12)" }}>
                    <p className="text-[12px] font-semibold" style={{ color: "#c0392b" }}>반려 사유 입력</p>
                    <textarea rows={3} value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="반려 사유를 입력하면 신청자에게 표시됩니다. (선택)" className="px-3 py-2 rounded-lg text-[13px] outline-none resize-none" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", color: "#1c1c1e" }} />
                    <div className="flex gap-2">
                        <button onClick={() => { onAction(app.id, "REJECTED", rejectNote || undefined); setShowReject(false); }} disabled={actionLoading} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-80" style={{ background: "#ff3b30" }}>반려 확정</button>
                        <button onClick={() => setShowReject(false)} className="px-3 py-1.5 rounded-lg text-[12px] transition-opacity hover:opacity-70" style={{ background: "rgba(0,0,0,0.05)", color: "#6e6e73" }}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── 우체통 관리 탭 ────────────────────────────────────────────────────────────
const MAILBOX_TYPE_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    SUGGESTION: { label: "건의해요",    bg: "rgba(255,149,0,0.10)",  color: "#c97000" },
    BUG_REPORT: { label: "오류 신고해요", bg: "rgba(255,59,48,0.08)", color: "#c0392b" },
};
const MAILBOX_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    PENDING:  { label: "미처리",    bg: "rgba(255,149,0,0.10)",  color: "#c97000" },
    REVIEWED: { label: "처리 완료", bg: "rgba(52,199,89,0.10)",  color: "#1a7a3a" },
};

function MailboxAdminTab({ mailboxes, loading, actionLoading, onAction }: {
    mailboxes: AdminMailbox[];
    loading: boolean;
    actionLoading: boolean;
    onAction: (id: string, status: "PENDING" | "REVIEWED", adminNote?: string) => void;
}) {
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "REVIEWED">("ALL");
    const [typeFilter, setTypeFilter] = useState<"ALL" | "SUGGESTION" | "BUG_REPORT">("ALL");
    const [expanded, setExpanded] = useState<string | null>(null);
    const [noteText, setNoteText] = useState("");

    const filtered = mailboxes.filter((m) => {
        if (filter !== "ALL" && m.status !== filter) return false;
        if (typeFilter !== "ALL" && m.type !== typeFilter) return false;
        return true;
    });

    const pendingCount = mailboxes.filter((m) => m.status === "PENDING").length;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>우체통</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>사용자들이 제출한 건의 및 오류 신고를 확인합니다.</p>
            </div>

            <SectionHeader
                title="우체통 목록"
                count={filtered.length}
                action={
                    pendingCount > 0
                        ? <Badge style={{ label: `미처리 ${pendingCount}건`, bg: "rgba(255,149,0,0.10)", color: "#c97000" }} />
                        : undefined
                }
            />

            {/* 필터 */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                    {(["ALL", "PENDING", "REVIEWED"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className="px-3 py-1.5 rounded-full text-[12px] transition-all"
                            style={{
                                background: filter === s ? "rgb(74,123,247)" : "rgba(0,0,0,0.05)",
                                color: filter === s ? "#fff" : "#6e6e73",
                                fontWeight: filter === s ? 700 : 400,
                            }}
                        >
                            {s === "ALL" ? "전체" : MAILBOX_STATUS_STYLE[s].label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1.5">
                    {(["ALL", "SUGGESTION", "BUG_REPORT"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className="px-3 py-1.5 rounded-full text-[12px] transition-all"
                            style={{
                                background: typeFilter === t ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.04)",
                                color: typeFilter === t ? "#1c1c1e" : "#8e8e93",
                                fontWeight: typeFilter === t ? 700 : 400,
                            }}
                        >
                            {t === "ALL" ? "유형 전체" : MAILBOX_TYPE_STYLE[t].label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <EmptyState text="불러오는 중..." />
            ) : filtered.length === 0 ? (
                <EmptyState text="해당 조건의 우체통 내역이 없습니다." />
            ) : (
                <div className="flex flex-col gap-0" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
                    {filtered.map((m) => (
                        <div key={m.id} className="flex flex-col gap-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                            <button
                                className="w-full text-left flex items-start justify-between gap-4 py-4 px-1 transition-opacity hover:opacity-70"
                                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                            >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                                        style={{ background: MAILBOX_STATUS_STYLE[m.status]?.bg, color: MAILBOX_STATUS_STYLE[m.status]?.color }}>
                                        {MAILBOX_STATUS_STYLE[m.status]?.label}
                                    </span>
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                                        style={{ background: MAILBOX_TYPE_STYLE[m.type]?.bg, color: MAILBOX_TYPE_STYLE[m.type]?.color }}>
                                        {MAILBOX_TYPE_STYLE[m.type]?.label}
                                    </span>
                                    <span className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>{m.title}</span>
                                    <span className="text-[11px] shrink-0" style={{ color: "#aeaeb2" }}>{m.userNickname ?? m.userName}</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-[12px]" style={{ color: "#d1d1d6" }}>{new Date(m.createdAt).toLocaleDateString("ko-KR")}</span>
                                    <svg
                                        width="13" height="13" viewBox="0 0 24 24" fill="none"
                                        stroke="#aeaeb2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        style={{ transform: expanded === m.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                            </button>

                            {expanded === m.id && (
                                <div className="flex flex-col gap-4 px-4 pb-5">
                                    {/* 내용 */}
                                    <div
                                        className="px-4 py-4 rounded-xl"
                                        style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}
                                    >
                                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "#3a3a3c" }}>{m.content}</p>
                                    </div>

                                    {/* 관리자 메모 */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-semibold" style={{ color: "#6e6e73" }}>관리자 메모 (선택)</label>
                                        <textarea
                                            rows={2}
                                            value={expanded === m.id ? noteText : (m.adminNote ?? "")}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            onFocus={() => setNoteText(m.adminNote ?? "")}
                                            placeholder="내부 메모를 남겨두세요."
                                            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none"
                                            style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.09)", color: "#1c1c1e" }}
                                        />
                                    </div>

                                    {/* 액션 버튼 */}
                                    <div className="flex gap-2">
                                        {m.status === "PENDING" ? (
                                            <button
                                                onClick={() => { onAction(m.id, "REVIEWED", noteText || undefined); setExpanded(null); setNoteText(""); }}
                                                disabled={actionLoading}
                                                className="px-4 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-40 transition-opacity hover:opacity-80"
                                                style={{ background: "rgba(52,199,89,0.10)", color: "#1a7a3a" }}
                                            >
                                                ✓ 처리 완료 표시
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => { onAction(m.id, "PENDING", noteText || undefined); setExpanded(null); setNoteText(""); }}
                                                disabled={actionLoading}
                                                className="px-4 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-40 transition-opacity hover:opacity-80"
                                                style={{ background: "rgba(255,149,0,0.08)", color: "#c97000" }}
                                            >
                                                ↩ 미처리로 변경
                                            </button>
                                        )}
                                        {m.adminNote !== noteText && noteText !== "" && (
                                            <button
                                                onClick={() => { onAction(m.id, m.status as "PENDING" | "REVIEWED", noteText); }}
                                                disabled={actionLoading}
                                                className="px-4 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-40 transition-opacity hover:opacity-80"
                                                style={{ background: "rgba(74,123,247,0.08)", color: "rgb(74,123,247)" }}
                                            >
                                                메모 저장
                                            </button>
                                        )}
                                    </div>

                                    {m.adminNote && (
                                        <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(74,123,247,0.04)", borderLeft: "2px solid rgba(74,123,247,0.2)" }}>
                                            <p className="text-[11px] font-semibold mb-0.5" style={{ color: "rgb(74,123,247)" }}>저장된 메모</p>
                                            <p className="text-[12px]" style={{ color: "#3a3a3c" }}>{m.adminNote}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── 갤러리 신고 탭 ───────────────────────────────────────────────────────────
function GalleryReportsTab({ reports, loading, actionLoading, onAction }: {
    reports: AdminGalleryReport[];
    loading: boolean;
    actionLoading: boolean;
    onAction: (reportId: string, action: "handle" | "delete_comment", commentId?: string) => void;
}) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const pending = reports.filter((r) => !r.isHandled);
    const handled = reports.filter((r) => r.isHandled);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    };

    const renderList = (list: AdminGalleryReport[], emptyMsg: string) => (
        list.length === 0 ? (
            <EmptyState text={emptyMsg} />
        ) : (
            <div className="flex flex-col" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                {list.map((r) => (
                    <div key={r.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <button
                            className="w-full flex items-center justify-between px-1 py-4 text-left transition-opacity hover:opacity-70"
                            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                                    style={{ background: r.isHandled ? "rgba(52,199,89,0.10)" : "rgba(255,149,0,0.10)", color: r.isHandled ? "#1a7a3a" : "#c97000" }}>
                                    {r.isHandled ? "처리 완료" : "처리 대기"}
                                </span>
                                <span className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>
                                    [{r.postThemeName}] {r.commentIsDeleted ? "(삭제됨)" : r.commentContent.slice(0, 40)}{r.commentContent.length > 40 ? "…" : ""}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                                <span className="text-[12px]" style={{ color: "#aeaeb2" }}>신고자: {r.reporterNickname ?? r.reporterName}</span>
                                <span className="text-[11px]" style={{ color: "#d1d1d6" }}>{formatDate(r.createdAt)}</span>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d1d1d6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ transform: expandedId === r.id ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                            </div>
                        </button>

                        {expandedId === r.id && (
                            <div className="px-1 pb-5 flex flex-col gap-4">
                                <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(255,149,0,0.05)", border: "1px solid rgba(255,149,0,0.12)" }}>
                                    <p className="text-[11px] font-semibold mb-1" style={{ color: "#c97000" }}>신고된 댓글</p>
                                    <p className="text-[13px] leading-relaxed" style={{ color: r.commentIsDeleted ? "#aeaeb2" : "#1c1c1e" }}>
                                        {r.commentIsDeleted ? "이미 삭제된 댓글입니다." : r.commentContent}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px]" style={{ color: "#aeaeb2" }}>게시글:</span>
                                    <a href={`/gallery/${r.postId}`} target="_blank" rel="noreferrer"
                                        className="text-[12px] underline transition-opacity hover:opacity-60"
                                        style={{ color: "rgb(74,123,247)" }}>
                                        {r.postThemeName}
                                    </a>
                                </div>
                                {!r.isHandled && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onAction(r.id, "handle")} disabled={actionLoading}
                                            className="px-4 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-40 transition-opacity hover:opacity-80"
                                            style={{ background: "rgba(52,199,89,0.10)", color: "#1a7a3a" }}>
                                            처리 완료
                                        </button>
                                        {!r.commentIsDeleted && (
                                            <button onClick={() => onAction(r.id, "delete_comment", r.commentId)} disabled={actionLoading}
                                                className="px-4 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-40 transition-opacity hover:opacity-80"
                                                style={{ background: "rgba(255,59,48,0.10)", color: "#ff3b30" }}>
                                                댓글 삭제
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    );

    return (
        <div className="flex flex-col gap-8">
            <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: "#a8a29e" }}>Gallery</p>
                <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "#1c1917" }}>갤러리 신고</h1>
                <p className="text-[14px] mt-1" style={{ color: "#78716c" }}>꾸미 갤러리 댓글 신고 내역을 관리합니다.</p>
            </div>
            {loading ? (
                <div className="flex items-center gap-2 py-10" style={{ color: "#aeaeb2" }}>
                    <div className="w-4 h-4 rounded-full border-2 border-stone-200 border-t-stone-400 animate-spin" />
                    <span className="text-[13px]">불러오는 중…</span>
                </div>
            ) : (
                <>
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>처리 대기</span>
                            <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                            <span className="text-[12px] font-semibold" style={{ color: "#c97000" }}>{pending.length}건</span>
                        </div>
                        {renderList(pending, "처리 대기 중인 신고가 없어요.")}
                    </div>
                    {handled.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>처리 완료</span>
                                <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                                <span className="text-[12px] font-semibold" style={{ color: "#1a7a3a" }}>{handled.length}건</span>
                            </div>
                            {renderList(handled, "")}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

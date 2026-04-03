"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatKST } from "@/lib/date";

// ── 타입 ──────────────────────────────────────────
type AdminTheme = {
    id: string; title: string; description: string | null; price: number;
    status: string; adminNote: string | null; createdAt: string;
    creatorNickname: string | null; creatorName: string;
    thumbnailUrl: string | null; images: string[]; tags: string[];
    contentBlocks: string | null;
    versions: { version: string; kthemeFileUrl: string | null; apkFileUrl: string | null }[];
    options: { id: string; os: string; name: string; status: string; fileUrl: string | null; myThemeId: string | null; myThemeName: string | null; myThemePreviewUrl: string | null; pendingFileUrl: string | null; pendingMyThemeId: string | null; pendingMyThemeName: string | null; pendingMyThemePreviewUrl: string | null }[];
    // 수정 신청 pending 필드
    pendingTitle: string | null;
    pendingDescription: string | null;
    pendingPrice: number | null;
    pendingTags: string[] | null;
    pendingThumbnailUrl: string | null;
    pendingImages: string[] | null;
    pendingContentBlocks: string | null;
    pendingReviewVisibility: string | null;
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
    images?: string[];
    status: string; createdAt: string; replyCount: number;
    userNickname: string | null; userName: string;
    replies?: AdminInquiryReply[];
};
type AdminApplication = {
    id: string; status: string; reason: string; portfolio: string | null;
    experience: boolean; tools: string[]; sampleImages: string[];
    adminNote: string | null; createdAt: string;
    userId: string; userNickname: string | null; userName: string; userEmail: string | null;
};
type AdminMailbox = {
    id: string; type: "SUGGESTION" | "BUG_REPORT"; title: string; content: string;
    images?: string[];
    status: "PENDING" | "REVIEWED"; adminNote: string | null; createdAt: string;
    userNickname: string | null; userName: string;
};
type AdminGalleryReport = {
    id: string; isHandled: boolean; createdAt: string;
    commentId: string; commentContent: string; commentIsDeleted: boolean;
    postId: string; postThemeName: string;
    reporterNickname: string | null; reporterName: string;
};
type AdminReview = {
    id: string; rating: number; content: string | null; images: string[];
    rewarded: boolean; createdAt: string;
    userNickname: string | null; userName: string;
    themeTitle: string; themeId: string;
};
type AdminGalleryPost = {
    id: string; themeName: string; description: string | null;
    images: string[]; storeLink: string | null; createdAt: string;
    userNickname: string | null; userName: string;
    likeCount: number; commentCount: number;
};
type AdminSubscription = {
    id: string; status: string; amount: number;
    startedAt: string; nextBillingAt: string | null; cancelledAt: string | null;
    cardCompany: string | null; cardNumber: string | null;
    userNickname: string | null; userName: string;
    userEmail: string | null; userId: string;
};
type AdminRefund = {
    id: string; amount: number; status: string; createdAt: string;
    refundReason: string | null; refundedAt: string | null;
    buyerNickname: string | null; buyerName: string;
    themeTitle: string; creatorNickname: string | null; creatorName: string;
};
type AdminCreator = {
    id: string; name: string; nickname: string | null; email: string | null;
    isSuspended: boolean; createdAt: string;
    themeCount: number; totalSales: number; totalRevenue: number;
};
type AdminStats = {
    totals: { users: number; themes: number; purchases: number; totalRevenue: number; activeSubscriptions: number };
    monthlyRevenue: { month: string; amount: number }[];
    monthlySignups: { month: string; count: number }[];
    topThemes: { id: string; title: string; salesCount: number; revenue: number; creatorName: string }[];
};

type DashboardCounts = {
    themesPending: number;
    applicationsPending: number;
    reportsPending: number;
    inquiriesOpen: number;
    mailboxPending: number;
    galleryReportsPending: number;
    refundsPending: number;
};

type Tab = "overview" | "stats" | "themes" | "users" | "creators" | "reports" | "reviews" | "gallery_posts" | "sales" | "refunds" | "subscriptions" | "inquiries" | "applications" | "mailbox" | "gallery_reports" | "broadcast";
type Props = {
    dashboardCounts: DashboardCounts;
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
        items: [
            { key: "overview", label: "대시보드" },
            { key: "stats",    label: "통계/분석" },
        ],
    },
    {
        category: "콘텐츠",
        items: [
            { key: "themes",       label: "테마 관리" },
            { key: "applications", label: "입점 신청" },
            { key: "reports",      label: "신고 관리" },
            { key: "reviews",      label: "리뷰 관리" },
            { key: "gallery_posts", label: "갤러리 게시글" },
        ],
    },
    {
        category: "회원",
        items: [
            { key: "users",    label: "회원 관리" },
            { key: "creators", label: "크리에이터" },
        ],
    },
    {
        category: "정산",
        items: [
            { key: "sales",         label: "매출 / 정산" },
            { key: "refunds",       label: "환불 관리" },
            { key: "subscriptions", label: "구독 관리" },
        ],
    },
    {
        category: "지원",
        items: [
            { key: "inquiries",       label: "1:1 문의" },
            { key: "mailbox",         label: "우체통" },
            { key: "gallery_reports", label: "갤러리 신고" },
            { key: "broadcast",       label: "알림 발송" },
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

// ── 파일 구조 검증 뱃지 ───────────────────────────────────────────────────────
type ValidationResult = { valid: boolean; errors: string[]; warnings: string[]; fileSizeMB?: string };

function ValidationBadge({ fileUrl, fileType }: { fileUrl: string; fileType: "ktheme" | "apk" }) {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<ValidationResult | null>(null);

    useEffect(() => {
        fetch(`/api/admin/validate-theme-file?url=${encodeURIComponent(fileUrl)}&type=${fileType}`)
            .then(r => r.json() as Promise<ValidationResult>)
            .then(d => setResult(d))
            .catch(() => setResult({ valid: false, errors: ["검증 요청 중 오류가 발생했습니다."], warnings: [] }))
            .finally(() => setLoading(false));
    }, [fileUrl, fileType]);

    if (loading) {
        return (
            <div className="flex items-center gap-1.5 mt-1.5 px-3 py-2 rounded-lg" style={{ background: "rgba(0,0,0,0.03)" }}>
                <div className="w-3 h-3 rounded-full border-2 border-black/10 border-t-black/40 animate-spin shrink-0" />
                <span className="text-[11px]" style={{ color: "#aeaeb2" }}>파일 구조 검증 중...</span>
            </div>
        );
    }

    if (!result) return null;

    if (result.valid && result.warnings.length === 0) {
        return (
            <div className="flex items-center gap-1.5 mt-1.5 px-3 py-2 rounded-lg" style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.18)" }}>
                <span style={{ fontSize: 13 }}>✅</span>
                <span className="text-[12px] font-medium" style={{ color: "#1a7a3a" }}>아무런 문제없어요</span>
                {result.fileSizeMB && <span className="text-[10px] ml-auto" style={{ color: "#aeaeb2" }}>{result.fileSizeMB} MB</span>}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1.5 mt-1.5 px-3 py-2.5 rounded-lg" style={{ background: result.errors.length > 0 ? "rgba(255,59,48,0.04)" : "rgba(255,149,0,0.04)", border: `1px solid ${result.errors.length > 0 ? "rgba(255,59,48,0.18)" : "rgba(255,149,0,0.2)"}` }}>
            <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 13 }}>{result.errors.length > 0 ? "❌" : "⚠️"}</span>
                <span className="text-[12px] font-semibold" style={{ color: result.errors.length > 0 ? "#ff3b30" : "#c97000" }}>
                    {result.errors.length > 0 ? `${result.errors.length + result.warnings.length}개 문제 발견` : `${result.warnings.length}개 경고`}
                </span>
                {result.fileSizeMB && <span className="text-[10px] ml-auto" style={{ color: "#aeaeb2" }}>{result.fileSizeMB} MB</span>}
            </div>
            {result.errors.map((e, i) => (
                <div key={i} className="flex items-start gap-1.5">
                    <span className="text-[11px] shrink-0 mt-0.5" style={{ color: "#ff3b30" }}>•</span>
                    <span className="text-[11px]" style={{ color: "#ff3b30" }}>{e}</span>
                </div>
            ))}
            {result.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5">
                    <span className="text-[11px] shrink-0 mt-0.5" style={{ color: "#c97000" }}>⚠</span>
                    <span className="text-[11px]" style={{ color: "#c97000" }}>{w}</span>
                </div>
            ))}
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
export default function AdminClient({ dashboardCounts }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [themes, setThemes] = useState<AdminTheme[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [purchases, setPurchases] = useState<AdminPurchase[]>([]);
    const [settlements, setSettlements] = useState<AdminSettlement[]>([]);
    const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
    const [applications, setApplications] = useState<AdminApplication[]>([]);
    const [mailboxes, setMailboxes] = useState<AdminMailbox[]>([]);
    const [galleryReports, setGalleryReports] = useState<AdminGalleryReport[]>([]);
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [galleryPosts, setGalleryPosts] = useState<AdminGalleryPost[]>([]);
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [refunds, setRefunds] = useState<AdminRefund[]>([]);
    const [creators, setCreators] = useState<AdminCreator[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
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
            } else if (tab === "reviews") {
                const r = await fetch("/api/admin/reviews");
                const d = await r.json() as { reviews: AdminReview[] };
                setReviews(d.reviews ?? []);
            } else if (tab === "gallery_posts") {
                const r = await fetch("/api/admin/gallery-posts");
                const d = await r.json() as { posts: AdminGalleryPost[] };
                setGalleryPosts(d.posts ?? []);
            } else if (tab === "subscriptions") {
                const r = await fetch("/api/admin/subscriptions");
                const d = await r.json() as { subscriptions: AdminSubscription[] };
                setSubscriptions(d.subscriptions ?? []);
            } else if (tab === "refunds") {
                const r = await fetch("/api/admin/refunds");
                const d = await r.json() as { refunds: AdminRefund[] };
                setRefunds(d.refunds ?? []);
            } else if (tab === "creators") {
                const r = await fetch("/api/admin/creators");
                const d = await r.json() as { creators: AdminCreator[] };
                setCreators(d.creators ?? []);
            } else if (tab === "stats") {
                const r = await fetch("/api/admin/stats");
                const d = await r.json() as AdminStats;
                setStats(d);
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
    const reviewAction = async (reviewId: string, action: string) => {
        setActionLoading(true);
        await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reviewId, action }) });
        setActionLoading(false);
        showToast("처리 완료");
        fetchTab("reviews");
    };
    const galleryPostAction = async (postId: string, action: string) => {
        setActionLoading(true);
        await fetch("/api/admin/gallery-posts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId, action }) });
        setActionLoading(false);
        showToast("처리 완료");
        fetchTab("gallery_posts");
    };
    const subscriptionAction = async (subscriptionId: string, action: string) => {
        setActionLoading(true);
        await fetch("/api/admin/subscriptions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscriptionId, action }) });
        setActionLoading(false);
        showToast("처리 완료");
        fetchTab("subscriptions");
    };
    const refundAction = async (purchaseId: string, action: string) => {
        setActionLoading(true);
        await fetch("/api/admin/refunds", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchaseId, action }) });
        setActionLoading(false);
        showToast(action === "approve" ? "환불 승인 완료" : "환불 거절 완료");
        fetchTab("refunds");
    };
    const creatorAction = async (userId: string, action: string) => {
        setActionLoading(true);
        await fetch("/api/admin/creators", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, action }) });
        setActionLoading(false);
        showToast("처리 완료");
        fetchTab("creators");
    };
    const broadcastSend = async (form: { title: string; body: string; linkUrl: string; target: string; userId: string }) => {
        setActionLoading(true);
        const res = await fetch("/api/admin/broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const d = await res.json() as { ok?: boolean; error?: string };
        setActionLoading(false);
        if (d.ok) showToast("알림 발송 완료");
        else showToast(d.error ?? "발송 실패");
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

    // ── 대시보드 항목 정의 ──────────────────────────────
    type DashboardItem = { label: string; tab: Tab; count: number; accent: string; desc: string };
    const CONTENT_ITEMS: DashboardItem[] = [
        {
            label: "테마 승인 대기",
            tab: "themes",
            count: dashboardCounts.themesPending,
            accent: "#FF9500",
            desc: "등록·수정 신청 중인 테마",
        },
        {
            label: "입점 신청 대기",
            tab: "applications",
            count: dashboardCounts.applicationsPending,
            accent: "#FF9500",
            desc: "크리에이터 입점 심사 대기",
        },
        {
            label: "신고 처리 대기",
            tab: "reports",
            count: dashboardCounts.reportsPending,
            accent: "#ff3b30",
            desc: "테마 신고 미처리 건수",
        },
        {
            label: "환불 요청 대기",
            tab: "refunds",
            count: dashboardCounts.refundsPending,
            accent: "#ff3b30",
            desc: "처리 대기 중인 환불 요청",
        },
    ];
    const SUPPORT_ITEMS: DashboardItem[] = [
        {
            label: "1:1 문의 미답변",
            tab: "inquiries",
            count: dashboardCounts.inquiriesOpen,
            accent: "rgb(74,123,247)",
            desc: "답변 대기 중인 문의",
        },
        {
            label: "우체통 미처리",
            tab: "mailbox",
            count: dashboardCounts.mailboxPending,
            accent: "rgb(74,123,247)",
            desc: "건의·버그 제보 미검토 건수",
        },
        {
            label: "갤러리 신고 미처리",
            tab: "gallery_reports",
            count: dashboardCounts.galleryReportsPending,
            accent: "rgb(74,123,247)",
            desc: "갤러리 댓글 신고 미처리 건수",
        },
    ];

    const goTo = (tab: Tab) => {
        setActiveTab(tab);
        if (tab === "inquiries") { setSelectedInquiry(null); setReplyText(""); }
    };

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
                                    onClick={() => goTo(item.key)}
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
                        {/* 헤더 */}
                        <div>
                            <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>대시보드</h1>
                            <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>처리가 필요한 항목을 확인하세요</p>
                        </div>

                        {/* 콘텐츠 섹션 */}
                        <div className="flex flex-col gap-2">
                            <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: "#aeaeb2" }}>콘텐츠</p>
                            <div
                                className="rounded-2xl overflow-hidden"
                                style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff" }}
                            >
                                {CONTENT_ITEMS.map((item, idx) => (
                                    <button
                                        key={item.tab}
                                        onClick={() => goTo(item.tab)}
                                        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-black/[0.02] group"
                                        style={{
                                            borderBottom: idx < CONTENT_ITEMS.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* 액센트 바 */}
                                            <div
                                                className="w-[3px] h-8 rounded-full shrink-0"
                                                style={{ background: item.count > 0 ? item.accent : "rgba(0,0,0,0.1)" }}
                                            />
                                            <div>
                                                <p className="text-[14px] font-semibold" style={{ color: "#1c1c1e" }}>{item.label}</p>
                                                <p className="text-[11px]" style={{ color: "#aeaeb2" }}>{item.desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="text-[22px] font-bold tabular-nums"
                                                style={{ color: item.count > 0 ? item.accent : "#c7c7cc" }}
                                            >
                                                {item.count}
                                            </span>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover:stroke-[#8e8e93] transition-colors"><path d="M9 18l6-6-6-6"/></svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 지원 섹션 */}
                        <div className="flex flex-col gap-2">
                            <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: "#aeaeb2" }}>지원</p>
                            <div
                                className="rounded-2xl overflow-hidden"
                                style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff" }}
                            >
                                {SUPPORT_ITEMS.map((item, idx) => (
                                    <button
                                        key={item.tab}
                                        onClick={() => goTo(item.tab)}
                                        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-black/[0.02] group"
                                        style={{
                                            borderBottom: idx < SUPPORT_ITEMS.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-[3px] h-8 rounded-full shrink-0"
                                                style={{ background: item.count > 0 ? item.accent : "rgba(0,0,0,0.1)" }}
                                            />
                                            <div>
                                                <p className="text-[14px] font-semibold" style={{ color: "#1c1c1e" }}>{item.label}</p>
                                                <p className="text-[11px]" style={{ color: "#aeaeb2" }}>{item.desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="text-[22px] font-bold tabular-nums"
                                                style={{ color: item.count > 0 ? item.accent : "#c7c7cc" }}
                                            >
                                                {item.count}
                                            </span>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover:stroke-[#8e8e93] transition-colors"><path d="M9 18l6-6-6-6"/></svg>
                                        </div>
                                    </button>
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
                        onHide={(id) => themeAction(id, "hide")}
                        onUnhide={(id) => themeAction(id, "unhide")}
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
                                    {selectedInquiry.images && selectedInquiry.images.length > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap mt-1">
                                            {selectedInquiry.images.map((url, idx) => (
                                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={url} alt={`첨부이미지 ${idx + 1}`} className="w-16 h-16 rounded-xl object-cover transition-opacity hover:opacity-70" style={{ border: "1px solid rgba(0,0,0,0.08)" }} />
                                                </a>
                                            ))}
                                        </div>
                                    )}
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
                    <ApplicationsAdminTab
                        applications={applications}
                        loading={loading}
                        actionLoading={actionLoading}
                        onAction={applicationAction}
                    />
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

                {/* ───────── 통계/분석 ───────── */}
                {activeTab === "stats" && (
                    <StatsTab stats={stats} loading={loading} />
                )}

                {/* ───────── 리뷰 관리 ───────── */}
                {activeTab === "reviews" && (
                    <ReviewsAdminTab
                        reviews={reviews}
                        loading={loading}
                        actionLoading={actionLoading}
                        onDelete={(id) => reviewAction(id, "delete")}
                    />
                )}

                {/* ───────── 갤러리 게시글 ───────── */}
                {activeTab === "gallery_posts" && (
                    <GalleryPostsAdminTab
                        posts={galleryPosts}
                        loading={loading}
                        actionLoading={actionLoading}
                        onDelete={(id) => galleryPostAction(id, "delete")}
                    />
                )}

                {/* ───────── 구독 관리 ───────── */}
                {activeTab === "subscriptions" && (
                    <SubscriptionsAdminTab
                        subscriptions={subscriptions}
                        loading={loading}
                        actionLoading={actionLoading}
                        onCancel={(id) => subscriptionAction(id, "cancel")}
                    />
                )}

                {/* ───────── 환불 관리 ───────── */}
                {activeTab === "refunds" && (
                    <RefundsAdminTab
                        refunds={refunds}
                        loading={loading}
                        actionLoading={actionLoading}
                        onApprove={(id) => refundAction(id, "approve")}
                        onReject={(id) => refundAction(id, "reject")}
                    />
                )}

                {/* ───────── 크리에이터 관리 ───────── */}
                {activeTab === "creators" && (
                    <CreatorsAdminTab
                        creators={creators}
                        loading={loading}
                        actionLoading={actionLoading}
                        onAction={creatorAction}
                    />
                )}

                {/* ───────── 알림 발송 ───────── */}
                {activeTab === "broadcast" && (
                    <BroadcastAdminTab
                        actionLoading={actionLoading}
                        onSend={broadcastSend}
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
function DiffRow({ label, before, after }: { label: string; before: string; after: string }) {
    const changed = before !== after;
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium" style={{ color: "#6e6e73" }}>{label}</span>
                {changed && (
                    <span className="text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded" style={{ background: "#FFF3E0", color: "#E65100", letterSpacing: "0.02em" }}>변경</span>
                )}
            </div>
            {changed ? (
                <div className="flex flex-col gap-0.5 pl-2" style={{ borderLeft: "2px solid #e5e7eb" }}>
                    <p className="text-[12px] line-through" style={{ color: "#c7c7cc" }}>{before || "—"}</p>
                    <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{after || "—"}</p>
                </div>
            ) : (
                <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{before || "—"}</p>
            )}
        </div>
    );
}

function ThemeManageTab({ themes, loading, actionLoading, onApprove, onReject, onHide, onUnhide }: {
    themes: AdminTheme[]; loading: boolean; actionLoading: boolean;
    onApprove: (id: string) => void; onReject: (id: string, title: string) => void;
    onHide: (id: string) => void; onUnhide: (id: string) => void;
}) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [statusTab, setStatusTab] = useState<"DRAFT" | "PUBLISHED" | "HIDDEN">("DRAFT");

    const draftThemes     = themes.filter((t) => t.status === "DRAFT");
    const publishedThemes = themes.filter((t) => t.status === "PUBLISHED");
    const hiddenThemes    = themes.filter((t) => t.status === "HIDDEN");

    const TAB_CONFIG: { key: "DRAFT" | "PUBLISHED" | "HIDDEN"; label: string; count: number; dot: string; desc: string }[] = [
        { key: "DRAFT",     label: "검토 대기", count: draftThemes.length,     dot: "#f59e0b", desc: "신규 등록 및 수정 요청" },
        { key: "PUBLISHED", label: "공개 중",   count: publishedThemes.length, dot: "#10b981", desc: "현재 판매 중인 테마" },
        { key: "HIDDEN",    label: "숨김",      count: hiddenThemes.length,    dot: "#9ca3af", desc: "비공개 처리된 테마" },
    ];

    const currentList =
        statusTab === "DRAFT"     ? draftThemes :
        statusTab === "PUBLISHED" ? publishedThemes : hiddenThemes;

    const activeTabInfo = TAB_CONFIG.find((tab) => tab.key === statusTab) ?? TAB_CONFIG[0];
    const selectedTheme = currentList.find((t) => t.id === selectedId) ?? null;
    const summaryCards = [
        {
            key: "count",
            label: activeTabInfo.label,
            value: `${currentList.length}`,
            desc: activeTabInfo.desc,
        },
        {
            key: "new",
            label: "신규 등록",
            value: `${draftThemes.filter((t) => t.status === "DRAFT" && !t.pendingTitle).length}`,
            desc: "처음 등록되어 검토가 필요한 테마",
        },
        {
            key: "update",
            label: "수정 신청",
            value: `${draftThemes.filter((t) => t.status === "DRAFT" && !!t.pendingTitle).length}`,
            desc: "기존 공개 테마에 대한 변경 요청",
        },
    ];
    const emptyText =
        statusTab === "DRAFT"
            ? "검토 대기 중인 테마가 없습니다."
            : statusTab === "PUBLISHED"
            ? "공개 중인 테마가 없습니다."
            : "숨김 처리된 테마가 없습니다.";

    const handleTabChange = (key: "DRAFT" | "PUBLISHED" | "HIDDEN") => {
        setStatusTab(key);
        setSelectedId(null);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "#9ca3af" }}>Theme Review</p>
                    <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "#111827" }}>테마 관리</h1>
                    <p className="text-[13px]" style={{ color: "#6b7280" }}>검토 대기 리스트와 상세 검토 화면을 분리해, 실제 운영 화면처럼 집중해서 확인할 수 있게 정리했습니다.</p>
                </div>

                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl" style={{ background: "#f3f4f6" }}>
                    {TAB_CONFIG.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => handleTabChange(t.key)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                            style={{
                                background: statusTab === t.key ? "#fff" : "transparent",
                                color: statusTab === t.key ? "#111827" : "#6b7280",
                                boxShadow: statusTab === t.key ? "0 6px 20px rgba(15,23,42,0.08)" : "none",
                            }}
                        >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.dot }} />
                            {t.label}
                            <span
                                className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                                style={{
                                    background: statusTab === t.key ? `${t.dot}18` : "rgba(15,23,42,0.06)",
                                    color: statusTab === t.key ? t.dot : "#6b7280",
                                }}
                            >
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {selectedTheme ? (
                <div className="min-h-0" style={{ height: "calc(100vh - 210px)" }}>
                    <ThemeDetailPanel
                        theme={selectedTheme}
                        statusTab={statusTab}
                        actionLoading={actionLoading}
                        onApprove={onApprove}
                        onReject={onReject}
                        onHide={onHide}
                        onUnhide={onUnhide}
                        onBack={() => setSelectedId(null)}
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-3">
                        {summaryCards.map((card, idx) => (
                            <div
                                key={card.key}
                                className="rounded-[22px] px-4 py-4"
                                style={{
                                    border: idx === 0 ? `1px solid ${activeTabInfo.dot}22` : "1px solid rgba(15,23,42,0.08)",
                                    background: idx === 0 ? `${activeTabInfo.dot}08` : "#fff",
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[12px] font-semibold" style={{ color: idx === 0 ? activeTabInfo.dot : "#6b7280" }}>{card.label}</span>
                                    <span className="text-[20px] font-bold tabular-nums" style={{ color: "#111827" }}>{card.value}</span>
                                </div>
                                <p className="text-[11px] leading-relaxed" style={{ color: "#9ca3af" }}>{card.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-[28px] border overflow-hidden bg-white" style={{ borderColor: "rgba(15,23,42,0.08)" }}>
                        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(15,23,42,0.06)", background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)" }}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[15px] font-semibold" style={{ color: "#111827" }}>{activeTabInfo.label} 화면</p>
                                    <p className="text-[11px] mt-1" style={{ color: "#9ca3af" }}>
                                        {statusTab === "DRAFT"
                                            ? "검토할 항목만 간결하게 보고, 항목을 누르면 상세 검토 화면으로 이동합니다."
                                            : activeTabInfo.desc}
                                    </p>
                                </div>
                                <div className="px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: "rgba(15,23,42,0.05)", color: "#475569" }}>
                                    총 {currentList.length}건
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-24">
                                <div className="w-6 h-6 rounded-full border-2 border-black/10 border-t-black/50 animate-spin" />
                            </div>
                        ) : currentList.length === 0 ? (
                            <EmptyState text={emptyText} />
                        ) : (
                            <div className="px-4 py-4 flex flex-col gap-3">
                                {currentList.map((t) => {
                                    const isUpdate = !!t.pendingTitle;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedId(t.id)}
                                            className="w-full text-left rounded-[22px] px-4 py-4 transition-all hover:shadow-sm"
                                            style={{
                                                border: "1px solid rgba(15,23,42,0.08)",
                                                background: "#fff",
                                            }}
                                        >
                                            <div className="flex items-center gap-4">
                                                {t.thumbnailUrl
                                                    ? <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={t.thumbnailUrl} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" style={{ border: "1px solid rgba(15,23,42,0.08)" }} />
                                                    </>
                                                    : <div className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-[22px]" style={{ background: "#f3f4f6", border: "1px solid rgba(15,23,42,0.08)" }}>🎨</div>
                                                }

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                        <p className="text-[14px] font-semibold truncate" style={{ color: "#111827" }}>{t.title}</p>
                                                        {statusTab === "DRAFT" && (
                                                            <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={isUpdate ? { background: "#eef2ff", color: "#6366f1" } : { background: "#fffbeb", color: "#d97706" }}>
                                                                {isUpdate ? "수정 신청" : "신규 등록"}
                                                            </span>
                                                        )}
                                                        {isUpdate && t.pendingReviewVisibility === "hide" && (
                                                            <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ background: "#fef2f2", color: "#ef4444" }}>비공개 요청</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap text-[11px]" style={{ color: "#6b7280" }}>
                                                        <span>@{t.creatorNickname ?? t.creatorName}</span>
                                                        <span style={{ color: "#d1d5db" }}>•</span>
                                                        <span>{t.price === 0 ? "무료" : `${t.price.toLocaleString()}원`}</span>
                                                        <span style={{ color: "#d1d5db" }}>•</span>
                                                        <span>{formatKST(t.createdAt, false)}</span>
                                                    </div>
                                                    {t.adminNote && statusTab === "DRAFT" && (
                                                        <p className="text-[11px] mt-2 line-clamp-1" style={{ color: "#ef4444" }}>이전 반려 메모: {t.adminNote}</p>
                                                    )}
                                                </div>

                                                <div className="shrink-0 flex items-center gap-2">
                                                    <span className="text-[12px] font-semibold" style={{ color: "#6b7280" }}>
                                                        {statusTab === "DRAFT" ? "검토하기" : "상세보기"}
                                                    </span>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// ── 테마 상세 패널 ────────────────────────────────────────────────────────────
function ThemeDetailPanel({ theme: t, statusTab, actionLoading, onApprove, onReject, onHide, onUnhide, onBack }: {
    theme: AdminTheme;
    statusTab: "DRAFT" | "PUBLISHED" | "HIDDEN";
    actionLoading: boolean;
    onApprove: (id: string) => void;
    onReject: (id: string, title: string) => void;
    onHide: (id: string) => void;
    onUnhide: (id: string) => void;
    onBack: () => void;
}) {
    const isUpdate = !!t.pendingTitle;
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const detailGuideText =
        statusTab === "DRAFT"
            ? "좌측 요약 정보로 대상을 파악한 뒤, 우측에서 변경점·파일·옵션을 순서대로 검토하세요."
            : "운영 중인 테마의 정보와 첨부 자료를 차분하게 확인할 수 있는 상세 화면입니다.";
    const summaryItems = [
        { label: "크리에이터", value: `@${t.creatorNickname ?? t.creatorName}` },
        { label: "가격", value: t.price === 0 ? "무료" : `${t.price.toLocaleString()}원` },
        { label: "신청일", value: formatKST(t.createdAt, true) },
    ];
    const previewImages = (t.images ?? []).filter((img) => typeof img === "string" && img.trim() !== "");
    const hasVersionFiles = (t.versions?.length ?? 0) > 0;
    const hasOnlyFileOptions = (t.options?.length ?? 0) > 0 && t.options.every((opt) => !opt.myThemeId && !opt.pendingMyThemeId);
    const showOptionSection = (t.options?.length ?? 0) > 0 && !(hasVersionFiles && hasOnlyFileOptions);

    return (
        <div className="flex flex-col h-full min-h-0 rounded-[20px] border bg-white overflow-hidden" style={{ borderColor: "rgba(15,23,42,0.08)" }}>
            <div className="shrink-0 border-b" style={{ borderColor: "rgba(15,23,42,0.06)", background: "#fcfcfd" }}>
                <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-opacity hover:opacity-70"
                            style={{ background: "#f1f5f9", color: "#475569", border: "1px solid rgba(15,23,42,0.06)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            목록으로
                        </button>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: "#9ca3af" }}>
                                {statusTab === "DRAFT" ? "검토 상세" : statusTab === "PUBLISHED" ? "공개 테마 상세" : "숨김 테마 상세"}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-[20px] font-bold tracking-tight truncate" style={{ color: "#111827" }}>{t.title}</h2>
                                {statusTab === "DRAFT" && (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={isUpdate ? { background: "#eef2ff", color: "#6366f1" } : { background: "#fff7ed", color: "#c2410c" }}>
                                        {isUpdate ? "수정 신청" : "신규 등록"}
                                    </span>
                                )}
                                {isUpdate && t.pendingReviewVisibility === "hide" && (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#fef2f2", color: "#ef4444" }}>비공개 요청</span>
                                )}
                                {statusTab === "PUBLISHED" && (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(52,199,89,0.10)", color: "#1a7a3a" }}>공개 중</span>
                                )}
                                {statusTab === "HIDDEN" && (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.07)", color: "#8e8e93" }}>숨김 상태</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        {statusTab === "DRAFT" && (
                            <>
                                <button
                                    onClick={() => onApprove(t.id)}
                                    disabled={actionLoading}
                                    className="px-4 py-2.5 rounded-xl text-[12px] font-bold disabled:opacity-40"
                                    style={{ background: "#111827", color: "#fff" }}
                                >
                                    승인하기
                                </button>
                                <button
                                    onClick={() => onReject(t.id, t.title)}
                                    disabled={actionLoading}
                                    className="px-4 py-2.5 rounded-xl text-[12px] font-bold disabled:opacity-40"
                                    style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
                                >
                                    반려하기
                                </button>
                            </>
                        )}
                        {statusTab === "PUBLISHED" && (
                            <button
                                onClick={() => onHide(t.id)}
                                disabled={actionLoading}
                                className="px-4 py-2.5 rounded-xl text-[12px] font-semibold disabled:opacity-40"
                                style={{ background: "#fff", color: "#6b7280", border: "1px solid rgba(15,23,42,0.10)" }}
                            >
                                숨김 처리
                            </button>
                        )}
                        {statusTab === "HIDDEN" && (
                            <button
                                onClick={() => onUnhide(t.id)}
                                disabled={actionLoading}
                                className="px-4 py-2.5 rounded-xl text-[12px] font-semibold disabled:opacity-40"
                                style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}
                            >
                                공개 복원
                            </button>
                        )}
                    </div>
                </div>
                <div className="px-6 py-3.5 border-t" style={{ borderColor: "rgba(15,23,42,0.04)", background: "#fff" }}>
                    <p className="text-[12px] leading-relaxed" style={{ color: "#6b7280" }}>{detailGuideText}</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="max-w-[1100px] mx-auto px-6 py-6">
                    <div className="grid gap-8" style={{ gridTemplateColumns: "300px minmax(0, 1fr)" }}>
                        <aside className="flex flex-col gap-6">
                            <section>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: "#9ca3af" }}>Overview</p>
                                <div className="flex items-start gap-3 mb-5">
                                    {t.thumbnailUrl
                                        ? <>
                                            <button type="button" onClick={() => setLightboxSrc(t.thumbnailUrl!)} className="shrink-0 block leading-none transition-opacity hover:opacity-80" style={{ background: "transparent", padding: 0, margin: 0, border: "none", lineHeight: 0 }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={t.thumbnailUrl} alt="" className="block w-20 h-20 rounded-3xl object-cover" style={{ border: "1px solid rgba(15,23,42,0.08)", display: "block", verticalAlign: "top" }} />
                                            </button>
                                        </>
                                        : <div className="w-20 h-20 rounded-3xl shrink-0 flex items-center justify-center text-[30px]" style={{ background: "#f3f4f6", border: "1px solid rgba(15,23,42,0.08)" }}>🎨</div>
                                    }
                                    <div className="min-w-0">
                                        <p className="text-[14px] font-semibold leading-[1.4]" style={{ color: "#111827" }}>{t.title}</p>
                                        <p className="text-[11px] mt-1" style={{ color: "#9ca3af" }}>대표 미리보기</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {summaryItems.map((item) => (
                                        <div key={item.label} className="flex flex-col gap-1">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: "#9ca3af" }}>{item.label}</span>
                                            <span className="text-[13px] font-semibold" style={{ color: "#111827" }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {t.tags?.length > 0 && (
                                <section>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-2" style={{ color: "#9ca3af" }}>카테고리</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {t.tags.map((tag) => (
                                            <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "#334155" }}>{tag}</span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {t.description && (
                                <section>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-2" style={{ color: "#9ca3af" }}>설명</p>
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "#374151" }}>{t.description}</p>
                                </section>
                            )}

                            {t.adminNote && (
                                <section>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-2" style={{ color: "#ef4444" }}>이전 반려 메모</p>
                                    <div className="px-4 py-3" style={{ background: "rgba(254,242,242,0.9)", borderLeft: "2px solid rgba(239,68,68,0.4)" }}>
                                        <p className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: "#7f1d1d" }}>{t.adminNote}</p>
                                    </div>
                                </section>
                            )}
                        </aside>

                        <main className="min-w-0">
                            {(t.thumbnailUrl || previewImages.length > 0) && (
                                <section className="pb-8" style={{ borderBottom: "1px solid rgba(15,23,42,0.06)" }}>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-4" style={{ color: "#9ca3af" }}>이미지</p>
                                    <div className="grid grid-cols-5 gap-3">
                                        {t.thumbnailUrl && (
                                            <div className="col-span-2 overflow-hidden rounded-2xl">
                                                <button type="button" onClick={() => setLightboxSrc(t.thumbnailUrl!)} className="block w-full h-full leading-none transition-opacity hover:opacity-80" style={{ background: "transparent", padding: 0, margin: 0, border: "none", lineHeight: 0 }}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={t.thumbnailUrl} alt="대표" className="block w-full h-[184px] object-cover" style={{ display: "block", verticalAlign: "top" }} />
                                                </button>
                                            </div>
                                        )}
                                        <div className={`${t.thumbnailUrl ? "col-span-3" : "col-span-5"} grid grid-cols-4 gap-3`}>
                                            {previewImages.map((img, i) => (
                                                <div key={i} className="overflow-hidden rounded-2xl">
                                                    <button type="button" onClick={() => setLightboxSrc(img)} className="block w-full h-full leading-none transition-opacity hover:opacity-80" style={{ background: "transparent", padding: 0, margin: 0, border: "none", lineHeight: 0 }}>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={img} alt={`#${i + 1}`} className="block w-full h-[88px] object-cover" style={{ display: "block", verticalAlign: "top" }} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {statusTab === "DRAFT" && isUpdate && (
                                <section className="py-8" style={{ borderBottom: "1px solid rgba(15,23,42,0.06)" }}>
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="w-1 h-4 rounded-full" style={{ background: "#6366f1" }} />
                                        <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "#6366f1" }}>변경 내용 비교</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6">
                                        <DiffRow label="테마명" before={t.title} after={t.pendingTitle ?? t.title} />
                                        <DiffRow
                                            label="가격"
                                            before={t.price === 0 ? "무료" : `${t.price.toLocaleString()}원`}
                                            after={t.pendingPrice === null || t.pendingPrice === undefined
                                                ? (t.price === 0 ? "무료" : `${t.price.toLocaleString()}원`)
                                                : (t.pendingPrice === 0 ? "무료" : `${t.pendingPrice.toLocaleString()}원`)}
                                        />
                                        <DiffRow label="설명" before={t.description ?? ""} after={t.pendingDescription ?? t.description ?? ""} />
                                    </div>

                                    {t.pendingTags && (
                                        <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[11px] font-semibold" style={{ color: "#6e6e73" }}>카테고리 변경</span>
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#FFF3E0", color: "#E65100" }}>비교</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="px-3 py-3" style={{ background: "#fafafa", border: "1px solid rgba(15,23,42,0.06)" }}>
                                                    <p className="text-[10px] font-semibold mb-2" style={{ color: "#9ca3af" }}>기존</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(t.tags ?? []).map((tag) => (
                                                            <span key={tag} className="text-[11px] px-2 py-1 rounded-full line-through" style={{ background: "#f1f5f9", color: "#94a3b8" }}>{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="px-3 py-3" style={{ background: "#f8fffb", border: "1px solid rgba(5,150,105,0.12)" }}>
                                                    <p className="text-[10px] font-semibold mb-2" style={{ color: "#059669" }}>변경</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {t.pendingTags.map((tag) => (
                                                            <span key={tag} className="text-[11px] px-2 py-1 rounded-full font-semibold" style={{ background: "#ecfdf5", color: "#059669" }}>{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {t.pendingThumbnailUrl && t.pendingThumbnailUrl !== t.thumbnailUrl && (
                                        <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[11px] font-semibold" style={{ color: "#6e6e73" }}>대표 이미지 변경</span>
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#FFF3E0", color: "#E65100" }}>비교</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-[10px] font-semibold mb-2" style={{ color: "#9ca3af" }}>기존</p>
                                                    {t.thumbnailUrl && <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={t.thumbnailUrl} alt="기존" className="w-20 h-20 rounded-2xl object-cover opacity-60" style={{ border: "1px solid rgba(15,23,42,0.08)" }} />
                                                    </>}
                                                </div>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                <div>
                                                    <p className="text-[10px] font-semibold mb-2" style={{ color: "#059669" }}>변경</p>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={t.pendingThumbnailUrl} alt="변경" className="w-20 h-20 rounded-2xl object-cover" style={{ border: "2px solid #a7f3d0" }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                                    {(t.versions?.length > 0 || showOptionSection) && (
                                <section className="py-8" style={{ borderBottom: "1px solid rgba(15,23,42,0.06)" }}>
                                    <div className="mb-5">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "#9ca3af" }}>{showOptionSection ? "파일 & 옵션" : "첨부 파일"}</p>
                                                <p className="text-[11px] mt-1" style={{ color: "#9ca3af" }}>
                                                    {showOptionSection ? "다운로드, 검증, 목업 확인이 필요한 요소를 한 곳에 모았습니다." : "업로드된 첨부 파일과 검증 결과를 확인합니다."}
                                                </p>
                                    </div>

                                    {t.versions?.length > 0 && (
                                        <div className={t.options?.length > 0 ? "mb-6" : ""}>
                                            <p className="text-[11px] font-semibold mb-3" style={{ color: "#6b7280" }}>첨부 파일</p>
                                            <div className="flex flex-col gap-3">
                                                {t.versions.map((v, vi) => (
                                                    <div key={vi} className="px-4 py-4" style={{ background: "#fafafa", border: "1px solid rgba(15,23,42,0.07)" }}>
                                                        <p className="text-[12px] font-bold mb-3" style={{ color: "#374151" }}>옵션 {vi + 1} — {v.version}</p>
                                                        {v.kthemeFileUrl && (
                                                            <div className="mb-2">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: "#fffbeb", color: "#d97706" }}>iOS · PC</span>
                                                                    <a href={v.kthemeFileUrl} download target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium hover:underline truncate" style={{ color: "#6366f1" }}>{v.kthemeFileUrl.split("/").pop()}</a>
                                                                </div>
                                                                <ValidationBadge fileUrl={v.kthemeFileUrl} fileType="ktheme" />
                                                            </div>
                                                        )}
                                                        {v.apkFileUrl && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: "#ecfdf5", color: "#059669" }}>Android</span>
                                                                    <a href={v.apkFileUrl} download target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium hover:underline truncate" style={{ color: "#6366f1" }}>{v.apkFileUrl.split("/").pop()}</a>
                                                                </div>
                                                                <ValidationBadge fileUrl={v.apkFileUrl} fileType="apk" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                            {showOptionSection && (
                                        <div>
                                            <p className="text-[11px] font-semibold mb-3" style={{ color: "#6b7280" }}>테마 옵션 ({t.options.length})</p>
                                            <div className="flex flex-col gap-3">
                                                {t.options.map((opt, oi) => {
                                                    const hasPendingChange = !!(opt.pendingFileUrl || opt.pendingMyThemeId);
                                                    const isMyTheme = !!opt.myThemeId && !opt.fileUrl;
                                                    const isPendingMyTheme = !!opt.pendingMyThemeId && !opt.pendingFileUrl;

                                                    return (
                                                        <React.Fragment key={opt.id}>
                                                            <div className="px-4 py-4" style={{ background: "#fafafa", border: hasPendingChange ? "1px solid #c7d2fe" : "1px solid rgba(15,23,42,0.07)" }}>
                                                                <div className="flex items-start gap-3 flex-wrap mb-3">
                                                                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0" style={{ background: "#111827", color: "#fff" }}>{oi + 1}</span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[13px] font-bold" style={{ color: "#111827" }}>{opt.name || `옵션 ${oi + 1}`}</p>
                                                                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={opt.os === "ios" ? { background: "#fffbeb", color: "#d97706" } : { background: "#eff6ff", color: "#3b82f6" }}>{opt.os === "ios" ? "iOS" : "Android"}</span>
                                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={isMyTheme ? { background: "#ecfdf5", color: "#059669" } : { background: "#f1f5f9", color: "#64748b" }}>{isMyTheme ? "내 테마" : "파일"}</span>
                                                                            {hasPendingChange && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#eef2ff", color: "#6366f1" }}>변경 신청</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        {opt.fileUrl && !hasPendingChange && <a href={opt.fileUrl} download target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold hover:underline" style={{ color: "#6366f1" }}>다운로드</a>}
                                                                        {isMyTheme && !hasPendingChange && <a href={`/api/admin/themes/export-option?optionId=${opt.id}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold hover:underline" style={{ color: "#059669" }}>.ktheme</a>}
                                                                        {hasPendingChange && opt.pendingFileUrl && <a href={opt.pendingFileUrl} download target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold hover:underline" style={{ color: "#059669" }}>새 파일</a>}
                                                                        {hasPendingChange && isPendingMyTheme && <a href={`/api/admin/themes/export-option?optionId=${opt.id}&pending=1`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold hover:underline" style={{ color: "#059669" }}>새 .ktheme</a>}
                                                                    </div>
                                                                </div>

                                                                {isMyTheme && !hasPendingChange && (opt.myThemeName || opt.myThemePreviewUrl) && (
                                                                    <div className="flex items-center gap-3 px-3 py-2.5" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                                                                        {opt.myThemePreviewUrl && <>
                                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                            <img src={opt.myThemePreviewUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" style={{ border: "1px solid #a7f3d0" }} />
                                                                        </>}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[11px] font-bold truncate" style={{ color: "#059669" }}>내 테마: {opt.myThemeName ?? "이름 없음"}</p>
                                                                            <p className="text-[9px]" style={{ color: "#6ee7b7" }}>카꾸미 에디터 제작</p>
                                                                        </div>
                                                                        <button onClick={() => window.open(`/admin/theme-preview?optionId=${opt.id}`, "_blank")} className="text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0" style={{ background: "#059669", color: "#fff" }}>목업 보기</button>
                                                                    </div>
                                                                )}

                                                                {hasPendingChange && isPendingMyTheme && (opt.pendingMyThemeName || opt.pendingMyThemePreviewUrl) && (
                                                                    <div className="flex items-center gap-3 px-3 py-2.5" style={{ background: "#eef2ff", border: "1px solid #c7d2fe" }}>
                                                                        {opt.pendingMyThemePreviewUrl && <>
                                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                            <img src={opt.pendingMyThemePreviewUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" style={{ border: "1px solid #a5b4fc" }} />
                                                                        </>}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[11px] font-bold truncate" style={{ color: "#6366f1" }}>변경 내 테마: {opt.pendingMyThemeName ?? "이름 없음"}</p>
                                                                            <p className="text-[9px]" style={{ color: "#a5b4fc" }}>카꾸미 에디터 제작</p>
                                                                        </div>
                                                                        <button onClick={() => window.open(`/admin/theme-preview?optionId=${opt.id}&pending=1`, "_blank")} className="text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0" style={{ background: "#6366f1", color: "#fff" }}>목업 보기</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {opt.fileUrl && !hasPendingChange && <ValidationBadge fileUrl={opt.fileUrl as string} fileType={opt.os === "ios" ? "ktheme" : "apk"} />}
                                                            {hasPendingChange && opt.pendingFileUrl && <ValidationBadge fileUrl={opt.pendingFileUrl as string} fileType={opt.os === "ios" ? "ktheme" : "apk"} />}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {t.contentBlocks && t.contentBlocks.trim() !== "" && t.contentBlocks !== "<p></p>" && (
                                <section className="py-8">
                                    <div className="mb-4">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "#9ca3af" }}>테마 상세 정보</p>
                                        <p className="text-[11px] mt-1" style={{ color: "#9ca3af" }}>사용자에게 노출되는 상세 소개 영역입니다.</p>
                                    </div>
                                    <div
                                        className="admin-theme-content px-4 py-4"
                                        style={{ border: "1px solid rgba(15,23,42,0.07)", background: "#fafafa", fontSize: 13, lineHeight: 1.7, color: "#374151" }}
                                        dangerouslySetInnerHTML={{ __html: t.contentBlocks }}
                                    />
                                </section>
                            )}
                        </main>
                    </div>
                </div>
            </div>

            {lightboxSrc && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center"
                    style={{ background: "rgba(15,23,42,0.82)" }}
                    onClick={() => setLightboxSrc(null)}
                >
                    <div className="relative w-screen h-screen flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={lightboxSrc} alt="확대 이미지" className="block max-w-[99vw] max-h-[99vh] object-contain" style={{ display: "block", verticalAlign: "top" }} />
                        <button
                            type="button"
                            onClick={() => setLightboxSrc(null)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                            style={{ background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const APP_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    PENDING:  { label: "대기중",   bg: "rgba(255,149,0,0.10)",  color: "#c97000" },
    APPROVED: { label: "승인",     bg: "rgba(52,199,89,0.10)",  color: "#1a7a3a" },
    REJECTED: { label: "반려",     bg: "rgba(255,59,48,0.08)",  color: "#c0392b" },
};

const REJECT_TEMPLATES = [
    "샘플 퀄리티 기준 미달",
    "저작권 침해 의심",
    "샘플 미첨부",
    "기타 (직접 입력)",
];

function ApplicationsAdminTab({ applications, loading, actionLoading, onAction }: {
    applications: AdminApplication[];
    loading: boolean;
    actionLoading: boolean;
    onAction: (id: string, action: "APPROVED" | "REJECTED", note?: string) => void;
}) {
    const [statusTab, setStatusTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

    const filtered = applications.filter(a => a.status === statusTab);
    const counts = {
        PENDING:  applications.filter(a => a.status === "PENDING").length,
        APPROVED: applications.filter(a => a.status === "APPROVED").length,
        REJECTED: applications.filter(a => a.status === "REJECTED").length,
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>입점 신청</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>크리에이터 입점 신청을 검토하고 승인 또는 반려합니다.</p>
            </div>
            <div className="flex gap-1.5">
                {(["PENDING", "APPROVED", "REJECTED"] as const).map(s => (
                    <button key={s} onClick={() => setStatusTab(s)}
                        className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-all"
                        style={{
                            background: statusTab === s ? APP_STATUS_STYLE[s].bg : "transparent",
                            color: statusTab === s ? APP_STATUS_STYLE[s].color : "#aeaeb2",
                            border: `1px solid ${statusTab === s ? APP_STATUS_STYLE[s].color + "33" : "rgba(0,0,0,0.07)"}`,
                        }}>
                        {APP_STATUS_STYLE[s].label}
                        {counts[s] > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: statusTab === s ? APP_STATUS_STYLE[s].color : "#aeaeb2", color: "#fff" }}>
                                {counts[s]}
                            </span>
                        )}
                    </button>
                ))}
            </div>
            {loading
                ? <EmptyState text="불러오는 중..." />
                : filtered.length === 0
                ? <EmptyState text={`${APP_STATUS_STYLE[statusTab].label} 신청이 없습니다.`} />
                : filtered.map(app => (
                    <ApplicationRow key={app.id} app={app} onAction={onAction} actionLoading={actionLoading} />
                ))
            }
        </div>
    );
}

function ApplicationRow({ app, onAction, actionLoading }: {
    app: AdminApplication;
    onAction: (id: string, action: "APPROVED" | "REJECTED", note?: string) => void;
    actionLoading: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const statusStyle = APP_STATUS_STYLE[app.status] ?? APP_STATUS_STYLE.PENDING;

    const handleTemplateSelect = (t: string) => {
        setSelectedTemplate(t);
        if (t !== "기타 (직접 입력)") setRejectNote(t);
        else setRejectNote("");
    };

    return (
        <div className="flex flex-col rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff" }}>
            <div className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-semibold" style={{ color: "#1c1c1e" }}>{app.userNickname ?? app.userName}</span>
                        {app.userEmail && <span className="text-[11px]" style={{ color: "#aeaeb2" }}>{app.userEmail}</span>}
                        <Badge style={statusStyle} />
                    </div>
                    <p className="text-[11px]" style={{ color: "#aeaeb2" }}>신청일 {new Date(app.createdAt).toLocaleDateString("ko-KR")}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setExpanded(v => !v)}
                        className="text-[12px] px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                        style={{ background: "rgba(0,0,0,0.04)", color: "#636366" }}>
                        {expanded ? "접기" : "상세 보기"}
                    </button>
                    {app.status === "PENDING" && (
                        <>
                            <button onClick={() => onAction(app.id, "APPROVED")} disabled={actionLoading}
                                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-40"
                                style={{ background: "rgba(52,199,89,0.10)", color: "#1a7a3a" }}>승인</button>
                            <button onClick={() => { setShowReject(v => !v); setRejectNote(""); setSelectedTemplate(null); }}
                                disabled={actionLoading}
                                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-40"
                                style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>반려</button>
                        </>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="flex flex-col gap-4 px-5 pb-5" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#aeaeb2" }}>제작 경험</p>
                            <p className="text-[13px]" style={{ color: "#1c1c1e" }}>{app.experience ? "있음" : "없음"}</p>
                        </div>
                        {app.tools?.length > 0 && (
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#aeaeb2" }}>사용 툴</p>
                                <div className="flex flex-wrap gap-1">
                                    {app.tools.map(t => (
                                        <span key={t} className="px-2 py-0.5 rounded-full text-[11px]"
                                            style={{ background: "rgba(255,149,0,0.08)", color: "rgb(180,90,0)" }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#aeaeb2" }}>자기소개</p>
                        <p className="text-[13px] leading-relaxed" style={{ color: "#3a3a3c", whiteSpace: "pre-wrap" }}>{app.reason}</p>
                    </div>
                    {app.portfolio && (
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#aeaeb2" }}>포트폴리오</p>
                            <a href={app.portfolio} target="_blank" rel="noopener noreferrer"
                                className="text-[13px] underline hover:opacity-70" style={{ color: "rgb(74,123,247)" }}>
                                {app.portfolio} →
                            </a>
                        </div>
                    )}
                    {app.sampleImages?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#aeaeb2" }}>샘플 이미지</p>
                            <div className="flex gap-2 flex-wrap">
                                {app.sampleImages.map((src, i) => (
                                    <button key={i} type="button" onClick={() => setLightboxSrc(src)}
                                        className="rounded-xl overflow-hidden transition-opacity hover:opacity-80"
                                        style={{ border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0, width: 112, height: 112 }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={src}
                                            alt={`샘플 ${i + 1}`}
                                            style={{ width: 112, height: 112, objectFit: "cover", display: "block" }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {app.adminNote && app.status === "REJECTED" && (
                        <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(255,59,48,0.04)", borderLeft: "2px solid rgba(255,59,48,0.3)" }}>
                            <p className="text-[11px] font-semibold mb-1" style={{ color: "#c0392b" }}>반려 사유</p>
                            <p className="text-[13px]" style={{ color: "#3a3a3c" }}>{app.adminNote}</p>
                        </div>
                    )}
                </div>
            )}

            {showReject && (
                <div className="flex flex-col gap-3 px-5 pb-5" style={{ borderTop: "1px solid rgba(255,59,48,0.12)", background: "rgba(255,59,48,0.02)" }}>
                    <p className="text-[12px] font-semibold pt-4" style={{ color: "#c0392b" }}>반려 사유 선택</p>
                    <div className="flex flex-wrap gap-2">
                        {REJECT_TEMPLATES.map(t => (
                            <button key={t} type="button" onClick={() => handleTemplateSelect(t)}
                                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                                style={{
                                    background: selectedTemplate === t ? "rgba(255,59,48,0.10)" : "rgba(0,0,0,0.04)",
                                    color: selectedTemplate === t ? "#c0392b" : "#636366",
                                    border: selectedTemplate === t ? "1px solid rgba(255,59,48,0.2)" : "1px solid transparent",
                                }}>
                                {t}
                            </button>
                        ))}
                    </div>
                    <textarea rows={3} value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                        placeholder="반려 사유를 입력하면 신청자에게 이메일로 전달됩니다."
                        className="px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
                        style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", color: "#1c1c1e" }} />
                    <div className="flex gap-2">
                        <button onClick={() => { onAction(app.id, "REJECTED", rejectNote); setShowReject(false); }}
                            disabled={actionLoading || !rejectNote.trim()}
                            className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-80"
                            style={{ background: "#ff3b30" }}>반려 확정</button>
                        <button onClick={() => { setShowReject(false); setRejectNote(""); setSelectedTemplate(null); }}
                            className="px-4 py-2 rounded-xl text-[12px] transition-opacity hover:opacity-70"
                            style={{ background: "rgba(0,0,0,0.05)", color: "#6e6e73" }}>취소</button>
                    </div>
                </div>
            )}

            {lightboxSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.85)" }}
                    onClick={() => setLightboxSrc(null)}>
                    <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={lightboxSrc} alt="" className="max-w-full max-h-[90vh] rounded-xl object-contain" />
                        <button onClick={() => setLightboxSrc(null)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.6)" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsTab({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
    if (loading) return <EmptyState text="불러오는 중..." />;
    if (!stats) return <EmptyState text="통계 데이터를 불러올 수 없습니다." />;

    const maxRevenue = Math.max(...stats.monthlyRevenue.map(r => r.amount), 1);
    const maxSignups = Math.max(...stats.monthlySignups.map(r => r.count), 1);
    const fmtMonth = (m: string) => { const [y, mo] = m.split("-"); return `${y.slice(2)}년 ${Number(mo)}월`; };

    const TOTAL_CARDS = [
        { label: "총 회원",        value: stats.totals.users.toLocaleString() + "명",          accent: "rgb(74,123,247)" },
        { label: "공개 테마",       value: stats.totals.themes.toLocaleString() + "개",          accent: "#FF9500" },
        { label: "총 결제",         value: stats.totals.purchases.toLocaleString() + "건",       accent: "#34c759" },
        { label: "누적 매출",       value: stats.totals.totalRevenue.toLocaleString() + "원",    accent: "#FF9500" },
        { label: "활성 구독",       value: stats.totals.activeSubscriptions.toLocaleString() + "명", accent: "rgb(74,123,247)" },
    ];

    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>통계 / 분석</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>서비스 주요 지표를 한눈에 확인합니다.</p>
            </div>
            <div className="grid grid-cols-5 gap-3">
                {TOTAL_CARDS.map(c => (
                    <div key={c.label} className="flex flex-col gap-1 px-4 py-4 rounded-2xl" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
                        <p className="text-[11px] font-medium" style={{ color: "#aeaeb2" }}>{c.label}</p>
                        <p className="text-[18px] font-bold" style={{ color: c.accent }}>{c.value}</p>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-4 px-5 py-5 rounded-2xl" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
                <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>월별 매출 (최근 6개월)</p>
                {stats.monthlyRevenue.length === 0 ? <EmptyState text="매출 데이터가 없습니다." /> : (
                    <div className="flex items-end gap-3 h-[120px]">
                        {stats.monthlyRevenue.map(r => (
                            <div key={r.month} className="flex flex-col items-center gap-1 flex-1">
                                <span className="text-[10px]" style={{ color: "#aeaeb2" }}>{r.amount.toLocaleString()}원</span>
                                <div className="w-full rounded-t-md" style={{ height: `${Math.max((r.amount / maxRevenue) * 80, 4)}px`, background: "rgba(255,149,0,0.7)" }} />
                                <span className="text-[9px]" style={{ color: "#aeaeb2" }}>{fmtMonth(r.month)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4 px-5 py-5 rounded-2xl" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
                <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>월별 신규 가입자 (최근 6개월)</p>
                {stats.monthlySignups.length === 0 ? <EmptyState text="가입자 데이터가 없습니다." /> : (
                    <div className="flex items-end gap-3 h-[120px]">
                        {stats.monthlySignups.map(r => (
                            <div key={r.month} className="flex flex-col items-center gap-1 flex-1">
                                <span className="text-[10px]" style={{ color: "#aeaeb2" }}>{r.count}명</span>
                                <div className="w-full rounded-t-md" style={{ height: `${Math.max((r.count / maxSignups) * 80, 4)}px`, background: "rgba(74,123,247,0.7)" }} />
                                <span className="text-[9px]" style={{ color: "#aeaeb2" }}>{fmtMonth(r.month)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-3">
                <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>판매량 TOP 5 테마</p>
                {stats.topThemes.length === 0 ? <EmptyState text="데이터가 없습니다." /> : stats.topThemes.map((t, i) => (
                    <div key={t.id} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <span className="text-[14px] font-bold w-5 text-center shrink-0" style={{ color: i < 3 ? "#FF9500" : "#aeaeb2" }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>{t.title}</p>
                            <p className="text-[11px]" style={{ color: "#aeaeb2" }}>{t.creatorName}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{t.revenue.toLocaleString()}원</p>
                            <p className="text-[11px]" style={{ color: "#aeaeb2" }}>{t.salesCount}건 판매</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReviewsAdminTab({ reviews, loading, actionLoading, onDelete }: {
    reviews: AdminReview[]; loading: boolean; actionLoading: boolean;
    onDelete: (id: string) => void;
}) {
    const STARS = [5, 4, 3, 2, 1];
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const filtered = filterRating ? reviews.filter(r => r.rating === filterRating) : reviews;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>리뷰 관리</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>테마 리뷰를 검토하고 부적절한 리뷰를 삭제합니다.</p>
            </div>
            <div className="flex items-center gap-1.5">
                <button onClick={() => setFilterRating(null)} className="px-3 py-1.5 rounded-full text-[12px] transition-all" style={{ background: filterRating === null ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.05)", color: filterRating === null ? "#1c1c1e" : "#8e8e93", fontWeight: filterRating === null ? 700 : 400 }}>전체</button>
                {STARS.map(s => (
                    <button key={s} onClick={() => setFilterRating(s)} className="px-3 py-1.5 rounded-full text-[12px] transition-all" style={{ background: filterRating === s ? "rgba(255,149,0,0.12)" : "rgba(0,0,0,0.05)", color: filterRating === s ? "#c97000" : "#8e8e93", fontWeight: filterRating === s ? 700 : 400 }}>{"★".repeat(s)}</button>
                ))}
            </div>
            <SectionHeader title="리뷰 목록" count={filtered.length} />
            {loading ? <EmptyState text="불러오는 중..." /> : filtered.length === 0 ? <EmptyState text="리뷰가 없습니다." /> : filtered.map(r => (
                <div key={r.id} className="flex items-start gap-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span style={{ color: "#FF9500", fontSize: 13 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                            <span className="text-[12px] font-medium" style={{ color: "#1c1c1e" }}>{r.themeTitle}</span>
                        </div>
                        <p className="text-[11px]" style={{ color: "#aeaeb2" }}>{r.userNickname ?? r.userName} · {formatKST(r.createdAt, false)}</p>
                        {r.content && <p className="text-[12px] mt-1" style={{ color: "#3a3a3c" }}>{r.content}</p>}
                    </div>
                    <button onClick={() => { if (confirm("이 리뷰를 삭제하시겠습니까?")) onDelete(r.id); }} disabled={actionLoading} className="shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(255,59,48,0.07)", color: "#ff3b30" }}>삭제</button>
                </div>
            ))}
        </div>
    );
}

function GalleryPostsAdminTab({ posts, loading, actionLoading, onDelete }: {
    posts: AdminGalleryPost[]; loading: boolean; actionLoading: boolean;
    onDelete: (id: string) => void;
}) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>갤러리 게시글</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>갤러리 게시글을 검토하고 부적절한 게시글을 삭제합니다.</p>
            </div>
            <SectionHeader title="게시글 목록" count={posts.length} />
            {loading ? <EmptyState text="불러오는 중..." /> : posts.length === 0 ? <EmptyState text="게시글이 없습니다." /> : posts.map(p => (
                <div key={p.id} className="flex items-start gap-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    {p.images?.[0] && <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" style={{ border: "1px solid rgba(0,0,0,0.07)" }} />
                    </>}
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>{p.themeName}</p>
                        <p className="text-[11px]" style={{ color: "#aeaeb2" }}>
                            {p.userNickname ?? p.userName} · ♥ {p.likeCount} · 댓글 {p.commentCount} · {formatKST(p.createdAt, false)}
                        </p>
                        {p.description && <p className="text-[11px] mt-0.5 truncate" style={{ color: "#6e6e73" }}>{p.description}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <a href={`/gallery/${p.id}`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70" style={{ background: "rgba(74,123,247,0.07)", color: "rgb(74,123,247)" }}>보기</a>
                        <button onClick={() => { if (confirm("이 게시글을 삭제하시겠습니까?")) onDelete(p.id); }} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(255,59,48,0.07)", color: "#ff3b30" }}>삭제</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

const SUB_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    ACTIVE:    { label: "활성",    bg: "rgba(52,199,89,0.10)",  color: "#1a7a3a" },
    CANCELLED: { label: "해지",    bg: "rgba(255,59,48,0.08)",  color: "#ff3b30" },
    EXPIRED:   { label: "만료",    bg: "rgba(0,0,0,0.07)",      color: "#8e8e93" },
};

function SubscriptionsAdminTab({ subscriptions, loading, actionLoading, onCancel }: {
    subscriptions: AdminSubscription[]; loading: boolean; actionLoading: boolean;
    onCancel: (id: string) => void;
}) {
    const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "CANCELLED" | "EXPIRED">("ALL");
    const filtered = filter === "ALL" ? subscriptions : subscriptions.filter(s => s.status === filter);
    const activeCnt = subscriptions.filter(s => s.status === "ACTIVE").length;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>구독 관리</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>구독 현황을 확인하고 강제 해지를 처리합니다.</p>
            </div>
            <div className="flex items-center gap-2">
                <Badge style={{ label: `활성 ${activeCnt}명`, bg: "rgba(52,199,89,0.10)", color: "#1a7a3a" }} />
                <div className="flex gap-1.5 ml-2">
                    {(["ALL", "ACTIVE", "CANCELLED", "EXPIRED"] as const).map(s => (
                        <button key={s} onClick={() => setFilter(s)} className="px-3 py-1.5 rounded-full text-[12px] transition-all" style={{ background: filter === s ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.05)", color: filter === s ? "#1c1c1e" : "#8e8e93", fontWeight: filter === s ? 700 : 400 }}>
                            {s === "ALL" ? "전체" : SUB_STATUS_STYLE[s].label}
                        </button>
                    ))}
                </div>
            </div>
            <SectionHeader title="구독 목록" count={filtered.length} />
            {loading ? <EmptyState text="불러오는 중..." /> : filtered.length === 0 ? <EmptyState text="구독 내역이 없습니다." /> : filtered.map(s => (
                <div key={s.id} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>{s.userNickname ?? s.userName}</span>
                            <Badge style={SUB_STATUS_STYLE[s.status] ?? { label: s.status, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                        </div>
                        <p className="text-[11px]" style={{ color: "#aeaeb2" }}>
                            {s.userEmail} · {s.amount.toLocaleString()}원/월 · 시작 {formatKST(s.startedAt, false)}
                            {s.nextBillingAt && ` · 다음 결제 ${formatKST(s.nextBillingAt, false)}`}
                            {s.cardCompany && ` · ${s.cardCompany} ${s.cardNumber ?? ""}`}
                        </p>
                    </div>
                    {s.status === "ACTIVE" && (
                        <button onClick={() => { if (confirm(`${s.userNickname ?? s.userName}의 구독을 강제 해지하시겠습니까?`)) onCancel(s.id); }} disabled={actionLoading} className="shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(255,59,48,0.07)", color: "#ff3b30" }}>강제 해지</button>
                    )}
                </div>
            ))}
        </div>
    );
}

const REFUND_STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
    REFUND_REQUESTED: { label: "요청 대기", bg: "rgba(255,149,0,0.10)", color: "#c97000" },
    REFUNDED:         { label: "환불 완료", bg: "rgba(52,199,89,0.10)",  color: "#1a7a3a" },
};

function RefundsAdminTab({ refunds, loading, actionLoading, onApprove, onReject }: {
    refunds: AdminRefund[]; loading: boolean; actionLoading: boolean;
    onApprove: (id: string) => void; onReject: (id: string) => void;
}) {
    const pending = refunds.filter(r => r.status === "REFUND_REQUESTED");
    const done = refunds.filter(r => r.status === "REFUNDED");

    const renderItem = (r: AdminRefund) => (
        <div key={r.id} className="flex items-start gap-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>{r.themeTitle}</span>
                    <Badge style={REFUND_STATUS_STYLE[r.status] ?? { label: r.status, bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />
                </div>
                <p className="text-[11px]" style={{ color: "#aeaeb2" }}>
                    구매자: {r.buyerNickname ?? r.buyerName} · 크리에이터: {r.creatorNickname ?? r.creatorName} · {r.amount.toLocaleString()}원 · {formatKST(r.createdAt, false)}
                </p>
                {r.refundReason && <p className="text-[11px] mt-0.5" style={{ color: "#6e6e73" }}>사유: {r.refundReason}</p>}
                {r.refundedAt && <p className="text-[11px] mt-0.5" style={{ color: "#aeaeb2" }}>환불일: {formatKST(r.refundedAt, false)}</p>}
            </div>
            {r.status === "REFUND_REQUESTED" && (
                <div className="flex gap-2 shrink-0">
                    <button onClick={() => onApprove(r.id)} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(52,199,89,0.08)", color: "#1a7a3a" }}>승인</button>
                    <button onClick={() => onReject(r.id)} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(0,0,0,0.05)", color: "#8e8e93" }}>거절</button>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>환불 관리</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>사용자의 환불 요청을 승인하거나 거절합니다.</p>
            </div>
            {loading ? <EmptyState text="불러오는 중..." /> : (
                <>
                    <div>
                        <SectionHeader title="요청 대기" count={pending.length} />
                        {pending.length === 0 ? <EmptyState text="대기 중인 환불 요청이 없습니다." /> : pending.map(renderItem)}
                    </div>
                    {done.length > 0 && (
                        <div>
                            <SectionHeader title="처리 완료" count={done.length} />
                            {done.map(renderItem)}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function CreatorsAdminTab({ creators, loading, actionLoading, onAction }: {
    creators: AdminCreator[]; loading: boolean; actionLoading: boolean;
    onAction: (userId: string, action: string) => void;
}) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>크리에이터 관리</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>크리에이터 목록과 매출 현황을 관리합니다.</p>
            </div>
            <SectionHeader title="크리에이터 목록" count={creators.length} />
            {loading ? <EmptyState text="불러오는 중..." /> : creators.length === 0 ? <EmptyState text="크리에이터가 없습니다." /> : creators.map(c => (
                <div key={c.id} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>{c.nickname ?? c.name}</span>
                            {c.isSuspended && <Badge style={{ label: "정지", bg: "rgba(255,59,48,0.10)", color: "#ff3b30" }} />}
                        </div>
                        <p className="text-[11px]" style={{ color: "#aeaeb2" }}>
                            {c.email ?? "이메일 없음"} · 공개 테마 {c.themeCount}개 · 판매 {c.totalSales}건 · 매출 {c.totalRevenue.toLocaleString()}원
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {!c.isSuspended
                            ? <button onClick={() => onAction(c.id, "suspend")} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-30" style={{ background: "rgba(255,149,0,0.08)", color: "#c97000" }}>정지</button>
                            : <button onClick={() => onAction(c.id, "unsuspend")} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40" style={{ background: "rgba(52,199,89,0.08)", color: "#1a7a3a" }}>해제</button>
                        }
                        <button onClick={() => { if (confirm(`${c.nickname ?? c.name}의 크리에이터 자격을 박탈하시겠습니까?`)) onAction(c.id, "revoke"); }} disabled={actionLoading} className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-30" style={{ background: "rgba(255,59,48,0.07)", color: "#ff3b30" }}>자격 박탈</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function BroadcastAdminTab({ actionLoading, onSend }: {
    actionLoading: boolean;
    onSend: (form: { title: string; body: string; linkUrl: string; target: string; userId: string }) => void;
}) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [target, setTarget] = useState<"all" | "creators" | "user">("all");
    const [userId, setUserId] = useState("");
    const [sent, setSent] = useState(false);

    const handleSend = async () => {
        if (!title.trim() || !body.trim()) return;
        const label = target === "all" ? "전체 회원" : target === "creators" ? "크리에이터 전체" : `사용자 (${userId})`;
        if (!confirm(`${label}에게 알림을 발송하시겠습니까?`)) return;
        await onSend({ title, body, linkUrl, target, userId });
        setSent(true);
        setTitle(""); setBody(""); setLinkUrl(""); setUserId("");
        setTimeout(() => setSent(false), 3000);
    };

    const TARGET_OPTIONS: { key: "all" | "creators" | "user"; label: string; desc: string }[] = [
        { key: "all",      label: "전체 회원",      desc: "탈퇴·정지되지 않은 모든 회원" },
        { key: "creators", label: "크리에이터 전체", desc: "활성 크리에이터 계정" },
        { key: "user",     label: "특정 사용자",     desc: "ID 또는 닉네임으로 검색" },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>알림 발송</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>공지·이벤트 알림을 대상별로 발송합니다.</p>
            </div>
            <div className="flex flex-col gap-5 p-5 rounded-2xl" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", maxWidth: 560 }}>
                <div className="flex flex-col gap-2">
                    <p className="text-[12px] font-semibold" style={{ color: "#6e6e73" }}>발송 대상</p>
                    <div className="flex flex-col gap-1.5">
                        {TARGET_OPTIONS.map(opt => (
                            <button key={opt.key} type="button" onClick={() => setTarget(opt.key)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                                style={{ background: target === opt.key ? "rgba(255,149,0,0.06)" : "rgba(0,0,0,0.02)", border: `1px solid ${target === opt.key ? "rgba(255,149,0,0.3)" : "rgba(0,0,0,0.06)"}` }}>
                                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: target === opt.key ? "#FF9500" : "#d1d1d6" }}>
                                    {target === opt.key && <div className="w-2 h-2 rounded-full" style={{ background: "#FF9500" }} />}
                                </div>
                                <div>
                                    <p className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>{opt.label}</p>
                                    <p className="text-[11px]" style={{ color: "#aeaeb2" }}>{opt.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                    {target === "user" && (
                        <input type="text" value={userId} onChange={e => setUserId(e.target.value)} placeholder="사용자 ID 또는 닉네임" className="mt-1 px-3 py-2.5 rounded-xl text-[13px] outline-none" style={{ border: "1px solid rgba(0,0,0,0.10)", color: "#1c1c1e", background: "rgba(0,0,0,0.02)" }} />
                    )}
                </div>
                <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] font-semibold" style={{ color: "#6e6e73" }}>알림 제목</p>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 카꾸미 업데이트 안내" className="px-3 py-2.5 rounded-xl text-[13px] outline-none" style={{ border: "1px solid rgba(0,0,0,0.10)", color: "#1c1c1e", background: "rgba(0,0,0,0.02)" }} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] font-semibold" style={{ color: "#6e6e73" }}>알림 내용</p>
                    <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="알림 본문을 입력하세요..." rows={4} className="px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none" style={{ border: "1px solid rgba(0,0,0,0.10)", color: "#1c1c1e", background: "rgba(0,0,0,0.02)" }} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] font-semibold" style={{ color: "#6e6e73" }}>링크 URL <span style={{ color: "#aeaeb2", fontWeight: 400 }}>(선택)</span></p>
                    <input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="/store 또는 https://..." className="px-3 py-2.5 rounded-xl text-[13px] outline-none" style={{ border: "1px solid rgba(0,0,0,0.10)", color: "#1c1c1e", background: "rgba(0,0,0,0.02)" }} />
                </div>
                <button onClick={handleSend} disabled={!title.trim() || !body.trim() || actionLoading || (target === "user" && !userId.trim())} className="py-3 rounded-xl text-[13px] font-semibold disabled:opacity-40 transition-opacity hover:opacity-80" style={{ background: "rgb(255,149,0)", color: "#fff" }}>
                    {actionLoading ? "발송 중..." : sent ? "✓ 발송 완료" : "알림 발송"}
                </button>
            </div>
        </div>
    );
}

const MAILBOX_TYPE_LABEL: Record<string, string> = {
    SUGGESTION: "건의사항",
    BUG_REPORT: "버그 제보",
};

function MailboxAdminTab({ mailboxes, loading, actionLoading, onAction }: {
    mailboxes: AdminMailbox[];
    loading: boolean;
    actionLoading: boolean;
    onAction: (mailboxId: string, status: "PENDING" | "REVIEWED", adminNote?: string) => void;
}) {
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "REVIEWED">("ALL");
    const [noteMap, setNoteMap] = useState<Record<string, string>>({});
    const filtered = filter === "ALL" ? mailboxes : mailboxes.filter(m => m.status === filter);
    const pendingCnt = mailboxes.filter(m => m.status === "PENDING").length;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>우체통</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>사용자가 보낸 건의사항과 버그 제보를 확인합니다.</p>
            </div>
            <div className="flex items-center gap-2">
                {pendingCnt > 0 && <Badge style={{ label: `미처리 ${pendingCnt}건`, bg: "rgba(255,149,0,0.10)", color: "#c97000" }} />}
                <div className="flex gap-1.5 ml-2">
                    {(["ALL", "PENDING", "REVIEWED"] as const).map(s => (
                        <button key={s} onClick={() => setFilter(s)} className="px-3 py-1.5 rounded-full text-[12px] transition-all"
                            style={{ background: filter === s ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.05)", color: filter === s ? "#1c1c1e" : "#8e8e93", fontWeight: filter === s ? 700 : 400 }}>
                            {s === "ALL" ? "전체" : s === "PENDING" ? "미처리" : "처리 완료"}
                        </button>
                    ))}
                </div>
            </div>
            <SectionHeader title="우체통 목록" count={filtered.length} />
            {loading ? <EmptyState text="불러오는 중..." /> : filtered.length === 0 ? <EmptyState text="내역이 없습니다." /> : filtered.map(m => (
                <div key={m.id} className="flex flex-col gap-3 p-4 rounded-2xl" style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff" }}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: m.type === "BUG_REPORT" ? "rgba(255,59,48,0.08)" : "rgba(74,123,247,0.08)", color: m.type === "BUG_REPORT" ? "#ff3b30" : "rgb(74,123,247)" }}>
                                    {MAILBOX_TYPE_LABEL[m.type] ?? m.type}
                                </span>
                                <span className="text-[13px] font-medium truncate" style={{ color: "#1c1c1e" }}>{m.title}</span>
                                {m.status === "REVIEWED" && <Badge style={{ label: "처리 완료", bg: "rgba(52,199,89,0.10)", color: "#1a7a3a" }} />}
                            </div>
                            <p className="text-[11px]" style={{ color: "#aeaeb2" }}>{m.userNickname ?? m.userName} · {formatKST(m.createdAt, false)}</p>
                        </div>
                        {m.status === "PENDING" && (
                            <button onClick={() => onAction(m.id, "REVIEWED", noteMap[m.id])} disabled={actionLoading}
                                className="shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40"
                                style={{ background: "rgba(52,199,89,0.08)", color: "#1a7a3a" }}>처리 완료</button>
                        )}
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: "#3a3a3c", whiteSpace: "pre-wrap" }}>{m.content}</p>
                    {m.images && m.images.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {m.images.map((url, idx) => (
                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt={`첨부이미지 ${idx + 1}`} className="w-14 h-14 rounded-xl object-cover transition-opacity hover:opacity-70" style={{ border: "1px solid rgba(0,0,0,0.08)" }} />
                                </a>
                            ))}
                        </div>
                    )}
                    {m.adminNote && (
                        <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(52,199,89,0.04)", borderLeft: "2px solid rgba(52,199,89,0.3)" }}>
                            <p className="text-[11px]" style={{ color: "#1a7a3a" }}>관리자 메모: {m.adminNote}</p>
                        </div>
                    )}
                    {m.status === "PENDING" && (
                        <textarea
                            rows={2}
                            value={noteMap[m.id] ?? ""}
                            onChange={e => setNoteMap(prev => ({ ...prev, [m.id]: e.target.value }))}
                            placeholder="관리자 메모 (선택)"
                            className="px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
                            style={{ border: "1px solid rgba(0,0,0,0.08)", color: "#1c1c1e", background: "rgba(0,0,0,0.02)" }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

function GalleryReportsTab({ reports, loading, actionLoading, onAction }: {
    reports: AdminGalleryReport[];
    loading: boolean;
    actionLoading: boolean;
    onAction: (reportId: string, action: "handle" | "delete_comment", commentId?: string) => void;
}) {
    const pending = reports.filter(r => !r.isHandled);
    const done = reports.filter(r => r.isHandled);

    const renderItem = (r: AdminGalleryReport) => (
        <div key={r.id} className="flex items-start gap-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <a href={`/gallery/${r.postId}`} target="_blank" rel="noopener noreferrer"
                        className="text-[13px] font-medium truncate hover:opacity-70 underline"
                        style={{ color: "rgb(74,123,247)" }}>{r.postThemeName}</a>
                    {r.isHandled && <Badge style={{ label: "처리 완료", bg: "rgba(52,199,89,0.10)", color: "#1a7a3a" }} />}
                    {r.commentIsDeleted && <Badge style={{ label: "댓글 삭제됨", bg: "rgba(0,0,0,0.07)", color: "#8e8e93" }} />}
                </div>
                <p className="text-[11px]" style={{ color: "#aeaeb2" }}>
                    신고자: {r.reporterNickname ?? r.reporterName} · {formatKST(r.createdAt, false)}
                </p>
                <p className="text-[12px] mt-1 px-3 py-2 rounded-lg" style={{ color: "#3a3a3c", background: "rgba(0,0,0,0.03)", whiteSpace: "pre-wrap" }}>
                    댓글: {r.commentIsDeleted ? "(삭제된 댓글)" : r.commentContent}
                </p>
            </div>
            {!r.isHandled && (
                <div className="flex flex-col gap-1.5 shrink-0">
                    {!r.commentIsDeleted && (
                        <button onClick={() => { if (confirm("이 댓글을 삭제하시겠습니까?")) onAction(r.id, "delete_comment", r.commentId); }}
                            disabled={actionLoading}
                            className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40"
                            style={{ background: "rgba(255,59,48,0.07)", color: "#ff3b30" }}>댓글 삭제</button>
                    )}
                    <button onClick={() => onAction(r.id, "handle")} disabled={actionLoading}
                        className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-opacity hover:opacity-70 disabled:opacity-40"
                        style={{ background: "rgba(52,199,89,0.08)", color: "#1a7a3a" }}>처리 완료</button>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#1c1c1e" }}>갤러리 신고</h1>
                <p className="text-[13px] mt-1" style={{ color: "#aeaeb2" }}>갤러리 댓글 신고를 검토하고 처리합니다.</p>
            </div>
            {loading ? <EmptyState text="불러오는 중..." /> : (
                <>
                    <div>
                        <SectionHeader title="처리 대기" count={pending.length} />
                        {pending.length === 0 ? <EmptyState text="처리 대기 중인 신고가 없습니다." /> : pending.map(renderItem)}
                    </div>
                    {done.length > 0 && (
                        <div>
                            <SectionHeader title="처리 완료" count={done.length} />
                            {done.map(renderItem)}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

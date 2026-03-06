"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { formatKST } from "@/lib/date";

/* ── 자주 묻는 질문 카테고리 ── */
const FAQ_CATEGORIES = ["전체", "주문/결제", "취소/환불", "이벤트/적립/혜택", "회원", "테마 등록", "저작권/신고", "기타"] as const;
type FaqCategory = typeof FAQ_CATEGORIES[number];

const TAG_STYLE: Record<string, { bg: string; color: string }> = {
    "주문/결제":       { bg: "rgba(170,189,232,0.35)", color: "#3a5a8a" },
    "취소/환불":       { bg: "rgba(255,100,100,0.15)", color: "#c0392b" },
    "이벤트/적립/혜택": { bg: "rgba(255,239,154,0.6)",  color: "#7a5c00" },
    "회원":           { bg: "rgba(199,239,199,0.6)",   color: "#1a6a3a" },
    "테마 등록":       { bg: "rgba(237,187,139,0.35)", color: "#875322" },
    "저작권/신고":     { bg: "rgba(180,120,230,0.18)", color: "#6a2d8a" },
    "기타":           { bg: "rgba(0,0,0,0.07)",        color: "#4b4b4e" },
};

/* ── 자주 묻는 질문 데이터 ── */
const faqs: { q: string; a: string; category: FaqCategory }[] = [
    {
        category: "기타",
        q: "카꾸미는 무료인가요?",
        a: "네, 카꾸미의 기본 테마 제작 기능은 완전 무료로 제공됩니다. 별도의 설치 없이 브라우저에서 바로 사용하실 수 있어요.",
    },
    {
        category: "기타",
        q: "만든 테마는 어떻게 적용하나요?",
        a: "테마 만들기 페이지에서 제작 완료 후 다운로드 버튼을 눌러 .ktheme 파일을 받고, 카카오톡 앱 설정 > 테마 메뉴에서 직접 적용할 수 있어요.",
    },
    {
        category: "기타",
        q: "iOS와 Android 모두 지원하나요?",
        a: "네, iOS용 .ktheme 파일과 Android APK 빌드 모두 지원합니다. 제작 화면 상단에서 원하는 플랫폼을 선택해 주세요.",
    },
    {
        category: "주문/결제",
        q: "테마를 스토어에서 구매하려면 어떻게 하나요?",
        a: "카카오 로그인 후 테마 스토어에서 원하는 테마를 선택하고 결제하시면 됩니다. 결제 완료 후 바로 다운로드할 수 있어요.",
    },
    {
        category: "주문/결제",
        q: "결제 수단은 어떤 것이 있나요?",
        a: "카카오페이, 신용카드, 계좌이체를 지원합니다. 결제 시 원하는 수단을 선택해 주세요.",
    },
    {
        category: "취소/환불",
        q: "구매한 테마를 환불할 수 있나요?",
        a: "디지털 콘텐츠 특성상 다운로드 전에만 환불이 가능합니다. 다운로드 이후에는 환불이 어려운 점 양해 부탁드려요.",
    },
    {
        category: "이벤트/적립/혜택",
        q: "적립금은 어떻게 쌓이나요?",
        a: "테마 구매 시 결제 금액의 5%가 적립금으로 적립됩니다. 적립금은 다음 구매 시 현금처럼 사용할 수 있어요.",
    },
    {
        category: "회원",
        q: "회원 탈퇴 후 재가입이 가능한가요?",
        a: "네, 탈퇴 후 30일이 지나면 동일한 카카오 계정으로 재가입이 가능합니다. 단, 탈퇴 시 보유한 적립금은 소멸됩니다.",
    },
    {
        category: "기타",
        q: "다크모드 테마도 만들 수 있나요?",
        a: "네, 테마 만들기 화면에서 다크모드 토글을 켜면 다크 테마를 별도로 설정할 수 있어요.",
    },
    {
        category: "기타",
        q: "업로드한 이미지는 어디에 저장되나요?",
        a: "업로드하신 이미지는 테마 파일 생성에만 사용되며, 서버에 영구 저장되지 않습니다.",
    },
    {
        category: "테마 등록",
        q: "테마를 스토어에 등록하려면 어떻게 해야 하나요?",
        a: "카카오 로그인 후 상단 메뉴의 '테마 등록'을 클릭해 제작한 테마 파일과 미리보기 이미지를 업로드하면 됩니다. 검수 후 스토어에 게시돼요.",
    },
    {
        category: "테마 등록",
        q: "검토는 얼마나 걸리나요?",
        a: "등록 신청 후 영업일 기준 1~2일 이내에 검토가 완료됩니다. 검토 결과는 이메일로 안내드려요.",
    },
    {
        category: "테마 등록",
        q: "등록이 거절되면 어떻게 되나요?",
        a: "거절 시 사유를 이메일로 안내해 드립니다. 사유를 확인하고 수정한 후 재등록 신청이 가능해요.",
    },
    {
        category: "테마 등록",
        q: "등록한 테마의 카테고리를 변경할 수 있나요?",
        a: "한 번 등록한 테마는 카테고리 변경이 제한될 수 있습니다. 변경이 필요한 경우 고객센터 1:1 문의를 통해 요청해 주세요.",
    },
    {
        category: "테마 등록",
        q: "등록 후 테마 파일을 수정할 수 있나요?",
        a: "등록 후 파일 수정은 재검토 절차가 필요합니다. 수정 후 재업로드하시면 검토 완료 후 반영돼요.",
    },
    {
        category: "테마 등록",
        q: "판매 수익은 언제 정산되나요?",
        a: "판매 수익은 매월 1일에 정산되며, 등록하신 계좌로 지급됩니다. 정산 내역은 마이페이지에서 확인하실 수 있어요.",
    },
    {
        category: "테마 등록",
        q: "수익 구조는 어떻게 되나요?",
        a: "테마 판매 금액에서 카꾸미 수수료 20%를 제외한 80%가 창작자에게 지급됩니다. 예를 들어 1,000원짜리 테마가 판매되면 800원이 창작자 수익으로 정산돼요.",
    },
    {
        category: "주문/결제",
        q: "결제 후 영수증을 받을 수 있나요?",
        a: "결제 완료 후 등록된 이메일로 영수증이 자동 발송됩니다.",
    },
    {
        category: "취소/환불",
        q: "환불은 얼마나 걸리나요?",
        a: "환불 신청 후 영업일 기준 3~5일 이내 처리됩니다. 카드사에 따라 최대 7일 소요될 수 있어요.",
    },
    {
        category: "취소/환불",
        q: "적립금으로 결제한 경우 환불은 어떻게 되나요?",
        a: "적립금 사용분은 적립금으로 재환급되고, 현금 결제분은 원결제 수단으로 환불됩니다.",
    },
    {
        category: "이벤트/적립/혜택",
        q: "적립금 유효기간이 있나요?",
        a: "적립금은 마지막 사용일 또는 적립일로부터 1년간 유효합니다.",
    },
    {
        category: "이벤트/적립/혜택",
        q: "친구 추천 혜택이 있나요?",
        a: "친구 추천 시 추천인과 피추천인 모두에게 적립금 혜택을 드립니다. 마이페이지의 추천 코드를 공유해 보세요.",
    },
    {
        category: "회원",
        q: "개인정보는 어떻게 관리되나요?",
        a: "개인정보는 암호화되어 저장되며, 제3자에게 제공되지 않습니다. 자세한 내용은 개인정보처리방침을 확인해 주세요.",
    },
    {
        category: "테마 등록",
        q: "테마 등록 개수 제한이 있나요?",
        a: "1인당 최대 50개까지 등록 가능합니다. 한도 증가가 필요하면 1:1 문의로 요청해 주세요.",
    },
    {
        category: "테마 등록",
        q: "등록한 테마를 비공개로 전환할 수 있나요?",
        a: "네, 마이페이지 > 내 테마에서 공개/비공개 전환이 가능합니다.",
    },
    {
        category: "테마 등록",
        q: "타인의 이미지를 사용한 테마는 등록 가능한가요?",
        a: "저작권 침해 소지가 있는 이미지는 등록이 거절됩니다. 직접 제작하거나 상업적 이용이 가능한 이미지만 사용해 주세요.",
    },
    {
        category: "테마 등록",
        q: "테마 판매를 중단하고 싶어요",
        a: "마이페이지 > 내 테마에서 판매 중단 처리가 가능합니다. 기존 구매자는 계속 사용할 수 있어요.",
    },
    {
        category: "저작권/신고",
        q: "테마에 사용된 이미지의 저작권은 누구에게 있나요?",
        a: "테마에 포함된 이미지의 저작권은 해당 이미지를 제작하거나 정당한 사용 권한을 가진 창작자에게 있습니다. 카꾸미는 창작자가 업로드한 콘텐츠에 대한 저작권을 주장하지 않으며, 창작자는 직접 제작하거나 상업적 이용이 허가된 이미지만 사용해야 합니다.",
    },
    {
        category: "저작권/신고",
        q: "불법 복제 테마를 발견했어요. 어떻게 신고하나요?",
        a: "테마 상세 페이지의 '신고' 버튼을 클릭하거나, 고객센터 1:1 문의를 통해 신고해 주세요. 신고 내용을 확인 후 영업일 기준 2~3일 이내에 처리 결과를 안내드립니다.",
    },
    {
        category: "저작권/신고",
        q: "저작권 분쟁이 발생했어요. 어떻게 처리되나요?",
        a: "저작권 분쟁이 접수되면 카꾸미는 해당 테마를 임시 비공개 처리하고 양측에 소명 기회를 드립니다. 분쟁이 해결되지 않을 경우 관련 법령에 따라 처리되며, 권리자의 요청이 확인되면 해당 콘텐츠는 영구 삭제될 수 있습니다.",
    },
];

/* ── 이용방법 데이터 ── */
const howToSteps = [
    {
        step: "01",
        title: "카카오 로그인",
        desc: "우측 상단의 카카오 로그인 버튼을 눌러 계정으로 로그인하세요. 로그인 없이도 테마 제작은 가능하지만, 스토어 등록 및 마이페이지 기능을 이용하려면 로그인이 필요해요.",
    },
    {
        step: "02",
        title: "테마 만들기",
        desc: "상단 메뉴의 '테마 만들기'를 클릭하세요. 왼쪽 패널에서 탭바, 헤더, 말풍선 등 각 요소의 색상을 컬러 피커로 자유롭게 변경할 수 있어요.",
    },
    {
        step: "03",
        title: "실시간 미리보기 확인",
        desc: "중앙의 목업 화면에서 실시간으로 내 테마가 어떻게 보이는지 확인하세요. 친구 목록, 채팅방, 더보기 등 탭별로 미리볼 수 있어요.",
    },
    {
        step: "04",
        title: "테마 다운로드",
        desc: "우측 상단 다운로드 버튼을 눌러 iOS용 .ktheme 파일 또는 Android APK를 받으세요. 카카오톡 앱에서 바로 적용할 수 있어요.",
    },
    {
        step: "05",
        title: "스토어에 등록 (선택)",
        desc: "직접 만든 테마를 다른 사람들과 공유하고 싶다면 테마 등록 페이지에서 스토어에 올려보세요. 검수 후 카꾸미 스토어에 게시돼요.",
    },
];

type Tab = "faq" | "howto" | "contact";

type InquiryReply = {
    id: string;
    content: string;
    isAdmin: boolean;
    createdAt: string;
    author: { name: string; image: string | null; role: string };
};

type Inquiry = {
    id: string;
    title: string;
    content: string;
    category: string;
    status: "OPEN" | "ANSWERED" | "CLOSED";
    createdAt: string;
    replies: InquiryReply[];
};

const INQUIRY_CATEGORIES = ["주문/결제", "취소/환불", "테마 등록", "저작권/신고", "회원", "기타"] as const;

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
    OPEN:     { label: "답변 대기", bg: "rgba(255,149,0,0.12)", color: "#c97000" },
    ANSWERED: { label: "답변 완료", bg: "rgba(52,199,89,0.12)", color: "#1a7a3a" },
    CLOSED:   { label: "처리 완료", bg: "rgba(0,0,0,0.07)", color: "#8e8e93" },
};

export default function SupportPage() {
    const [activeTab, setActiveTab] = useState<Tab>("faq");
    const [faqCategory, setFaqCategory] = useState<FaqCategory>("전체");
    const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
    const [faqSearch, setFaqSearch] = useState("");

    const toggleFaq = (i: number) => {
        setOpenFaqs((prev) => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i);
            else next.add(i);
            return next;
        });
    };

    // 1:1 문의 상태
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [inquiryLoading, setInquiryLoading] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [contactForm, setContactForm] = useState({ title: "", content: "", category: "" });
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch("/api/auth/session")
            .then((r) => r.json())
            .then((d) => setIsLoggedIn(!!d?.session))
            .catch(() => {});
    }, []);

    const loadInquiries = () => {
        setInquiryLoading(true);
        fetch("/api/inquiry")
            .then((r) => r.json())
            .then((d) => setInquiries(d.inquiries ?? []))
            .catch(() => {})
            .finally(() => setInquiryLoading(false));
    };

    useEffect(() => {
        if (activeTab === "contact" && isLoggedIn) loadInquiries();
    }, [activeTab, isLoggedIn]);

    const handleSubmitInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactForm.category) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/inquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...contactForm, category: contactForm.category || "기타" }),
            });
            if (res.ok) {
                setContactForm({ title: "", content: "", category: "" });
                setShowForm(false);
                loadInquiries();
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitReply = async () => {
        if (!selectedInquiry || !replyText.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/inquiry/${selectedInquiry.id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: replyText }),
            });
            if (res.ok) {
                const data = await res.json() as { reply: InquiryReply };
                setSelectedInquiry((prev) => prev ? { ...prev, replies: [...prev.replies, data.reply] } : null);
                setInquiries((prev) => prev.map((q) =>
                    q.id === selectedInquiry.id
                        ? { ...q, replies: [...q.replies, data.reply] }
                        : q
                ));
                setReplyText("");
            }
        } finally {
            setSubmitting(false);
        }
    };

    function formatDate(iso: string) {
        return formatKST(iso);
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: "faq", label: "자주 묻는 질문" },
        { key: "howto", label: "이용방법" },
        { key: "contact", label: "1:1 문의" },
    ];

    return (
        <div
            className="min-h-screen flex flex-col mac-scroll"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}
        >
            <Header />

            <div className="flex w-full" style={{ maxWidth: 1400, margin: "0 auto" }}>

                {/* ── 사이드바 ── */}
                <aside className="fixed w-[220px] flex flex-col gap-1 px-6 pt-12">
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase px-3 mb-1" style={{ color: "#8e8e93" }}>
                        고객센터
                    </span>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); }}
                            className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                            style={{
                                color: activeTab === tab.key ? "#FF9500" : "#3a3a3c",
                                fontWeight: activeTab === tab.key ? 700 : 500,
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}

                    <div className="my-3 h-[1px]" style={{ background: "rgba(0,0,0,0.18)" }} />

                    <div className="px-3 flex flex-col gap-2">
                        <p className="text-[11px] font-bold" style={{ color: "#8e8e93" }}>운영시간</p>
                        <p className="text-[12px] leading-relaxed" style={{ color: "#3a3a3c" }}>
                            평일 10:00 – 18:00<br />
                            <span style={{ color: "#8e8e93" }}>점심 12:00 – 13:00 제외</span>
                        </p>
                        <a
                            href="mailto:aaa@kakkumi.com"
                            className="text-[12px] hover:underline mt-1"
                            style={{ color: "#FF9500" }}
                        >
                            aaa@kakkumi.com
                        </a>
                    </div>
                </aside>

                {/* ── 메인 콘텐츠 ── */}
                <main className="flex-1 flex flex-col gap-6 px-6 pt-12 pb-20" style={{ marginLeft: 220 }}>

                    {/* ── 자주 묻는 질문 ── */}
                    {activeTab === "faq" && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-end justify-between gap-4 mb-2">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-[28px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>자주 묻는 질문</h1>
                                    <p className="text-[14px]" style={{ color: "#8e8e93" }}>궁금한 점을 빠르게 확인해보세요.</p>
                                </div>

                                {/* ── 검색바 ── */}
                                <div
                                    className="flex items-center p-1 gap-1.5 shrink-0"
                                    style={{
                                        background: "#dde4ee",
                                        borderRadius: 999,
                                        width: 400,
                                    }}
                                >
                                    <div
                                        className="flex-1 flex items-center px-4"
                                        style={{ background: "#fff", borderRadius: 999, height: 34 }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mr-2">
                                            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
                                        </svg>
                                        <input
                                            type="text"
                                            value={faqSearch}
                                            onChange={(e) => { setFaqSearch(e.target.value); setOpenFaqs(new Set()); }}
                                            placeholder="질문을 검색하세요"
                                            className="flex-1 text-[13px] outline-none bg-transparent"
                                            style={{ color: "#1c1c1e" }}
                                        />
                                        {faqSearch && (
                                            <button
                                                type="button"
                                                onClick={() => { setFaqSearch(""); setOpenFaqs(new Set()); }}
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
                            </div>

                            {/* ── 카테고리 필터 ── */}
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                {FAQ_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => { setFaqCategory(cat); setOpenFaqs(new Set()); }}
                                        className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                                        style={{
                                            background: faqCategory === cat ? "#3a3a3c" : "rgba(0,0,0,0.06)",
                                            color: faqCategory === cat ? "#fff" : "#3a3a3c",
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {(() => {
                                const q = faqSearch.trim().toLowerCase();
                                const filtered = [...faqs]
                                    .filter((faq) =>
                                        (faqCategory === "전체" || faq.category === faqCategory) &&
                                        (q === "" || faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q))
                                    )
                                    .sort((a, b) =>
                                        faqCategory === "전체" && !q
                                            ? FAQ_CATEGORIES.indexOf(a.category) - FAQ_CATEGORIES.indexOf(b.category)
                                            : 0
                                    );

                                if (filtered.length === 0) {
                                    return (
                                        <div
                                            className="flex flex-col items-center gap-3 py-14 rounded-[20px]"
                                            style={{ background: "rgba(0,0,0,0.03)" }}
                                        >
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
                                            </svg>
                                            <p className="text-[13px]" style={{ color: "#8e8e93" }}>
                                                {q ? `'${faqSearch}'에 대한 검색 결과가 없습니다.` : "해당 카테고리의 질문이 없습니다."}
                                            </p>
                                        </div>
                                    );
                                }

                                return filtered.map((faq, i) => (
                                    <div key={i} className="rounded-[20px] overflow-hidden transition-all">
                                        <button
                                            className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                                            onClick={() => toggleFaq(i)}
                                        >
                                            <span className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: "#1c1c1e" }}>
                                                <span
                                                    className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold"
                                                    style={{
                                                        background: TAG_STYLE[faq.category]?.bg,
                                                        color: TAG_STYLE[faq.category]?.color,
                                                    }}
                                                >
                                                    {faq.category}
                                                </span>
                                                {faq.q}
                                            </span>
                                            <svg
                                                width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                style={{ transform: openFaqs.has(i) ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </button>
                                        {openFaqs.has(i) && (
                                            <div className="px-6 pb-3">
                                                <div className="h-[1px] mb-4" style={{ background: "rgba(0,0,0,0.06)" }} />
                                                <p className="text-[13px] leading-relaxed" style={{ color: "#48484a" }}>
                                                    <span style={{ color: "#aabde8", marginRight: 8, fontWeight: 700 }}>A.</span>{faq.a}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ));
                            })()}
                        </div>
                    )}

                    {/* ── 이용방법 ── */}
                    {activeTab === "howto" && (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1 mb-2">
                                <h1 className="text-[28px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>이용방법</h1>
                                <p className="text-[14px]" style={{ color: "#8e8e93" }}>카꾸미 사용 방법을 단계별로 안내해드려요.</p>
                            </div>
                            {howToSteps.map(({ step, title, desc }) => (
                                <div
                                    key={step}
                                    className="rounded-[20px] px-7 py-6 flex items-start gap-6"
                                    style={{
                                        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                                    }}
                                >
                                    <span className="text-[26px] font-black shrink-0 leading-none mt-0.5" style={{ color: "#aabde8" }}>{step}</span>
                                    <div className="flex flex-col gap-1.5">
                                        <h3 className="text-[16px] font-bold" style={{ color: "#1c1c1e" }}>{title}</h3>
                                        <p className="text-[13px] leading-relaxed break-keep" style={{ color: "#48484a" }}>{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── 1:1 문의 ── */}
                    {activeTab === "contact" && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-end justify-between mb-2">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-[28px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>1:1 문의</h1>
                                    <p className="text-[14px]" style={{ color: "#8e8e93" }}>문의를 남기시면 페이지에서 바로 답변을 확인하실 수 있어요.</p>
                                </div>
                                {isLoggedIn && !showForm && !selectedInquiry && (
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 active:scale-95"
                                        style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D" }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                        문의 작성
                                    </button>
                                )}
                            </div>

                            {!isLoggedIn ? (
                                /* 비로그인 */
                                <div
                                    className="flex flex-col items-center gap-5 p-12 rounded-[24px]"
                                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}
                                >
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <div className="text-center flex flex-col gap-1">
                                        <p className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>로그인 후 문의하실 수 있어요</p>
                                        <p className="text-[13px]" style={{ color: "#8e8e93" }}>카카오 로그인 후 문의를 남겨주세요.</p>
                                    </div>
                                    <a href="/api/auth/kakao">
                                        <button className="px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 active:scale-95"
                                            style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D" }}>
                                            카카오 로그인
                                        </button>
                                    </a>
                                </div>
                            ) : selectedInquiry ? (
                                /* 문의 상세 + 스레드 */
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => setSelectedInquiry(null)}
                                        className="flex items-center gap-1.5 text-[13px] font-medium self-start transition-all hover:opacity-70"
                                        style={{ color: "#8e8e93" }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                                        </svg>
                                        목록으로
                                    </button>

                                    {/* 원문 */}
                                    <div className="rounded-[20px] p-6 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.07)" }}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: STATUS_LABEL[selectedInquiry.status]?.bg, color: STATUS_LABEL[selectedInquiry.status]?.color }}>
                                                    {STATUS_LABEL[selectedInquiry.status]?.label}
                                                </span>
                                                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.05)", color: "#8e8e93" }}>{selectedInquiry.category}</span>
                                            </div>
                                            <span className="text-[12px]" style={{ color: "#8e8e93" }}>{formatDate(selectedInquiry.createdAt)}</span>
                                        </div>
                                        <h2 className="text-[17px] font-bold" style={{ color: "#1c1c1e" }}>{selectedInquiry.title}</h2>
                                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "#3a3a3c" }}>{selectedInquiry.content}</p>
                                    </div>

                                    {/* 답변 스레드 */}
                                    {selectedInquiry.replies.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            {selectedInquiry.replies.map((reply) => (
                                                <div
                                                    key={reply.id}
                                                    className={`rounded-[16px] px-4 py-2.5 flex flex-col gap-1.5 ${reply.isAdmin ? "ml-0" : "ml-6"}`}
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
                                                                {reply.isAdmin ? "관" : "나"}
                                                            </div>
                                                            <span className="text-[12px] font-semibold" style={{ color: reply.isAdmin ? "#c97000" : "#4A7BF7" }}>
                                                                {reply.isAdmin ? "카꾸미 고객센터" : reply.author.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px]" style={{ color: "#8e8e93" }}>{formatDate(reply.createdAt)}</span>
                                                    </div>
                                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "#3a3a3c" }}>{reply.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 추가 답글 입력 */}
                                    {selectedInquiry.status !== "CLOSED" && (
                                        <div className="flex flex-col gap-2 rounded-[16px] p-5" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.07)" }}>
                                            <label className="text-[12px] font-semibold" style={{ color: "#3a3a3c" }}>추가 문의</label>
                                            <textarea
                                                rows={4}
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="추가로 문의하실 내용을 입력해주세요."
                                                className="px-4 py-3 rounded-xl text-[13px] outline-none resize-none"
                                                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.1)", color: "#1c1c1e" }}
                                            />
                                            <button
                                                onClick={handleSubmitReply}
                                                disabled={submitting || !replyText.trim()}
                                                className="self-end px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 active:scale-95 disabled:opacity-40"
                                                style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D" }}
                                            >
                                                {submitting ? "전송 중..." : "전송"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : showForm ? (
                                /* 문의 작성 폼 */
                                <form onSubmit={handleSubmitInquiry} className="flex flex-col gap-5 rounded-[24px] p-8" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}>
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-[16px] font-bold" style={{ color: "#1c1c1e" }}>새 문의 작성</h2>
                                        <button type="button" onClick={() => { setShowForm(false); setContactForm({ title: "", content: "", category: "" }); }} className="text-[13px]" style={{ color: "#8e8e93" }}>취소</button>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-semibold" style={{ color: "#3a3a3c" }}>
                                            카테고리 <span style={{ color: "#FF3B30" }}>*</span>
                                            {!contactForm.category && <span className="ml-2 font-normal" style={{ color: "#8e8e93" }}>카테고리를 선택해주세요</span>}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {INQUIRY_CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setContactForm((f) => ({ ...f, category: cat }))}
                                                    className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                                                    style={{
                                                        background: contactForm.category === cat ? "#3a3a3c" : "rgba(0,0,0,0.06)",
                                                        color: contactForm.category === cat ? "#fff" : "#3a3a3c",
                                                    }}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-semibold" style={{ color: "#3a3a3c" }}>제목 <span style={{ color: "#FF3B30" }}>*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="문의 제목을 입력해주세요"
                                            value={contactForm.title}
                                            onChange={(e) => setContactForm((f) => ({ ...f, title: e.target.value }))}
                                            className="px-4 py-3 rounded-xl text-[13px] outline-none"
                                            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.1)", color: "#1c1c1e" }}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-semibold" style={{ color: "#3a3a3c" }}>문의 내용 <span style={{ color: "#FF3B30" }}>*</span></label>
                                        <textarea
                                            required
                                            rows={7}
                                            placeholder="문의하실 내용을 자세히 적어주세요"
                                            value={contactForm.content}
                                            onChange={(e) => setContactForm((f) => ({ ...f, content: e.target.value }))}
                                            className="px-4 py-3 rounded-xl text-[13px] outline-none resize-none"
                                            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.1)", color: "#1c1c1e" }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || !contactForm.category}
                                        className="self-start px-8 py-3 rounded-xl text-[14px] font-bold transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
                                        style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.3)" }}
                                    >
                                        {submitting ? "접수 중..." : "문의 접수하기"}
                                    </button>
                                </form>
                            ) : (
                                /* 문의 목록 */
                                inquiryLoading ? (
                                    <div className="flex items-center gap-2 py-8" style={{ color: "#8e8e93" }}>
                                        <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />
                                        <span className="text-[13px]">불러오는 중...</span>
                                    </div>
                                ) : inquiries.length === 0 ? (
                                    <div className="flex flex-col items-center gap-4 py-16" style={{ color: "#8e8e93" }}>
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        <p className="text-[14px]">아직 문의 내역이 없어요.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {inquiries.map((inq) => (
                                            <button
                                                key={inq.id}
                                                onClick={() => { setSelectedInquiry(inq); setReplyText(""); }}
                                                className="flex items-center justify-between px-5 py-4 rounded-[16px] text-left transition-all hover:brightness-95"
                                                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.06)" }}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ background: STATUS_LABEL[inq.status]?.bg, color: STATUS_LABEL[inq.status]?.color }}>
                                                        {STATUS_LABEL[inq.status]?.label}
                                                    </span>
                                                    <span className="text-[11px] px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(0,0,0,0.05)", color: "#8e8e93" }}>{inq.category}</span>
                                                    <span className="text-[14px] font-semibold truncate" style={{ color: "#1c1c1e" }}>{inq.title}</span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                                    {inq.replies.length > 0 && (
                                                        <span className="text-[11px]" style={{ color: "#8e8e93" }}>답변 {inq.replies.length}개</span>
                                                    )}
                                                    <span className="text-[12px]" style={{ color: "#c7c7cc" }}>{formatDate(inq.createdAt)}</span>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M9 18l6-6-6-6" />
                                                    </svg>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    )}

                </main>
            </div>

            <Footer />
        </div>
    );
}

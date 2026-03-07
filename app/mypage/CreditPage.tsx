"use client";

import { useEffect, useState } from "react";
import { REFERRAL_REWARD_AMOUNT, REFERRAL_MAX_PER_MONTH, CREDIT_EXPIRY_DAYS } from "@/lib/constants";

type HistoryItem = {
    id: string;
    amount: number;
    type: string;
    memo: string | null;
    createdAt: string;
    expiresAt: string | null;
};

const TYPE_LABEL: Record<string, string> = {
    REFERRAL_REWARD: "추천 적립",
    PURCHASE_USE:    "구매 사용",
    ADMIN_GRANT:     "관리자 지급",
    REFUND:          "환불·소멸",
};

export default function CreditPage() {
    const [credit, setCredit] = useState<number | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        fetch("/api/mypage/credit")
            .then(r => r.json())
            .then((d: { credit: number; history: HistoryItem[] }) => {
                setCredit(d.credit);
                setHistory(d.history);
            })
            .catch(() => {});
    }, []);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    };

    const NOTICES = [
        {
            icon: "👥",
            title: "친구 추천 혜택",
            desc: `가입 시 친구의 닉네임을 입력하면 나와 친구 모두 ${REFERRAL_REWARD_AMOUNT.toLocaleString()}원씩 즉시 적립됩니다.`,
        },
        {
            icon: "🔒",
            title: "추천 적립은 평생 1회",
            desc: "추천 적립 혜택은 계정당 최초 가입 시 1회만 지급됩니다. 탈퇴 후 재가입해도 동일 계정으로는 재지급되지 않습니다.",
        },
        {
            icon: "📅",
            title: `추천인 월 최대 ${REFERRAL_MAX_PER_MONTH}회 수령`,
            desc: `추천인(나)은 한 달에 최대 ${REFERRAL_MAX_PER_MONTH}명의 친구를 추천받아 적립금을 받을 수 있습니다.`,
        },
        {
            icon: "💸",
            title: "탈퇴 시 적립금 소멸",
            desc: "회원 탈퇴 시 보유 중인 적립금은 전액 소멸되며 복구되지 않습니다.",
        },
        {
            icon: "🛍️",
            title: "적립금 사용 방법",
            desc: "테마 구매 시 결제 방법으로 '적립금 결제'를 선택하면 보유 적립금으로 즉시 결제됩니다.",
        },
        {
            icon: "⏳",
            title: "적립금 유효기간",
            desc: `적립금은 지급일로부터 ${CREDIT_EXPIRY_DAYS}일(1년) 이내에 사용해야 합니다. 만료 30일 전에 알림을 보내드립니다.`,
        },
    ];

    return (
        <div className="flex flex-col">
            {/* 섹션 헤더 */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Credits</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>적립금</h2>
                </div>
            </div>

            {/* 보유 적립금 */}
            <div className="pb-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>보유 적립금</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                </div>
                <div className="flex items-end gap-1.5">
                    <span className="text-[42px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.03em", lineHeight: 1 }}>
                        {credit === null ? "..." : credit.toLocaleString()}
                    </span>
                    <span className="text-[16px] font-medium mb-1" style={{ color: "#a8a29e" }}>원</span>
                </div>
                <p className="mt-2 text-[12px]" style={{ color: "#a8a29e" }}>테마 구매 시 적립금으로 결제할 수 있어요.</p>
            </div>

            {/* 적립금 이용 안내 */}
            <div className="py-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>이용 안내</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                </div>
                <div className="flex flex-col gap-1">
                    {NOTICES.map((n, i, arr) => (
                        <div key={i}>
                            <div className="flex gap-3 py-3">
                                <span className="text-[16px] shrink-0 mt-0.5">{n.icon}</span>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-[13px] font-semibold" style={{ color: "#1c1917" }}>{n.title}</p>
                                    <p className="text-[12px] leading-relaxed" style={{ color: "#78716c" }}>{n.desc}</p>
                                </div>
                            </div>
                            {i < arr.length - 1 && <div className="h-px" style={{ background: "#f5f5f4" }} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* 적립금 내역 */}
            <div className="py-8" style={{ borderTop: "1px solid #e7e5e4" }}>
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#a8a29e" }}>내역</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "#e7e5e4" }} />
                </div>
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                        </svg>
                        <p className="text-[14px]" style={{ color: "#a8a29e" }}>아직 적립금 내역이 없어요.</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {history.map((h, idx) => (
                            <div key={h.id}>
                                <div className="flex items-center justify-between py-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[14px]" style={{ color: "#1c1917", fontWeight: h.amount > 0 ? 500 : 400 }}>
                                            {h.memo ?? TYPE_LABEL[h.type] ?? h.type}
                                        </span>
                                        <span className="text-[12px]" style={{ color: "#a8a29e" }}>{formatDate(h.createdAt)}</span>
                                        {h.expiresAt && h.amount > 0 && (
                                            <span className="text-[11px]" style={{ color: "#FF9500" }}>
                                                만료 {formatDate(h.expiresAt)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[15px] font-semibold" style={{ color: h.amount > 0 ? "#34c759" : "#ff3b30" }}>
                                        {h.amount > 0 ? "+" : ""}{h.amount.toLocaleString()}원
                                    </span>
                                </div>
                                {idx < history.length - 1 && <div className="h-px" style={{ background: "#f5f5f4" }} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

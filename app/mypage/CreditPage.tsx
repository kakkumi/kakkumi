"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
    id: string;
    amount: number;
    type: string;
    memo: string | null;
    createdAt: string;
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
            desc: "가입 시 친구의 닉네임을 입력하면 나와 친구 모두 500원씩 즉시 적립됩니다.",
        },
        {
            icon: "🔒",
            title: "추천 적립은 평생 1회",
            desc: "추천 적립 혜택은 계정당 최초 가입 시 1회만 지급됩니다. 탈퇴 후 재가입해도 동일 계정으로는 재지급되지 않습니다.",
        },
        {
            icon: "📅",
            title: "추천인 월 최대 3회 수령",
            desc: "추천인(나)은 한 달에 최대 3명의 친구를 추천받아 적립금을 받을 수 있습니다.",
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
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* 적립금 현황 */}
            <div className="flex flex-col gap-3 p-7 rounded-[24px]"
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <h3 className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>보유 적립금</h3>
                <div className="flex items-end gap-2">
                    <span className="text-[40px] font-extrabold" style={{ color: "#1c1c1e" }}>
                        {credit === null ? "..." : credit.toLocaleString()}
                    </span>
                    <span className="text-[18px] font-semibold mb-1.5" style={{ color: "#8e8e93" }}>원</span>
                </div>
                <p className="text-[12px]" style={{ color: "#8e8e93" }}>테마 구매 시 적립금으로 결제할 수 있어요.</p>
            </div>

            {/* 적립금 이용 안내 */}
            <div className="flex flex-col gap-3 p-7 rounded-[24px]"
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <h3 className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>적립금 이용 안내</h3>
                <div className="flex flex-col gap-2">
                    {NOTICES.map((n, i) => (
                        <div key={i} className="flex gap-3 px-4 py-3.5 rounded-[14px]"
                            style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <span className="text-[18px] shrink-0 mt-0.5">{n.icon}</span>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{n.title}</p>
                                <p className="text-[12px] leading-relaxed" style={{ color: "#8e8e93" }}>{n.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 적립금 내역 */}
            <div className="flex flex-col gap-4 p-7 rounded-[24px]"
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <h3 className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>적립금 내역</h3>
                {history.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                        </svg>
                        <p className="text-[13px]" style={{ color: "#8e8e93" }}>아직 적립금 내역이 없어요.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {history.map(h => (
                            <div key={h.id} className="flex items-center justify-between px-4 py-3 rounded-[14px]"
                                style={{ background: "rgba(0,0,0,0.03)" }}>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>
                                        {h.memo ?? TYPE_LABEL[h.type] ?? h.type}
                                    </span>
                                    <span className="text-[11px]" style={{ color: "#8e8e93" }}>{formatDate(h.createdAt)}</span>
                                </div>
                                <span className="text-[15px] font-bold"
                                    style={{ color: h.amount > 0 ? "#34c759" : "#ff3b30" }}>
                                    {h.amount > 0 ? "+" : ""}{h.amount.toLocaleString()}원
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

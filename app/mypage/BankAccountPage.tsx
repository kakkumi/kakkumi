"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type BankInfo = {
    bankName: string | null;
    accountNumber: string | null;
    accountHolder: string | null;
};

const BANKS = [
    "국민은행", "신한은행", "우리은행", "하나은행", "농협은행",
    "기업은행", "카카오뱅크", "토스뱅크", "케이뱅크",
    "SC제일은행", "씨티은행", "수협은행", "대구은행", "부산은행",
    "광주은행", "전북은행", "경남은행", "제주은행", "우체국",
];

type Props = {
    role: string | null | undefined;
};

export default function BankAccountPage({ role }: Props) {
    const router = useRouter();
    const isCreator = role === "CREATOR" || role === "ADMIN";

    const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState("");
    const [focused, setFocused] = useState<string | null>(null);

    useEffect(() => {
        if (!isCreator) { setLoading(false); return; }
        fetch("/api/mypage/bank")
            .then(r => r.json())
            .then((d: { bankInfo: BankInfo | null }) => {
                if (d.bankInfo) {
                    setBankInfo(d.bankInfo);
                    setBankName(d.bankInfo.bankName ?? "");
                    setAccountNumber(d.bankInfo.accountNumber ?? "");
                    setAccountHolder(d.bankInfo.accountHolder ?? "");
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [isCreator]);

    const handleSave = async () => {
        if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
            setError("모든 항목을 입력해주세요.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/mypage/bank", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountHolder: accountHolder.trim() }),
            });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok) { setError(data.error ?? "저장에 실패했습니다."); return; }
            setBankInfo({ bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountHolder: accountHolder.trim() });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            setError("네트워크 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (!isCreator) {
        return (
            <>
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Revenue</p>
                        <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>정산 계좌</h2>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,149,0,0.08)" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-[18px] font-bold mb-2" style={{ color: "#1c1917" }}>크리에이터 전용 기능이에요</p>
                        <p className="text-[13px] leading-relaxed" style={{ color: "#78716c" }}>
                            정산 계좌 등록은 크리에이터만 이용할 수 있어요.
                        </p>
                    </div>
                    <button onClick={() => router.push("/mypage/creator-apply")}
                        className="px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90"
                        style={{ background: "#FF9500" }}>
                        입점 신청하기
                    </button>
                </div>
            </>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
            </div>
        );
    }

    const inputStyle = (field: string): React.CSSProperties => ({
        color: "#1c1917",
        borderBottom: `1.5px solid ${focused === field ? "#FF9500" : "rgba(0,0,0,0.12)"}`,
        borderTop: "none", borderLeft: "none", borderRight: "none",
        borderRadius: 0, outline: "none", background: "transparent",
        transition: "border-color 0.15s", width: "100%", padding: "8px 0", fontSize: 14,
    });

    return (
        <>
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Revenue</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>정산 계좌</h2>
                </div>
            </div>
            <p className="text-[13px] mb-10" style={{ color: "#78716c" }}>
                판매 수익 정산을 받을 계좌를 등록해주세요. 정산은 매월 말일 기준으로 진행됩니다.
            </p>

            {/* 현재 등록 계좌 */}
            {bankInfo?.bankName && (
                <div className="mb-8 px-5 py-4 rounded-2xl"
                    style={{ background: "rgba(52,199,89,0.05)", border: "1px solid rgba(52,199,89,0.2)" }}>
                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#34c759" }}>등록된 계좌</p>
                    <p className="text-[14px] font-semibold" style={{ color: "#1c1917" }}>
                        {bankInfo.bankName} {bankInfo.accountNumber}
                    </p>
                    <p className="text-[13px] mt-0.5" style={{ color: "#78716c" }}>예금주: {bankInfo.accountHolder}</p>
                </div>
            )}

            <div className="flex flex-col gap-8" style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 32 }}>

                {/* 은행 선택 */}
                <div>
                    <div className="flex flex-col gap-0.5 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#FF9500" }}>01</span>
                            <span className="text-[14px] font-semibold" style={{ color: "#1c1c1e" }}>은행 선택 <span style={{ color: "#ff3b30" }}>*</span></span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {BANKS.map(bank => (
                            <button key={bank} type="button" onClick={() => setBankName(bank)}
                                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                                style={{
                                    background: bankName === bank ? "rgba(255,149,0,0.10)" : "rgba(0,0,0,0.03)",
                                    color: bankName === bank ? "rgb(180,90,0)" : "#78716c",
                                    border: bankName === bank ? "1.5px solid rgba(255,149,0,0.3)" : "1.5px solid transparent",
                                }}>
                                {bank}
                            </button>
                        ))}
                    </div>
                    {/* 직접 입력 */}
                    <input
                        type="text"
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        placeholder="직접 입력"
                        style={inputStyle("bank")}
                        className="mt-3"
                        onFocus={() => setFocused("bank")}
                        onBlur={() => setFocused(null)}
                    />
                </div>

                {/* 계좌번호 */}
                <div>
                    <div className="flex flex-col gap-0.5 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#FF9500" }}>02</span>
                            <span className="text-[14px] font-semibold" style={{ color: "#1c1c1e" }}>계좌번호 <span style={{ color: "#ff3b30" }}>*</span></span>
                        </div>
                    </div>
                    <input
                        type="text"
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value.replace(/[^0-9-]/g, ""))}
                        placeholder="- 없이 숫자만 입력"
                        style={inputStyle("accountNumber")}
                        onFocus={() => setFocused("accountNumber")}
                        onBlur={() => setFocused(null)}
                    />
                </div>

                {/* 예금주 */}
                <div>
                    <div className="flex flex-col gap-0.5 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#FF9500" }}>03</span>
                            <span className="text-[14px] font-semibold" style={{ color: "#1c1c1e" }}>예금주 <span style={{ color: "#ff3b30" }}>*</span></span>
                        </div>
                    </div>
                    <input
                        type="text"
                        value={accountHolder}
                        onChange={e => setAccountHolder(e.target.value)}
                        placeholder="예금주 성명"
                        style={inputStyle("accountHolder")}
                        onFocus={() => setFocused("accountHolder")}
                        onBlur={() => setFocused(null)}
                    />
                </div>
            </div>

            {/* 안내 */}
            <div className="flex items-start gap-2 mt-8 px-4 py-3 rounded-xl"
                style={{ background: "rgba(74,123,247,0.05)", border: "1px solid rgba(74,123,247,0.12)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(74,123,247)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-[12px] leading-relaxed" style={{ color: "#78716c" }}>
                    입력한 계좌 정보는 정산 목적으로만 사용됩니다.<br />
                    잘못된 계좌 정보로 인한 미지급은 책임지지 않습니다.
                </p>
            </div>

            {error && (
                <div className="mt-4 px-4 py-3 rounded-xl text-[13px]"
                    style={{ background: "rgba(255,59,48,0.06)", color: "#ff3b30", border: "1px solid rgba(255,59,48,0.12)" }}>
                    {error}
                </div>
            )}
            {success && (
                <p className="mt-4 text-[13px]" style={{ color: "#34c759" }}>✓ 계좌 정보가 저장되었습니다.</p>
            )}

            <button onClick={handleSave} disabled={saving || !bankName.trim() || !accountNumber.trim() || !accountHolder.trim()}
                className="mt-8 w-full py-3.5 text-[15px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-40 rounded-2xl"
                style={{ background: "#FF9500" }}>
                {saving ? "저장 중…" : "계좌 정보 저장"}
            </button>
        </>
    );
}

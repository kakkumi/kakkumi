"use client";

import { useRouter } from "next/navigation";

type Props = {
    role: string | null | undefined;
};

export default function SettlementPage({ role }: Props) {
    const router = useRouter();
    const isCreator = role === "CREATOR" || role === "ADMIN";

    if (!isCreator) {
        return (
            <>
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Revenue</p>
                        <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>정산 내역</h2>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,149,0,0.08)" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-[18px] font-bold mb-2" style={{ color: "#1c1917" }}>크리에이터가 되면 수익을 얻을 수 있어요</p>
                        <p className="text-[13px] leading-relaxed" style={{ color: "#78716c" }}>
                            테마를 판매하고 수익을 정산받으려면<br />크리에이터 입점 신청이 필요해요.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full max-w-[260px]">
                        <button
                            onClick={() => router.push("/mypage/creator-apply")}
                            className="w-full py-3 rounded-xl text-[14px] font-bold text-white transition-all active:scale-[0.99] hover:opacity-90"
                            style={{ background: "#FF9500" }}>
                            입점 신청하기
                        </button>
                        <button
                            onClick={() => router.push("/store")}
                            className="w-full py-3 rounded-xl text-[14px] font-medium transition-all hover:opacity-70"
                            style={{ background: "rgba(0,0,0,0.04)", color: "#78716c" }}>
                            테마 스토어 둘러보기
                        </button>
                    </div>
                    <div className="mt-4 px-5 py-4 rounded-2xl max-w-[300px]"
                        style={{ background: "rgba(255,149,0,0.05)", border: "1px solid rgba(255,149,0,0.15)" }}>
                        <p className="text-[12px] leading-relaxed" style={{ color: "#78716c" }}>
                            💡 크리에이터로 승인되면 테마를 유료로 등록하고,<br />
                            판매 금액의 <strong style={{ color: "#FF9500" }}>80%</strong>를 정산받을 수 있어요.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: "#a8a29e" }}>Revenue</p>
                    <h2 className="text-[22px] font-bold" style={{ color: "#1c1917", letterSpacing: "-0.02em" }}>정산 내역</h2>
                </div>
            </div>
            <p className="text-[13px] mb-8" style={{ color: "#78716c" }}>판매 수익의 80%가 정산됩니다. 정산은 매월 말일 기준으로 진행됩니다.</p>

            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                <p className="text-[14px]" style={{ color: "#a8a29e" }}>정산 내역이 없어요.</p>
                <p className="text-[12px]" style={{ color: "#c4b5a0" }}>정산은 매월 말일 집계됩니다.</p>
            </div>
        </>
    );
}

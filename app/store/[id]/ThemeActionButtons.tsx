"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Siren } from "lucide-react";

type Props = {
    themeId: string;
    themeMockId: number;
    priceNum: number;
    priceName: string;
    isLoggedIn: boolean;
};

export default function ThemeActionButtons(props: Props) {
    const { themeMockId, priceNum, priceName, isLoggedIn } = props;
    // props.themeId — DB 연동 시 /api/download/free 호출에 사용
    const router = useRouter();
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

    const isFree = priceNum === 0;

    const handleMainAction = async () => {
        if (!isLoggedIn) {
            router.push("/api/auth/kakao");
            return;
        }
        if (isFree) {
            setLoading(true);
            setResult(null);
            try {
                // DB 연동 후 실제 themeId 사용 (현재는 목업)
                // const res = await fetch("/api/download/free", {
                //     method: "POST",
                //     headers: { "Content-Type": "application/json" },
                //     body: JSON.stringify({ themeId }),
                // });
                // const data = await res.json();
                // if (!res.ok) { setResult({ success: false, message: data.error }); return; }
                // if (data.downloadUrl) window.open(data.downloadUrl, "_blank");
                // setResult({ success: true, message: data.alreadyOwned ? "이미 보유한 테마입니다." : "다운로드가 시작됩니다!" });
                await new Promise((r) => setTimeout(r, 800));
                setResult({ success: true, message: "다운로드가 완료되었습니다!" });
            } catch {
                setResult({ success: false, message: "오류가 발생했습니다. 다시 시도해주세요." });
            } finally {
                setLoading(false);
            }
        } else {
            setResult({ success: false, message: "결제 기능은 곧 지원될 예정입니다." });
        }
    };

    const handleLike = () => {
        if (!isLoggedIn) { router.push("/api/auth/kakao"); return; }
        setLiked((prev) => !prev);
    };

    const handleReport = () => {
        if (!isLoggedIn) { router.push("/api/auth/kakao"); return; }
        alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.");
    };

    const handleInquiry = () => {
        if (!isLoggedIn) { router.push("/api/auth/kakao"); return; }
        router.push(`/support?themeId=${themeMockId}`);
    };

    return (
        <div className="flex flex-col gap-3">
            {result && (
                <div
                    className="text-[13px] font-medium px-4 py-2.5 rounded-[10px]"
                    style={{
                        background: result.success ? "rgba(52,199,89,0.1)" : "rgba(255,59,48,0.1)",
                        color: result.success ? "#34c759" : "#ff3b30",
                    }}
                >
                    {result.message}
                </div>
            )}
            <div className="flex gap-3">
                <button
                    onClick={handleMainAction}
                    disabled={loading}
                    className="flex-[3] py-[14px] rounded-[14px] text-[15px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                    style={{ background: "#4A7BF7", boxShadow: "0 4px 20px rgba(74,123,247,0.3)" }}
                >
                    {loading
                        ? "처리 중..."
                        : isLoggedIn
                            ? isFree ? "무료 다운로드" : `${priceName} 구매하기`
                            : isFree ? "로그인 후 무료 다운로드" : "로그인 후 구매하기"}
                </button>
                <button
                    onClick={handleLike}
                    className="w-[52px] flex items-center justify-center rounded-[14px] transition-all active:scale-[0.98] hover:bg-red-50"
                    title={liked ? "찜 해제" : "찜하기"}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24"
                        fill={liked ? "#ff3b30" : "none"}
                        stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
                <button
                    onClick={handleReport}
                    className="w-[52px] flex items-center justify-center rounded-[14px] transition-all active:scale-[0.98] hover:bg-red-50"
                    title="신고하기"
                >
                    <Siren size={20} color="#ef4444" />
                </button>
            </div>
            <button
                onClick={handleInquiry}
                className="w-full py-[13px] rounded-[14px] text-[14px] font-semibold text-gray-600 bg-white border border-gray-200 hover:border-gray-400 hover:text-gray-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                제작자에게 문의하기
            </button>
        </div>
    );
}

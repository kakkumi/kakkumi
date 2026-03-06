"use client";

import { useRouter } from "next/navigation";

interface Props {
    message?: string;
    onClose: () => void;
}

export default function LoginRequiredModal({ message = "로그인이 필요한 기능이에요.", onClose }: Props) {
    const router = useRouter();

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div
                className="flex flex-col items-center gap-4 px-8 py-7 rounded-3xl shadow-2xl"
                style={{
                    background: "rgba(255,255,255,0.97)",
                    minWidth: 300,
                    maxWidth: 360,
                }}
                onClick={e => e.stopPropagation()}
            >
                <span className="text-[36px]">🔒</span>
                <div className="flex flex-col items-center gap-1.5">
                    <p className="text-[16px] font-bold text-center" style={{ color: "#1c1c1e" }}>로그인이 필요해요</p>
                    <p className="text-[13px] text-center" style={{ color: "#8e8e93" }}>{message}</p>
                </div>
                <div className="flex gap-2 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-2xl text-[14px] font-semibold transition-all hover:opacity-70"
                        style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}
                    >
                        취소
                    </button>
                    <button
                        onClick={() => { onClose(); router.push("/api/auth/kakao"); }}
                        className="flex-1 py-2.5 rounded-2xl text-[14px] font-semibold transition-all hover:opacity-80"
                        style={{ background: "rgb(255,149,0)", color: "#fff" }}
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        </div>
    );
}

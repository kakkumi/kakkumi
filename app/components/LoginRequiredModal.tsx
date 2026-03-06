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
                className="flex flex-col items-center gap-9 px-20 py-16 rounded-3xl shadow-2xl"
                style={{
                    background: "rgba(255,255,255,0.82)",
                    minWidth: 630,
                    maxWidth: 780,
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col items-center" style={{ gap: 0 }}>
                    <div style={{ transform: "translateY(-6px)" }}>
                        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="100" height="100" preserveAspectRatio="xMidYMid meet" fill="#000000"><path fill="#000000" d="M376.749 349.097c-13.531 0-24.5-10.969-24.5-24.5V181.932c0-48.083-39.119-87.203-87.203-87.203c-48.083 0-87.203 39.119-87.203 87.203v82.977c0 13.531-10.969 24.5-24.5 24.5s-24.5-10.969-24.5-24.5v-82.977c0-75.103 61.1-136.203 136.203-136.203s136.203 61.1 136.203 136.203v142.665c0 13.531-10.969 24.5-24.5 24.5z"></path><path fill="#FFB636" d="M414.115 497.459H115.977c-27.835 0-50.4-22.565-50.4-50.4V274.691c0-27.835 22.565-50.4 50.4-50.4h298.138c27.835 0 50.4 22.565 50.4 50.4v172.367c0 27.836-22.565 50.401-50.4 50.401z"></path><path fill="#FFD469" d="M109.311 456.841h-2.525c-7.953 0-14.4-6.447-14.4-14.4V279.309c0-7.953 6.447-14.4 14.4-14.4h2.525c7.953 0 14.4 6.447 14.4 14.4v163.132c0 7.953-6.447 14.4-14.4 14.4z"></path></svg>
                    </div>
                    <div style={{
                        width: 78,
                        height: 3,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.7)",
                        filter: "blur(5px)",
                        marginTop: 8,
                    }} />
                </div>
                <div className="flex flex-col items-center gap-1.5 -mt-6">
                    <p className="text-[18px] font-bold text-center" style={{ color: "#1c1c1e" }}>로그인이 필요해요</p>
                    <p className="text-[13px] text-center" style={{ color: "#58585a" }}>{message}</p>
                </div>
                <div className="flex gap-2 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-2xl text-[14px] font-medium transition-all hover:opacity-70"
                        style={{ background: "rgba(0,0,0,0.06)", color: "#3a3a3c" }}
                    >
                        취소
                    </button>
                    <button
                        onClick={() => { onClose(); router.push("/api/auth/kakao"); }}
                        className="flex-1 py-2.5 rounded-2xl text-[14px] font-medium transition-all hover:opacity-80"
                        style={{ background: "rgba(255,149,0,0.85)", color: "#fff" }}
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        </div>
    );
}

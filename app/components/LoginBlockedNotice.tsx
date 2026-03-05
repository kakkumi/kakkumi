"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginBlockedNotice() {
    const searchParams = useSearchParams();
    const [show, setShow] = useState(false);
    const [days, setDays] = useState(0);

    useEffect(() => {
        const blocked = searchParams.get("login");
        const d = parseInt(searchParams.get("days") ?? "0", 10);
        if (blocked === "blocked") {
            queueMicrotask(() => {
                setShow(true);
                setDays(d);
            });
        }
    }, [searchParams]);

    if (!show) return null;

    return (
        <div
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
            style={{
                background: "rgba(255,59,48,0.95)",
                backdropFilter: "blur(20px)",
                color: "#fff",
                minWidth: 320,
                maxWidth: 480,
            }}
        >
            <span className="text-[18px]">⛔</span>
            <div className="flex flex-col gap-0.5">
                <p className="text-[14px] font-bold">재가입 제한 기간입니다</p>
                <p className="text-[12px] opacity-85">
                    탈퇴 후 3일이 경과해야 재가입할 수 있습니다.
                    {days > 0 && ` (${days}일 후 재가입 가능)`}
                </p>
            </div>
            <button
                onClick={() => setShow(false)}
                className="ml-auto shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    );
}

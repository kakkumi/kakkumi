'use client';

import { useEffect, useState } from "react";

type SessionData = {
    name?: string | null;
    image?: string | null;
};

type SessionResponse = {
    session: SessionData | null;
};

export default function AuthStatus() {
    const [session, setSession] = useState<SessionData | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadSession = async () => {
            try {
                const response = await fetch("/api/auth/session", { cache: "no-store" });
                if (!response.ok) {
                    return;
                }
                const data = (await response.json()) as SessionResponse;
                if (!cancelled) {
                    setSession(data.session ?? null);
                }
            } finally {
                if (!cancelled) {
                    setLoaded(true);
                }
            }
        };

        loadSession();

        return () => {
            cancelled = true;
        };
    }, []);

    if (!loaded) {
        return null;
    }

    if (!session) {
        return (
            <a
                href="/api/auth/kakao"
                className="text-[13px] font-semibold transition-opacity hover:opacity-70"
                style={{ color: "#3A1D1D" }}
            >
                카카오 로그인
            </a>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "#3A1D1D" }}>
                {session.image ? (
                    <img
                        src={session.image}
                        alt={session.name ?? "카카오 프로필"}
                        className="w-5 h-5 rounded-full object-cover"
                    />
                ) : (
                    <span className="w-5 h-5 rounded-full bg-[#ffe500]" />
                )}
                <span>{session.name ?? "로그인됨"}</span>
            </div>
            <a
                href="/api/auth/logout"
                className="px-2 py-1 rounded-md text-[12px] font-semibold transition-opacity hover:opacity-70"
                style={{ background: "rgba(255,229,0,0.85)", color: "#3A1D1D" }}
            >
                로그아웃
            </a>
        </div>
    );
}

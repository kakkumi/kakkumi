'use client';

import { useEffect, useState } from "react";

type SessionData = {
    name?: string | null;
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
        <span className="text-[13px] font-semibold flex items-center gap-2" style={{ color: "#3A1D1D" }}>
            {session.name ?? "로그인됨"}
            <a
                href="/api/auth/logout"
                className="text-[12px] font-medium transition-opacity hover:opacity-70"
                style={{ color: "#3A1D1D" }}
            >
                로그아웃
            </a>
        </span>
    );
}

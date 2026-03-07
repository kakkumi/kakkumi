'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

type SessionData = {
    dbId?: string | null;
    id?: string | null;
    name?: string | null;
    nickname?: string | null;
    image?: string | null;
    email?: string | null;
    role?: "USER" | "CREATOR" | "ADMIN" | null;
};

type SessionResponse = {
    session: SessionData | null;
};

type AuthStatusProps = {
    myPageColor?: string;
};

export default function AuthStatus({ myPageColor }: AuthStatusProps) {
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
            <span className="text-[13px] font-semibold" style={{ color: "#3A1D1D" }}>
                {session.nickname ?? "사용자"}
            </span>
            <Link
                href="/mypage"
                className="text-[13px] font-semibold transition-opacity hover:opacity-70"
                style={{ color: myPageColor ?? "#3A1D1D" }}
            >
                마이페이지
            </Link>
            <a
                href="/api/auth/logout"
                className="px-2 py-1 rounded-md text-[12px] font-semibold transition-opacity hover:opacity-70"
                style={{ border: "1px solid #3A1D1D", color: "#3A1D1D" }}
            >
                로그아웃
            </a>
        </div>
    );
}

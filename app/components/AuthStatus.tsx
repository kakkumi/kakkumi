'use client';

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

type SessionData = {
    dbId?: string | null;
    id?: string | null;
    name?: string | null;
    nickname?: string | null;
    image?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
    role?: "USER" | "CREATOR" | "ADMIN" | null;
};

type SessionResponse = {
    session: SessionData | null;
};

type AuthStatusProps = {
    myPageColor?: string;
};

function getAvatarSrc(role: string | null | undefined, avatarUrl: string | null | undefined): string {
    // 커스텀 업로드 사진 (PRO 유저 - '/'로 시작하지 않는 data URL 등)
    if (avatarUrl && !avatarUrl.startsWith("/")) return avatarUrl;
    // 역할별 기본 이미지
    if (role === "CREATOR" || role === "ADMIN") return "/creator.png";
    return "/user.png";
}

export default function AuthStatus({ myPageColor }: AuthStatusProps) {
    const [session, setSession] = useState<SessionData | null>(null);
    const [loaded, setLoaded] = useState(false);

    const loadSession = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/session", { cache: "no-store" });
            if (!response.ok) return;
            const data = (await response.json()) as SessionResponse;
            setSession(data.session ?? null);
        } finally {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    // 프로필 사진 변경 또는 구독 해지 시 즉시 갱신
    useEffect(() => {
        const handler = () => { void loadSession(); };
        window.addEventListener("avatar-updated", handler);
        return () => window.removeEventListener("avatar-updated", handler);
    }, [loadSession]);

    if (!loaded) return null;

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

    const avatarSrc = getAvatarSrc(session.role, session.avatarUrl);

    return (
        <div className="flex items-center gap-3">
            <Link href="/mypage" className="shrink-0 transition-opacity hover:opacity-80">
                <Image
                    src={avatarSrc}
                    alt={session.nickname ?? "프로필"}
                    width={30}
                    height={30}
                    className="rounded-full object-cover"
                    style={{ width: 30, height: 30 }}
                    unoptimized={!!session.avatarUrl && !session.avatarUrl.startsWith("/")}
                />
            </Link>
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

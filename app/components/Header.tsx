"use client";

import Image from "next/image";
import Link from "next/link";
import AuthStatus from "./AuthStatus";
import NotificationBell from "./NotificationBell";
import LoginRequiredModal from "./LoginRequiredModal";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const BASE_NAV_ITEMS = [
    { href: "/store", label: "테마 스토어" },
    { href: "/create", label: "테마 만들기" },
    { href: "/support", label: "고객센터" },
];

const CREATOR_APPLY = { href: "/mypage/creator-apply", label: "입점 신청" };
const THEME_REGISTER = { href: "/store/register", label: "테마 등록" };
const ADMIN_PAGE = { href: "/admin", label: "관리자페이지" };

function getNavItems(role: string | null) {
    if (role === "ADMIN") {
        return [
            BASE_NAV_ITEMS[0],
            BASE_NAV_ITEMS[1],
            CREATOR_APPLY,
            THEME_REGISTER,
            BASE_NAV_ITEMS[2],
            ADMIN_PAGE,
        ];
    }
    if (role === "CREATOR") {
        return [
            BASE_NAV_ITEMS[0],
            BASE_NAV_ITEMS[1],
            THEME_REGISTER,
            BASE_NAV_ITEMS[2],
        ];
    }
    // USER 또는 비로그인
    return [
        BASE_NAV_ITEMS[0],
        BASE_NAV_ITEMS[1],
        CREATOR_APPLY,
        BASE_NAV_ITEMS[2],
    ];
}

export default function Header() {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);
    const [sessionLoaded, setSessionLoaded] = useState(false);
    const [loginModal, setLoginModal] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/auth/session", { cache: "no-store" })
            .then((r) => r.json())
            .then((d: { session?: { role?: string } | null }) => {
                setRole(d?.session?.role ?? null);
                setSessionLoaded(true);
            })
            .catch(() => { setSessionLoaded(true); });
    }, []);

    const NAV_ITEMS = getNavItems(role);

    // 로그인이 필요한 href 목록 (비로그인 상태에서만)
    const LOGIN_REQUIRED_HREFS = ["/create", "/mypage/creator-apply"];

    const handleNavClick = (e: React.MouseEvent, href: string) => {
        if (!sessionLoaded) return;
        if (role === null && LOGIN_REQUIRED_HREFS.includes(href)) {
            e.preventDefault();
            const label = href === "/create" ? "테마 만들기는" : "입점 신청은";
            setLoginModal(`${label} 로그인이 필요한 기능이에요.`);
        }
    };

    const isActive = (href: string) => {
        if (href === "/store") {
            return pathname === "/store" || (pathname.startsWith("/store") && pathname !== "/store/register" && !pathname.startsWith("/store/register"));
        }
        if (href === "/mypage") {
            return pathname === "/mypage" || pathname.startsWith("/mypage/");
        }
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <>
        <header
            className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#f7f7f8]/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-[#f7f7f8]/80"
            style={{
                boxShadow: "0 1px 0 rgba(255,255,255,0.7) inset",
            }}
        >
            <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-8">
                <Link
                    href="/"
                    className="flex shrink-0 items-center transition-opacity duration-200 hover:opacity-80"
                    aria-label="카꾸미 홈"
                >
                    <Image src="/카꾸미.png" alt="카꾸미" width={110} height={44} quality={100} unoptimized style={{ objectFit: "contain" }} />
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {NAV_ITEMS.map(({ href, label }) => {
                        const active = isActive(href);
                        const isAdminLink = href === "/admin";
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={(e) => handleNavClick(e, href)}
                                className="rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150"
                                style={{
                                    color: active ? "#ff9500" : isAdminLink ? "#ff3b30" : "#3a3a3c",
                                    background: "transparent",
                                    fontWeight: active ? 700 : isAdminLink ? 600 : 500,
                                }}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="ml-auto flex items-center gap-5">
                    {role && <NotificationBell />}
                    <AuthStatus myPageColor={isActive("/mypage") ? "#ff9500" : undefined} />
                </div>
            </div>
        </header>
        {loginModal && (
            <LoginRequiredModal message={loginModal} onClose={() => setLoginModal(null)} />
        )}
        </>
    );
}

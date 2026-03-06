"use client";

import Image from "next/image";
import Link from "next/link";
import AuthStatus from "./AuthStatus";
import NotificationBell from "./NotificationBell";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const BASE_NAV_ITEMS = [
    { href: "/store", label: "테마 스토어" },
    { href: "/create", label: "테마 만들기" },
    { href: "/support", label: "고객센터" },
];

export default function Header() {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/auth/session", { cache: "no-store" })
            .then((r) => r.json())
            .then((d: { session?: { role?: string } | null }) => {
                setRole(d?.session?.role ?? null);
            })
            .catch(() => {});
    }, []);

    const isAdmin = role === "ADMIN";
    // CREATOR 또는 ADMIN: 테마 등록, USER 또는 비로그인: 입점 신청
    const registerItem = (role === "CREATOR" || role === "ADMIN")
        ? { href: "/store/register", label: "테마 등록" }
        : { href: "/mypage/creator-apply", label: "입점 신청" };

    const NAV_ITEMS = [
        BASE_NAV_ITEMS[0],
        BASE_NAV_ITEMS[1],
        registerItem,
        BASE_NAV_ITEMS[2],
    ];

    const isActive = (href: string) => {
        if (href === "/store") {
            return pathname === "/store" || (pathname.startsWith("/store") && pathname !== "/store/register" && !pathname.startsWith("/store/register"));
        }
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <header
            className="sticky top-0 z-50 flex items-center px-6 py-0 shrink-0"
            style={{
                background: "rgba(236, 236, 240, 0.72)",
                backdropFilter: "blur(40px) saturate(200%)",
                WebkitBackdropFilter: "blur(40px) saturate(200%)",
                borderBottom: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset",
                height: 48,
            }}
        >
            <Link href="/">
                <Image src="/카꾸미.png" alt="카꾸미" width={110} height={44} quality={100} unoptimized style={{ objectFit: "contain" }} />
            </Link>
            <nav className="flex items-center gap-6 ml-8">
                {NAV_ITEMS.map(({ href, label }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="text-[13px] font-medium transition-opacity hover:opacity-60"
                            style={{ color: active ? "rgb(255, 149, 0)" : "#3a3a3c", fontWeight: active ? 700 : 500 }}
                        >
                            {label}
                        </Link>
                    );
                })}
                {/* 관리자 메뉴 — ADMIN일 때만 표시 */}
                {isAdmin && (
                    <Link
                        href="/admin"
                        className="text-[13px] font-medium transition-opacity hover:opacity-60"
                        style={{
                            color: pathname.startsWith("/admin") ? "rgb(255, 149, 0)" : "#ff3b30",
                            fontWeight: pathname.startsWith("/admin") ? 700 : 600,
                        }}
                    >
                        관리자페이지
                    </Link>
                )}
            </nav>
            <div className="flex items-center gap-6 ml-auto">
                {role && <NotificationBell />}
                <AuthStatus />
            </div>
        </header>
    );
}

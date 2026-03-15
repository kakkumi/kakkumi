"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginRequiredModal from "./LoginRequiredModal";

export default function HeroButtons({ variant }: { variant: "hero" | "bottom" }) {
    const router = useRouter();
    const [loginModal, setLoginModal] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        fetch("/api/auth/session", { cache: "no-store" })
            .then(r => r.json())
            .then((d: { session?: { role?: string } | null }) => {
                setIsLoggedIn(!!d?.session);
            })
            .catch(() => setIsLoggedIn(false));
    }, []);

    const handleClick = () => {
        if (isLoggedIn === false) {
            setLoginModal("테마 만들기는 로그인이 필요한 기능이에요.");
            return;
        }
        router.push("/create");
    };

    return (
        <>
            {variant === "hero" ? (
                <div className="mt-12 flex flex-wrap items-center gap-5">
                    <button
                        onClick={handleClick}
                        className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                        style={{ background: "rgb(255,149,0)", color: "#fff", boxShadow: "0 14px 36px rgba(255,149,0,0.28)" }}
                    >
                        무료로 시작하기
                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleClick}
                    className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                    style={{ background: "rgb(255,149,0)", color: "#fff", boxShadow: "0 14px 34px rgba(255,149,0,0.24)" }}
                >
                    테마 만들러 가기
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>
            )}

            {loginModal && (
                <LoginRequiredModal message={loginModal} onClose={() => setLoginModal(null)} />
            )}
        </>
    );
}

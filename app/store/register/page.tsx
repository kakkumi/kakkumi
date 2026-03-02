import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { createHmac } from "crypto";
import RegisterForm from "./RegisterForm";

const SESSION_COOKIE_NAME = "kakkumi_session";

function verifySession(token: string, secret: string) {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const expectedSignature = createHmac("sha256", secret).update(json).digest("base64url");
    if (signature !== expectedSignature) return null;
    return JSON.parse(json) as Record<string, unknown>;
}

async function getSession() {
    try {
        const sessionSecret = process.env.KAKAO_SESSION_SECRET;
        if (!sessionSecret) return null;
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
        if (!sessionCookie) return null;
        const session = verifySession(sessionCookie.value, sessionSecret);
        return session as { name?: string | null; image?: string | null } | null;
    } catch {
        return null;
    }
}

export default async function RegisterPage() {
    const session = await getSession();

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}
        >
            {/* ── 네비게이션 바 ── */}
            <header
                className="sticky top-0 z-50 flex items-center justify-between px-6 py-0"
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
                <nav className="flex items-center gap-6">
                    <Link href="/#features" className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>기능</Link>
                    <Link href="/#how" className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>사용 방법</Link>
                    <Link href="/store" className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>테마 스토어</Link>
                    <Link href="/create" className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>테마 만들기</Link>
                    <Link href="/store/register" className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>테마 등록</Link>
                    <div className="w-[1px] h-5 bg-[rgba(0,0,0,0.25)]" aria-hidden="true" />
                    {session ? (
                        <div className="flex items-center gap-3">
                            <span className="text-[13px] font-semibold" style={{ color: "#3A1D1D" }}>{session.name ?? "로그인됨"}</span>
                            <Link href="/mypage" className="text-[13px] font-semibold transition-opacity hover:opacity-70" style={{ color: "#3A1D1D" }}>마이페이지</Link>
                            <a href="/api/auth/logout" className="px-2 py-1 rounded-md text-[12px] font-semibold transition-opacity hover:opacity-70" style={{ border: "1px solid #3A1D1D", color: "#3A1D1D" }}>로그아웃</a>
                        </div>
                    ) : (
                        <a href="/api/auth/kakao" className="text-[13px] font-semibold transition-opacity hover:opacity-70" style={{ color: "#3A1D1D" }}>카카오 로그인</a>
                    )}
                </nav>
            </header>

            {/* ── 본문 ── */}
            <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 pt-10 pb-20 flex flex-col gap-6">

                {/* 헤더 */}
                <div className="flex flex-col items-start gap-2">
                    <h1 className="text-[32px] font-extrabold leading-tight text-[#1c1c1e]" style={{ fontFamily: "'ChosunIlboMyungjo', serif" }}>
                        테마 등록하기
                    </h1>
                    <p className="text-[14px] text-[#8e8e93]">
                        직접 만든 테마를 스토어에 등록하고 다른 사용자와 공유해보세요.
                    </p>
                </div>

                {session ? (
                    <RegisterForm authorName={session.name ?? "사용자"} />
                ) : (
                    /* 비로그인 상태 */
                    <div
                        className="flex flex-col items-center gap-6 p-12 rounded-[28px]"
                        style={{
                            background: "rgba(255,255,255,0.5)",
                            border: "1px solid rgba(255,255,255,0.8)",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                        }}
                    >
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#f5f5f5" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1.5 text-center">
                            <h2 className="text-[18px] font-bold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>로그인이 필요해요</h2>
                            <p className="text-[13px]" style={{ color: "#8e8e93" }}>테마를 등록하려면 카카오 로그인을 해주세요.</p>
                        </div>
                        <a href="/api/auth/kakao">
                            <button
                                className="px-7 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:brightness-105"
                                style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.3)" }}
                            >
                                카카오 로그인
                            </button>
                        </a>
                    </div>
                )}
            </div>

            {/* ── 푸터 ── */}
            <footer
                className="mt-auto px-8 py-5"
                style={{ background: "rgba(236,236,240,0.6)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(0,0,0,0.07)" }}
            >
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-[12px]" style={{ color: "#3a3a3c" }}>
                            주식회사 카꾸미 · 대표자 장환희 · 이메일 <a href="mailto:aaa@kakkumi.com" className="hover:underline" style={{ color: "#3a3a3c" }}>aaa@kakkumi.com</a>
                        </p>
                        <p className="text-[11px]" style={{ color: "#8e8e93" }}>© 2026 카꾸미. 카카오톡과 무관한 개인 제작 툴입니다.</p>
                    </div>
                    <div className="flex items-center gap-5">
                        <a href="#" className="text-[12px] hover:underline" style={{ color: "#6b6b6b" }}>이용약관</a>
                        <a href="#" className="text-[12px] hover:underline" style={{ color: "#6b6b6b" }}>개인정보처리방침</a>
                        <a href="mailto:aaa@kakkumi.com" className="text-[12px] hover:underline" style={{ color: "#6b6b6b" }}>문의</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

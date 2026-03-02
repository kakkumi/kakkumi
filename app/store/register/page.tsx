import { cookies } from "next/headers";
import { createHmac } from "crypto";
import RegisterForm from "./RegisterForm";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

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
            <Header />

            {/* ── 본문 ── */}
            <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 pt-10 pb-20 flex flex-col gap-6">

                {session ? (
                    <RegisterForm authorName={session.name ?? "사용자"} headerSlot={
                        <div className="flex flex-col items-start gap-2">
                            <h1 className="text-[32px] font-extrabold leading-tight text-[#1c1c1e]" style={{ fontFamily: "'ChosunIlboMyungjo', serif" }}>
                                테마 등록하기
                            </h1>
                            <p className="text-[14px] text-[#8e8e93]">
                                직접 만든 테마를 스토어에 등록하고 다른 사용자와 공유해보세요.
                            </p>
                        </div>
                    } />
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
            <Footer />
        </div>
    );
}

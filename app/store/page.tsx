import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { createHmac } from "crypto";
import StoreContent from "./StoreContent";

const SESSION_COOKIE_NAME = "kakkumi_session";

function verifySession(token: string, secret: string) {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const expectedSignature = createHmac("sha256", secret)
        .update(json)
        .digest("base64url");

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

export default async function StorePage() {
    const session = await getSession();

    return (
        <div
            className="h-screen flex flex-col overflow-hidden"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}
        >
            {/* ── 네비게이션 바 ── */}
            <header
                className="sticky top-0 z-50 flex items-center justify-between px-6 py-0 shrink-0"
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
                    <Link href="/store" className="text-[13px] font-semibold transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>테마 스토어</Link>
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

            {/* ── 본문 (스크롤 영역) ── */}
            <div id="store-scroll" className="flex-1 overflow-y-auto">
                <StoreContent />
            </div>
        </div>
    );
}

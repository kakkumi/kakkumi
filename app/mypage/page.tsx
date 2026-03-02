import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { createHmac } from "crypto";

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
        return session as { name?: string | null; image?: string | null; id?: string | null } | null;
    } catch {
        return null;
    }
}

export default async function MyPage() {
    const session = await getSession();

    const sidebarMenus = [
        {
            category: "테마",
            items: [
                { label: "내 테마" },
                { label: "구매 테마" },
                { label: "전체 테마" },
            ],
        },
        {
            category: "쇼핑",
            items: [
                { label: "적립금" },
                { label: "작성 가능한 후기" },
                { label: "쿠폰" },
                { label: "주문 내역" },
                { label: "취소/반품/교환 내역" },
                { label: "최근 본 상품" },
                { label: "장바구니" },
                { label: "좋아요" },
            ],
        },
        {
            category: "활동",
            items: [
                { label: "1:1문의 내역" },
                { label: "리뷰" },
            ],
        },
        {
            category: "정보",
            items: [
                { label: "회원정보 수정" },
                { label: "회원 탈퇴" },
            ],
        },
    ];

    return (
        <div
            className="min-h-screen flex flex-col mac-scroll"
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
                    <div className="w-[1px] h-5 bg-[rgba(0,0,0,0.25)]" aria-hidden="true" />
                    {session ? (
                        <div className="flex items-center gap-3">
                            <span className="text-[13px] font-semibold" style={{ color: "#3A1D1D" }}>{session.name ?? "로그인됨"}</span>
                            <Link
                                href="/mypage"
                                className="text-[13px] font-semibold transition-opacity hover:opacity-70"
                                style={{ color: "#3A1D1D" }}
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
                    ) : (
                        <a href="/api/auth/kakao" className="text-[13px] font-semibold transition-opacity hover:opacity-70" style={{ color: "#3A1D1D" }}>
                            카카오 로그인
                        </a>
                    )}
                </nav>
            </header>

            {/* ── 본문 (사이드바 + 메인) ── */}
            <div className="flex flex-1 max-w-[1200px] mx-auto w-full px-6 pt-12 pb-20 gap-8">

                {/* ── 사이드바 ── */}
                <aside className="w-[220px] shrink-0 flex flex-col gap-1">
                    {/* 메뉴 그룹 */}
                    {sidebarMenus.map((group, index) => (
                        <div key={group.category} className="flex flex-col gap-0.5">
                            <span
                                className="text-[11px] font-bold tracking-[0.15em] uppercase px-3 mb-1"
                                style={{ color: "#8e8e93" }}
                            >
                                {group.category}
                            </span>
                            {group.items.map((item) => (
                                <button
                                    key={item.label}
                                    className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all text-[#3a3a3c] hover:text-[#FF9500]"
                                >
                                    {item.label}
                                </button>
                            ))}
                            {index < sidebarMenus.length - 1 && (
                                <div className="my-3 h-[1px]" style={{ background: "rgba(0,0,0,0.18)" }} />
                            )}
                        </div>
                    ))}
                </aside>

                {/* ── 메인 콘텐츠 ── */}
                <main className="flex-1 flex flex-col gap-6">
                    {session ? (
                        <>
                            {/* ── 상단: 프로필 영역 ── */}
                            <div
                                className="flex items-center gap-5 p-7 rounded-[24px]"
                                style={{
                                    background: "rgba(255,255,255,0.35)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255,255,255,0.6)",
                                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                                }}
                            >
                                <div
                                    className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                                    style={{ background: "#ffe500", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
                                >
                                    {session.image ? (
                                        <img src={session.image} alt={session.name ?? "프로필"} className="w-full h-full object-cover" />
                                    ) : (
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3A1D1D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="8" r="4" />
                                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-[20px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                                        {session.name ?? "사용자"}
                                    </h2>
                                    <p className="text-[12px]" style={{ color: "#8e8e93" }}>가입일 · 2026년 3월</p>
                                </div>
                            </div>

                            {/* ── 중단: 핵심 수치 카드 ── */}
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: "제작한 테마", value: "3개", color: "rgba(255,239,154,0.7)" },
                                    { label: "구매한 테마", value: "5개", color: "rgba(170,189,232,0.6)" },
                                    { label: "적립금", value: "2,400원", color: "rgba(212,245,212,0.8)" },
                                    { label: "쿠폰", value: "2장", color: "rgba(253,216,229,0.7)" },
                                ].map((card) => (
                                    <div
                                        key={card.label}
                                        className="flex flex-col gap-2 p-5 rounded-[20px] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
                                        style={{
                                            background: card.color,
                                            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                                        }}
                                    >
                                        <span className="text-[11px] font-semibold" style={{ color: "rgba(0,0,0,0.45)" }}>{card.label}</span>
                                        <span className="text-[22px] font-extrabold" style={{ color: "#1c1c1e" }}>{card.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* ── 하단: 최근 활동 ── */}
                            <div
                                className="flex flex-col gap-5 p-7 rounded-[24px]"
                                style={{
                                    background: "rgba(255,255,255,0.7)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255,255,255,0.8)",
                                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                                }}
                            >
                                <h3 className="text-[15px] font-bold" style={{ color: "#1c1c1e" }}>최근 활동</h3>

                                {/* 최근 주문 내역 */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[12px] font-bold tracking-[0.1em] uppercase" style={{ color: "#8e8e93" }}>최근 주문 내역</span>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            { name: "봄 벚꽃 테마", date: "2026.02.28", status: "결제완료" },
                                            { name: "다크 미니멀 테마", date: "2026.02.20", status: "결제완료" },
                                            { name: "파스텔 블루 테마", date: "2026.02.10", status: "결제완료" },
                                        ].map((order) => (
                                            <div
                                                key={order.name}
                                                className="flex items-center justify-between px-4 py-3 rounded-[14px]"
                                                style={{ background: "rgba(0,0,0,0.03)" }}
                                            >
                                                <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>{order.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[12px]" style={{ color: "#8e8e93" }}>{order.date}</span>
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FFEF9A", color: "#3A1D1D" }}>{order.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.07)" }} />

                                {/* 작성 가능한 리뷰 */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[12px] font-bold tracking-[0.1em] uppercase" style={{ color: "#8e8e93" }}>작성 가능한 리뷰</span>
                                    <div
                                        className="flex items-center justify-between px-4 py-3 rounded-[14px]"
                                        style={{ background: "rgba(0,0,0,0.03)" }}
                                    >
                                        <span className="text-[13px] font-medium" style={{ color: "#1c1c1e" }}>봄 벚꽃 테마 리뷰를 작성해보세요</span>
                                        <button
                                            className="text-[12px] font-semibold px-3 py-1 rounded-full transition-all hover:brightness-105"
                                            style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D" }}
                                        >
                                            리뷰 쓰기
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[1px]" style={{ background: "rgba(0,0,0,0.07)" }} />

                                {/* 최근 본 테마 */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[12px] font-bold tracking-[0.1em] uppercase" style={{ color: "#8e8e93" }}>최근 본 테마</span>
                                    <div className="flex gap-3">
                                        {[
                                            { name: "네온 퍼플", bg: "#e8d4f5" },
                                            { name: "오션 블루", bg: "#aabde8" },
                                            { name: "선셋 오렌지", bg: "#fdd8c4" },
                                            { name: "민트 그린", bg: "#d4f5e8" },
                                        ].map((theme) => (
                                            <div
                                                key={theme.name}
                                                className="flex flex-col items-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
                                            >
                                                <div
                                                    className="w-14 h-14 rounded-[14px]"
                                                    style={{ background: theme.bg, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                                                />
                                                <span className="text-[11px] font-medium" style={{ color: "#3a3a3c" }}>{theme.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* 비로그인 상태 */
                        <div
                            className="flex flex-col items-center gap-6 p-12 rounded-[32px]"
                            style={{
                                background: "rgba(255,255,255,0.7)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(255,255,255,0.8)",
                                boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#f5f5f5" }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                            </div>
                            <div className="flex flex-col gap-2 text-center">
                                <h2 className="text-[22px] font-bold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>로그인이 필요해요</h2>
                                <p className="text-[14px]" style={{ color: "#8e8e93" }}>마이페이지를 이용하려면 카카오 로그인을 해주세요.</p>
                            </div>
                            <a href="/api/auth/kakao">
                                <button
                                    className="px-8 py-3.5 rounded-xl text-[15px] font-bold transition-all active:scale-95 hover:brightness-105"
                                    style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.3)" }}
                                >
                                    카카오 로그인
                                </button>
                            </a>
                        </div>
                    )}
                </main>
            </div>

            {/* ── 푸터 ── */}
            <footer
                className="mt-auto px-8 py-5 flex flex-col gap-2"
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

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/constants";

// 로그인이 필요한 경로
const AUTH_REQUIRED = [
    "/mypage",
    "/onboarding",
    "/store/register",
    "/my-themes",
    "/notifications",
    "/gallery/new",
];

// 관리자만 접근 가능한 경로
const ADMIN_REQUIRED = ["/admin"];

/**
 * 미들웨어 전용 세션 파싱 (서명 검증 없이 payload만 읽음)
 * 실제 인증/권한 검증은 각 API route의 getServerSession()에서 수행
 * Edge Runtime에서는 Node.js crypto 사용 불가이므로 payload 디코딩만 수행
 */
function parseSessionPayload(token: string): { role: string; issuedAt: number } | null {
    try {
        const [payloadB64] = token.split(".");
        if (!payloadB64) return null;

        // base64url → base64 변환 후 디코딩
        const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
        const json = atob(padded);

        const parsed = JSON.parse(json) as { role?: string; issuedAt?: number };
        if (!parsed.role || !parsed.issuedAt) return null;

        // 만료 검증
        if (Date.now() - parsed.issuedAt > SESSION_MAX_AGE_SECONDS * 1000) {
            return null;
        }

        return { role: parsed.role, issuedAt: parsed.issuedAt };
    } catch {
        return null;
    }
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isAdminPath = ADMIN_REQUIRED.some((p) => pathname.startsWith(p));
    const isAuthPath = AUTH_REQUIRED.some((p) => pathname.startsWith(p));

    if (!isAdminPath && !isAuthPath) return NextResponse.next();

    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
        const loginUrl = new URL("/", req.url);
        loginUrl.searchParams.set("login", "required");
        return NextResponse.redirect(loginUrl);
    }

    const session = parseSessionPayload(sessionCookie);

    if (!session) {
        const loginUrl = new URL("/", req.url);
        loginUrl.searchParams.set("login", "required");
        return NextResponse.redirect(loginUrl);
    }

    // 관리자 전용 경로: ADMIN 역할 아니면 홈으로
    if (isAdminPath && session.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/mypage/:path*",
        "/onboarding/:path*",
        "/store/register/:path*",
        "/my-themes/:path*",
        "/notifications/:path*",
        "/gallery/new",
    ],
};

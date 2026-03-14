import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/constants";

// 로그인이 필요한 경로
const AUTH_REQUIRED = [
    "/mypage",
    "/onboarding",
    "/store/register",
    "/my-themes",
    "/notifications",
];

// 관리자만 접근 가능한 경로
const ADMIN_REQUIRED = ["/admin"];

function verifySessionFromCookie(token: string, secret: string): { role: string; issuedAt: number } | null {
    try {
        const [payloadB64, signature] = token.split(".");
        if (!payloadB64 || !signature) return null;

        const json = Buffer.from(payloadB64, "base64url").toString("utf8");
        const expectedSignature = createHmac("sha256", secret)
            .update(json)
            .digest("base64url");

        if (signature !== expectedSignature) return null;

        const parsed = JSON.parse(json) as { role: string; issuedAt: number };

        // 만료 검증
        if (Date.now() - parsed.issuedAt > SESSION_MAX_AGE_SECONDS * 1000) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const sessionSecret = process.env.KAKAO_SESSION_SECRET;

    // 관리자 경로 보호
    const isAdminPath = ADMIN_REQUIRED.some((p) => pathname.startsWith(p));
    // 인증 필요 경로 보호
    const isAuthPath = AUTH_REQUIRED.some((p) => pathname.startsWith(p));

    if (!isAdminPath && !isAuthPath) return NextResponse.next();

    // 세션 쿠키 검증
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie || !sessionSecret) {
        const loginUrl = new URL("/", req.url);
        loginUrl.searchParams.set("login", "required");
        return NextResponse.redirect(loginUrl);
    }

    const session = verifySessionFromCookie(sessionCookie, sessionSecret);

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
    ],
};

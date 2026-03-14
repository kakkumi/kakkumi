import { NextRequest, NextResponse } from "next/server";
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

/** base64url 디코딩 (Edge 환경에서 Buffer 미사용) */
function base64urlDecode(str: string): string {
    // base64url → base64 변환
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return atob(padded);
}

/** HMAC-SHA256 서명 검증 (Web Crypto API) */
async function verifyHmac(payload: string, signature: string, secret: string): Promise<boolean> {
    try {
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            enc.encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );
        // signature는 base64url → Uint8Array로 변환
        const sigBase64 = signature.replace(/-/g, "+").replace(/_/g, "/");
        const sigPadded = sigBase64 + "=".repeat((4 - (sigBase64.length % 4)) % 4);
        const sigBytes = Uint8Array.from(atob(sigPadded), (c) => c.charCodeAt(0));
        return await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
    } catch {
        return false;
    }
}

async function verifySessionFromCookie(
    token: string,
    secret: string
): Promise<{ role: string; issuedAt: number } | null> {
    try {
        const [payloadB64, signature] = token.split(".");
        if (!payloadB64 || !signature) return null;

        const json = base64urlDecode(payloadB64);
        const valid = await verifyHmac(json, signature, secret);
        if (!valid) return null;

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

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const sessionSecret = process.env.KAKAO_SESSION_SECRET;

    const isAdminPath = ADMIN_REQUIRED.some((p) => pathname.startsWith(p));
    const isAuthPath = AUTH_REQUIRED.some((p) => pathname.startsWith(p));

    if (!isAdminPath && !isAuthPath) return NextResponse.next();

    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie || !sessionSecret) {
        const loginUrl = new URL("/", req.url);
        loginUrl.searchParams.set("login", "required");
        return NextResponse.redirect(loginUrl);
    }

    const session = await verifySessionFromCookie(sessionCookie, sessionSecret);

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

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
 * Edge Runtime용 WebCrypto API로 HMAC-SHA256 서명 검증
 * Node.js crypto는 Edge Runtime에서 사용 불가이므로 SubtleCrypto 사용
 */
async function verifySessionSignature(token: string, secret: string): Promise<boolean> {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payloadB64, signature] = parts;

    // base64url → base64 변환 후 raw 바이트로 디코딩
    // (atob 결과를 TextEncoder로 재인코딩하면 한국어 등 다중바이트 문자가 깨지므로
    //  반드시 Uint8Array로 변환한 뒤 그대로 서명에 사용해야 함)
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    let rawBytes: Uint8Array<ArrayBuffer>;
    try {
        const binaryStr = atob(padded);
        const buf = new ArrayBuffer(binaryStr.length);
        rawBytes = new Uint8Array(buf);
        for (let i = 0; i < binaryStr.length; i++) rawBytes[i] = binaryStr.charCodeAt(i);
    } catch {
        return false;
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    // raw bytes 그대로 서명 (세션 생성 시 Node.js createHmac.update(json)과 동일한 바이트)
    const sigBuffer = await crypto.subtle.sign("HMAC", key, rawBytes);

    // ArrayBuffer → base64url
    const sigBytes = new Uint8Array(sigBuffer);
    let binary = "";
    for (const byte of sigBytes) binary += String.fromCharCode(byte);
    const expectedSig = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

    return signature === expectedSig;
}

/**
 * 미들웨어 전용 세션 파싱 — 서명 검증 포함
 * (이전에는 서명 없이 payload만 읽었으므로 변조 쿠키가 통과 가능했음)
 */
async function parseSessionPayload(
    token: string,
    secret: string
): Promise<{ role: string; issuedAt: number } | null> {
    try {
        // 1) 서명 검증
        const valid = await verifySessionSignature(token, secret);
        if (!valid) return null;

        // 2) payload 디코딩 (UTF-8 바이트 → 유니코드 문자열)
        const [payloadB64] = token.split(".");
        const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
        const binaryStr = atob(padded);
        const buf = new ArrayBuffer(binaryStr.length);
        const rawBytes = new Uint8Array(buf);
        for (let i = 0; i < binaryStr.length; i++) rawBytes[i] = binaryStr.charCodeAt(i);
        const json = new TextDecoder().decode(rawBytes);
        const parsed = JSON.parse(json) as { role?: string; issuedAt?: number };
        if (!parsed.role || !parsed.issuedAt) return null;

        // 3) 만료 검증
        if (Date.now() - parsed.issuedAt > SESSION_MAX_AGE_SECONDS * 1000) return null;

        return { role: parsed.role, issuedAt: parsed.issuedAt };
    } catch {
        return null;
    }
}

export async function middleware(req: NextRequest) {
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

    const sessionSecret = process.env.KAKAO_SESSION_SECRET;
    if (!sessionSecret) {
        // 환경변수 미설정 시 접근 차단
        return NextResponse.redirect(new URL("/", req.url));
    }

    const session = await parseSessionPayload(sessionCookie, sessionSecret);

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

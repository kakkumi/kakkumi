import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "kakkumi_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function signSession(payload: Record<string, unknown>, secret: string) {
    const json = JSON.stringify(payload);
    const signature = createHmac("sha256", secret)
        .update(json)
        .digest("base64url");
    const body = Buffer.from(json).toString("base64url");
    return `${body}.${signature}`;
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error || !code) {
        return NextResponse.redirect(new URL("/?login=failed", url.origin));
    }

    const clientId = process.env.KAKAO_CLIENT_ID;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    const redirectUri = process.env.KAKAO_REDIRECT_URI;
    const sessionSecret = process.env.KAKAO_SESSION_SECRET;

    if (!clientId || !redirectUri || !sessionSecret) {
        return NextResponse.json(
            { error: "Missing KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI, or KAKAO_SESSION_SECRET" },
            { status: 500 }
        );
    }

    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: clientId,
            redirect_uri: redirectUri,
            code,
            ...(clientSecret ? { client_secret: clientSecret } : {}),
        }),
    });

    if (!tokenResponse.ok) {
        return NextResponse.redirect(new URL("/?login=failed", url.origin));
    }

    const tokenJson = (await tokenResponse.json()) as {
        access_token?: string;
    };

    if (!tokenJson.access_token) {
        return NextResponse.redirect(new URL("/?login=failed", url.origin));
    }

    const profileResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: {
            Authorization: `Bearer ${tokenJson.access_token}`,
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
    });

    if (!profileResponse.ok) {
        return NextResponse.redirect(new URL("/?login=failed", url.origin));
    }

    const profileJson = (await profileResponse.json()) as {
        id?: number;
        kakao_account?: {
            email?: string;
            profile?: {
                nickname?: string;
                profile_image_url?: string;
            };
        };
    };

    const kakaoId = String(profileJson.id);
    const email = profileJson.kakao_account?.email ?? null;
    const name = profileJson.kakao_account?.profile?.nickname ?? "카카오 사용자";
    const image = profileJson.kakao_account?.profile?.profile_image_url ?? null;

    // DB upsert — kakaoId 기준으로 없으면 생성, 있으면 이름/이미지/이메일 업데이트
    const dbUser = await prisma.user.upsert({
        where: { kakaoId },
        create: { kakaoId, email, name, image },
        update: { name, image, ...(email ? { email } : {}) },
    });

    const sessionPayload = {
        provider: "kakao",
        dbId: dbUser.id,       // DB의 UUID — 찜, 구매, 리뷰 등에 사용
        id: kakaoId,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
        role: dbUser.role,
        issuedAt: Date.now(),
    };

    const sessionToken = signSession(sessionPayload, sessionSecret);
    const response = NextResponse.redirect(new URL("/", url.origin));

    response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
}

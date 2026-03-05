import { NextResponse } from "next/server";

export async function GET() {
    const clientId = process.env.KAKAO_CLIENT_ID;
    const redirectUri = process.env.KAKAO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return NextResponse.json(
            { error: "Missing KAKAO_CLIENT_ID or KAKAO_REDIRECT_URI" },
            { status: 500 }
        );
    }

    const kakaoAuthUrl = new URL("https://kauth.kakao.com/oauth/authorize");
    kakaoAuthUrl.searchParams.set("client_id", clientId);
    kakaoAuthUrl.searchParams.set("redirect_uri", redirectUri);
    kakaoAuthUrl.searchParams.set("response_type", "code");
    kakaoAuthUrl.searchParams.set("scope", "profile_nickname account_email");
    kakaoAuthUrl.searchParams.set("prompt", "login");

    return NextResponse.redirect(kakaoAuthUrl);
}

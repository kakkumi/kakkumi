import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, WITHDRAW_REREGISTER_DAYS } from "@/lib/constants";

function signSession(payload: Record<string, unknown>, secret: string) {
    const json = JSON.stringify(payload);
    const signature = createHmac("sha256", secret).update(json).digest("base64url");
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
        return NextResponse.redirect(new URL("/?login=failed", url.origin));
    }

    try {
        // 1) 토큰 발급
        const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
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

        const tokenJson = (await tokenResponse.json()) as { access_token?: string };
        if (!tokenJson.access_token) {
            return NextResponse.redirect(new URL("/?login=failed", url.origin));
        }

        // 2) 프로필 조회
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
                profile?: { nickname?: string };
            };
        };

        const kakaoId = String(profileJson.id);
        const email = profileJson.kakao_account?.email ?? null;
        const name = profileJson.kakao_account?.profile?.nickname ?? "카카오 사용자";

        // 3) DB upsert — soft delete 유저 포함 처리
        let dbUser: { id: string; email: string | null; name: string; role: string };
        try {
            const existingRows = await prisma.$queryRaw<{
                id: string; email: string | null; name: string;
                role: string; deletedAt: Date | null;
            }[]>`
                SELECT id, email, name, role::text, "deletedAt"
                FROM "User" WHERE "kakaoId" = ${kakaoId} LIMIT 1
            `;

            if (existingRows.length > 0) {
                const existing = existingRows[0];
                if (existing.deletedAt !== null) {
                    const daysSinceDelete = (Date.now() - new Date(existing.deletedAt).getTime()) / (24 * 60 * 60 * 1000);
                    if (daysSinceDelete < WITHDRAW_REREGISTER_DAYS) {
                        const remainDays = Math.ceil(WITHDRAW_REREGISTER_DAYS - daysSinceDelete);
                        return NextResponse.redirect(new URL(`/?login=blocked&days=${remainDays}`, url.origin));
                    }
                    // 탈퇴 유저 재가입 → 복원
                    if (email) {
                        await prisma.$executeRaw`
                            UPDATE "User" SET "deletedAt" = NULL, name = ${name}, email = ${email}, "updatedAt" = NOW()
                            WHERE "kakaoId" = ${kakaoId}
                        `;
                    } else {
                        await prisma.$executeRaw`
                            UPDATE "User" SET "deletedAt" = NULL, name = ${name}, "updatedAt" = NOW()
                            WHERE "kakaoId" = ${kakaoId}
                        `;
                    }
                } else {
                    // 일반 재로그인 → 프로필 업데이트
                    if (email) {
                        await prisma.$executeRaw`
                            UPDATE "User" SET name = ${name}, email = ${email}, "updatedAt" = NOW()
                            WHERE "kakaoId" = ${kakaoId}
                        `;
                    } else {
                        await prisma.$executeRaw`
                            UPDATE "User" SET name = ${name}, "updatedAt" = NOW()
                            WHERE "kakaoId" = ${kakaoId}
                        `;
                    }
                }
                dbUser = { ...existing, name };
            } else {
                // 신규 가입
                dbUser = await prisma.user.create({
                    data: { kakaoId, email, name },
                });
            }
        } catch (upsertErr) {
            console.error("[kakao callback upsert error]", upsertErr);
            return NextResponse.redirect(new URL("/?login=failed", url.origin));
        }

        // 4) nickname 조회 — 컬럼이 아직 없으면 기존 유저로 간주
        let nickname: string | null;
        let nicknameColumnExists = true;

        try {
            const rows = await prisma.$queryRaw<{ nickname: string | null }[]>`
                SELECT nickname FROM "User" WHERE id = ${dbUser.id} LIMIT 1
            `;
            nickname = rows[0]?.nickname ?? null;
        } catch (e) {
            console.error("[nickname query error]", e);
            // 컬럼이 없으면 DB push 필요 — 기존 유저로 간주해 홈으로
            nicknameColumnExists = false;
            nickname = "pending";
        }


        // nickname 컬럼 자체가 없으면 -> npx prisma db push 필요
        // 일단 홈으로 보내되 세션에는 name을 nickname으로 사용
        if (!nicknameColumnExists) {
            nickname = dbUser.name;
        }

        // 5) 세션 생성 (avatarUrl은 쿠키 크기 초과 방지를 위해 세션에 포함하지 않음 — 페이지에서 DB 직접 조회)
        const sessionPayload = {
            provider: "kakao",
            dbId: dbUser.id,
            id: kakaoId,
            email: dbUser.email,
            name: dbUser.name,
            nickname,
            role: dbUser.role,
            issuedAt: Date.now(),
        };

        const sessionToken = signSession(sessionPayload, sessionSecret);
        const redirectTo = nickname ? "/" : "/onboarding";
        const response = NextResponse.redirect(new URL(redirectTo, url.origin));

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

    } catch (err) {
        console.error("[kakao callback error]", err);
        return NextResponse.redirect(new URL("/?login=failed", url.origin));
    }
}

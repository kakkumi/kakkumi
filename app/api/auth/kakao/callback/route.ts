import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "kakkumi_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

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
        return NextResponse.json(
            { error: "Missing KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI, or KAKAO_SESSION_SECRET" },
            { status: 500 }
        );
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
                profile?: { nickname?: string; profile_image_url?: string };
            };
        };

        const kakaoId = String(profileJson.id);
        const email = profileJson.kakao_account?.email ?? null;
        const name = profileJson.kakao_account?.profile?.nickname ?? "카카오 사용자";
        const image = profileJson.kakao_account?.profile?.profile_image_url ?? null;

        // 3) DB upsert — soft delete 유저 포함 처리
        let dbUser: { id: string; email: string | null; name: string; image: string | null; role: string };
        try {
            // kakaoId로 기존 유저 조회 (탈퇴한 유저 포함)
            const existingRows = await prisma.$queryRaw<{
                id: string; email: string | null; name: string; image: string | null;
                role: string; deletedAt: Date | null;
            }[]>`
                SELECT id, email, name, image, role::text, "deletedAt"
                FROM "User" WHERE "kakaoId" = ${kakaoId} LIMIT 1
            `;

            if (existingRows.length > 0) {
                const existing = existingRows[0];
                if (existing.deletedAt !== null) {
                    // 탈퇴 후 3일 이내 재가입 차단
                    const daysSinceDelete = (Date.now() - new Date(existing.deletedAt).getTime()) / 86400000;
                    if (daysSinceDelete < 3) {
                        const remainDays = Math.ceil(3 - daysSinceDelete);
                        return NextResponse.redirect(new URL(`/?login=blocked&days=${remainDays}`, url.origin));
                    }
                    // 탈퇴 유저 재가입 → 복원 (referralRewarded는 유지 — 추천 적립 재수령 방지)
                    if (email) {
                        await prisma.$executeRaw`
                            UPDATE "User" SET "deletedAt" = NULL, name = ${name}, image = ${image}, email = ${email}, "updatedAt" = NOW()
                            WHERE "kakaoId" = ${kakaoId}
                        `;
                    } else {
                        await prisma.$executeRaw`
                            UPDATE "User" SET "deletedAt" = NULL, name = ${name}, image = ${image}, "updatedAt" = NOW()
                            WHERE "kakaoId" = ${kakaoId}
                        `;
                    }
                } else {
                    // 일반 재로그인 → 프로필만 업데이트
                    if (email) {
                        await prisma.$executeRaw`
                            UPDATE "User" SET name = ${name}, image = ${image}, email = ${email}, "updatedAt" = NOW()
                            WHERE "kakaoId" = ${kakaoId}
                        `;
                    } else {
                        await prisma.$executeRaw`
                            UPDATE "User" SET name = ${name}, image = ${image}, "updatedAt" = NOW()
                            WHERE "kakaoId" = ${kakaoId}
                        `;
                    }
                }
                dbUser = { ...existing, name, image };
            } else {
                // 신규 가입
                dbUser = await prisma.user.create({
                    data: { kakaoId, email, name, image },
                });
            }
        } catch (upsertErr) {
            console.error("[kakao callback upsert error]", upsertErr);
            return NextResponse.redirect(new URL("/?login=failed", url.origin));
        }

        // 4) nickname 조회 — 컬럼이 아직 없으면 기존 유저로 간주
        let nickname: string | null;
        let avatarUrl: string | null;
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

        // avatarUrl은 별도로 시도 (db push 전이면 없을 수 있음)
        try {
            const rows = await prisma.$queryRaw<{ avatarUrl: string | null }[]>`
                SELECT "avatarUrl" FROM "User" WHERE id = ${dbUser.id} LIMIT 1
            `;
            avatarUrl = rows[0]?.avatarUrl ?? null;
        } catch {
            avatarUrl = null;
        }

        // nickname 컬럼 자체가 없으면 -> npx prisma db push 필요
        // 일단 홈으로 보내되 세션에는 name을 nickname으로 사용
        if (!nicknameColumnExists) {
            nickname = dbUser.name;
        }

        // 5) 세션 생성
        const sessionPayload = {
            provider: "kakao",
            dbId: dbUser.id,
            id: kakaoId,
            email: dbUser.email,
            name: dbUser.name,
            nickname,
            image: dbUser.image,
            avatarUrl,
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

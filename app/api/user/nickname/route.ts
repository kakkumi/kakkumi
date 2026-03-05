import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { validateNickname } from "@/lib/nickname";
import { createHmac } from "crypto";

const SESSION_COOKIE_NAME = "kakkumi_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function signSession(payload: Record<string, unknown>, secret: string) {
    const json = JSON.stringify(payload);
    const signature = createHmac("sha256", secret).update(json).digest("base64url");
    return `${Buffer.from(json).toString("base64url")}.${signature}`;
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { nickname, referralCode } = (await req.json()) as { nickname: string; referralCode?: string | null };
    const trimmed = nickname?.trim();

    // 유효성 검사
    const validationError = validateNickname(trimmed ?? "");
    if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // 중복 체크 (본인 제외)
    const [existing] = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "User" WHERE nickname = ${trimmed} AND id != ${session.dbId} LIMIT 1
    `;
    if (existing) {
        return NextResponse.json({ error: "이미 사용 중인 닉네임입니다." }, { status: 409 });
    }

    // 내 고유 추천인 코드 생성 (닉네임 기반)
    const myReferralCode = trimmed.slice(0, 6) + Math.random().toString(36).slice(2, 5).toUpperCase();

    await prisma.$executeRaw`
        UPDATE "User" SET nickname = ${trimmed}, "referralCode" = ${myReferralCode}, "updatedAt" = NOW() WHERE id = ${session.dbId}
    `;

    // 추천인 처리 (악용 방지 포함) — 닉네임으로 추천인 조회
    if (referralCode && referralCode.trim()) {
        const referrerNickname = referralCode.trim();

        // 1) 이 유저가 이미 추천 적립을 받은 적 있는지 확인 (평생 1회)
        const meRows = await prisma.$queryRaw<{ referralRewarded: boolean }[]>`
            SELECT "referralRewarded" FROM "User" WHERE id = ${session.dbId} LIMIT 1
        `;
        const alreadyRewarded = meRows[0]?.referralRewarded ?? false;

        if (!alreadyRewarded) {
            // 2) 해당 닉네임을 가진 유저 찾기 (본인 제외, 탈퇴 안 한 유저만)
            const referrers = await prisma.$queryRaw<{ id: string }[]>`
                SELECT id FROM "User"
                WHERE nickname = ${referrerNickname}
                  AND id != ${session.dbId}
                  AND "deletedAt" IS NULL
                LIMIT 1
            `;

            if (referrers.length === 0) {
                return NextResponse.json({ error: "존재하지 않는 닉네임입니다." }, { status: 400 });
            }

            const referrerId = referrers[0].id;
            const now = new Date();

            // 3) 추천인의 이번 달 추천 적립 횟수 확인 (월 최대 3회)
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthCountRows = await prisma.$queryRaw<{ cnt: number }[]>`
                SELECT COUNT(*)::int AS cnt FROM "PointHistory"
                WHERE "userId" = ${referrerId}
                  AND type = 'REFERRAL_REWARD'::"PointType"
                  AND "createdAt" >= ${monthStart}
            `;
            const monthCount = monthCountRows[0]?.cnt ?? 0;

            if (monthCount < 3) {
                // 추천인에게 500원 적립
                await prisma.$executeRaw`
                    UPDATE "User" SET credit = credit + 500, "updatedAt" = NOW() WHERE id = ${referrerId}
                `;
                await prisma.$executeRaw`
                    INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "createdAt")
                    VALUES (${crypto.randomUUID()}, ${referrerId}, 500, 'REFERRAL_REWARD'::"PointType", ${'친구 추천 보상 (+500원)'}, ${now})
                `;
            }

            // 신규 가입자에게 500원 적립 + referralRewarded = true 표시
            await prisma.$executeRaw`
                UPDATE "User"
                SET credit = credit + 500, "referralRewarded" = true, "updatedAt" = NOW()
                WHERE id = ${session.dbId}
            `;
            await prisma.$executeRaw`
                INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "createdAt")
                VALUES (${crypto.randomUUID()}, ${session.dbId}, 500, 'REFERRAL_REWARD'::"PointType", ${'추천인 코드 가입 보상 (+500원)'}, ${now})
            `;
        }
    }

    // 세션 쿠키 갱신
    const sessionSecret = process.env.KAKAO_SESSION_SECRET!;
    const newPayload = {
        provider: session.provider,
        dbId: session.dbId,
        id: session.id,
        email: session.email,
        name: session.name,
        nickname: trimmed,
        avatarUrl: (session as { avatarUrl?: string | null }).avatarUrl ?? null,
        role: session.role,
        issuedAt: Date.now(),
    };
    const newToken = signSession(newPayload, sessionSecret);

    const res = NextResponse.json({ nickname: trimmed });
    res.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return res;
}

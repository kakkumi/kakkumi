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

    const { nickname } = (await req.json()) as { nickname: string };
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

    await prisma.$executeRaw`
        UPDATE "User" SET nickname = ${trimmed}, "updatedAt" = NOW() WHERE id = ${session.dbId}
    `;

    // 세션 쿠키 갱신
    const sessionSecret = process.env.KAKAO_SESSION_SECRET!;
    const newPayload = {
        provider: session.provider,
        dbId: session.dbId,
        id: session.id,
        email: session.email,
        name: session.name,
        nickname: trimmed,
        image: session.image,
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

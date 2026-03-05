import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

const SESSION_COOKIE_NAME = "kakkumi_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

function signSession(payload: Record<string, unknown>, secret: string) {
    const json = JSON.stringify(payload);
    const signature = createHmac("sha256", secret).update(json).digest("base64url");
    return `${Buffer.from(json).toString("base64url")}.${signature}`;
}

// 프로필 이미지 업로드 (Base64 dataURL)
export async function PATCH(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await req.json() as { avatarUrl?: string | null };
    const { avatarUrl } = body;

    // null이면 삭제 (카카오 이미지로 복귀)
    if (avatarUrl !== null && avatarUrl !== undefined) {
        // dataURL 형식 검사
        if (!avatarUrl.startsWith("data:image/")) {
            return NextResponse.json({ error: "올바른 이미지 형식이 아닙니다." }, { status: 400 });
        }
        // 크기 검사 (Base64 → 실제 크기 근사)
        const base64Data = avatarUrl.split(",")[1] ?? "";
        const approxBytes = Math.ceil((base64Data.length * 3) / 4);
        if (approxBytes > MAX_SIZE_BYTES) {
            return NextResponse.json({ error: "이미지 크기는 2MB 이하여야 합니다." }, { status: 400 });
        }
    }

    await prisma.$executeRaw`
        UPDATE "User" SET "avatarUrl" = ${avatarUrl ?? null}, "updatedAt" = NOW() WHERE id = ${session.dbId}
    `;

    // 세션 쿠키 갱신
    const sessionSecret = process.env.KAKAO_SESSION_SECRET!;
    const newPayload = {
        provider: session.provider,
        dbId: session.dbId,
        id: session.id,
        email: session.email,
        name: session.name,
        nickname: session.nickname,
        role: session.role,
        issuedAt: Date.now(),
    };
    const newToken = signSession(newPayload, sessionSecret);

    const res = NextResponse.json({ avatarUrl: avatarUrl ?? null });
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

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/constants";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

function signSession(payload: Record<string, unknown>, secret: string) {
    const json = JSON.stringify(payload);
    const signature = createHmac("sha256", secret).update(json).digest("base64url");
    return `${Buffer.from(json).toString("base64url")}.${signature}`;
}

// 프로필 이미지 업로드 (Base64 dataURL)
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.dbId) {
            return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        }

        // PRO 구독자 또는 ADMIN만 프로필 사진 변경 가능 (CREATOR도 PRO면 허용)
        const role = String(session.role ?? "USER");
        let canEdit = false;

        if (role === "ADMIN") {
            canEdit = true;
        } else {
            // USER, CREATOR 모두 구독 상태 확인
            const subRows = await prisma.$queryRaw<{ status: string }[]>`
                SELECT status::text FROM "Subscription"
                WHERE "userId" = ${session.dbId}
                LIMIT 1
            `;
            canEdit = subRows.length > 0 && subRows[0].status.toUpperCase() === "ACTIVE";
        }

        if (!canEdit) {
            return NextResponse.json(
                { error: "PRO 구독자만 프로필 사진을 변경할 수 있습니다." },
                { status: 403 }
            );
        }

        const body = await req.json() as { avatarUrl?: string | null };
        const { avatarUrl } = body;

        // null이면 삭제
        if (avatarUrl !== null && avatarUrl !== undefined) {
            if (!avatarUrl.startsWith("data:image/")) {
                return NextResponse.json({ error: "올바른 이미지 형식이 아닙니다." }, { status: 400 });
            }
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
    } catch (e) {
        console.error("[avatar PATCH error]", e);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

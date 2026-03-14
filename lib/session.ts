import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/constants";

export type SessionUser = {
    dbId: string;
    id: string;
    email: string | null;
    name: string | null;
    nickname: string | null;
    role: "USER" | "CREATOR" | "ADMIN";
    provider: string;
    issuedAt: number;
};

/** 화면에 표시할 이름: 닉네임 > 카카오 이름 > "사용자" */
export function getDisplayName(session: SessionUser | null): string {
    return session?.nickname ?? session?.name ?? "사용자";
}

function verifySession(token: string, secret: string): SessionUser | null {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const expectedSignature = createHmac("sha256", secret)
        .update(json)
        .digest("base64url");

    if (signature !== expectedSignature) return null;

    try {
        const parsed = JSON.parse(json) as SessionUser;
        // 세션 만료 시간 검증 (issuedAt 기준)
        if (Date.now() - parsed.issuedAt > SESSION_MAX_AGE_SECONDS * 1000) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

/**
 * 서버 컴포넌트 / Route Handler 에서 세션을 꺼낼 때 사용
 */
export async function getServerSession(): Promise<SessionUser | null> {
    try {
        const sessionSecret = process.env.KAKAO_SESSION_SECRET;
        if (!sessionSecret) return null;

        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
        if (!sessionCookie) return null;

        return verifySession(sessionCookie.value, sessionSecret);
    } catch {
        return null;
    }
}

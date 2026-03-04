import { createHmac } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "kakkumi_session";

export type SessionUser = {
    dbId: string;       // DB User.id (UUID) — 찜, 구매, 리뷰 등에 사용
    id: string;         // 카카오 고유 ID
    email: string | null;
    name: string | null;
    image: string | null;
    role: "USER" | "CREATOR" | "ADMIN";
    provider: string;
    issuedAt: number;
};

function verifySession(token: string, secret: string): SessionUser | null {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const expectedSignature = createHmac("sha256", secret)
        .update(json)
        .digest("base64url");

    if (signature !== expectedSignature) return null;

    try {
        return JSON.parse(json) as SessionUser;
    } catch {
        return null;
    }
}

/**
 * 서버 컴포넌트 / Route Handler 에서 세션을 꺼낼 때 사용
 * - app/ 디렉토리 서버 컴포넌트에서 직접 호출 가능
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

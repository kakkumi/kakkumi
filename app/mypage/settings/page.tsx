import { cookies } from "next/headers";
import { createHmac } from "crypto";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SettingsClient from "@/app/mypage/settings/SettingsClient";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "kakkumi_session";

function verifySession(token: string, secret: string) {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const expectedSignature = createHmac("sha256", secret).update(json).digest("base64url");
    if (signature !== expectedSignature) return null;
    return JSON.parse(json) as Record<string, unknown>;
}

async function getSession() {
    try {
        const sessionSecret = process.env.KAKAO_SESSION_SECRET;
        if (!sessionSecret) return null;
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
        if (!sessionCookie) return null;
        const session = verifySession(sessionCookie.value, sessionSecret);
        return session as {
            name?: string | null;
            nickname?: string | null;
            avatarUrl?: string | null;
            id?: string | null;
            dbId?: string | null;
            email?: string | null;
            role?: string | null;
        } | null;
    } catch {
        return null;
    }
}

export default async function SettingsPage() {
    const session = await getSession();

    // 쿠키 크기 한계로 avatarUrl이 잘릴 수 있으므로 DB에서 직접 조회
    let dbAvatarUrl: string | null = null;
    if (session?.dbId) {
        try {
            const rows = await prisma.$queryRaw<{ avatarUrl: string | null }[]>`
                SELECT "avatarUrl" FROM "User" WHERE id = ${session.dbId} LIMIT 1
            `;
            dbAvatarUrl = rows[0]?.avatarUrl ?? null;
        } catch {
            dbAvatarUrl = null;
        }
    }

    const sessionWithAvatar = session ? { ...session, avatarUrl: dbAvatarUrl } : null;

    return (
        <div
            className="min-h-screen flex flex-col mac-scroll"
            style={{
                backgroundColor: "#f3f3f3",
            }}
        >
            <Header />
            <SettingsClient session={sessionWithAvatar} />
            <Footer />
        </div>
    );
}

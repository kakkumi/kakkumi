import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NotificationsClient from "@/app/notifications/NotificationsClient";

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
        return session as { name?: string | null; nickname?: string | null; dbId?: string | null } | null;
    } catch {
        return null;
    }
}

export default async function NotificationsPage() {
    const session = await getSession();
    if (!session?.dbId) redirect("/");

    const rows = await prisma.$queryRaw<{
        id: string;
        type: string;
        title: string;
        body: string;
        linkUrl: string | null;
        isRead: boolean;
        createdAt: Date;
    }[]>`
        SELECT id, type, title, body, "linkUrl", "isRead", "createdAt"
        FROM "Notification"
        WHERE "userId" = ${session.dbId}
        ORDER BY "createdAt" DESC
        LIMIT 100
    `;

    const notifications = rows.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
    }));

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}
        >
            <Header />
            <NotificationsClient initialNotifications={notifications} />
            <Footer />
        </div>
    );
}

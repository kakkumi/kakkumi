import { cookies } from "next/headers";
import { createHmac } from "crypto";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { prisma } from "@/lib/prisma";
import MyPageClient from "./MyPageClient";

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
        return session as { name?: string | null; nickname?: string | null; image?: string | null; id?: string | null; dbId?: string | null } | null;
    } catch {
        return null;
    }
}

export default async function MyPage() {
    const session = await getSession();

    let purchasedCount = 0;
    let createdAt: string | null = null;
    let credit = 0;

    if (session?.dbId) {
        purchasedCount = await prisma.purchase.count({
            where: { buyerId: session.dbId, status: "COMPLETED" },
        });
        try {
            const rows = await prisma.$queryRaw<{ createdAt: Date; credit: number }[]>`
                SELECT "createdAt", credit FROM "User" WHERE id = ${session.dbId} LIMIT 1
            `;
            createdAt = rows[0]?.createdAt?.toISOString() ?? null;
            credit = rows[0]?.credit ?? 0;
        } catch {
            createdAt = null;
        }
    }

    const sidebarMenus = [
        {
            category: "테마",
            items: [{ label: "내 테마" }, { label: "구매 테마" }, { label: "전체 테마" }],
        },
        {
            category: "쇼핑",
            items: [
                { label: "리뷰" }, { label: "적립금" }, { label: "작성 가능한 후기" }, { label: "쿠폰" },
                { label: "주문 내역" }, { label: "취소/환불 내역" }, { label: "최근 본 상품" }, { label: "좋아요" },
            ],
        },
        {
            category: "수익",
            items: [{ label: "정산 내역" }, { label: "판매 통계" }],
        },
        {
            category: "정보",
            items: [{ label: "회원정보 수정", href: "/mypage/settings" }],
        },
    ];

    return (
        <div
            className="min-h-screen flex flex-col mac-scroll"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}
        >
            <Header />
            <MyPageClient
                session={session}
                purchasedCount={purchasedCount}
                sidebarMenus={sidebarMenus}
                createdAt={createdAt}
                credit={credit}
            />
            <Footer />
        </div>
    );
}

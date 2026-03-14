import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { Suspense } from "react";
import Header from "../components/Header";
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
        return session as { name?: string | null; nickname?: string | null; image?: string | null; avatarUrl?: string | null; id?: string | null; dbId?: string | null; email?: string | null; role?: string | null } | null;
    } catch {
        return null;
    }
}

export default async function MyPage() {
    const session = await getSession();

    let purchasedCount = 0;
    let createdAt: string | null = null;
    let credit = 0;
    let dbAvatarUrl: string | null = null;

    if (session?.dbId) {
        purchasedCount = await prisma.purchase.count({
            where: { buyerId: session.dbId, status: "COMPLETED" },
        });
        try {
            const rows = await prisma.$queryRaw<{ createdAt: Date; credit: number; avatarUrl: string | null }[]>`
                SELECT "createdAt", credit, "avatarUrl" FROM "User" WHERE id = ${session.dbId} LIMIT 1
            `;
            createdAt = rows[0]?.createdAt?.toISOString() ?? null;
            credit = rows[0]?.credit ?? 0;
            dbAvatarUrl = rows[0]?.avatarUrl ?? null;
        } catch {
            createdAt = null;
        }
    }

    const sidebarMenus = [
        {
            category: "정보",
            items: [{ label: "회원 정보" }, { label: "알림 설정" }],
        },
        {
            category: "테마",
            items: [{ label: "업로드 테마" }, { label: "구매 테마" }],
        },
        {
            category: "쇼핑",
            items: [
                { label: "리뷰" }, { label: "적립금" }, { label: "작성 가능한 후기" },
                { label: "주문 내역" }, { label: "취소/환불 내역" }, { label: "좋아요" }, { label: "팔로우" },
            ],
        },
        {
            category: "수익",
            items: [{ label: "정산 내역" }, { label: "판매 통계" }, { label: "정산 계좌" }],
        },
        {
            category: "계정",
            items: [{ label: "회원 탈퇴" }],
        },
    ];

    const sessionWithAvatar = session ? { ...session, avatarUrl: dbAvatarUrl } : null;

    return (
        <div
            className="min-h-screen flex flex-col mac-scroll"
            style={{
                backgroundColor: "#f3f3f3",
            }}
        >
            <Header />
            <Suspense fallback={<div className="flex-1 flex items-center justify-center py-24"><div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-500 animate-spin" /></div>}>
                <MyPageClient
                    session={sessionWithAvatar}
                    purchasedCount={purchasedCount}
                    sidebarMenus={sidebarMenus}
                    createdAt={createdAt}
                    credit={credit}
                />
            </Suspense>
        </div>
    );
}

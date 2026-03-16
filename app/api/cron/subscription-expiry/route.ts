import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vercel Cron Job에서 매일 자정에 호출
// 결제 갱신일이 지난 ACTIVE 구독을 EXPIRED로 처리하고 프로필 사진 초기화
export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-cron-secret");
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 다음 결제일이 지난 ACTIVE 구독 유저 조회
        const expiredRows = await prisma.$queryRaw<{ userId: string; role: string }[]>`
            SELECT s."userId", u.role::text AS role
            FROM "Subscription" s
            JOIN "User" u ON u.id = s."userId"
            WHERE s.status = 'ACTIVE'::"SubscriptionStatus"
              AND s."nextBillingAt" IS NOT NULL
              AND s."nextBillingAt" < NOW()
        `;

        if (expiredRows.length === 0) {
            return NextResponse.json({ ok: true, expired: 0 });
        }

        let expiredCount = 0;
        for (const row of expiredRows) {
            // 구독 상태 EXPIRED로 변경
            await prisma.$executeRaw`
                UPDATE "Subscription"
                SET status = 'EXPIRED'::"SubscriptionStatus", "updatedAt" = NOW()
                WHERE "userId" = ${row.userId}
                  AND status = 'ACTIVE'::"SubscriptionStatus"
            `;

            // 프로필 사진 초기화 (CREATOR → creator.png, USER → null)
            const resetAvatarUrl = row.role === "CREATOR" ? "/creator.png" : null;
            await prisma.$executeRaw`
                UPDATE "User" SET "avatarUrl" = ${resetAvatarUrl}, "updatedAt" = NOW()
                WHERE id = ${row.userId}
            `;

            expiredCount++;
        }

        console.log(`[subscription-expiry] ${expiredCount}개 구독 만료 처리 완료`);
        return NextResponse.json({ ok: true, expired: expiredCount });
    } catch (e) {
        console.error("[subscription-expiry] 오류:", e);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}


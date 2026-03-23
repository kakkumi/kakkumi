import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetUserAvatar } from "@/lib/subscription";

// Vercel Cron Job에서 매일 자정에 GET 요청으로 호출
// Vercel은 Authorization: Bearer <CRON_SECRET> 헤더를 자동으로 추가함
export async function GET(req: NextRequest) {
    // Vercel cron: Authorization: Bearer <CRON_SECRET>
    // 외부 스케줄러 fallback: x-cron-secret 헤더
    const authHeader = req.headers.get("authorization");
    const secret = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : req.headers.get("x-cron-secret");

    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
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
            await prisma.$executeRaw`
                UPDATE "Subscription"
                SET status = 'EXPIRED'::"SubscriptionStatus", "updatedAt" = NOW()
                WHERE "userId" = ${row.userId}
                  AND status = 'ACTIVE'::"SubscriptionStatus"
            `;

            // 프로필 사진 초기화 (공통 유틸)
            await resetUserAvatar(row.userId, row.role);

            expiredCount++;
        }

        console.log(`[subscription-expiry] ${expiredCount}개 구독 만료 처리 완료`);
        return NextResponse.json({ ok: true, expired: expiredCount });
    } catch (e) {
        console.error("[subscription-expiry] 오류:", e);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCreditExpiryWarning } from "@/lib/email";
import { CREDIT_EXPIRY_WARN_DAYS, CREDIT_EXPIRY_WARN_DEDUP_DAYS, DAY_MS } from "@/lib/constants";
import { nowKST } from "@/lib/date";
import { notifyCreditExpiry } from "@/lib/notification";

// 이 엔드포인트는 Vercel Cron Job 또는 외부 스케줄러에서 호출합니다.
// 보호: CRON_SECRET 헤더 검증
export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-cron-secret");
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = nowKST();

    try {
        // 1) 만료된 적립금 처리 (expiresAt <= now, 양수 금액인 것)
        const expired = await prisma.$queryRaw<{
            userId: string;
            totalAmount: bigint;
        }[]>`
            SELECT "userId", SUM(amount) AS "totalAmount"
            FROM "PointHistory"
            WHERE type IN ('ADMIN_GRANT', 'REFERRAL_REWARD', 'REFUND')
              AND amount > 0
              AND "expiresAt" IS NOT NULL
              AND "expiresAt" <= ${now}
              AND "userId" NOT IN (
                  SELECT DISTINCT "userId" FROM "PointHistory"
                  WHERE type = 'EXPIRY'::"PointType"
                  AND memo LIKE '%만료%'
                  AND "createdAt" >= NOW() - INTERVAL '1 day'
              )
            GROUP BY "userId"
            HAVING SUM(amount) > 0
        `;

        let expiredCount = 0;
        for (const row of expired) {
            const amount = Number(row.totalAmount);
            if (amount <= 0) continue;

            // 적립금 차감
            await prisma.$executeRaw`
                UPDATE "User" SET credit = GREATEST(0, credit - ${amount}), "updatedAt" = NOW()
                WHERE id = ${row.userId}
            `;
            await prisma.$executeRaw`
                INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "createdAt")
                VALUES (${crypto.randomUUID()}, ${row.userId}, ${-amount}, 'EXPIRY'::"PointType", ${'적립금 만료 소멸'}, ${now})
            `;
            // 만료 알림
            await prisma.$executeRaw`
                INSERT INTO "Notification" (id, "userId", type, title, body, "linkUrl", "createdAt")
                VALUES (
                    ${crypto.randomUUID()},
                    ${row.userId},
                    'CREDIT_EXPIRY'::"NotificationType",
                    ${'적립금 만료'},
                    ${`${amount.toLocaleString()}원 적립금이 만료되어 소멸되었습니다.`},
                    ${'/mypage'},
                    ${now}
                )
            `;
            expiredCount++;
        }

        // 2) 만료 경고 알림
        const warnCutoff = new Date(now.getTime() + CREDIT_EXPIRY_WARN_DAYS * DAY_MS);
        const warned = await prisma.$queryRaw<{
            userId: string;
            totalAmount: bigint;
            expiresAt: Date;
            email: string | null;
            name: string;
            nickname: string | null;
        }[]>`
            SELECT ph."userId", SUM(ph.amount) AS "totalAmount", MIN(ph."expiresAt") AS "expiresAt",
                   u.email, u.name, u.nickname
            FROM "PointHistory" ph
            JOIN "User" u ON u.id = ph."userId"
            WHERE ph.type IN ('ADMIN_GRANT', 'REFERRAL_REWARD', 'REFUND')
              AND ph.amount > 0
              AND ph."expiresAt" IS NOT NULL
              AND ph."expiresAt" > ${now}
              AND ph."expiresAt" <= ${warnCutoff}
              AND ph."userId" NOT IN (
                  SELECT DISTINCT "userId" FROM "Notification"
                  WHERE type = 'CREDIT_EXPIRY'::"NotificationType"
                  AND title = '적립금 만료 예정'
                  AND "createdAt" >= NOW() - (${CREDIT_EXPIRY_WARN_DEDUP_DAYS} || ' days')::INTERVAL
              )
            GROUP BY ph."userId", u.email, u.name, u.nickname
            HAVING SUM(ph.amount) > 0
        `;

        let warnedCount = 0;
        for (const row of warned) {
            const amount = Number(row.totalAmount);
            if (amount <= 0) continue;

            const daysLeft = Math.ceil((new Date(row.expiresAt).getTime() - now.getTime()) / DAY_MS);
            // 설정 체크 포함한 헬퍼 사용
            await notifyCreditExpiry(row.userId, amount, daysLeft);
            if (row.email) {
                try {
                    await sendCreditExpiryWarning({
                        to: row.email,
                        name: row.nickname ?? row.name,
                        amount,
                        expiresAt: row.expiresAt,
                    });
                } catch (e) {
                    console.error("[cron/credit-expiry] 이메일 실패:", e);
                }
            }
            warnedCount++;
        }

        return NextResponse.json({ ok: true, expiredCount, warnedCount });
    } catch (e) {
        console.error("[cron/credit-expiry]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}

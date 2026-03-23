/**
 * 구매 공통 로직
 * - versionId 검증, 중복 구매 확인, 적립금 지급
 * - toss/confirm, payment/credit, download/free 등에서 공유
 */
import { prisma } from "@/lib/prisma";
import { getPurchaseCredit, CREDIT_EXPIRY_DAYS, DAY_MS } from "@/lib/constants";

/**
 * ThemeVersion 테이블에서 versionId 유효성 확인
 * ThemeOption ID가 넘어오는 경우 null 처리
 */
export async function validateVersionId(rawVersionId: string | undefined | null): Promise<string | null> {
    if (!rawVersionId) return null;
    const rows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "ThemeVersion" WHERE id = ${rawVersionId} LIMIT 1
    `;
    return rows.length > 0 ? rawVersionId : null;
}

/**
 * 동일 테마 중복 구매 여부 확인 (COMPLETED 상태 기준)
 */
export async function checkAlreadyPurchased(buyerId: string, themeId: string): Promise<boolean> {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Purchase"
        WHERE "buyerId" = ${buyerId}
          AND "themeId" = ${themeId}
          AND status = 'COMPLETED'::"PurchaseStatus"
        LIMIT 1
    `;
    return rows.length > 0;
}

/**
 * 구매 적립금 지급 + PointHistory 기록
 * reward가 0이면 아무 작업도 하지 않음
 */
export async function grantPurchaseCredit(userId: string, price: number, now: Date): Promise<void> {
    const reward = getPurchaseCredit(price);
    if (reward <= 0) return;

    const expiresAt = new Date(now.getTime() + CREDIT_EXPIRY_DAYS * DAY_MS);

    await prisma.$executeRaw`
        UPDATE "User" SET credit = credit + ${reward}, "updatedAt" = NOW() WHERE id = ${userId}
    `;
    await prisma.$executeRaw`
        INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "expiresAt", "createdAt")
        VALUES (${crypto.randomUUID()}, ${userId}, ${reward}, 'ADMIN_GRANT'::"PointType", ${`구매 적립 (+${reward}원)`}, ${expiresAt}, ${now})
    `;
}


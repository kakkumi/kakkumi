import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { DEFAULT_NOTIF_SETTINGS, type NotifSettings } from "@/lib/notifTypes";

// NotificationType → NotifSettings 키 매핑
const NOTIF_TYPE_TO_KEY: Partial<Record<NotificationType, keyof NotifSettings>> = {
    PURCHASE_COMPLETE: "purchaseComplete",
    REFUND_COMPLETE: "purchaseComplete",
    NEW_THEME: "newTheme",
    THEME_APPROVED: "serviceBroadcast",
    THEME_REJECTED: "serviceBroadcast",
    SYSTEM: "serviceBroadcast",
    FOLLOW: "followAlert",
    CREDIT_EXPIRY: "creditExpiry",
};

// 야간에 차단할 비중요 알림 타입 (22:00 ~ 08:00 KST)
const NIGHT_BLOCKABLE_TYPES = new Set<NotificationType>(["FOLLOW", "NEW_THEME"]);

async function getUserNotifSettings(userId: string): Promise<NotifSettings> {
    try {
        const rows = await prisma.$queryRaw<{ notifSettings: unknown }[]>`
            SELECT "notifSettings" FROM "User" WHERE id = ${userId} LIMIT 1
        `;
        const raw = rows[0]?.notifSettings;
        return raw && typeof raw === "object"
            ? { ...DEFAULT_NOTIF_SETTINGS, ...(raw as Partial<NotifSettings>) }
            : DEFAULT_NOTIF_SETTINGS;
    } catch {
        return DEFAULT_NOTIF_SETTINGS;
    }
}

/** 야간 차단 여부 확인 (22:00 ~ 08:00 KST) */
function isNightTime(): boolean {
    const kstHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })).getHours();
    return kstHour >= 22 || kstHour < 8;
}

type CreateNotifOptions = {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    linkUrl?: string;
    /** true이면 알림 설정/야간 차단 무시하고 항상 생성 (법적 필수 공지 등) */
    force?: boolean;
};

export async function createNotification({
    userId,
    type,
    title,
    body,
    linkUrl,
    force = false,
}: CreateNotifOptions): Promise<void> {
    if (!force) {
        // 야간 비중요 알림 차단
        if (isNightTime() && NIGHT_BLOCKABLE_TYPES.has(type)) return;

        const settings = await getUserNotifSettings(userId);
        const settingKey = NOTIF_TYPE_TO_KEY[type];
        if (settingKey && !settings[settingKey]) return;
    }

    await prisma.$executeRaw`
        INSERT INTO "Notification" (id, "userId", type, title, body, "linkUrl", "isRead", "createdAt")
        VALUES (gen_random_uuid(), ${userId}, ${type}::"NotificationType", ${title}, ${body}, ${linkUrl ?? null}, false, NOW())
    `;
}

/** 구매 완료 알림 */
export async function notifyPurchaseComplete(userId: string, themeName: string, themeId: string) {
    await createNotification({
        userId,
        type: "PURCHASE_COMPLETE",
        title: "구매 완료",
        body: `"${themeName}" 테마를 구매했어요!`,
        linkUrl: `/store/${themeId}`,
    });
}

/** 환불 완료 알림 */
export async function notifyRefundComplete(userId: string, themeName: string) {
    await createNotification({
        userId,
        type: "REFUND_COMPLETE",
        title: "환불 완료",
        body: `"${themeName}" 테마가 환불 처리되었습니다.`,
    });
}

/** 크리에이터 테마에 새 리뷰 등록 알림 */
export async function notifyNewReview(creatorId: string, themeName: string, themeId: string) {
    await createNotification({
        userId: creatorId,
        type: "NEW_THEME",
        title: "새 리뷰",
        body: `"${themeName}"에 새 리뷰가 등록되었습니다.`,
        linkUrl: `/store/${themeId}`,
    });
}

/** 문의 답변 알림 */
export async function notifyInquiryReply(userId: string, inquiryTitle: string) {
    await createNotification({
        userId,
        type: "SYSTEM",
        title: "문의 답변이 등록되었습니다.",
        body: `"${inquiryTitle}" 문의에 답변이 달렸습니다.`,
        linkUrl: "/support",
    });
}

/** 테마 승인 알림 */
export async function notifyThemeApproved(creatorId: string, themeName: string, themeId: string) {
    await createNotification({
        userId: creatorId,
        type: "THEME_APPROVED",
        title: "테마 승인 완료",
        body: `"${themeName}" 테마가 승인되어 스토어에 등록되었습니다.`,
        linkUrl: `/store/${themeId}`,
    });
}

/** 테마 수정 승인 알림 */
export async function notifyThemeUpdateApproved(creatorId: string, themeName: string, themeId: string) {
    await createNotification({
        userId: creatorId,
        type: "THEME_APPROVED",
        title: "테마 수정 승인 완료",
        body: `"${themeName}" 테마 수정이 승인되어 스토어에 반영되었습니다.`,
        linkUrl: `/store/${themeId}`,
    });
}

/** 테마 반려 알림 */
export async function notifyThemeRejected(creatorId: string, themeName: string, reason?: string) {
    await createNotification({
        userId: creatorId,
        type: "THEME_REJECTED",
        title: "테마 반려",
        body: reason ? `"${themeName}" 테마가 반려되었습니다. 사유: ${reason}` : `"${themeName}" 테마가 반려되었습니다.`,
        linkUrl: "/mypage",
    });
}

/** 팔로우 알림 (CREATOR/ADMIN에게) */
export async function notifyFollow(creatorId: string, followerName: string, followerId: string) {
    await createNotification({
        userId: creatorId,
        type: "FOLLOW",
        title: "새 팔로워",
        body: `${followerName}님이 팔로우했습니다.`,
        linkUrl: `/creator/${followerId}`,
    });
}

/** 적립금 만료 D-N 알림 */
export async function notifyCreditExpiry(userId: string, amount: number, daysLeft: number) {
    await createNotification({
        userId,
        type: "CREDIT_EXPIRY",
        title: "적립금 만료 예정",
        body: `${amount.toLocaleString()}원 적립금이 ${daysLeft}일 후 만료됩니다.`,
        linkUrl: "/mypage",
    });
}

/** 좋아요한 테마 가격 하락 알림 */
export async function notifyPriceDrop(userId: string, themeName: string, themeId: string, newPrice: number) {
    const settings = await getUserNotifSettings(userId);
    if (!settings.priceDropAlert) return;

    await prisma.$executeRaw`
        INSERT INTO "Notification" (id, "userId", type, title, body, "linkUrl", "isRead", "createdAt")
        VALUES (gen_random_uuid(), ${userId}, 'SYSTEM'::"NotificationType",
            ${'찜한 테마 가격 인하!'},
            ${`"${themeName}" 테마 가격이 ${newPrice.toLocaleString()}원으로 내려갔어요.`},
            ${`/store/${themeId}`}, false, NOW())
    `;
}

/** 팔로워 전체에게 신규 테마 알림 — 단일 INSERT … SELECT 로 N+1 해소 */
export async function notifyNewThemeToFollowers(creatorId: string, themeName: string, themeId: string) {
    // 야간에는 마케팅성 알림 발송 안 함
    if (isNightTime()) return;

    // notifSettings->>'newTheme' = 'true' 인 팔로워에게만 한 번의 쿼리로 삽입
    // 기본값(newTheme: false)이므로 명시적으로 true를 설정한 사용자만 수신
    await prisma.$executeRaw`
        INSERT INTO "Notification" (id, "userId", type, title, body, "linkUrl", "isRead", "createdAt")
        SELECT
            gen_random_uuid(),
            f."followerId",
            'NEW_THEME'::"NotificationType",
            ${"새 테마가 등록됐어요!"},
            ${`팔로우한 크리에이터가 "${themeName}" 테마를 등록했습니다.`},
            ${`/store/${themeId}`},
            false,
            NOW()
        FROM "Follow" f
        JOIN "User" u ON u.id = f."followerId"
        WHERE f."followingId" = ${creatorId}
          AND u."notifSettings"->>'newTheme' = 'true'
    `;
}

/**
 * 알림 설정 타입 — 서버/클라이언트 공통 사용
 * notif-settings/route.ts, notification.ts, MyPageClient.tsx에서 공유
 */
export const DEFAULT_NOTIF_SETTINGS = {
    purchaseComplete: true,
    newReview: true,
    inquiryReply: true,
    newTheme: false,
    promotionEvent: false,
    serviceBroadcast: true,
    followAlert: true,
    creditExpiry: true,
    priceDropAlert: false,
};

export type NotifSettings = typeof DEFAULT_NOTIF_SETTINGS;
export type NotifKey = keyof NotifSettings;


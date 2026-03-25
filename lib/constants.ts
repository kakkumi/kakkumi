// ─────────────────────────────────────────────
// 인증 / 세션
// ─────────────────────────────────────────────
export const SESSION_COOKIE_NAME = "kakkumi_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7일

// ─────────────────────────────────────────────
// 탈퇴
// ─────────────────────────────────────────────
export const WITHDRAW_CONFIRM_TEXT = "탈퇴하겠습니다";
export const WITHDRAW_REREGISTER_DAYS = 3; // 탈퇴 후 재가입 가능까지 대기 일수

// ─────────────────────────────────────────────
// 적립금 / 결제 정책
// ─────────────────────────────────────────────
export const CREDIT_EXPIRY_DAYS = 365;         // 적립금 유효기간 (일)
export const CREDIT_EXPIRY_WARN_DAYS = 30;     // 만료 경고 알림 기준 (일)
export const CREDIT_EXPIRY_WARN_DEDUP_DAYS = 25; // 중복 발송 방지 기준 (일)
export const REFUND_ALLOWED_DAYS = 7;          // 환불 가능 기간 (일)
export const REFERRAL_REWARD_AMOUNT = 500;     // 추천 적립금 (원)
export const REFERRAL_MAX_PER_MONTH = 3;       // 추천인 월 최대 수령 횟수
export const REVIEW_REWARD_AMOUNT = 100;       // 리뷰 작성 적립금 (원)
export const REVIEW_MIN_LENGTH = 10;           // 리뷰 최소 글자 수

// 구매 적립금 기준표
export const PURCHASE_CREDIT_TIERS: { maxPrice: number; reward: number }[] = [
    { maxPrice: 0,    reward: 0  },
    { maxPrice: 500,  reward: 10 },
    { maxPrice: 1000, reward: 20 },
    { maxPrice: 1500, reward: 30 },
    { maxPrice: Infinity, reward: 50 },
];

/** 구매 금액에 따른 적립금 계산 */
export function getPurchaseCredit(price: number): number {
    for (const tier of PURCHASE_CREDIT_TIERS) {
        if (price <= tier.maxPrice) return tier.reward;
    }
    return 50;
}

// ─────────────────────────────────────────────
// 스토리지 / DB
// ─────────────────────────────────────────────
export const NOTIFICATION_FETCH_LIMIT = 30;   // 알림 최대 조회 수
export const POINT_HISTORY_FETCH_LIMIT = 50;  // 적립금 내역 최대 조회 수
export const AVATAR_MAX_SIZE_MB = 2;          // 프로필 이미지 최대 크기 (MB)

// ─────────────────────────────────────────────
// 시간 유틸
// ─────────────────────────────────────────────
export const KST_OFFSET_MS = 9 * 60 * 60 * 1000; // KST = UTC+9
export const DAY_MS = 24 * 60 * 60 * 1000;

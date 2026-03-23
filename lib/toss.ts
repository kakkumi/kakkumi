/**
 * 토스페이먼츠 API 공통 유틸
 * - 인증 헤더 생성 로직을 한 곳에서 관리
 */

/**
 * 토스페이먼츠 API Basic 인증 헤더 생성
 * @returns `Basic <base64(secretKey:)>` 형태의 문자열, 환경변수 미설정 시 null
 */
export function getTossAuthHeader(): string | null {
    const secretKey = process.env.TOSSPAYMENTS_SECRET_KEY;
    if (!secretKey) return null;
    return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}


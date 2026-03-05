/**
 * ISO 날짜 문자열을 한국 시간(Asia/Seoul)으로 포맷
 * @example formatKST("2026-03-04T12:00:00Z") → "2026.03.04 21:00"
 */
export function formatKST(iso: string, showTime = true): string {
    const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        ...(showTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
    };
    return new Date(iso)
        .toLocaleString("ko-KR", options)
        .replace(/\. /g, ".")
        .replace(/\.$/, "")
        .trim();
}

/**
 * 현재 시각을 KST(UTC+9) 기준으로 반환합니다.
 * PostgreSQL에 저장 시 한국 시간으로 기록됩니다.
 */
export function nowKST(): Date {
    const now = new Date();
    // UTC 시각에 9시간을 더해 KST로 변환
    return new Date(now.getTime() + 9 * 60 * 60 * 1000);
}

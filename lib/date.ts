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

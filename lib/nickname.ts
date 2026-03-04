/**
 * 닉네임 유효성 검사
 * - 2~10자
 * - 한글, 영문, 숫자 허용
 * - 특수문자 불가
 * - 숫자만으로는 구성 불가 (한글 또는 영문 최소 1자 포함)
 */
export function validateNickname(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) return "닉네임을 입력해주세요.";
    if (trimmed.length < 2) return "닉네임은 2자 이상이어야 합니다.";
    if (trimmed.length > 10) return "닉네임은 최대 10자까지 가능합니다.";

    // 한글, 영문, 숫자만 허용
    if (!/^[가-힣a-zA-Z0-9]+$/.test(trimmed)) {
        return "한글, 영문, 숫자만 사용할 수 있습니다. (특수문자 불가)";
    }

    // 숫자만으로 구성된 경우 불가
    if (/^[0-9]+$/.test(trimmed)) {
        return "숫자만으로는 닉네임을 만들 수 없습니다.";
    }

    return null; // 유효
}

/**
 * 파일 유효성 검사 공통 유틸
 * - themes/register, themes/edit 등에서 공유
 */
import { NextResponse } from "next/server";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_THEME_TYPES = [
    "application/octet-stream",
    "application/zip",
    "application/x-zip-compressed",
];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
export const MAX_THEME_SIZE = 30 * 1024 * 1024;  // 30MB

/**
 * 이미지 파일 유효성 검사
 * @returns null이면 통과, NextResponse이면 에러 응답 반환
 */
export function validateImage(file: File, label: string): NextResponse | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
            { error: `${label}은 JPG, PNG, WEBP, GIF만 허용됩니다.` },
            { status: 400 }
        );
    }
    if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
            { error: `${label}은 5MB 이하여야 합니다.` },
            { status: 400 }
        );
    }
    return null;
}

/**
 * 테마 파일(.ktheme/.apk) 유효성 검사
 * @returns null이면 통과, NextResponse이면 에러 응답 반환
 */
export function validateThemeFile(file: File): NextResponse | null {
    if (file.size > MAX_THEME_SIZE) {
        return NextResponse.json(
            { error: "테마 파일은 30MB 이하여야 합니다." },
            { status: 400 }
        );
    }
    return null;
}


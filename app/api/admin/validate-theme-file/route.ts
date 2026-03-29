import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import JSZip from "jszip";

// ── ktheme 필수/권장 CSS 블록 ────────────────────────────────────────────────

const KTHEME_REQUIRED_BLOCKS = [
    "ManifestStyle",
    "TabBarStyle-Main",
    "MainViewStyle-Primary",
    "BackgroundStyle-ChatRoom",
    "InputBarStyle-Chat",
    "MessageCellStyle-Send",
    "MessageCellStyle-Receive",
];

const KTHEME_RECOMMENDED_BLOCKS = [
    "BackgroundStyle-Passcode",
    "LabelStyle-PasscodeTitle",
    "BackgroundStyle-MessageNotificationBar",
    "LabelStyle-MessageNotificationBarName",
    "LabelStyle-MessageNotificationBarMessage",
];

// ── CSS 파서 헬퍼 ─────────────────────────────────────────────────────────────

function extractCssBlockNames(css: string): string[] {
    const re = /([\w][\w-]*)\s*\{/g;
    const names: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(css)) !== null) names.push(m[1].trim());
    return names;
}

function extractImageRefs(css: string): string[] {
    const re = /'([^']+\.(?:png|jpg|jpeg|gif|webp))'/gi;
    const refs = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(css)) !== null) refs.add(m[1].toLowerCase());
    return [...refs];
}

// ── ktheme 검증 ───────────────────────────────────────────────────────────────

async function validateKtheme(zip: JSZip) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // CSS 파일 탐색
    const cssEntry = Object.entries(zip.files).find(
        ([name, f]) => !f.dir && name.toLowerCase().endsWith(".css")
    );
    if (!cssEntry) {
        errors.push("CSS 파일이 없습니다. KakaoTalkTheme.css 파일이 필요합니다.");
        return { errors, warnings };
    }

    const cssContent = await cssEntry[1].async("text");
    const foundBlocks = extractCssBlockNames(cssContent);

    // 필수 블록 검사
    for (const block of KTHEME_REQUIRED_BLOCKS) {
        if (!foundBlocks.includes(block)) {
            errors.push(`필수 CSS 블록 누락: ${block}`);
        }
    }

    // 권장 블록 검사
    for (const block of KTHEME_RECOMMENDED_BLOCKS) {
        if (!foundBlocks.includes(block)) {
            warnings.push(`권장 CSS 블록 없음: ${block}`);
        }
    }

    // 매니페스트 정보 검사
    if (foundBlocks.includes("ManifestStyle")) {
        if (!cssContent.includes("-kakaotalk-theme-name")) {
            warnings.push("ManifestStyle에 테마 이름(-kakaotalk-theme-name)이 없습니다.");
        }
        if (!cssContent.includes("-kakaotalk-theme-version")) {
            warnings.push("ManifestStyle에 버전 정보(-kakaotalk-theme-version)가 없습니다.");
        }
    }

    // ZIP 안의 이미지 파일 목록
    const zipImages = new Set(
        Object.keys(zip.files)
            .filter(n => /\.(png|jpg|jpeg|gif|webp)$/i.test(n))
            .map(n => n.split("/").pop()!.toLowerCase())
    );

    // CSS에서 참조하는 이미지 중 실제로 없는 것 확인
    const referencedImages = extractImageRefs(cssContent);
    const missingImages = referencedImages.filter(img => !zipImages.has(img));
    if (missingImages.length > 0) {
        errors.push(
            `CSS에서 참조하지만 ZIP에 없는 이미지 ${missingImages.length}개: ${missingImages.slice(0, 5).join(", ")}${missingImages.length > 5 ? " 외 " + (missingImages.length - 5) + "개" : ""}`
        );
    }

    // 이미지가 전혀 없는 경우
    if (zipImages.size === 0) {
        warnings.push("테마 이미지 파일이 하나도 없습니다.");
    }

    return { errors, warnings };
}

// ── APK 검증 ─────────────────────────────────────────────────────────────────

async function validateApk(zip: JSZip) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fileNames = Object.keys(zip.files).map(n => n.toLowerCase());

    // AndroidManifest.xml
    if (!fileNames.includes("androidmanifest.xml")) {
        errors.push("AndroidManifest.xml 파일이 없습니다. 올바른 APK 파일이 아닙니다.");
    }

    // META-INF (서명)
    if (!fileNames.some(f => f.startsWith("meta-inf/"))) {
        errors.push("META-INF/ 디렉토리가 없습니다. 서명되지 않은 APK입니다. 설치가 불가능합니다.");
    }

    // classes.dex (실행 코드)
    if (!fileNames.some(f => /classes[\d]*\.dex/.test(f))) {
        warnings.push("classes.dex 파일이 없습니다. 실행 가능한 코드가 없을 수 있습니다.");
    }

    // resources.arsc (리소스 테이블)
    if (!fileNames.includes("resources.arsc")) {
        warnings.push("resources.arsc 파일이 없습니다. 리소스가 포함되지 않을 수 있습니다.");
    }

    // res/ 디렉토리
    if (!fileNames.some(f => f.startsWith("res/"))) {
        warnings.push("res/ 디렉토리가 없습니다. 테마 리소스가 없을 수 있습니다.");
    }

    return { errors, warnings };
}

// ── API 핸들러 ────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const url = req.nextUrl.searchParams.get("url");
    const type = req.nextUrl.searchParams.get("type") as "ktheme" | "apk" | null;

    if (!url) return NextResponse.json({ error: "url 파라미터가 필요합니다." }, { status: 400 });

    try {
        // 파일 다운로드 (타임아웃 20초)
        const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
        if (!res.ok) {
            return NextResponse.json({
                valid: false,
                errors: [`파일 다운로드 실패 (HTTP ${res.status}). URL이 유효한지 확인하세요.`],
                warnings: [],
            });
        }

        const buffer = await res.arrayBuffer();
        const fileSizeMB = (buffer.byteLength / 1024 / 1024).toFixed(2);

        // ZIP 파싱 시도
        let zip: JSZip;
        try {
            zip = new JSZip();
            await zip.loadAsync(buffer);
        } catch {
            return NextResponse.json({
                valid: false,
                errors: ["유효한 ZIP/ktheme/APK 파일이 아닙니다. 파일이 손상되었거나 잘못된 형식입니다."],
                warnings: [],
                fileSizeMB,
            });
        }

        // 파일 타입 판별
        const detectedType = type ?? (url.toLowerCase().includes("apk") ? "apk" : "ktheme");

        const result = detectedType === "apk"
            ? await validateApk(zip)
            : await validateKtheme(zip);

        return NextResponse.json({
            valid: result.errors.length === 0,
            errors: result.errors,
            warnings: result.warnings,
            fileType: detectedType,
            fileSizeMB,
        });

    } catch (e) {
        return NextResponse.json({
            valid: false,
            errors: [`검증 중 오류 발생: ${e instanceof Error ? e.message : "알 수 없는 오류"}`],
            warnings: [],
        });
    }
}


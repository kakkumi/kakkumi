"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApk = buildApk;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const sharp_1 = __importDefault(require("sharp"));
const BASE_DECODED_PATH = process.env.BASE_DECODED_PATH ?? path.join(__dirname, "../base-decoded");
const KEYSTORE_PATH = process.env.KEYSTORE_PATH ?? path.join(__dirname, "../keystore.jks");
const KEYSTORE_STOREPASS = process.env.KEYSTORE_STOREPASS ?? "kakkumi_apk_store";
const KEYSTORE_KEYPASS = process.env.KEYSTORE_KEYPASS ?? "kakkumi_apk_key";
const KEYSTORE_ALIAS = process.env.KEYSTORE_ALIAS ?? "kakkumi";
/** zipalign 경로 (v2 서명 전 4바이트 정렬 필수) */
const ZIPALIGN_PATH = process.env.ZIPALIGN_PATH ?? "zipalign";
/** apksigner 경로 (v1+v2 서명 — Android 11+ 필수) */
const APKSIGNER_PATH = process.env.APKSIGNER_PATH ?? "apksigner";
/**
 * 베이스 디코딩 APK에 색상·이미지를 주입하고,
 * apktool로 리빌드 → jarsigner로 서명한 APK Buffer를 반환합니다.
 */
async function buildApk(options) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tmpDir = path.join(os.tmpdir(), `apk-${id}`);
    const unsignedApk = path.join(os.tmpdir(), `unsigned-${id}.apk`);
    try {
        // ── 1. 베이스 템플릿 복사 ──────────────────────────────────────────────
        fs.cpSync(BASE_DECODED_PATH, tmpDir, { recursive: true });
        // ── 2. AndroidManifest.xml — 패키지 ID 교체 + 다크모드 meta-data 주입 ──
        const manifestPath = path.join(tmpDir, "AndroidManifest.xml");
        if (fs.existsSync(manifestPath)) {
            let manifest = fs.readFileSync(manifestPath, "utf8");
            // 패키지 ID 교체
            manifest = manifest.replace(/package="[^"]*"/, `package="${options.packageId}"`);
            // 기존 theme_style meta-data 제거 (중복 방지)
            manifest = manifest.replace(/\s*<meta-data\s+android:name="com\.kakao\.talk\.theme_style"[^>]*\/>/g, "");
            // 다크모드일 때 <application ...> 직후에 theme_style meta-data 삽입
            if (options.darkMode) {
                manifest = manifest.replace(/(<application[^>]*>)/, `$1\n        <meta-data android:name="com.kakao.talk.theme_style" android:value="dark"/>`);
            }
            fs.writeFileSync(manifestPath, manifest);
        }
        // ── 3. apktool.yml — renameManifestPackage 동기화 ─────────────────────
        const apktoolYmlPath = path.join(tmpDir, "apktool.yml");
        if (fs.existsSync(apktoolYmlPath)) {
            let yml = fs.readFileSync(apktoolYmlPath, "utf8");
            yml = yml.replace(/renameManifestPackage:.*(\r?\n)/, `renameManifestPackage: ${options.packageId}$1`);
            if (options.versionName) {
                yml = yml.replace(/versionName:.*(\r?\n)/, `versionName: '${options.versionName}'$1`);
            }
            if (options.versionCode) {
                yml = yml.replace(/versionCode:.*(\r?\n)/, `versionCode: '${options.versionCode}'$1`);
            }
            fs.writeFileSync(apktoolYmlPath, yml);
        }
        // ── 4. strings.xml — 테마 이름 (기본·ko·ja) ───────────────────────────
        const stringsDirs = ["values", "values-ko", "values-ja"];
        for (const dir of stringsDirs) {
            const stringsPath = path.join(tmpDir, "res", dir, "strings.xml");
            if (!fs.existsSync(stringsPath))
                continue;
            let strings = fs.readFileSync(stringsPath, "utf8");
            strings = strings.replace(/(<string name="app_name">)[^<]*(<\/string>)/, `$1${escapeXml(options.themeName)}$2`);
            strings = strings.replace(/(<string name="theme_title">)[^<]*(<\/string>)/, `$1${escapeXml(options.themeName)}$2`);
            fs.writeFileSync(stringsPath, strings);
        }
        // ── 5. colors.xml — 색상 덮어쓰기 ────────────────────────────────────
        const colorsPath = path.join(tmpDir, "res", "values", "colors.xml");
        if (fs.existsSync(colorsPath)) {
            let colors = fs.readFileSync(colorsPath, "utf8");
            for (const [name, value] of Object.entries(options.colors)) {
                colors = colors.replace(new RegExp(`(<color name="${name}">)[^<]*(</color>)`, "g"), `$1${value}$2`);
            }
            fs.writeFileSync(colorsPath, colors);
        }
        // ── 6. 이미지 교체 ───────────────────────────────────────────────────
        // 프로필 이미지: xxhdpi(220×220) + nodpi(_full, 320×320) — 공식 가이드 규격
        // 일반 이미지  : xxhdpi / xhdpi / sw600dp — 이미 존재하는 파일만 교체
        const userWrittenFiles = new Set();
        if (options.images) {
            const xxhdpiDir = path.join(tmpDir, "res", "drawable-xxhdpi");
            const nodpiDir = path.join(tmpDir, "res", "drawable-nodpi");
            // 프로필 파일명 상수
            const profileFilenames = new Set([
                "theme_profile_01_image.png",
                "theme_profile_02_image.png",
                "theme_profile_03_image.png",
            ]);
            // 일반(비-프로필) 이미지를 교체할 drawable 디렉토리 목록
            const generalDrawableDirs = [
                xxhdpiDir,
                path.join(tmpDir, "res", "drawable-xhdpi"),
                path.join(tmpDir, "res", "drawable-sw600dp"),
            ];
            for (const [filename, dataUrl] of Object.entries(options.images)) {
                const buf = dataUrlToBuffer(dataUrl);
                if (!buf)
                    continue;
                if (profileFilenames.has(filename)) {
                    // ── 프로필 이미지 ──────────────────────────────────────────────
                    // xxhdpi: 220×220 PNG (공식 가이드 규격, aapt2 시그니처 검증 통과)
                    if (fs.existsSync(xxhdpiDir)) {
                        const dest = path.join(xxhdpiDir, filename);
                        const pngBuf = await toPng(buf, 220, 220);
                        fs.writeFileSync(dest, pngBuf);
                        userWrittenFiles.add(dest);
                    }
                    // nodpi: _full.png — 320×320 PNG (프로필 상세 보기용, 공식 가이드 규격)
                    if (fs.existsSync(nodpiDir)) {
                        const fullFilename = filename.replace("_image.png", "_image_full.png");
                        const dest = path.join(nodpiDir, fullFilename);
                        const fullPngBuf = await toPng(buf, 320, 320);
                        fs.writeFileSync(dest, fullPngBuf);
                        userWrittenFiles.add(dest);
                    }
                }
                else {
                    // ── 일반 이미지 (배경, 아이콘 등) ─────────────────────────────
                    // 베이스 템플릿에 이미 존재하는 파일만 교체 (없는 파일 추가 시 apktool 오류)
                    for (const dir of generalDrawableDirs) {
                        if (!fs.existsSync(dir))
                            continue;
                        const dest = path.join(dir, filename);
                        if (fs.existsSync(dest)) {
                            fs.writeFileSync(dest, buf);
                            userWrittenFiles.add(dest);
                        }
                    }
                }
            }
            // ── 6-1. public.xml에 프로필 리소스 등록 확인 (누락 시 주입) ──────
            // KakaoTalk은 xxhdpi 프로필 이미지를 Android 리소스 시스템으로 조회.
            // public.xml에 등록되지 않으면 리소스 테이블에서 누락될 수 있음.
            ensureProfileResourcesInPublicXml(path.join(tmpDir, "res", "values", "public.xml"));
        }
        // ── 7. 잘못된 PNG 파일 제거 (apktool 내부 aapt2 호환) ──────────────────
        // 사용자가 직접 기록한 파일은 건너뛴다 (sharp 변환 통과 또는 의도적 교체)
        removeInvalidPngs(path.join(tmpDir, "res"), userWrittenFiles);
        // ── 8. apktool 리빌드 ─────────────────────────────────────────────────
        try {
            (0, child_process_1.execSync)(`apktool b "${tmpDir}" -o "${unsignedApk}"`, {
                timeout: 180_000,
                encoding: "utf8",
                cwd: os.tmpdir(),
            });
        }
        catch (e) {
            const err = e;
            throw new Error(`apktool 실패: ${err.stderr ?? err.stdout ?? err.message}`);
        }
        // ── 9. zipalign (v2 서명 전 필수 — 4바이트 정렬) ────────────────────
        const alignedApk = path.join(os.tmpdir(), `aligned-${id}.apk`);
        try {
            (0, child_process_1.execSync)(`"${ZIPALIGN_PATH}" -f 4 "${unsignedApk}" "${alignedApk}"`, { timeout: 60_000, encoding: "utf8" });
        }
        catch (e) {
            const err = e;
            throw new Error(`zipalign 실패: ${err.stderr ?? err.stdout ?? err.message}`);
        }
        // ── 10. apksigner로 v1+v2 서명 ───────────────────────────────────────
        // Android 11+(API 30+)에서 targetSdkVersion 30+ APK는 v2 서명 필수.
        // jarsigner는 v1만 지원하므로 apksigner를 사용합니다.
        try {
            (0, child_process_1.execSync)(`"${APKSIGNER_PATH}" sign --ks "${KEYSTORE_PATH}" --ks-pass "pass:${KEYSTORE_STOREPASS}" --ks-key-alias "${KEYSTORE_ALIAS}" --key-pass "pass:${KEYSTORE_STOREPASS}" "${alignedApk}"`, { timeout: 60_000, encoding: "utf8", cwd: os.tmpdir() });
        }
        catch (e) {
            const err = e;
            throw new Error(`apksigner 실패: ${err.stderr ?? err.stdout ?? err.message}`);
        }
        const apkBuffer = fs.readFileSync(alignedApk);
        return apkBuffer;
    }
    finally {
        // 임시 파일 정리
        try {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
        catch { /* ignore */ }
        try {
            fs.rmSync(unsignedApk, { force: true });
        }
        catch { /* ignore */ }
        try {
            fs.rmSync(path.join(os.tmpdir(), `aligned-${id}.apk`), { force: true });
        }
        catch { /* ignore */ }
    }
}
function escapeXml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
function dataUrlToBuffer(dataUrl) {
    try {
        const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        if (!base64)
            return null;
        return Buffer.from(base64, "base64");
    }
    catch {
        return null;
    }
}
/**
 * 이미지 버퍼를 유효한 PNG로 변환 (JPEG, WebP 등 → PNG).
 * aapt2가 drawable PNG 파일의 시그니처를 엄격히 검증하므로 필수.
 *
 * @param width  0 이면 리사이즈 없이 원본 크기 유지
 * @param height 0 이면 리사이즈 없이 원본 크기 유지
 */
async function toPng(buf, width, height) {
    try {
        let pipeline = (0, sharp_1.default)(buf);
        if (width > 0 && height > 0) {
            pipeline = pipeline.resize(width, height, { fit: "cover", position: "center" });
        }
        return await pipeline.png().toBuffer();
    }
    catch {
        // 변환 실패 시 원본 반환 (apktool이 처리하도록)
        return buf;
    }
}
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
/** 파일이 유효한 PNG인지 시그니처(매직 바이트)로 확인 */
function isValidPng(filePath) {
    try {
        const fd = fs.openSync(filePath, "r");
        const header = Buffer.alloc(8);
        fs.readSync(fd, header, 0, 8, 0);
        fs.closeSync(fd);
        return header.subarray(0, 8).equals(PNG_SIGNATURE);
    }
    catch {
        return false;
    }
}
/**
 * res/ 내 .png 확장자이지만 실제 PNG가 아닌 파일을 삭제.
 * skipFiles에 포함된 파일(사용자가 직접 업로드한 이미지)은 건너뜁니다.
 */
function removeInvalidPngs(dir, skipFiles = new Set()) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            removeInvalidPngs(fullPath, skipFiles);
        }
        else if (entry.name.endsWith(".png") && !skipFiles.has(fullPath) && !isValidPng(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
}
/**
 * public.xml에 프로필 02/03 및 _full 리소스가 누락된 경우 주입.
 * KakaoTalk은 xxhdpi 프로필 이미지를 Android 리소스 시스템(getIdentifier)으로 조회하므로
 * public.xml에 등록되어 있어야 리소스 테이블(resources.arsc)에 포함됩니다.
 */
function ensureProfileResourcesInPublicXml(publicXmlPath) {
    if (!fs.existsSync(publicXmlPath))
        return;
    let xml = fs.readFileSync(publicXmlPath, "utf8");
    // 이미 모든 프로필이 등록되어 있으면 스킵
    const requiredNames = [
        "theme_profile_01_image",
        "theme_profile_01_image_full",
        "theme_profile_02_image",
        "theme_profile_02_image_full",
        "theme_profile_03_image",
        "theme_profile_03_image_full",
    ];
    const missing = requiredNames.filter(name => !xml.includes(`name="${name}"`));
    if (missing.length === 0)
        return;
    // 현재 drawable 리소스 중 가장 큰 ID를 찾아서 이어붙이기
    const idRegex = /<public type="drawable"[^>]+id="0x([0-9a-fA-F]+)"/g;
    let maxId = 0;
    let match;
    while ((match = idRegex.exec(xml)) !== null) {
        const id = parseInt(match[1], 16);
        if (id > maxId)
            maxId = id;
    }
    // 누락된 엔트리를 </resources> 직전에 삽입
    const newEntries = missing.map(name => {
        maxId++;
        const hexId = "0x" + maxId.toString(16).padStart(8, "0");
        return `    <public type="drawable" name="${name}" id="${hexId}" />`;
    }).join("\n");
    xml = xml.replace("</resources>", newEntries + "\n</resources>");
    fs.writeFileSync(publicXmlPath, xml);
}

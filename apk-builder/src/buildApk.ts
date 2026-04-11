import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const BASE_DECODED_PATH =
  process.env.BASE_DECODED_PATH ?? path.join(__dirname, "../base-decoded");
const KEYSTORE_PATH =
  process.env.KEYSTORE_PATH ?? path.join(__dirname, "../keystore.jks");
const KEYSTORE_STOREPASS = process.env.KEYSTORE_STOREPASS ?? "kakkumi_apk_store";
const KEYSTORE_KEYPASS = process.env.KEYSTORE_KEYPASS ?? "kakkumi_apk_key";
const KEYSTORE_ALIAS = process.env.KEYSTORE_ALIAS ?? "kakkumi";

/** zipalign 경로 (v2 서명 전 4바이트 정렬 필수) */
const ZIPALIGN_PATH = process.env.ZIPALIGN_PATH ?? "zipalign";
/** apksigner 경로 (v1+v2 서명 — Android 11+ 필수) */
const APKSIGNER_PATH = process.env.APKSIGNER_PATH ?? "apksigner";

/** POST /build 에서 받는 요청 타입 */
export interface BuildOptions {
  /** 테마 이름 (예: "나의 봄 테마") */
  themeName: string;
  /** 앱 패키지 ID (예: "com.kakao.talk.theme.mytheme") */
  packageId: string;
  /**
   * colors.xml 에 덮어쓸 색상 맵
   * key: theme_background_color 같은 color name
   * value: #RRGGBB 또는 #AARRGGBB
   */
  colors: Record<string, string>;
  /**
   * 교체할 이미지 맵
   * key: 파일명 (예: "theme_background_image.png")
   * value: base64 data URL (예: "data:image/png;base64,...")
   */
  images?: Record<string, string>;
  versionName?: string;
  versionCode?: number;
  /** 다크모드 여부 — true 이면 AndroidManifest 에 com.kakao.talk.theme_style=dark 주입 */
  darkMode?: boolean;
}

/**
 * 베이스 디코딩 APK에 색상·이미지를 주입하고,
 * apktool로 리빌드 → jarsigner로 서명한 APK Buffer를 반환합니다.
 */
export async function buildApk(options: BuildOptions): Promise<Buffer> {
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
      manifest = manifest.replace(
        /\s*<meta-data\s+android:name="com\.kakao\.talk\.theme_style"[^>]*\/>/g,
        ""
      );

      // 다크모드일 때 <application ...> 직후에 theme_style meta-data 삽입
      if (options.darkMode) {
        manifest = manifest.replace(
          /(<application[^>]*>)/,
          `$1\n        <meta-data android:name="com.kakao.talk.theme_style" android:value="dark"/>`
        );
      }

      fs.writeFileSync(manifestPath, manifest);
    }

    // ── 3. apktool.yml — renameManifestPackage 동기화 ─────────────────────
    const apktoolYmlPath = path.join(tmpDir, "apktool.yml");
    if (fs.existsSync(apktoolYmlPath)) {
      let yml = fs.readFileSync(apktoolYmlPath, "utf8");
      yml = yml.replace(
        /renameManifestPackage:.*(\r?\n)/,
        `renameManifestPackage: ${options.packageId}$1`
      );
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
      if (!fs.existsSync(stringsPath)) continue;
      let strings = fs.readFileSync(stringsPath, "utf8");
      strings = strings.replace(
        /(<string name="app_name">)[^<]*(<\/string>)/,
        `$1${escapeXml(options.themeName)}$2`
      );
      strings = strings.replace(
        /(<string name="theme_title">)[^<]*(<\/string>)/,
        `$1${escapeXml(options.themeName)}$2`
      );
      fs.writeFileSync(stringsPath, strings);
    }

    // ── 5. colors.xml — 색상 덮어쓰기 ────────────────────────────────────
    const colorsPath = path.join(tmpDir, "res", "values", "colors.xml");
    if (fs.existsSync(colorsPath)) {
      let colors = fs.readFileSync(colorsPath, "utf8");
      for (const [name, value] of Object.entries(options.colors)) {
        colors = colors.replace(
          new RegExp(`(<color name="${name}">)[^<]*(</color>)`, "g"),
          `$1${value}$2`
        );
      }
      fs.writeFileSync(colorsPath, colors);
    }

    // ── 6. 이미지 교체 (drawable-xxhdpi / drawable-xhdpi) ─────────────────
    if (options.images) {
      const xxhdpiDir = path.join(tmpDir, "res", "drawable-xxhdpi");

      // profile_02, profile_03가 base 템플릿에 없으면 profile_01에서 복사해 플레이스홀더 생성
      // (유효한 PNG일 때만 복사 — apktool 2.9.3 내부 aapt2가 PNG 시그니처를 엄격히 검증)
      const profile01 = path.join(xxhdpiDir, "theme_profile_01_image.png");
      if (fs.existsSync(profile01) && isValidPng(profile01)) {
        for (const n of ["02", "03"]) {
          const profileN = path.join(xxhdpiDir, `theme_profile_0${n}_image.png`);
          if (!fs.existsSync(profileN)) {
            fs.copyFileSync(profile01, profileN);
          }
        }
      }

      const drawableDirs = [
        xxhdpiDir,
        path.join(tmpDir, "res", "drawable-xhdpi"),
        path.join(tmpDir, "res", "drawable-sw600dp"),
      ];
      for (const [filename, dataUrl] of Object.entries(options.images)) {
        const buf = dataUrlToBuffer(dataUrl);
        if (!buf) continue;
        for (const dir of drawableDirs) {
          if (!fs.existsSync(dir)) continue;
          const dest = path.join(dir, filename);
          // 원본 파일이 존재할 때만 교체 (없는 파일을 새로 추가하면 apktool 오류 가능)
          if (fs.existsSync(dest)) {
            fs.writeFileSync(dest, buf);
          }
        }
      }
    }

    // ── 7. 잘못된 PNG 파일 제거 (apktool 내부 aapt2 호환) ──────────────────
    // apktool 2.9.3은 내부적으로 aapt2를 사용하며, .png 확장자이지만
    // 실제 PNG가 아닌 파일(WebP 등)이 있으면 빌드가 실패합니다.
    removeInvalidPngs(path.join(tmpDir, "res"));

    // ── 8. apktool 리빌드 ─────────────────────────────────────────────────
    try {
      execSync(`apktool b "${tmpDir}" -o "${unsignedApk}"`, {
        timeout: 180_000,
        encoding: "utf8",
        cwd: os.tmpdir(),
      });
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string; message?: string };
      throw new Error(`apktool 실패: ${err.stderr ?? err.stdout ?? err.message}`);
    }

    // ── 9. zipalign (v2 서명 전 필수 — 4바이트 정렬) ────────────────────
    const alignedApk = path.join(os.tmpdir(), `aligned-${id}.apk`);
    try {
      execSync(
        `"${ZIPALIGN_PATH}" -f 4 "${unsignedApk}" "${alignedApk}"`,
        { timeout: 60_000, encoding: "utf8" }
      );
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string; message?: string };
      throw new Error(`zipalign 실패: ${err.stderr ?? err.stdout ?? err.message}`);
    }

    // ── 10. apksigner로 v1+v2 서명 ───────────────────────────────────────
    // Android 11+(API 30+)에서 targetSdkVersion 30+ APK는 v2 서명 필수.
    // jarsigner는 v1만 지원하므로 apksigner를 사용합니다.
    try {
      execSync(
        `"${APKSIGNER_PATH}" sign --ks "${KEYSTORE_PATH}" --ks-pass "pass:${KEYSTORE_STOREPASS}" --ks-key-alias "${KEYSTORE_ALIAS}" --key-pass "pass:${KEYSTORE_STOREPASS}" "${alignedApk}"`,
        { timeout: 60_000, encoding: "utf8", cwd: os.tmpdir() }
      );
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string; message?: string };
      throw new Error(`apksigner 실패: ${err.stderr ?? err.stdout ?? err.message}`);
    }

    const apkBuffer = fs.readFileSync(alignedApk);
    return apkBuffer;
  } finally {
    // 임시 파일 정리
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
    try { fs.rmSync(unsignedApk, { force: true }); } catch { /* ignore */ }
    try { fs.rmSync(path.join(os.tmpdir(), `aligned-${id}.apk`), { force: true }); } catch { /* ignore */ }
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function dataUrlToBuffer(dataUrl: string): Buffer | null {
  try {
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    if (!base64) return null;
    return Buffer.from(base64, "base64");
  } catch {
    return null;
  }
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

/** 파일이 유효한 PNG인지 시그니처(매직 바이트)로 확인 */
function isValidPng(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, "r");
    const header = Buffer.alloc(8);
    fs.readSync(fd, header, 0, 8, 0);
    fs.closeSync(fd);
    return header.subarray(0, 8).equals(PNG_SIGNATURE);
  } catch {
    return false;
  }
}

/**
 * res/ 내 .png 확장자이지만 실제 PNG가 아닌 파일을 삭제.
 * apktool 2.9.3 내부 aapt2가 PNG 시그니처를 엄격히 검증하므로,
 * 비표준 파일(WebP/JPEG를 .png 확장자로 저장한 경우)을 제거합니다.
 */
function removeInvalidPngs(dir: string): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removeInvalidPngs(fullPath);
    } else if (entry.name.endsWith(".png") && !isValidPng(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}



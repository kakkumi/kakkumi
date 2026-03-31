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

    // ── 2. AndroidManifest.xml — 패키지 ID 교체 ───────────────────────────
    const manifestPath = path.join(tmpDir, "AndroidManifest.xml");
    if (fs.existsSync(manifestPath)) {
      let manifest = fs.readFileSync(manifestPath, "utf8");
      manifest = manifest.replace(/package="[^"]*"/, `package="${options.packageId}"`);
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
      const drawableDirs = [
        path.join(tmpDir, "res", "drawable-xxhdpi"),
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

    // ── 7. apktool 리빌드 ─────────────────────────────────────────────────
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

    // ── 8. jarsigner로 v1 서명 ────────────────────────────────────────────
    try {
      execSync(
        `jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore "${KEYSTORE_PATH}" -storepass "${KEYSTORE_STOREPASS}" "${unsignedApk}" "${KEYSTORE_ALIAS}"`,
        { timeout: 60_000, encoding: "utf8", cwd: os.tmpdir() }
      );
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string; message?: string };
      throw new Error(`jarsigner 실패: ${err.stderr ?? err.stdout ?? err.message}`);
    }

    const apkBuffer = fs.readFileSync(unsignedApk);
    return apkBuffer;
  } finally {
    // 임시 파일 정리
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
    try { fs.rmSync(unsignedApk, { force: true }); } catch { /* ignore */ }
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


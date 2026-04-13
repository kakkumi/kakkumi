// apktool 리빌드 직전까지만 실행하여 중간 파일 검사
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const sharp = require('sharp');

async function toPng(buf, width, height) {
  let pipeline = sharp(buf);
  if (width > 0 && height > 0) {
    pipeline = pipeline.resize(width, height, { fit: 'cover', position: 'center' });
  }
  return await pipeline.png().toBuffer();
}

async function main() {
  const images = JSON.parse(fs.readFileSync('/tmp/test_profile_images.json', 'utf8'));
  const BASE = path.join(__dirname, 'base-decoded');
  const tmpDir = path.join(os.tmpdir(), 'apk-inspect-test');

  // 기존 tmp 삭제
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });

  // 1. 베이스 복사
  fs.cpSync(BASE, tmpDir, { recursive: true });
  console.log('1. Base copied to', tmpDir);

  // 2. 프로필 이미지 쓰기 (buildApk.ts와 동일 로직)
  const xxhdpiDir = path.join(tmpDir, 'res', 'drawable-xxhdpi');
  const nodpiDir = path.join(tmpDir, 'res', 'drawable-nodpi');

  for (const [filename, dataUrl] of Object.entries(images)) {
    const base64 = dataUrl.split(',')[1];
    const buf = Buffer.from(base64, 'base64');

    // xxhdpi: 220x220
    const pngBuf = await toPng(buf, 220, 220);
    fs.writeFileSync(path.join(xxhdpiDir, filename), pngBuf);
    console.log(`2. xxhdpi/${filename}: ${pngBuf.length} bytes`);

    // nodpi: _full 320x320
    const fullFilename = filename.replace('_image.png', '_image_full.png');
    const fullPngBuf = await toPng(buf, 320, 320);
    fs.writeFileSync(path.join(nodpiDir, fullFilename), fullPngBuf);
    console.log(`2. nodpi/${fullFilename}: ${fullPngBuf.length} bytes`);
  }

  // 3. 쓰여진 xxhdpi 파일 MD5 비교
  console.log('\n=== xxhdpi 파일 MD5 비교 ===');
  for (let i = 1; i <= 3; i++) {
    const f = path.join(xxhdpiDir, `theme_profile_0${i}_image.png`);
    const { createHash } = require('crypto');
    const hash = createHash('md5').update(fs.readFileSync(f)).digest('hex');
    console.log(`  theme_profile_0${i}_image.png: ${hash}`);
  }

  // 4. 쓰여진 nodpi 파일 MD5 비교
  console.log('\n=== nodpi _full 파일 MD5 비교 ===');
  for (let i = 1; i <= 3; i++) {
    const f = path.join(nodpiDir, `theme_profile_0${i}_image_full.png`);
    const { createHash } = require('crypto');
    const hash = createHash('md5').update(fs.readFileSync(f)).digest('hex');
    console.log(`  theme_profile_0${i}_image_full.png: ${hash}`);
  }

  // 5. public.xml에 프로필 02/03 등록 여부 확인
  const publicXml = fs.readFileSync(path.join(tmpDir, 'res', 'values', 'public.xml'), 'utf8');
  console.log('\n=== public.xml 프로필 리소스 ===');
  const profileLines = publicXml.split('\n').filter(l => l.includes('theme_profile'));
  profileLines.forEach(l => console.log(' ', l.trim()));

  // 6. apktool 리빌드
  const unsignedApk = path.join(os.tmpdir(), 'test-unsigned.apk');
  try {
    execSync(`apktool b "${tmpDir}" -o "${unsignedApk}"`, { timeout: 180000, encoding: 'utf8' });
    console.log('\n6. apktool rebuild SUCCESS =>', unsignedApk);
  } catch (e) {
    console.error('\n6. apktool rebuild FAILED:', e.stderr || e.message);
    return;
  }

  // 7. 빌드된 APK를 다시 디컴파일하여 리소스 확인
  const decompDir = path.join(os.tmpdir(), 'apk-inspect-decompiled');
  if (fs.existsSync(decompDir)) fs.rmSync(decompDir, { recursive: true });
  try {
    execSync(`apktool d "${unsignedApk}" -o "${decompDir}" -f`, { timeout: 180000, encoding: 'utf8' });
    console.log('7. Decompiled to', decompDir);
  } catch (e) {
    console.error('7. Decompile FAILED:', e.stderr || e.message);
    return;
  }

  // 8. 디컴파일된 APK에서 xxhdpi 프로필 파일 확인
  const decompXxhdpi = path.join(decompDir, 'res', 'drawable-xxhdpi');
  console.log('\n=== 디컴파일된 APK: xxhdpi 프로필 파일 ===');
  for (let i = 1; i <= 3; i++) {
    const f = path.join(decompXxhdpi, `theme_profile_0${i}_image.png`);
    if (fs.existsSync(f)) {
      const { createHash } = require('crypto');
      const hash = createHash('md5').update(fs.readFileSync(f)).digest('hex');
      const size = fs.statSync(f).size;
      console.log(`  theme_profile_0${i}_image.png: EXISTS, ${size} bytes, md5=${hash}`);
    } else {
      console.log(`  theme_profile_0${i}_image.png: MISSING!`);
    }
  }

  // 9. 디컴파일된 APK에서 nodpi _full 파일 확인
  const decompNodpi = path.join(decompDir, 'res', 'drawable-nodpi');
  console.log('\n=== 디컴파일된 APK: nodpi _full 프로필 파일 ===');
  for (let i = 1; i <= 3; i++) {
    const f = path.join(decompNodpi, `theme_profile_0${i}_image_full.png`);
    if (fs.existsSync(f)) {
      const { createHash } = require('crypto');
      const hash = createHash('md5').update(fs.readFileSync(f)).digest('hex');
      const size = fs.statSync(f).size;
      console.log(`  theme_profile_0${i}_image_full.png: EXISTS, ${size} bytes, md5=${hash}`);
    } else {
      console.log(`  theme_profile_0${i}_image_full.png: MISSING!`);
    }
  }

  // 10. 디컴파일된 APK의 public.xml 확인
  const decompPublicXml = path.join(decompDir, 'res', 'values', 'public.xml');
  if (fs.existsSync(decompPublicXml)) {
    const xml = fs.readFileSync(decompPublicXml, 'utf8');
    const lines = xml.split('\n').filter(l => l.includes('theme_profile'));
    console.log('\n=== 디컴파일된 APK: public.xml 프로필 리소스 ===');
    lines.forEach(l => console.log(' ', l.trim()));
  }
}

main().catch(e => console.error('ERROR:', e));


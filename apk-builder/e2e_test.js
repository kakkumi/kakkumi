// 로컬 apk-builder에 직접 3개 프로필 이미지로 빌드 요청 후
// 결과 APK를 디컴파일하여 xxhdpi/nodpi 파일이 각각 다른지 확인
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

async function main() {
  // 1. 서로 다른 색상 PNG 3장 생성
  const colors = ['#FF0000', '#00FF00', '#0000FF'];
  const names = ['RED', 'GREEN', 'BLUE'];
  const images = {};

  for (let i = 0; i < 3; i++) {
    const buf = await sharp({
      create: { width: 100, height: 100, channels: 3, background: colors[i] }
    }).png().toBuffer();
    const b64 = 'data:image/png;base64,' + buf.toString('base64');
    const filename = `theme_profile_0${i + 1}_image.png`;
    images[filename] = b64;
    console.log(`INPUT  ${filename}: ${names[i]}, b64_length=${b64.length}`);
  }

  // 2. 로컬 apk-builder에 POST /build 호출
  console.log('\nCalling localhost:8080/build ...');
  const res = await fetch('http://localhost:8080/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      themeName: 'ProfileDebug',
      packageId: 'com.kakao.talk.theme.profiledebug',
      colors: { theme_background_color: '#FFFFFF' },
      images,
      versionName: '1.0.0',
      darkMode: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('BUILD FAILED:', err);
    return;
  }

  // 3. APK 저장
  const apkBuf = Buffer.from(await res.arrayBuffer());
  const apkPath = '/tmp/profile_debug.apk';
  fs.writeFileSync(apkPath, apkBuf);
  console.log(`APK saved: ${apkBuf.length} bytes => ${apkPath}`);

  // 4. APK 디컴파일
  const decompDir = '/tmp/profile_debug_decompiled';
  if (fs.existsSync(decompDir)) fs.rmSync(decompDir, { recursive: true });
  execSync(`apktool d "${apkPath}" -o "${decompDir}" -f`, { timeout: 180000 });
  console.log(`Decompiled => ${decompDir}`);

  // 5. xxhdpi 프로필 이미지 확인
  console.log('\n=== xxhdpi 프로필 이미지 ===');
  const xxhdpi = path.join(decompDir, 'res', 'drawable-xxhdpi');
  for (let i = 1; i <= 3; i++) {
    const f = path.join(xxhdpi, `theme_profile_0${i}_image.png`);
    if (fs.existsSync(f)) {
      const data = fs.readFileSync(f);
      const md5 = crypto.createHash('md5').update(data).digest('hex');
      console.log(`  0${i}: ${data.length} bytes, md5=${md5}`);
    } else {
      console.log(`  0${i}: MISSING!`);
    }
  }

  // 6. nodpi _full 프로필 이미지 확인
  console.log('\n=== nodpi _full 프로필 이미지 ===');
  const nodpi = path.join(decompDir, 'res', 'drawable-nodpi');
  for (let i = 1; i <= 3; i++) {
    const f = path.join(nodpi, `theme_profile_0${i}_image_full.png`);
    if (fs.existsSync(f)) {
      const data = fs.readFileSync(f);
      const md5 = crypto.createHash('md5').update(data).digest('hex');
      console.log(`  0${i}_full: ${data.length} bytes, md5=${md5}`);
    } else {
      console.log(`  0${i}_full: MISSING!`);
    }
  }

  // 7. public.xml 프로필 등록 확인
  console.log('\n=== public.xml ===');
  const pubxml = fs.readFileSync(path.join(decompDir, 'res', 'values', 'public.xml'), 'utf8');
  pubxml.split('\n').filter(l => l.includes('profile')).forEach(l => console.log(' ', l.trim()));

  // 8. 결론
  console.log('\n=== 결론 ===');
  const hashes = [];
  for (let i = 1; i <= 3; i++) {
    const f = path.join(xxhdpi, `theme_profile_0${i}_image.png`);
    if (fs.existsSync(f)) {
      hashes.push(crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex'));
    }
  }
  const allDifferent = new Set(hashes).size === 3;
  console.log(`xxhdpi 3개 파일 MD5 모두 다름: ${allDifferent ? '✅ YES' : '❌ NO (문제!)'}`);

  const fullHashes = [];
  for (let i = 1; i <= 3; i++) {
    const f = path.join(nodpi, `theme_profile_0${i}_image_full.png`);
    if (fs.existsSync(f)) {
      fullHashes.push(crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex'));
    }
  }
  const fullAllDifferent = new Set(fullHashes).size === 3;
  console.log(`nodpi _full 3개 파일 MD5 모두 다름: ${fullAllDifferent ? '✅ YES' : '❌ NO (문제!)'}`);
}

main().catch(e => console.error('ERROR:', e));


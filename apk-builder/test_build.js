const { buildApk } = require('./dist/buildApk');
const fs = require('fs');

async function main() {
  const images = JSON.parse(fs.readFileSync('/tmp/test_profile_images.json', 'utf8'));
  
  console.log('Building APK with 3 different profile images...');
  console.log('Images:', Object.keys(images).join(', '));
  
  const apkBuf = await buildApk({
    themeName: 'ProfileTest',
    packageId: 'com.kakao.talk.theme.profiletest',
    colors: {
      theme_background_color: '#FFFFFF',
    },
    images,
    versionName: '1.0.0',
    darkMode: false,
  });

  fs.writeFileSync('/tmp/test_profile.apk', apkBuf);
  console.log(`APK built: ${apkBuf.length} bytes => /tmp/test_profile.apk`);
}
main().catch(e => console.error('BUILD FAILED:', e.message));


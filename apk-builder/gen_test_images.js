const sharp = require('sharp');
const fs = require('fs');

async function main() {
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
    console.log(`${filename} => ${names[i]} (${buf.length} bytes)`);
  }

  fs.writeFileSync('/tmp/test_profile_images.json', JSON.stringify(images));
  console.log('Done');
}
main();


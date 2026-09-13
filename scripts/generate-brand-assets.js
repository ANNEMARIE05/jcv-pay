const sharp = require('sharp');
const path = require('path');

const SOURCE = path.join(__dirname, '../assets/images/logo/jcv pay logo.png');
const OUT_DIR = path.join(__dirname, '../assets/images');

async function createSquareIcon(output, size, paddingRatio = 0.12) {
  const logo = sharp(SOURCE);
  const innerSize = Math.floor(size * (1 - paddingRatio * 2));
  const resized = await logo
    .resize(innerSize, innerSize, { fit: 'inside', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();
  const { width, height } = await sharp(resized).metadata();
  const left = Math.floor((size - width) / 2);
  const top = Math.floor((size - height) / 2);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toFile(output);
}

async function createSplashIcon(output, width) {
  await sharp(SOURCE)
    .resize(width, null, { fit: 'inside', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(output);
}

async function createSolidBackground(output, size, color) {
  await sharp({
    create: { width: size, height: size, channels: 4, background: color },
  })
    .png()
    .toFile(output);
}

async function main() {
  await createSquareIcon(path.join(OUT_DIR, 'icon.png'), 1024);
  await createSquareIcon(path.join(OUT_DIR, 'android-icon-foreground.png'), 1024, 0.18);
  await createSquareIcon(path.join(OUT_DIR, 'android-icon-monochrome.png'), 1024, 0.18);
  await createSolidBackground(path.join(OUT_DIR, 'android-icon-background.png'), 1024, {
    r: 255,
    g: 255,
    b: 255,
    alpha: 1,
  });
  await createSquareIcon(path.join(OUT_DIR, 'favicon.png'), 48, 0.08);
  await createSplashIcon(path.join(OUT_DIR, 'splash-icon.png'), 240);
  await sharp(SOURCE).png().toFile(path.join(OUT_DIR, 'jcv-pay-logo.png'));

  console.log('Brand assets generated successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

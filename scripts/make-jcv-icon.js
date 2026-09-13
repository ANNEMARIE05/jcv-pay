const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

(async () => {
  const root = path.join(__dirname, '..');
  const src = path.join(root, 'assets', 'images', 'jcv-pay-logo.png');
  console.log('src exists', fs.existsSync(src), fs.statSync(src).size);

  const size = 1024;
  const pad = 140;
  const meta = await sharp(src).metadata();
  console.log('src meta', meta.width, meta.height);

  const maxInner = size - pad * 2;
  const scale = Math.min(maxInner / meta.width, maxInner / meta.height);
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);
  const left = Math.round((size - w) / 2);
  const top = Math.round((size - h) / 2);
  console.log({ w, h, left, top });

  const resized = await sharp(src)
    .resize(w, h, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  const out = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();

  console.log('out bytes', out.length);

  const targets = [
    'assets/images/icon.png',
    'assets/images/splash-icon.png',
    'assets/images/android-icon-foreground.png',
    'assets/images/favicon.png',
    'assets/images/jcv-square-icon.png',
  ];

  for (const t of targets) {
    const full = path.join(root, t);
    fs.writeFileSync(full, out);
    const m = await sharp(full).metadata();
    console.log('wrote', t, m.width, m.height);
  }
})().catch((e) => {
  console.error('ERR', e);
  process.exit(1);
});

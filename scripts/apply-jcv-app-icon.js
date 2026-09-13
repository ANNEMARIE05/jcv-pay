const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const src = path.join(
  root,
  'assets',
  'images',
  'logo',
  'jcv pay logo.png'
);

async function writePng(file, buffer) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, buffer);
}

async function squareOnWhite(size, paddingRatio) {
  const meta = await sharp(src).metadata();
  const inner = Math.round(size * (1 - paddingRatio * 2));
  const scale = Math.min(inner / meta.width, inner / meta.height);
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);
  const left = Math.round((size - w) / 2);
  const top = Math.round((size - h) / 2);

  const resized = await sharp(src)
    .resize(w, h, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
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
}

async function logoOnTransparent(size, paddingRatio) {
  const inner = Math.round(size * (1 - paddingRatio * 2));
  return sharp(src)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: Math.round((size - inner) / 2),
      bottom: Math.round((size - inner) / 2),
      left: Math.round((size - inner) / 2),
      right: Math.round((size - inner) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

(async () => {
  if (!fs.existsSync(src)) {
    throw new Error('Logo introuvable: ' + src);
  }

  const icon = await squareOnWhite(1024, 0.14);
  const foreground = await logoOnTransparent(1024, 0.18);
  const favicon = await squareOnWhite(48, 0.08);
  const logoCopy = await sharp(src).png().toBuffer();

  await writePng('assets/images/icon.png', icon);
  await writePng('assets/images/splash-icon.png', icon);
  await writePng('assets/images/jcv-square-icon.png', icon);
  await writePng('assets/images/jcv-pay-logo.png', logoCopy);
  await writePng('assets/images/android-icon-foreground.png', foreground);
  await writePng('assets/images/favicon.png', favicon);
  await writePng('assets/expo.icon/Assets/jcv-logo.png', logoCopy);

  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .png()
    .toFile(path.join(root, 'assets/images/android-icon-background.png'));

  fs.writeFileSync(
    path.join(root, 'assets/expo.icon/icon.json'),
    JSON.stringify(
      {
        fill: { solid: 'extended-srgb:1.00000,1.00000,1.00000,1.00000' },
        groups: [
          {
            layers: [
              {
                'image-name': 'jcv-logo.png',
                name: 'jcv-logo',
                position: {
                  scale: 0.78,
                  'translation-in-points': [0, 0],
                },
              },
            ],
            shadow: { kind: 'neutral', opacity: 0.25 },
            translucency: { enabled: false, value: 0.5 },
          },
        ],
        'supported-platforms': {
          circles: ['watchOS'],
          squares: 'shared',
        },
      },
      null,
      2
    )
  );

  console.log('JCV app icon applied');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

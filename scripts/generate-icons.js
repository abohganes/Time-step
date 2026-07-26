// Regenerates the app's icon/splash assets from SVG. Run with: node scripts/generate-icons.js
const sharp = require('sharp');
const path = require('path');

const CORAL = '#FF6F91';
const YELLOW = '#FFD166';
const MINT = '#06D6A0';

const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'images');

// A bold checkmark stroke path, drawn in a 0-1024 coordinate space.
const checkPath = 'M 300 540 L 445 685 L 730 340';

function checkmarkSvg({ size, strokeWidth, color = '#FFFFFF', background = null, dots = false }) {
  const scale = size / 1024;
  const bg = background
    ? `<rect width="${size}" height="${size}" fill="${background}" />`
    : '';
  const dotsMarkup = dots
    ? `
    <circle cx="${820 * scale}" cy="${150 * scale}" r="${44 * scale}" fill="${YELLOW}" />
    <circle cx="${900 * scale}" cy="${260 * scale}" r="${30 * scale}" fill="${MINT}" />
  `
    : '';
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${bg}
  ${dotsMarkup}
  <path d="${checkPath}" transform="scale(${scale})" fill="none" stroke="${color}"
    stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />
</svg>`.trim();
}

async function render(svg, outPath) {
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log('wrote', outPath);
}

async function main() {
  // Main icon: full-bleed coral background, white checkmark, small accent dots.
  await render(
    checkmarkSvg({ size: 1024, strokeWidth: 90, background: CORAL, dots: true }),
    path.join(IMAGES_DIR, 'icon.png')
  );

  // Android adaptive icon background layer: solid color only.
  await render(
    `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="${CORAL}" /></svg>`,
    path.join(IMAGES_DIR, 'android-icon-background.png')
  );

  // Android adaptive icon foreground: checkmark only, kept inside the ~66% safe zone.
  await render(
    checkmarkSvg({ size: 512, strokeWidth: 46 }),
    path.join(IMAGES_DIR, 'android-icon-foreground.png')
  );

  // Android monochrome (themed) icon: checkmark silhouette, transparent background.
  await render(
    checkmarkSvg({ size: 432, strokeWidth: 40 }),
    path.join(IMAGES_DIR, 'android-icon-monochrome.png')
  );

  // Splash icon: coral rounded badge with checkmark, transparent surroundings.
  const splashSize = 512;
  const badgeSvg = `
<svg width="${splashSize}" height="${splashSize}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect x="112" y="112" width="800" height="800" rx="200" fill="${CORAL}" />
  <path d="${checkPath}" fill="none" stroke="#FFFFFF" stroke-width="90" stroke-linecap="round" stroke-linejoin="round" />
</svg>`.trim();
  await render(badgeSvg, path.join(IMAGES_DIR, 'splash-icon.png'));

  // Favicon (web, low priority but keep consistent).
  await render(
    checkmarkSvg({ size: 48, strokeWidth: 6, background: CORAL }),
    path.join(IMAGES_DIR, 'favicon.png')
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

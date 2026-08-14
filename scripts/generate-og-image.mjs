import { fileURLToPath } from 'node:url';
import path from 'node:path';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logoPath = path.join(root, 'apps/frontend/public/brand/liyaro-logo.svg');
const outputPath = path.join(root, 'apps/frontend/public/og-image.png');

const background = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <pattern id="grid" width="88" height="88" patternUnits="userSpaceOnUse">
        <path d="M 88 0 L 0 0 0 88" fill="none" stroke="#121311" stroke-opacity="0.055" />
      </pattern>
      <radialGradient id="glow" cx="86%" cy="18%" r="62%">
        <stop offset="0" stop-color="#d54f2d" stop-opacity="0.22" />
        <stop offset="1" stop-color="#d54f2d" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="#f3f0e8" />
    <rect width="1200" height="630" fill="url(#grid)" />
    <rect width="1200" height="630" fill="url(#glow)" />
    <path d="M72 315 H344 V285 H610 V315 H838 V368 H1128" fill="none" stroke="#d54f2d" stroke-width="4" />
    <g fill="#d54f2d">
      <circle cx="72" cy="315" r="8" />
      <circle cx="344" cy="285" r="8" />
      <circle cx="610" cy="315" r="8" />
      <circle cx="838" cy="368" r="8" />
      <circle cx="1128" cy="368" r="8" />
    </g>
    <text x="72" y="245" fill="#6c6a63" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="3">НЕЗАВИСИМАЯ СТУДИЯ РАЗРАБОТКИ</text>
    <text x="72" y="438" fill="#121311" font-family="Arial, sans-serif" font-size="64" font-weight="700" letter-spacing="-2">
      <tspan x="72">Сайты, сервисы</tspan>
      <tspan x="72" dy="72">и внутренние системы</tspan>
    </text>
    <text x="72" y="582" fill="#6c6a63" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="2">LIYARO.RU</text>
    <text x="1128" y="582" fill="#6c6a63" font-family="monospace" font-size="17" text-anchor="end" letter-spacing="1">INPUT → LOGIC → OUTPUT</text>
  </svg>
`);

const logo = await sharp(logoPath).resize({ width: 205 }).png().toBuffer();

await sharp(background)
  .composite([{ input: logo, left: 72, top: 36 }])
  .png({ compressionLevel: 9, palette: true })
  .toFile(outputPath);

console.log(`Generated ${path.relative(root, outputPath)} (1200x630)`);

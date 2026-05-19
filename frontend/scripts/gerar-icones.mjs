/**
 * Gera PNGs PWA e logos meuzovo em public/icons/
 * Uso: npm run icons
 */
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');
const logoSvg = join(outDir, 'meuzovo-logo.svg');
const logoHorizSvg = join(outDir, 'meuzovo-logo-horizontal.svg');
const TAMANHOS = [72, 96, 128, 192, 512];

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

await sharp(readFileSync(logoSvg)).resize(512, 512).png().toFile(join(outDir, 'meuzovo-logo.png'));
console.log('✓ meuzovo-logo.png');

await sharp(readFileSync(logoHorizSvg))
  .resize(320, 72, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(join(outDir, 'meuzovo-logo-horizontal.png'));
console.log('✓ meuzovo-logo-horizontal.png');

const iconSvg = readFileSync(logoSvg);
for (const size of TAMANHOS) {
  const dest = join(outDir, `icon-${size}.png`);
  await sharp(iconSvg).resize(size, size).png().toFile(dest);
  console.log(`✓ icon-${size}.png`);
}

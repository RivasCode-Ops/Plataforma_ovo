/**
 * Gera PNGs em public/icons/ a partir de public/icon.svg
 * Uso: npm run icons
 */
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');
const svgPath = join(root, 'public', 'icon.svg');
const TAMANHOS = [72, 96, 128, 192, 512];

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const svg = readFileSync(svgPath);

for (const size of TAMANHOS) {
  const dest = join(outDir, `icon-${size}.png`);
  await sharp(svg).resize(size, size).png().toFile(dest);
  console.log(`✓ icon-${size}.png`);
}

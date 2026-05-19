import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'Plataforma_ovo' || name === 'site') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (name.endsWith('.md')) files.push(p);
  }
  return files;
}

for (const file of walk(join(root, 'docs')).concat([join(root, 'README.md')])) {
  let c = readFileSync(file, 'utf8');
  const o = c;
  c = c.replace(/Plataforma Ovo/g, 'meuzovo');
  if (c !== o) {
    writeFileSync(file, c);
    console.log('✓', file.replace(root + '\\', '').replace(root + '/', ''));
  }
}

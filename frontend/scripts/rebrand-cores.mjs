import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(jsx|js|css)$/.test(name)) {
      let c = readFileSync(p, 'utf8');
      const o = c;
      c = c.replace(/amber-(\d+)/g, 'brand-$1');
      c = c.replace(/#d97706/gi, '#C45E1A');
      if (c !== o) writeFileSync(p, c);
    }
  }
}

walk(root);
console.log('Cores amber → brand aplicadas.');

import { readFileSync, writeFileSync } from 'fs';

const p = new URL('../meuzovo-apresentacao.html', import.meta.url);
let c = readFileSync(p, 'utf8');
c = c.replace(/<motion class="hero-tag">/g, '<div class="hero-tag">');
c = c.replace(/<\/motion>\s*\n\s*<h1 class="hero-titulo">/, '</div>\n  <h1 class="hero-titulo">');
writeFileSync(p, c);
console.log('ok');

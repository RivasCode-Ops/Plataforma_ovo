export function fatorOvos(unidade) {
  const u = String(unidade || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (u.includes('duzia') || u === 'dz') return 12;
  if (u.includes('cartela') && u.includes('30')) return 30;
  if (u.includes('ovo')) return 1;
  return 1;
}

export function emOvos(quantidade, unidade) {
  return Math.round(Number(quantidade || 0) * fatorOvos(unidade));
}

export function fmtUnidade(qtd, unidade) {
  const n = Number(qtd);
  const ovos = emOvos(n, unidade);
  if (fatorOvos(unidade) > 1) {
    return `${ovos} ovos (${n} ${unidade})`;
  }
  return `${n} ${unidade}`;
}

export function montarEndereco({
  rua,
  numero,
  bairro,
  cep,
}: {
  rua: string;
  numero: string;
  bairro: string;
  cep: string;
}): string {
  const r = (rua || '').trim();
  const n = (numero || '').trim();
  const b = (bairro || '').trim();
  const c = (cep || '').trim().replace(/\D/g, '');
  const partes: string[] = [];
  if (r) partes.push(n ? `${r}, ${n}` : r);
  if (b) partes.push(b);
  if (c) {
    partes.push(
      `CEP ${c.length === 8 ? `${c.slice(0, 5)}-${c.slice(5)}` : c}`,
    );
  }
  return partes.length ? partes.join(' — ') : '';
}

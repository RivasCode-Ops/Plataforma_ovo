/** Monta texto único para o campo clientes.endereco (compatível com o banco atual). */
export function montarEndereco({ rua, numero, bairro, cep }) {
  const r = (rua || '').trim();
  const n = (numero || '').trim();
  const b = (bairro || '').trim();
  const c = (cep || '').trim().replace(/\D/g, '');
  const partes = [];
  if (r) partes.push(n ? `${r}, ${n}` : r);
  if (b) partes.push(b);
  if (c) partes.push(`CEP ${c.length === 8 ? `${c.slice(0, 5)}-${c.slice(5)}` : c}`);
  return partes.length ? partes.join(' — ') : '';
}

/** Tenta preencher campos a partir do endereço salvo (formato legado ou novo). */
export function parseEndereco(texto) {
  const vazio = { rua: '', numero: '', bairro: '', cep: '' };
  if (!texto?.trim()) return vazio;
  const t = texto.trim();
  const cepMatch = t.match(/CEP\s*([\d-]+)/i);
  const cep = cepMatch ? cepMatch[1].replace(/\D/g, '') : '';
  let resto = t.replace(/CEP\s*[\d-]+/i, '').trim();
  const partes = resto.split(' — ').map((p) => p.trim()).filter(Boolean);
  let rua = '';
  let numero = '';
  let bairro = '';
  if (partes.length >= 2) {
    bairro = partes[partes.length - 1];
    resto = partes.slice(0, -1).join(' — ');
  } else if (partes.length === 1) {
    resto = partes[0];
  }
  const virgula = resto.lastIndexOf(',');
  if (virgula > 0) {
    rua = resto.slice(0, virgula).trim();
    numero = resto.slice(virgula + 1).trim();
  } else {
    rua = resto;
  }
  return { rua, numero, bairro, cep };
}

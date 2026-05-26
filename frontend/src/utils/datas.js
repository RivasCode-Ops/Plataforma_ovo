/** Formata data ISO, Date ou timestamp para dd/mm/aaaa (pt-BR). */
export function formatarData(valor) {
  if (valor == null || valor === '') return '—';
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) return '—';
    return valor.toLocaleDateString('pt-BR');
  }
  const s = String(valor).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  return s;
}

export function formatarDataHora(valor) {
  if (valor == null || valor === '') return '—';
  const d = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(d.getTime())) return formatarData(valor);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

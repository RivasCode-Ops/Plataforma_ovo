export function calcTrocoPreview(forma, valorTotal, valorRecebido) {
  const total = Number(valorTotal) || 0;
  const rec = Number(valorRecebido);
  if (forma !== 'dinheiro') return { ok: true, troco: 0 };
  if (Number.isNaN(rec)) return { ok: false, troco: 0 };
  if (rec < total) return { ok: false, troco: 0, erro: 'Recebido menor que o total' };
  return { ok: true, troco: Math.round((rec - total) * 100) / 100 };
}

export const FORMAS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'outro', label: 'Outro' },
];

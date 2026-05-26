const FORMAS = ['dinheiro', 'pix', 'cartao', 'outro'];

export function normalizarForma(forma) {
  const f = String(forma || 'dinheiro').trim().toLowerCase();
  return FORMAS.includes(f) ? f : 'outro';
}

/** Troco automático para dinheiro; demais formas = 0. */
export function calcularTroco({ forma_pagamento, valor_total, valor_recebido }) {
  const forma = normalizarForma(forma_pagamento);
  const total = Number(valor_total) || 0;
  const recebido = Number(valor_recebido) ?? total;
  if (forma !== 'dinheiro') {
    return { valor_recebido: recebido, troco: 0 };
  }
  if (recebido < total) {
    const err = new Error('Valor recebido menor que o total (dinheiro).');
    err.status = 400;
    throw err;
  }
  return { valor_recebido: recebido, troco: Math.round((recebido - total) * 100) / 100 };
}

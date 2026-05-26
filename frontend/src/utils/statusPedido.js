export const STATUS_PEDIDO = [
  'novo',
  'confirmado',
  'pago',
  'enviado',
  'entregue',
  'cancelado',
];

export const STATUS_LABEL = {
  novo: 'Novo',
  confirmado: 'Aguardando pagamento',
  pago: 'Pago',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const STATUS_COR = {
  novo: 'bg-brand-100 text-brand-800',
  confirmado: 'bg-amber-100 text-amber-900',
  pago: 'bg-emerald-100 text-emerald-800',
  enviado: 'bg-violet-100 text-violet-800',
  entregue: 'bg-stone-200 text-stone-700',
  cancelado: 'bg-red-100 text-red-800',
};

export function aguardaPagamento(status) {
  return status === 'novo' || status === 'confirmado';
}

/** Próximos status permitidos no painel (espelha o backend). */
export const PROXIMOS_STATUS = {
  novo: ['confirmado', 'cancelado'],
  confirmado: ['pago', 'cancelado'],
  pago: ['enviado', 'entregue', 'cancelado'],
  enviado: ['entregue', 'cancelado'],
  entregue: [],
  cancelado: [],
};

export function opcoesStatusAtual(status) {
  const proximos = PROXIMOS_STATUS[status] || [];
  return [status, ...proximos.filter((s) => s !== status)];
}

const DIAS_SEMANA = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export function formatarTelefoneWhatsapp(telefone) {
  let n = String(telefone || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = n.slice(1);
  if (!n.startsWith('55') && (n.length === 10 || n.length === 11)) {
    n = `55${n}`;
  }
  return n;
}

/** Gera URL wa.me — não abre janela; use só no clique do operador. */
export function linkWhatsApp(telefone, mensagem) {
  const destino = formatarTelefoneWhatsapp(telefone);
  if (!destino) return null;
  return `https://wa.me/${destino}?text=${encodeURIComponent(mensagem)}`;
}

function linhasItens(itens) {
  return (itens || []).map((i) => {
    const nome = i.nome || i.produto_nome || 'Item';
    const qtd = i.quantidade;
    const sub =
      i.subtotal != null ? ` — R$ ${Number(i.subtotal).toFixed(2)}` : '';
    return `• ${qtd}× ${nome}${sub}`;
  });
}

function nomeDia(diaSemana) {
  if (diaSemana == null || diaSemana === '') return '';
  const idx = Number(diaSemana);
  return DIAS_SEMANA[idx] ?? String(diaSemana);
}

export function msgPedidoConfirmado({ nome, itens, total, pedidoId }) {
  const linhas = linhasItens(itens);
  const partes = [
    `Olá${nome ? `, ${nome}` : ''}!`,
    '',
    `*Pedido #${pedidoId} confirmado*`,
    '',
    ...linhas,
    '',
    `*Total: R$ ${Number(total).toFixed(2)}*`,
    '',
    'Obrigado pela preferência! 🥚',
    'Granja União',
  ];
  return partes.join('\n');
}

export function msgAssinaturaConfirmada({
  nome,
  itens,
  frequencia,
  diaSemana,
  proximaEntrega,
}) {
  const linhas = linhasItens(itens);
  const freq =
    frequencia === 'quinzenal' ? 'quinzenal' : frequencia === 'semanal' ? 'semanal' : frequencia;
  const dia = nomeDia(diaSemana);
  return [
    `Olá${nome ? `, ${nome}` : ''}!`,
    '',
    '*Sua assinatura foi registrada*',
    '',
    ...linhas,
    '',
    `Frequência: *${freq}*${dia ? ` · entrega às *${dia}s*` : ''}`,
    proximaEntrega ? `Próxima entrega: *${proximaEntrega}*` : '',
    '',
    'Qualquer dúvida, estamos à disposição.',
    'Granja União 🥚',
  ]
    .filter(Boolean)
    .join('\n');
}

export function msgAssinaturaEntrega({ nome, itens, endereco }) {
  const linhas = linhasItens(itens);
  return [
    `Olá${nome ? `, ${nome}` : ''}!`,
    '',
    '*Lembrete de entrega*',
    '',
    linhas.length ? 'Itens previstos:' : 'Sua entrega está programada para hoje.',
    ...linhas,
    endereco ? `\n📍 ${endereco}` : '',
    '',
    'Confirme se estará no endereço ou avise se precisar reagendar.',
    'Granja União 🥚',
  ]
    .filter((l) => l !== '')
    .join('\n');
}

export function mensagemPorTipo(tipo, dados = {}) {
  switch (tipo) {
    case 'pedido':
      return msgPedidoConfirmado(dados);
    case 'assinatura':
      return msgAssinaturaConfirmada(dados);
    case 'entrega':
      return msgAssinaturaEntrega(dados);
    default:
      return '';
  }
}

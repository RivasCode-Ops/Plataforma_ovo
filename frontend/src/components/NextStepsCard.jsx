/** Mapeia paths usados nos passos para ids de seção do App */
export const PATH_TO_SECAO = {
  '/inicio': 'inicio',
  '/hoje': 'hoje',
  '/pedidos': 'pedidos',
  '/novo': 'novo',
  '/clientes': 'clientes',
  '/lotes': 'lotes',
  '/rotas': 'rotas',
  '/produtos': 'produtos',
  '/alertas': 'alertas',
  '/assinaturas': 'assinaturas',
  '/whatsapp': 'whatsapp',
};

function buildSteps(context, data) {
  const d = data || {};
  switch (context) {
    case 'pedido':
      return [
        {
          path: '/hoje',
          title: 'Pedidos do dia',
          description: `Ver #${d.id} na lista de entregas de hoje`,
        },
        {
          path: '/pedidos',
          title: 'Todos os pedidos',
          description: 'Acompanhar status e gerar PIX',
        },
        {
          path: '/novo',
          title: 'Novo pedido',
          description: 'Registrar outro pedido',
        },
      ];
    case 'cliente':
      return [
        {
          path: '/novo',
          title: 'Novo pedido',
          description: d.nome ? `Pedido para ${d.nome}` : 'Lançar pedido deste cliente',
        },
        {
          path: '/clientes',
          title: 'Clientes',
          description: 'Preços atacado e rota de entrega',
        },
        {
          path: '/hoje',
          title: 'Pedidos do dia',
          description: 'Ver entregas de hoje',
        },
      ];
    case 'estoque':
      return [
        {
          path: '/lotes',
          title: 'Lotes',
          description: d.produto
            ? `${d.quantidade ?? ''} un. · ${d.lote || 'lote registrado'}`
            : 'Conferir estoque por validade',
        },
        {
          path: '/alertas',
          title: 'Alertas',
          description: 'Validade e estoque baixo',
        },
        {
          path: '/novo',
          title: 'Novo pedido',
          description: 'Baixa automática pelo FIFO',
        },
      ];
    case 'rota':
      return [
        {
          path: '/hoje',
          title: 'Pedidos do dia',
          description: d.totalPedidos
            ? `${d.totalPedidos} pedido(s) nesta rota`
            : 'Impressão agrupada por rota',
        },
        {
          path: '/rotas',
          title: 'Rotas',
          description: d.nome ? `Gerenciar “${d.nome}”` : 'Atribuir clientes às rotas',
        },
        {
          path: '/clientes',
          title: 'Clientes',
          description: 'Vincular clientes à rota',
        },
      ];
    default:
      return [];
  }
}

function tituloContexto(context, data) {
  switch (context) {
    case 'pedido':
      return data?.id
        ? `Pedido #${data.id} salvo${data.total != null ? ` · R$ ${Number(data.total).toFixed(2)}` : ''}`
        : 'Pedido salvo';
    case 'cliente':
      return data?.nome ? `${data.nome} atualizado` : 'Cliente atualizado';
    case 'estoque':
      return data?.produto ? `Lote de ${data.produto} registrado` : 'Estoque atualizado';
    case 'rota':
      return data?.nome ? `Rota “${data.nome}” criada` : 'Rota salva';
    default:
      return 'Salvo com sucesso';
  }
}

/**
 * @param {{ context: 'pedido'|'cliente'|'estoque'|'rota', data?: object, onNavigate?: (path: string) => void, onIrPara?: (secao: string) => void }} props
 */
export default function NextStepsCard({ context, data, onNavigate, onIrPara }) {
  const steps = buildSteps(context, data);
  if (steps.length === 0) return null;

  function go(path) {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    if (onIrPara) {
      const secao = PATH_TO_SECAO[path];
      if (secao) onIrPara(secao);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
      <p className="mb-1 text-sm font-semibold text-amber-900">{tituloContexto(context, data)}</p>
      <p className="mb-3 text-xs text-amber-800/90">Próximos passos sugeridos:</p>
      <ul className="grid gap-2 sm:grid-cols-3">
        {steps.map((step) => (
          <li key={step.path}>
            <button
              type="button"
              onClick={() => go(step.path)}
              className="flex h-full w-full flex-col rounded-lg border border-amber-200/80 bg-white px-3 py-2.5 text-left text-sm transition hover:border-amber-400 hover:shadow-sm"
            >
              <span className="font-medium text-stone-800">{step.title}</span>
              <span className="mt-0.5 text-xs text-stone-500">{step.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

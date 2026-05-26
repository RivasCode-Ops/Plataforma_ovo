const BASE = '/api';
const TOKEN_KEY = 'plataforma_ovo_token';

let onUnauthorized = () => {};

export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Sem conexão com o servidor. Verifique a internet e tente de novo.');
  }

  const body = await res.json().catch(() => ({}));

  if (res.status === 401) {
    setToken(null);
    onUnauthorized();
    throw new Error(body.erro || 'Sessão expirada. Faça login novamente.');
  }

  if (res.status === 403) {
    throw new Error(body.erro || 'Você não tem permissão para esta ação.');
  }

  if (!res.ok) throw new Error(body.erro || res.statusText);
  return body.data ?? body;
}

export const api = {
  health: () => request('/health'),
  login: (usuario, senha) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, senha }),
    }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  listarProdutos: () => request('/produtos'),
  listarProdutosGerenciar: () => request('/produtos?gerenciar=1'),
  criarProduto: (payload) =>
    request('/produtos', { method: 'POST', body: JSON.stringify(payload) }),
  atualizarProduto: (id, payload) =>
    request(`/produtos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  listarClientes: (q) =>
    request(`/clientes${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  obterCliente: (id) => request(`/clientes/${id}`),
  precosPorTelefone: (telefone) =>
    request(`/clientes/precos?telefone=${encodeURIComponent(telefone)}`),
  salvarPrecoAtacado: (clienteId, produtoId, preco) =>
    request(`/clientes/${clienteId}/precos/${produtoId}`, {
      method: 'PUT',
      body: JSON.stringify({ preco }),
    }),
  removerPrecoAtacado: (clienteId, produtoId) =>
    request(`/clientes/${clienteId}/precos/${produtoId}`, { method: 'DELETE' }),
  listarPedidos: ({ status, aguardandoPagamento, limite, offset, q: busca } = {}) => {
    const q = new URLSearchParams();
    if (status) q.set('status', status);
    if (aguardandoPagamento) q.set('aguardando_pagamento', '1');
    if (limite) q.set('limite', String(limite));
    if (offset) q.set('offset', String(offset));
    if (busca) q.set('q', busca);
    const s = q.toString();
    return request(`/pedidos${s ? `?${s}` : ''}`);
  },
  criarCliente: (payload) =>
    request('/clientes', { method: 'POST', body: JSON.stringify(payload) }),
  atualizarAssinatura: (id, payload) =>
    request(`/assinaturas/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  obterPedido: (id) => request(`/pedidos/${id}`),
  confirmarPedido: (id) =>
    request(`/pedidos/${id}/confirmar`, { method: 'POST' }),
  marcarPedidoPago: (id, forma_pagamento = 'pix') =>
    request(`/pedidos/${id}/pagar`, {
      method: 'PATCH',
      body: JSON.stringify({ forma_pagamento }),
    }),
  criarPedido: (payload) =>
    request('/pedidos', { method: 'POST', body: JSON.stringify(payload) }),
  vendaBalcao: (payload) =>
    request('/balcao', { method: 'POST', body: JSON.stringify(payload) }),
  atualizarStatus: (id, status) =>
    request(`/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  whatsappStatus: () => request('/whatsapp/status'),
  whatsappLink: (telefone, mensagem) =>
    request('/whatsapp/link', {
      method: 'POST',
      body: JSON.stringify({ telefone, mensagem }),
    }),
  relatorioResumo: (de, ate) => {
    const q = new URLSearchParams();
    if (de) q.set('de', de);
    if (ate) q.set('ate', ate);
    const s = q.toString();
    return request(`/relatorios/resumo${s ? `?${s}` : ''}`);
  },
  pedidosDoDia: (dia) =>
    request(`/relatorios/pedidos-dia${dia ? `?dia=${dia}` : ''}`),
  listarAssinaturas: (status) =>
    request(`/assinaturas${status ? `?status=${status}` : ''}`),
  assinaturasEntregasSemana: () => request('/assinaturas/entregas-semana'),
  criarAssinatura: (payload) =>
    request('/assinaturas', { method: 'POST', body: JSON.stringify(payload) }),
  gerarPedidoAssinatura: (id) =>
    request(`/assinaturas/${id}/gerar-pedido`, { method: 'POST' }),
  atualizarAssinaturaStatus: (id, status) =>
    request(`/assinaturas/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  listarLotes: ({ comEstoque, produto_id } = {}) => {
    const q = new URLSearchParams();
    if (comEstoque) q.set('com_estoque', '1');
    if (produto_id) q.set('produto_id', produto_id);
    const s = q.toString();
    return request(`/lotes${s ? `?${s}` : ''}`);
  },
  lotesAlertas: (dias = 7) => request(`/lotes/alertas?dias=${dias}`),
  registrarLote: (payload) =>
    request('/lotes', { method: 'POST', body: JSON.stringify(payload) }),
  definirDescontoLote: (loteId, payload) =>
    request(`/lotes/${loteId}/desconto`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  removerDescontoLote: (loteId) =>
    request(`/lotes/${loteId}/desconto`, { method: 'DELETE' }),
  listarNotificacoes: () => request('/notificacoes'),
  previsaoDemanda: (dias, periodo) => {
    const q = new URLSearchParams();
    if (dias) q.set('dias', dias);
    if (periodo) q.set('periodo', periodo);
    const s = q.toString();
    return request(`/previsao${s ? `?${s}` : ''}`);
  },
  pixStatus: () => request('/pix/status'),
  pedidoPix: (id) => request(`/pedidos/${id}/pix`),
  listarRotas: (ativas) => request(`/rotas${ativas ? '?ativas=1' : ''}`),
  criarRota: (payload) =>
    request('/rotas', { method: 'POST', body: JSON.stringify(payload) }),
  atualizarRota: (id, payload) =>
    request(`/rotas/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  atribuirClienteRota: (clienteId, rotaId) =>
    request(`/rotas/cliente/${clienteId}`, {
      method: 'PATCH',
      body: JSON.stringify({ rota_id: rotaId }),
    }),
  listarOperadores: () => request('/operadores'),
  criarOperador: (payload) =>
    request('/operadores', { method: 'POST', body: JSON.stringify(payload) }),
  atualizarOperador: (id, payload) =>
    request(`/operadores/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  redefinirSenhaOperador: (id, senha) =>
    request(`/operadores/${id}/senha`, {
      method: 'PATCH',
      body: JSON.stringify({ senha }),
    }),

  turnoEntregaAtual: (turnoId) => {
    const q = turnoId ? `?turno_id=${encodeURIComponent(turnoId)}` : '';
    return request(`/turnos-entrega/atual${q}`);
  },
  listarTurnosAbertos: (dataRef) => {
    const q = dataRef ? `?data_ref=${encodeURIComponent(dataRef)}` : '';
    return request(`/turnos-entrega/abertos${q}`);
  },
  iniciarTurnoEntrega: (payload) =>
    request('/turnos-entrega/iniciar', { method: 'POST', body: JSON.stringify(payload) }),
  detalheTurnoEntrega: (id) => request(`/turnos-entrega/${id}`),
  encerrarTurnoEntrega: (id) =>
    request(`/turnos-entrega/${id}/encerrar`, { method: 'POST' }),
  concluirParadaEntrega: (turnoId, paradaId, payload) =>
    request(`/turnos-entrega/${turnoId}/paradas/${paradaId}/concluir`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  vendaAvulsaTurno: (turnoId, payload) =>
    request(`/turnos-entrega/${turnoId}/vendas-avulsas`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  responderDemandaTurno: (turnoId, demandaId, payload) =>
    request(`/turnos-entrega/${turnoId}/demandas/${demandaId}/responder`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listarTurnosEntrega: (status) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/turnos-entrega${q}`);
  },
  criarDemandaTurno: (payload) =>
    request('/turnos-entrega/demandas', { method: 'POST', body: JSON.stringify(payload) }),
  confirmarPrestacaoTurno: (turnoId, payload) =>
    request(`/turnos-entrega/${turnoId}/prestacao`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export async function downloadRelatorioCsv(de, ate) {
  const q = new URLSearchParams();
  if (de) q.set('de', de);
  if (ate) q.set('ate', ate);
  const token = getToken();
  const res = await fetch(`${BASE}/relatorios/export.csv?${q}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 401) {
    setToken(null);
    onUnauthorized();
    throw new Error('Sessão expirada');
  }
  if (!res.ok) throw new Error('Falha ao exportar CSV');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pedidos_${de || 'inicio'}_${ate || 'fim'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

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

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));

  if (res.status === 401) {
    setToken(null);
    onUnauthorized();
    throw new Error(body.erro || 'Sessão expirada. Faça login novamente.');
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
  listarPedidos: (status) =>
    request(`/pedidos${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  criarPedido: (payload) =>
    request('/pedidos', { method: 'POST', body: JSON.stringify(payload) }),
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
  listarNotificacoes: () => request('/notificacoes'),
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

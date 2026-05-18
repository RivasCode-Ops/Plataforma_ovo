const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.erro || res.statusText);
  return body.data ?? body;
}

export const api = {
  health: () => request('/health'),
  listarProdutos: () => request('/produtos'),
  listarPedidos: (status) =>
    request(`/pedidos${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  criarPedido: (payload) =>
    request('/pedidos', { method: 'POST', body: JSON.stringify(payload) }),
  atualizarStatus: (id, status) =>
    request(`/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

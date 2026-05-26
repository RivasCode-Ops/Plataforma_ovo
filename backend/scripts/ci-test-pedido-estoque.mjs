#!/usr/bin/env node
/**
 * CI: pedido do site (novo) → confirmar → estoque baixa
 */
const BASE = process.env.API_BASE || 'http://localhost:3000';
const SITE_TOKEN = process.env.SITE_PEDIDO_TOKEN || 'ci-test-token';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'plataforma123';

async function json(method, path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${data.erro || res.statusText}`);
  }
  return data.data ?? data;
}

async function main() {
  const cardapio = await json('GET', '/api/cardapio');
  const produtos = cardapio.produtos || cardapio;
  const prod = produtos.find((p) => p.disponivel !== false && p.estoque >= 2);
  if (!prod) throw new Error('Nenhum produto com estoque >= 2 para teste');

  const estoqueAntes = prod.estoque;
  const tel = `5599${String(Date.now()).slice(-8)}`;

  const criado = await json(
    'POST',
    '/api/pedido-site',
    {
      cliente: { nome: 'CI Teste', telefone: tel, endereco: 'Rua Teste' },
      itens: [{ produto_id: prod.id, quantidade: 1 }],
      confirmar: false,
    },
    { 'x-site-pedido-token': SITE_TOKEN }
  );

  if (criado.status !== 'novo') {
    throw new Error(`Esperado status novo, veio ${criado.status}`);
  }

  const login = await json('POST', '/api/auth/login', {
    usuario: ADMIN_USER,
    senha: ADMIN_PASS,
  });

  const confirmado = await json('POST', `/api/pedidos/${criado.pedido_id}/confirmar`, null, {
    Authorization: `Bearer ${login.token}`,
  });

  if (confirmado.status !== 'confirmado') {
    throw new Error(`Esperado confirmado, veio ${confirmado.status}`);
  }

  const cardapioDepois = await json('GET', '/api/cardapio');
  const listaDepois = cardapioDepois.produtos || cardapioDepois;
  const prodDepois = listaDepois.find((p) => p.id === prod.id);
  if (!prodDepois || prodDepois.estoque !== estoqueAntes - 1) {
    throw new Error(
      `Estoque não baixou: antes=${estoqueAntes} depois=${prodDepois?.estoque}`
    );
  }

  console.log('ci-test-pedido-estoque: OK');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

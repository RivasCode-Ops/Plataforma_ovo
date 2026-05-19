import { pool } from '../db.js';

export async function mapaPrecosCliente(clienteId, client = pool) {
  if (!clienteId) return {};
  const { rows } = await client.query(
    `SELECT produto_id, preco FROM cliente_precos WHERE cliente_id = $1`,
    [clienteId]
  );
  return Object.fromEntries(rows.map((r) => [r.produto_id, Number(r.preco)]));
}

export function resolverPrecoUnitario(precosMap, produtoId, precoPadrao, precoInformado) {
  if (precosMap[produtoId] != null) return precosMap[produtoId];
  if (precoInformado != null) return Number(precoInformado);
  return Number(precoPadrao);
}

export async function listarPrecosCliente(clienteId) {
  const { rows } = await pool.query(
    `SELECT cp.id, cp.produto_id, cp.preco, cp.updated_at,
            p.nome AS produto_nome, p.unidade, p.preco AS preco_varejo
     FROM cliente_precos cp
     JOIN produtos p ON p.id = cp.produto_id
     WHERE cp.cliente_id = $1
     ORDER BY p.nome`,
    [clienteId]
  );
  return rows.map((r) => ({
    ...r,
    preco: Number(r.preco),
    preco_varejo: Number(r.preco_varejo),
  }));
}

export async function precosPorTelefone(telefone) {
  const { rows } = await pool.query(
    `SELECT c.id, c.nome, c.endereco, c.rota_id, r.nome AS rota_nome
     FROM clientes c
     LEFT JOIN rotas r ON r.id = c.rota_id
     WHERE c.telefone = $1`,
    [telefone]
  );
  if (!rows.length) return { cliente: null, precos: {} };
  const cliente = rows[0];
  const precos = await mapaPrecosCliente(cliente.id);
  return {
    cliente: {
      id: cliente.id,
      nome: cliente.nome,
      endereco: cliente.endereco,
      rota_id: cliente.rota_id,
      rota_nome: cliente.rota_nome,
    },
    precos,
  };
}

export async function salvarPrecoCliente(clienteId, produtoId, preco) {
  const p = Number(preco);
  if (!Number.isFinite(p) || p < 0) {
    throw Object.assign(new Error('Preço inválido'), { status: 400 });
  }

  const { rows } = await pool.query(
    `INSERT INTO cliente_precos (cliente_id, produto_id, preco)
     VALUES ($1, $2, $3)
     ON CONFLICT (cliente_id, produto_id)
     DO UPDATE SET preco = $3, updated_at = NOW()
     RETURNING *`,
    [clienteId, produtoId, p]
  );
  return rows[0];
}

export async function removerPrecoCliente(clienteId, produtoId) {
  const { rowCount } = await pool.query(
    'DELETE FROM cliente_precos WHERE cliente_id = $1 AND produto_id = $2',
    [clienteId, produtoId]
  );
  return rowCount > 0;
}

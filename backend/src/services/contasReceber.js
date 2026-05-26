import { pool } from '../db.js';

function vencimentoPadrao(dias = 7) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export async function criarContaReceber({
  cliente_id,
  pedido_id,
  valor,
  vencimento,
}) {
  const { rows } = await pool.query(
    `INSERT INTO contas_a_receber (cliente_id, pedido_id, valor, vencimento, status)
     VALUES ($1, $2, $3, $4, 'aberto')
     RETURNING *`,
    [cliente_id, pedido_id, valor, vencimento || vencimentoPadrao()]
  );
  return rows[0];
}

/** Lista fiado legado + contas_a_receber unificados. */
export async function listarContasAbertas({ cliente_id } = {}) {
  const params = [];
  let filtroFiado = '';
  let filtroContas = '';

  if (cliente_id) {
    params.push(Number(cliente_id));
    filtroFiado = `AND f.cliente_id = $${params.length}`;
    filtroContas = `AND c.cliente_id = $${params.length}`;
  }

  let fiadoRows = [];
  let contaRows = [];

  try {
    ({ rows: fiadoRows } = await pool.query(
      `SELECT f.id, f.cliente_id, f.pedido_id, f.valor::float AS valor,
              f.criado_em AS created_at, NULL::date AS vencimento,
              c.nome AS cliente_nome, c.telefone AS cliente_telefone,
              'fiado' AS origem
       FROM fiado f
       JOIN clientes c ON c.id = f.cliente_id
       WHERE f.pago = FALSE ${filtroFiado}
       ORDER BY f.criado_em DESC`,
      params
    ));
  } catch (err) {
    if (err.code !== '42P01') throw err;
  }

  try {
    ({ rows: contaRows } = await pool.query(
      `SELECT cr.id, cr.cliente_id, cr.pedido_id, cr.valor::float AS valor,
              cr.created_at, cr.vencimento,
              c.nome AS cliente_nome, c.telefone AS cliente_telefone,
              'conta' AS origem, cr.status
       FROM contas_a_receber cr
       JOIN clientes c ON c.id = cr.cliente_id
       WHERE cr.status = 'aberto' ${filtroContas}
       ORDER BY cr.vencimento ASC, cr.created_at DESC`,
      params
    ));
  } catch (err) {
    if (err.code !== '42P01') throw err;
  }

  return [...fiadoRows, ...contaRows];
}

export async function marcarContaPaga({ id, origem = 'conta' }) {
  if (origem === 'fiado') {
    const { rows } = await pool.query(
      `UPDATE fiado SET pago = TRUE WHERE id = $1 AND pago = FALSE RETURNING *`,
      [id]
    );
    if (!rows.length) {
      throw Object.assign(new Error('Fiado não encontrado ou já pago'), { status: 404 });
    }
    await pool.query(
      `UPDATE pedidos SET status = 'pago', forma_pagamento = COALESCE(forma_pagamento, 'fiado'),
       updated_at = NOW()
       WHERE id = $1 AND status NOT IN ('cancelado', 'pago')`,
      [rows[0].pedido_id]
    );
    return { ...rows[0], origem: 'fiado' };
  }

  const { rows } = await pool.query(
    `UPDATE contas_a_receber
     SET status = 'pago', pago_em = NOW()
     WHERE id = $1 AND status = 'aberto'
     RETURNING *`,
    [id]
  );
  if (!rows.length) {
    throw Object.assign(new Error('Conta não encontrada ou já paga'), { status: 404 });
  }
  await pool.query(
    `UPDATE pedidos SET status = 'pago', updated_at = NOW()
     WHERE id = $1 AND status NOT IN ('cancelado', 'pago')`,
    [rows[0].pedido_id]
  );
  return { ...rows[0], origem: 'conta' };
}

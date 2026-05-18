import { pool, withTransaction } from '../db.js';

export async function listarLotes({ produto_id, apenas_com_estoque } = {}) {
  const params = [];
  const conds = [];

  if (produto_id) {
    params.push(produto_id);
    conds.push(`l.produto_id = $${params.length}`);
  }
  if (apenas_com_estoque) {
    conds.push('l.quantidade > 0');
  }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT l.*, p.nome AS produto_nome, p.unidade,
            (l.data_validade - CURRENT_DATE) AS dias_para_vencer
     FROM lotes l
     JOIN produtos p ON p.id = l.produto_id
     ${where}
     ORDER BY l.data_validade ASC, l.id`,
    params
  );

  return rows.map((r) => ({
    ...r,
    dias_para_vencer: Number(r.dias_para_vencer),
  }));
}

export async function listarAlertasValidade(dias = 7) {
  const { rows } = await pool.query(
    `SELECT l.*, p.nome AS produto_nome,
            (l.data_validade - CURRENT_DATE) AS dias_para_vencer
     FROM lotes l
     JOIN produtos p ON p.id = l.produto_id
     WHERE l.quantidade > 0
       AND l.data_validade <= CURRENT_DATE + make_interval(days => $1)
     ORDER BY l.data_validade`,
    [dias]
  );
  return rows;
}

export async function registrarLote({
  produto_id,
  codigo,
  quantidade,
  data_validade,
  data_entrada,
  observacao,
}) {
  const qtd = Number(quantidade);
  if (!produto_id || !Number.isInteger(qtd) || qtd < 1) {
    throw Object.assign(new Error('produto_id e quantidade válida são obrigatórios'), {
      status: 400,
    });
  }
  if (!data_validade) {
    throw Object.assign(new Error('data_validade é obrigatória'), { status: 400 });
  }

  return withTransaction(async (client) => {
    const prod = await client.query('SELECT id, nome FROM produtos WHERE id = $1 AND ativo', [
      produto_id,
    ]);
    if (!prod.rows.length) {
      throw Object.assign(new Error('Produto não encontrado'), { status: 400 });
    }

    const ins = await client.query(
      `INSERT INTO lotes (produto_id, codigo, quantidade, quantidade_inicial, data_validade, data_entrada, observacao)
       VALUES ($1, $2, $3, $3, $4, COALESCE($5, CURRENT_DATE), $6) RETURNING *`,
      [
        produto_id,
        codigo?.trim() || null,
        qtd,
        data_validade,
        data_entrada || null,
        observacao ?? null,
      ]
    );

    await client.query(
      'UPDATE produtos SET estoque = estoque + $1, updated_at = NOW() WHERE id = $2',
      [qtd, produto_id]
    );

    return ins.rows[0];
  });
}

/** Baixa FIFO por validade (chamar dentro de transação de pedido) */
export async function baixarEstoqueFifo(client, produtoId, quantidade) {
  let restante = quantidade;

  const { rows } = await client.query(
    `SELECT id, quantidade FROM lotes
     WHERE produto_id = $1 AND quantidade > 0
     ORDER BY data_validade ASC, id ASC
     FOR UPDATE`,
    [produtoId]
  );

  for (const lote of rows) {
    if (restante <= 0) break;
    const baixa = Math.min(lote.quantidade, restante);
    await client.query('UPDATE lotes SET quantidade = quantidade - $1 WHERE id = $2', [
      baixa,
      lote.id,
    ]);
    restante -= baixa;
  }

  await client.query(
    'UPDATE produtos SET estoque = estoque - $1, updated_at = NOW() WHERE id = $2',
    [quantidade, produtoId]
  );
}

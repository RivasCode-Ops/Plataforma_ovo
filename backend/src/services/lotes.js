import { pool, withTransaction } from '../db.js';

const SQL_DESCONTO_ATIVO =
  'l.desconto_percentual IS NOT NULL AND l.desconto_percentual > 0 AND l.desconto_ate >= CURRENT_DATE';

export function aplicarDescontoPercentual(precoBase, descontoPercentual) {
  const base = Number(precoBase);
  const pct = Number(descontoPercentual);
  if (!Number.isFinite(base) || !Number.isFinite(pct) || pct <= 0) return base;
  const preco = base * (1 - pct / 100);
  return Math.round(preco * 100) / 100;
}

export function loteComDescontoAtivo(lote) {
  if (!lote?.desconto_percentual || Number(lote.desconto_percentual) <= 0) return false;
  if (!lote.desconto_ate) return false;
  const raw = lote.desconto_ate;
  const ate =
    raw instanceof Date
      ? raw
      : new Date(`${String(raw).slice(0, 10)}T12:00:00`);
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  ate.setHours(12, 0, 0, 0);
  return ate >= hoje;
}

function mapLoteRow(r) {
  const desconto_ativo = loteComDescontoAtivo(r);
  return {
    ...r,
    quantidade: Number(r.quantidade),
    quantidade_inicial: Number(r.quantidade_inicial),
    desconto_percentual:
      r.desconto_percentual != null ? Number(r.desconto_percentual) : null,
    desconto_ativo,
  };
}

/** Preço médio ponderado pelo FIFO quando há desconto em lotes. */
export async function resolverPrecoUnitarioFifo(client, produtoId, quantidade, precoBase) {
  const qtd = Number(quantidade);
  if (!Number.isInteger(qtd) || qtd < 1) {
    throw Object.assign(new Error('Quantidade inválida'), { status: 400 });
  }

  const { rows } = await client.query(
    `SELECT id, quantidade, desconto_percentual, desconto_ate
     FROM lotes
     WHERE produto_id = $1 AND quantidade > 0
     ORDER BY data_validade ASC, id ASC`,
    [produtoId]
  );

  let restante = qtd;
  let soma = 0;

  for (const lote of rows) {
    if (restante <= 0) break;
    const baixa = Math.min(Number(lote.quantidade), restante);
    const unit = loteComDescontoAtivo(lote)
      ? aplicarDescontoPercentual(precoBase, lote.desconto_percentual)
      : Number(precoBase);
    soma += baixa * unit;
    restante -= baixa;
  }

  if (restante > 0) {
    soma += restante * Number(precoBase);
  }

  return Math.round((soma / qtd) * 100) / 100;
}

/** Menor preço possível com promo ativa em algum lote (exibição no cardápio). */
export async function mapaPromocaoLotePorProduto(client = pool) {
  const { rows } = await client.query(
    `SELECT l.produto_id, MAX(l.desconto_percentual) AS desconto_max,
            MAX(l.desconto_ate) AS desconto_ate
     FROM lotes l
     WHERE l.quantidade > 0 AND ${SQL_DESCONTO_ATIVO}
     GROUP BY l.produto_id`
  );
  const map = {};
  for (const r of rows) {
    map[r.produto_id] = {
      desconto_percentual: Number(r.desconto_max),
      desconto_ate: r.desconto_ate,
    };
  }
  return map;
}

export function enriquecerProdutoComPromoLote(produto, promoMap) {
  const promo = promoMap[produto.id];
  if (!promo) {
    return { ...produto, desconto_lote_ativo: false };
  }
  const precoBase = Number(produto.preco);
  const preco_promocional = aplicarDescontoPercentual(
    precoBase,
    promo.desconto_percentual
  );
  return {
    ...produto,
    desconto_lote_ativo: true,
    desconto_lote_percentual: promo.desconto_percentual,
    desconto_lote_ate: promo.desconto_ate,
    preco_promocional,
  };
}

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
    ...mapLoteRow(r),
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
       AND l.data_validade <= CURRENT_DATE + $1::integer
     ORDER BY l.data_validade`,
    [dias]
  );
  return rows.map(mapLoteRow);
}

export async function definirDescontoLote(loteId, { desconto_percentual, desconto_ate }) {
  const pct = Number(desconto_percentual);
  if (!Number.isFinite(pct) || pct <= 0 || pct > 90) {
    throw Object.assign(new Error('desconto_percentual deve ser entre 1 e 90'), {
      status: 400,
    });
  }
  if (!desconto_ate) {
    throw Object.assign(new Error('desconto_ate é obrigatório'), { status: 400 });
  }

  const { rows } = await pool.query(
    `UPDATE lotes
     SET desconto_percentual = $1, desconto_ate = $2::date
     WHERE id = $3 AND quantidade > 0
     RETURNING *`,
    [pct, desconto_ate, loteId]
  );

  if (!rows.length) {
    throw Object.assign(new Error('Lote não encontrado ou sem estoque'), { status: 404 });
  }

  return mapLoteRow(rows[0]);
}

export async function removerDescontoLote(loteId) {
  const { rows } = await pool.query(
    `UPDATE lotes
     SET desconto_percentual = NULL, desconto_ate = NULL
     WHERE id = $1
     RETURNING *`,
    [loteId]
  );

  if (!rows.length) {
    throw Object.assign(new Error('Lote não encontrado'), { status: 404 });
  }

  return mapLoteRow(rows[0]);
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

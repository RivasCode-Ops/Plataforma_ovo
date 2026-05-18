import { pool } from '../db.js';

export async function resumoVendas({ de, ate } = {}) {
  const params = [];
  let filtroData = '';

  if (de) {
    params.push(de);
    filtroData += ` AND p.data_pedido >= $${params.length}::date`;
  }
  if (ate) {
    params.push(ate);
    filtroData += ` AND p.data_pedido < ($${params.length}::date + interval '1 day')`;
  }

  const baseWhere = `WHERE p.status NOT IN ('cancelado')${filtroData}`;

  const totais = await pool.query(
    `SELECT
       COUNT(*)::int AS qtd_pedidos,
       COALESCE(SUM(p.total), 0)::float AS total_vendas,
       COALESCE(AVG(p.total), 0)::float AS ticket_medio
     FROM pedidos p
     ${baseWhere}`,
    params
  );

  const porStatus = await pool.query(
    `SELECT p.status, COUNT(*)::int AS qtd, COALESCE(SUM(p.total), 0)::float AS total
     FROM pedidos p
     WHERE 1=1${filtroData}
     GROUP BY p.status
     ORDER BY qtd DESC`,
    params
  );

  const topProdutos = await pool.query(
    `SELECT pr.nome, SUM(ip.quantidade)::int AS quantidade,
            COALESCE(SUM(ip.subtotal), 0)::float AS total
     FROM itens_pedido ip
     JOIN pedidos p ON p.id = ip.pedido_id
     JOIN produtos pr ON pr.id = ip.produto_id
     WHERE p.status NOT IN ('cancelado')${filtroData}
     GROUP BY pr.id, pr.nome
     ORDER BY quantidade DESC
     LIMIT 10`,
    params
  );

  const ultimos7Dias = await pool.query(
    `SELECT DATE(p.data_pedido) AS dia,
            COUNT(*)::int AS qtd_pedidos,
            COALESCE(SUM(p.total), 0)::float AS total
     FROM pedidos p
     WHERE p.status NOT IN ('cancelado')
       AND p.data_pedido >= CURRENT_DATE - interval '6 days'
     GROUP BY DATE(p.data_pedido)
     ORDER BY dia`,
    []
  );

  const t = totais.rows[0];
  return {
    periodo: { de: de || null, ate: ate || null },
    resumo: {
      qtd_pedidos: t.qtd_pedidos,
      total_vendas: Number(t.total_vendas),
      ticket_medio: Number(t.ticket_medio),
    },
    por_status: porStatus.rows.map((r) => ({
      status: r.status,
      qtd: r.qtd,
      total: Number(r.total),
    })),
    top_produtos: topProdutos.rows.map((r) => ({
      nome: r.nome,
      quantidade: r.quantidade,
      total: Number(r.total),
    })),
    ultimos_7_dias: ultimos7Dias.rows.map((r) => ({
      dia: r.dia,
      qtd_pedidos: r.qtd_pedidos,
      total: Number(r.total),
    })),
  };
}

function csvEscape(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function exportarPedidosCsv({ de, ate } = {}) {
  const params = [];
  let filtro = '';

  if (de) {
    params.push(de);
    filtro += ` AND p.data_pedido >= $${params.length}::date`;
  }
  if (ate) {
    params.push(ate);
    filtro += ` AND p.data_pedido < ($${params.length}::date + interval '1 day')`;
  }

  const { rows } = await pool.query(
    `SELECT p.id, p.data_pedido, p.status, p.total, p.observacao,
            c.nome AS cliente_nome, c.telefone AS cliente_telefone, c.endereco
     FROM pedidos p
     JOIN clientes c ON c.id = p.cliente_id
     WHERE 1=1${filtro}
     ORDER BY p.data_pedido DESC`,
    params
  );

  for (const r of rows) {
    const itens = await pool.query(
      `SELECT ip.quantidade, pr.nome
       FROM itens_pedido ip
       JOIN produtos pr ON pr.id = ip.produto_id
       WHERE ip.pedido_id = $1
       ORDER BY ip.id`,
      [r.id]
    );
    r.itens = itens.rows.map((i) => `${i.quantidade}x ${i.nome}`).join('; ');
  }

  const header = [
    'id',
    'data',
    'status',
    'cliente',
    'telefone',
    'endereco',
    'itens',
    'total',
    'observacao',
  ].join(',');

  const linhas = rows.map((r) =>
    [
      r.id,
      new Date(r.data_pedido).toISOString(),
      r.status,
      r.cliente_nome,
      r.cliente_telefone,
      r.endereco,
      r.itens,
      Number(r.total).toFixed(2),
      r.observacao,
    ]
      .map(csvEscape)
      .join(',')
  );

  return '\uFEFF' + [header, ...linhas].join('\n');
}

export async function pedidosDoDia(dataRef) {
  const dia = dataRef || new Date().toISOString().slice(0, 10);

  const { rows } = await pool.query(
    `SELECT p.id, p.status, p.total, p.observacao, p.data_pedido,
            c.nome AS cliente_nome, c.telefone AS cliente_telefone, c.endereco AS cliente_endereco
     FROM pedidos p
     JOIN clientes c ON c.id = p.cliente_id
     WHERE DATE(p.data_pedido) = $1::date
     ORDER BY p.data_pedido ASC`,
    [dia]
  );

  const pedidos = [];
  for (const p of rows) {
    const itens = await pool.query(
      `SELECT ip.quantidade, pr.nome, pr.unidade, ip.subtotal
       FROM itens_pedido ip
       JOIN produtos pr ON pr.id = ip.produto_id
       WHERE ip.pedido_id = $1`,
      [p.id]
    );
    pedidos.push({
      ...p,
      total: Number(p.total),
      itens: itens.rows.map((i) => ({
        quantidade: i.quantidade,
        nome: i.nome,
        unidade: i.unidade,
        subtotal: Number(i.subtotal),
      })),
    });
  }

  const totalDia = pedidos
    .filter((p) => p.status !== 'cancelado')
    .reduce((acc, p) => acc + p.total, 0);

  return {
    dia,
    qtd: pedidos.length,
    total: totalDia,
    pedidos,
  };
}

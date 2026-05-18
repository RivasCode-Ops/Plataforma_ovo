import { pool } from '../db.js';

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export async function previsaoDemanda({ diasHistorico = 14, diasPrevisao = 7 } = {}) {
  const dias = Math.min(Math.max(Number(diasHistorico) || 14, 7), 90);
  const previsaoDias = Math.min(Math.max(Number(diasPrevisao) || 7, 1), 30);

  const { rows: produtos } = await pool.query(
    `SELECT id, nome, unidade, estoque, ativo FROM produtos WHERE ativo = TRUE ORDER BY nome`
  );

  const { rows: vendas } = await pool.query(
    `SELECT ip.produto_id,
            SUM(ip.quantidade)::int AS quantidade_total,
            COUNT(DISTINCT DATE(p.data_pedido))::int AS dias_com_venda
     FROM itens_pedido ip
     JOIN pedidos p ON p.id = ip.pedido_id
     WHERE p.status NOT IN ('cancelado')
       AND p.data_pedido >= CURRENT_DATE - ($1::int - 1) * interval '1 day'
     GROUP BY ip.produto_id`,
    [dias]
  );

  const { rows: vendasSemanaRecente } = await pool.query(
    `SELECT ip.produto_id, SUM(ip.quantidade)::int AS qtd
     FROM itens_pedido ip
     JOIN pedidos p ON p.id = ip.pedido_id
     WHERE p.status NOT IN ('cancelado')
       AND p.data_pedido >= CURRENT_DATE - interval '6 days'
     GROUP BY ip.produto_id`
  );

  const { rows: vendasSemanaAnterior } = await pool.query(
    `SELECT ip.produto_id, SUM(ip.quantidade)::int AS qtd
     FROM itens_pedido ip
     JOIN pedidos p ON p.id = ip.pedido_id
     WHERE p.status NOT IN ('cancelado')
       AND p.data_pedido >= CURRENT_DATE - interval '13 days'
       AND p.data_pedido < CURRENT_DATE - interval '6 days'
     GROUP BY ip.produto_id`
  );

  const { rows: assinaturas } = await pool.query(
    `SELECT ai.produto_id, SUM(ai.quantidade)::int AS quantidade
     FROM assinaturas a
     JOIN assinatura_itens ai ON ai.assinatura_id = a.id
     WHERE a.status = 'ativa'
       AND a.proxima_entrega >= CURRENT_DATE
       AND a.proxima_entrega <= CURRENT_DATE + ($1::int - 1) * interval '1 day'
     GROUP BY ai.produto_id`,
    [previsaoDias]
  );

  const mapVendas = Object.fromEntries(
    vendas.map((v) => [v.produto_id, { total: Number(v.quantidade_total), dias: Number(v.dias_com_venda) }])
  );
  const mapAss = Object.fromEntries(assinaturas.map((a) => [a.produto_id, Number(a.quantidade)]));
  const mapRecente = Object.fromEntries(vendasSemanaRecente.map((r) => [r.produto_id, Number(r.qtd)]));
  const mapAnterior = Object.fromEntries(vendasSemanaAnterior.map((r) => [r.produto_id, Number(r.qtd)]));

  const itens = produtos.map((p) => {
    const v = mapVendas[p.id];
    const totalHistorico = v?.total ?? 0;
    const mediaDiaria = totalHistorico / dias;
    const previsaoPedidos = Math.ceil(mediaDiaria * previsaoDias);
    const previsaoAssinaturas = mapAss[p.id] ?? 0;
    const demandaTotal = previsaoPedidos + previsaoAssinaturas;
    const estoque = Number(p.estoque);
    const faltaEstoque = Math.max(0, demandaTotal - estoque);

    const qtdRecente = mapRecente[p.id] ?? 0;
    const qtdAnterior = mapAnterior[p.id] ?? 0;
    let tendencia = 'estavel';
    if (qtdAnterior === 0 && qtdRecente > 0) tendencia = 'subindo';
    else if (qtdAnterior > 0) {
      const pct = ((qtdRecente - qtdAnterior) / qtdAnterior) * 100;
      if (pct > 15) tendencia = 'subindo';
      else if (pct < -15) tendencia = 'caindo';
    }

    return {
      produto_id: p.id,
      nome: p.nome,
      unidade: p.unidade,
      estoque,
      historico_dias: dias,
      vendido_periodo: totalHistorico,
      media_diaria: Math.round(mediaDiaria * 100) / 100,
      previsao_pedidos: previsaoPedidos,
      previsao_assinaturas: previsaoAssinaturas,
      demanda_prevista: demandaTotal,
      sugerido_produzir: faltaEstoque,
      tendencia,
      semana_recente: qtdRecente,
      semana_anterior: qtdAnterior,
    };
  });

  itens.sort((a, b) => b.demanda_prevista - a.demanda_prevista);

  const totais = itens.reduce(
    (acc, i) => {
      acc.demanda_prevista += i.demanda_prevista;
      acc.sugerido_produzir += i.sugerido_produzir;
      acc.previsao_assinaturas += i.previsao_assinaturas;
      return acc;
    },
    { demanda_prevista: 0, sugerido_produzir: 0, previsao_assinaturas: 0 }
  );

  return {
    gerado_em: hoje(),
    dias_historico: dias,
    dias_previsao: previsaoDias,
    totais,
    itens,
    nota: 'Estimativa com base na média de vendas do período + assinaturas programadas. Ajuste conforme a realidade da granja.',
  };
}

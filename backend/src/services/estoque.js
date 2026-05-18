import { pool } from '../db.js';
import { emOvos, fatorOvos } from '../utils/unidades.js';

function diaParam(dia) {
  return dia || new Date().toISOString().slice(0, 10);
}

export async function resumoControleDia(dia) {
  const ref = diaParam(dia);

  const { rows: produtos } = await pool.query(
    `SELECT id, nome, unidade, estoque, meta_diaria, ativo
     FROM produtos
     WHERE ativo = TRUE
     ORDER BY nome`
  );

  const { rows: instalado } = await pool.query(
    `SELECT produto_id, COALESCE(SUM(quantidade_inicial), 0)::int AS qtd
     FROM lotes
     WHERE data_entrada = $1::date
     GROUP BY produto_id`,
    [ref]
  );

  const { rows: vendido } = await pool.query(
    `SELECT ip.produto_id, COALESCE(SUM(ip.quantidade), 0)::int AS qtd
     FROM itens_pedido ip
     JOIN pedidos p ON p.id = ip.pedido_id
     WHERE p.status NOT IN ('cancelado')
       AND p.data_pedido::date = $1::date
     GROUP BY ip.produto_id`,
    [ref]
  );

  const { rows: comprometido } = await pool.query(
    `SELECT ip.produto_id, COALESCE(SUM(ip.quantidade), 0)::int AS qtd
     FROM itens_pedido ip
     JOIN pedidos p ON p.id = ip.pedido_id
     WHERE p.status = 'novo'
     GROUP BY ip.produto_id`,
    []
  );

  const mapInst = Object.fromEntries(instalado.map((r) => [r.produto_id, Number(r.qtd)]));
  const mapVend = Object.fromEntries(vendido.map((r) => [r.produto_id, Number(r.qtd)]));
  const mapComp = Object.fromEntries(comprometido.map((r) => [r.produto_id, Number(r.qtd)]));

  const itens = produtos.map((p) => {
    const meta = Number(p.meta_diaria) || 0;
    const instalado_hoje = mapInst[p.id] || 0;
    const vendido_hoje = mapVend[p.id] || 0;
    const reservado = mapComp[p.id] || 0;
    const estoque = Number(p.estoque);
    const disponivel = estoque - reservado;

    const falta_instalar = meta > 0 ? Math.max(0, meta - instalado_hoje) : null;
    const falta_vender = meta > 0 ? Math.max(0, meta - vendido_hoje) : null;

    return {
      produto_id: p.id,
      nome: p.nome,
      unidade: p.unidade,
      meta_diaria: meta,
      instalado_hoje,
      vendido_hoje,
      reservado,
      estoque,
      disponivel,
      falta_instalar,
      falta_vender,
      ovos: {
        fator: fatorOvos(p.unidade),
        meta: emOvos(meta, p.unidade),
        instalado: emOvos(instalado_hoje, p.unidade),
        vendido: emOvos(vendido_hoje, p.unidade),
        estoque: emOvos(estoque, p.unidade),
        disponivel: emOvos(disponivel, p.unidade),
        falta_instalar: falta_instalar != null ? emOvos(falta_instalar, p.unidade) : null,
        falta_vender: falta_vender != null ? emOvos(falta_vender, p.unidade) : null,
        reservado: emOvos(reservado, p.unidade),
      },
    };
  });

  const totais = itens.reduce(
    (acc, i) => {
      acc.meta += i.meta_diaria;
      acc.instalado += i.instalado_hoje;
      acc.vendido += i.vendido_hoje;
      acc.estoque += i.estoque;
      acc.ovos.meta += i.ovos.meta;
      acc.ovos.instalado += i.ovos.instalado;
      acc.ovos.vendido += i.ovos.vendido;
      acc.ovos.estoque += i.ovos.estoque;
      acc.ovos.falta_instalar += i.ovos.falta_instalar || 0;
      acc.ovos.falta_vender += i.ovos.falta_vender || 0;
      return acc;
    },
    {
      meta: 0,
      instalado: 0,
      vendido: 0,
      estoque: 0,
      ovos: { meta: 0, instalado: 0, vendido: 0, estoque: 0, falta_instalar: 0, falta_vender: 0 },
    }
  );

  return { dia: ref, itens, totais };
}

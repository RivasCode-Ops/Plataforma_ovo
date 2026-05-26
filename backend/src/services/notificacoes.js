import { pool } from '../db.js';
import { listarAlertasValidade } from './lotes.js';

function formatarDataBr(valor) {
  if (!valor) return '—';
  const s =
    valor instanceof Date
      ? valor.toISOString().slice(0, 10)
      : String(valor).slice(0, 10);
  const [y, m, d] = s.split('-');
  if (y && m && d) return `${d}/${m}/${y}`;
  return s;
}

function item({ id, tipo, nivel, titulo, mensagem, acao, ref_id }) {
  return { id, tipo, nivel, titulo, mensagem, acao, ref_id: ref_id ?? null };
}

export async function listarNotificacoes({ papel = 'admin' } = {}) {
  const lista = [];

  const [pedidosNovos, estoqueBaixo, lotes, assinaturasHoje, assinaturasAtrasadas] =
    await Promise.all([
      pool.query(
        `SELECT p.id, p.total, c.nome AS cliente_nome
         FROM pedidos p
         JOIN clientes c ON c.id = p.cliente_id
         WHERE p.status = 'novo'
         ORDER BY p.data_pedido DESC
         LIMIT 30`
      ),
      pool.query(
        `SELECT id, nome, estoque, unidade
         FROM produtos
         WHERE ativo = TRUE AND estoque < 10
         ORDER BY estoque ASC, nome`
      ),
      listarAlertasValidade(7),
      pool.query(
        `SELECT a.id, a.proxima_entrega, c.nome AS cliente_nome
         FROM assinaturas a
         JOIN clientes c ON c.id = a.cliente_id
         WHERE a.status = 'ativa' AND a.proxima_entrega = CURRENT_DATE
         ORDER BY c.nome`
      ),
      pool.query(
        `SELECT a.id, a.proxima_entrega, c.nome AS cliente_nome
         FROM assinaturas a
         JOIN clientes c ON c.id = a.cliente_id
         WHERE a.status = 'ativa' AND a.proxima_entrega < CURRENT_DATE
         ORDER BY a.proxima_entrega`
      ),
    ]);

  for (const p of pedidosNovos.rows) {
    lista.push(
      item({
        id: `pedido-novo-${p.id}`,
        tipo: 'pedido_novo',
        nivel: 'media',
        titulo: `Pedido #${p.id} aguardando`,
        mensagem: `${p.cliente_nome} — R$ ${Number(p.total).toFixed(2)}`,
        acao: 'pedidos',
        ref_id: p.id,
      })
    );
  }

  for (const p of estoqueBaixo.rows) {
    lista.push(
      item({
        id: `estoque-${p.id}`,
        tipo: 'estoque_baixo',
        nivel: p.estoque <= 0 ? 'alta' : 'media',
        titulo: p.estoque <= 0 ? 'Sem estoque' : 'Estoque baixo',
        mensagem: `${p.nome}: ${p.estoque} ${p.unidade}`,
        acao: papel === 'admin' ? 'produtos' : 'lotes',
        ref_id: p.id,
      })
    );
  }

  for (const l of lotes) {
    const dias = Number(l.dias_para_vencer);
    const vencido = dias < 0;
    lista.push(
      item({
        id: `lote-${l.id}`,
        tipo: 'lote_validade',
        nivel: vencido ? 'alta' : dias <= 3 ? 'media' : 'baixa',
        titulo: vencido ? 'Lote vencido' : 'Lote vencendo',
        mensagem: `${l.produto_nome} · ${l.quantidade} un. · ${
          vencido ? `vencido há ${Math.abs(dias)}d` : `vence em ${dias}d`
        }`,
        acao: 'lotes',
        ref_id: l.id,
      })
    );
  }

  for (const a of assinaturasAtrasadas.rows) {
    lista.push(
      item({
        id: `assinatura-atraso-${a.id}`,
        tipo: 'assinatura_atrasada',
        nivel: 'alta',
        titulo: 'Assinatura atrasada',
        mensagem: `${a.cliente_nome} — entrega era ${formatarDataBr(a.proxima_entrega)}`,
        acao: 'assinaturas',
        ref_id: a.id,
      })
    );
  }

  for (const a of assinaturasHoje.rows) {
    lista.push(
      item({
        id: `assinatura-hoje-${a.id}`,
        tipo: 'assinatura_hoje',
        nivel: 'media',
        titulo: 'Entrega de assinatura hoje',
        mensagem: a.cliente_nome,
        acao: 'assinaturas',
        ref_id: a.id,
      })
    );
  }

  const ordem = { alta: 0, media: 1, baixa: 2 };
  lista.sort((a, b) => ordem[a.nivel] - ordem[b.nivel]);

  const resumo = {
    total: lista.length,
    alta: lista.filter((n) => n.nivel === 'alta').length,
    media: lista.filter((n) => n.nivel === 'media').length,
    baixa: lista.filter((n) => n.nivel === 'baixa').length,
  };

  return { itens: lista, resumo };
}

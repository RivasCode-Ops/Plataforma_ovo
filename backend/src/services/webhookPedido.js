import { pool } from '../db.js';
import * as pedidosService from './pedidos.js';
import {
  buscarWebhookIdempotencia,
  gravarWebhookIdempotencia,
} from './webhookIdempotencia.js';

const ORIGEM_PADRAO = process.env.SITE_ORIGEM || 'granjauniao.com.br';

async function resolverProdutoId(item) {
  if (item.produto_id) return Number(item.produto_id);

  const nome = (item.produto_nome || item.nome || '').trim();
  if (!nome) {
    throw Object.assign(new Error('Item precisa de produto_id ou produto_nome'), { status: 400 });
  }

  const { rows } = await pool.query(
    `SELECT id, nome FROM produtos
     WHERE ativo = TRUE AND LOWER(nome) LIKE LOWER($1)
     ORDER BY id LIMIT 1`,
    [`%${nome}%`]
  );

  if (rows.length === 0) {
    throw Object.assign(new Error(`Produto não encontrado: ${nome}`), { status: 400 });
  }

  return rows[0].id;
}

export async function processarPedidoDoSite(body, { idempotencyKey } = {}) {
  const chave = idempotencyKey || body?.idempotency_key;
  if (chave) {
    const pedidoId = await buscarWebhookIdempotencia(chave);
    if (pedidoId) {
      const pedido = await pedidosService.obterPedido(pedidoId);
      if (pedido) {
        return {
          pedido_id: pedido.id,
          status: pedido.status,
          total: pedido.total,
          duplicado: true,
        };
      }
    }
  }

  const { cliente, itens, observacao, origem, confirmar } = body || {};

  if (!cliente?.nome || !cliente?.telefone) {
    throw Object.assign(new Error('cliente.nome e cliente.telefone são obrigatórios'), {
      status: 400,
    });
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    throw Object.assign(new Error('itens deve ser um array com ao menos um produto'), {
      status: 400,
    });
  }

  const siteOrigem = origem || ORIGEM_PADRAO;
  const itensResolvidos = [];

  for (const item of itens) {
    const produto_id = await resolverProdutoId(item);
    const quantidade = Number(item.quantidade);
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      throw Object.assign(new Error('quantidade inválida'), { status: 400 });
    }
    itensResolvidos.push({ produto_id, quantidade });
  }

  const obsPrefix = `[Site: ${siteOrigem}]`;
  const obsCompleta = observacao ? `${obsPrefix} ${observacao}` : obsPrefix;

  const resultado = await pedidosService.criarPedido({
    cliente,
    itens: itensResolvidos,
    observacao: obsCompleta,
    confirmar: confirmar === true,
  });

  if (chave && resultado.pedido_id) {
    await gravarWebhookIdempotencia(chave, resultado.pedido_id);
  }

  return resultado;
}

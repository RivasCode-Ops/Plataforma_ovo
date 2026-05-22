import { Router } from 'express';
import { pool } from '../db.js';
import {
  aplicarDescontoPercentual,
  mapaPromocaoLotePorProduto,
} from '../services/lotes.js';

const router = Router();

router.get('/cardapio', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, unidade, preco, estoque
       FROM produtos WHERE ativo = TRUE ORDER BY id`
    );
    const promoMap = await mapaPromocaoLotePorProduto();
    res.json({
      data: {
        origem: process.env.SITE_ORIGEM || 'granjauniao.com.br',
        produtos: rows.map((p) => {
          const preco = Number(p.preco);
          const promo = promoMap[p.id];
          const preco_promocional = promo
            ? aplicarDescontoPercentual(preco, promo.desconto_percentual)
            : null;
          return {
            id: p.id,
            nome: p.nome,
            unidade: p.unidade,
            preco,
            preco_promocional,
            promocao_ate: promo?.desconto_ate ?? null,
            disponivel: p.estoque > 0,
            estoque: p.estoque,
          };
        }),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/cardapio-whatsapp', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT nome, unidade, preco FROM produtos WHERE ativo = TRUE ORDER BY id`
    );

    const linhas = rows.map(
      (p, i) => `${i + 1}. ${p.nome} (${p.unidade}) — R$ ${Number(p.preco).toFixed(2)}`
    );

    const titulo = process.env.SITE_NOME || 'Granja União';
    const texto = [
      `*Cardápio - ${titulo}*`,
      '',
      ...linhas,
      '',
      'Para pedir, responda com:',
      '*PEDIDO* - quantidade + produto',
      'Seu nome e endereço de entrega.',
    ].join('\n');

    res.type('text/plain; charset=utf-8').send(texto);
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/cardapio-whatsapp', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT nome, unidade, preco FROM produtos WHERE ativo = TRUE ORDER BY id`
    );

    const linhas = rows.map(
      (p, i) => `${i + 1}. ${p.nome} (${p.unidade}) — R$ ${Number(p.preco).toFixed(2)}`
    );

    const texto = [
      '*Cardápio - Granja*',
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

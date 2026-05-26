import { Router } from 'express';
import { pool } from '../db.js';
import { verificarWebhook } from '../middleware/webhook.js';
const router = Router();

function chaveEventoStone(req) {
  return (
    req.headers['idempotency-key'] ||
    req.headers['x-idempotency-key'] ||
    req.body?.id ||
    req.body?.data?.id ||
    null
  );
}

/** Webhook Stone — idempotencia (010). Pedidos do site usam webhook_idempotencia (009). */
router.post('/webhook', verificarWebhook, async (req, res, next) => {
  try {
    const chaveRaw = chaveEventoStone(req);
    const chave = chaveRaw ? `stone:${chaveRaw}` : null;

    if (chave) {
      const dup = await pool.query(
        `SELECT resposta FROM idempotencia WHERE chave = $1 AND expira_em > NOW()`,
        [chave]
      );
      if (dup.rows.length > 0) {
        return res.status(200).json(dup.rows[0].resposta);
      }
    }

    const tipo = req.body?.type || req.body?.event || 'stone_webhook';
    const { rows } = await pool.query(
      `INSERT INTO eventos_transacionais (tipo, entidade_id, payload, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id`,
      [
        String(tipo).slice(0, 50),
        req.body?.data?.id ? Number(req.body.data.id) : null,
        JSON.stringify(req.body),
      ]
    );
    const body = { data: { evento_id: rows[0].id, recebido: true } };
    if (chave) {
      await pool.query(
        `INSERT INTO idempotencia (chave, resposta, expira_em)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')
         ON CONFLICT (chave) DO NOTHING`,
        [chave, JSON.stringify(body)]
      );
    }
    res.status(202).json(body);
  } catch (err) {
    if (err.code === '42P01') {
      return res.status(503).json({ erro: 'Módulo de eventos não migrado na base' });
    }
    next(err);
  }
});

router.get('/status', (_req, res) => {
  res.json({
    data: {
      configurado: Boolean(process.env.STONE_TOKEN?.trim()),
      modo: process.env.STONE_TOKEN ? 'producao' : 'desativado',
    },
  });
});

export default router;

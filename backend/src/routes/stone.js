import { Router } from 'express';
import { pool } from '../db.js';
import { verificarWebhook } from '../middleware/webhook.js';

const router = Router();

/** Webhook Stone/Pagar.me — grava evento para reconciliação assíncrona. */
router.post('/webhook', verificarWebhook, async (req, res, next) => {
  try {
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
    res.status(202).json({ data: { evento_id: rows[0].id, recebido: true } });
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

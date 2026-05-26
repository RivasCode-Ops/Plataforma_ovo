import { Router } from 'express';
import { verificarWebhook } from '../middleware/webhook.js';
import { processarPedidoDoSite } from '../services/webhookPedido.js';

const router = Router();

function idempotencyKey(req) {
  return req.headers['idempotency-key'] || req.headers['x-idempotency-key'] || null;
}

router.post('/pedido', verificarWebhook, async (req, res, next) => {
  try {
    const data = await processarPedidoDoSite(req.body, { idempotencyKey: idempotencyKey(req) });
    res.status(data.duplicado ? 200 : 201).json({ data });
  } catch (err) {
    next(err);
  }
});

/** Alias para integrações nomeadas no painel do site */
router.post('/granjauniao', verificarWebhook, async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      origem: req.body?.origem || 'granjauniao.com.br',
    };
    const data = await processarPedidoDoSite(payload, { idempotencyKey: idempotencyKey(req) });
    res.status(data.duplicado ? 200 : 201).json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

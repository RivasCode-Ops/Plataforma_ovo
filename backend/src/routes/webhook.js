import { Router } from 'express';
import { verificarWebhook } from '../middleware/webhook.js';
import { processarPedidoDoSite } from '../services/webhookPedido.js';

const router = Router();

router.post('/pedido', verificarWebhook, async (req, res, next) => {
  try {
    const data = await processarPedidoDoSite(req.body);
    res.status(201).json({ data });
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
    const data = await processarPedidoDoSite(payload);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

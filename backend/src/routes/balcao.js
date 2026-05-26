import { Router } from 'express';
import { registrarVendaBalcao } from '../services/balcao.js';
import { idempotenciaMiddleware } from '../middleware/idempotencia.js';
import { criticoLimiter, clienteLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', criticoLimiter, clienteLimiter, idempotenciaMiddleware, async (req, res, next) => {
  try {
    const { cliente_id, nome_avulso, itens, pagamento, troco } = req.body || {};
    const data = await registrarVendaBalcao({
      cliente_id,
      nome_avulso,
      itens,
      pagamento,
      troco,
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

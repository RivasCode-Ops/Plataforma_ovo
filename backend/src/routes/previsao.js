import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { previsaoDemanda } from '../services/previsao.js';

const router = Router();

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const data = await previsaoDemanda({
      diasHistorico: req.query.dias,
      diasPrevisao: req.query.periodo,
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

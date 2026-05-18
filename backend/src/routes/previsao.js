import { Router } from 'express';
import { previsaoDemanda } from '../services/previsao.js';

const router = Router();

router.get('/', async (req, res, next) => {
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

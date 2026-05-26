import { Router } from 'express';
import * as contasReceber from '../services/contasReceber.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await contasReceber.listarContasAbertas({
      cliente_id: req.query.cliente_id,
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/pagar', async (req, res, next) => {
  try {
    const origem = req.body?.origem || req.query.origem || 'conta';
    const data = await contasReceber.marcarContaPaga({
      id: Number(req.params.id),
      origem,
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

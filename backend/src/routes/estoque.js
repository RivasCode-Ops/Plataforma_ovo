import { Router } from 'express';
import { resumoControleDia } from '../services/estoque.js';

const router = Router();

router.get('/controle-dia', async (req, res, next) => {
  try {
    const dia = req.query.dia;
    const data = await resumoControleDia(dia);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

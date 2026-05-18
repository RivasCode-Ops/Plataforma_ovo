import { Router } from 'express';
import { listarNotificacoes } from '../services/notificacoes.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await listarNotificacoes({ papel: req.usuario?.papel });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

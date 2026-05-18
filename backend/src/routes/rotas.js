import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  atribuirClienteRota,
  atualizarRota,
  clientesPorRota,
  criarRota,
  listarRotas,
} from '../services/rotas.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const apenasAtivas = req.query.ativas === '1';
    const data = await listarRotas({ apenasAtivas });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const data = await criarRota(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const data = await atualizarRota(Number(req.params.id), req.body);
    if (!data) return res.status(404).json({ erro: 'Rota não encontrada' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/clientes', async (req, res, next) => {
  try {
    const data = await clientesPorRota(Number(req.params.id));
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch('/cliente/:clienteId', async (req, res, next) => {
  try {
    const { rota_id } = req.body || {};
    const data = await atribuirClienteRota(
      Number(req.params.clienteId),
      rota_id != null && rota_id !== '' ? Number(rota_id) : null
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

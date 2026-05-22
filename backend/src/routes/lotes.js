import { Router } from 'express';
import * as lotes from '../services/lotes.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await lotes.listarLotes({
      produto_id: req.query.produto_id,
      apenas_com_estoque: req.query.com_estoque === '1',
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/alertas', async (req, res, next) => {
  try {
    const dias = Number(req.query.dias) || 7;
    const data = await lotes.listarAlertasValidade(dias);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await lotes.registrarLote(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/desconto', async (req, res, next) => {
  try {
    const data = await lotes.definirDescontoLote(Number(req.params.id), req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/desconto', async (req, res, next) => {
  try {
    const data = await lotes.removerDescontoLote(Number(req.params.id));
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

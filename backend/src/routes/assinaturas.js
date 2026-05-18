import { Router } from 'express';
import * as assinaturas from '../services/assinaturas.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await assinaturas.listarAssinaturas({
      status: req.query.status,
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/entregas-semana', async (_req, res, next) => {
  try {
    const data = await assinaturas.listarEntregasDaSemana();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await assinaturas.criarAssinatura(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ erro: 'status é obrigatório' });
    const data = await assinaturas.atualizarStatusAssinatura(req.params.id, status);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/gerar-pedido', async (req, res, next) => {
  try {
    const data = await assinaturas.gerarPedidoDaAssinatura(req.params.id);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

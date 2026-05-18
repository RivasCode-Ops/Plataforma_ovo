import { Router } from 'express';
import * as pedidosService from '../services/pedidos.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await pedidosService.listarPedidos({
      status: req.query.status,
      limite: Number(req.query.limite) || 50,
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pedido = await pedidosService.obterPedido(req.params.id);
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });
    res.json({ data: pedido });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { cliente, itens, observacao, confirmar } = req.body;
    const data = await pedidosService.criarPedido({
      cliente,
      itens,
      observacao,
      confirmar: confirmar !== false,
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ erro: 'Campo status é obrigatório' });
    const data = await pedidosService.atualizarStatusPedido(req.params.id, status);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

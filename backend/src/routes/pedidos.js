import { Router } from 'express';
import * as pedidosService from '../services/pedidos.js';
import { gerarPixCobranca } from '../integrations/pix.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await pedidosService.listarPedidos({
      status: req.query.status,
      aguardando_pagamento: req.query.aguardando_pagamento === '1',
      limite: Number(req.query.limite) || 50,
    });
    res.json({ data });
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

router.get('/:id/pix', async (req, res, next) => {
  try {
    const pedido = await pedidosService.obterPedido(req.params.id);
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });
    if (pedido.status === 'cancelado') {
      return res.status(400).json({ erro: 'Pedido cancelado não gera PIX' });
    }
    const pix = await gerarPixCobranca({
      valor: pedido.total,
      pedidoId: pedido.id,
      clienteNome: pedido.cliente_nome,
    });
    if (!pix.ok) return res.status(503).json({ erro: pix.erro });
    res.json({ data: pix });
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

router.patch('/:id/pagar', async (req, res, next) => {
  try {
    const { forma_pagamento } = req.body || {};
    const data = await pedidosService.marcarPedidoPago(req.params.id, { forma_pagamento });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

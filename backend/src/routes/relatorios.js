import { Router } from 'express';
import { exportarPedidosCsv, pedidosDoDia, resumoVendas } from '../services/relatorios.js';

const router = Router();

router.get('/resumo', async (req, res, next) => {
  try {
    const { de, ate } = req.query;
    const data = await resumoVendas({ de, ate });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/export.csv', async (req, res, next) => {
  try {
    const { de, ate } = req.query;
    const csv = await exportarPedidosCsv({ de, ate });
    const nome = `pedidos_${de || 'inicio'}_${ate || 'fim'}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nome}"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

router.get('/pedidos-dia', async (req, res, next) => {
  try {
    const data = await pedidosDoDia(req.query.dia);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

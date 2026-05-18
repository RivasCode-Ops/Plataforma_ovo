import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, unidade, preco, estoque, ativo
       FROM produtos WHERE ativo = TRUE ORDER BY nome`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM produtos WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;

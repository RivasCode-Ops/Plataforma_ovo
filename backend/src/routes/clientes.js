import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const limite = Math.min(Number(req.query.limite) || 50, 100);

    let rows;
    if (q) {
      const pattern = `%${q}%`;
      ({ rows } = await pool.query(
        `SELECT c.id, c.nome, c.telefone, c.endereco, c.created_at,
                COUNT(p.id)::int AS total_pedidos,
                COALESCE(SUM(CASE WHEN p.status NOT IN ('cancelado') THEN p.total ELSE 0 END), 0)::float AS total_gasto
         FROM clientes c
         LEFT JOIN pedidos p ON p.cliente_id = c.id
         WHERE LOWER(c.nome) LIKE LOWER($1) OR c.telefone LIKE $1
         GROUP BY c.id
         ORDER BY c.nome
         LIMIT $2`,
        [pattern, limite]
      ));
    } else {
      ({ rows } = await pool.query(
        `SELECT c.id, c.nome, c.telefone, c.endereco, c.created_at,
                COUNT(p.id)::int AS total_pedidos,
                COALESCE(SUM(CASE WHEN p.status NOT IN ('cancelado') THEN p.total ELSE 0 END), 0)::float AS total_gasto
         FROM clientes c
         LEFT JOIN pedidos p ON p.cliente_id = c.id
         GROUP BY c.id
         ORDER BY c.nome
         LIMIT $1`,
        [limite]
      ));
    }

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cliente = await pool.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
    if (cliente.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    const pedidos = await pool.query(
      `SELECT id, status, total, data_pedido, observacao
       FROM pedidos WHERE cliente_id = $1
       ORDER BY data_pedido DESC LIMIT 20`,
      [req.params.id]
    );

    res.json({
      data: { ...cliente.rows[0], pedidos: pedidos.rows },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

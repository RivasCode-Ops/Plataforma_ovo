import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const gerenciar = req.query.gerenciar === '1';
    const { rows } = await pool.query(
      gerenciar
        ? `SELECT id, nome, unidade, preco, estoque, ativo, created_at, updated_at
           FROM produtos ORDER BY ativo DESC, nome`
        : `SELECT id, nome, unidade, preco, estoque, ativo
           FROM produtos WHERE ativo = TRUE ORDER BY nome`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { nome, unidade, preco, estoque } = req.body || {};
    if (!nome?.trim() || !unidade?.trim() || preco == null) {
      return res.status(400).json({ erro: 'nome, unidade e preco são obrigatórios' });
    }
    const { rows } = await pool.query(
      `INSERT INTO produtos (nome, unidade, preco, estoque)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome.trim(), unidade.trim(), Number(preco), Number(estoque) || 0]
    );
    res.status(201).json({ data: rows[0] });
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

router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { nome, unidade, preco, estoque, ativo } = req.body || {};
    const campos = [];
    const vals = [];
    let i = 1;

    if (nome !== undefined) {
      campos.push(`nome = $${i++}`);
      vals.push(nome.trim());
    }
    if (unidade !== undefined) {
      campos.push(`unidade = $${i++}`);
      vals.push(unidade.trim());
    }
    if (preco !== undefined) {
      campos.push(`preco = $${i++}`);
      vals.push(Number(preco));
    }
    if (estoque !== undefined) {
      campos.push(`estoque = $${i++}`);
      vals.push(Number(estoque));
    }
    if (ativo !== undefined) {
      campos.push(`ativo = $${i++}`);
      vals.push(Boolean(ativo));
    }

    if (campos.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    campos.push('updated_at = NOW()');
    vals.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE produtos SET ${campos.join(', ')} WHERE id = $${i} RETURNING *`,
      vals
    );

    if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;

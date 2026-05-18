import { pool } from '../db.js';

export async function listarRotas({ apenasAtivas = false } = {}) {
  const where = apenasAtivas ? 'WHERE ativo = TRUE' : '';
  const { rows } = await pool.query(
    `SELECT r.*,
            COUNT(c.id)::int AS qtd_clientes
     FROM rotas r
     LEFT JOIN clientes c ON c.rota_id = r.id
     ${where}
     GROUP BY r.id
     ORDER BY r.ordem, r.nome`
  );
  return rows;
}

export async function criarRota({ nome, ordem }) {
  if (!nome?.trim()) {
    throw Object.assign(new Error('Nome da rota é obrigatório'), { status: 400 });
  }
  const { rows } = await pool.query(
    `INSERT INTO rotas (nome, ordem) VALUES ($1, $2) RETURNING *`,
    [nome.trim(), Number(ordem) || 0]
  );
  return rows[0];
}

export async function atualizarRota(id, { nome, ordem, ativo }) {
  const campos = [];
  const vals = [];
  let i = 1;
  if (nome !== undefined) {
    campos.push(`nome = $${i++}`);
    vals.push(nome.trim());
  }
  if (ordem !== undefined) {
    campos.push(`ordem = $${i++}`);
    vals.push(Number(ordem));
  }
  if (ativo !== undefined) {
    campos.push(`ativo = $${i++}`);
    vals.push(Boolean(ativo));
  }
  if (!campos.length) return null;
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE rotas SET ${campos.join(', ')} WHERE id = $${i} RETURNING *`,
    vals
  );
  return rows[0] || null;
}

export async function atribuirClienteRota(clienteId, rotaId) {
  const { rows } = await pool.query(
    `UPDATE clientes SET rota_id = $1 WHERE id = $2 RETURNING id, nome, rota_id`,
    [rotaId || null, clienteId]
  );
  if (!rows.length) throw Object.assign(new Error('Cliente não encontrado'), { status: 404 });
  return rows[0];
}

export async function clientesPorRota(rotaId) {
  const { rows } = await pool.query(
    `SELECT id, nome, telefone, endereco FROM clientes
     WHERE rota_id = $1 ORDER BY nome`,
    [rotaId]
  );
  return rows;
}

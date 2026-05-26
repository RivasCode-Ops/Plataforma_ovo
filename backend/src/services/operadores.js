import { pool } from '../db.js';
import { hashSenha, verificarSenha } from '../utils/senha.js';
import { resolveAdminPassword } from '../config/productionGuard.js';

export async function seedOperadorAdmin() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM operadores');
  if (rows[0].n > 0) return;

  const login = process.env.ADMIN_USER || 'admin';
  const senha = resolveAdminPassword();
  const senha_hash = await hashSenha(senha);

  await pool.query(
    `INSERT INTO operadores (nome, login, senha_hash, papel)
     VALUES ($1, $2, $3, 'admin')`,
    ['Administrador', login, senha_hash]
  );
  console.log('[auth] Operador admin inicial criado');
}

/** Usuario demo para testes (login demo / senha demo123) */
export async function ensureOperadorDemo() {
  const login = 'demo';
  const senha_hash = await hashSenha('demo123');
  await pool.query(
    `INSERT INTO operadores (nome, login, senha_hash, papel, ativo)
     VALUES ('Usuario Demo', $1, $2, 'operador', true)
     ON CONFLICT (login) DO UPDATE SET
       senha_hash = EXCLUDED.senha_hash,
       ativo = true`,
    [login, senha_hash]
  );
}

export async function autenticar(login, senha) {
  const { rows } = await pool.query(
    `SELECT id, nome, login, senha_hash, papel, ativo
     FROM operadores WHERE login = $1`,
    [login]
  );
  if (rows.length === 0) return null;
  const op = rows[0];
  if (!op.ativo) return null;
  const ok = await verificarSenha(senha, op.senha_hash);
  if (!ok) return null;
  return { id: op.id, nome: op.nome, login: op.login, papel: op.papel };
}

export async function listarOperadores() {
  const { rows } = await pool.query(
    `SELECT id, nome, login, papel, ativo, created_at
     FROM operadores ORDER BY ativo DESC, nome`
  );
  return rows;
}

export async function criarOperador({ nome, login, senha, papel }) {
  const senha_hash = await hashSenha(senha);
  const { rows } = await pool.query(
    `INSERT INTO operadores (nome, login, senha_hash, papel)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome, login, papel, ativo, created_at`,
    [nome.trim(), login.trim().toLowerCase(), senha_hash, papel]
  );
  return rows[0];
}

export async function atualizarOperador(id, { nome, papel, ativo }) {
  const campos = [];
  const vals = [];
  let i = 1;

  if (nome !== undefined) {
    campos.push(`nome = $${i++}`);
    vals.push(nome.trim());
  }
  if (papel !== undefined) {
    campos.push(`papel = $${i++}`);
    vals.push(papel);
  }
  if (ativo !== undefined) {
    campos.push(`ativo = $${i++}`);
    vals.push(Boolean(ativo));
  }

  if (campos.length === 0) return null;

  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE operadores SET ${campos.join(', ')} WHERE id = $${i}
     RETURNING id, nome, login, papel, ativo, created_at`,
    vals
  );
  return rows[0] || null;
}

export async function redefinirSenha(id, senha) {
  const senha_hash = await hashSenha(senha);
  const { rows } = await pool.query(
    `UPDATE operadores SET senha_hash = $1 WHERE id = $2 RETURNING id`,
    [senha_hash, id]
  );
  return rows.length > 0;
}

export async function obterPorLogin(login) {
  const { rows } = await pool.query(
    `SELECT id, nome, login, papel, ativo FROM operadores WHERE login = $1`,
    [login]
  );
  return rows[0] || null;
}

import { pool } from '../db.js';

/** Idempotência de webhooks (tabela webhook_idempotencia — migration 009). */
export async function buscarWebhookIdempotencia(chave) {
  if (!chave?.trim()) return null;
  try {
    const { rows } = await pool.query(
      'SELECT pedido_id FROM webhook_idempotencia WHERE chave = $1',
      [chave.trim()]
    );
    return rows[0]?.pedido_id ?? null;
  } catch (err) {
    if (err.code === '42P01') return null;
    throw err;
  }
}

export async function gravarWebhookIdempotencia(chave, referencia) {
  if (!chave?.trim()) return;
  try {
    await pool.query(
      `INSERT INTO webhook_idempotencia (chave, pedido_id) VALUES ($1, $2)
       ON CONFLICT (chave) DO NOTHING`,
      [chave.trim(), referencia]
    );
  } catch (err) {
    if (err.code === '42P01') return;
    throw err;
  }
}

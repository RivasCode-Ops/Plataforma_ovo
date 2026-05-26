import { pool } from '../db.js';

const MAX_TENTATIVAS = 5;

/** Processa eventos pendentes (Stone / pagamentos externos). */
export async function processarEventosPendentes({ limite = 20 } = {}) {
  const { rows } = await pool.query(
    `SELECT id, tipo, payload, tentativas
     FROM eventos_transacionais
     WHERE status = 'pending' AND tentativas < $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [MAX_TENTATIVAS, limite]
  );

  let ok = 0;
  let falhas = 0;

  for (const ev of rows) {
    try {
      const payload = typeof ev.payload === 'string' ? JSON.parse(ev.payload) : ev.payload;
      // Extensível: mapear tipo → ação (ex.: pedido pago)
      if (payload?.pedido_id) {
        await pool.query(
          `UPDATE pedidos SET status = 'pago', updated_at = NOW()
           WHERE id = $1 AND status IN ('novo', 'confirmado')`,
          [payload.pedido_id]
        );
      }
      await pool.query(
        `UPDATE eventos_transacionais SET status = 'processed', tentativas = tentativas + 1 WHERE id = $1`,
        [ev.id]
      );
      ok += 1;
    } catch (err) {
      await pool.query(
        `UPDATE eventos_transacionais
         SET tentativas = tentativas + 1, erro = $2,
             status = CASE WHEN tentativas + 1 >= $3 THEN 'failed' ELSE 'pending' END
         WHERE id = $1`,
        [ev.id, err.message?.slice(0, 500), MAX_TENTATIVAS]
      );
      falhas += 1;
    }
  }

  return { processados: ok, falhas, total: rows.length };
}

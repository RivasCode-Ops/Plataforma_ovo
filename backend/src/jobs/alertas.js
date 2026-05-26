import { pool } from '../db.js';
import { listarNotificacoes } from '../services/notificacoes.js';

/** Remove chaves de idempotência expiradas. */
export async function limparIdempotenciaExpirada() {
  const { rowCount } = await pool
    .query(`DELETE FROM idempotencia WHERE expira_em < NOW()`)
    .catch((err) => {
      if (err.code === '42P01') return { rowCount: 0 };
      throw err;
    });
  return rowCount ?? 0;
}

/** Snapshot de alertas para jobs / monitoramento. */
export async function resumoAlertas(papel = 'admin') {
  const { resumo } = await listarNotificacoes({ papel });
  return resumo;
}

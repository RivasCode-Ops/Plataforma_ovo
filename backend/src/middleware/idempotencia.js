import crypto from 'crypto';
import { pool } from '../db.js';

const TTL_HOURS = 24;

/** Evita processar duas vezes a mesma requisição (header Idempotency-Key). */
export function idempotenciaMiddleware(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const chave =
    req.headers['idempotency-key'] ||
    req.headers['x-idempotency-key'] ||
    null;

  if (!chave?.trim()) {
    return next();
  }

  const key = chave.trim().slice(0, 255);

  (async () => {
    try {
      const { rows } = await pool.query(
        `SELECT resposta FROM idempotencia
         WHERE chave = $1 AND expira_em > NOW()`,
        [key]
      );
      if (rows.length > 0) {
        const body = rows[0].resposta;
        return res.status(200).json(body);
      }

      const originalJson = res.json.bind(res);
      res.json = function gravarEEnviar(payload) {
        pool
          .query(
            `INSERT INTO idempotencia (chave, resposta, expira_em)
             VALUES ($1, $2, NOW() + ($3::int || ' hours')::interval)
             ON CONFLICT (chave) DO NOTHING`,
            [key, JSON.stringify(payload), String(TTL_HOURS)]
          )
          .catch((err) => {
            if (err.code !== '42P01') console.error('[idempotencia]', err.message);
          });
        return originalJson(payload);
      };

      req.idempotencyKey = key;
      next();
    } catch (err) {
      if (err.code === '42P01') return next();
      console.error('[idempotencia]', err.message);
      next();
    }
  })();
}

export function novaChaveIdempotencia() {
  return crypto.randomUUID();
}

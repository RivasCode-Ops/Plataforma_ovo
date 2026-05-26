import { pool } from '../db.js';

const TTL_HOURS = 24;
const PLACEHOLDER = JSON.stringify({ pending: true });

export async function idempotenciaMiddleware(req, res, next) {
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

  try {
    const existente = await pool.query(
      `SELECT resposta FROM idempotencia
       WHERE chave = $1 AND expira_em > NOW()`,
      [key]
    );

    if (existente.rows.length > 0) {
      const body = existente.rows[0].resposta;
      if (body && typeof body === 'object' && !body.pending) {
        return res.status(200).json(body);
      }
      if (typeof body === 'string' && !body.includes('"pending"')) {
        return res.status(200).json(JSON.parse(body));
      }
    }

    const claim = await pool.query(
      `INSERT INTO idempotencia (chave, resposta, expira_em)
       VALUES ($1, $2, NOW() + ($3::int || ' hours')::interval)
       ON CONFLICT (chave) DO NOTHING
       RETURNING chave`,
      [key, PLACEHOLDER, String(TTL_HOURS)]
    );

    if (claim.rowCount === 0) {
      for (let i = 0; i < 20; i++) {
        const { rows } = await pool.query(
          `SELECT resposta FROM idempotencia WHERE chave = $1`,
          [key]
        );
        const body = rows[0]?.resposta;
        if (body && !body.pending) {
          return res.status(200).json(body);
        }
        await new Promise((r) => setTimeout(r, 50));
      }
      return res.status(409).json({
        erro: 'Requisição com esta chave ainda está em processamento. Tente novamente.',
      });
    }

    const originalJson = res.json.bind(res);
    res.json = function gravarResposta(payload) {
      pool
        .query(`UPDATE idempotencia SET resposta = $2 WHERE chave = $1`, [
          key,
          JSON.stringify(payload),
        ])
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
}

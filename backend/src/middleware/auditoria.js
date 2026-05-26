import { pool } from '../db.js';

const ROTAS_IGNORADAS = new Set(['/health', '/api/health']);

function entidadeDaUrl(url) {
  const partes = url.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  return partes[0] || 'api';
}

/** Registra mutações (POST/PATCH/PUT/DELETE) em background. */
export function auditoriaMiddleware(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const path = req.originalUrl?.split('?')[0] || req.path;
  if (ROTAS_IGNORADAS.has(path)) {
    return next();
  }

  const originalJson = res.json.bind(res);
  res.json = function comAuditoria(payload) {
    const status = res.statusCode;
    if (status < 400) {
      const rawIp = req.ip || req.socket?.remoteAddress || '';
      const ip =
        rawIp.startsWith('::ffff:') ? rawIp.slice(7) : rawIp === '::1' ? '127.0.0.1' : rawIp;
      const userAgent = req.headers['user-agent'];
      const acao = `${req.method} ${path}`;
      const entidade = entidadeDaUrl(path);
      const entidadeId = Number(req.params?.id) || null;

      pool
        .query(
          `INSERT INTO auditoria (usuario_login, acao, entidade, entidade_id, ip, user_agent, dados_novos)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            req.usuario?.login ?? null,
            acao,
            entidade,
            Number.isFinite(entidadeId) ? entidadeId : null,
            ip || null,
            userAgent ?? null,
            JSON.stringify(payload),
          ]
        )
        .catch((err) => {
          if (err.code !== '42P01') console.error('[auditoria]', err.message);
        });
    }
    return originalJson(payload);
  };

  next();
}

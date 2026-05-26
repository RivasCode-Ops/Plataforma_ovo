const WINDOW_MS = 15 * 60 * 1000;
const MAX_TENTATIVAS = 12;
const hits = new Map();

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.ip || 'unknown';
}

/** Limita tentativas de login por IP + usuário (anti brute-force). */
export function rateLimitLogin(req, res, next) {
  const usuario = String(req.body?.usuario || '').trim().toLowerCase() || '_';
  const chave = `${clientIp(req)}:${usuario}`;
  const now = Date.now();
  let bucket = hits.get(chave);
  if (!bucket || now - bucket.start > WINDOW_MS) {
    bucket = { start: now, count: 0 };
    hits.set(chave, bucket);
  }
  bucket.count += 1;
  if (bucket.count > MAX_TENTATIVAS) {
    return res.status(429).json({
      erro: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
    });
  }
  next();
}

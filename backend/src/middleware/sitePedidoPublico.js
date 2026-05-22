/** Token publicável (build do site) + rate limit por IP — não substitui WEBHOOK_SECRET. */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PEDIDOS = 15;
const hits = new Map();

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.ip || 'unknown';
}

export function verificarSitePedidoToken(req, res, next) {
  const expected = process.env.SITE_PEDIDO_TOKEN;
  if (!expected?.trim()) {
    return res.status(503).json({
      erro: 'Pedidos pelo site temporariamente indisponíveis',
    });
  }
  const token =
    req.headers['x-site-pedido-token'] ||
    req.body?.site_token ||
    '';
  if (token !== expected) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }
  next();
}

export function rateLimitPedidoSite(req, res, next) {
  const ip = clientIp(req);
  const now = Date.now();
  let bucket = hits.get(ip);
  if (!bucket || now - bucket.start > WINDOW_MS) {
    bucket = { start: now, count: 0 };
    hits.set(ip, bucket);
  }
  bucket.count += 1;
  if (bucket.count > MAX_PEDIDOS) {
    return res.status(429).json({
      erro: 'Muitos pedidos enviados. Tente novamente em alguns minutos.',
    });
  }
  next();
}

/** Honeypot anti-bot: campo oculto "website" preenchido = descarta silenciosamente. */
export function honeypotSitePedido(req, res, next) {
  if (req.body?.website) {
    return res.status(201).json({
      data: { pedido_id: 0, mensagem: 'Pedido recebido. Obrigado!' },
    });
  }
  next();
}

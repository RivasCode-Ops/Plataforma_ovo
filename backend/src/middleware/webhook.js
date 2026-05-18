export function verificarWebhook(req, res, next) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    return res.status(503).json({
      erro: 'Webhook não configurado no servidor (WEBHOOK_SECRET)',
    });
  }

  const header = req.headers['x-webhook-secret'] || req.headers['x-plataforma-ovo-secret'];
  const query = req.query.secret;

  if (header === secret || query === secret) {
    return next();
  }

  return res.status(401).json({ erro: 'Webhook não autorizado' });
}

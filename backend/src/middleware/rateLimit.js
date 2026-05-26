import rateLimit from 'express-rate-limit';

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const maxOperador = Number(process.env.RATE_LIMIT_MAX) || 30;
const maxCritico = Number(process.env.RATE_LIMIT_CRITICO_MAX) || 10;

function keyUsuarioOuIp(req) {
  return req.usuario?.login || req.ip || 'unknown';
}

export const operadorLimiter = rateLimit({
  windowMs,
  max: maxOperador,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyUsuarioOuIp,
  message: {
    erro: 'Muitas requisições. Aguarde alguns segundos.',
    limite: `${maxOperador} por minuto`,
  },
});

export const criticoLimiter = rateLimit({
  windowMs,
  max: maxCritico,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyUsuarioOuIp,
  message: {
    erro: 'Limite de operações críticas atingido. Tente novamente em instantes.',
    limite: `${maxCritico} por minuto`,
  },
});

export const clienteLimiter = rateLimit({
  windowMs,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.body?.cliente_id || req.body?.cliente?.id || req.ip),
  skip: (req) => !req.body?.cliente_id && !req.body?.cliente?.id,
  message: { erro: 'Muitas operações para este cliente. Aguarde.' },
});

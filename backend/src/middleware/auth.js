import crypto from 'crypto';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  return process.env.JWT_SECRET || 'dev-secret-altere-em-producao';
}

export function criarToken(usuario) {
  const payload = `${usuario}:${Date.now()}`;
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

export function verificarToken(token) {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const dot = decoded.lastIndexOf('.');
    if (dot === -1) return null;
    const payload = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex');
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const [usuario, ts] = payload.split(':');
    if (Date.now() - Number(ts) > TOKEN_TTL_MS) return null;
    return usuario;
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const usuario = verificarToken(token);
  if (!usuario) {
    return res.status(401).json({ erro: 'Não autorizado. Faça login novamente.' });
  }
  req.usuario = usuario;
  next();
}

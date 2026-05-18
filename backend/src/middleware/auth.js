import crypto from 'crypto';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  return process.env.JWT_SECRET || 'dev-secret-altere-em-producao';
}

export function criarToken({ login, papel }) {
  const payload = `${login}:${papel}:${Date.now()}`;
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

    const parts = payload.split(':');
    let login;
    let papel;
    let ts;

    if (parts.length >= 3) {
      ts = parts[parts.length - 1];
      papel = parts[parts.length - 2];
      login = parts.slice(0, -2).join(':');
    } else if (parts.length === 2) {
      [login, ts] = parts;
      papel = 'admin';
    } else {
      return null;
    }

    if (Date.now() - Number(ts) > TOKEN_TTL_MS) return null;
    if (!['admin', 'operador'].includes(papel)) return null;
    return { login, papel };
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const sessao = verificarToken(token);
  if (!sessao) {
    return res.status(401).json({ erro: 'Não autorizado. Faça login novamente.' });
  }
  req.usuario = sessao;
  next();
}

export function requireAdmin(req, res, next) {
  if (req.usuario?.papel !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito ao administrador.' });
  }
  next();
}

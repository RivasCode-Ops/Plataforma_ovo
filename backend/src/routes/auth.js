import { Router } from 'express';
import crypto from 'crypto';
import { criarToken, requireAuth } from '../middleware/auth.js';

const router = Router();

function credenciaisValidas(usuario, senha) {
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'plataforma123';
  const userOk = crypto.timingSafeEqual(
    Buffer.from(usuario || ''),
    Buffer.from(adminUser)
  );
  const passOk = crypto.timingSafeEqual(
    Buffer.from(senha || ''),
    Buffer.from(adminPass)
  );
  return userOk && passOk;
}

router.post('/login', (req, res) => {
  const { usuario, senha } = req.body || {};
  if (!usuario || !senha) {
    return res.status(400).json({ erro: 'Usuário e senha são obrigatórios' });
  }

  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'plataforma123';

  if (usuario.length !== adminUser.length || senha.length !== adminPass.length) {
    return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
  }

  if (!credenciaisValidas(usuario, senha)) {
    return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
  }

  const token = criarToken(usuario);
  res.json({
    data: {
      token,
      usuario,
      expira_em_dias: 7,
    },
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ data: { usuario: req.usuario } });
});

router.post('/logout', (_req, res) => {
  res.json({ data: { ok: true } });
});

export default router;

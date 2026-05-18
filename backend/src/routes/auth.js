import { Router } from 'express';
import { criarToken, requireAuth } from '../middleware/auth.js';
import { autenticar, obterPorLogin } from '../services/operadores.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { usuario, senha } = req.body || {};
    if (!usuario || !senha) {
      return res.status(400).json({ erro: 'Usuário e senha são obrigatórios' });
    }

    const login = String(usuario).trim().toLowerCase();
    const op = await autenticar(login, senha);
    if (!op) {
      return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
    }

    const token = criarToken({ login: op.login, papel: op.papel });
    res.json({
      data: {
        token,
        usuario: { login: op.login, nome: op.nome, papel: op.papel },
        expira_em_dias: 7,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const op = await obterPorLogin(req.usuario.login);
    if (!op || !op.ativo) {
      return res.status(401).json({ erro: 'Conta inativa ou inexistente.' });
    }
    res.json({
      data: {
        usuario: { login: op.login, nome: op.nome, papel: op.papel },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  res.json({ data: { ok: true } });
});

export default router;

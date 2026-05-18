import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  atualizarOperador,
  criarOperador,
  listarOperadores,
  redefinirSenha,
} from '../services/operadores.js';

const router = Router();

router.use(requireAdmin);

router.get('/', async (_req, res, next) => {
  try {
    const rows = await listarOperadores();
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { nome, login, senha, papel } = req.body || {};
    if (!nome?.trim() || !login?.trim() || !senha || senha.length < 6) {
      return res.status(400).json({
        erro: 'nome, login e senha (mín. 6 caracteres) são obrigatórios',
      });
    }
    const p = papel === 'admin' ? 'admin' : 'operador';
    const op = await criarOperador({
      nome,
      login: login.trim().toLowerCase(),
      senha,
      papel: p,
    });
    res.status(201).json({ data: op });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Login já em uso' });
    }
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { nome, papel, ativo } = req.body || {};
    if (papel !== undefined && !['admin', 'operador'].includes(papel)) {
      return res.status(400).json({ erro: 'papel inválido' });
    }
    const op = await atualizarOperador(Number(req.params.id), { nome, papel, ativo });
    if (!op) return res.status(404).json({ erro: 'Operador não encontrado' });
    res.json({ data: op });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/senha', async (req, res, next) => {
  try {
    const { senha } = req.body || {};
    if (!senha || senha.length < 6) {
      return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
    }
    const ok = await redefinirSenha(Number(req.params.id), senha);
    if (!ok) return res.status(404).json({ erro: 'Operador não encontrado' });
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;

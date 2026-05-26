import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import * as turno from '../services/turnoEntrega.js';

const router = Router();

function ctxUsuario(req) {
  return { login: req.usuario.login, papel: req.usuario.papel };
}

/** Turnos em operação: admin vê todos; operador só os que ele abriu. */
router.get('/abertos', async (req, res, next) => {
  try {
    const opts = { data_ref: req.query.data_ref };
    if (req.usuario.papel !== 'admin') {
      opts.aberto_por_login = req.usuario.login;
    }
    res.json({ data: await turno.listarTurnosAbertos(opts) });
  } catch (err) {
    next(err);
  }
});

router.get('/atual', async (req, res, next) => {
  try {
    const data = await turno.obterTurnoPorId(req.query.turno_id, ctxUsuario(req));
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    res.json({ data: await turno.listarTurnosAdmin({ status: req.query.status }) });
  } catch (err) {
    next(err);
  }
});

router.post('/iniciar', async (req, res, next) => {
  try {
    const data = await turno.iniciarTurno(req.usuario.login, req.body || {}, {
      papel: req.usuario.papel,
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json({ data: await turno.detalheTurno(Number(req.params.id), ctxUsuario(req)) });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/encerrar', async (req, res, next) => {
  try {
    res.json({ data: await turno.encerrarTurno(Number(req.params.id), ctxUsuario(req)) });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/paradas/:paradaId/concluir', async (req, res, next) => {
  try {
    const data = await turno.concluirParada(
      Number(req.params.id),
      Number(req.params.paradaId),
      req.body || {},
      ctxUsuario(req)
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/paradas/:paradaId/nao-entregue', async (req, res, next) => {
  try {
    const data = await turno.paradaNaoEntregue(
      Number(req.params.id),
      Number(req.params.paradaId),
      req.body || {},
      ctxUsuario(req)
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/vendas-avulsas', async (req, res, next) => {
  try {
    const data = await turno.registrarVendaAvulsa(
      Number(req.params.id),
      req.usuario.login,
      req.body || {},
      ctxUsuario(req)
    );
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/demandas', requireAdmin, async (req, res, next) => {
  try {
    const data = await turno.criarDemanda(req.usuario.login, req.body || {});
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/demandas/:demandaId/responder', async (req, res, next) => {
  try {
    const { aceitar, motivo_recusa } = req.body || {};
    const data = await turno.responderDemanda(
      Number(req.params.id),
      Number(req.params.demandaId),
      { aceitar: aceitar === true, motivo_recusa },
      ctxUsuario(req)
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/prestacao', requireAdmin, async (req, res, next) => {
  try {
    const data = await turno.confirmarPrestacao(
      Number(req.params.id),
      req.usuario.login,
      req.body || {}
    );
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

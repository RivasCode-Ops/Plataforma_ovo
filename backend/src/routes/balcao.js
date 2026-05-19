import { Router } from 'express';
import { registrarVendaBalcao } from '../services/balcao.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { cliente_id, nome_avulso, itens, pagamento, troco } = req.body || {};
    const data = await registrarVendaBalcao({
      cliente_id,
      nome_avulso,
      itens,
      pagamento,
      troco,
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

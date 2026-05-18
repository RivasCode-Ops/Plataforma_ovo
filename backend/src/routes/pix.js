import { Router } from 'express';
import { pixConfigurado } from '../integrations/pix.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json({
    data: {
      configurado: pixConfigurado(),
      chave_definida: Boolean(process.env.GRANJA_PIX_CHAVE?.trim()),
    },
  });
});

export default router;

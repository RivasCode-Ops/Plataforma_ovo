import { Router } from 'express';
import { gerarLinkWhatsApp, statusWhatsApp } from '../integrations/whatsapp.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json({ data: statusWhatsApp() });
});

router.post('/link', (req, res, next) => {
  try {
    const { telefone, mensagem } = req.body || {};
    const texto =
      mensagem ||
      `*Teste Plataforma Ovo*\n\nGranja União — ${new Date().toLocaleString('pt-BR')}`;
    const data = gerarLinkWhatsApp(telefone, texto);
    if (!data.ok) return res.status(400).json({ erro: data.erro });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

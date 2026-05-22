import { Router } from 'express';
import { processarPedidoDoSite } from '../services/webhookPedido.js';
import {
  honeypotSitePedido,
  rateLimitPedidoSite,
  verificarSitePedidoToken,
} from '../middleware/sitePedidoPublico.js';

const router = Router();

/**
 * Pedido público do site (GitHub Pages).
 * Header: X-Site-Pedido-Token (mesmo valor de SITE_PEDIDO_TOKEN no .env.prod)
 */
router.post(
  '/pedido-site',
  rateLimitPedidoSite,
  honeypotSitePedido,
  verificarSitePedidoToken,
  async (req, res, next) => {
    try {
      const { nome, telefone, endereco, observacao, itens } = req.body || {};
      const resultado = await processarPedidoDoSite({
        cliente: { nome, telefone, endereco },
        itens,
        observacao,
        origem: process.env.SITE_ORIGEM || 'granjauniao.com.br',
        confirmar: false,
      });
      res.status(201).json({
        data: {
          pedido_id: resultado.pedido_id,
          total: resultado.total,
          mensagem:
            'Pedido recebido! Em breve entraremos em contato pelo WhatsApp para confirmar entrega e pagamento.',
        },
      });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ erro: err.message });
      }
      next(err);
    }
  }
);

export default router;

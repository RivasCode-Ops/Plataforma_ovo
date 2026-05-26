import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { requireAuth } from './middleware/auth.js';
import { auditoriaMiddleware } from './middleware/auditoria.js';
import authRouter from './routes/auth.js';
import healthRouter from './routes/health.js';
import pedidosRouter from './routes/pedidos.js';
import produtosRouter from './routes/produtos.js';
import cardapioRouter from './routes/cardapio.js';
import whatsappRouter from './routes/whatsapp.js';
import relatoriosRouter from './routes/relatorios.js';
import clientesRouter from './routes/clientes.js';
import assinaturasRouter from './routes/assinaturas.js';
import lotesRouter from './routes/lotes.js';
import operadoresRouter from './routes/operadores.js';
import notificacoesRouter from './routes/notificacoes.js';
import rotasRouter from './routes/rotas.js';
import pixRouter from './routes/pix.js';
import previsaoRouter from './routes/previsao.js';
import balcaoRouter from './routes/balcao.js';
import webhookRouter from './routes/webhook.js';
import sitePedidoRouter from './routes/sitePedido.js';
import contasReceberRouter from './routes/contasReceber.js';
import stoneRouter from './routes/stone.js';
import { pool } from './db.js';
import { ensureOperadorDemo, seedOperadorAdmin } from './services/operadores.js';
import { assertProductionConfig } from './config/productionGuard.js';
import { limparIdempotenciaExpirada } from './jobs/alertas.js';
import { processarEventosPendentes } from './jobs/reconciliacao.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rotasPublicas = new Set([
  '/health',
  '/cardapio',
  '/cardapio-whatsapp',
  '/pedido-site',
  '/auth/login',
]);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  })
);
app.use(express.json());
app.use('/widget', express.static(path.join(__dirname, '..', 'public', 'widget')));

app.use('/api/health', healthRouter);

app.use('/api/auth', authRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/stone', stoneRouter);
app.use('/api', cardapioRouter);
app.use('/api', sitePedidoRouter);

app.use('/api', (req, res, next) => {
  const pathNorm = req.path.replace(/\/$/, '') || '/';
  if (
    rotasPublicas.has(pathNorm) ||
    pathNorm.startsWith('/auth/login') ||
    pathNorm.startsWith('/webhook/') ||
    pathNorm === '/stone/webhook'
  ) {
    return next();
  }
  requireAuth(req, res, next);
});

app.use('/api', auditoriaMiddleware);

app.use('/api/pedidos', pedidosRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/relatorios', relatoriosRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/assinaturas', assinaturasRouter);
app.use('/api/lotes', lotesRouter);
app.use('/api/operadores', operadoresRouter);
app.use('/api/notificacoes', notificacoesRouter);
app.use('/api/rotas', rotasRouter);
app.use('/api/pix', pixRouter);
app.use('/api/previsao', previsaoRouter);
app.use('/api/balcao', balcaoRouter);
app.use('/api/contas-receber', contasReceberRouter);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  console.error(err);
  res.status(status).json({
    erro: err.message || 'Erro interno do servidor',
  });
});

assertProductionConfig();

const server = app.listen(port, async () => {
  try {
    await seedOperadorAdmin();
    if (process.env.NODE_ENV !== 'production') {
      await ensureOperadorDemo();
    }
  } catch (err) {
    console.error('[auth] Falha ao criar operadores iniciais:', err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  console.log(`API meuzovo em http://localhost:${port}`);
});

const JOB_INTERVAL_MS = 15 * 60 * 1000;
const jobTimer = setInterval(async () => {
  try {
    await limparIdempotenciaExpirada();
    await processarEventosPendentes({ limite: 10 });
  } catch (err) {
    console.error('[jobs]', err.message);
  }
}, JOB_INTERVAL_MS);

async function shutdown(signal) {
  console.log(`${signal} recebido — encerrando servidor…`);
  clearInterval(jobTimer);
  server.close(async () => {
    try {
      await pool.end();
    } catch (err) {
      console.error('[shutdown] pool:', err.message);
    }
    console.log('Servidor encerrado.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

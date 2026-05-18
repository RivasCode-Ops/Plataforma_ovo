import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import pedidosRouter from './routes/pedidos.js';
import produtosRouter from './routes/produtos.js';
import cardapioRouter from './routes/cardapio.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'plataforma-ovo-api' });
});

app.use('/api/pedidos', pedidosRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api', cardapioRouter);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  console.error(err);
  res.status(status).json({
    erro: err.message || 'Erro interno do servidor',
  });
});

app.listen(port, () => {
  console.log(`API Plataforma Ovo em http://localhost:${port}`);
});

-- Evita pedidos duplicados em retentativas de webhook (Idempotency-Key)
CREATE TABLE IF NOT EXISTS webhook_idempotencia (
  chave TEXT PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_idempotencia_pedido ON webhook_idempotencia (pedido_id);

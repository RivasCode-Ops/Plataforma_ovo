-- Venda balcão + controle de fiado

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'entrega';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(20);

CREATE TABLE IF NOT EXISTS fiado (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes (id),
  pedido_id INTEGER NOT NULL REFERENCES pedidos (id),
  valor NUMERIC(10, 2) NOT NULL,
  pago BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fiado_cliente ON fiado (cliente_id);
CREATE INDEX IF NOT EXISTS idx_fiado_pago ON fiado (pago) WHERE pago = FALSE;

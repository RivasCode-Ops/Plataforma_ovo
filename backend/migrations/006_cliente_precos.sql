-- Preço atacado por cliente e produto

CREATE TABLE IF NOT EXISTS cliente_precos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes (id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos (id) ON DELETE CASCADE,
  preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (cliente_id, produto_id)
);

CREATE INDEX IF NOT EXISTS idx_cliente_precos_cliente ON cliente_precos (cliente_id);

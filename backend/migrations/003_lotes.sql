-- Lotes e validade — banco já existente
CREATE TABLE IF NOT EXISTS lotes (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES produtos (id),
  codigo VARCHAR(50),
  quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
  quantidade_inicial INTEGER NOT NULL,
  data_validade DATE NOT NULL,
  data_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lotes_validade ON lotes (data_validade);
CREATE INDEX IF NOT EXISTS idx_lotes_produto ON lotes (produto_id);

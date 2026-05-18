-- Assinaturas (entregas recorrentes) — rode em banco já existente
-- psql ... -f backend/migrations/002_assinaturas.sql

CREATE TABLE IF NOT EXISTS assinaturas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes (id),
  frequencia VARCHAR(20) NOT NULL,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  status VARCHAR(20) NOT NULL DEFAULT 'ativa',
  proxima_entrega DATE NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_assinaturas_freq CHECK (frequencia IN ('semanal', 'quinzenal')),
  CONSTRAINT chk_assinaturas_status CHECK (status IN ('ativa', 'pausada', 'cancelada'))
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_proxima ON assinaturas (proxima_entrega);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas (status);

CREATE TABLE IF NOT EXISTS assinatura_itens (
  id SERIAL PRIMARY KEY,
  assinatura_id INTEGER NOT NULL REFERENCES assinaturas (id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos (id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0)
);

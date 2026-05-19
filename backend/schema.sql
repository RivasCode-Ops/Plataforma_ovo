-- Plataforma Ovo - Schema MVP (Fase 1)
-- PostgreSQL

CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  unidade VARCHAR(20) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rotas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  endereco TEXT,
  rota_id INTEGER REFERENCES rotas (id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes (telefone);
CREATE INDEX IF NOT EXISTS idx_clientes_rota ON clientes (rota_id);

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

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes (id),
  data_pedido TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'novo',
  total DECIMAL(10, 2) NOT NULL,
  observacao TEXT,
  tipo VARCHAR(20) NOT NULL DEFAULT 'entrega',
  forma_pagamento VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pedidos_status CHECK (
    status IN ('novo', 'confirmado', 'pago', 'enviado', 'entregue', 'cancelado')
  )
);

CREATE TABLE IF NOT EXISTS fiado (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes (id) ON DELETE CASCADE,
  pedido_id INTEGER NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL,
  pago BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fiado_cliente ON fiado (cliente_id);
CREATE INDEX IF NOT EXISTS idx_fiado_pago ON fiado (pago) WHERE pago = FALSE;

CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos (status);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos (data_pedido DESC);

CREATE TABLE IF NOT EXISTS itens_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos (id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS assinatura_itens (
  id SERIAL PRIMARY KEY,
  assinatura_id INTEGER NOT NULL REFERENCES assinaturas (id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos (id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0)
);

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

CREATE TABLE IF NOT EXISTS operadores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  login VARCHAR(50) NOT NULL UNIQUE,
  senha_hash VARCHAR(200) NOT NULL,
  papel VARCHAR(20) NOT NULL DEFAULT 'operador',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_operadores_papel CHECK (papel IN ('admin', 'operador'))
);

-- Dados iniciais (exemplo)
INSERT INTO produtos (nome, unidade, preco, estoque)
SELECT v.nome, v.unidade, v.preco, v.estoque
FROM (VALUES
  ('Ovos Brancos', 'dúzia', 12.00::decimal, 100),
  ('Ovos Caipira', 'dúzia', 18.00::decimal, 80),
  ('Ovos Vermelhos', 'dúzia', 15.00::decimal, 60)
) AS v(nome, unidade, preco, estoque)
WHERE NOT EXISTS (SELECT 1 FROM produtos LIMIT 1);

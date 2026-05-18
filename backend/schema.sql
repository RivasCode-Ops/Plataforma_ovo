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

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  endereco TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes (telefone);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes (id),
  data_pedido TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'novo',
  total DECIMAL(10, 2) NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pedidos_status CHECK (
    status IN ('novo', 'confirmado', 'pago', 'enviado', 'entregue', 'cancelado')
  )
);

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

-- Dados iniciais (exemplo)
INSERT INTO produtos (nome, unidade, preco, estoque)
SELECT v.nome, v.unidade, v.preco, v.estoque
FROM (VALUES
  ('Ovos Brancos', 'dúzia', 12.00::decimal, 100),
  ('Ovos Caipira', 'dúzia', 18.00::decimal, 80),
  ('Ovos Vermelhos', 'dúzia', 15.00::decimal, 60)
) AS v(nome, unidade, preco, estoque)
WHERE NOT EXISTS (SELECT 1 FROM produtos LIMIT 1);

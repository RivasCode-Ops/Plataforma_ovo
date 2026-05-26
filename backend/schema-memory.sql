-- Schema simplificado para prova local (pg-mem)

CREATE TABLE produtos (
  id serial PRIMARY KEY,
  nome varchar(100) NOT NULL,
  unidade varchar(20) NOT NULL,
  preco real NOT NULL,
  estoque integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE rotas (
  id serial PRIMARY KEY,
  nome varchar(80) NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE clientes (
  id serial PRIMARY KEY,
  nome varchar(100) NOT NULL,
  telefone varchar(20) NOT NULL,
  endereco text,
  rota_id integer REFERENCES rotas (id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_clientes_telefone ON clientes (telefone);

CREATE TABLE cliente_precos (
  id serial PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id) ON DELETE CASCADE,
  produto_id integer NOT NULL REFERENCES produtos (id) ON DELETE CASCADE,
  preco real NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (cliente_id, produto_id)
);

CREATE TABLE pedidos (
  id serial PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  data_pedido timestamp NOT NULL DEFAULT now(),
  status varchar(20) NOT NULL DEFAULT 'novo',
  total real NOT NULL,
  observacao text,
  tipo varchar(20) NOT NULL DEFAULT 'entrega',
  forma_pagamento varchar(20),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE fiado (
  id serial PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id) ON DELETE CASCADE,
  pedido_id integer NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  valor real NOT NULL,
  pago boolean NOT NULL DEFAULT false,
  criado_em timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_pedidos_status ON pedidos (status);

CREATE TABLE itens_pedido (
  id serial PRIMARY KEY,
  pedido_id integer NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  produto_id integer NOT NULL REFERENCES produtos (id),
  quantidade integer NOT NULL,
  preco_unitario real NOT NULL,
  subtotal real NOT NULL
);

CREATE TABLE assinaturas (
  id serial PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  frequencia varchar(20) NOT NULL,
  dia_semana smallint NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'ativa',
  proxima_entrega date NOT NULL,
  observacao text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE assinatura_itens (
  id serial PRIMARY KEY,
  assinatura_id integer NOT NULL REFERENCES assinaturas (id) ON DELETE CASCADE,
  produto_id integer NOT NULL REFERENCES produtos (id),
  quantidade integer NOT NULL
);

CREATE TABLE lotes (
  id serial PRIMARY KEY,
  produto_id integer NOT NULL REFERENCES produtos (id),
  codigo varchar(50),
  quantidade integer NOT NULL,
  quantidade_inicial integer NOT NULL,
  data_validade date NOT NULL,
  data_entrada date NOT NULL DEFAULT CURRENT_DATE,
  observacao text,
  desconto_percentual numeric(5, 2),
  desconto_ate date,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE operadores (
  id serial PRIMARY KEY,
  nome varchar(100) NOT NULL,
  login varchar(50) NOT NULL UNIQUE,
  senha_hash varchar(200) NOT NULL,
  papel varchar(20) NOT NULL DEFAULT 'operador',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now()
);

INSERT INTO produtos (nome, unidade, preco, estoque) VALUES
  ('Ovos Brancos', 'dúzia', 12, 100),
  ('Ovos Caipira', 'dúzia', 18, 80),
  ('Ovos Vermelhos', 'dúzia', 15, 60);

INSERT INTO rotas (nome, ordem) VALUES
  ('Centro', 1),
  ('Zona Norte', 2),
  ('Zona Sul', 3);

CREATE TABLE idempotencia (
  chave varchar(255) PRIMARY KEY,
  resposta text NOT NULL,
  expira_em timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE auditoria (
  id serial PRIMARY KEY,
  usuario_login varchar(100),
  acao varchar(120) NOT NULL,
  entidade varchar(50) NOT NULL,
  entidade_id integer,
  dados_anteriores text,
  dados_novos text,
  ip varchar(45),
  user_agent text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE webhook_idempotencia (
  chave text PRIMARY KEY,
  pedido_id integer NOT NULL REFERENCES pedidos (id),
  created_at timestamp NOT NULL DEFAULT now()
);

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

CREATE TABLE clientes (
  id serial PRIMARY KEY,
  nome varchar(100) NOT NULL,
  telefone varchar(20) NOT NULL,
  endereco text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_clientes_telefone ON clientes (telefone);

CREATE TABLE pedidos (
  id serial PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  data_pedido timestamp NOT NULL DEFAULT now(),
  status varchar(20) NOT NULL DEFAULT 'novo',
  total real NOT NULL,
  observacao text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
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

INSERT INTO produtos (nome, unidade, preco, estoque) VALUES
  ('Ovos Brancos', 'dúzia', 12, 100),
  ('Ovos Caipira', 'dúzia', 18, 80),
  ('Ovos Vermelhos', 'dúzia', 15, 60);

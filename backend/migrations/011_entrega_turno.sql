-- Módulo: turno/rota de entrega (sem perfil "entregador" — identificação operacional por turno)

CREATE TABLE IF NOT EXISTS turnos_entrega (
  id SERIAL PRIMARY KEY,
  responsavel_nome VARCHAR(100) NOT NULL,
  aberto_por_login VARCHAR(50),
  data_ref DATE NOT NULL DEFAULT CURRENT_DATE,
  regiao_rota_id INTEGER REFERENCES rotas (id),
  status VARCHAR(30) NOT NULL DEFAULT 'aberta',
  produtos_extras_info TEXT,
  iniciado_em TIMESTAMPTZ,
  encerrado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_turno_status CHECK (
    status IN ('aberta', 'em_rota', 'aguardando_prestacao', 'fechada')
  )
);

CREATE INDEX IF NOT EXISTS idx_turnos_data_status ON turnos_entrega (data_ref DESC, status);
CREATE INDEX IF NOT EXISTS idx_turnos_responsavel ON turnos_entrega (responsavel_nome, data_ref);

CREATE TABLE IF NOT EXISTS paradas_entrega (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER NOT NULL REFERENCES turnos_entrega (id) ON DELETE CASCADE,
  pedido_id INTEGER REFERENCES pedidos (id),
  demanda_id INTEGER,
  cliente_nome VARCHAR(150) NOT NULL,
  endereco TEXT,
  telefone VARCHAR(30),
  quantidade_descricao TEXT,
  valor_previsto NUMERIC(10, 2) NOT NULL DEFAULT 0,
  valor_recebido NUMERIC(10, 2),
  forma_pagamento_prevista VARCHAR(20),
  forma_pagamento VARCHAR(20),
  troco NUMERIC(10, 2) DEFAULT 0,
  status_operacional VARCHAR(30) NOT NULL DEFAULT 'pendente',
  status_financeiro VARCHAR(30) NOT NULL DEFAULT 'pendente_prestacao',
  observacao TEXT,
  recebedor_nome VARCHAR(100),
  concluido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_parada_op CHECK (
    status_operacional IN (
      'pendente', 'em_rota', 'concluida', 'nao_entregue', 'cancelada'
    )
  ),
  CONSTRAINT chk_parada_fin CHECK (
    status_financeiro IN (
      'pendente_prestacao', 'prestado_parcialmente', 'prestado_completo', 'com_divergencia', 'fechado'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_paradas_turno ON paradas_entrega (turno_id);

CREATE TABLE IF NOT EXISTS vendas_avulsas_turno (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER NOT NULL REFERENCES turnos_entrega (id) ON DELETE CASCADE,
  registrado_por_login VARCHAR(50),
  cliente_opcional VARCHAR(150),
  quantidade_descricao TEXT,
  valor_total NUMERIC(10, 2) NOT NULL,
  valor_recebido NUMERIC(10, 2) NOT NULL,
  forma_pagamento VARCHAR(20) NOT NULL,
  troco NUMERIC(10, 2) NOT NULL DEFAULT 0,
  observacao TEXT,
  status_financeiro VARCHAR(30) NOT NULL DEFAULT 'pendente_prestacao',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_venda_fin CHECK (
    status_financeiro IN (
      'pendente_prestacao', 'prestado_parcialmente', 'prestado_completo', 'com_divergencia', 'fechado'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_vendas_turno ON vendas_avulsas_turno (turno_id);

CREATE TABLE IF NOT EXISTS demandas_turno (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER NOT NULL REFERENCES turnos_entrega (id),
  parada_id INTEGER REFERENCES paradas_entrega (id),
  enviado_por VARCHAR(50) NOT NULL,
  cliente_nome VARCHAR(150) NOT NULL,
  endereco TEXT,
  quantidade_descricao TEXT,
  valor NUMERIC(10, 2) NOT NULL DEFAULT 0,
  observacao TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pendente',
  motivo_recusa TEXT,
  enviado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  respondido_em TIMESTAMPTZ,
  CONSTRAINT chk_demanda_status CHECK (
    status IN ('pendente', 'aceita', 'recusada')
  )
);

CREATE INDEX IF NOT EXISTS idx_demandas_turno ON demandas_turno (turno_id, status);

CREATE TABLE IF NOT EXISTS prestacoes_contas (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER NOT NULL UNIQUE REFERENCES turnos_entrega (id) ON DELETE CASCADE,
  total_previsto NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_dinheiro NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_pix NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_outros NUMERIC(10, 2) NOT NULL DEFAULT 0,
  valor_entregue_admin NUMERIC(10, 2),
  diferenca NUMERIC(10, 2),
  observacao_diferenca TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pendente',
  conferido_por VARCHAR(50),
  conferido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_prestacao_status CHECK (
    status IN ('pendente', 'prestado_parcialmente', 'prestado_completo', 'com_divergencia', 'fechado')
  )
);

ALTER TABLE paradas_entrega
  ADD CONSTRAINT fk_parada_demanda
  FOREIGN KEY (demanda_id) REFERENCES demandas_turno (id);

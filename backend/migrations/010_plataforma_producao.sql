-- Fundação: idempotência genérica, auditoria
CREATE TABLE IF NOT EXISTS idempotencia (
  chave VARCHAR(255) PRIMARY KEY,
  resposta JSONB NOT NULL,
  expira_em TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idempotencia_expira ON idempotencia (expira_em);

CREATE TABLE IF NOT EXISTS auditoria (
  id BIGSERIAL PRIMARY KEY,
  usuario_login VARCHAR(100),
  acao VARCHAR(120) NOT NULL,
  entidade VARCHAR(50) NOT NULL,
  entidade_id INTEGER,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria (entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_data ON auditoria (created_at DESC);

-- Negócio: contas a receber (complementa tabela fiado legada)
CREATE TABLE IF NOT EXISTS contas_a_receber (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes (id),
  pedido_id INTEGER NOT NULL REFERENCES pedidos (id),
  valor NUMERIC(10, 2) NOT NULL,
  vencimento DATE NOT NULL,
  pago_em TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'aberto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON contas_a_receber (status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_cliente ON contas_a_receber (cliente_id);

-- Eventos para reconciliação (Stone / webhooks externos)
CREATE TABLE IF NOT EXISTS eventos_transacionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL,
  entidade_id INTEGER,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  tentativas INTEGER NOT NULL DEFAULT 0,
  erro TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos_transacionais (status);

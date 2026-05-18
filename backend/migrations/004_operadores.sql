-- Múltiplos operadores (admin + operador)

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

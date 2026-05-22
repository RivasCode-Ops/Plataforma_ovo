-- Desconto temporário por lote (expira em desconto_ate)
ALTER TABLE lotes
  ADD COLUMN IF NOT EXISTS desconto_percentual NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS desconto_ate DATE;

ALTER TABLE lotes
  ADD CONSTRAINT chk_lotes_desconto_percentual
  CHECK (desconto_percentual IS NULL OR (desconto_percentual > 0 AND desconto_percentual <= 90));

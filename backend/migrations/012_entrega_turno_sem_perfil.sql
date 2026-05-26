-- Ajuste: remove vínculo com perfil "entregador"; turno centrado em responsavel_nome

ALTER TABLE operadores DROP CONSTRAINT IF EXISTS chk_operadores_papel;
ALTER TABLE operadores ADD CONSTRAINT chk_operadores_papel
  CHECK (papel IN ('admin', 'operador'));

-- turnos_entrega: colunas novas (se 011 antiga já rodou)
ALTER TABLE turnos_entrega ADD COLUMN IF NOT EXISTS responsavel_nome VARCHAR(100);
ALTER TABLE turnos_entrega ADD COLUMN IF NOT EXISTS aberto_por_login VARCHAR(50);

UPDATE turnos_entrega
SET responsavel_nome = COALESCE(
  responsavel_nome,
  (SELECT nome FROM operadores o WHERE o.id = turnos_entrega.operador_id LIMIT 1),
  operador_login,
  'Responsável'
)
WHERE responsavel_nome IS NULL;

UPDATE turnos_entrega
SET aberto_por_login = COALESCE(aberto_por_login, operador_login)
WHERE aberto_por_login IS NULL AND operador_login IS NOT NULL;

ALTER TABLE turnos_entrega ALTER COLUMN responsavel_nome SET NOT NULL;

ALTER TABLE turnos_entrega DROP COLUMN IF EXISTS operador_id;
ALTER TABLE turnos_entrega DROP COLUMN IF EXISTS operador_login;

-- vendas_avulsas
ALTER TABLE vendas_avulsas_turno ADD COLUMN IF NOT EXISTS registrado_por_login VARCHAR(50);

UPDATE vendas_avulsas_turno v
SET registrado_por_login = COALESCE(
  registrado_por_login,
  (SELECT aberto_por_login FROM turnos_entrega t WHERE t.id = v.turno_id)
)
WHERE registrado_por_login IS NULL;

ALTER TABLE vendas_avulsas_turno DROP COLUMN IF EXISTS operador_id;

-- demandas: turno_id obrigatório, remove entregador_login
UPDATE demandas_turno d
SET turno_id = COALESCE(
  d.turno_id,
  (SELECT t.id FROM turnos_entrega t
   WHERE t.operador_login = d.entregador_login
   ORDER BY t.id DESC LIMIT 1)
)
WHERE d.turno_id IS NULL AND d.entregador_login IS NOT NULL;

DELETE FROM demandas_turno WHERE turno_id IS NULL;

ALTER TABLE demandas_turno DROP COLUMN IF EXISTS entregador_login;
ALTER TABLE demandas_turno ALTER COLUMN turno_id SET NOT NULL;

-- prestação
ALTER TABLE prestacoes_contas DROP COLUMN IF EXISTS operador_id;

DROP INDEX IF EXISTS idx_demandas_entregador;
CREATE INDEX IF NOT EXISTS idx_demandas_turno ON demandas_turno (turno_id, status);

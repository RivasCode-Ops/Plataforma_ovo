-- Meta diária por produto (instalação = lote / criação = pedido)

ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS meta_diaria INTEGER NOT NULL DEFAULT 0;

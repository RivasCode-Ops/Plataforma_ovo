#!/bin/bash
# Aplica migrations SQL em ordem (banco ja existente na VPS)
# Uso: bash /opt/Plataforma_ovo/infra/scripts/vps-migrate-all.sh
set -eu

REPO="${REPO:-/opt/Plataforma_ovo}"
DB_CONTAINER="${DB_CONTAINER:-plataforma_ovo_db}"
DB_USER="${DB_USER:-plataforma}"
DB_NAME="${DB_NAME:-plataforma_ovo}"

MIGRATIONS=(
  003_lotes.sql
  004_operadores.sql
  006_cliente_precos.sql
  007_rotas.sql
  008_lote_desconto.sql
  009_webhook_idempotencia.sql
  002_assinaturas.sql
  002_balcao_fiado.sql
)

for mig in "${MIGRATIONS[@]}"; do
  f="$REPO/backend/migrations/$mig"
  if [ -f "$f" ]; then
    echo "=== $mig ==="
    docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" "$DB_NAME" < "$f" || echo "AVISO: $mig (pode ja estar aplicada)"
  fi
done

echo "Migrations concluidas."

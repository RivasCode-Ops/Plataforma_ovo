#!/usr/bin/env bash
# Backup PostgreSQL (Docker) — meuzovo
# Cron: 0 3 * * * /opt/Plataforma_ovo/infra/scripts/backup.sh >> /var/log/plataforma_backup.log 2>&1
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$INFRA_DIR/.env.prod}"

if [ -f "$ENV_FILE" ]; then
  set -a
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      ''|'#'*) continue ;;
      *=*) export "$line" ;;
    esac
  done < "$ENV_FILE"
  set +a
fi

BACKUP_DIR="${BACKUP_DIR:-/var/backups/plataforma_ovo}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
CONTAINER="${POSTGRES_CONTAINER:-plataforma_ovo_db}"
DB_USER="${POSTGRES_USER:-plataforma}"
DB_NAME="${POSTGRES_DB:-plataforma_ovo}"

mkdir -p "$BACKUP_DIR"

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "[$(date -Iseconds)] ERRO: container $CONTAINER nao esta rodando"
  exit 1
fi

FILE="$BACKUP_DIR/plataforma_ovo_$(date +%Y%m%d_%H%M%S).sql"

if docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$FILE"; then
  gzip -f "$FILE"
  echo "[$(date -Iseconds)] OK: ${FILE}.gz ($(du -h "${FILE}.gz" | cut -f1))"
else
  rm -f "$FILE"
  echo "[$(date -Iseconds)] ERRO: pg_dump falhou"
  exit 1
fi

# Remove backups .sql.gz mais antigos que RETENTION_DAYS
find "$BACKUP_DIR" -name 'plataforma_ovo_*.sql.gz' -type f -mtime +"$RETENTION_DAYS" -delete 2>/dev/null || true

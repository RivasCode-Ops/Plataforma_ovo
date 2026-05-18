#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/../backups}"
CONTAINER="${POSTGRES_CONTAINER:-plataforma_ovo_db}"
DB_USER="${POSTGRES_USER:-plataforma}"
DB_NAME="${POSTGRES_DB:-plataforma_ovo}"

mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/plataforma_ovo_$(date +%Y%m%d_%H%M%S).sql"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$FILE"
gzip -f "$FILE"

echo "Backup salvo: ${FILE}.gz"

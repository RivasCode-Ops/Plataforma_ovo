#!/bin/bash
# Instala cron de backup diario na VPS
# Uso: bash /opt/Plataforma_ovo/infra/scripts/vps-setup-backup.sh
set -eu

SCRIPT="/opt/Plataforma_ovo/infra/scripts/backup.sh"
LOG="/var/log/plataforma_backup.log"
CRON_LINE="0 3 * * * $SCRIPT >> $LOG 2>&1"

chmod +x "$SCRIPT"
mkdir -p /var/backups/plataforma_ovo
touch "$LOG"

if crontab -l 2>/dev/null | grep -Fq "$SCRIPT"; then
  echo "Cron de backup ja configurado."
else
  (crontab -l 2>/dev/null | grep -Fv "$SCRIPT"; echo "$CRON_LINE") | crontab -
  echo "Cron instalado: $CRON_LINE"
fi

echo ""
echo "=== Teste de backup agora ==="
bash "$SCRIPT"

echo ""
echo "Backups em: /var/backups/plataforma_ovo"
ls -lh /var/backups/plataforma_ovo | tail -5
echo ""
echo "Log: $LOG"

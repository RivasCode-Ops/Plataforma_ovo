#!/bin/bash
# Ativa HTTPS em app.granjauniao.com.br (sem --force-renewal)
# Uso: bash /opt/Plataforma_ovo/infra/scripts/vps-ativar-https.sh
set -eu

DOMAIN="${DOMAIN:-app.granjauniao.com.br}"
INFRA="${INFRA:-/opt/Plataforma_ovo/infra}"
ENV_FILE="$INFRA/.env.prod"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== 1. Preparar Docker (porta 8080) ==="
if [ -f "$ENV_FILE" ]; then
  sed -i 's/^HTTP_PORT=808080/HTTP_PORT=8080/' "$ENV_FILE"
  sed -i 's/^HTTP_PORT=8080[80]*/HTTP_PORT=8080/' "$ENV_FILE"
  sed -i 's/^HTTP_PORT=80$/HTTP_PORT=8080/' "$ENV_FILE"
  grep -q '^HTTP_PORT=' "$ENV_FILE" || echo 'HTTP_PORT=8080' >> "$ENV_FILE"
  if grep -q '^CORS_ORIGIN=http://' "$ENV_FILE"; then
    sed -i "s|^CORS_ORIGIN=http://|CORS_ORIGIN=https://|" "$ENV_FILE"
    echo "CORS_ORIGIN atualizado para HTTPS"
  fi
fi

cd "$INFRA"
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d web backend

echo ""
echo "=== 2. Certificado + Nginx HTTPS ==="
bash "$SCRIPT_DIR/vps-nginx-fix.sh"

echo ""
echo "=== 3. Teste final ==="
echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -issuer -subject -dates 2>/dev/null || echo "AVISO: nao foi possivel ler certificado na 443"
curl -sf "https://$DOMAIN/api/health" && echo "" || echo "HTTPS ainda nao responde — veja RUNBOOK_HTTPS_VPS.md"

echo ""
echo "Painel: https://$DOMAIN"

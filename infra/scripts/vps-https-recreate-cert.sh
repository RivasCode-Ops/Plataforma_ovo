#!/bin/bash
# Plano B: remove certificado quebrado e gera novo (standalone)
# Uso: bash vps-https-recreate-cert.sh seu@email.com
set -euo pipefail

DOMAIN="${DOMAIN:-app.granjauniao.com.br}"
EMAIL="${1:-}"
INFRA="${INFRA:-/opt/Plataforma_ovo/infra}"

if [ -z "$EMAIL" ]; then
  echo "Uso: bash vps-https-recreate-cert.sh seu@email.com"
  exit 1
fi

echo "==> Parar web (liberar 80)"
cd "$INFRA"
docker compose --env-file .env.prod -f docker-compose.prod.yml stop web

echo "==> Remover certificado antigo"
certbot delete --cert-name "$DOMAIN" --non-interactive 2>/dev/null || true

echo "==> Novo certificado"
certbot certonly --standalone -d "$DOMAIN" \
  --non-interactive --agree-tos -m "$EMAIL"

echo "==> Subir web na 8080"
if grep -q '^HTTP_PORT=80' "$INFRA/.env.prod" 2>/dev/null; then
  sed -i 's/^HTTP_PORT=80/HTTP_PORT=8080/' "$INFRA/.env.prod"
fi
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d web

echo "OK. Agora: bash $INFRA/scripts/vps-nginx-fix.sh"

#!/bin/bash
# HTTPS para app.granjauniao.com.br (rode na VPS como root)
# Uso: bash /opt/Plataforma_ovo/infra/scripts/vps-https.sh seu@email.com
set -euo pipefail

DOMAIN="${DOMAIN:-app.granjauniao.com.br}"
EMAIL="${1:-}"
INFRA="${INFRA:-/opt/Plataforma_ovo/infra}"

if [ -z "$EMAIL" ]; then
  echo "Uso: bash vps-https.sh seu-email@exemplo.com"
  exit 1
fi

if [ ! -f "$INFRA/.env.prod" ]; then
  echo "ERRO: $INFRA/.env.prod nao encontrado"
  exit 1
fi

echo "==> Instalar nginx + certbot"
apt-get update -qq
apt-get install -y nginx certbot

echo "==> Parar container web (liberar porta 80)"
cd "$INFRA"
docker compose --env-file .env.prod -f docker-compose.prod.yml stop web

echo "==> Certificado Let's Encrypt"
certbot certonly --standalone -d "$DOMAIN" \
  --non-interactive --agree-tos -m "$EMAIL"

echo "==> App na porta 8080"
if grep -q '^HTTP_PORT=80' "$INFRA/.env.prod"; then
  sed -i 's/^HTTP_PORT=80/HTTP_PORT=8080/' "$INFRA/.env.prod"
fi
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d web

echo "==> Nginx host"
cp "$INFRA/nginx-host/app.granjauniao.com.br.conf" \
  "/etc/nginx/sites-available/$DOMAIN"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

echo ""
echo "OK! Teste: https://$DOMAIN/api/health"
curl -sk "https://$DOMAIN/api/health" || true
echo ""

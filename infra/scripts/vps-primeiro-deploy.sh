#!/bin/bash
# Primeiro deploy na VPS Ubuntu — app.granjauniao.com.br
# Uso: bash vps-primeiro-deploy.sh
set -euo pipefail

REPO="${REPO:-/opt/Plataforma_ovo}"
INFRA="$REPO/infra"

if [ ! -f "$INFRA/.env.prod" ]; then
  echo "ERRO: Crie $INFRA/.env.prod antes (copie env.prod.example ou scp do PC)."
  exit 1
fi

echo "==> Docker compose build + up"
cd "$INFRA"
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build

echo "==> Aguardando health..."
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1/api/health >/dev/null 2>&1; then
    echo "OK: $(curl -s http://127.0.0.1/api/health)"
    exit 0
  fi
  sleep 3
done

echo "Health ainda nao respondeu. Veja logs:"
echo "  docker compose --env-file .env.prod -f docker-compose.prod.yml logs backend"
exit 1

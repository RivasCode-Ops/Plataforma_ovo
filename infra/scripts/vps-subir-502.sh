#!/bin/bash
# Recupera 502 Bad Gateway (Nginx OK, Docker/web parado na 8080)
# Uso: bash /opt/Plataforma_ovo/infra/scripts/vps-subir-502.sh
set -eu

REPO="${REPO:-/opt/Plataforma_ovo}"
INFRA="$REPO/infra"
ENV="$INFRA/.env.prod"

echo "=== 502 — subir Docker na 8080 ==="

if [ ! -f "$ENV" ]; then
  echo "ERRO: falta $ENV"
  echo "Copie do PC: infra/.env.prod -> VPS $ENV"
  exit 1
fi

sed -i 's/^HTTP_PORT=808080/HTTP_PORT=8080/' "$ENV"
sed -i 's/^HTTP_PORT=80$/HTTP_PORT=8080/' "$ENV"
grep -q '^HTTP_PORT=' "$ENV" || echo 'HTTP_PORT=8080' >> "$ENV"
echo "HTTP_PORT=$(grep '^HTTP_PORT=' "$ENV")"

cd "$REPO"
git pull --ff-only 2>/dev/null || true

cd "$INFRA"
echo "=== docker compose up ==="
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build

echo "=== aguardando containers ==="
sleep 10
docker compose --env-file .env.prod -f docker-compose.prod.yml ps

echo "=== porta 8080 ==="
ss -tlnp | grep ':8080' || echo "AVISO: nada escutando na 8080"

echo "=== health local ==="
if curl -sf "http://127.0.0.1:8080/api/health"; then
  echo ""
  echo "OK — recarregue http://app.granjauniao.com.br"
else
  echo ""
  echo "FALHOU — logs API:"
  docker logs plataforma_ovo_api --tail 40 2>&1 || true
  echo ""
  echo "FALHOU — logs web:"
  docker logs plataforma_ovo_web --tail 20 2>&1 || true
  exit 1
fi

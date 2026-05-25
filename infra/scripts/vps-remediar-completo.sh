#!/bin/bash
# Sobe Docker + containers + testa 502 (rodar na VPS como root)
set -eu

echo "=== 1. Docker daemon ==="
systemctl enable docker
systemctl start docker
systemctl is-active docker

echo ""
echo "=== 2. Repo e .env.prod ==="
REPO=/opt/Plataforma_ovo
INFRA=$REPO/infra
cd "$REPO"
git pull --ff-only 2>/dev/null || true

if [ ! -f "$INFRA/.env.prod" ]; then
  echo "ERRO: falta $INFRA/.env.prod — copie do PC antes de continuar"
  exit 1
fi

sed -i 's/^HTTP_PORT=808080/HTTP_PORT=8080/' "$INFRA/.env.prod"
sed -i 's/^HTTP_PORT=80$/HTTP_PORT=8080/' "$INFRA/.env.prod"
grep -q '^HTTP_PORT=' "$INFRA/.env.prod" || echo 'HTTP_PORT=8080' >> "$INFRA/.env.prod"
echo "HTTP_PORT=$(grep '^HTTP_PORT=' "$INFRA/.env.prod")"

echo ""
echo "=== 3. Compose up ==="
cd "$INFRA"
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build

echo ""
echo "=== 4. Aguardar ==="
sleep 15
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== 5. Health ==="
curl -sf http://127.0.0.1:8080/api/health && echo "" || {
  echo "FALHOU 8080 — logs API:"
  docker logs --tail 30 plataforma_ovo_api 2>&1 || true
  exit 1
}

curl -sf http://app.granjauniao.com.br/api/health && echo "" || echo "AVISO: dominio HTTP ainda falhou"

echo ""
echo "=== 6. HTTPS (opcional) ==="
if [ -f "$REPO/infra/scripts/vps-ativar-https.sh" ]; then
  bash "$REPO/infra/scripts/vps-ativar-https.sh" || true
fi

echo ""
echo "=== Pronto ==="
echo "Painel: http://app.granjauniao.com.br (ou https se cert OK)"

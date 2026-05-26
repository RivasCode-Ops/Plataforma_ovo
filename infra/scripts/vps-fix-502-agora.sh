#!/bin/bash
# Corrige 502 — rode na VPS: bash /opt/Plataforma_ovo/infra/scripts/vps-fix-502-agora.sh
set -eu

REPO=/opt/Plataforma_ovo
INFRA=$REPO/infra
cd "$INFRA"

echo "=== 1. Docker ==="
systemctl unmask docker docker.socket containerd 2>/dev/null || true
systemctl restart docker
sleep 10
timeout 15 docker version >/dev/null || { echo "ERRO: Docker nao responde"; exit 1; }

echo "=== 2. Codigo (se git disponivel) ==="
cd "$REPO"
git pull --ff-only 2>/dev/null || echo "AVISO: git pull falhou (nginx local?) — seguindo com codigo atual"

echo "=== 3. Postgres ==="
cd "$INFRA"
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d postgres
for i in $(seq 1 24); do
  docker exec plataforma_ovo_db pg_isready -U plataforma -q 2>/dev/null && echo "Postgres OK" && break
  sleep 5
  echo "aguardando postgres... $i"
done

echo "=== 4. Migracoes ==="
if docker ps --format '{{.Names}}' | grep -qx plataforma_ovo_db; then
  bash "$REPO/infra/scripts/vps-migrate-all.sh" || true
fi

echo "=== 5. Build + up API e web (pode demorar) ==="
export DOCKER_BUILDKIT=0
docker compose --env-file .env.prod -f docker-compose.prod.yml build --progress=plain backend
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d backend
docker compose --env-file .env.prod -f docker-compose.prod.yml build --progress=plain web
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d web

echo "=== 6. Health ==="
sleep 5
curl -sf --connect-timeout 10 http://127.0.0.1:8080/api/health && echo "" || echo "FALHOU health 8080"
docker compose --env-file .env.prod -f docker-compose.prod.yml ps

if curl -sf --connect-timeout 5 http://127.0.0.1:8080/api/health >/dev/null; then
  echo "=== 7. Nginx ==="
  bash "$REPO/infra/scripts/vps-nginx-fix.sh" 2>/dev/null || true
  nginx -t && systemctl reload nginx
  echo "OK — teste: https://app.granjauniao.com.br/api/health"
else
  echo ">>> Ver logs:"
  echo "    docker logs plataforma_ovo_api --tail 40"
  echo "    docker logs plataforma_ovo_web --tail 20"
  exit 1
fi

#!/bin/bash
# Atualiza VPS: git pull, migracoes (pedido site + desconto lote), rebuild API/painel
# Uso na VPS: bash /opt/Plataforma_ovo/infra/scripts/vps-deploy-atualizacao.sh
# Ou do PC: .\scripts\deploy-atualizacao-vps.ps1
set -eu

REPO="${REPO:-/opt/Plataforma_ovo}"
INFRA="$REPO/infra"
ENV_FILE="$INFRA/.env.prod"
DB_CONTAINER="${DB_CONTAINER:-plataforma_ovo_db}"
DOMAIN="${DOMAIN:-app.granjauniao.com.br}"

echo "=== 1. Atualizar codigo ==="
cd "$REPO"
git pull --ff-only

echo ""
echo "=== 2. Postgres (garantir rodando) ==="
cd "$INFRA"
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d postgres
for i in $(seq 1 24); do
  if docker exec "$DB_CONTAINER" pg_isready -U plataforma -q 2>/dev/null; then
    echo "Postgres OK"
    break
  fi
  sleep 5
done

echo ""
echo "=== 3. Migracoes PostgreSQL ==="
if docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
  bash "$REPO/infra/scripts/vps-migrate-all.sh"
else
  echo "ERRO: $DB_CONTAINER nao esta rodando — migracoes ignoradas"
fi

echo ""
echo "=== 4. Variaveis .env.prod (pedido site) ==="
NEW_TOKEN=""
if [ -f "$ENV_FILE" ]; then
  if [ -n "${DEPLOY_SITE_TOKEN:-}" ]; then
    if grep -q '^SITE_PEDIDO_TOKEN=' "$ENV_FILE" 2>/dev/null; then
      sed -i "s/^SITE_PEDIDO_TOKEN=.*/SITE_PEDIDO_TOKEN=${DEPLOY_SITE_TOKEN}/" "$ENV_FILE"
    else
      echo "SITE_PEDIDO_TOKEN=${DEPLOY_SITE_TOKEN}" >> "$ENV_FILE"
    fi
    echo "SITE_PEDIDO_TOKEN sincronizado (mesmo valor do PC)."
  elif ! grep -q '^SITE_PEDIDO_TOKEN=.\+' "$ENV_FILE" 2>/dev/null; then
    NEW_TOKEN=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    echo "" >> "$ENV_FILE"
    echo "SITE_PEDIDO_TOKEN=$NEW_TOKEN" >> "$ENV_FILE"
    echo "SITE_PEDIDO_TOKEN gerado na VPS - copie para infra/.env.prod no PC e republique o site."
  else
    echo "SITE_PEDIDO_TOKEN ja existe na VPS."
  fi
  if ! grep -q 'granjauniao.com.br' "$ENV_FILE" 2>/dev/null; then
    if grep -q '^CORS_ORIGIN=' "$ENV_FILE" 2>/dev/null; then
      sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=https://app.granjauniao.com.br,https://granjauniao.com.br,https://www.granjauniao.com.br|' "$ENV_FILE"
      echo "CORS_ORIGIN atualizado com dominios do site."
    else
      echo 'CORS_ORIGIN=https://app.granjauniao.com.br,https://granjauniao.com.br,https://www.granjauniao.com.br' >> "$ENV_FILE"
    fi
  fi
else
  echo "AVISO: $ENV_FILE nao encontrado - crie antes do compose."
fi

echo ""
echo "=== 5. Rebuild containers ==="
cd "$INFRA"
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build backend web

echo ""
echo "=== 6. Health ==="
sleep 3
curl -sf "https://$DOMAIN/api/health" && echo "" || curl -sf "http://127.0.0.1:8080/api/health" && echo ""

echo ""
echo "=== Pronto ==="
echo "Painel: https://$DOMAIN"
if [ -n "$NEW_TOKEN" ]; then
  echo ""
  echo ">>> Copie para GitHub (repo granjauniao-site) secret VITE_SITE_PEDIDO_TOKEN:"
  echo "$NEW_TOKEN"
  echo ""
  echo "No PC: .\scripts\publicar-site-build.ps1"
fi

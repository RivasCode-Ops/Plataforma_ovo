#!/bin/bash
# Diagnóstico 502 — Nginx OK, upstream 127.0.0.1:8080 sem resposta
# Uso: bash /opt/Plataforma_ovo/infra/scripts/vps-diagnostico-502.sh
set -eu

UPSTREAM_HOST="${UPSTREAM_HOST:-127.0.0.1}"
UPSTREAM_PORT="${UPSTREAM_PORT:-8080}"
HEALTH_URL="http://${UPSTREAM_HOST}:${UPSTREAM_PORT}/api/health"

cd /opt/Plataforma_ovo/infra

echo "=== DIAGNOSTICO 502 (SRE) — upstream ${UPSTREAM_HOST}:${UPSTREAM_PORT} ==="
echo "Load: $(uptime 2>/dev/null || true)"
echo ""

echo "=== 1. Status dos containers ==="
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || { echo "docker indisponivel"; exit 1; }

echo ""
echo "=== 2. Verificando .env.prod ==="
if [ -f .env.prod ]; then
  echo "OK: .env.prod existe"
  grep '^HTTP_PORT=' .env.prod 2>/dev/null || echo "AVISO: HTTP_PORT nao definido (use HTTP_PORT=8080)"
else
  echo "ERRO: .env.prod ausente"
  echo "  Copie do PC (infra/.env.prod) ou: cp env.prod.example .env.prod && edite senhas"
fi

echo ""
echo "=== 3. Socket na porta ${UPSTREAM_PORT} ==="
ss -tlnp | grep ":${UPSTREAM_PORT} " || echo "NENHUM processo escutando em :${UPSTREAM_PORT}"
command -v nc >/dev/null && timeout 3 nc -zv "$UPSTREAM_HOST" "$UPSTREAM_PORT" 2>&1 || true

echo ""
echo "=== 4. Teste HTTP upstream ==="
if curl -sf --connect-timeout 5 --max-time 10 "$HEALTH_URL"; then
  echo ""
  echo "OK: upstream responde (${HEALTH_URL})"
else
  echo "FALHOU: sem resposta em ${HEALTH_URL}"
  curl -s -o /dev/null -w "curl: HTTP %{http_code} em %{time_total}s\n" "$HEALTH_URL" --connect-timeout 5 --max-time 10 || true
fi

echo ""
echo "=== 5. Porta exposta pelo container web ==="
docker port plataforma_ovo_web 2>/dev/null || echo "(container web nao encontrado)"

echo ""
echo "=== 6. Logs do container web ==="
docker logs --tail 10 plataforma_ovo_web 2>&1 || true

echo ""
echo "=== 7. Logs da API ==="
docker logs --tail 10 plataforma_ovo_api 2>&1 || true

echo ""
echo "=== 8. Configuracao Nginx (proxy_pass / timeouts) ==="
grep -E "proxy_pass|proxy_.*timeout|upstream" /etc/nginx/sites-enabled/* /etc/nginx/nginx.conf 2>/dev/null | head -20 || true

echo ""
echo "=== 9. Erros Nginx (ultimas 20 linhas) ==="
tail -n 20 /var/log/nginx/error.log 2>/dev/null || true

echo ""
echo "=== 10. Firewall (ufw) ==="
ufw status 2>/dev/null | head -5 || echo "(ufw nao instalado ou sem permissao)"

echo ""
if ! curl -sf --connect-timeout 5 "$HEALTH_URL" >/dev/null; then
  echo ">>> CAUSA PROVAVEL: upstream Docker na ${UPSTREAM_PORT} parado ou API nao subiu"
  echo ">>> Correcao: bash /opt/Plataforma_ovo/infra/scripts/vps-subir-502.sh"
  echo ">>> Runbook: docs/DEPLOY_UNICO.md"
fi

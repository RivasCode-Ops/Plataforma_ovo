#!/bin/bash
# Diagnóstico 502 — Nginx OK, upstream 127.0.0.1:8080 sem resposta
# Uso: bash /opt/Plataforma_ovo/infra/scripts/vps-diagnostico-502.sh
set -eu

cd /opt/Plataforma_ovo/infra

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
echo "=== 3. Teste direto na porta mapeada ==="
if curl -sf http://127.0.0.1:8080/api/health; then
  echo ""
  echo "OK: upstream responde na 8080"
else
  echo "FALHOU: sem resposta na 8080"
fi

echo ""
echo "=== 4. Porta exposta pelo container web ==="
docker port plataforma_ovo_web 2>/dev/null || echo "(container web nao encontrado)"

echo ""
echo "=== 5. Logs do container web ==="
docker logs --tail 10 plataforma_ovo_web 2>&1 || true

echo ""
echo "=== 6. Logs da API ==="
docker logs --tail 10 plataforma_ovo_api 2>&1 || true

echo ""
echo "=== 7. Configuracao Nginx (proxy_pass) ==="
grep -A2 "proxy_pass" /etc/nginx/sites-enabled/* 2>/dev/null | head -12 || true

echo ""
echo "=== 8. Erros Nginx ==="
tail -n 10 /var/log/nginx/error.log 2>/dev/null || true

echo ""
if ! curl -sf http://127.0.0.1:8080/api/health >/dev/null; then
  echo ">>> Correcao: bash /opt/Plataforma_ovo/infra/scripts/vps-subir-502.sh"
fi

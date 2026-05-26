#!/bin/bash
# Teste go-live: health, login, pedido (painel) — rodar na VPS
# Uso: bash /opt/Plataforma_ovo/infra/scripts/vps-go-live-teste.sh
set -eu

BASE="${BASE:-https://app.granjauniao.com.br}"
INFRA=/opt/Plataforma_ovo/infra
ENV_FILE="$INFRA/.env.prod"

echo "=== GO-LIVE TESTE ==="
echo "Base: $BASE"
echo ""

load_env() {
  [ -f "$ENV_FILE" ] || { echo "ERRO: $ENV_FILE ausente"; exit 1; }
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      ''|'#'*) continue ;;
      *=*) export "$line" ;;
    esac
  done < "$ENV_FILE"
}

load_env

echo "=== 1. Health HTTPS ==="
HEALTH=$(curl -sf --connect-timeout 10 "$BASE/api/health" || true)
echo "$HEALTH"
echo "$HEALTH" | grep -q '"ok":true' || { echo "FALHOU health"; exit 1; }
echo "OK health"
echo ""

echo "=== 2. Cardapio publico ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$BASE/api/cardapio")
echo "HTTP $CODE"
[ "$CODE" = "200" ] || { echo "FALHOU cardapio"; exit 1; }
echo "OK cardapio"
echo ""

echo "=== 3. Login admin ==="
LOGIN_RESP=$(curl -sf --connect-timeout 10 -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"usuario\":\"${ADMIN_USER:-admin}\",\"senha\":\"${ADMIN_PASSWORD}\"}" || true)
echo "$LOGIN_RESP" | head -c 120
echo ""
TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | head -1 | sed 's/"token":"//;s/"$//')
[ -n "$TOKEN" ] || { echo "FALHOU login — confira ADMIN_PASSWORD no .env.prod"; exit 1; }
echo "OK login"
echo ""

echo "=== 4. Listar produtos ==="
PRODS=$(curl -sf --connect-timeout 10 "$BASE/api/produtos" \
  -H "Authorization: Bearer $TOKEN" || true)
PROD_ID=$(echo "$PRODS" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
[ -n "$PROD_ID" ] || { echo "FALHOU produtos (sem produto cadastrado?)"; exit 1; }
echo "Produto id=$PROD_ID"
echo ""

echo "=== 5. Criar pedido teste ==="
PEDIDO_RESP=$(curl -sf --connect-timeout 15 -X POST "$BASE/api/pedidos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"cliente\":{\"nome\":\"Teste Go-Live\",\"telefone\":\"5589999990001\",\"endereco\":\"Teste automatico\"},\"itens\":[{\"produto_id\":$PROD_ID,\"quantidade\":1}],\"observacao\":\"Teste go-live script\"}" || true)
echo "$PEDIDO_RESP" | head -c 200
echo ""
echo "$PEDIDO_RESP" | grep -q '"id"' || { echo "FALHOU criar pedido"; exit 1; }
echo "OK pedido criado"
echo ""

echo "=== 6. Pedido-site (token) ==="
if [ -n "${SITE_PEDIDO_TOKEN:-}" ]; then
  PS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 -X POST "$BASE/api/pedido-site" \
    -H "Content-Type: application/json" \
    -H "X-Site-Pedido-Token: $SITE_PEDIDO_TOKEN" \
    -d "{\"nome\":\"Teste Site\",\"telefone\":\"5589999990002\",\"endereco\":\"Teste site\",\"itens\":[{\"produto_id\":$PROD_ID,\"quantidade\":1}],\"website\":\"\"}")
  echo "pedido-site HTTP $PS_CODE (201=ok, 400/429=validacao/rate)"
else
  echo "AVISO: SITE_PEDIDO_TOKEN ausente — pulando"
fi

echo ""
echo "=== TUDO OK — confira no painel: Pedidos do dia ==="

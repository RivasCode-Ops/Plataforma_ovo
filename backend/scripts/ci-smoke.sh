#!/usr/bin/env bash
# Smoke test rotas publicas da API (CI)
set -eu
BASE="${1:-http://localhost:3000}"

curl -sf "$BASE/api/health" | grep -q '"ok":true'

code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/cardapio")
[ "$code" = "200" ]

code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/pedido-site" \
  -H "Content-Type: application/json" \
  -d '{"nome":"x","telefone":"1","endereco":"y","itens":[]}')
[ "$code" = "401" ] || [ "$code" = "503" ]

echo "ci-smoke: OK"

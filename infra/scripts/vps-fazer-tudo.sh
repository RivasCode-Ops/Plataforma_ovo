#!/bin/bash
# Deploy completo + HTTPS — rodar no console web da VPS (uma vez)
# Gerado pelo PC: .\scripts\gerar-vps-tudo-console.ps1
set -eu

REPO="${REPO:-/opt/Plataforma_ovo}"
cd "$REPO"
git pull --ff-only

if [ -n "${DEPLOY_SITE_TOKEN:-}" ]; then
  export DEPLOY_SITE_TOKEN
fi

echo "========== DEPLOY (codigo + migracao + docker) =========="
bash "$REPO/infra/scripts/vps-deploy-atualizacao.sh"

echo ""
echo "========== HTTPS (porta 443) =========="
bash "$REPO/infra/scripts/vps-ativar-https.sh"

echo ""
echo "========== FIM =========="
echo "Teste: https://app.granjauniao.com.br/api/health"
echo "Painel: https://app.granjauniao.com.br"

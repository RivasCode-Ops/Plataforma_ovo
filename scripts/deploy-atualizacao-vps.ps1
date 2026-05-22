# Deploy na VPS: migracoes D+E, rebuild backend/painel
# Uso: .\scripts\deploy-atualizacao-vps.ps1
# Antes: commit + push do Plataforma_ovo para o GitHub (a VPS faz git pull)

$ErrorActionPreference = "Stop"
$Host_ = "root@147.93.185.146"
$Root = Split-Path -Parent $PSScriptRoot
$Bash = Join-Path $Root "infra\scripts\vps-deploy-atualizacao.sh"

Write-Host ""
Write-Host "Deploy atualizacao (pedido site + desconto lote)" -ForegroundColor Cyan
Write-Host "Certifique-se de ter feito git push do repo principal antes." -ForegroundColor Yellow
Write-Host ""

$scriptContent = (Get-Content $Bash -Raw -Encoding UTF8) -replace "`r`n", "`n" -replace "`r", ""
$scriptContent | ssh $Host_ "bash -s"

if ($LASTEXITCODE -ne 0) {
  Write-Host "ERRO na VPS." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Proximo (site):" -ForegroundColor Cyan
Write-Host "  1. Secret VITE_SITE_PEDIDO_TOKEN no GitHub (granjauniao-site)" -ForegroundColor White
Write-Host "  2. .\scripts\publicar-site-github.ps1" -ForegroundColor White
Write-Host "  3. Testar https://granjauniao.com.br#pedido" -ForegroundColor White
Write-Host ""

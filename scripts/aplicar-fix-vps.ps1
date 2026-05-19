# Copia e executa o fix de Nginx/certificado na VPS (pede senha SSH)
# Uso: .\scripts\aplicar-fix-vps.ps1

$ErrorActionPreference = "Stop"
$Host_ = "root@147.93.185.146"
$Root = Split-Path -Parent $PSScriptRoot
$Script = Join-Path $Root "infra\scripts\vps-nginx-fix.sh"

if (-not (Test-Path $Script)) {
  throw "Nao encontrado: $Script"
}

Write-Host "Enviando script para a VPS..." -ForegroundColor Cyan
scp $Script "${Host_}:/tmp/vps-nginx-fix.sh"

Write-Host "Executando na VPS..." -ForegroundColor Cyan
ssh $Host_ "chmod +x /tmp/vps-nginx-fix.sh && bash /tmp/vps-nginx-fix.sh"

Write-Host ""
Write-Host "Teste no navegador: https://app.granjauniao.com.br" -ForegroundColor Green

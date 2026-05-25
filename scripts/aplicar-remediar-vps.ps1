# Envia e executa remediacao 502 na VPS (pede senha SSH uma vez)
# Uso: .\scripts\aplicar-remediar-vps.ps1

$ErrorActionPreference = "Stop"
$Host_ = "root@147.93.185.146"
$Root = Split-Path -Parent $PSScriptRoot
$Script = Join-Path $Root "infra\scripts\vps-remediar-completo.sh"

if (-not (Test-Path $Script)) {
  throw "Nao encontrado: $Script"
}

Write-Host "Remediar VPS (Docker + compose + health)..." -ForegroundColor Cyan
Write-Host "Vai pedir a senha SSH de root@147.93.185.146" -ForegroundColor Yellow

scp $Script "${Host_}:/tmp/vps-remediar-completo.sh"
ssh $Host_ "chmod +x /tmp/vps-remediar-completo.sh && bash /tmp/vps-remediar-completo.sh"

Write-Host ""
Write-Host "Teste: curl.exe -s http://app.granjauniao.com.br/api/health" -ForegroundColor Green

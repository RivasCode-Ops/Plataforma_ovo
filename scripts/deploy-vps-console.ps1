# Gera um unico bloco para colar no CONSOLE WEB da VPS (sem SSH do PC).
# Uso: .\scripts\deploy-vps-console.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$envProd = Join-Path $Root "infra\.env.prod"
$out = Join-Path $PSScriptRoot "COLAR_NO_CONSOLE_VPS.txt"

$token = ""
if (Test-Path $envProd) {
  $m = Select-String -Path $envProd -Pattern '^SITE_PEDIDO_TOKEN=' | Select-Object -First 1
  if ($m) { $token = $m.Line -replace '^SITE_PEDIDO_TOKEN=', '' }
}

if (-not $token) {
  Write-Host "SITE_PEDIDO_TOKEN ausente em infra/.env.prod" -ForegroundColor Red
  exit 1
}

$escaped = $token -replace "'", "'\''"
$block = @"
cd /opt/Plataforma_ovo && git pull --ff-only && export DEPLOY_SITE_TOKEN='$escaped' && bash infra/scripts/vps-deploy-atualizacao.sh
"@

[System.IO.File]::WriteAllText($out, $block.Trim())
try { Set-Clipboard -Value $block.Trim() } catch {}

Write-Host ""
Write-Host "Arquivo: $out" -ForegroundColor Green
Write-Host "Bloco copiado para a area de transferencia." -ForegroundColor Green
Write-Host ""
Write-Host "No painel da VPS (Contabo etc.): abra o Console web, cole e Enter." -ForegroundColor Cyan
Write-Host ""

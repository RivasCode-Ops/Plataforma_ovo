# Um unico bloco para colar no console Contabo (deploy + HTTPS)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$envProd = Join-Path $Root "infra\.env.prod"
$out = Join-Path $PSScriptRoot "COLAR_TUDO_VPS.txt"

$token = ""
if (Test-Path $envProd) {
  $m = Select-String -Path $envProd -Pattern '^SITE_PEDIDO_TOKEN=' | Select-Object -First 1
  if ($m) { $token = $m.Line -replace '^SITE_PEDIDO_TOKEN=', '' }
}
$escaped = $token -replace "'", "'\''"

$block = @"
cd /opt/Plataforma_ovo && git pull --ff-only && export DEPLOY_SITE_TOKEN='$escaped' && bash infra/scripts/vps-fazer-tudo.sh
"@.Trim()

[System.IO.File]::WriteAllText($out, $block)
try { Set-Clipboard -Value $block } catch {}

Write-Host "Gerado: $out" -ForegroundColor Green
Write-Host "Copiado para area de transferencia." -ForegroundColor Green
Write-Host "Cole no console web Contabo e aguarde (5-15 min)." -ForegroundColor Cyan

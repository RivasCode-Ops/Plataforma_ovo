# Gera infra/.env.prod com senhas aleatorias (nao commitar .env.prod)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$example = Join-Path $root "infra\env.prod.example"
$dest = Join-Path $root "infra\.env.prod"

if (-not (Test-Path $example)) {
  Write-Host "Arquivo nao encontrado: $example" -ForegroundColor Red
  exit 1
}

function New-Secret([int]$len = 32) {
  $bytes = New-Object byte[] $len
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  [Convert]::ToBase64String($bytes) -replace '[^a-zA-Z0-9]', 'x'
}

$pg = New-Secret 24
$jwt = New-Secret 48
$admin = New-Secret 16
$webhook = New-Secret 24
$sitePedido = New-Secret 24

$content = Get-Content $example -Raw
$content = $content -replace 'TROQUE_SENHA_FORTE_AQUI', $pg
$content = $content -replace 'TROQUE_STRING_LONGA_ALEATORIA', $jwt
$content = $content -replace 'TROQUE_SENHA_ADMIN', $admin
$content = $content -replace 'TROQUE_WEBHOOK_SECRET', $webhook
$content = $content -replace 'TROQUE_SITE_PEDIDO_TOKEN', $sitePedido

Set-Content -Path $dest -Value $content -Encoding UTF8

Write-Host ""
Write-Host "Criado: infra/.env.prod" -ForegroundColor Green
Write-Host "Revise CORS_ORIGIN, PIX e GRANJA_PIX_CHAVE antes do deploy." -ForegroundColor Yellow
Write-Host ""
Write-Host "Login admin gerado (anote agora):" -ForegroundColor Cyan
Write-Host "  usuario: admin" -ForegroundColor White
Write-Host "  senha:   $admin" -ForegroundColor White
Write-Host ""
Write-Host "Site (build do GitHub Pages / .env.production):" -ForegroundColor Cyan
Write-Host "  VITE_SITE_PEDIDO_TOKEN=$sitePedido" -ForegroundColor White
Write-Host ""

# Deploy local na VPS Windows ou máquina com Docker
$ErrorActionPreference = "Stop"
$infra = Split-Path -Parent $PSScriptRoot
Set-Location $infra

if (-not (Test-Path ".env.prod")) {
    Copy-Item "env.prod.example" ".env.prod"
    Write-Host "Criado .env.prod — EDITE as senhas antes de continuar!" -ForegroundColor Yellow
    exit 1
}

Write-Host "Build e subida (producao)..." -ForegroundColor Cyan
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build

Write-Host ""
Write-Host "Painel: http://localhost (porta HTTP_PORT no .env.prod)" -ForegroundColor Green
Write-Host "Health: http://localhost/api/health" -ForegroundColor Green
docker compose --env-file .env.prod -f docker-compose.prod.yml ps

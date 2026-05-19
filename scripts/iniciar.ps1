# Inicia Plataforma Ovo (API + painel) - uso diario na granja
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  Plataforma Ovo - iniciando..." -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $root "backend"
if (-not (Test-Path (Join-Path $backendPath "node_modules"))) {
    Write-Host "Instalando dependencias do backend..." -ForegroundColor Yellow
    Push-Location $backendPath
    npm install
    Pop-Location
}

$frontendPath = Join-Path $root "frontend"
if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    Write-Host "Instalando dependencias do frontend..." -ForegroundColor Yellow
    Push-Location $frontendPath
    npm install
    Pop-Location
}

Write-Host "Abrindo API (porta 3000) e painel (porta 5173)..." -ForegroundColor Green
Write-Host ""
Write-Host "  Painel:  http://localhost:5173" -ForegroundColor White
Write-Host "  Login:   admin / plataforma123" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Feche as janelas do terminal para encerrar." -ForegroundColor DarkGray
Write-Host ""

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; `$env:USE_MEMORY_DB='1'; npm run dev:local"
)

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; npm run dev"
)

Start-Sleep -Seconds 4
Start-Process -FilePath "http://localhost:5173"

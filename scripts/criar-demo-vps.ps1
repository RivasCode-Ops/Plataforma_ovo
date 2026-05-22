# Cria usuario demo na VPS (login demo / senha demo123)
# Uso: .\scripts\criar-demo-vps.ps1

$ErrorActionPreference = "Stop"
$Host_ = "root@147.93.185.146"

Write-Host "Atualiza codigo e cria usuario demo na VPS..." -ForegroundColor Cyan
Write-Host ""

$cmd = @'
cd /opt/Plataforma_ovo && git pull
cd infra
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build backend
sleep 5
docker exec plataforma_ovo_api node scripts/criar-usuario-demo.js
'@ -replace "`r`n", "`n" -replace "`r", ""

$cmd | ssh $Host_ "bash -s"

Write-Host ""
Write-Host "Acesso:" -ForegroundColor Green
Write-Host "  http://app.granjauniao.com.br" -ForegroundColor White
Write-Host "  Login: demo" -ForegroundColor White
Write-Host "  Senha: demo123" -ForegroundColor White
Write-Host ""

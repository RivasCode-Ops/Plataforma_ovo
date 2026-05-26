# Go-live: abre UptimeRobot + instrucoes; testa API do PC
# Uso: .\scripts\go-live-agora.ps1

$Base = "https://app.granjauniao.com.br"
$ErrorActionPreference = "Continue"

Write-Host "=== 1. Teste API (PC -> producao) ===" -ForegroundColor Cyan
try {
  $health = curl.exe -s --connect-timeout 15 "$Base/api/health"
  Write-Host "Health: $health"
  if ($health -notmatch '"ok":true') { Write-Host "AVISO: health inesperado" -ForegroundColor Yellow }
} catch {
  Write-Host "AVISO: nao alcancou $Base do PC (normal se rede bloquear). Teste na VPS." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 2. UptimeRobot (abrindo no navegador) ===" -ForegroundColor Cyan
Write-Host @"
Preencha:
  Monitor Type: HTTPS
  URL: $Base/api/health
  Interval: 5 minutes
  Alert: seu email
"@

Start-Process "https://uptimerobot.com/signUp"
Start-Sleep 1
Start-Process "https://dashboard.uptimerobot.com/monitors/new/http"

Write-Host ""
Write-Host "=== 3. Teste pedido completo (na VPS) ===" -ForegroundColor Cyan
Write-Host "No SSH, cole:"
Write-Host "  bash /opt/Plataforma_ovo/infra/scripts/vps-go-live-teste.sh" -ForegroundColor Green
Write-Host ""
Write-Host "Depois abra o painel -> Pedidos do dia -> pedido 'Teste Go-Live'" -ForegroundColor White

# Prova local — sobe API + painel e valida endpoints (sem Docker)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "=== Plataforma Ovo — Prova Local ===" -ForegroundColor Cyan

# Backend
$backendJob = Start-Job -ScriptBlock {
  Set-Location $using:root\backend
  $env:USE_MEMORY_DB = "1"
  $env:PORT = "3000"
  $env:CORS_ORIGIN = "http://localhost:5173"
  npm run start:local 2>&1
}

Start-Sleep -Seconds 3

try {
  $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
  Write-Host "[OK] API health:" ($health | ConvertTo-Json -Compress) -ForegroundColor Green

  $produtos = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos" -Method Get
  Write-Host "[OK] Produtos:" $produtos.data.Count -ForegroundColor Green

  $pedidoBody = @{
    cliente = @{ nome = "Cliente Teste"; telefone = "11999990000"; endereco = "Rua da Granja, 1" }
    itens = @(@{ produto_id = 1; quantidade = 2 })
  } | ConvertTo-Json -Depth 5

  $pedido = Invoke-RestMethod -Uri "http://localhost:3000/api/pedidos" -Method Post -Body $pedidoBody -ContentType "application/json"
  Write-Host "[OK] Pedido criado #"$pedido.data.pedido_id "total R$"$pedido.data.total -ForegroundColor Green

  $cardapio = Invoke-WebRequest -Uri "http://localhost:3000/api/cardapio-whatsapp" -UseBasicParsing
  Write-Host "[OK] Cardapio WhatsApp:" $cardapio.Content.Split("`n")[0] -ForegroundColor Green

  Write-Host ""
  Write-Host "Prova API concluida. Suba o painel em outro terminal:" -ForegroundColor Yellow
  Write-Host "  cd frontend" -ForegroundColor White
  Write-Host "  npm run dev" -ForegroundColor White
  Write-Host "  http://localhost:5173" -ForegroundColor White
  Write-Host ""
  Write-Host "API: http://localhost:3000/api/health" -ForegroundColor White

  $provaFile = Join-Path $root "docs\PROVA_LOCAL_RESULTADO.txt"
  @"
Prova local executada em: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
API: http://localhost:3000
Painel: http://localhost:5173
Health: OK
Produtos: $($produtos.data.Count)
Pedido teste: #$($pedido.data.pedido_id) — R$ $($pedido.data.total)
"@ | Set-Content -Path $provaFile -Encoding UTF8
  Write-Host "Resultado salvo em docs/PROVA_LOCAL_RESULTADO.txt" -ForegroundColor Cyan
}
catch {
  Write-Host "[ERRO]" $_.Exception.Message -ForegroundColor Red
  Receive-Job $backendJob
  exit 1
}
finally {
  Write-Host "Encerrando API de prova..." -ForegroundColor DarkGray
  Stop-Job $backendJob -ErrorAction SilentlyContinue
  Remove-Job $backendJob -Force -ErrorAction SilentlyContinue
  Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*Plataforma_ovo*" } | Stop-Process -Force -ErrorAction SilentlyContinue
}

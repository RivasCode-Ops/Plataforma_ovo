# Ativa HTTPS na VPS (certificado Let's Encrypt + Nginx 443)
# Uso: .\scripts\ativar-https-vps.ps1

$ErrorActionPreference = "Stop"
$Host_ = "root@147.93.185.146"
$Root = Split-Path -Parent $PSScriptRoot
$Bash = Join-Path $Root "infra\scripts\vps-ativar-https.sh"

if (-not (Test-Path $Bash)) {
  throw "Nao encontrado: $Bash"
}

Write-Host ""
Write-Host "HTTPS em app.granjauniao.com.br (senha SSH 1x)..." -ForegroundColor Cyan
Write-Host "NAO usa --force-renewal (evita rate limit Let's Encrypt)." -ForegroundColor DarkGray
Write-Host ""

$scriptContent = (Get-Content $Bash -Raw -Encoding UTF8) -replace "`r`n", "`n" -replace "`r", ""
$scriptContent | ssh $Host_ "bash -s"

if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Falhou — cole a saida do terminal para analise." -ForegroundColor Red
  Write-Host "Enquanto isso: http://app.granjauniao.com.br" -ForegroundColor Yellow
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Teste no navegador: https://app.granjauniao.com.br" -ForegroundColor Green
Write-Host ""

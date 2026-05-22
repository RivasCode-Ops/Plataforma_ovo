# Corrige VPS em UMA conexao SSH (sem scp)
# Uso: .\scripts\corrigir-vps-tudo.ps1

$ErrorActionPreference = "Stop"
$Host_ = "root@147.93.185.146"
$Root = Split-Path -Parent $PSScriptRoot
$Bash = Join-Path $Root "infra\scripts\vps-corrigir-tudo.sh"

if (-not (Test-Path $Bash)) {
  throw "Nao encontrado: $Bash"
}

Write-Host ""
Write-Host "Conectando na VPS (pede senha 1 vez)..." -ForegroundColor Yellow
Write-Host ""

# Remove CRLF do Windows (evita erro "namepefail" no bash da VPS)
$scriptContent = (Get-Content $Bash -Raw -Encoding UTF8) -replace "`r`n", "`n" -replace "`r", ""
$scriptContent | ssh $Host_ "bash -s"
$sshExit = $LASTEXITCODE

# Ignora erro de CRLF residual no ultimo echo do bash
if ($sshExit -ne 0) {
  Write-Host ""
  Write-Host "ERRO na VPS. Veja a mensagem acima." -ForegroundColor Red
  Write-Host "Alternativa: ssh root@147.93.185.146" -ForegroundColor Yellow
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host 'OK - abra: http://app.granjauniao.com.br' -ForegroundColor Green
Write-Host 'Login: admin | Senha no arquivo infra\.env.prod' -ForegroundColor Green
Write-Host ""

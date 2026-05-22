# Deploy na VPS: migracoes D+E, rebuild backend/painel
# Uso: .\scripts\deploy-atualizacao-vps.ps1
# Sem chave SSH: .\scripts\deploy-vps-console.ps1  (colar no console web da VPS)

param(
  [switch]$ComSenha,
  [switch]$ConfigurarChave
)

$ErrorActionPreference = "Stop"
$Vps = "root@147.93.185.146"
$Root = Split-Path -Parent $PSScriptRoot
$Bash = Join-Path $Root "infra\scripts\vps-deploy-atualizacao.sh"
$Key = Join-Path $env:USERPROFILE ".ssh\id_ed25519_plataforma_ovo"

if ($ConfigurarChave) {
  & (Join-Path $PSScriptRoot "configurar-ssh-vps.ps1") @PSBoundParameters
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Deploy atualizacao (pedido site + desconto lote)" -ForegroundColor Cyan
Write-Host ""

$token = ""
$envProd = Join-Path $Root "infra\.env.prod"
if (Test-Path $envProd) {
  $m = Select-String -Path $envProd -Pattern '^SITE_PEDIDO_TOKEN=' | Select-Object -First 1
  if ($m) { $token = $m.Line -replace '^SITE_PEDIDO_TOKEN=', '' }
}

$scriptContent = (Get-Content $Bash -Raw -Encoding UTF8) -replace "`r`n", "`n" -replace "`r", ""
$remoteCmd = if ($token) {
  $escaped = $token -replace "'", "'\''"
  "DEPLOY_SITE_TOKEN='$escaped' bash -s"
} else {
  "bash -s"
}

function Invoke-DeploySsh {
  param([string[]]$ExtraArgs)
  $all = $ExtraArgs + $Vps $remoteCmd
  $scriptContent | & ssh @all
  return $LASTEXITCODE
}

$exitCode = 1

if ((Test-Path $Key) -and -not $ComSenha) {
  Write-Host "Conectando com chave SSH..." -ForegroundColor DarkGray
  $exitCode = Invoke-DeploySsh @(
    "-i", $Key,
    "-o", "BatchMode=yes",
    "-o", "ConnectTimeout=15",
    "-o", "StrictHostKeyChecking=accept-new"
  )
}

if ($exitCode -ne 0 -and $ComSenha) {
  Write-Host "Conectando com senha SSH..." -ForegroundColor Yellow
  $exitCode = Invoke-DeploySsh @(
    "-o", "PreferredAuthentications=password",
    "-o", "PubkeyAuthentication=no"
  )
}

if ($exitCode -ne 0) {
  Write-Host ""
  Write-Host "SSH falhou." -ForegroundColor Red
  Write-Host ""
  Write-Host "Caminho mais facil (sem SSH do PC):" -ForegroundColor Yellow
  Write-Host "  .\scripts\deploy-vps-console.ps1" -ForegroundColor White
  Write-Host "  Cole o bloco no console web da VPS (Contabo)." -ForegroundColor White
  Write-Host ""
  Write-Host "Para nao pedir senha da proxima vez:" -ForegroundColor Yellow
  Write-Host "  .\scripts\configurar-ssh-vps.ps1" -ForegroundColor White
  Write-Host "  (instale a chave no console web; depois rode este script de novo)" -ForegroundColor DarkGray
  Write-Host ""
  exit $exitCode
}

Write-Host ""
Write-Host "VPS atualizada." -ForegroundColor Green
Write-Host "Site: branch gh-pages ou secret VITE_SITE_PEDIDO_TOKEN no GitHub." -ForegroundColor DarkGray
Write-Host "Teste: https://app.granjauniao.com.br/api/health" -ForegroundColor DarkGray
Write-Host "       https://granjauniao.com.br#pedido" -ForegroundColor DarkGray
Write-Host ""

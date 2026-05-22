# Chave SSH para deploy sem senha. Rode UMA vez.
# Uso: .\scripts\configurar-ssh-vps.ps1
#      .\scripts\configurar-ssh-vps.ps1 -ComSenha

param([switch]$ComSenha)

$ErrorActionPreference = "Stop"
$Vps = "root@147.93.185.146"
$Key = Join-Path $env:USERPROFILE ".ssh\id_ed25519_plataforma_ovo"

if (-not (Test-Path (Split-Path $Key))) {
  New-Item -ItemType Directory -Path (Split-Path $Key) -Force | Out-Null
}

if (-not (Test-Path $Key)) {
  Write-Host "Criando chave SSH..." -ForegroundColor Cyan
  ssh-keygen -t ed25519 -f $Key -N '""' -q -C "plataforma-ovo-deploy"
}

$pub = (Get-Content "$Key.pub" -Raw).Trim()

$linha1 = "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
$linha2 = "echo '$pub' >> ~/.ssh/authorized_keys"
$linha3 = "chmod 600 ~/.ssh/authorized_keys"
$bloco = "$linha1`n$linha2`n$linha3"

Write-Host ""
Write-Host "=== Instalar chave na VPS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPCAO 1 - Console web do provedor (recomendado):" -ForegroundColor Yellow
Write-Host "Cole estas 3 linhas no terminal da VPS:" -ForegroundColor White
Write-Host ""
Write-Host $linha1
Write-Host $linha2
Write-Host $linha3
Write-Host ""

try {
  Set-Clipboard -Value $bloco
  Write-Host "Comandos copiados para a area de transferencia." -ForegroundColor Green
} catch {
  Write-Host "Copie manualmente as 3 linhas acima." -ForegroundColor DarkYellow
}

if ($ComSenha) {
  Write-Host ""
  Write-Host "OPCAO 2 - Senha SSH (ultima vez):" -ForegroundColor Yellow
  $pub | ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no $Vps `
    "mkdir -p ~/.ssh; chmod 700 ~/.ssh; cat >> ~/.ssh/authorized_keys; chmod 600 ~/.ssh/authorized_keys"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Falhou. Use a OPCAO 1 no console web." -ForegroundColor Red
    exit 1
  }
  Write-Host "Chave instalada via SSH." -ForegroundColor Green
}

Write-Host ""
Write-Host "Teste (sem senha):" -ForegroundColor Cyan
ssh -i $Key -o BatchMode=yes -o ConnectTimeout=10 $Vps "echo SSH_OK"
if ($LASTEXITCODE -eq 0) {
  Write-Host "OK! Agora rode: .\scripts\deploy-atualizacao-vps.ps1" -ForegroundColor Green
} else {
  Write-Host "Ainda sem acesso. Instale a chave (OPCAO 1) e rode o teste de novo." -ForegroundColor Yellow
}

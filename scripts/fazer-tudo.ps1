# Automatiza tudo que o PC consegue; VPS = 1 colar no Contabo
# Uso: .\scripts\fazer-tudo.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "=== FAZER TUDO - Granja Uniao / meuzovo ===" -ForegroundColor Cyan
Write-Host ""

# Git push se houver alteracoes locais
Push-Location $Root
$status = git status --porcelain 2>$null
if ($status) {
  Write-Host "Aviso: ha alteracoes locais nao commitadas. Commit manual se precisar." -ForegroundColor Yellow
}
git push origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "Git: main atualizado no GitHub." -ForegroundColor Green }
Pop-Location

# Site gh-pages com token
Write-Host ""
Write-Host "Publicando site (gh-pages)..." -ForegroundColor Cyan
& (Join-Path $PSScriptRoot "publicar-site-build.ps1")

# Bloco unico VPS
Write-Host ""
& (Join-Path $PSScriptRoot "gerar-vps-tudo-console.ps1")

# Abrir links uteis
$links = @(
  "https://my.contabo.com/vps",
  "https://github.com/RivasCode-Ops/granjauniao-site/settings/pages"
)
foreach ($u in $links) {
  try { Start-Process $u } catch {}
}

Write-Host ""
Write-Host "========== VOCE (obrigatorio) ==========" -ForegroundColor Yellow
Write-Host "1. Contabo -> Console da VPS -> Ctrl+V -> Enter" -ForegroundColor White
Write-Host "   (bloco em COLAR_TUDO_VPS.txt)" -ForegroundColor DarkGray
Write-Host "2. GitHub Pages: Custom domain granjauniao.com.br" -ForegroundColor White
Write-Host "   Source: gh-pages / (root) | Enforce HTTPS" -ForegroundColor DarkGray
Write-Host ""

# Tentar SSH com chave
$key = Join-Path $env:USERPROFILE ".ssh\id_ed25519_plataforma_ovo"
if (Test-Path $key) {
  Write-Host "Tentando deploy via SSH (chave)..." -ForegroundColor DarkGray
  & (Join-Path $PSScriptRoot "deploy-atualizacao-vps.ps1") 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Deploy SSH OK - pode pular o console Contabo." -ForegroundColor Green
    $https = Get-Content (Join-Path $PSScriptRoot "COLAR_HTTPS_VPS.txt") -Raw
    $https | ssh -i $key -o BatchMode=yes -o ConnectTimeout=15 root@147.93.185.146 "bash -s" 2>$null
  }
}

Write-Host ""
Write-Host "Testes finais:" -ForegroundColor Cyan
$urls = @(
  "http://app.granjauniao.com.br/api/health",
  "https://app.granjauniao.com.br/api/health",
  "https://granjauniao.com.br",
  "https://granjauniao.com.br#pedido"
)
foreach ($url in $urls) {
  try {
    $null = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15 -MaximumRedirection 3
    Write-Host "  OK $url" -ForegroundColor Green
  } catch {
    Write-Host "  -- $url" -ForegroundColor Yellow
  }
}
Write-Host ""

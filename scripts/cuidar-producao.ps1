# Checklist: deploy VPS + site + HTTPS
# Uso: .\scripts\cuidar-producao.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "=== meuzovo / Granja Uniao - producao ===" -ForegroundColor Cyan
Write-Host ""

& (Join-Path $PSScriptRoot "deploy-vps-console.ps1")

Write-Host ""
Write-Host "PASSO 1 - Console web Contabo" -ForegroundColor Yellow
Write-Host "Cole o bloco acima. Aguarde === Pronto ===" -ForegroundColor White
Write-Host ""

$httpsBlock = (Get-Content (Join-Path $PSScriptRoot "COLAR_HTTPS_VPS.txt") -Raw).Trim()
try { Set-Clipboard -Value $httpsBlock } catch {}
Write-Host "PASSO 2 - Mesmo console: ativar HTTPS" -ForegroundColor Yellow
Write-Host $httpsBlock -ForegroundColor White
Write-Host ""

Write-Host "PASSO 3 - GitHub Pages no PC" -ForegroundColor Yellow
Write-Host "  https://github.com/RivasCode-Ops/granjauniao-site/settings/pages" -ForegroundColor White
Write-Host "  Custom domain granjauniao.com.br | Source gh-pages root" -ForegroundColor White
Write-Host "  Site ja publicado: publicar-site-build.ps1" -ForegroundColor White
Write-Host ""

Write-Host "Testes:" -ForegroundColor Yellow
$urls = @(
  "http://app.granjauniao.com.br/api/health",
  "https://app.granjauniao.com.br/api/health",
  "http://granjauniao.com.br",
  "https://granjauniao.com.br"
)
foreach ($url in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 12 -MaximumRedirection 3
    Write-Host "  OK $($r.StatusCode) $url" -ForegroundColor Green
  } catch {
    Write-Host "  FALHA $url" -ForegroundColor DarkYellow
  }
}

Write-Host ""
Write-Host "Chave SSH: configurar-ssh-vps.ps1" -ForegroundColor DarkGray
Write-Host ""

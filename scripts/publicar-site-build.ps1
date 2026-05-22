# Build local com token de infra/.env.prod e publica out/ na branch gh-pages
# Uso: .\scripts\publicar-site-build.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$SiteDir = Join-Path $Root "site"
$OutDir = Join-Path $SiteDir "out"
$EnvProd = Join-Path $Root "infra\.env.prod"
$RepoName = "granjauniao-site"
$Org = "RivasCode-Ops"
$Remote = "https://github.com/$Org/$RepoName.git"
$TempDir = Join-Path $env:TEMP ("granjauniao-ghpages-" + (Get-Date -Format "yyyyMMddHHmmss"))

$tokenLine = Select-String -Path $EnvProd -Pattern '^SITE_PEDIDO_TOKEN=' | Select-Object -First 1
if (-not $tokenLine) {
  Write-Host "SITE_PEDIDO_TOKEN ausente em infra/.env.prod" -ForegroundColor Red
  exit 1
}
$token = $tokenLine.Line -replace '^SITE_PEDIDO_TOKEN=', ''

Push-Location $SiteDir
try {
  $env:VITE_API_URL = "https://app.granjauniao.com.br"
  $env:VITE_SITE_PEDIDO_TOKEN = $token
  npm run build | Out-Host
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

if (-not (Test-Path (Join-Path $OutDir "index.html"))) {
  Write-Host "Build falhou: out/index.html nao encontrado" -ForegroundColor Red
  exit 1
}

if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
New-Item -ItemType Directory -Path $TempDir | Out-Null
Copy-Item "$OutDir\*" $TempDir -Recurse -Force

Push-Location $TempDir
try {
  git init -b gh-pages | Out-Null
  git add -A
  git commit -m "deploy: site estatico com pedido online" | Out-Null
  git remote add origin $Remote
  git push -u origin gh-pages --force
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "OK: branch gh-pages atualizada em $Org/$RepoName" -ForegroundColor Green
Write-Host "Se o formulario nao aparecer: Pages -> Source = Deploy from branch gh-pages / (root)" -ForegroundColor Yellow
Write-Host "Ou adicione secret VITE_SITE_PEDIDO_TOKEN e use GitHub Actions (main)." -ForegroundColor Yellow

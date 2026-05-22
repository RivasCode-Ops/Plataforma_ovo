# Publica a pasta site/ em um repositorio GitHub dedicado (GitHub Pages gratis)
# Uso: .\scripts\publicar-site-github.ps1

param(
  [string]$RepoName = "granjauniao-site",
  [string]$Org = "RivasCode-Ops",
  [switch]$CreateRepo
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$SiteDir = Join-Path $Root "site"
$TempDir = Join-Path $env:TEMP ("granjauniao-site-publish-" + (Get-Date -Format "yyyyMMddHHmmss"))
$Remote = "https://github.com/$Org/$RepoName.git"
$PagesUrl = "https://" + $Org.ToLower() + ".github.io/" + $RepoName + "/"

Write-Host "Origem: $SiteDir" -ForegroundColor Cyan
Write-Host "Destino: $Remote" -ForegroundColor Cyan

if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
New-Item -ItemType Directory -Path $TempDir | Out-Null

Get-ChildItem $SiteDir -Force | Where-Object {
  $_.Name -ne "node_modules" -and $_.Name -ne "out" -and $_.Name -notlike "*.zip"
} | ForEach-Object {
  Copy-Item $_.FullName -Destination (Join-Path $TempDir $_.Name) -Recurse -Force
}

$envProd = Join-Path $Root "infra\.env.prod"
$siteToken = ""
if (Test-Path $envProd) {
  foreach ($line in Get-Content $envProd) {
    if ($line -match '^\s*SITE_PEDIDO_TOKEN=(.+)$') {
      $siteToken = $Matches[1].Trim().Trim('"')
      break
    }
  }
}
if ($siteToken) {
  @"
VITE_API_URL=https://app.granjauniao.com.br
VITE_SITE_PEDIDO_TOKEN=$siteToken
"@ | Set-Content (Join-Path $TempDir ".env.production") -Encoding UTF8
  Write-Host "Gerado .env.production local (nao vai para o Git)." -ForegroundColor Cyan
} else {
  Write-Host "AVISO: infra/.env.prod sem SITE_PEDIDO_TOKEN - configure secret VITE_SITE_PEDIDO_TOKEN no GitHub." -ForegroundColor Yellow
}

$gitignore = Join-Path $TempDir ".gitignore"
if (Test-Path $gitignore) {
  if (-not (Select-String -Path $gitignore -Pattern '\.env\.production' -Quiet)) {
    Add-Content -Path $gitignore -Value ".env.production"
  }
} else {
  Set-Content -Path $gitignore -Value ".env.production`n" -Encoding UTF8
}

Push-Location $TempDir
try {
  if (-not (Test-Path ".git")) {
    git init -b main | Out-Null
  }

  git add -A
  $status = git status --porcelain
  if (-not $status) {
    Write-Host "Nada para publicar (sem alteracoes)." -ForegroundColor Yellow
    exit 0
  }

  $env:GIT_AUTHOR_NAME = "RivasCode-Ops"
  $env:GIT_AUTHOR_EMAIL = "dev@rivascode.local"
  $env:GIT_COMMITTER_NAME = "RivasCode-Ops"
  $env:GIT_COMMITTER_EMAIL = "dev@rivascode.local"
  git commit -m "chore: site Granja Uniao" | Out-Null

  $remotes = @(git remote)
  if ($remotes -contains "origin") {
    git remote remove origin
  }
  git remote add origin $Remote

  if ($CreateRepo -and (Get-Command gh -ErrorAction SilentlyContinue)) {
    gh repo create "$Org/$RepoName" --public --source=. --remote=origin --push
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Repo pode ja existir, tentando push..." -ForegroundColor Yellow
      git push -u origin main --force
    }
  } else {
    git push -u origin main --force
  }

  Write-Host ""
  Write-Host "OK! Configure Pages em:" -ForegroundColor Green
  Write-Host ("  https://github.com/" + $Org + "/" + $RepoName + "/settings/pages")
  Write-Host "  Source: GitHub Actions"
  Write-Host ("  URL: " + $PagesUrl)
} finally {
  Pop-Location
}

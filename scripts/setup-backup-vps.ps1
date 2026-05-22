# Configura backup automatico na VPS (cron 3h + teste)
# Uso: .\scripts\setup-backup-vps.ps1

$ErrorActionPreference = "Stop"
$Host_ = "root@147.93.185.146"
$Root = Split-Path -Parent $PSScriptRoot
$Bash = Join-Path $Root "infra\scripts\vps-setup-backup.sh"

Write-Host "Configurando backup na VPS (senha SSH 1x)..." -ForegroundColor Cyan
$scriptContent = (Get-Content $Bash -Raw -Encoding UTF8) -replace "`r`n", "`n" -replace "`r", ""
$scriptContent | ssh $Host_ "bash -s"

Write-Host ""
Write-Host "Backup diario as 3h em /var/backups/plataforma_ovo" -ForegroundColor Green
Write-Host "Log: /var/log/plataforma_backup.log" -ForegroundColor Green

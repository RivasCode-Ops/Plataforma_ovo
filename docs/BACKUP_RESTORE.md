# Backup e Restore - meuzovo

## Backup automático (produção)

O script `infra/scripts/backup.sh` gera dump diário do PostgreSQL (`.sql.gz`).

### Instalação rápida (VPS)

**Windows:**

```powershell
cd C:\_PROJETOS\Plataforma_ovo
.\scripts\setup-backup-vps.ps1
```

**Na VPS:**

```bash
cd /opt/Plataforma_ovo && git pull
bash infra/scripts/vps-setup-backup.sh
```

### O que faz

| Item | Valor |
|------|--------|
| Horário | Todo dia às **3h** (cron) |
| Pasta | `/var/backups/plataforma_ovo/` |
| Retenção | **14 dias** |
| Log | `/var/log/plataforma_backup.log` |

### Cópia externa

Copie `/var/backups/plataforma_ovo/` para Google Drive ou outro servidor **semanalmente**.

## Backup manual

Com Docker na VPS:

```bash
docker exec plataforma_ovo_db pg_dump -U plataforma plataforma_ovo | gzip > /var/backups/plataforma_ovo/manual_$(date +%F).sql.gz
```

## Restore

**Atenção:** restore substitui todos os dados atuais. Pare o backend antes.

```bash
cd /opt/Plataforma_ovo/infra
docker compose --env-file .env.prod -f docker-compose.prod.yml stop backend web
gunzip -c /var/backups/plataforma_ovo/SEU_ARQUIVO.sql.gz | docker exec -i plataforma_ovo_db psql -U plataforma -d plataforma_ovo
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d backend web
```

## Teste de restore

Faça restore em ambiente de teste pelo menos uma vez por trimestre.

## O que incluir no backup

- Dump PostgreSQL (obrigatório — cron acima)
- Arquivo `.env.prod` do servidor (local seguro, **não** no Git)
- Configuração Nginx em `/etc/nginx/sites-available/`

# Backup e Restore - meuzovo

## Backup automático (produção)

O script `infra/scripts/backup.sh` gera dump diário do PostgreSQL.

### Configuração

1. No servidor, defina cron (ex.: 3h da manhã):

```bash
0 3 * * * /opt/plataforma_ovo/infra/scripts/backup.sh >> /var/log/plataforma_backup.log 2>&1
```

2. Backups ficam em `infra/backups/` (ou caminho definido em `BACKUP_DIR`).

3. Copie backups para outro local (Google Drive, outro servidor) semanalmente.

## Backup manual

Com Docker:

```powershell
cd infra
docker compose exec postgres pg_dump -U plataforma plataforma_ovo > backups/manual_$(Get-Date -Format yyyyMMdd_HHmm).sql
```

## Restore

**Atenção:** restore substitui todos os dados atuais. Pare o backend antes.

```powershell
cd infra
docker compose exec -T postgres psql -U plataforma -d plataforma_ovo < backups/SEU_ARQUIVO.sql
```

Ou, para banco vazio:

```powershell
docker compose down
# Remova volume postgres-data se necessário (CUIDADO)
docker compose up -d postgres
# Aguarde subir, então:
docker compose exec -T postgres psql -U plataforma -d plataforma_ovo < backups/SEU_ARQUIVO.sql
```

## Teste de restore

Faça restore em ambiente de teste pelo menos uma vez por trimestre.

## O que incluir no backup

- Dump PostgreSQL (obrigatório)
- Arquivo `.env` do servidor (guardado em local seguro, **não** no Git)
- Configuração Nginx (`infra/nginx.conf`)

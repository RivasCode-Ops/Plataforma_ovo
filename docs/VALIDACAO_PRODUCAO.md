# Validação crítica — prontidão para produção

> Agente 12 (validador). Última revisão alinhada ao estado do piloto Granja União.

**Decisão:** **AJUSTAR** — não liberar cliente externo até checklist verde abaixo.

**Nota:** 4,5 / 10 (código ~7; infra produção ~2).

---

## Bloqueadores (CRÍTICO — resolver primeiro)

| # | Item | Como validar |
|---|------|----------------|
| 1 | HTTPS app (`443`) | `curl -sf https://app.granjauniao.com.br/api/health` |
| 2 | Deploy VPS completo | `COLAR_TUDO_VPS.txt` no console Contabo sem erro |
| 3 | Migração desconto lote | Colunas `desconto_*` em `lotes` (008) |
| 4 | Token site = VPS = build | Pedido em `granjauniao.com.br#pedido` → painel |
| 5 | Backup ativo | Arquivo em `/var/backups/plataforma_ovo` últimas 24h |

---

## Dez riscos (resumo)

| Risco | Sev. | Ação |
|-------|------|------|
| HTTPS inativo | CRÍTICO | `vps-fazer-tudo.sh` / `vps-ativar-https.sh` |
| Deploy VPS pendente | CRÍTICO | Console Contabo |
| Acesso Contabo/SSH | ALTO | Recuperar painel + reset root |
| Token no histórico Git (site) | ALTO | Rotacionar + `gerar-vps-tudo-console.ps1` |
| Backup não confirmado | ALTO | `setup-backup-vps.ps1` |
| Rate limit em memória | MÉDIO | nginx `limit_req` (futuro) |
| CORS/token desalinhados | MÉDIO | `fazer-tudo.ps1` |
| Race estoque | MÉDIO | Teste 2 operadores |
| Rate limit Let's Encrypt | ALTO | Sem `--force-renewal` |
| Pages domínio/HTTPS | MÉDIO | Custom domain + `gh-pages` |

---

## Rollback rápido

```bash
cd /opt/Plataforma_ovo && git checkout <commit-anterior>
cd infra && docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
# Restore: ver docs/BACKUP_RESTORE.md
```

---

## Incidente (comunicação)

- **Cliente:** usar WhatsApp (89) 99975-4044 até sistema OK.
- **Operador:** não confirmar pedidos duplicados do site até validação.
- **Interno:** hora, URL, print, último deploy, último backup.

---

Ver checklist operacional: [CHECKLIST_GO_LIVE.md](CHECKLIST_GO_LIVE.md) · Deploy: [DEPLOY_VPS_PASSO_A_PASSO.md](DEPLOY_VPS_PASSO_A_PASSO.md)

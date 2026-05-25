# Retrofit — Plataforma_ovo / meuzovo (Granja União)

> Agente 13. Complementa [VALIDACAO_PRODUCAO.md](VALIDACAO_PRODUCAO.md). **Não reconstruir** — corrigir na menor superfície.

**Nota arquitetura atual:** 6/10 · **Após retrofit Fase 1–2:** 8/10 (estimado)

---

## 1. O que está correto (não mexer)

- Monorepo claro: `backend/`, `frontend/`, `site/`, `infra/`, `docs/`, `scripts/`
- API Express modular (rotas por domínio: pedidos, lotes, pix, assinaturas)
- Auth com token assinado + TTL 7 dias + papéis admin/operador
- PostgreSQL + Docker prod + script backup + healthcheck
- FIFO de lotes, preço atacado, pedido site (`/api/pedido-site`), desconto lote (código)
- Site estático Vite separado do painel; deploy `gh-pages` + `CNAME`
- Runbooks HTTPS, deploy VPS, troubleshooting domínios
- Modo local `USE_MEMORY_DB` para prova sem Docker

---

## 2. O que está errado

| Item | Risco | Correção mínima |
|------|-------|-----------------|
| HTTPS app inativo (443) | CRÍTICO | `vps-fazer-tudo.sh` no Contabo |
| Deploy VPS incompleto (008, token, rebuild) | CRÍTICO | `COLAR_TUDO_VPS.txt` |
| Token site no histórico Git (repo site) | ALTO | Rotacionar + rebuild |
| Rate limit pedido site só em RAM | MÉDIO | nginx `limit_req` ou Redis depois |
| `COLAR_TUDO_VPS` com token em arquivo local | ALTO | Só gitignore; nunca commitar |
| Migrations manuais (sem runner único) | MÉDIO | Script `migrate-all.sh` na VPS |
| Site + app em hosts diferentes sem doc única | BAIXO | Já em CHECKLIST_GO_LIVE |

---

## 3. O que falta (por dimensão)

| Dimensão | Falta |
|----------|--------|
| **Arquitetura** | Staging; API versionada (`/api/v1`) — opcional V2 |
| **Dados** | Script único aplicar migrations 002–008; índices em `pedidos.data_pedido` (opcional) |
| **Processos** | Runbook “pedido site falhou”; treino operador desconto lote |
| **Infra** | CI no repo principal; backup verificado; SSH por chave |
| **Segurança** | Rotação periódica tokens; helmet (opcional); audit `npm` |
| **Observabilidade** | Log estruturado; alerta backup falhou; uptime externo |
| **IA** | N/A (sem IA no produto) |

---

## 4. O que remover

- Pasta duplicada `Plataforma_ovo/Plataforma_ovo/` no PC (se existir) — confusão
- Commits acidentais de `node_modules/`, `out/`, `.env.production` no site
- Tentativas repetidas `certbot --force-renewal` (rate limit)

---

## 5. O que simplificar

- **Um comando produção:** `fazer-tudo.ps1` + um colar Contabo (já feito)
- **Migrations:** um `infra/scripts/vps-migrate-all.sh` que aplica 003→008 em ordem
- **Deploy:** parar de manter dois fluxos site (Actions sem secret vs gh-pages) — **só gh-pages** até ter secret

---

## 6. Dívida técnica (inventário)

| ID | Item | Prioridade |
|----|------|------------|
| DT-1 | Produção sem HTTPS | P0 |
| DT-2 | Deploy VPS manual | P0 |
| DT-3 | Sem CI testes API | P1 |
| DT-4 | Rate limit in-memory | P1 |
| DT-5 | Sem staging | P2 |
| DT-6 | LGPD/privacidade site não formalizada | P2 |
| DT-7 | Imagens site em CDN externo (readdy.ai) | P2 |
| DT-8 | PWA sem monitor offline sync | P3 |

---

## 7. Prioridade de correção (ordem)

1. Contabo + `COLAR_TUDO_VPS.txt`
2. Validar HTTPS + health
3. `publicar-site-build.ps1` + Pages config
4. Teste pedido site → painel
5. `setup-backup-vps.ps1` + teste restore
6. `configurar-ssh-vps.ps1`
7. Rotacionar `SITE_PEDIDO_TOKEN`
8. (Depois) CI + rate limit nginx

---

## 8. Plano V2 (arquitetura alvo)

```text
[granjauniao.com.br] GitHub Pages (site estático)
        │ POST /api/pedido-site (token + rate limit edge)
        ▼
[app.granjauniao.com.br] Nginx TLS → Docker (web + api + postgres)
        │ backup diário → /var/backups
        ▼
Operadores (PWA) + WhatsApp manual
```

Sem microserviços; um VPS + Pages é suficiente para o piloto.

---

## Plano de execução do retrofit

### FASE 1 — Crítico (esta semana)

- [ ] Executar `COLAR_TUDO_VPS.txt` no Contabo
- [ ] `https://app.granjauniao.com.br/api/health` OK
- [ ] GitHub Pages: `gh-pages` + domínio + HTTPS
- [ ] Pedido teste site → painel
- [ ] Rotacionar token se vazou no Git

### FASE 2 — Alto (15 dias)

- [ ] Backup cron + restore testado
- [ ] Chave SSH + `deploy-atualizacao-vps.ps1` sem senha
- [ ] CORS e `.env.prod` documentados num só lugar
- [ ] Treino granja: pagamento recebido + desconto lote

### FASE 3 — Médio (30 dias)

- [x] `vps-migrate-all.sh` para novas migrations
- [x] Rate limit nginx no `/api/pedido-site` (`meuzovo-rate-limit.conf`)
- [ ] Uptime monitor (UptimeRobot / similar)
- [x] CI: backend smoke + build frontend + build site

### FASE 4 — V2 (roadmap)

- [ ] Staging `app-staging.granjauniao.com.br`
- [ ] Widget WhatsApp unificado no site
- [ ] Relatório churn / previsão refinada
- [ ] API WhatsApp Business (se ROI)

---

## Agentes de reforço sugeridos

| Gap | Agente |
|-----|--------|
| Validação pós-retrofit | 12-VALIDADOR |
| Triagem / primeiro atendimento | [14-TRIAGEM](14-TRIAGEM.md) |
| Infra/Docker | 04-INFRAESTRUTURA |
| Segurança tokens | 07-SEGURANCA |
| Deploy já documentado | CHECKLIST + DEPLOY_VPS_PASSO_A_PASSO |

---

**Próximo passo operacional:** [DEPLOY_VPS_PASSO_A_PASSO.md](DEPLOY_VPS_PASSO_A_PASSO.md)

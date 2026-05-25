# Triagem — incidentes e suporte (Agente 14)

> **Agente 14 (triagem).** Primeira linha: classificar sintoma, severidade e rota. **Não** implementar features nem refatorar — encaminhar para o runbook ou agente certo.

Complementa: [VALIDACAO_PRODUCAO.md](VALIDACAO_PRODUCAO.md) (12) · [RETROFIT_PLATAFORMA_OVO.md](RETROFIT_PLATAFORMA_OVO.md) (13) · [CHECKLIST_GO_LIVE.md](CHECKLIST_GO_LIVE.md)

---

## Estado rápido (verificar ao abrir triagem)

| Alvo | Comando / URL | OK esperado |
|------|----------------|-------------|
| App HTTP | `http://app.granjauniao.com.br/api/health` | `200` + `"ok":true` |
| App HTTPS | `https://app.granjauniao.com.br/api/health` | `200` (bloqueador se falhar) |
| Site | `https://granjauniao.com.br` | `200` |
| Pedido site | Formulário `#pedido` → painel `[Site: granjauniao.com.br]` | Pedido aparece |
| Local API | `http://localhost:3000/api/health` | Só dev (`iniciar.ps1`) |
| Local painel | `http://localhost:5173` | Só dev |

**Última checagem automática (referência):** app HTTP OK · HTTPS app indisponível (443) · site HTTPS OK.

---

## Árvore de decisão (30 s)

```
Sintoma?
├─ Só no celular / Safari
│  └─ Usou app.granjauniao.com.br com https? → ver [HTTPS](#p0-https-app) ou http://app... temporário
├─ Site granjauniao.com.br
│  ├─ Certificado errado (*.github.io) → [GitHub Pages](#p1-site-pages)
│  ├─ Formulário “em configuração” → [Token site](#p1-token-site)
│  └─ 429 no envio → rate limit nginx + backend
├─ App / painel app.granjauniao.com.br
│  ├─ Connection refused / timeout → [VPS + Nginx](#p0-vps-nginx)
│  ├─ Login falha → senha `ADMIN_PASSWORD` em `infra/.env.prod` (não `plataforma123`)
│  └─ Pedido site não chega → token + CORS + deploy VPS
├─ Deploy / SSH
│  └─ Permission denied → [Console Contabo](#p0-contabo) (não insistir SSH sem chave)
└─ Ambiente local
   └─ Porta em uso / API caiu → `.\scripts\iniciar.ps1` ou matar Node e subir de novo
```

---

## Severidade

| Nível | Critério | SLA orientativo | Quem age |
|-------|-----------|-----------------|----------|
| **P0** | Granja não opera pedidos (app fora, HTTPS obrigatório no celular) | Imediato | Dono + console VPS |
| **P1** | Site pedido quebrado; backup ausente; token vazado | Mesmo dia | Dev + VPS |
| **P2** | Desconto lote, relatório, PWA secundário | Próximo deploy | Dev |
| **P3** | Melhoria, staging, uptime monitor | Backlog | Roadmap |

---

## Rotas por sintoma

### P0 — HTTPS app {#p0-https-app}

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| `https://app...` não abre; `http://app.../api/health` OK | Nginx/cert na 443 | Console VPS: `COLAR_TUDO_VPS.txt` ou `bash infra/scripts/vps-nginx-fix.sh` |
| Certificado inválido / symlink | Certbot / links quebrados | [RUNBOOK_HTTPS_VPS.md](RUNBOOK_HTTPS_VPS.md) |

### P0 — VPS / Nginx {#p0-vps-nginx}

| Sintoma | Ação |
|---------|------|
| `git pull` / deploy falhou | [DEPLOY_VPS_PASSO_A_PASSO.md](DEPLOY_VPS_PASSO_A_PASSO.md) |
| API só na 8080 | `vps-nginx-fix.sh` + `ufw allow 80,443` |
| Migração / coluna desconto | `bash infra/scripts/vps-migrate-all.sh` |

### P0 — Contabo {#p0-contabo}

| Sintoma | Ação |
|---------|------|
| SSH `Permission denied` | VNC → colar `scripts/COLAR_TUDO_VPS.txt` (`gerar-vps-tudo-console.ps1`) |
| Esqueceu login painel Contabo | https://my.contabo.com/account/recovery |

### P1 — Site / Pages {#p1-site-pages}

| Sintoma | Ação |
|---------|------|
| Domínio / HTTPS Pages | Repo **granjauniao-site**: branch `gh-pages`, Custom domain, Enforce HTTPS — [SITE_GITHUB.md](SITE_GITHUB.md) |
| Rebuild com token | `.\scripts\publicar-site-build.ps1` |

### P1 — Token site {#p1-token-site}

| Sintoma | Ação |
|---------|------|
| “Pedido online em configuração” | `VITE_SITE_PEDIDO_TOKEN` no build = `SITE_PEDIDO_TOKEN` na VPS |
| 401 no POST | Rotacionar token nos três lugares; nunca commitar `.env.production` |
| Token no Git público | Rotacionar + rebuild site — [INTEGRACAO_GRANJAUNIAO.md](INTEGRACAO_GRANJAUNIAO.md) |

### P1 — Operação granja

| Sintoma | Ação |
|---------|------|
| Cliente sem sistema | WhatsApp **(89) 99975-4044** |
| Pedido duplicado site | Não confirmar até validar; ver logs API |
| Estoque divergente | Dois operadores no mesmo pedido — teste manual; [LOTES.md](LOTES.md) |

### Local (dev)

| Sintoma | Ação |
|---------|------|
| `EADDRINUSE` 3000/5173 | Fechar Node antigo; `.\scripts\iniciar.ps1` |
| Processo morreu sozinho | Subir de novo; login `admin` / `plataforma123` |
| Prova sem Docker | `USE_MEMORY_DB=1` — [PROVA_LOCAL.md](PROVA_LOCAL.md) |

---

## Handoff para outros agentes / docs

| Se precisar de… | Ir para |
|-----------------|---------|
| Go/no-go produção | Agente **12** — [VALIDACAO_PRODUCAO.md](VALIDACAO_PRODUCAO.md) |
| Dívida técnica / fases retrofit | Agente **13** — [RETROFIT_PLATAFORMA_OVO.md](RETROFIT_PLATAFORMA_OVO.md) |
| Domínios DNS | [TROUBLESHOOT_DOMINIOS.md](TROUBLESHOOT_DOMINIOS.md) |
| Deploy incremental | [DEPLOY_ATUALIZACAO.md](DEPLOY_ATUALIZACAO.md) |
| Backup / restore | [BACKUP_RESTORE.md](BACKUP_RESTORE.md) |
| Operador no dia a dia | [MANUAL_OPERACAO.md](MANUAL_OPERACAO.md) |

---

## Scripts (Windows → ordem sugerida)

| Ordem | Script | Quando |
|-------|--------|--------|
| 1 | `.\scripts\gerar-vps-tudo-console.ps1` | VPS inacessível por SSH |
| 2 | `.\scripts\fazer-tudo.ps1` | Alinhar site + testes locais |
| 3 | `.\scripts\deploy-atualizacao-vps.ps1` | SSH com chave OK |
| 4 | `.\scripts\publicar-site-build.ps1` | Só site / token |
| 5 | `.\scripts\iniciar.ps1` | Só ambiente local |

---

## Registro de incidente (copiar e preencher)

```text
Data/hora:
Reportado por: (cliente / operador / dev)
URL exata:
Dispositivo/rede: (4G, Wi‑Fi, iOS Safari, etc.)
Sintoma em 1 frase:
Testes feitos: health HTTP / HTTPS / site / pedido teste
Último deploy: (data, commit se souber)
Backup recente: sim/não
Decisão triagem: P0|P1|P2|P3
Próximo passo único:
Responsável:
```

---

## Prompt curto (colar no Cursor como Agente 14)

```text
Você é o Agente 14 — Triagem do projeto Plataforma_ovo / Granja União.
Leia docs/14-TRIAGEM.md, classifique o sintoma (P0–P3), rode só testes rápidos (curl/health),
indique UM próximo passo (script ou doc), e encaminhe para Agente 12 ou 13 se for validação/retrofit.
Não refatore código nem faça commit sem pedido explícito.
```

---

**Próximo passo operacional do piloto:** [CHECKLIST_GO_LIVE.md](CHECKLIST_GO_LIVE.md) — Fase A (HTTPS + `COLAR_TUDO_VPS.txt`).

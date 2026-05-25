# Checklist — colocar em produção (VPS + site)

Domínios: **app.granjauniao.com.br** (painel/VPS) · **granjauniao.com.br** (site GitHub Pages).

Validação crítica: [VALIDACAO_PRODUCAO.md](VALIDACAO_PRODUCAO.md) — decisão atual: **AJUSTAR**.

Retrofit (Agente 13): [RETROFIT_PLATAFORMA_OVO.md](RETROFIT_PLATAFORMA_OVO.md).  
Triagem / incidentes (Agente 14): [14-TRIAGEM.md](14-TRIAGEM.md).

Deploy passo a passo: [DEPLOY_VPS_PASSO_A_PASSO.md](DEPLOY_VPS_PASSO_A_PASSO.md).

---

## Fase A — Bloqueadores (obrigatório)

- [ ] **Contabo:** acesso ao painel recuperado
- [ ] **VPS:** `COLAR_TUDO_VPS.txt` executado no console VNC ([gerar](..\scripts\gerar-vps-tudo-console.ps1))
- [ ] `https://app.granjauniao.com.br/api/health` → OK
- [ ] Login painel com `ADMIN_PASSWORD` de `infra/.env.prod` (não `plataforma123`)
- [ ] Migração `008_lote_desconto.sql` aplicada
- [ ] `SITE_PEDIDO_TOKEN` igual no PC, VPS e build do site
- [ ] Pedido teste em https://granjauniao.com.br#pedido → painel (`[Site: granjauniao.com.br]`)
- [ ] Backup: arquivo em `/var/backups/plataforma_ovo` ([setup-backup-vps.ps1](..\scripts\setup-backup-vps.ps1))

---

## Fase B — Infra base

- [x] VPS Linux — `147.93.185.146`
- [x] DNS `app.granjauniao.com.br` → VPS
- [ ] Docker na VPS rodando (`plataforma_ovo_api`, `plataforma_ovo_web`, `plataforma_ovo_db`)
- [ ] `infra/.env.prod` com senhas fortes ([gerar-env-prod.ps1](..\scripts\gerar-env-prod.ps1))
- [ ] `POSTGRES_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD` — fortes
- [ ] `CORS_ORIGIN` com app + granjauniao (http e https)
- [ ] `GRANJA_WHATSAPP=5589999754044`
- [ ] `WEBHOOK_SECRET` e `SITE_PEDIDO_TOKEN` definidos
- [ ] HTTPS Nginx porta 443 ([RUNBOOK_HTTPS_VPS.md](RUNBOOK_HTTPS_VPS.md))

---

## Fase C — Site GitHub Pages

- [ ] Repo **granjauniao-site** — source **gh-pages** ([publicar-site-build.ps1](..\scripts\publicar-site-build.ps1))
- [ ] Custom domain `granjauniao.com.br` + Enforce HTTPS
- [ ] `public/CNAME` = `granjauniao.com.br`
- [ ] Teste celular 4G (não só Wi‑Fi)

---

## Fase D — Operação granja

- [ ] Produtos e preços reais cadastrados
- [ ] Pedido completo: novo → confirmado → pagamento recebido
- [ ] Desconto em lote testado ([DESCONTO_LOTE.md](DESCONTO_LOTE.md))
- [ ] Operadores `ana`/`marcos` ou equipe real ([OPERADORES.md](OPERADORES.md))
- [ ] PWA no celular ([PWA.md](PWA.md))

---

## Scripts rápidos (Windows)

| Script | Uso |
|--------|-----|
| `.\scripts\gerar-vps-tudo-console.ps1` | Gera bloco para Contabo |
| `.\scripts\fazer-tudo.ps1` | Site + testes + links |
| `.\scripts\deploy-atualizacao-vps.ps1` | Deploy via SSH (com chave) |
| `.\scripts\configurar-ssh-vps.ps1` | Chave SSH sem senha |
| `.\scripts\iniciar.ps1` | Ambiente local |

---

## Já no código (não precisa implementar)

- [x] Pedidos, estoque, clientes, PIX, assinaturas, rotas
- [x] Lotes FIFO + desconto temporário
- [x] Pedido público site (`/api/pedido-site`)
- [x] Confirmação pagamento
- [x] Preço atacado, notificações, PWA

---

## Suporte

[README.md](../README.md) · [MANUAL_OPERACAO.md](MANUAL_OPERACAO.md) · [DEPLOY_ATUALIZACAO.md](DEPLOY_ATUALIZACAO.md) · [TROUBLESHOOT_DOMINIOS.md](TROUBLESHOOT_DOMINIOS.md)

# Deploy VPS — passo a passo (Contabo)

Ordem para sair de **AJUSTAR** → produção piloto.

---

## Passo 0 — No PC (2 min)

```powershell
cd C:\_PROJETOS\Plataforma_ovo
.\scripts\gerar-vps-tudo-console.ps1
```

Arquivo gerado: `scripts\COLAR_TUDO_VPS.txt` (copiado para área de transferência).

Confirme que `git push origin main` já foi feito (código no GitHub).

---

## Passo 1 — Entrar na Contabo

1. https://my.contabo.com ou https://new.contabo.com  
2. Recuperar senha se necessário: [Contabo recovery](https://my.contabo.com/account/recovery)  
3. **Servers & Hosting** → VPS `147.93.185.146`  
4. Se não lembrar senha **root**: **Reset credentials** no painel → anotar senha nova  

---

## Passo 2 — Console VNC (5–15 min)

1. Abrir **VNC / Console**  
2. Login: `root` + senha  
3. **Ctrl+V** — colar **uma linha** de `COLAR_TUDO_VPS.txt`  
4. **Enter** — aguardar (não fechar)  

Espere ver:

- `git pull`
- migração `008_lote_desconto.sql`
- rebuild Docker
- teste HTTPS / `=== Pronto ===`

---

## Passo 3 — Validar (no console ou no PC)

```bash
curl -s https://app.granjauniao.com.br/api/health
```

Deve retornar: `{"ok":true,"service":"plataforma-ovo-api"}`

No navegador: https://app.granjauniao.com.br — login com senha de `infra/.env.prod` (`ADMIN_PASSWORD`).

---

## Passo 4 — Backup (opcional, 2 min)

No console VPS:

```bash
bash /opt/Plataforma_ovo/infra/scripts/vps-setup-backup.sh
```

Ou no PC (se SSH funcionar): `.\scripts\setup-backup-vps.ps1`

---

## Passo 5 — Site (no PC)

```powershell
.\scripts\publicar-site-build.ps1
```

GitHub → **granjauniao-site** → Settings → Pages:

- Custom domain: `granjauniao.com.br`
- Source: branch **gh-pages**, folder **/ (root)**
- **Enforce HTTPS**

Teste: https://granjauniao.com.br#pedido → pedido teste → aparece no painel com `[Site: granjauniao.com.br]`.

---

## Se der erro

| Sintoma | O que fazer |
|---------|-------------|
| `Permission denied` SSH | Use só console VNC (não SSH) |
| `git pull` falha | `git status` na VPS; conflito → `git stash` ou clone limpo |
| HTTPS falha | `bash infra/scripts/vps-nginx-fix.sh` — ver [RUNBOOK_HTTPS_VPS.md](RUNBOOK_HTTPS_VPS.md) |
| Muitos POST no site | Rate limit nginx em `/etc/nginx/conf.d/meuzovo-rate-limit.conf` (aplicado pelo `vps-nginx-fix.sh`) |
| Pedido site 401 | Token: `grep SITE_PEDIDO_TOKEN infra/.env.prod` = mesmo do build site |

---

**Script único no PC:** `.\scripts\fazer-tudo.ps1`

# Site e app fora do ar — diagnóstico rápido

Runbook completo (executivo): [RUNBOOK_HTTPS_VPS.md](RUNBOOK_HTTPS_VPS.md)

## Resumo (maio/2026)

| URL | Sintoma | Causa | Correção |
|-----|---------|-------|----------|
| **app.granjauniao.com.br** | `ERR_CONNECTION_REFUSED` | Nginx não subiu; app só na porta **8080** | [Corrigir Nginx na VPS](#app-vps) |
| **https://granjauniao.com.br** | Erro de certificado / privacidade | HTTPS entrega certificado `*.github.io`, não do domínio | [GitHub Pages — domínio customizado](#site-github-pages) |
| **http://granjauniao.com.br** | Deve abrir | GitHub Pages OK (HTTP 200) | Use até o certificado ficar pronto |

Teste rápido no PC:

```powershell
curl.exe -s http://147.93.185.146:8080/api/health
curl.exe -s http://granjauniao.com.br/
```

---

## App (VPS)

### app

DNS `app` → `147.93.185.146` ✅  
API no Docker: `http://147.93.185.146:8080/api/health` ✅  
Portas **80** e **443**: nada escutando ❌ (Nginx parado)

**Causa comum extra:** comando errado `ln -sf .../fullchain.pem .../fullchain.pem` → symlink circular → `Too many levels of symbolic links`

### Corrigir Nginx na VPS

**Windows (com senha SSH):**

```powershell
cd C:\_PROJETOS\Plataforma_ovo
.\scripts\aplicar-fix-vps.ps1
```

**Na VPS (SSH):**

```bash
cd /opt/Plataforma_ovo && git pull
bash infra/scripts/vps-nginx-fix.sh
```

**Sem git pull** — reparar certificado + nginx manualmente:

```bash
DOMAIN=app.granjauniao.com.br
LIVE=/etc/letsencrypt/live/$DOMAIN
ARCHIVE=/etc/letsencrypt/archive/$DOMAIN
rm -f $LIVE/fullchain.pem $LIVE/privkey.pem $LIVE/cert.pem $LIVE/chain.pem
ln -sf ../../archive/$DOMAIN/fullchain1.pem $LIVE/fullchain.pem
ln -sf ../../archive/$DOMAIN/privkey1.pem $LIVE/privkey.pem
ln -sf ../../archive/$DOMAIN/cert1.pem $LIVE/cert.pem
ln -sf ../../archive/$DOMAIN/chain1.pem $LIVE/chain.pem
openssl x509 -in $LIVE/fullchain.pem -noout -subject
# depois: colar config nginx (ver DEPLOY_APP_GRANJAUNIAO.md) e:
nginx -t && systemctl restart nginx
curl -s https://app.granjauniao.com.br/api/health
```

Depois:

```bash
curl -s https://app.granjauniao.com.br/api/health
```

**Provisório:** http://147.93.185.146:8080 (sem HTTPS).

---

## Site (GitHub Pages)

### site

DNS apex → IPs GitHub Pages (185.199.108–111.153) ✅  
HTTP → página da Granja União ✅  
HTTPS → certificado **CN=*.github.io** ❌ (domínio customizado não ativo no GitHub)

### GitHub Pages — domínio customizado

1. Abra: https://github.com/RivasCode-Ops/granjauniao-site/settings/pages  
2. **Custom domain** → `granjauniao.com.br` → **Save**  
3. Aguarde **DNS check** verde (pode levar minutos).  
4. Quando aparecer, marque **Enforce HTTPS** (certificado Let's Encrypt do GitHub; até 24h).  
5. Confirme que o deploy inclui `public/CNAME` com conteúdo `granjauniao.com.br`:

```powershell
cd C:\_PROJETOS\Plataforma_ovo
Get-Content site\public\CNAME
.\scripts\publicar-site-github.ps1
```

6. Workflow **Deploy GitHub Pages** em verde no repo `granjauniao-site`.

Enquanto o HTTPS não estiver pronto: **http://granjauniao.com.br** (sem `s`).

Se o Chrome insistir em HTTPS: aba anônima ou limpar HSTS para o domínio.

---

## Ordem sugerida

1. VPS — `vps-nginx-fix.sh` → https://app.granjauniao.com.br  
2. GitHub — custom domain + aguardar certificado → https://granjauniao.com.br

# Runbook — HTTPS app.granjauniao.com.br (VPS)

Documento executivo para recuperação e prevenção de recorrência.  
**VPS:** `147.93.185.146` · **Domínio app:** `app.granjauniao.com.br`

---

## Análise de causa raiz

| Camada | Falha | Impacto |
|--------|-------|---------|
| Certbot / symlinks | `fullchain.pem` apontando para si mesmo | Certificado ilegível |
| Nginx (host) | `nginx -t` falha → serviço não sobe | Portas 80/443 fechadas |
| Docker | App só em `8080` (correto) | Sem proxy, domínio não responde |
| GitHub Pages (site) | Custom domain sem certificado emitido | HTTPS do site com `*.github.io` |

**O que está correto:** containers, `.env.prod`, health em `:8080`, DNS `app` → VPS, site em HTTP no GitHub.

---

## Execução rápida (recomendado)

**Windows (um comando):**

```powershell
cd C:\_PROJETOS\Plataforma_ovo
git pull
.\scripts\ativar-https-vps.ps1
```

**Na VPS:**

```bash
cd /opt/Plataforma_ovo && git pull
bash infra/scripts/vps-ativar-https.sh
```

Script antigo (só Nginx/cert): `vps-nginx-fix.sh` · envio via `aplicar-fix-vps.ps1`

**Após executar, informe apenas:**

1. Saída de `nginx -t`
2. Última linha de `curl -s https://app.granjauniao.com.br/api/health`

---

## Bloco 1 — Certificado SSL

```bash
DOMAIN=app.granjauniao.com.br
LIVE=/etc/letsencrypt/live/$DOMAIN
ARCHIVE=/etc/letsencrypt/archive/$DOMAIN
EMAIL="${CERTBOT_EMAIL:-rivaldo@granjauniao.com.br}"

echo "=== DIAGNÓSTICO ==="
ls -la "$LIVE/" 2>/dev/null || echo "Live não existe"
ls -la "$ARCHIVE/" 2>/dev/null || echo "Archive não existe"

if [ -d "$ARCHIVE" ]; then
  echo "=== REPARANDO CERTIFICADO ==="
  rm -f "$LIVE"/*.pem
  n=$(ls -1 "$ARCHIVE"/fullchain*.pem 2>/dev/null | sed 's/.*fullchain\([0-9]*\)\.pem/\1/' | sort -n | tail -1)
  n="${n:-1}"
  ln -sf "../../archive/$DOMAIN/fullchain${n}.pem" "$LIVE/fullchain.pem"
  ln -sf "../../archive/$DOMAIN/privkey${n}.pem" "$LIVE/privkey.pem"
  ln -sf "../../archive/$DOMAIN/cert${n}.pem" "$LIVE/cert.pem"
  ln -sf "../../archive/$DOMAIN/chain${n}.pem" "$LIVE/chain.pem"
  echo "=== VALIDAÇÃO ==="
  openssl x509 -in "$LIVE/fullchain.pem" -noout -subject -dates && echo "Certificado OK" || echo "Certificado inválido"
else
  echo "=== CRIANDO NOVO CERTIFICADO ==="
  cd /opt/Plataforma_ovo/infra
  docker compose --env-file .env.prod -f docker-compose.prod.yml stop web
  certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL"
  docker compose --env-file .env.prod -f docker-compose.prod.yml up -d web
fi
```

**Nunca execute:** `ln -sf .../fullchain.pem .../fullchain.pem`

---

## Bloco 2 — Nginx (só sobe se `nginx -t` passar)

```bash
cat > /etc/nginx/sites-available/app.granjauniao.com.br << 'EOF'
server {
    listen 80;
    server_name app.granjauniao.com.br;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.granjauniao.com.br;

    ssl_certificate     /etc/letsencrypt/live/app.granjauniao.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.granjauniao.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF

ln -sf /etc/nginx/sites-available/app.granjauniao.com.br /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
ufw allow 80/tcp 2>/dev/null; ufw allow 443/tcp 2>/dev/null

nginx -t || exit 1
systemctl enable nginx
systemctl restart nginx
```

Garantir Docker na 8080:

```bash
grep HTTP_PORT /opt/Plataforma_ovo/infra/.env.prod   # deve ser 8080
cd /opt/Plataforma_ovo/infra
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d web
```

---

## Bloco 3 — Testes

```bash
curl -s http://127.0.0.1:8080/api/health
curl -sk https://127.0.0.1/api/health -H "Host: app.granjauniao.com.br"
curl -s https://app.granjauniao.com.br/api/health
systemctl is-active nginx
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## Checklist pós-fix

| Item | Comando | Esperado |
|------|---------|----------|
| Certificado | `openssl x509 -in /etc/letsencrypt/live/app.granjauniao.com.br/fullchain.pem -noout -dates` | Datas válidas |
| Nginx | `systemctl status nginx --no-pager` | `active (running)` |
| API HTTPS | `curl -s https://app.granjauniao.com.br/api/health` | `{"ok":true,...}` |
| Painel | Navegador → https://app.granjauniao.com.br | Login |

---

## Plano B — certificado irreparável

```bash
bash /opt/Plataforma_ovo/infra/scripts/vps-https-recreate-cert.sh rivaldo@granjauniao.com.br
bash /opt/Plataforma_ovo/infra/scripts/vps-nginx-fix.sh
```

---

## Site granjauniao.com.br (GitHub Pages)

DNS apex (A → IPs GitHub) já costuma estar correto. O HTTPS falha quando o **Custom domain** em Pages não está validado ou **Enforce HTTPS** ainda não emitiu certificado.

1. https://github.com/RivasCode-Ops/granjauniao-site/settings/pages  
2. Custom domain: `granjauniao.com.br` → Save → aguardar check verde  
3. Enforce HTTPS (até 24h)  
4. Se falhar: remover domínio, aguardar 5 min, adicionar de novo  

Registros de referência: [DOMINIO_GRANJAUNIAO.md](DOMINIO_GRANJAUNIAO.md)

---

## Prevenção de recorrência

- Usar apenas `vps-https.sh` ou `vps-nginx-fix.sh` — não editar symlinks em `live/` manualmente  
- Após `certbot certonly --standalone`, sempre subir Nginx com config do repo (`infra/nginx-host/`)  
- Renovação: `certbot renew --dry-run` (timer systemd já instalado com certbot)

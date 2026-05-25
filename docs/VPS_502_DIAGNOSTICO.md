# VPS — 502 Bad Gateway (app.granjauniao.com.br)

**Arquitetura:** Nginx no **host** (80/443) → `proxy_pass http://127.0.0.1:8080` → container **`plataforma_ovo_web`** (mapeia `HTTP_PORT:80` do Docker, em geral **8080** no host) → API **`plataforma_ovo_api`** + PostgreSQL **`plataforma_ovo_db`**.

O 502 significa: Nginx ativo, mas **nada responde em `127.0.0.1:8080`**.

---

## Diagnóstico (uma vez)

Na VPS:

```bash
bash /opt/Plataforma_ovo/infra/scripts/vps-diagnostico-502.sh
```

Script equivalente (manual):

```bash
cd /opt/Plataforma_ovo/infra
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
test -f .env.prod && grep ^HTTP_PORT .env.prod || echo "falta .env.prod"
curl -s http://127.0.0.1:8080/api/health
docker port plataforma_ovo_web
docker logs --tail 10 plataforma_ovo_web
grep -A2 proxy_pass /etc/nginx/sites-enabled/*
tail -n 10 /var/log/nginx/error.log
```

Ou manualmente (detalhado):

```bash
systemctl status nginx --no-pager | head -5
tail -n 30 /var/log/nginx/error.log
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
ss -tlnp | grep -E ':80|:443|:8080'
grep -r "proxy_pass" /etc/nginx/sites-enabled/
curl -s http://127.0.0.1:8080/api/health
docker logs --tail 20 plataforma_ovo_web
docker logs --tail 30 plataforma_ovo_api
```

No `error.log`, típico do 502:

```text
connect() failed (111: Connection refused) ... upstream: "http://127.0.0.1:8080/..."
```

---

## Correções por causa

### 1. Container parado (`Exited`)

```bash
cd /opt/Plataforma_ovo/infra
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

Ou: `bash /opt/Plataforma_ovo/infra/scripts/vps-subir-502.sh`

### 2. `HTTP_PORT` errado no `.env.prod`

Deve ser **`8080`** (Nginx do host usa 8080; Docker publica o painel nessa porta).

```bash
grep HTTP_PORT /opt/Plataforma_ovo/infra/.env.prod
# HTTP_PORT=8080
```

### 3. Nginx sem `proxy_pass` para 8080

```bash
grep -r "proxy_pass" /etc/nginx/sites-enabled/
# esperado: proxy_pass http://127.0.0.1:8080;
bash /opt/Plataforma_ovo/infra/scripts/vps-nginx-fix.sh
```

### 4. Falta `infra/.env.prod` (Caso B)

```bash
cd /opt/Plataforma_ovo/infra
cp env.prod.example .env.prod   # só modelo — troque senhas antes de producao
nano .env.prod                  # HTTP_PORT=8080 obrigatorio
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

Melhor: copiar do PC `infra\.env.prod` já preenchido (`.\scripts\gerar-env-prod.ps1`).

### 4b. Porta do container (Caso C)

```bash
docker port plataforma_ovo_web
# esperado: 80/tcp -> 0.0.0.0:8080
```

### 5. Reinício completo (se ainda falhar)

```bash
cd /opt/Plataforma_ovo/infra
docker compose --env-file .env.prod -f docker-compose.prod.yml down
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
sleep 10
curl -s http://127.0.0.1:8080/api/health
```

O container **web** escuta **80 dentro do Docker**; no host aparece como **8080** — não espere log “port 8080” dentro do container.

### 6. Firewall

`ufw` raramente bloqueia `127.0.0.1:8080`. Se necessário:

```bash
ufw allow 80/tcp
ufw allow 443/tcp
```

---

## Validação final

```bash
curl -s http://127.0.0.1:8080/api/health
curl -s http://app.granjauniao.com.br/api/health
```

Esperado: `{"ok":true,"service":"plataforma-ovo-api"}`

HTTPS depois: `bash /opt/Plataforma_ovo/infra/scripts/vps-ativar-https.sh`

---

Ver também: [14-TRIAGEM.md](14-TRIAGEM.md) · [TROUBLESHOOT_DOMINIOS.md](TROUBLESHOOT_DOMINIOS.md) · [DEPLOY_VPS_PASSO_A_PASSO.md](DEPLOY_VPS_PASSO_A_PASSO.md)

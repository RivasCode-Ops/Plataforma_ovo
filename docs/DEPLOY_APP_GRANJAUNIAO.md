# Deploy — app.granjauniao.com.br

**VPS:** `147.93.185.146` · Ubuntu 22.04 · DNS `app` → IP ✅

Resultado final:

| URL | Função |
|-----|--------|
| https://app.granjauniao.com.br | Painel admin |
| https://app.granjauniao.com.br/api/health | API |

---

## Parte 1 — No seu Windows (antes do SSH)

Gere o arquivo de produção com senhas fortes:

```powershell
cd C:\_PROJETOS\Plataforma_ovo
.\scripts\gerar-env-prod.ps1
```

Abra `infra\.env.prod` e confira:

- `CORS_ORIGIN=https://app.granjauniao.com.br`
- `GRANJA_WHATSAPP=5589999754044`
- `GRANJA_PIX_CHAVE=` (preencha se for usar PIX)
- Anote a **senha admin** que o script mostrou

---

## Parte 2 — Na VPS (SSH)

```powershell
ssh root@147.93.185.146
```

### 2.1 Instalar Docker

```bash
apt update && apt install -y docker.io docker-compose-v2 git nginx certbot python3-certbot-nginx
systemctl enable docker
```

### 2.2 Clonar o projeto

```bash
cd /opt
git clone https://github.com/RivasCode-Ops/Plataforma_ovo.git
cd Plataforma_ovo/infra
```

### 2.3 Criar `.env.prod`

**Opção A** — copiar do seu PC (WinSCP / `scp`):

```powershell
# No Windows:
scp C:\_PROJETOS\Plataforma_ovo\infra\.env.prod root@147.93.185.146:/opt/Plataforma_ovo/infra/.env.prod
```

**Opção B** — na VPS:

```bash
cp env.prod.example .env.prod
nano .env.prod   # senhas fortes; CORS_ORIGIN=https://app.granjauniao.com.br
```

### 2.4 Subir a aplicação (HTTP)

```bash
cd /opt/Plataforma_ovo/infra
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
```

Teste (aguarde 1–2 min na primeira vez):

```bash
curl -s http://127.0.0.1/api/health
curl -s http://app.granjauniao.com.br/api/health
```

No navegador: **http://app.granjauniao.com.br** → login com `admin` e a senha do `.env.prod`.

---

## Parte 3 — HTTPS (Let's Encrypt)

### 3.1 Liberar a porta 80 para o Certbot

```bash
cd /opt/Plataforma_ovo/infra
docker compose --env-file .env.prod -f docker-compose.prod.yml stop web
```

### 3.2 Certificado

```bash
certbot certonly --standalone -d app.granjauniao.com.br \
  --non-interactive --agree-tos -m SEU-EMAIL@exemplo.com
```

### 3.3 App na porta 8080 + Nginx na 443

```bash
# Edite .env.prod: HTTP_PORT=8080
nano .env.prod

docker compose --env-file .env.prod -f docker-compose.prod.yml up -d web
```

Copie o Nginx do repositório:

```bash
cp /opt/Plataforma_ovo/infra/nginx-host/app.granjauniao.com.br.conf \
   /etc/nginx/sites-available/app.granjauniao.com.br
ln -sf /etc/nginx/sites-available/app.granjauniao.com.br /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

Teste: **https://app.granjauniao.com.br/api/health**

Renovação automática do certificado:

```bash
certbot renew --dry-run
```

---

## Comandos úteis

```bash
cd /opt/Plataforma_ovo/infra

# Logs da API
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f backend

# Reiniciar após mudar .env.prod
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build

# Backup do banco
docker exec plataforma_ovo_db pg_dump -U plataforma plataforma_ovo > /root/backup-$(date +%F).sql
```

---

## Checklist pós-deploy

- [ ] Login no painel (HTTPS)
- [ ] Pedido de teste
- [ ] Produtos e preços reais cadastrados
- [ ] PWA no celular ([PWA.md](PWA.md))
- [ ] Backup em cron (`infra/scripts/backup.sh`)

Site público continua em **granjauniao.com.br** (GitHub Pages), separado desta VPS.

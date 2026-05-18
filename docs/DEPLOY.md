# Deploy em produção (VPS)

Um único endereço serve o **painel** e a **API** (`/api`).

```
https://app.SEU-DOMINIO.com.br     → painel admin
https://app.SEU-DOMINIO.com.br/api → API
```

Requisitos: VPS Linux (Ubuntu 22+), 1 GB RAM, Docker + Docker Compose.

---

## 1. Preparar a VPS

```bash
# Ubuntu — instalar Docker
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER
# sair e entrar de novo no SSH
```

---

## 2. Enviar o projeto

```bash
git clone https://github.com/RivasCode-Ops/Plataforma_ovo.git
cd Plataforma_ovo/infra
cp env.prod.example .env.prod
nano .env.prod   # preencha senhas e domínio
```

---

## 3. Subir os containers

```bash
cd infra
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
```

Teste: `curl http://IP-DA-VPS/api/health`

---

## 4. DNS

No provedor do domínio, crie um registro **A**:

| Nome | Valor |
|------|--------|
| `app` (ou `@`) | IP da VPS |

Ex.: `app.suagranja.com.br` → `203.0.113.10`

Atualize `CORS_ORIGIN` no `.env.prod` com a URL HTTPS final.

---

## 5. HTTPS (Let's Encrypt)

Com o domínio já apontando para a VPS:

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d app.suagranja.com.br
```

Pare o container web na porta 80, gere o certificado, depois use o proxy com SSL abaixo ou **Caddy** / **Nginx** na máquina host.

### Opção simples: Nginx na VPS (host)

```nginx
server {
    listen 443 ssl http2;
    server_name app.suagranja.com.br;
    ssl_certificate     /etc/letsencrypt/live/app.suagranja.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.suagranja.com.br/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

Renovação: `sudo certbot renew`.

---

## 6. Comandos úteis

```bash
# Logs
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f backend

# Reiniciar após mudar .env.prod
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build

# Backup do banco
docker exec plataforma_ovo_db pg_dump -U plataforma plataforma_ovo > backup.sql

# Parar tudo
docker compose --env-file .env.prod -f docker-compose.prod.yml down
```

---

## 7. Checklist pós-deploy

- [ ] Login no painel com `ADMIN_USER` / `ADMIN_PASSWORD`
- [ ] Trocar senhas padrão
- [ ] `GRANJA_WHATSAPP` correto
- [ ] Criar pedido de teste
- [ ] Backup automático (cron + `infra/scripts/backup.sh`)

---

## Site granjauniao.com.br

**Não é necessário** para o painel funcionar. Quando reativar o site, veja [INTEGRACAO_GRANJAUNIAO.md](INTEGRACAO_GRANJAUNIAO.md).

---

## Desenvolvimento local (sem VPS)

```powershell
cd backend
npm run dev:local
```

```powershell
cd frontend
npm run dev
```

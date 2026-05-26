# Deploy único — Granja União (fonte da verdade)

> Substitui os vários `COLAR-*.txt` na raiz. Use **só este fluxo**.

**Projeto:** `D:\PROJETOS\04_LABS\Plataforma_ovo`  
**GitHub:** https://github.com/RivasCode-Ops/Plataforma_ovo  
**VPS:** `root@147.93.185.146` → `/opt/Plataforma_ovo`

---

## Regra de ouro

Sempre na VPS, dentro de `infra/`:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml <comando>
```

Sem `--env-file .env.prod` o Compose **não** lê senhas → erro `POSTGRES_PASSWORD`.

Testes de saúde: **no SSH** (`root@vmi...`), não no PowerShell do Windows.

---

## A) Primeira vez na VPS

### 1. PC — gerar `.env.prod`

```powershell
cd D:\PROJETOS\04_LABS\Plataforma_ovo
.\scripts\gerar-env-prod.ps1
```

Anote senhas exibidas. Arquivo: `infra\.env.prod`.

### 2. PC — enviar para a VPS

```powershell
scp D:\PROJETOS\04_LABS\Plataforma_ovo\infra\.env.prod root@147.93.185.146:/opt/Plataforma_ovo/infra/.env.prod
```

### 3. VPS — clonar (se ainda não existir)

```bash
apt-get update -qq && apt-get install -y git docker.io docker-compose-plugin
systemctl enable docker && systemctl start docker
mkdir -p /opt && cd /opt
git clone https://github.com/RivasCode-Ops/Plataforma_ovo.git
```

### 4. VPS — subir em etapas

```bash
cd /opt/Plataforma_ovo/infra

docker compose --env-file .env.prod -f docker-compose.prod.yml up -d postgres
for i in $(seq 1 24); do
  docker exec plataforma_ovo_db pg_isready -U plataforma -q 2>/dev/null && echo "Postgres OK" && break
  sleep 5
done

bash /opt/Plataforma_ovo/infra/scripts/vps-migrate-all.sh

DOCKER_BUILDKIT=0 docker compose --env-file .env.prod -f docker-compose.prod.yml build --progress=plain backend
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d backend

DOCKER_BUILDKIT=0 docker compose --env-file .env.prod -f docker-compose.prod.yml build --progress=plain web
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d web

curl --connect-timeout 5 -s http://127.0.0.1:8080/api/health
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
```

**Sucesso:** `{"ok":true}` e 3 containers `Up`.

### 5. HTTPS (depois do HTTP OK)

```bash
bash /opt/Plataforma_ovo/infra/scripts/vps-ativar-https.sh
curl -s https://app.granjauniao.com.br/api/health
```

### 6. Site (token igual ao `.env.prod`)

No PC:

```powershell
.\scripts\publicar-site-build.ps1
```

`SITE_PEDIDO_TOKEN` na VPS = `VITE_SITE_PEDIDO_TOKEN` no build do site.

---

## B) Atualização (já em produção)

No PC (após `git push`):

```powershell
.\scripts\deploy-atualizacao-vps.ps1
```

Ou na VPS:

```bash
bash /opt/Plataforma_ovo/infra/scripts/vps-deploy-atualizacao.sh
```

---

## C) Só recuperar 502

```bash
bash /opt/Plataforma_ovo/infra/scripts/vps-subir-502.sh
```

---

## D) Diagnóstico rápido

| Sintoma | Comando |
|---------|---------|
| App parado | `curl -s http://127.0.0.1:8080/api/health` |
| Containers | `docker compose --env-file .env.prod -f docker-compose.prod.yml ps` |
| Docker travado | `systemctl restart docker` → `timeout 10 docker ps` |
| Logs API | `docker logs plataforma_ovo_api --tail 50` |

---

## Não usar

- `COLAR-VPS-PASSO-A-PASSO.txt` (senhas fixas fracas)
- `docker compose` sem `--env-file .env.prod`
- `vps-fazer-tudo.sh` antes do Postgres estar `Up`
- `curl` no PowerShell para testar a VPS (use SSH ou `curl.exe` só no PC)

Mais detalhes: [07-SEGURANCA.md](07-SEGURANCA.md), [VPS_502_DIAGNOSTICO.md](VPS_502_DIAGNOSTICO.md).

---

## Plano 10/10 (ordem recomendada)

1. **Backup** (5 min, sem risco): `bash /opt/Plataforma_ovo/infra/scripts/vps-setup-backup.sh`
2. **HTTPS**: `bash /opt/Plataforma_ovo/infra/scripts/vps-ativar-https.sh`
3. **GitHub Actions** — Secrets no repo: `VPS_HOST`, `VPS_PASSWORD`, `POSTGRES_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD`, `WEBHOOK_SECRET`, `SITE_PEDIDO_TOKEN` (só se `.env.prod` ainda não existir na VPS)
4. **UptimeRobot** — monitorar `https://app.granjauniao.com.br/api/health`

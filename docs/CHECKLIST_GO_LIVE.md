# Checklist — colocar em produção (VPS)

Use quando tiver servidor e domínio (sugestão Granja União: `app.granjauniao.com.br` → IP da VPS).

Gerar `.env.prod` com senhas fortes no Windows:

```powershell
.\scripts\gerar-env-prod.ps1
```

## Antes do deploy

- [x] VPS Linux — `147.93.185.146` (Cloud VPS 10)
- [x] DNS `app.granjauniao.com.br` → `147.93.185.146`
- [ ] Docker instalado na VPS — ver [DEPLOY_APP_GRANJAUNIAO.md](DEPLOY_APP_GRANJAUNIAO.md)
- [ ] Senhas definidas (não use as de desenvolvimento)

## Configuração

- [ ] `cd infra && cp env.prod.example .env.prod`
- [ ] `POSTGRES_PASSWORD` — forte
- [ ] `ADMIN_PASSWORD` — forte (anotar em local seguro)
- [ ] `JWT_SECRET` — string longa aleatória
- [ ] `CORS_ORIGIN` — URL HTTPS do painel
- [ ] `GRANJA_WHATSAPP` — número real da granja
- [ ] `WEBHOOK_SECRET` — forte (para quando o site voltar)

## Deploy

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
curl https://app.SEU-DOMINIO/api/health
```

## Após subir

- [ ] Login no painel com nova senha
- [ ] Cadastrar produtos e preços reais
- [ ] Pedido de teste completo
- [ ] Backup: cron com `infra/scripts/backup.sh`
- [ ] HTTPS (Certbot ou proxy) — ver [DEPLOY_APP_GRANJAUNIAO.md](DEPLOY_APP_GRANJAUNIAO.md) · script `infra/scripts/vps-https.sh`

## Opcional (depois)

- [ ] Site granjauniao.com.br — [INTEGRACAO_GRANJAUNIAO.md](INTEGRACAO_GRANJAUNIAO.md)
- [x] Múltiplos operadores — [OPERADORES.md](OPERADORES.md)
- [x] Lotes e validade (FIFO) — [LOTES.md](LOTES.md)
- [x] PWA no celular — [PWA.md](PWA.md)

## Suporte

Documentação: [README.md](../README.md) · Operação: [MANUAL_OPERACAO.md](MANUAL_OPERACAO.md)

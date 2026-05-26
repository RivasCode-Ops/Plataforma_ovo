# Segurança — piloto Granja União

## Modelo de confiança

| Ativo | Onde vive | Tratamento |
|-------|-----------|------------|
| `JWT_SECRET` | `.env.prod` (VPS) | Secreto real; API não sobe em produção se vazio ou default |
| `ADMIN_PASSWORD` | `.env.prod` | Secreto real; não usar `plataforma123` em produção |
| `POSTGRES_PASSWORD` | `.env.prod` | Só servidor; nunca no Git |
| `SITE_PEDIDO_TOKEN` | `.env.prod` + build do site | **Público no JS do site** — não é segredo; mitigar com rate limit nginx |
| `WEBHOOK_SECRET` | `.env.prod` | Header preferido; evitar `?secret=` em URLs |

## Produção (desde auditoria P0)

- Conta **demo/demo123** não é criada com `NODE_ENV=production`.
- API falha ao iniciar se `JWT_SECRET`, `ADMIN_PASSWORD` ou `SITE_PEDIDO_TOKEN` estiverem ausentes/fracos.

## Rotação de credenciais

1. Gerar novos valores (`.\scripts\gerar-env-prod.ps1` ou `openssl rand -hex 24`).
2. Atualizar `infra/.env.prod` na VPS.
3. `docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build`
4. Se mudou `SITE_PEDIDO_TOKEN`: `.\scripts\publicar-site-build.ps1` + secret no GitHub `granjauniao-site`.
5. Pedir novo login no painel (tokens antigos expiram em até 7 dias).

## Incidente: token ou senha vazou

1. Rotacionar o valor na VPS imediatamente.
2. Rebuild API + site.
3. Revisar logs nginx: `/var/log/nginx/access.log` (pedidos abusivos).
4. Nunca commitar `COLAR-*.txt`, `.env.prod` ou console com senhas.

## Checklist mínimo

- [ ] `.env.prod` só na VPS e PC local (gitignored)
- [ ] Nginx rate limit em `/api/pedido-site` (`meuzovo-rate-limit.conf`)
- [ ] HTTPS em `app.granjauniao.com.br`
- [ ] Backup diário (`vps-setup-backup.sh`)

Deploy: [DEPLOY_UNICO.md](DEPLOY_UNICO.md)

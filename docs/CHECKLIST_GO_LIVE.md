# Checklist — colocar em produção (VPS)

Use quando tiver servidor e domínio (ex.: `app.suagranja.com.br`).

## Antes do deploy

- [ ] VPS Linux com Docker instalado
- [ ] Domínio com registro **A** apontando para o IP da VPS
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
- [ ] HTTPS (Certbot ou proxy)

## Opcional (depois)

- [ ] Site granjauniao.com.br — [INTEGRACAO_GRANJAUNIAO.md](INTEGRACAO_GRANJAUNIAO.md)
- [ ] Segundo operador (Fase 2)
- [ ] Controle por lote / validade (Fase 2)

## Suporte

Documentação: [README.md](../README.md) · Operação: [MANUAL_OPERACAO.md](MANUAL_OPERACAO.md)

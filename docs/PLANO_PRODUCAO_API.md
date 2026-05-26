# Plano produção — API meuzovo

## Migration no banco (VPS)

```bash
cd /opt/Plataforma_ovo
bash infra/scripts/vps-migrate-all.sh
# ou manual:
docker exec -i plataforma_ovo_db psql -U plataforma plataforma_ovo < backend/migrations/010_plataforma_producao.sql
```

## Novos endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check (DB + Stone configurado) |
| GET | `/api/contas-receber` | Fiado + contas abertas |
| PATCH | `/api/contas-receber/:id/pagar?origem=fiado\|conta` | Baixa pagamento |
| GET | `/api/stone/status` | Stone ativo? |
| POST | `/api/stone/webhook` | Eventos (header webhook secret) |

## Idempotência (duas tabelas)

| Uso | Tabela | TTL |
|-----|--------|-----|
| `POST /api/pedidos`, balcão | `idempotencia` | 24 h |
| Webhook site (`/api/webhook/*`) | `webhook_idempotencia` | permanente |
| Webhook Stone (`/api/stone/webhook`) | `idempotencia` chave `stone:…` | 7 dias |

Envie header `Idempotency-Key: <uuid>` em POST/PATCH críticos.

## Ordem dos middlewares

1. `requireAuth` (define `req.usuario`)
2. `auditoriaMiddleware`
3. `operadorLimiter` / `criticoLimiter` nas rotas (usa `req.usuario.login`)

## Testes

```bash
node backend/scripts/test-producao.mjs
# API_BASE=http://127.0.0.1:8080 DATABASE_URL=... ADMIN_PASSWORD=...
```

## Variáveis opcionais

```env
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_CRITICO_MAX=10
STONE_TOKEN=   # quando integrar Stone/Pagar.me
```

## Jobs em background

A cada 15 min: limpa idempotência expirada e processa `eventos_transacionais` pendentes.

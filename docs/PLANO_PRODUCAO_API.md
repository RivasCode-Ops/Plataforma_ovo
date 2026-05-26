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

## Idempotência

Envie header `Idempotency-Key: <uuid>` em POST/PATCH críticos (pedidos, balcão).

## Variáveis opcionais

```env
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_CRITICO_MAX=10
STONE_TOKEN=   # quando integrar Stone/Pagar.me
```

## Jobs em background

A cada 15 min: limpa idempotência expirada e processa `eventos_transacionais` pendentes.

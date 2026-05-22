# Lotes e validade

Controle de entrada de ovos por **lote** e **data de validade**.

## Registrar produção

1. **Lotes e validade** → **+ Registrar lote**
2. Produto, código (opcional), quantidade, data de validade
3. O estoque do produto **aumenta** automaticamente

## Ao vender (pedido confirmado)

O sistema baixa estoque pelo lote que **vence primeiro** (FIFO).

## Desconto temporário

Promoção por lote (ex.: −15% até sexta) — [DESCONTO_LOTE.md](DESCONTO_LOTE.md).

## Alertas

Lotes que vencem em **7 dias** ou já vencidos aparecem em vermelho/amarelo no topo.

## Migração (banco Docker já existente)

```bash
docker exec -i plataforma_ovo_db psql -U plataforma plataforma_ovo < backend/migrations/003_lotes.sql
```

Reinicie a API em modo local (`npm run dev:local`).

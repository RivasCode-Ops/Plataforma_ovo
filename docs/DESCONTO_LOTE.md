# Desconto temporário por lote

Para girar estoque (lote perto do vencimento ou excesso), o operador aplica **desconto %** em um lote específico até uma **data de validade da promoção**.

## Como usar

1. **Lotes** → na linha do lote, clique **Desconto**
2. Informe o percentual (1–90%) e **Válido até** (último dia com desconto)
3. **Salvar promoção**

Para encerrar antes da data: **Remover**.

## O que acontece automaticamente

- Após `desconto_ate`, o desconto **deixa de valer** (sem ação manual).
- Pedidos, balcão e cardápio público usam o preço com desconto nos lotes FIFO que ainda têm promo ativa.
- Preço **atacado do cliente** continua valendo; o desconto do lote é aplicado sobre esse valor (o menor preço prevalece na prática).

## Migração (PostgreSQL existente)

```bash
docker exec -i plataforma_ovo_db psql -U plataforma plataforma_ovo < backend/migrations/008_lote_desconto.sql
```

Reinicie a API (`docker compose ... up -d --build backend`).

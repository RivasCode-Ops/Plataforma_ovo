# Rotas de entrega

Organize entregas por região (Centro, Zona Norte, etc.).

## Cadastrar rotas

1. Menu **Rotas** → informe nome e ordem → **Adicionar** (admin)
2. A **ordem** define a sequência na impressão (1 = primeiro)

No modo local já vêm 3 rotas de exemplo: Centro, Zona Norte, Zona Sul.

## Vincular clientes

- **Rotas** → lista de clientes com seletor de rota, ou
- **Clientes** → abra o cliente → **Rota de entrega**

## Pedidos do dia

**Pedidos do dia** agrupa automaticamente por rota, com totais por região. Use **Imprimir** para levar na van.

Clientes sem rota aparecem em **Sem rota definida**.

## Migração (PostgreSQL existente)

```bash
psql $DATABASE_URL -f backend/migrations/007_rotas.sql
```

Reinicie a API.

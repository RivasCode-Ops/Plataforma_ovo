# Controle do dia — instalação e criação

Acompanha quantidades do dia com conversão para **ovos**.

## Termos

| Termo | Significado |
|-------|-------------|
| **Instalado** | Produção registrada hoje (entrada de **lote**) |
| **Vendido / Criado** | Saída em **pedidos** do dia (exceto cancelados) |
| **Meta do dia** | Objetivo por produto (unidade do cadastro: dúzia, etc.) |
| **Falta instalar** | Meta − instalado (ainda falta lançar produção) |
| **Falta vender** | Meta − vendido (ainda falta vender para a meta) |

## Conversão

- Unidade **dúzia** → × 12 ovos
- Outras unidades → 1 unidade = 1 ovo (ajuste o cadastro se usar outra regra)

## Configurar meta

1. **Produtos** → **Editar**
2. Campo **Meta do dia** (ex.: 50 dúzias = meta de 600 ovos)

## Onde ver

- Menu **Controle do dia** — tabela completa
- **Início** — card “Falta vender (ovos)”
- **Novo pedido** — aviso de estoque ao montar itens
- **Lotes** — ovos por lote e quanto falta no lote

## Migração (PostgreSQL existente)

```bash
psql $DATABASE_URL -f backend/migrations/005_meta_diaria.sql
```

Reinicie a API.

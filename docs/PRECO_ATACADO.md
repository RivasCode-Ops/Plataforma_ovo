# Preço atacado por cliente

Preço especial por produto para clientes atacadistas (padaria, mercado, revenda).

## Cadastrar preço atacado

1. **Clientes** → clique no cliente (precisa existir — criado no primeiro pedido)
2. Seção **Preços atacado** (somente **admin**)
3. Informe o valor ao lado de cada produto → **OK**
4. Para remover, clique em **×**

O preço de **varejo** continua no cadastro de Produtos.

## No pedido

Ao digitar o **telefone** de um cliente com preços atacado:

- Aparece aviso azul “Cliente com preço atacado”
- Os produtos mostram valor atacado na lista
- O total e o pedido confirmado usam o preço atacado automaticamente

## Assinaturas

Ao **gerar pedido** de uma assinatura, o sistema também aplica o preço atacado do cliente.

## Migração (PostgreSQL existente)

```bash
psql $DATABASE_URL -f backend/migrations/006_cliente_precos.sql
```

Reinicie a API.

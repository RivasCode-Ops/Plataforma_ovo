# Operadores — múltiplos logins

## Perfis

| Perfil | Acesso |
|--------|--------|
| **admin** | Painel completo, produtos, relatório, cadastro de operadores |
| **operador** | Pedidos, clientes, assinaturas, lotes, WhatsApp |

## Primeiro acesso

Na primeira subida da API, é criado automaticamente um **admin** com:

- Login: `ADMIN_USER` (padrão `admin`)
- Senha: `ADMIN_PASSWORD` (padrão `plataforma123`)

Altere no `.env` antes de ir para produção.

## Cadastrar operador

1. Entre como **admin**
2. Menu **Operadores** → preencha nome, login, senha e perfil
3. O operador entra com o login em minúsculas

## Banco existente (PostgreSQL)

```bash
psql $DATABASE_URL -f backend/migrations/004_operadores.sql
```

Reinicie a API para criar o admin inicial (se a tabela estiver vazia).

## Migração de tokens antigos

Após atualizar, peça a todos que façam **login novamente** (tokens antigos continuam válidos como admin até expirar).

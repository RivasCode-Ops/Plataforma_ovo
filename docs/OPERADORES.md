# Operadores — múltiplos logins

## Perfis

| Perfil | Acesso |
|--------|--------|
| **admin** | Painel completo, produtos, relatório, operadores, prestação de contas |
| **operador** | Pedidos, clientes, assinaturas, lotes, **turno/rota de entrega** |

Não há perfil “entregador”. A rota de entrega é um **turno** com `responsavel_nome` (ex.: “Marcos”, “Van 2”).

## Primeiro acesso

Na primeira subida da API, é criado automaticamente um **admin** com:

- Login: `ADMIN_USER` (padrão `admin`)
- Senha: `ADMIN_PASSWORD` (padrão `plataforma123`)

Altere no `.env` antes de ir para produção.

## Cadastrar operador

1. Entre como **admin**
2. Menu **Operadores** → preencha nome, login, senha e perfil
3. O operador entra com o login em minúsculas

## Turno de entrega

Ver `docs/MODULO_ENTREGA_TURNO.md`.

- Menu **Turno / Rota** → informar responsável pela saída → iniciar.
- Admin fecha em **Prestação**.

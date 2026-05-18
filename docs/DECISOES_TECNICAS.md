# Decisões Técnicas - Plataforma Ovo

## Stack escolhida (e por quê)

| Componente | Escolha | Motivo |
|------------|---------|--------|
| **Backend** | Node.js + Express | Ecossistema unificado com frontend; boa oferta de libs para WhatsApp e webhooks |
| **Banco** | PostgreSQL | Relacional, ACID — crítico para estoque e pedidos em transação |
| **ORM / queries** | `pg` (driver nativo) na Fase 1 | Menos camadas no MVP; Prisma na Fase 2 se o modelo crescer |
| **Frontend admin** | React + Vite + TailwindCSS | Produtivo para painel; só o necessário na Fase 1 |
| **WhatsApp** | Merkus API | Já validada no MEU-OVO; reutilizar padrões de integração |
| **Deploy** | Docker + Nginx em VPS | Custo baixo (~R$ 30/mês); um `docker compose up` sobe tudo |

## O que NÃO usamos na Fase 1

- Redis (cache)
- Kubernetes
- Microsserviços
- Banco NoSQL
- App mobile nativo
- Múltiplos operadores / RBAC complexo

## Integração com site da granja

| Fase | Abordagem |
|------|-----------|
| **1 (MVP)** | Botão WhatsApp + endpoint `GET /api/cardapio-whatsapp` |
| **2** | Webhook `POST /api/webhook/pedido` |
| **3 (opcional)** | Widget JS embutido no site (WordPress/Wix) |

## Autenticação (Fase 1)

- Um único usuário (dono da granja)
- Senha em variável de ambiente + sessão JWT simples
- Fase 2: múltiplos operadores com papéis

## Convenções de API

- Prefixo: `/api`
- Respostas JSON: `{ "data": ... }` ou `{ "erro": "mensagem" }`
- Status de pedido: `novo` → `confirmado` → `pago` → `enviado` → `entregue` | `cancelado`

## Variáveis de ambiente críticas

Ver `backend/.env.example`: `DATABASE_URL`, `MERKUS_API_KEY`, `MERKUS_INSTANCE`, `JWT_SECRET`, `ADMIN_PASSWORD`.

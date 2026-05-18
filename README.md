# Plataforma Ovo

Sistema central para gestão operacional de pedidos de ovos em granja: varejo, atacado e assinatura. Controle de estoque, links WhatsApp e painel administrativo.

## Objetivo

Gerenciar pedidos de múltiplos canais (WhatsApp, site, presencial), controlar estoque, confirmar e acompanhar entregas — com evolução por fases (MVP enxuto primeiro).

## Stack (Fase 1)

| Camada | Tecnologia |
|--------|------------|
| Backend | Node.js + Express |
| Banco | PostgreSQL |
| Admin | React + Vite + TailwindCSS |
| WhatsApp | Link wa.me (sem API externa) |
| Deploy | Docker + Nginx (VPS) |

Detalhes em [docs/DECISOES_TECNICAS.md](docs/DECISOES_TECNICAS.md).

## Estrutura

```
backend/     API e regras de negócio
frontend/    Painel administrativo
docs/        Manuais operacionais
infra/       Docker, Nginx, scripts de backup
```

## Deploy em produção (VPS)

```bash
cd infra
cp env.prod.example .env.prod   # edite senhas e domínio
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

Guia completo: [docs/DEPLOY.md](docs/DEPLOY.md)

## Como rodar (desenvolvimento)

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose (recomendado)

### Com Docker

```powershell
cd infra
docker compose up -d
```

O PostgreSQL sobe na porta `5432`. Aplique o schema:

```powershell
docker compose exec postgres psql -U plataforma -d plataforma_ovo -f /docker-entrypoint-initdb.d/schema.sql
```

(ou execute `backend/schema.sql` manualmente após o primeiro `up`)

### Backend local (sem Docker — prova rápida)

```powershell
cd backend
npm install
npm run dev:local
```

Usa banco em memória (`pg-mem`). API em `http://localhost:3000`.

Detalhes: [docs/PROVA_LOCAL.md](docs/PROVA_LOCAL.md)

### Backend local (com PostgreSQL)

```powershell
cd backend
copy .env.example .env
# Remova USE_MEMORY_DB e configure DATABASE_URL
npm install
npm run db:schema
npm run dev
```

### Frontend local

```powershell
cd frontend
npm install
npm run dev
```

Painel em `http://localhost:5173`.

## Integração com site da granja (MVP)

**Fase 1:** botão "Comprar via WhatsApp" no site + endpoint `/api/cardapio-whatsapp`.

**Fase 2:** webhook `POST /api/webhook/pedido` quando o site enviar pedidos automaticamente.

## Documentação operacional

- [Decisões técnicas](docs/DECISOES_TECNICAS.md)
- [Manual de operação](docs/MANUAL_OPERACAO.md)
- [Backup e restore](docs/BACKUP_RESTORE.md)
- [Plano B (caneta)](docs/PLANO_B_CANETA.md)
- [WhatsApp (link direto)](docs/WHATSAPP.md)
- [Site granjauniao.com.br](docs/INTEGRACAO_GRANJAUNIAO.md)

## Roadmap MVP (7 dias)

1. Repositório e estrutura
2. Schema do banco
3. Criar pedido (com validação de estoque)
4. Listar pedidos (painel)
5. WhatsApp ao criar pedido
6. Frontend básico
7. Teste com usuários reais

## Licença

MIT — ver [LICENSE](LICENSE).

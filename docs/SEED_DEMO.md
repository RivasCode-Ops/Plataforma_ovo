# Dados de demonstração (seed)

O script que você colou usa **colunas que não existem** neste projeto (`email` em operadores, `preco_varejo`, `pendente`, etc.).

Use o script oficial:

```bash
cd backend
npm run seed:demo
```

Na VPS (com containers no ar):

```bash
docker exec plataforma_ovo_api node scripts/seed-demo.js
```

Cria clientes, pedidos, lotes, rotas e operadores **ana** / **marcos** (senha `demo123`). Não apaga o admin nem dados reais.

## Usuário demo rápido (só login)

Senha fácil para quem vai **só testar o painel**:

```bash
# Na VPS
docker exec plataforma_ovo_api node scripts/criar-usuario-demo.js
```

| Campo | Valor |
|-------|--------|
| Login | `demo` |
| Senha | `demo123` |
| Perfil | `operador` (pedidos, clientes, assinaturas — sem cadastro de operadores) |

Local: `cd backend && npm run criar:demo`

---

## Por que o painel não mostra mudanças novas (NextStepsCard)?

O código novo está só no **seu PC**. A VPS clonou o GitHub na hora do deploy — precisa atualizar:

```powershell
# PC: commit + push (quando quiser)
git add frontend/src/components/NextStepsCard.jsx ...
git push
```

```bash
# VPS
cd /opt/Plataforma_ovo && git pull
cd infra
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build web
```

Depois: Ctrl+F5 em http://app.granjauniao.com.br

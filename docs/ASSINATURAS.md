# Assinaturas — entregas recorrentes

Clientes com entrega fixa (ex.: toda **quarta**, 2 dúzias de ovos caipira).

## Cadastrar

1. Painel → **Assinaturas** → **+ Nova assinatura**
2. Cliente, frequência (semanal / quinzenal), dia da semana
3. Itens e quantidades → **Salvar**

## Dia a dia

- **Entregas nos próximos 7 dias** — o que vence esta semana (vermelho = atrasado)
- **Gerar pedido desta entrega** — cria pedido, baixa estoque, avança a próxima data (+7 ou +14 dias)
- Abre WhatsApp com resumo (como pedido normal)

## Pausar / reativar

Use **Pausar** nas férias do cliente ou **Reativar** quando voltar.

## Banco existente (Docker/Postgres)

Se o banco foi criado antes desta função:

```bash
docker exec -i plataforma_ovo_db psql -U plataforma plataforma_ovo < backend/migrations/002_assinaturas.sql
```

Em dev com memória (`npm run dev:local`), reinicie a API — o schema já inclui as tabelas.

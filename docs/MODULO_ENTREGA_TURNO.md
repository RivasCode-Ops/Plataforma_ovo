# Módulo — Turno / rota de entrega

Modelagem **centrada no turno**, sem perfil de autenticação “entregador”.

## Identificação

| Campo | Uso |
|-------|-----|
| `turnos_entrega.responsavel_nome` | Identificador operacional de quem sai (nome, van, apelido) — **obrigatório** |
| `turnos_entrega.aberto_por_login` | Auditoria: login do painel que abriu o turno (opcional) |
| `sessionStorage` `plataforma_ovo_turno_id` | Celular retoma o turno pelo `#id` |

Perfis de login continuam apenas **admin** e **operador**.

## Tabelas

`turnos_entrega`, `paradas_entrega`, `vendas_avulsas_turno`, `demandas_turno`, `prestacoes_contas`

Migrations: `011_entrega_turno.sql`, `012_entrega_turno_sem_perfil.sql` (ajuste se 011 antiga já rodou).

## API (`/api/turnos-entrega`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/iniciar` | `{ responsavel_nome, produtos_extras_info?, regiao_rota_id? }` |
| GET | `/atual?turno_id=` | Detalhe do turno |
| GET | `/abertos` | Turnos do dia em operação |
| GET | `/:id` | Detalhe |
| POST | `/:id/encerrar` | Aguardar prestação |
| POST | `/:id/paradas/:id/concluir` | Concluir entrega + troco |
| POST | `/:id/vendas-avulsas` | Venda avulsa |
| POST | `/demandas` | Admin — `{ turno_id, cliente, ... }` |
| POST | `/:id/demandas/:id/responder` | Aceitar/recusar |
| POST | `/:id/prestacao` | Admin — fechar contas |

## Telas

- **Turno / Rota** — qualquer operador logado (`EntregaTurnoPainel.jsx`)
- **Prestação** — admin (`PrestacaoContasPainel.jsx`)

## Deploy

```bash
bash infra/scripts/vps-migrate-all.sh
```

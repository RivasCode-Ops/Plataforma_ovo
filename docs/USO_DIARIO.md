# Uso diário — Plataforma Ovo

Guia rápido para o operador da granja (computador local).

## Abrir o sistema

**Opção 1 — um clique**

```powershell
cd C:\_PROJETOS\Plataforma_ovo
powershell -ExecutionPolicy Bypass -File scripts\iniciar.ps1
```

Abre o painel no navegador automaticamente.

**Opção 2 — manual (2 janelas)**

```powershell
cd C:\_PROJETOS\Plataforma_ovo\backend
npm run dev:local
```

```powershell
cd C:\_PROJETOS\Plataforma_ovo\frontend
npm run dev
```

Acesse: http://localhost:5173

**Celular:** instale como app — veja [PWA.md](PWA.md)

**Alertas:** menu Alertas → ative push no celular — [NOTIFICACOES.md](NOTIFICACOES.md)

---

## Fluxo do dia

### Manhã
1. Abrir o sistema (`iniciar.ps1`)
2. Conferir **Pedidos do dia** — imprimir se houver entregas
3. **Assinaturas** → entregas da semana → **Gerar pedido** em cada uma
4. Ver **Produtos** — estoque baixo (&lt; 10) em amarelo

### Pedido novo (WhatsApp, telefone, balcão)
1. **Novo pedido** → nome, telefone, itens → **Confirmar**
2. Abre o WhatsApp com mensagem pronta → enviar ao cliente
3. Status: `confirmado` → `pago` → `enviado` → `entregue`

### Fim do dia
1. **Relatório** — conferir total do dia
2. **Exportar CSV** (opcional, para planilha)
3. Fechar as janelas do terminal (encerra o sistema)

---

## Login padrão (dev)

| Campo | Valor |
|-------|--------|
| Usuário | `admin` |
| Senha | `plataforma123` |

Altere em `backend\.env` → `ADMIN_PASSWORD`.

---

## Se der erro

| Problema | Solução |
|----------|---------|
| Página não abre | Backend rodando? Veja janela "dev:local" |
| Login inválido | Confira `backend\.env` e reinicie a API |
| Estoque errado | **Produtos** → Editar estoque |
| Sistema caiu | Use [PLANO_B_CANETA.md](PLANO_B_CANETA.md) e lance depois |

---

## Produção (VPS)

Quando tiver servidor: [DEPLOY.md](DEPLOY.md) e [CHECKLIST_GO_LIVE.md](CHECKLIST_GO_LIVE.md).

# Manual de Operação - meuzovo

Guia para o dono ou operador da granja usar o sistema no dia a dia.

## Acesso ao painel

1. Abra o endereço do painel (ex.: `https://admin.suagranja.com.br`).
2. Entre com usuário e senha fornecidos na instalação.

## Registrar um pedido (manual)

1. Menu **Pedidos** → **Novo pedido**.
2. Informe nome e telefone do cliente (ou selecione cliente existente).
3. Adicione os produtos e quantidades.
4. Confira o total e clique em **Salvar**.
5. Abra o link do WhatsApp que o sistema gera para enviar o resumo ao cliente.
6. O estoque é baixado automaticamente ao **confirmar** o pedido.

## Status do pedido

| Status | Significado | Ação usual |
|--------|-------------|------------|
| novo | Pedido recebido, ainda não confirmado | Confirmar após falar com o cliente |
| confirmado | Cliente confirmou; estoque reservado/baixado | Aguardar pagamento |
| pago | Pagamento recebido | Separar para entrega |
| enviado | Saiu para entrega | — |
| entregue | Cliente recebeu | Arquivar |
| cancelado | Pedido cancelado | Estoque devolvido (se já baixado) |

## Estoque

- Em **Produtos**, veja a coluna **Estoque**.
- Alerta visual quando estoque &lt; 10 unidades (configurável na Fase 2).
- Ajuste manual de estoque: editar produto → campo estoque (apenas admin).

## Pedido pelo WhatsApp (cliente)

1. Cliente clica em "Comprar por WhatsApp" no site ou manda mensagem.
2. Você responde com o cardápio ou confirma itens.
3. Lança o pedido no painel com os mesmos itens.
4. Marca status conforme o fluxo acima.

## Quando o sistema não funciona

Use o [Plano B - Caneta](PLANO_B_CANETA.md) e anote pedidos no formulário impresso. Após voltar o sistema, lance os pedidos retroativamente.

## Suporte técnico

Problemas de acesso ou erro na tela: anote a mensagem exata e horário. Consulte [BACKUP_RESTORE.md](BACKUP_RESTORE.md) se precisar restaurar dados.

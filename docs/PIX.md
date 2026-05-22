# PIX — cobrança por pedido

Gera **QR Code** e **copia e cola** com o valor exato do pedido (PIX estático BACEN).

## Configurar

No `backend/.env` (ou `infra/.env.prod`):

```env
GRANJA_PIX_CHAVE=seu-email@granja.com.br
GRANJA_PIX_NOME=Granja Uniao
GRANJA_PIX_CIDADE=SAO PAULO
```

A chave pode ser e-mail, telefone (+55…), CPF/CNPJ ou chave aleatória cadastrada no banco.

Reinicie a API após alterar.

## Usar no painel

1. **Novo pedido** — ao confirmar, abre o modal PIX (se configurado)
2. **Pedidos** — botão **PIX** em cada pedido (exceto cancelados)

O operador envia o QR ou o código ao cliente (WhatsApp, presencial).

## Confirmação de pagamento

O sistema **não confirma** pagamento automaticamente (sem integração bancária).

No painel:

1. **Pedidos** → filtro **Aguardando pagamento** (status novo ou confirmado)
2. Botão verde **Pagamento recebido** na linha do pedido
3. No modal **PIX**, botão **Pagamento recebido — marcar como pago**
4. **Pedidos do dia** — mesmo botão em cada card

API: `PATCH /api/pedidos/:id/pagar` com `{ "forma_pagamento": "pix" }` (opcional).

## Teste local

Use uma chave PIX de teste ou a chave real da granja em ambiente seguro.

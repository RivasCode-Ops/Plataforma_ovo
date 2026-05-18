# WhatsApp — Plataforma Ovo

**Sem API externa** (sem Merkus, sem MEU-OVO). O sistema gera **links wa.me** para você enviar manualmente pelo app WhatsApp.

## Configuração

`backend/.env`:

```env
GRANJA_WHATSAPP=5511999999999
```

Número da granja: DDI 55 + DDD + número, só dígitos.

## Ao criar pedido

A API devolve `whatsapp.link` — abra no navegador ou copie para o cliente.

## Widget do site

O botão no site [granjauniao.com.br](https://www.granjauniao.com.br) já abre o WhatsApp direto (`data-whatsapp` no script).

## Painel

Seção **WhatsApp** → gera link de teste para qualquer número.

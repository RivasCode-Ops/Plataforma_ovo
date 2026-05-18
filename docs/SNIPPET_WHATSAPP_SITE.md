# Snippet para o site da granja (MVP)

Cole no site institucional (HTML, WordPress, etc.):

```html
<a
  href="https://wa.me/5511999999999?text=Quero%20comprar%20ovos!%20Me%20envie%20o%20cardápio"
  target="_blank"
  rel="noopener noreferrer"
  class="btn-comprar"
  style="display:inline-block;padding:12px 24px;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;"
>
  Comprar por WhatsApp
</a>
```

Substitua `5511999999999` pelo número da granja (DDI + DDD + número, sem símbolos).

## Cardápio dinâmico (opcional)

O backend expõe texto pronto para copiar ou encaminhar:

```
GET https://sua-api.com.br/api/cardapio-whatsapp
```

Resposta em texto simples com produtos e preços do banco.

# Integração — www.granjauniao.com.br

Site: [granjauniao.com.br](https://www.granjauniao.com.br)

Duas formas de integrar (pode usar as duas):

| Modo | Quando usar | Pedido na plataforma |
|------|-------------|----------------------|
| **Widget WhatsApp** | Mais rápido, qualquer site | Cliente manda no Zap; você lança no painel |
| **Webhook API** | WordPress com plugin / formulário server-side | Entra automaticamente como status `novo` |

---

## 1. Widget no site (recomendado para começar)

Botão flutuante **“Pedir ovos”** → cardápio da API → envia pedido formatado no WhatsApp.

### Passo a passo (WordPress)

1. Painel WordPress → **Aparência → Editor de temas** ou plugin **Insert Headers and Footers**
2. Cole antes de `</body>`:

```html
<script
  src="https://SUA-API-PRODUCAO/widget/granja-uniao.js"
  data-api="https://SUA-API-PRODUCAO"
  data-whatsapp="55SEUNUMERO"
  data-titulo="Granja União"
></script>
```

3. Troque:
   - `SUA-API-PRODUCAO` → URL da API (ex.: `https://api.plataformaovo.com.br`)
   - `55SEUNUMERO` → WhatsApp da granja (só dígitos, com DDI 55)

### Em desenvolvimento local

```html
<script
  src="http://localhost:3000/widget/granja-uniao.js"
  data-api="http://localhost:3000"
  data-whatsapp="5511999999999"
  data-titulo="Granja União"
></script>
```

O cardápio vem de `GET /api/cardapio` (público).

---

## 2. Webhook — pedido direto na plataforma

Para formulários que enviam POST pelo **servidor** (não coloque o segredo no JavaScript do site).

### Configurar API

`backend/.env`:

```env
WEBHOOK_SECRET=gere-uma-senha-longa-aleatoria
SITE_ORIGEM=granjauniao.com.br
SITE_NOME=Granja União
CORS_ORIGIN=http://localhost:5173,https://www.granjauniao.com.br,https://granjauniao.com.br
```

### Endpoint

```http
POST https://SUA-API/api/webhook/granjauniao
Content-Type: application/json
X-Webhook-Secret: SUA_WEBHOOK_SECRET
```

### Corpo (JSON)

```json
{
  "cliente": {
    "nome": "Maria Silva",
    "telefone": "11999998888",
    "endereco": "Rua Exemplo, 100 - Bairro"
  },
  "itens": [
    { "produto_nome": "Ovos Caipira", "quantidade": 2 },
    { "produto_id": 1, "quantidade": 1 }
  ],
  "observacao": "Entregar de manhã",
  "confirmar": false
}
```

| Campo | Descrição |
|-------|-----------|
| `produto_id` | ID na plataforma (preferido) |
| `produto_nome` | Busca por nome parcial se não tiver ID |
| `confirmar` | `false` = status **novo** (você confirma no painel). `true` = confirma e baixa estoque |

Pedidos do site aparecem com observação `[Site: granjauniao.com.br]`.

### Teste com PowerShell

```powershell
$body = @{
  cliente = @{ nome = "Teste Site"; telefone = "11988887777"; endereco = "Centro" }
  itens = @(@{ produto_nome = "Ovos Caipira"; quantidade = 1 })
  confirmar = $false
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/api/webhook/granjauniao" `
  -Method Post -Body $body -ContentType "application/json" `
  -Headers @{ "X-Webhook-Secret" = "SUA_WEBHOOK_SECRET" }
```

---

## 3. Cardápio JSON (para o site montar página própria)

```http
GET https://SUA-API/api/cardapio
```

```json
{
  "data": {
    "origem": "granjauniao.com.br",
    "produtos": [
      { "id": 1, "nome": "Ovos Brancos", "unidade": "dúzia", "preco": 12, "disponivel": true }
    ]
  }
}
```

---

## 4. WordPress — plugins úteis

| Plugin | Uso |
|--------|-----|
| **WP Webhooks** | Disparar POST para `/api/webhook/granjauniao` ao enviar formulário |
| **Contact Form 7 + Webhook** | Mesmo fluxo |
| **Insert Headers and Footers** | Inserir o script do widget |

---

## 5. Checklist de produção

- [ ] API em HTTPS (`https://api...`)
- [ ] `CORS_ORIGIN` com `https://www.granjauniao.com.br`
- [ ] `WEBHOOK_SECRET` forte
- [ ] Widget com `data-api` e `data-whatsapp` corretos
- [ ] Nomes dos produtos no site alinhados ao painel (para `produto_nome` no webhook)

---

## Próximo passo opcional

- Domínio `api.granjauniao.com.br` apontando para a VPS
- SSL (Let's Encrypt)
- CF7 → webhook automático (podemos montar o JSON exato do seu formulário)

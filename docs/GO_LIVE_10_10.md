# Go-live 10/10 — monitoramento e teste de pedido

Sistema operacional quando: `curl -s https://app.granjauniao.com.br/api/health` → `{"ok":true}`.

---

## 1. UptimeRobot (~5 min)

1. https://uptimerobot.com → conta grátis  
2. **Add Monitor**  
   - Monitor Type: **HTTP(s)**  
   - Friendly Name: `Granja API health`  
   - URL: `https://app.granjauniao.com.br/api/health`  
   - Monitoring Interval: 5 minutes  
3. **Alert Contacts** → seu e-mail (e SMS/WhatsApp se disponível)  
4. Opcional — **Keyword Monitoring**: `ok` (alerta se sumir da resposta)  
5. Save  

---

## 2. Teste de pedido no painel (~10 min)

URL: https://app.granjauniao.com.br  
Login: `admin` + senha do `ADMIN_PASSWORD` em `infra/.env.prod` na VPS.

| # | Ação | Esperado |
|---|------|----------|
| 1 | **Novo pedido** → cliente + itens → salvar | Mensagem de sucesso |
| 2 | **Pedidos do dia** | Pedido listado |
| 3 | Abrir pedido → mudar status | Status atualiza |
| 4 | **Produtos** | Lista carrega |
| 5 | **Relatório** (se usar) | Sem erro 500 |

---

## 3. Teste pedido pelo site (opcional)

1. https://granjauniao.com.br → seção pedido online  
2. Enviar pedido teste  
3. No painel: pedido com origem site / `[Site: granjauniao.com.br]`  

Requer `SITE_PEDIDO_TOKEN` igual no build do site e na VPS.

---

## 4. Deploy automático (GitHub)

Secrets no repo (Settings → Secrets → Actions), se VPS nova:

- `VPS_HOST` = `147.93.185.146`  
- `VPS_PASSWORD`  
- Demais só se **não** existir `.env.prod` na VPS  

Com `.env.prod` já na VPS, o workflow **não sobrescreve** senhas.

---

## 5. Comandos VPS de rotina

```bash
# Health
curl -s https://app.granjauniao.com.br/api/health

# Backup manual
bash /opt/Plataforma_ovo/infra/scripts/backup.sh

# Atualizar app
bash /opt/Plataforma_ovo/infra/scripts/vps-deploy-atualizacao.sh
```

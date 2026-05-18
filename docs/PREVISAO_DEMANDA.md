# Previsão de demanda

Estimativa de quanto produzir com base no histórico de vendas e nas assinaturas ativas.

## Como é calculado

| Coluna | Significado |
|--------|-------------|
| **Média/dia** | Total vendido no histórico ÷ número de dias |
| **Prev. pedidos** | Média/dia × dias da previsão |
| **Assinaturas** | Soma das entregas programadas no período |
| **Demanda** | Prev. pedidos + assinaturas |
| **Estoque** | Saldo atual no cadastro |
| **Produzir +** | Demanda − estoque (se positivo) |
| **Tendência** | Compara últimos 7 dias com os 7 anteriores |

## Uso

1. Menu **Previsão** (admin)
2. Escolha o histórico (7, 14 ou 30 dias) e o período a prever
3. Use **Produzir +** para registrar lotes em **Lotes**

É uma estimativa — ajuste pela sazonalidade e feriados da granja.

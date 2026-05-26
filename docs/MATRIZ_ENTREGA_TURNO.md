# Matriz — demanda vs implementação (turno/rota)

| Requisito | Implementação atual (após ajuste) | Ajuste necessário | Arquivos impactados |
|-----------|-----------------------------------|-------------------|---------------------|
| Sem perfil/cadastro formal de entregador | Apenas `admin` e `operador`; turno usa `responsavel_nome` | Nenhum (corrigido) | `auth.js`, `operadores.js`, `011`/`012` migrations, `OperadoresPainel.jsx` |
| Identificador operacional da saída | Campo obrigatório `responsavel_nome` ao iniciar turno | Nenhum | `turnoEntrega.js`, `EntregaTurnoPainel.jsx`, `011_entrega_turno.sql` |
| Saída de rota (qtd entregas, extras, paradas, status) | Turno `em_rota` + paradas importadas + `produtos_extras_info` | Opcional: filtrar por `regiao_rota_id` na UI | `turnoEntrega.js`, `EntregaTurnoPainel.jsx` |
| Entrega programada — concluir com recebimento/troco | `POST .../paradas/:id/concluir` | Nenhum | `turnoEntrega.js`, `pagamentoEntrega.js`, `EntregaTurnoPainel.jsx` |
| Venda avulsa com troco | `POST .../vendas-avulsas` | Nenhum | `turnoEntrega.js`, `EntregaTurnoPainel.jsx` |
| Nova demanda da loja em tempo real | Admin envia por `turno_id`; polling 25s no painel | Futuro: WebSocket/push | `turnoEntrega.js`, `PrestacaoContasPainel.jsx` |
| Aceitar/recusar demanda | `POST .../demandas/:id/responder` | Nenhum | `turnoEntrega.js`, `EntregaTurnoPainel.jsx` |
| Prestação de contas ao admin | `POST .../prestacao` + tela Prestação | Nenhum | `turnoEntrega.js`, `PrestacaoContasPainel.jsx` |
| Divergência exige observação | Validação no `confirmarPrestacao` | Nenhum | `turnoEntrega.js` |
| Sem estoque embarcado | Não há tabelas/movimentação de estoque do turno | Nenhum | — |
| Status operacional/financeiro | Parcial: `status_operacional` na parada; financeiro em parada/venda/prestação | Expandir labels “nova demanda” na UI se quiser espelhar spec literal | `011_entrega_turno.sql` |
| Retomar turno no celular | `sessionStorage` + lista “Retomar turno” | Opcional: QR com `#turno` | `turnoStorage.js`, `EntregaTurnoPainel.jsx` |
| Bloquear novo turno com prestação pendente | Bloqueia por `responsavel_nome` + data (um turno aberto por nome) | Regra global “qualquer pendente” — futuro | `turnoEntrega.js` |

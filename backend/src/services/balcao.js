import { withTransaction } from '../db.js';
import { gerarPixCobranca, pixConfigurado } from '../integrations/pix.js';
import { baixarEstoqueFifo } from './lotes.js';
import { mapaPrecosCliente, resolverPrecoUnitario } from './clientePrecos.js';

const PAGAMENTOS = ['dinheiro', 'pix', 'cartao', 'fiado'];

export async function registrarVendaBalcao({
  cliente_id,
  nome_avulso,
  itens,
  pagamento,
  troco,
}) {
  if (!PAGAMENTOS.includes(pagamento)) {
    throw Object.assign(new Error('Forma de pagamento inválida'), { status: 400 });
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    throw Object.assign(new Error('Informe ao menos um item'), { status: 400 });
  }
  if (pagamento === 'fiado' && !cliente_id) {
    throw Object.assign(
      new Error('Venda fiado exige cliente cadastrado (nome e telefone)'),
      { status: 400 }
    );
  }

  const resultado = await withTransaction(async (client) => {
    let clienteId = cliente_id ? Number(cliente_id) : null;
    let clienteNome = (nome_avulso || '').trim() || 'Consumidor';

    if (clienteId) {
      const cli = await client.query('SELECT id, nome FROM clientes WHERE id = $1', [clienteId]);
      if (!cli.rows.length) {
        throw Object.assign(new Error('Cliente não encontrado'), { status: 404 });
      }
      clienteNome = cli.rows[0].nome;
    } else {
      const tel = `balcao${Date.now().toString().slice(-11)}`;
      const ins = await client.query(
        'INSERT INTO clientes (nome, telefone) VALUES ($1, $2) RETURNING id, nome',
        [clienteNome.slice(0, 100), tel]
      );
      clienteId = ins.rows[0].id;
      clienteNome = ins.rows[0].nome;
    }

    const precosAtacado = await mapaPrecosCliente(clienteId, client);
    let total = 0;
    const itensResolvidos = [];

    for (const item of itens) {
      const prod = await client.query(
        'SELECT id, nome, preco, estoque, ativo FROM produtos WHERE id = $1 FOR UPDATE',
        [item.produto_id]
      );
      if (prod.rows.length === 0) {
        throw Object.assign(new Error(`Produto ${item.produto_id} não encontrado`), { status: 400 });
      }
      const p = prod.rows[0];
      if (!p.ativo) {
        throw Object.assign(new Error(`Produto ${p.nome} está inativo`), { status: 400 });
      }
      const qtd = Number(item.quantidade);
      if (!Number.isInteger(qtd) || qtd < 1) {
        throw Object.assign(new Error('Quantidade inválida'), { status: 400 });
      }
      if (p.estoque < qtd) {
        throw Object.assign(
          new Error(`Estoque insuficiente para ${p.nome} (disponível: ${p.estoque})`),
          { status: 400 }
        );
      }
      const precoUnitario = resolverPrecoUnitario(
        precosAtacado,
        p.id,
        p.preco,
        item.preco_unitario
      );
      const subtotal = qtd * precoUnitario;
      total += subtotal;
      itensResolvidos.push({
        produto_id: p.id,
        quantidade: qtd,
        preco_unitario: precoUnitario,
        subtotal,
        nome: p.nome,
      });
    }

    let status = 'confirmado';
    if (pagamento === 'dinheiro' || pagamento === 'cartao') {
      status = 'pago';
    }

    const obsPartes = [`[Balcão] Pagamento: ${pagamento}`];
    if (pagamento === 'dinheiro' && troco != null && troco !== '') {
      const t = Number(troco);
      if (Number.isFinite(t) && t > 0) {
        obsPartes.push(`Troco para: R$ ${t.toFixed(2)}`);
      }
    }
    if (!cliente_id && nome_avulso?.trim()) {
      obsPartes.push(`Avulso: ${nome_avulso.trim()}`);
    }
    const observacao = obsPartes.join(' | ');

    const pedidoInsert = await client.query(
      `INSERT INTO pedidos (cliente_id, total, observacao, status, tipo, forma_pagamento)
       VALUES ($1, $2, $3, $4, 'balcao', $5)
       RETURNING id, status, total`,
      [clienteId, total, observacao, status, pagamento]
    );
    const pedido = pedidoInsert.rows[0];

    for (const item of itensResolvidos) {
      await client.query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [pedido.id, item.produto_id, item.quantidade, item.preco_unitario, item.subtotal]
      );
      await baixarEstoqueFifo(client, item.produto_id, item.quantidade);
    }

    let fiadoId = null;
    if (pagamento === 'fiado') {
      const fiado = await client.query(
        `INSERT INTO fiado (cliente_id, pedido_id, valor)
         VALUES ($1, $2, $3) RETURNING id`,
        [clienteId, pedido.id, total]
      );
      fiadoId = fiado.rows[0].id;
    }

    return { pedido, clienteId, clienteNome, itensResolvidos, total, fiadoId };
  });

  let pix = null;
  if (pagamento === 'pix' && pixConfigurado()) {
    const gerado = await gerarPixCobranca({
      valor: resultado.total,
      pedidoId: resultado.pedido.id,
      clienteNome: resultado.clienteNome,
    });
    if (gerado.ok) {
      pix = {
        copia_cola: gerado.copia_cola,
        qr_data_url: gerado.qr_data_url,
        valor: gerado.valor,
      };
    }
  }

  return {
    pedido_id: resultado.pedido.id,
    status: resultado.pedido.status,
    total: resultado.total,
    pagamento,
    cliente_id: resultado.clienteId,
    cliente_nome: resultado.clienteNome,
    fiado_id: resultado.fiadoId,
    pix,
  };
}

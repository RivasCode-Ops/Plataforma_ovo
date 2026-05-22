import { pool, withTransaction } from '../db.js';
import { gerarLinkWhatsApp } from '../integrations/whatsapp.js';
import { gerarPixCobranca, pixConfigurado } from '../integrations/pix.js';
import { baixarEstoqueFifo, resolverPrecoUnitarioFifo } from './lotes.js';
import { mapaPrecosCliente, resolverPrecoUnitario } from './clientePrecos.js';

const STATUS_VALIDOS = ['novo', 'confirmado', 'pago', 'enviado', 'entregue', 'cancelado'];

const AGUARDANDO_PAGAMENTO = ['novo', 'confirmado'];

export async function listarPedidos({ status, aguardando_pagamento, limite = 50 } = {}) {
  const params = [];
  let where = '';

  if (aguardando_pagamento) {
    where = `WHERE p.status = ANY($1::text[])`;
    params.push(AGUARDANDO_PAGAMENTO);
  } else if (status) {
    params.push(status);
    where = `WHERE p.status = $${params.length}`;
  }

  params.push(limite);
  const limiteIdx = params.length;

  const { rows } = await pool.query(
    `SELECT p.id, p.status, p.total, p.data_pedido, p.observacao,
            c.id AS cliente_id, c.nome AS cliente_nome, c.telefone AS cliente_telefone
     FROM pedidos p
     JOIN clientes c ON c.id = p.cliente_id
     ${where}
     ORDER BY p.data_pedido DESC
     LIMIT $${limiteIdx}`,
    params
  );

  return rows;
}

export async function obterPedido(id) {
  const pedido = await pool.query(
    `SELECT p.*, c.nome AS cliente_nome, c.telefone AS cliente_telefone, c.endereco AS cliente_endereco
     FROM pedidos p
     JOIN clientes c ON c.id = p.cliente_id
     WHERE p.id = $1`,
    [id]
  );

  if (pedido.rows.length === 0) return null;

  const itens = await pool.query(
    `SELECT ip.*, pr.nome AS produto_nome, pr.unidade
     FROM itens_pedido ip
     JOIN produtos pr ON pr.id = ip.produto_id
     WHERE ip.pedido_id = $1`,
    [id]
  );

  return { ...pedido.rows[0], itens: itens.rows };
}

export async function criarPedido({ cliente, itens, observacao, confirmar = true }) {
  if (!cliente?.nome || !cliente?.telefone) {
    throw Object.assign(new Error('Cliente precisa de nome e telefone'), { status: 400 });
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    throw Object.assign(new Error('Pedido precisa de ao menos um item'), { status: 400 });
  }

  const resultado = await withTransaction(async (client) => {
    let clienteId = cliente.id;

    if (!clienteId) {
      const existente = await client.query(
        'SELECT id FROM clientes WHERE telefone = $1',
        [cliente.telefone]
      );
      if (existente.rows.length > 0) {
        clienteId = existente.rows[0].id;
        await client.query(
          `UPDATE clientes SET nome = $1,
            endereco = COALESCE($2, endereco),
            rota_id = COALESCE($3, rota_id)
           WHERE id = $4`,
          [cliente.nome, cliente.endereco ?? null, cliente.rota_id ?? null, clienteId]
        );
      } else {
        const novo = await client.query(
          `INSERT INTO clientes (nome, telefone, endereco, rota_id)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [cliente.nome, cliente.telefone, cliente.endereco ?? null, cliente.rota_id ?? null]
        );
        clienteId = novo.rows[0].id;
      }
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
      if (confirmar && p.estoque < qtd) {
        throw Object.assign(
          new Error(`Estoque insuficiente para ${p.nome} (disponível: ${p.estoque})`),
          { status: 400 }
        );
      }
      let precoUnitario = resolverPrecoUnitario(
        precosAtacado,
        p.id,
        p.preco,
        item.preco_unitario
      );
      precoUnitario = await resolverPrecoUnitarioFifo(
        client,
        p.id,
        qtd,
        precoUnitario
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

    const statusInicial = confirmar ? 'confirmado' : 'novo';
    const pedidoInsert = await client.query(
      `INSERT INTO pedidos (cliente_id, total, observacao, status)
       VALUES ($1, $2, $3, $4) RETURNING id, status, total`,
      [clienteId, total, observacao ?? null, statusInicial]
    );
    const pedido = pedidoInsert.rows[0];

    for (const item of itensResolvidos) {
      await client.query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [pedido.id, item.produto_id, item.quantidade, item.preco_unitario, item.subtotal]
      );
      if (confirmar) {
        await baixarEstoqueFifo(client, item.produto_id, item.quantidade);
      }
    }

    return { pedido, clienteId, itensResolvidos, total };
  });

  const msg = formatarMensagemPedido(resultado);
  const whatsapp = gerarLinkWhatsApp(cliente.telefone, msg);

  let pix = null;
  if (pixConfigurado() && resultado.pedido.status !== 'cancelado') {
    const gerado = await gerarPixCobranca({
      valor: resultado.total,
      pedidoId: resultado.pedido.id,
      clienteNome: cliente.nome,
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
    whatsapp,
    pix,
  };
}

export async function atualizarStatusPedido(id, status) {
  if (!STATUS_VALIDOS.includes(status)) {
    throw Object.assign(new Error(`Status inválido: ${status}`), { status: 400 });
  }

  const { rows } = await pool.query(
    `UPDATE pedidos SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );

  if (rows.length === 0) {
    throw Object.assign(new Error('Pedido não encontrado'), { status: 404 });
  }

  return rows[0];
}

/** Confirma pagamento manual (PIX, dinheiro, etc.) */
export async function marcarPedidoPago(id, { forma_pagamento = 'pix' } = {}) {
  const pedido = await obterPedido(id);
  if (!pedido) {
    throw Object.assign(new Error('Pedido não encontrado'), { status: 404 });
  }
  if (pedido.status === 'cancelado') {
    throw Object.assign(new Error('Pedido cancelado não pode ser pago'), { status: 400 });
  }
  if (pedido.status === 'pago') {
    return pedido;
  }
  if (!AGUARDANDO_PAGAMENTO.includes(pedido.status)) {
    throw Object.assign(
      new Error(`Pedido em status "${pedido.status}" — use o seletor de status se necessário`),
      { status: 400 }
    );
  }

  const { rows } = await pool.query(
    `UPDATE pedidos
     SET status = 'pago',
         forma_pagamento = COALESCE($1, forma_pagamento),
         updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [forma_pagamento, id]
  );
  return rows[0];
}

function formatarMensagemPedido({ pedido, itensResolvidos, total }) {
  const linhas = itensResolvidos.map(
    (i) => `• ${i.quantidade}x ${i.nome} — R$ ${i.subtotal.toFixed(2)}`
  );
  return [
    `*Pedido #${pedido.id} recebido!*`,
    '',
    ...linhas,
    '',
    `*Total: R$ ${Number(total).toFixed(2)}*`,
    `Status: ${pedido.status}`,
    '',
    'Obrigado pela preferência!',
  ].join('\n');
}

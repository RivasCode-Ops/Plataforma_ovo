import { pool, withTransaction } from '../db.js';
import * as pedidosService from './pedidos.js';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function nomeDiaSemana(dia) {
  return DIAS[dia] ?? String(dia);
}

/** Próxima data do dia da semana (0=dom … 6=sáb) a partir de ref */
export function calcularProximaEntrega(diaSemana, ref = new Date()) {
  const d = new Date(ref);
  d.setHours(12, 0, 0, 0);
  const diff = (diaSemana - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 0 : diff));
  return d.toISOString().slice(0, 10);
}

export function avancarEntrega(frequencia, dataIso) {
  const d = new Date(dataIso + 'T12:00:00');
  d.setDate(d.getDate() + (frequencia === 'quinzenal' ? 14 : 7));
  return d.toISOString().slice(0, 10);
}

export async function listarAssinaturas({ status } = {}) {
  const params = [];
  let where = '';
  if (status) {
    params.push(status);
    where = `WHERE a.status = $${params.length}`;
  }

  const { rows } = await pool.query(
    `SELECT a.*, c.nome AS cliente_nome, c.telefone AS cliente_telefone, c.endereco AS cliente_endereco
     FROM assinaturas a
     JOIN clientes c ON c.id = a.cliente_id
     ${where}
     ORDER BY a.proxima_entrega ASC, c.nome`,
    params
  );

  const result = [];
  for (const a of rows) {
    const itens = await pool.query(
      `SELECT ai.quantidade, ai.produto_id, p.nome, p.unidade, p.preco
       FROM assinatura_itens ai
       JOIN produtos p ON p.id = ai.produto_id
       WHERE ai.assinatura_id = $1`,
      [a.id]
    );
    result.push({
      ...a,
      dia_semana_nome: nomeDiaSemana(a.dia_semana),
      itens: itens.rows.map((i) => ({
        produto_id: i.produto_id,
        quantidade: i.quantidade,
        nome: i.nome,
        unidade: i.unidade,
        preco: Number(i.preco),
      })),
    });
  }
  return result;
}

export async function listarEntregasDaSemana() {
  const { rows } = await pool.query(
    `SELECT a.id
     FROM assinaturas a
     WHERE a.status = 'ativa'
       AND a.proxima_entrega <= CURRENT_DATE + interval '7 days'
     ORDER BY a.proxima_entrega`
  );
  const ids = rows.map((r) => r.id);
  const todas = await listarAssinaturas({ status: 'ativa' });
  return todas.filter((a) => ids.includes(a.id));
}

export async function criarAssinatura({ cliente, frequencia, dia_semana, itens, observacao }) {
  if (!['semanal', 'quinzenal'].includes(frequencia)) {
    throw Object.assign(new Error('frequencia deve ser semanal ou quinzenal'), { status: 400 });
  }
  const dia = Number(dia_semana);
  if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
    throw Object.assign(new Error('dia_semana inválido (0=dom … 6=sáb)'), { status: 400 });
  }
  if (!itens?.length) {
    throw Object.assign(new Error('Informe ao menos um item'), { status: 400 });
  }

  const proxima = calcularProximaEntrega(dia);

  return withTransaction(async (client) => {
    let clienteId = cliente.id;
    if (!clienteId) {
      const ex = await client.query('SELECT id FROM clientes WHERE telefone = $1', [
        cliente.telefone,
      ]);
      if (ex.rows.length) {
        clienteId = ex.rows[0].id;
        await client.query(
          `UPDATE clientes SET nome = $1,
            endereco = COALESCE($2, endereco),
            rota_id = COALESCE($3, rota_id)
           WHERE id = $4`,
          [cliente.nome, cliente.endereco ?? null, cliente.rota_id ?? null, clienteId]
        );
      } else {
        const ins = await client.query(
          `INSERT INTO clientes (nome, telefone, endereco, rota_id)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [cliente.nome, cliente.telefone, cliente.endereco ?? null, cliente.rota_id ?? null]
        );
        clienteId = ins.rows[0].id;
      }
    }

    const sub = await client.query(
      `INSERT INTO assinaturas (cliente_id, frequencia, dia_semana, proxima_entrega, observacao)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [clienteId, frequencia, dia, proxima, observacao ?? null]
    );
    const assinaturaId = sub.rows[0].id;

    for (const item of itens) {
      await client.query(
        `INSERT INTO assinatura_itens (assinatura_id, produto_id, quantidade) VALUES ($1, $2, $3)`,
        [assinaturaId, item.produto_id, item.quantidade]
      );
    }

    return { assinatura_id: assinaturaId, proxima_entrega: proxima };
  });
}

export async function atualizarStatusAssinatura(id, status) {
  if (!['ativa', 'pausada', 'cancelada'].includes(status)) {
    throw Object.assign(new Error('Status inválido'), { status: 400 });
  }
  const { rows } = await pool.query(
    `UPDATE assinaturas SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  if (!rows.length) throw Object.assign(new Error('Assinatura não encontrada'), { status: 404 });
  return rows[0];
}

export async function gerarPedidoDaAssinatura(id) {
  const lista = await listarAssinaturas();
  const ass = lista.find((a) => a.id === Number(id));
  if (!ass) throw Object.assign(new Error('Assinatura não encontrada'), { status: 404 });
  if (ass.status !== 'ativa') {
    throw Object.assign(new Error('Assinatura não está ativa'), { status: 400 });
  }

  const itens = ass.itens.map((i) => ({
    produto_id: i.produto_id,
    quantidade: i.quantidade,
  }));

  const pedido = await pedidosService.criarPedido({
    cliente: {
      id: ass.cliente_id,
      nome: ass.cliente_nome,
      telefone: ass.cliente_telefone,
      endereco: ass.cliente_endereco,
    },
    itens,
    observacao: `[Assinatura #${ass.id} ${ass.frequencia}] ${ass.observacao || ''}`.trim(),
    confirmar: true,
  });

  const novaData = avancarEntrega(ass.frequencia, ass.proxima_entrega);
  await pool.query(
    `UPDATE assinaturas SET proxima_entrega = $1, updated_at = NOW() WHERE id = $2`,
    [novaData, id]
  );

  return { pedido, proxima_entrega: novaData };
}

import { pool } from '../db.js';
import { calcularTroco, normalizarForma } from '../utils/pagamentoEntrega.js';
import { pedidosDoDia } from './relatorios.js';
import { atualizarStatusPedido } from './pedidos.js';

const STATUS_TURNO_EDITAVEL = ['aberta', 'em_rota'];

/** Operador só acessa turno que ele abriu (`aberto_por_login`). Admin acessa todos. */
export function assertAcessoTurno(turno, { login, papel }) {
  if (papel === 'admin') return;
  if (papel !== 'operador') {
    const err = new Error('Acesso negado.');
    err.status = 403;
    throw err;
  }
  if (!turno.aberto_por_login || turno.aberto_por_login !== login) {
    const err = new Error('Turno fora do seu escopo operacional.');
    err.status = 403;
    throw err;
  }
}

async function turnoPorId(id) {
  const { rows } = await pool.query(`SELECT * FROM turnos_entrega WHERE id = $1`, [id]);
  if (!rows.length) {
    const err = new Error('Turno não encontrado.');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

function assertTurnoEditavel(turno) {
  if (!STATUS_TURNO_EDITAVEL.includes(turno.status)) {
    const err = new Error('Turno não permite alterações neste status.');
    err.status = 400;
    throw err;
  }
}

function descricaoItens(itens) {
  if (!itens?.length) return 'Pedido';
  return itens.map((i) => `${i.quantidade}× ${i.nome}`).join(', ');
}

async function carregarParadas(turnoId) {
  const { rows } = await pool.query(
    `SELECT * FROM paradas_entrega WHERE turno_id = $1 ORDER BY id`,
    [turnoId]
  );
  return rows.map((r) => ({
    ...r,
    valor_previsto: Number(r.valor_previsto),
    valor_recebido: r.valor_recebido != null ? Number(r.valor_recebido) : null,
    troco: Number(r.troco || 0),
  }));
}

async function carregarVendas(turnoId) {
  const { rows } = await pool.query(
    `SELECT * FROM vendas_avulsas_turno WHERE turno_id = $1 ORDER BY criado_em`,
    [turnoId]
  );
  return rows.map((r) => ({
    ...r,
    valor_total: Number(r.valor_total),
    valor_recebido: Number(r.valor_recebido),
    troco: Number(r.troco),
  }));
}

export async function resumoFinanceiroTurno(turnoId) {
  const paradas = await carregarParadas(turnoId);
  const vendas = await carregarVendas(turnoId);

  const totais = {
    entregas_concluidas: 0,
    vendas_avulsas: vendas.length,
    total_previsto: 0,
    total_dinheiro: 0,
    total_pix: 0,
    total_outros: 0,
    em_maos: 0,
  };

  for (const p of paradas) {
    if (p.status_operacional !== 'concluida') continue;
    totais.entregas_concluidas += 1;
    const v = Number(p.valor_recebido ?? p.valor_previsto);
    if (p.status_financeiro === 'pendente_prestacao') totais.em_maos += v;
    totais.total_previsto += v;
    const forma = normalizarForma(p.forma_pagamento);
    if (forma === 'dinheiro') totais.total_dinheiro += v;
    else if (forma === 'pix') totais.total_pix += v;
    else totais.total_outros += v;
  }

  for (const v of vendas) {
    const val = Number(v.valor_total);
    if (v.status_financeiro === 'pendente_prestacao') totais.em_maos += val;
    totais.total_previsto += val;
    const forma = normalizarForma(v.forma_pagamento);
    if (forma === 'dinheiro') totais.total_dinheiro += val;
    else if (forma === 'pix') totais.total_pix += val;
    else totais.total_outros += val;
  }

  totais.total_previsto = Math.round(totais.total_previsto * 100) / 100;
  totais.em_maos = Math.round(totais.em_maos * 100) / 100;
  totais.total_dinheiro = Math.round(totais.total_dinheiro * 100) / 100;
  totais.total_pix = Math.round(totais.total_pix * 100) / 100;
  totais.total_outros = Math.round(totais.total_outros * 100) / 100;

  return totais;
}

export async function detalheTurno(turnoId, ctx = null) {
  const turno = await turnoPorId(turnoId);
  if (ctx) assertAcessoTurno(turno, ctx);
  const paradas = await carregarParadas(turnoId);
  const vendas = await carregarVendas(turnoId);

  const { rows: demandas } = await pool.query(
    `SELECT * FROM demandas_turno WHERE turno_id = $1 ORDER BY enviado_em DESC`,
    [turnoId]
  );

  const { rows: prestRows } = await pool.query(
    `SELECT * FROM prestacoes_contas WHERE turno_id = $1`,
    [turnoId]
  );

  const resumo = await resumoFinanceiroTurno(turnoId);

  return {
    turno: {
      ...turno,
      qtd_paradas: paradas.length,
      qtd_pendentes: paradas.filter((p) => p.status_operacional === 'pendente').length,
      qtd_concluidas: paradas.filter((p) => p.status_operacional === 'concluida').length,
    },
    paradas,
    vendas,
    demandas,
    prestacao: prestRows[0] || null,
    resumo,
  };
}

export async function obterTurnoPorId(turnoId, ctx = null) {
  if (!turnoId) return null;
  try {
    return await detalheTurno(Number(turnoId), ctx);
  } catch (e) {
    if (e.status === 404 || e.status === 403) return null;
    throw e;
  }
}

export async function listarTurnosAbertos({ data_ref, aberto_por_login } = {}) {
  const dia = data_ref || new Date().toISOString().slice(0, 10);
  const params = [dia];
  let filtroLogin = '';
  if (aberto_por_login) {
    params.push(aberto_por_login);
    filtroLogin = ` AND t.aberto_por_login = $2`;
  }
  const { rows } = await pool.query(
    `SELECT t.id, t.responsavel_nome, t.data_ref, t.status, t.iniciado_em, t.aberto_por_login,
            (SELECT COUNT(*) FROM paradas_entrega p WHERE p.turno_id = t.id) AS qtd_paradas
     FROM turnos_entrega t
     WHERE t.data_ref = $1::date
       AND t.status IN ('aberta', 'em_rota', 'aguardando_prestacao')${filtroLogin}
     ORDER BY t.id DESC`,
    params
  );
  return rows;
}

export async function iniciarTurno(abertoPorLogin, body, { papel } = {}) {
  if (!['admin', 'operador'].includes(papel)) {
    const err = new Error('Acesso negado.');
    err.status = 403;
    throw err;
  }
  const responsavel = String(body.responsavel_nome || '').trim();
  if (!responsavel) {
    const err = new Error('responsavel_nome é obrigatório (quem sai na rota).');
    err.status = 400;
    throw err;
  }

  const dia = body.data_ref || new Date().toISOString().slice(0, 10);
  const regiao_rota_id = body.regiao_rota_id || null;

  const aberto = await pool.query(
    `SELECT id FROM turnos_entrega
     WHERE responsavel_nome = $1 AND data_ref = $2::date
       AND status IN ('aberta', 'em_rota', 'aguardando_prestacao')
     LIMIT 1`,
    [responsavel, dia]
  );
  if (aberto.rows.length) {
    const err = new Error(
      `Já existe turno aberto para "${responsavel}" nesta data. Use o turno #${aberto.rows[0].id} ou encerre antes.`
    );
    err.status = 409;
    throw err;
  }

  const { rows } = await pool.query(
    `INSERT INTO turnos_entrega (
       responsavel_nome, aberto_por_login, data_ref, regiao_rota_id, status,
       produtos_extras_info, iniciado_em
     ) VALUES ($1, $2, $3::date, $4, 'em_rota', $5, NOW())
     RETURNING *`,
    [
      responsavel,
      abertoPorLogin || null,
      dia,
      regiao_rota_id,
      body.produtos_extras_info?.trim() || null,
    ]
  );

  const turno = rows[0];
  await importarParadasDePedidos(turno.id, dia, regiao_rota_id);
  return detalheTurno(turno.id, { login: abertoPorLogin, papel });
}

export async function importarParadasDePedidos(turnoId, dia, regiaoRotaId) {
  const dados = await pedidosDoDia(dia);
  const todos = [
    ...(dados.por_rota || []).flatMap((g) =>
      g.pedidos.map((p) => ({ ...p, rota_id: g.rota_id }))
    ),
    ...(dados.sem_rota?.pedidos || []).map((p) => ({ ...p, rota_id: null })),
  ];

  for (const p of todos) {
    if (p.status === 'cancelado') continue;
    if (regiaoRotaId && p.rota_id !== regiaoRotaId) continue;

    const exists = await pool.query(
      `SELECT 1 FROM paradas_entrega WHERE turno_id = $1 AND pedido_id = $2`,
      [turnoId, p.id]
    );
    if (exists.rows.length) continue;

    await pool.query(
      `INSERT INTO paradas_entrega (
         turno_id, pedido_id, cliente_nome, endereco, telefone,
         quantidade_descricao, valor_previsto, forma_pagamento_prevista, status_operacional
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendente')`,
      [
        turnoId,
        p.id,
        p.cliente_nome,
        p.cliente_endereco || '',
        p.cliente_telefone || '',
        descricaoItens(p.itens),
        p.total,
        p.status === 'pago' ? 'pix' : 'dinheiro',
      ]
    );
  }
}

export async function concluirParada(turnoId, paradaId, body, ctx) {
  const turno = await turnoPorId(turnoId);
  assertAcessoTurno(turno, ctx);
  assertTurnoEditavel(turno);

  const { rows } = await pool.query(
    `SELECT * FROM paradas_entrega WHERE id = $1 AND turno_id = $2`,
    [paradaId, turnoId]
  );
  if (!rows.length) {
    const err = new Error('Parada não encontrada neste turno.');
    err.status = 404;
    throw err;
  }
  const parada = rows[0];

  const forma = normalizarForma(body.forma_pagamento || parada.forma_pagamento_prevista);
  const { valor_recebido, troco } = calcularTroco({
    forma_pagamento: forma,
    valor_total: Number(parada.valor_previsto),
    valor_recebido: body.valor_recebido ?? parada.valor_previsto,
  });

  await pool.query(
    `UPDATE paradas_entrega SET
       status_operacional = 'concluida',
       valor_recebido = $2,
       forma_pagamento = $3,
       troco = $4,
       observacao = COALESCE($5, observacao),
       recebedor_nome = $6,
       concluido_em = NOW(),
       status_financeiro = 'pendente_prestacao'
     WHERE id = $1`,
    [
      paradaId,
      valor_recebido,
      forma,
      troco,
      body.observacao?.trim() || null,
      body.recebedor_nome?.trim() || null,
    ]
  );

  if (parada.pedido_id) {
    try {
      await atualizarStatusPedido(parada.pedido_id, 'entregue');
    } catch {
      /* ignore */
    }
  }

  return detalheTurno(turnoId, ctx);
}

export async function paradaNaoEntregue(turnoId, paradaId, { observacao } = {}, ctx) {
  const turno = await turnoPorId(turnoId);
  assertAcessoTurno(turno, ctx);
  assertTurnoEditavel(turno);

  await pool.query(
    `UPDATE paradas_entrega SET
       status_operacional = 'nao_entregue',
       observacao = $3,
       concluido_em = NOW(),
       status_financeiro = 'fechado'
     WHERE id = $1 AND turno_id = $2`,
    [paradaId, turnoId, observacao?.trim() || null]
  );

  return detalheTurno(turnoId, ctx);
}

export async function registrarVendaAvulsa(turnoId, registradoPorLogin, body, ctx) {
  const turno = await turnoPorId(turnoId);
  assertAcessoTurno(turno, ctx);
  assertTurnoEditavel(turno);

  const valor_total = Number(body.valor_total);
  const forma = normalizarForma(body.forma_pagamento);
  const { valor_recebido, troco } = calcularTroco({
    forma_pagamento: forma,
    valor_total,
    valor_recebido: body.valor_recebido,
  });

  await pool.query(
    `INSERT INTO vendas_avulsas_turno (
       turno_id, registrado_por_login, cliente_opcional, quantidade_descricao,
       valor_total, valor_recebido, forma_pagamento, troco, observacao
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      turnoId,
      registradoPorLogin || null,
      body.cliente_opcional?.trim() || null,
      body.quantidade_descricao?.trim() || null,
      valor_total,
      valor_recebido,
      forma,
      troco,
      body.observacao?.trim() || null,
    ]
  );

  return detalheTurno(turnoId, ctx);
}

export async function criarDemanda(adminLogin, body) {
  const turnoId = Number(body.turno_id);
  if (!turnoId) {
    const err = new Error('turno_id é obrigatório.');
    err.status = 400;
    throw err;
  }

  const turno = await turnoPorId(turnoId);
  if (!['aberta', 'em_rota'].includes(turno.status)) {
    const err = new Error('Turno não está em operação.');
    err.status = 400;
    throw err;
  }

  const { rows } = await pool.query(
    `INSERT INTO demandas_turno (
       turno_id, enviado_por, cliente_nome, endereco,
       quantidade_descricao, valor, observacao, status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendente')
     RETURNING *`,
    [
      turnoId,
      adminLogin,
      body.cliente_nome?.trim() || 'Cliente',
      body.endereco?.trim() || '',
      body.quantidade_descricao?.trim() || '',
      Number(body.valor) || 0,
      body.observacao?.trim() || null,
    ]
  );

  return rows[0];
}

export async function responderDemanda(turnoId, demandaId, { aceitar, motivo_recusa }, ctx) {
  const turno = await turnoPorId(turnoId);
  assertAcessoTurno(turno, ctx);
  assertTurnoEditavel(turno);

  const { rows } = await pool.query(
    `SELECT * FROM demandas_turno WHERE id = $1 AND turno_id = $2`,
    [demandaId, turnoId]
  );
  if (!rows.length) {
    const err = new Error('Demanda não encontrada neste turno.');
    err.status = 404;
    throw err;
  }
  const d = rows[0];
  if (d.status !== 'pendente') {
    const err = new Error('Demanda já respondida.');
    err.status = 400;
    throw err;
  }

  if (!aceitar) {
    await pool.query(
      `UPDATE demandas_turno SET status = 'recusada', motivo_recusa = $2, respondido_em = NOW()
       WHERE id = $1`,
      [demandaId, motivo_recusa?.trim() || null]
    );
    return detalheTurno(turnoId, ctx);
  }

  const { rows: paradaRows } = await pool.query(
    `INSERT INTO paradas_entrega (
       turno_id, demanda_id, cliente_nome, endereco, quantidade_descricao,
       valor_previsto, status_operacional
     ) VALUES ($1, $2, $3, $4, $5, $6, 'pendente')
     RETURNING id`,
    [turnoId, demandaId, d.cliente_nome, d.endereco, d.quantidade_descricao, d.valor]
  );

  await pool.query(
    `UPDATE demandas_turno SET status = 'aceita', respondido_em = NOW(), parada_id = $2
     WHERE id = $1`,
    [demandaId, paradaRows[0].id]
  );

  return detalheTurno(turnoId, ctx);
}

export async function encerrarTurno(turnoId, ctx) {
  const turno = await turnoPorId(turnoId);
  assertAcessoTurno(turno, ctx);
  if (!STATUS_TURNO_EDITAVEL.includes(turno.status)) {
    const err = new Error('Turno já encerrado ou em prestação.');
    err.status = 400;
    throw err;
  }

  const resumo = await resumoFinanceiroTurno(turnoId);

  await pool.query(
    `UPDATE turnos_entrega SET status = 'aguardando_prestacao', encerrado_em = NOW() WHERE id = $1`,
    [turnoId]
  );

  await pool.query(
    `INSERT INTO prestacoes_contas (
       turno_id, total_previsto, total_dinheiro, total_pix, total_outros, status
     ) VALUES ($1, $2, $3, $4, $5, 'pendente')
     ON CONFLICT (turno_id) DO UPDATE SET
       total_previsto = EXCLUDED.total_previsto,
       total_dinheiro = EXCLUDED.total_dinheiro,
       total_pix = EXCLUDED.total_pix,
       total_outros = EXCLUDED.total_outros`,
    [turnoId, resumo.total_previsto, resumo.total_dinheiro, resumo.total_pix, resumo.total_outros]
  );

  return detalheTurno(turnoId, ctx);
}

export async function listarTurnosAdmin({ status } = {}) {
  let q = `SELECT t.*,
           (SELECT COUNT(*) FROM paradas_entrega p WHERE p.turno_id = t.id) AS qtd_paradas,
           pc.status AS prestacao_status
           FROM turnos_entrega t
           LEFT JOIN prestacoes_contas pc ON pc.turno_id = t.id`;
  const params = [];
  if (status) {
    params.push(status);
    q += ` WHERE t.status = $1`;
  }
  q += ` ORDER BY t.id DESC LIMIT 50`;
  const { rows } = await pool.query(q, params);
  return rows;
}

export async function confirmarPrestacao(turnoId, adminLogin, { valor_entregue_admin, observacao_diferenca }) {
  const turno = await turnoPorId(turnoId);
  if (turno.status !== 'aguardando_prestacao') {
    const err = new Error('Turno não está aguardando prestação.');
    err.status = 400;
    throw err;
  }

  const resumo = await resumoFinanceiroTurno(turnoId);
  const entregue = Number(valor_entregue_admin);
  if (Number.isNaN(entregue) || entregue < 0) {
    const err = new Error('Informe valor_entregue_admin válido.');
    err.status = 400;
    throw err;
  }

  const esperado = resumo.total_dinheiro;
  const diferenca = Math.round((entregue - esperado) * 100) / 100;
  let status = 'prestado_completo';
  if (Math.abs(diferenca) > 0.009) {
    if (!observacao_diferenca?.trim()) {
      const err = new Error('Observação obrigatória quando há divergência.');
      err.status = 400;
      throw err;
    }
    status = 'com_divergencia';
  }

  await pool.query(
    `UPDATE prestacoes_contas SET
       valor_entregue_admin = $2,
       diferenca = $3,
       observacao_diferenca = $4,
       status = $5,
       conferido_por = $6,
       conferido_em = NOW()
     WHERE turno_id = $1`,
    [turnoId, entregue, diferenca, observacao_diferenca?.trim() || null, status, adminLogin]
  );

  await pool.query(
    `UPDATE paradas_entrega SET status_financeiro = 'prestado_completo'
     WHERE turno_id = $1 AND status_financeiro = 'pendente_prestacao'`,
    [turnoId]
  );
  await pool.query(
    `UPDATE vendas_avulsas_turno SET status_financeiro = 'prestado_completo'
     WHERE turno_id = $1 AND status_financeiro = 'pendente_prestacao'`,
    [turnoId]
  );

  await pool.query(`UPDATE turnos_entrega SET status = 'fechada' WHERE id = $1`, [turnoId]);

  return detalheTurno(turnoId);
}

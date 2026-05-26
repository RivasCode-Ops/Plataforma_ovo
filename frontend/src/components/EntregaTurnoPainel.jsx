import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { calcTrocoPreview, FORMAS_PAGAMENTO } from '../utils/pagamentoEntrega.js';
import { getTurnoIdSalvo, salvarTurnoId } from '../utils/turnoStorage.js';

const inputClass =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none';

function mapsUrl(endereco) {
  if (!endereco?.trim()) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco.trim())}`;
}

export default function EntregaTurnoPainel() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState('paradas');
  const [responsavelNome, setResponsavelNome] = useState('');
  const [extrasInfo, setExtrasInfo] = useState('');
  const [turnosAbertos, setTurnosAbertos] = useState([]);
  const [turnoRetomar, setTurnoRetomar] = useState('');
  const [paradaAtiva, setParadaAtiva] = useState(null);
  const [formConcluir, setFormConcluir] = useState({
    forma_pagamento: 'dinheiro',
    valor_recebido: '',
    recebedor_nome: '',
    observacao: '',
  });
  const [formAvulsa, setFormAvulsa] = useState({
    cliente_opcional: '',
    quantidade_descricao: '',
    valor_total: '',
    valor_recebido: '',
    forma_pagamento: 'dinheiro',
    observacao: '',
  });

  const carregar = useCallback(async () => {
    setErro('');
    const turnoId = getTurnoIdSalvo();
    if (!turnoId) {
      setDados(null);
      setCarregando(false);
      return;
    }
    try {
      const data = await api.turnoEntregaAtual(turnoId);
      setDados(data);
      if (data?.turno?.status === 'fechada') salvarTurnoId(null);
    } catch (e) {
      setDados(null);
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    api.listarTurnosAbertos().then(setTurnosAbertos).catch(() => setTurnosAbertos([]));
    const t = setInterval(carregar, 25000);
    return () => clearInterval(t);
  }, [carregar]);

  function retomarTurno() {
    const id = Number(turnoRetomar);
    if (!id) return;
    salvarTurnoId(id);
    setCarregando(true);
    carregar();
  }

  async function iniciarRota() {
    setErro('');
    setCarregando(true);
    try {
      const data = await api.iniciarTurnoEntrega({
        responsavel_nome: responsavelNome.trim(),
        produtos_extras_info: extrasInfo.trim() || undefined,
      });
      salvarTurnoId(data.turno.id);
      setDados(data);
      setMsg(`Turno #${data.turno.id} iniciado — ${data.turno.responsavel_nome}`);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function encerrarRota() {
    if (!dados?.turno?.id) return;
    if (!window.confirm('Encerrar rota e ir para prestação de contas?')) return;
    try {
      const data = await api.encerrarTurnoEntrega(dados.turno.id);
      setDados(data);
      setMsg('Rota encerrada. Aguarde conferência do admin.');
    } catch (e) {
      setErro(e.message);
    }
  }

  async function concluirParada(e) {
    e.preventDefault();
    if (!paradaAtiva) return;
    try {
      const data = await api.concluirParadaEntrega(dados.turno.id, paradaAtiva.id, {
        forma_pagamento: formConcluir.forma_pagamento,
        valor_recebido: Number(formConcluir.valor_recebido || paradaAtiva.valor_previsto),
        recebedor_nome: formConcluir.recebedor_nome,
        observacao: formConcluir.observacao,
      });
      setDados(data);
      setParadaAtiva(null);
      setMsg('Entrega concluída.');
    } catch (err) {
      setErro(err.message);
    }
  }

  async function vendaAvulsa(e) {
    e.preventDefault();
    const prev = calcTrocoPreview(
      formAvulsa.forma_pagamento,
      formAvulsa.valor_total,
      formAvulsa.valor_recebido
    );
    if (!prev.ok) {
      setErro(prev.erro || 'Valores inválidos');
      return;
    }
    try {
      const data = await api.vendaAvulsaTurno(dados.turno.id, {
        ...formAvulsa,
        valor_total: Number(formAvulsa.valor_total),
        valor_recebido: Number(formAvulsa.valor_recebido || formAvulsa.valor_total),
      });
      setDados(data);
      setFormAvulsa({
        cliente_opcional: '',
        quantidade_descricao: '',
        valor_total: '',
        valor_recebido: '',
        forma_pagamento: 'dinheiro',
        observacao: '',
      });
      setMsg('Venda avulsa registrada.');
    } catch (err) {
      setErro(err.message);
    }
  }

  async function responderDemanda(id, aceitar) {
    let motivo = '';
    if (!aceitar) {
      motivo = window.prompt('Motivo da recusa (opcional):') || '';
    }
    try {
      const data = await api.responderDemandaTurno(dados.turno.id, id, {
        aceitar,
        motivo_recusa: motivo,
      });
      setDados(data);
      setMsg(aceitar ? 'Demanda aceita na rota.' : 'Demanda recusada.');
    } catch (err) {
      setErro(err.message);
    }
  }

  const trocoConcluir = calcTrocoPreview(
    formConcluir.forma_pagamento,
    paradaAtiva?.valor_previsto,
    formConcluir.valor_recebido
  );
  const trocoAvulsa = calcTrocoPreview(
    formAvulsa.forma_pagamento,
    formAvulsa.valor_total,
    formAvulsa.valor_recebido
  );

  if (carregando && !dados) {
    return <p className="text-sm text-stone-500">Carregando rota…</p>;
  }

  if (!dados?.turno) {
    return (
      <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Iniciar turno / rota</h2>
        <p className="text-sm text-stone-500">
          Informe quem sai na rota (nome ou apelido). Importa pedidos do dia. Sem estoque embarcado.
        </p>
        {erro && <p className="text-sm text-red-700">{erro}</p>}
        <label className="block text-sm">
          <span className="mb-1 block text-stone-600">Responsável pela saída *</span>
          <input
            className={inputClass}
            value={responsavelNome}
            onChange={(e) => setResponsavelNome(e.target.value)}
            placeholder="Ex.: Marcos, Van 2, João entrega"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-stone-600">Produtos extras (informativo)</span>
          <textarea
            className={inputClass}
            rows={2}
            value={extrasInfo}
            onChange={(e) => setExtrasInfo(e.target.value)}
            placeholder="Ex.: 5 dúzias extras para venda avulsa"
          />
        </label>
        <button
          type="button"
          onClick={iniciarRota}
          disabled={!responsavelNome.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Iniciar turno
        </button>

        {turnosAbertos.length > 0 && (
          <div className="mt-6 border-t border-stone-200 pt-4">
            <p className="mb-2 text-sm font-medium text-stone-700">Retomar turno em andamento</p>
            <div className="flex flex-wrap gap-2">
              <select
                className={inputClass}
                value={turnoRetomar}
                onChange={(e) => setTurnoRetomar(e.target.value)}
              >
                <option value="">Selecione…</option>
                {turnosAbertos.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.id} — {t.responsavel_nome} ({t.status})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={retomarTurno}
                className="rounded-lg border border-stone-400 px-4 py-2 text-sm"
              >
                Abrir
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  const { turno, paradas, vendas, demandas, resumo } = dados;
  const aguardandoPrestacao = turno.status === 'aguardando_prestacao';
  const demandasPendentes = (demandas || []).filter((d) => d.status === 'pendente');

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap justify-between gap-2">
          <div>
            <h2 className="text-lg font-medium">
              Turno #{turno.id} — {turno.responsavel_nome}
            </h2>
            <p className="text-xs text-stone-500 capitalize">Status: {turno.status.replace(/_/g, ' ')}</p>
          </div>
          {turno.status === 'em_rota' && (
            <button
              type="button"
              onClick={encerrarRota}
              className="rounded-lg border border-stone-400 px-3 py-1.5 text-sm"
            >
              Encerrar rota
            </button>
          )}
        </div>
        {turno.produtos_extras_info && (
          <p className="mt-2 text-sm text-stone-600">
            <strong>Extras:</strong> {turno.produtos_extras_info}
          </p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-stone-50 p-2">
            <span className="text-stone-500">Paradas</span>
            <p className="font-semibold">{turno.qtd_paradas}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2">
            <span className="text-stone-500">Concluídas</span>
            <p className="font-semibold">{turno.qtd_concluidas}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-2">
            <span className="text-stone-500">Pendentes</span>
            <p className="font-semibold">{turno.qtd_pendentes}</p>
          </div>
          <div className="rounded-lg bg-brand-50 p-2">
            <span className="text-stone-500">Em mãos</span>
            <p className="font-semibold">R$ {(resumo?.em_maos ?? 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {msg && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {msg}
        </p>
      )}
      {erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}

      {aguardandoPrestacao && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          Prestação pendente com o admin. Valor em dinheiro a prestar:{' '}
          <strong>R$ {(resumo?.total_dinheiro ?? 0).toFixed(2)}</strong>
        </p>
      )}

      {!aguardandoPrestacao && (
        <>
          <div className="flex gap-1 overflow-x-auto text-sm">
            {[
              ['paradas', 'Entregas'],
              ['demandas', `Novas (${demandasPendentes.length})`],
              ['avulsa', 'Venda avulsa'],
              ['resumo', 'Resumo'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setAba(id)}
                className={`rounded-lg px-3 py-1.5 ${
                  aba === id ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {aba === 'paradas' && (
            <div className="space-y-3">
              {paradas?.map((p) => (
                <article key={p.id} className="rounded-lg border border-stone-200 p-4">
                  <div className="flex justify-between gap-2">
                    <strong>{p.cliente_nome}</strong>
                    <span className="text-xs capitalize">{p.status_operacional}</span>
                  </div>
                  <p className="text-sm text-stone-600">{p.quantidade_descricao}</p>
                  <p className="text-sm">
                    Previsto: R$ {Number(p.valor_previsto).toFixed(2)}
                    {p.cliente_endereco || p.endereco ? ` · ${p.endereco}` : ''}
                  </p>
                  {mapsUrl(p.endereco) && (
                    <a
                      href={mapsUrl(p.endereco)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-brand-700 underline"
                    >
                      Maps
                    </a>
                  )}
                  {p.status_operacional === 'pendente' && turno.status === 'em_rota' && (
                    <button
                      type="button"
                      className="mt-2 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"
                      onClick={() => {
                        setParadaAtiva(p);
                        setFormConcluir({
                          forma_pagamento: p.forma_pagamento_prevista || 'dinheiro',
                          valor_recebido: String(p.valor_previsto),
                          recebedor_nome: '',
                          observacao: '',
                        });
                      }}
                    >
                      Concluir entrega
                    </button>
                  )}
                  {p.status_operacional === 'concluida' && (
                    <p className="mt-1 text-xs text-emerald-800">
                      Recebido R$ {Number(p.valor_recebido).toFixed(2)} ({p.forma_pagamento})
                      {Number(p.troco) > 0 ? ` · Troco R$ ${Number(p.troco).toFixed(2)}` : ''}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

          {aba === 'demandas' && (
            <div className="space-y-3">
              {demandasPendentes.length === 0 ? (
                <p className="text-sm text-stone-500">Nenhuma demanda nova.</p>
              ) : (
                demandasPendentes.map((d) => (
                  <article key={d.id} className="rounded-lg border border-brand-200 bg-brand-50/40 p-4">
                    <strong>{d.cliente_nome}</strong>
                    <p className="text-sm">{d.endereco}</p>
                    <p className="text-sm">
                      {d.quantidade_descricao} · R$ {Number(d.valor).toFixed(2)}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-brand-600 px-3 py-1 text-xs text-white"
                        onClick={() => responderDemanda(d.id, true)}
                      >
                        Aceitar
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-stone-400 px-3 py-1 text-xs"
                        onClick={() => responderDemanda(d.id, false)}
                      >
                        Recusar
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {aba === 'avulsa' && (
            <form onSubmit={vendaAvulsa} className="space-y-3 rounded-xl border p-4">
              <h3 className="font-medium">Venda avulsa</h3>
              <input
                className={inputClass}
                placeholder="Cliente (opcional)"
                value={formAvulsa.cliente_opcional}
                onChange={(e) => setFormAvulsa({ ...formAvulsa, cliente_opcional: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Quantidade / produtos"
                value={formAvulsa.quantidade_descricao}
                onChange={(e) =>
                  setFormAvulsa({ ...formAvulsa, quantidade_descricao: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  placeholder="Valor total"
                  value={formAvulsa.valor_total}
                  onChange={(e) => setFormAvulsa({ ...formAvulsa, valor_total: e.target.value })}
                  required
                />
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  placeholder="Valor recebido"
                  value={formAvulsa.valor_recebido}
                  onChange={(e) => setFormAvulsa({ ...formAvulsa, valor_recebido: e.target.value })}
                />
              </div>
              <select
                className={inputClass}
                value={formAvulsa.forma_pagamento}
                onChange={(e) => setFormAvulsa({ ...formAvulsa, forma_pagamento: e.target.value })}
              >
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              {formAvulsa.forma_pagamento === 'dinheiro' && trocoAvulsa.ok && (
                <p className="text-sm text-stone-600">Troco: R$ {trocoAvulsa.troco.toFixed(2)}</p>
              )}
              <button type="submit" className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-white">
                Registrar venda
              </button>
            </form>
          )}

          {aba === 'resumo' && resumo && (
            <div className="rounded-xl border p-4 text-sm space-y-1">
              <p>Entregas concluídas: {resumo.entregas_concluidas}</p>
              <p>Vendas avulsas: {resumo.vendas_avulsas}</p>
              <p>Dinheiro: R$ {resumo.total_dinheiro.toFixed(2)}</p>
              <p>PIX: R$ {resumo.total_pix.toFixed(2)}</p>
              <p>Outros: R$ {resumo.total_outros.toFixed(2)}</p>
              <p className="font-semibold">Total a prestar: R$ {resumo.total_previsto.toFixed(2)}</p>
              <p className="font-semibold text-brand-800">Em mãos: R$ {resumo.em_maos.toFixed(2)}</p>
            </div>
          )}
        </>
      )}

      {paradaAtiva && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            onSubmit={concluirParada}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
          >
            <h3 className="font-medium">Concluir — {paradaAtiva.cliente_nome}</h3>
            <p className="text-sm text-stone-500">Total previsto R$ {Number(paradaAtiva.valor_previsto).toFixed(2)}</p>
            <div className="mt-3 space-y-2">
              <select
                className={inputClass}
                value={formConcluir.forma_pagamento}
                onChange={(e) => setFormConcluir({ ...formConcluir, forma_pagamento: e.target.value })}
              >
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                placeholder="Valor recebido"
                value={formConcluir.valor_recebido}
                onChange={(e) => setFormConcluir({ ...formConcluir, valor_recebido: e.target.value })}
                required
              />
              {formConcluir.forma_pagamento === 'dinheiro' && trocoConcluir.ok && (
                <p className="text-sm">Troco: R$ {trocoConcluir.troco.toFixed(2)}</p>
              )}
              <input
                className={inputClass}
                placeholder="Quem recebeu (opcional)"
                value={formConcluir.recebedor_nome}
                onChange={(e) => setFormConcluir({ ...formConcluir, recebedor_nome: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Observação"
                value={formConcluir.observacao}
                onChange={(e) => setFormConcluir({ ...formConcluir, observacao: e.target.value })}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="flex-1 rounded-lg bg-brand-600 py-2 text-sm text-white">
                Confirmar
              </button>
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm"
                onClick={() => setParadaAtiva(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

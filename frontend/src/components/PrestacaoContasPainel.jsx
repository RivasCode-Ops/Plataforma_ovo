import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const inputClass =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none';

export default function PrestacaoContasPainel() {
  const [turnos, setTurnos] = useState([]);
  const [turnosAbertos, setTurnosAbertos] = useState([]);
  const [detalhe, setDetalhe] = useState(null);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [valorEntregue, setValorEntregue] = useState('');
  const [obsDivergencia, setObsDivergencia] = useState('');
  const [formDemanda, setFormDemanda] = useState({
    turno_id: '',
    cliente_nome: '',
    endereco: '',
    quantidade_descricao: '',
    valor: '',
    observacao: '',
  });

  const carregarLista = useCallback(async () => {
    setErro('');
    try {
      const [t, abertos] = await Promise.all([
        api.listarTurnosEntrega(),
        api.listarTurnosAbertos(),
      ]);
      setTurnos(t);
      setTurnosAbertos(abertos);
    } catch (err) {
      setErro(err.message);
    }
  }, []);

  useEffect(() => {
    carregarLista();
  }, [carregarLista]);

  async function abrirTurno(id) {
    try {
      const data = await api.detalheTurnoEntrega(id);
      setDetalhe(data);
      setValorEntregue('');
      setObsDivergencia('');
    } catch (err) {
      setErro(err.message);
    }
  }

  async function confirmarPrestacao(e) {
    e.preventDefault();
    if (!detalhe?.turno?.id) return;
    try {
      const data = await api.confirmarPrestacaoTurno(detalhe.turno.id, {
        valor_entregue_admin: Number(valorEntregue),
        observacao_diferenca: obsDivergencia,
      });
      setDetalhe(data);
      setMsg('Prestação confirmada.');
      await carregarLista();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function enviarDemanda(e) {
    e.preventDefault();
    try {
      await api.criarDemandaTurno({
        ...formDemanda,
        turno_id: Number(formDemanda.turno_id),
        valor: Number(formDemanda.valor) || 0,
      });
      setMsg('Demanda enviada ao turno.');
      setFormDemanda({
        turno_id: formDemanda.turno_id,
        cliente_nome: '',
        endereco: '',
        quantidade_descricao: '',
        valor: '',
        observacao: '',
      });
    } catch (err) {
      setErro(err.message);
    }
  }

  const prest = detalhe?.prestacao;
  const resumo = detalhe?.resumo;
  const esperadoDinheiro = resumo?.total_dinheiro ?? prest?.total_dinheiro ?? 0;
  const diferenca =
    valorEntregue !== ''
      ? Math.round((Number(valorEntregue) - esperadoDinheiro) * 100) / 100
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Prestação de contas</h2>
        <p className="text-sm text-stone-500">
          Fechamento por turno/rota — dinheiro, PIX e divergências.
        </p>
      </div>

      {msg && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {msg}
        </p>
      )}
      {erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}

      <form onSubmit={enviarDemanda} className="rounded-xl border border-stone-200 p-4 space-y-2">
        <h3 className="text-sm font-medium">Nova demanda para turno em rota</h3>
        <select
          className={inputClass}
          value={formDemanda.turno_id}
          onChange={(e) => setFormDemanda({ ...formDemanda, turno_id: e.target.value })}
          required
        >
          <option value="">Turno ativo</option>
          {turnosAbertos
            .filter((t) => ['aberta', 'em_rota'].includes(t.status))
            .map((t) => (
              <option key={t.id} value={t.id}>
                #{t.id} — {t.responsavel_nome}
              </option>
            ))}
        </select>
        <input
          className={inputClass}
          placeholder="Cliente"
          value={formDemanda.cliente_nome}
          onChange={(e) => setFormDemanda({ ...formDemanda, cliente_nome: e.target.value })}
          required
        />
        <input
          className={inputClass}
          placeholder="Endereço"
          value={formDemanda.endereco}
          onChange={(e) => setFormDemanda({ ...formDemanda, endereco: e.target.value })}
          required
        />
        <input
          className={inputClass}
          placeholder="Quantidade / itens"
          value={formDemanda.quantidade_descricao}
          onChange={(e) =>
            setFormDemanda({ ...formDemanda, quantidade_descricao: e.target.value })
          }
        />
        <input
          className={inputClass}
          type="number"
          step="0.01"
          placeholder="Valor"
          value={formDemanda.valor}
          onChange={(e) => setFormDemanda({ ...formDemanda, valor: e.target.value })}
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">
          Enviar demanda
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-3 py-2 text-left">Turno</th>
                <th className="px-3 py-2 text-left">Responsável</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {turnos.map((t) => (
                <tr key={t.id} className="border-t border-stone-100">
                  <td className="px-3 py-2">#{t.id}</td>
                  <td className="px-3 py-2">{t.responsavel_nome}</td>
                  <td className="px-3 py-2 capitalize text-xs">{t.status.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="text-brand-700 underline text-xs"
                      onClick={() => abrirTurno(t.id)}
                    >
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {detalhe && (
          <div className="rounded-xl border border-stone-200 p-4 space-y-3 text-sm">
            <h3 className="font-medium">
              Turno #{detalhe.turno.id} — {detalhe.turno.responsavel_nome}
            </h3>
            {resumo && (
              <>
                <p>Entregas concluídas: {resumo.entregas_concluidas}</p>
                <p>Vendas avulsas: {resumo.vendas_avulsas}</p>
                <p>Dinheiro esperado: R$ {resumo.total_dinheiro.toFixed(2)}</p>
                <p>PIX: R$ {resumo.total_pix.toFixed(2)}</p>
                <p>Outros: R$ {resumo.total_outros.toFixed(2)}</p>
                <p className="font-semibold">Total previsto: R$ {resumo.total_previsto.toFixed(2)}</p>
              </>
            )}

            {detalhe.turno.status === 'aguardando_prestacao' && (
              <form onSubmit={confirmarPrestacao} className="space-y-2 border-t pt-3">
                <label className="block">
                  <span className="text-xs text-stone-600">
                    Valor em dinheiro entregue pelo responsável ({detalhe.turno.responsavel_nome})
                  </span>
                  <input
                    className={inputClass}
                    type="number"
                    step="0.01"
                    value={valorEntregue}
                    onChange={(e) => setValorEntregue(e.target.value)}
                    required
                  />
                </label>
                {diferenca != null && Math.abs(diferenca) > 0.009 && (
                  <label className="block">
                    <span className="text-xs text-amber-800">
                      Divergência R$ {diferenca.toFixed(2)} — observação obrigatória
                    </span>
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={obsDivergencia}
                      onChange={(e) => setObsDivergencia(e.target.value)}
                      required
                    />
                  </label>
                )}
                <button
                  type="submit"
                  className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-white"
                >
                  Confirmar prestação
                </button>
              </form>
            )}

            {detalhe.turno.status === 'fechada' && prest && (
              <p className="text-emerald-800">
                Fechado — entregue R$ {Number(prest.valor_entregue_admin).toFixed(2)} · diferença R${' '}
                {Number(prest.diferenca).toFixed(2)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

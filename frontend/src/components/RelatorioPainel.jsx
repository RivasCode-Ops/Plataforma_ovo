import { useCallback, useEffect, useState } from 'react';
import { api, downloadRelatorioCsv } from '../services/api.js';
import { STATUS_LABEL } from '../utils/statusPedido.js';

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function diasAtras(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function RelatorioPainel() {
  const [de, setDe] = useState(diasAtras(30));
  const [ate, setAte] = useState(hojeISO());
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [exportando, setExportando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setDados(await api.relatorioResumo(de, ate));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [de, ate]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function exportarCsv() {
    setExportando(true);
    setErro('');
    try {
      await downloadRelatorioCsv(de, ate);
    } catch (e) {
      setErro(e.message);
    } finally {
      setExportando(false);
    }
  }

  const r = dados?.resumo;
  const maxDia = Math.max(...(dados?.ultimos_7_dias?.map((d) => d.total) || [1]), 1);

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Relatório de vendas</h2>
          <p className="text-sm text-stone-500">Resumo do período selecionado</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-stone-500">De</span>
            <input
              type="date"
              value={de}
              onChange={(e) => setDe(e.target.value)}
              className="rounded-lg border border-stone-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-stone-500">Até</span>
            <input
              type="date"
              value={ate}
              onChange={(e) => setAte(e.target.value)}
              className="rounded-lg border border-stone-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={carregar}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Atualizar
          </button>
          <button
            type="button"
            onClick={exportarCsv}
            disabled={exportando}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-50 disabled:opacity-50"
          >
            {exportando ? 'Exportando…' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      {erro && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="text-sm text-stone-500">Carregando relatório…</p>
      ) : r ? (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-stone-100 bg-brand-50 p-4">
              <p className="text-xs font-medium uppercase text-brand-800">Total vendido</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-950">
                R$ {r.total_vendas.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-stone-100 bg-stone-50 p-4">
              <p className="text-xs font-medium uppercase text-stone-600">Pedidos</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{r.qtd_pedidos}</p>
            </div>
            <div className="rounded-lg border border-stone-100 bg-stone-50 p-4">
              <p className="text-xs font-medium uppercase text-stone-600">Ticket médio</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                R$ {r.ticket_medio.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-stone-700">Por status</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-stone-500">
                    <th className="py-1">Status</th>
                    <th className="py-1">Qtd</th>
                    <th className="py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.por_status.map((s) => (
                    <tr key={s.status} className="border-b border-stone-50">
                      <td className="py-2">{STATUS_LABEL[s.status] || s.status}</td>
                      <td className="py-2">{s.qtd}</td>
                      <td className="py-2 tabular-nums">R$ {s.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-stone-700">Produtos mais vendidos</h3>
              {dados.top_produtos.length === 0 ? (
                <p className="text-sm text-stone-500">Sem vendas no período.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {dados.top_produtos.map((p) => (
                    <li
                      key={p.nome}
                      className="flex justify-between rounded-lg bg-stone-50 px-3 py-2"
                    >
                      <span>
                        {p.nome} <span className="text-stone-500">({p.quantidade} un.)</span>
                      </span>
                      <span className="font-medium tabular-nums">R$ {p.total.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-700">Últimos 7 dias</h3>
            <div className="flex items-end gap-2 h-32">
              {dados.ultimos_7_dias.map((d) => {
                const h = Math.max(8, (d.total / maxDia) * 100);
                const label = new Date(d.dia).toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                });
                return (
                  <div key={d.dia} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs tabular-nums text-stone-500">
                      R$ {d.total.toFixed(0)}
                    </span>
                    <div
                      className="w-full rounded-t bg-brand-500"
                      style={{ height: `${h}%` }}
                      title={`${d.qtd_pedidos} pedidos`}
                    />
                    <span className="text-xs text-stone-500">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

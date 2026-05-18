import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const TENDENCIA = {
  subindo: { label: '↑ Subindo', className: 'text-emerald-700' },
  caindo: { label: '↓ Caindo', className: 'text-red-700' },
  estavel: { label: '→ Estável', className: 'text-stone-500' },
};

export default function PrevisaoPainel() {
  const [dias, setDias] = useState(14);
  const [periodo, setPeriodo] = useState(7);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setDados(await api.previsaoDemanda(dias, periodo));
    } catch (e) {
      setErro(e.message);
      setDados(null);
    } finally {
      setCarregando(false);
    }
  }, [dias, periodo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">Previsão de demanda</h2>
        <p className="text-sm text-stone-500">
          Quanto produzir com base nas vendas recentes e assinaturas programadas.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
        <label className="text-sm">
          <span className="mb-1 block text-stone-500">Histórico (dias)</span>
          <select
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="rounded-lg border border-stone-300 px-2 py-1.5"
          >
            <option value={7}>7 dias</option>
            <option value={14}>14 dias</option>
            <option value={30}>30 dias</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-500">Prever próximos</span>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(Number(e.target.value))}
            className="rounded-lg border border-stone-300 px-2 py-1.5"
          >
            <option value={3}>3 dias</option>
            <option value={7}>7 dias</option>
            <option value={14}>14 dias</option>
          </select>
        </label>
        <button
          type="button"
          onClick={carregar}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white"
        >
          Atualizar
        </button>
      </div>

      {erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="text-sm text-stone-500">Calculando…</p>
      ) : dados ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-medium uppercase text-blue-800">Demanda prevista</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {dados.totais.demanda_prevista}
              </p>
              <p className="text-xs text-blue-700">unidades no período</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-medium uppercase text-amber-800">Sugerido produzir</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {dados.totais.sugerido_produzir}
              </p>
              <p className="text-xs text-amber-700">além do estoque atual</p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-xs font-medium uppercase text-violet-800">Assinaturas</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {dados.totais.previsao_assinaturas}
              </p>
              <p className="text-xs text-violet-700">no período</p>
            </div>
          </div>

          <p className="text-xs text-stone-500">{dados.nota}</p>

          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Média/dia</th>
                  <th className="px-4 py-3">Prev. pedidos</th>
                  <th className="px-4 py-3">Assinaturas</th>
                  <th className="px-4 py-3">Demanda</th>
                  <th className="px-4 py-3">Estoque</th>
                  <th className="px-4 py-3">Produzir +</th>
                  <th className="px-4 py-3">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {dados.itens.map((i) => {
                  const t = TENDENCIA[i.tendencia] || TENDENCIA.estavel;
                  return (
                    <tr key={i.produto_id} className="border-t border-stone-100">
                      <td className="px-4 py-3 font-medium">
                        {i.nome}
                        <span className="ml-1 text-stone-400">({i.unidade})</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">{i.media_diaria}</td>
                      <td className="px-4 py-3 tabular-nums">{i.previsao_pedidos}</td>
                      <td className="px-4 py-3 tabular-nums">{i.previsao_assinaturas}</td>
                      <td className="px-4 py-3 tabular-nums font-medium">{i.demanda_prevista}</td>
                      <td className="px-4 py-3 tabular-nums">{i.estoque}</td>
                      <td
                        className={`px-4 py-3 tabular-nums font-semibold ${
                          i.sugerido_produzir > 0 ? 'text-amber-800' : 'text-stone-400'
                        }`}
                      >
                        {i.sugerido_produzir > 0 ? i.sugerido_produzir : '—'}
                      </td>
                      <td className={`px-4 py-3 text-xs font-medium ${t.className}`}>
                        {t.label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}

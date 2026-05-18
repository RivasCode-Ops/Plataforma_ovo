import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const inputClass =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none';

function badgeValidade(dias) {
  if (dias < 0) return 'bg-red-100 text-red-800';
  if (dias <= 3) return 'bg-amber-100 text-amber-800';
  if (dias <= 7) return 'bg-yellow-100 text-yellow-800';
  return 'bg-stone-100 text-stone-600';
}

export default function LotesPainel({ produtos, onAtualizado }) {
  const [alertas, setAlertas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [form, setForm] = useState(false);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [produtoId, setProdutoId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [validade, setValidade] = useState('');
  const [obs, setObs] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [a, l] = await Promise.all([api.lotesAlertas(7), api.listarLotes({ comEstoque: true })]);
      setAlertas(a);
      setLotes(l);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    if (produtos.length && !produtoId) setProdutoId(String(produtos[0].id));
  }, [carregar, produtos, produtoId]);

  async function registrar(e) {
    e.preventDefault();
    setErro('');
    setMsg('');
    try {
      await api.registrarLote({
        produto_id: Number(produtoId),
        codigo: codigo.trim() || undefined,
        quantidade: Number(quantidade),
        data_validade: validade,
        observacao: obs.trim() || undefined,
      });
      setMsg('Lote registrado e estoque atualizado.');
      setForm(false);
      setCodigo('');
      setQuantidade('');
      setValidade('');
      setObs('');
      await carregar();
      onAtualizado?.();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium">Lotes e validade</h2>
          <p className="text-sm text-stone-500">Entrada de produção — baixa automática pelo vencimento mais próximo</p>
        </div>
        <button
          type="button"
          onClick={() => setForm(!form)}
          className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm font-medium text-white"
        >
          {form ? 'Fechar' : '+ Registrar lote'}
        </button>
      </div>

      {msg && (
        <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {msg}
        </p>
      )}
      {erro && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      {form && (
        <form onSubmit={registrar} className="mb-6 grid gap-3 rounded-lg bg-stone-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs text-stone-500">Produto</span>
            <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} className={inputClass} required>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-stone-500">Código do lote</span>
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} className={inputClass} placeholder="L2026-01" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-stone-500">Quantidade</span>
            <input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className={inputClass} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-stone-500">Validade</span>
            <input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} className={inputClass} required />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs text-stone-500">Observação</span>
            <input value={obs} onChange={(e) => setObs(e.target.value)} className={inputClass} />
          </label>
          <button type="submit" className="rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white sm:col-span-2 lg:col-span-1">
            Salvar lote
          </button>
        </form>
      )}

      {carregando ? (
        <p className="text-sm text-stone-500">Carregando…</p>
      ) : (
        <>
          {alertas.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-red-700">Alertas (vence em até 7 dias)</h3>
              <ul className="space-y-2">
                {alertas.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
                    <span>
                      {l.produto_nome} · lote {l.codigo || l.id} · {l.quantidade} un.
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeValidade(Number(l.dias_para_vencer))}`}>
                      {Number(l.dias_para_vencer) < 0
                        ? `Vencido há ${Math.abs(l.dias_para_vencer)}d`
                        : `Vence em ${l.dias_para_vencer}d`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h3 className="mb-2 text-sm font-medium text-stone-700">Lotes com estoque</h3>
          {lotes.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum lote com estoque. Registre a produção do dia.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-stone-500">
                    <th className="py-2 pr-3">Produto</th>
                    <th className="py-2 pr-3">Lote</th>
                    <th className="py-2 pr-3">Qtd</th>
                    <th className="py-2 pr-3">Validade</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.map((l) => (
                    <tr key={l.id} className="border-b border-stone-50">
                      <td className="py-2 pr-3">{l.produto_nome}</td>
                      <td className="py-2 pr-3">{l.codigo || `#${l.id}`}</td>
                      <td className="py-2 pr-3 tabular-nums">
                        {l.quantidade}/{l.quantidade_inicial}
                      </td>
                      <td className="py-2 pr-3">{l.data_validade}</td>
                      <td className="py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${badgeValidade(l.dias_para_vencer)}`}>
                          {l.dias_para_vencer < 0 ? 'Vencido' : `${l.dias_para_vencer}d`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

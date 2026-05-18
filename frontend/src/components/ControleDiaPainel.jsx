import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { fmtUnidade } from '../utils/unidades.js';

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function CelulaFalta({ falta, ovos, unidade }) {
  if (falta == null || falta === 0) {
    return <span className="text-emerald-700">{falta === 0 ? 'OK' : '—'}</span>;
  }
  return (
    <span className="font-semibold text-amber-800" title={`${ovos} ovos`}>
      {fmtUnidade(falta, unidade)}
    </span>
  );
}

export default function ControleDiaPainel() {
  const [dia, setDia] = useState(hojeISO());
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setResumo(await api.controleDia(dia));
    } catch (e) {
      setErro(e.message);
      setResumo(null);
    } finally {
      setCarregando(false);
    }
  }, [dia]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const t = resumo?.totais;
  const tO = t?.ovos;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Controle do dia</h2>
          <p className="text-sm text-stone-500">
            <strong>Instalado</strong> = lotes registrados hoje · <strong>Vendido</strong> = pedidos do
            dia · <strong>Falta</strong> = meta − realizado (em ovos)
          </p>
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-stone-500">Data</span>
          <input
            type="date"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
            className="rounded-lg border border-stone-300 px-2 py-1.5"
          />
        </label>
      </div>

      {erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="text-sm text-stone-500">Carregando…</p>
      ) : resumo ? (
        <>
          {t?.meta > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-medium uppercase text-blue-800">Meta do dia</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{tO?.meta ?? 0}</p>
                <p className="text-xs text-blue-700">ovos no total</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-medium uppercase text-emerald-800">Instalado (lotes)</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{tO?.instalado ?? 0}</p>
                <p className="text-xs text-emerald-700">
                  falta {tO?.falta_instalar ?? 0} ovos p/ meta
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-medium uppercase text-amber-800">Vendido (pedidos)</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{tO?.vendido ?? 0}</p>
                <p className="text-xs text-amber-700">falta {tO?.falta_vender ?? 0} ovos p/ meta</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-medium uppercase text-stone-600">Em estoque</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{tO?.estoque ?? 0}</p>
                <p className="text-xs text-stone-500">ovos disponíveis agora</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Meta</th>
                  <th className="px-4 py-3">Instalado</th>
                  <th className="px-4 py-3">Falta instalar</th>
                  <th className="px-4 py-3">Vendido</th>
                  <th className="px-4 py-3">Falta vender</th>
                  <th className="px-4 py-3">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {resumo.itens.map((i) => (
                  <tr key={i.produto_id} className="border-t border-stone-100">
                    <td className="px-4 py-3 font-medium">
                      {i.nome}
                      <span className="ml-1 text-stone-400">({i.unidade})</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {i.meta_diaria > 0 ? (
                        <>
                          {i.ovos.meta} <span className="text-stone-400">ovos</span>
                        </>
                      ) : (
                        <span className="text-stone-400">sem meta</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {fmtUnidade(i.instalado_hoje, i.unidade)}
                      {i.ovos.instalado > 0 && (
                        <span className="block text-xs text-stone-400">{i.ovos.instalado} ovos</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <CelulaFalta
                        falta={i.falta_instalar}
                        ovos={i.ovos.falta_instalar}
                        unidade={i.unidade}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {fmtUnidade(i.vendido_hoje, i.unidade)}
                      {i.ovos.vendido > 0 && (
                        <span className="block text-xs text-stone-400">{i.ovos.vendido} ovos</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <CelulaFalta
                        falta={i.falta_vender}
                        ovos={i.ovos.falta_vender}
                        unidade={i.unidade}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={i.disponivel < 0 ? 'text-red-700 font-semibold' : ''}>
                        {fmtUnidade(i.estoque, i.unidade)}
                      </span>
                      {i.reservado > 0 && (
                        <span className="block text-xs text-amber-600">
                          {i.ovos.reservado} ovos reservados (pedidos novos)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-stone-500">
            Defina a meta em <strong>Produtos</strong> → editar → campo &quot;Meta do dia&quot;. Dúzia =
            12 ovos na conversão.
          </p>
        </>
      ) : null}
    </section>
  );
}

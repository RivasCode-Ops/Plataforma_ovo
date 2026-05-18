import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

export default function ClientesPainel() {
  const [lista, setLista] = useState([]);
  const [busca, setBusca] = useState('');
  const [detalhe, setDetalhe] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setLista(await api.listarClientes(busca || undefined));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [busca]);

  useEffect(() => {
    const t = setTimeout(carregar, 300);
    return () => clearTimeout(t);
  }, [carregar]);

  async function verCliente(id) {
    setErro('');
    try {
      setDetalhe(await api.obterCliente(id));
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-medium">Clientes</h2>
      <p className="mb-4 text-sm text-stone-500">Cadastro automático ao criar pedidos</p>

      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome ou telefone…"
        className="mb-4 w-full max-w-md rounded-lg border border-stone-300 px-3 py-2 text-sm"
      />

      {erro && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          {carregando ? (
            <p className="text-sm text-stone-500">Carregando…</p>
          ) : lista.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum cliente encontrado.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {lista.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => verCliente(c.id)}
                    className="w-full px-1 py-3 text-left hover:bg-stone-50"
                  >
                    <p className="font-medium">{c.nome}</p>
                    <p className="text-xs text-stone-500">{c.telefone}</p>
                    <p className="mt-1 text-xs text-stone-400">
                      {c.total_pedidos} pedido(s) · R$ {Number(c.total_gasto).toFixed(2)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {detalhe && (
          <div className="rounded-lg border border-stone-100 bg-stone-50 p-4">
            <h3 className="font-medium">{detalhe.nome}</h3>
            <p className="text-sm text-stone-600">{detalhe.telefone}</p>
            {detalhe.endereco && (
              <p className="mt-1 text-sm text-stone-500">{detalhe.endereco}</p>
            )}
            <h4 className="mb-2 mt-4 text-sm font-medium text-stone-700">Últimos pedidos</h4>
            {detalhe.pedidos?.length ? (
              <ul className="space-y-2 text-sm">
                {detalhe.pedidos.map((p) => (
                  <li key={p.id} className="flex justify-between rounded bg-white px-2 py-1.5">
                    <span>
                      #{p.id} · {p.status}
                    </span>
                    <span className="tabular-nums">R$ {Number(p.total).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500">Sem pedidos.</p>
            )}
            <button
              type="button"
              onClick={() => setDetalhe(null)}
              className="mt-3 text-xs text-stone-500 underline"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

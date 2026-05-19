import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import NextStepsCard from './NextStepsCard.jsx';

const inputClass =
  'rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none';

export default function RotasPainel({ onIrPara }) {
  const { usuario } = useAuth();
  const isAdmin = usuario?.papel === 'admin';
  const [rotas, setRotas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState('');
  const [ordem, setOrdem] = useState('0');
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [rotaSalva, setRotaSalva] = useState(null);

  const carregar = useCallback(async () => {
    setErro('');
    try {
      const [r, c] = await Promise.all([api.listarRotas(), api.listarClientes()]);
      setRotas(r);
      setClientes(c);
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function criar(e) {
    e.preventDefault();
    if (!isAdmin) return;
    setErro('');
    try {
      const criada = await api.criarRota({ nome, ordem: Number(ordem) });
      setRotaSalva({
        id: criada?.id,
        nome: criada?.nome || nome,
        totalPedidos: 0,
      });
      setNome('');
      setOrdem('0');
      setMsg('Rota criada.');
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function atribuirCliente(clienteId, rotaId) {
    setErro('');
    try {
      await api.atribuirClienteRota(clienteId, rotaId || null);
      setMsg('Cliente atualizado.');
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Rotas de entrega</h2>
        <p className="text-sm text-stone-500">
          Agrupe clientes por região. Os pedidos do dia saem ordenados por rota na impressão.
        </p>
      </div>

      {erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}
      {msg && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {msg}
        </p>
      )}

      {rotaSalva && (
        <NextStepsCard context="rota" data={rotaSalva} onIrPara={onIrPara} />
      )}

      {isAdmin && (
        <form onSubmit={criar} className="flex flex-wrap items-end gap-2 rounded-xl border bg-white p-4">
          <label className="flex-1 min-w-[140px]">
            <span className="mb-1 block text-xs text-stone-500">Nova rota</span>
            <input
              className={inputClass + ' w-full'}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Centro"
              required
            />
          </label>
          <label className="w-20">
            <span className="mb-1 block text-xs text-stone-500">Ordem</span>
            <input
              type="number"
              className={inputClass + ' w-full'}
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
            />
          </label>
          <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white">
            Adicionar
          </button>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-stone-700">Rotas cadastradas</h3>
          {rotas.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhuma rota. Crie a primeira acima.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {rotas.map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between rounded-lg bg-stone-50 px-3 py-2"
                >
                  <span>
                    <strong>{r.nome}</strong>
                    <span className="ml-2 text-stone-400">ordem {r.ordem}</span>
                  </span>
                  <span className="text-stone-500">{r.qtd_clientes} cliente(s)</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-stone-700">Atribuir cliente à rota</h3>
          {clientes.length === 0 ? (
            <p className="text-sm text-stone-500">Cadastre clientes via pedidos primeiro.</p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
              {clientes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-2 rounded bg-stone-50 px-2 py-1.5">
                  <span className="min-w-0 flex-1 truncate font-medium">{c.nome}</span>
                  <select
                    className="rounded border border-stone-300 px-2 py-1 text-xs"
                    value={c.rota_id ?? ''}
                    onChange={(e) =>
                      atribuirCliente(c.id, e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">Sem rota</option>
                    {rotas
                      .filter((r) => r.ativo !== false)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nome}
                        </option>
                      ))}
                  </select>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

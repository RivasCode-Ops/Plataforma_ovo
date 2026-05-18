import { useCallback, useEffect, useState } from 'react';
import NovoPedidoForm from './components/NovoPedidoForm.jsx';
import PedidosHojePainel from './components/PedidosHojePainel.jsx';
import AssinaturasPainel from './components/AssinaturasPainel.jsx';
import LotesPainel from './components/LotesPainel.jsx';
import WhatsAppPainel from './components/WhatsAppPainel.jsx';
import RelatorioPainel from './components/RelatorioPainel.jsx';
import ProdutosPainel from './components/ProdutosPainel.jsx';
import ClientesPainel from './components/ClientesPainel.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { api } from './services/api.js';

const STATUS_OPCOES = ['novo', 'confirmado', 'pago', 'enviado', 'entregue', 'cancelado'];

const statusCor = {
  novo: 'bg-amber-100 text-amber-800',
  confirmado: 'bg-blue-100 text-blue-800',
  pago: 'bg-emerald-100 text-emerald-800',
  enviado: 'bg-violet-100 text-violet-800',
  entregue: 'bg-stone-200 text-stone-700',
  cancelado: 'bg-red-100 text-red-800',
};

export default function App() {
  const { usuario, logout } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [peds, prods] = await Promise.all([
        api.listarPedidos(filtro || undefined),
        api.listarProdutos(),
      ]);
      setPedidos(peds);
      setProdutos(prods);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [filtro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function mudarStatus(id, status) {
    try {
      await api.atualizarStatus(id, status);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Plataforma Ovo</h1>
            <p className="text-sm text-stone-500">Painel operacional — MVP</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-500 sm:inline">Olá, {usuario}</span>
            <button
              type="button"
              onClick={carregar}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Atualizar
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {erro && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </p>
        )}

        <NovoPedidoForm produtos={produtos} onCriado={() => carregar()} />

        <PedidosHojePainel />

        <AssinaturasPainel produtos={produtos} onPedidoGerado={carregar} />

        <RelatorioPainel />

        <WhatsAppPainel />

        <LotesPainel produtos={produtos} onAtualizado={carregar} />

        <ProdutosPainel onAtualizado={carregar} />

        <ClientesPainel />

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium">Pedidos</h2>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
              <option value="">Todos os status</option>
              {STATUS_OPCOES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {carregando ? (
            <p className="text-sm text-stone-500">Carregando…</p>
          ) : pedidos.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum pedido encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-stone-500">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => (
                    <tr key={p.id} className="border-b border-stone-100">
                      <td className="py-3 pr-4 font-medium">{p.id}</td>
                      <td className="py-3 pr-4">
                        <div>{p.cliente_nome}</div>
                        <div className="text-xs text-stone-500">{p.cliente_telefone}</div>
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        R$ {Number(p.total).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap items-center gap-1">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              statusCor[p.status] || 'bg-stone-100'
                            }`}
                          >
                            {p.status}
                          </span>
                          {p.observacao?.includes('[Site:') && (
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
                              Site
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <select
                          defaultValue={p.status}
                          onChange={(e) => mudarStatus(p.id, e.target.value)}
                          className="rounded border border-stone-300 px-2 py-1 text-xs"
                        >
                          {STATUS_OPCOES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

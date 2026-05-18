import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import PixPedidoModal from './PixPedidoModal.jsx';

const STATUS_OPCOES = ['novo', 'confirmado', 'pago', 'enviado', 'entregue', 'cancelado'];

const statusCor = {
  novo: 'bg-amber-100 text-amber-800',
  confirmado: 'bg-blue-100 text-blue-800',
  pago: 'bg-emerald-100 text-emerald-800',
  enviado: 'bg-violet-100 text-violet-800',
  entregue: 'bg-stone-200 text-stone-700',
  cancelado: 'bg-red-100 text-red-800',
};

export default function PedidosLista({
  pedidos,
  filtro,
  onFiltroChange,
  carregando,
  onMudarStatus,
}) {
  const [pixAtivo, setPixAtivo] = useState(false);
  const [pixModal, setPixModal] = useState(null);
  const [pixErro, setPixErro] = useState('');

  useEffect(() => {
    api.pixStatus().then((s) => setPixAtivo(s.configurado)).catch(() => setPixAtivo(false));
  }, []);

  async function abrirPix(id) {
    setPixErro('');
    try {
      const pix = await api.pedidoPix(id);
      setPixModal({ pedidoId: id, pix });
    } catch (e) {
      setPixErro(e.message);
    }
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Todos os pedidos</h2>
        <select
          value={filtro}
          onChange={(e) => onFiltroChange(e.target.value)}
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

      {pixErro && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {pixErro}
        </p>
      )}

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
                <th className="py-2">Ações</th>
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
                  <td className="py-3 pr-4 tabular-nums">R$ {Number(p.total).toFixed(2)}</td>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        defaultValue={p.status}
                        onChange={(e) => onMudarStatus(p.id, e.target.value)}
                        className="rounded border border-stone-300 px-2 py-1 text-xs"
                      >
                        {STATUS_OPCOES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {pixAtivo && p.status !== 'cancelado' && (
                        <button
                          type="button"
                          onClick={() => abrirPix(p.id)}
                          className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          PIX
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pixModal && (
        <PixPedidoModal
          pedidoId={pixModal.pedidoId}
          pix={pixModal.pix}
          onFechar={() => setPixModal(null)}
        />
      )}
    </section>
  );
}

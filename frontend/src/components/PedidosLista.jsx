import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import {
  STATUS_COR,
  STATUS_LABEL,
  STATUS_PEDIDO,
  aguardaPagamento,
} from '../utils/statusPedido.js';
import PixPedidoModal from './PixPedidoModal.jsx';

export default function PedidosLista({
  pedidos,
  filtro,
  onFiltroChange,
  carregando,
  onMudarStatus,
  onMarcarPago,
}) {
  const [pixAtivo, setPixAtivo] = useState(false);
  const [pixModal, setPixModal] = useState(null);
  const [pixErro, setPixErro] = useState('');
  const [marcandoId, setMarcandoId] = useState(null);

  const aguardando = pedidos.filter((p) => aguardaPagamento(p.status)).length;

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

  async function confirmarPagamento(id, forma = 'pix') {
    setMarcandoId(id);
    setPixErro('');
    try {
      await onMarcarPago(id, forma);
      setPixModal(null);
    } catch (e) {
      setPixErro(e.message);
    } finally {
      setMarcandoId(null);
    }
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Todos os pedidos</h2>
          {aguardando > 0 && (
            <p className="mt-1 text-sm text-amber-800">
              {aguardando} pedido(s) aguardando confirmação de pagamento
            </p>
          )}
        </div>
        <select
          value={filtro}
          onChange={(e) => onFiltroChange(e.target.value)}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="__aguardando__">Aguardando pagamento</option>
          {STATUS_PEDIDO.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
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
                <tr
                  key={p.id}
                  className={`border-b border-stone-100 ${
                    aguardaPagamento(p.status) ? 'bg-amber-50/60' : ''
                  }`}
                >
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
                          STATUS_COR[p.status] || 'bg-stone-100'
                        }`}
                      >
                        {STATUS_LABEL[p.status] || p.status}
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
                      {aguardaPagamento(p.status) && (
                        <button
                          type="button"
                          disabled={marcandoId === p.id}
                          onClick={() => confirmarPagamento(p.id, 'pix')}
                          className="rounded bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {marcandoId === p.id ? '…' : 'Pagamento recebido'}
                        </button>
                      )}
                      {pixAtivo && p.status !== 'cancelado' && p.status !== 'pago' && (
                        <button
                          type="button"
                          onClick={() => abrirPix(p.id)}
                          className="rounded border border-emerald-600 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                          PIX
                        </button>
                      )}
                      <select
                        defaultValue={p.status}
                        onChange={(e) => onMudarStatus(p.id, e.target.value)}
                        className="rounded border border-stone-300 px-2 py-1 text-xs"
                        title="Alterar status manualmente"
                      >
                        {STATUS_PEDIDO.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
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
          onPagamentoRecebido={() => confirmarPagamento(pixModal.pedidoId, 'pix')}
          marcando={marcandoId === pixModal.pedidoId}
        />
      )}
    </section>
  );
}

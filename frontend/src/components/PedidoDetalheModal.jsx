import { STATUS_LABEL } from '../utils/statusPedido.js';

export default function PedidoDetalheModal({ pedido, onFechar }) {
  if (!pedido) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onFechar}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold">Pedido #{pedido.id}</h3>
            <p className="text-sm text-stone-500">
              {STATUS_LABEL[pedido.status] || pedido.status} ·{' '}
              {new Date(pedido.data_pedido).toLocaleString('pt-BR')}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg px-2 py-1 text-stone-500 hover:bg-stone-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 space-y-1 text-sm">
          <p>
            <span className="text-stone-500">Cliente:</span> {pedido.cliente_nome}
          </p>
          <p>
            <span className="text-stone-500">Telefone:</span> {pedido.cliente_telefone}
          </p>
          {pedido.cliente_endereco && (
            <p>
              <span className="text-stone-500">Endereço:</span> {pedido.cliente_endereco}
            </p>
          )}
          {pedido.observacao && (
            <p>
              <span className="text-stone-500">Obs.:</span> {pedido.observacao}
            </p>
          )}
        </div>

        <table className="mb-4 w-full text-sm">
          <thead>
            <tr className="border-b text-stone-500">
              <th className="py-1 text-left">Item</th>
              <th className="py-1 text-right">Qtd</th>
              <th className="py-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(pedido.itens || []).map((item) => (
              <tr key={item.id || `${item.produto_id}-${item.quantidade}`} className="border-b">
                <td className="py-2">{item.produto_nome}</td>
                <td className="py-2 text-right tabular-nums">{item.quantidade}</td>
                <td className="py-2 text-right tabular-nums">
                  R$ {Number(item.subtotal).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-right text-base font-semibold tabular-nums">
          Total: R$ {Number(pedido.total).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

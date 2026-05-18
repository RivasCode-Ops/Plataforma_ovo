import { useState } from 'react';

export default function PixPedidoModal({ pix, pedidoId, onFechar }) {
  const [copiado, setCopiado] = useState(false);

  if (!pix?.copia_cola) return null;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(pix.copia_cola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">PIX — Pedido #{pedidoId}</h3>
        <p className="mt-1 text-sm text-stone-500">
          Valor: <strong className="text-stone-800">R$ {Number(pix.valor).toFixed(2)}</strong>
        </p>

        {pix.qr_data_url && (
          <img
            src={pix.qr_data_url}
            alt="QR Code PIX"
            className="mx-auto mt-4 h-56 w-56 rounded-lg border border-stone-100"
          />
        )}

        <label className="mt-4 block text-xs font-medium text-stone-500">Copia e cola</label>
        <textarea
          readOnly
          value={pix.copia_cola}
          rows={3}
          className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 p-2 font-mono text-xs"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={copiar}
            className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            {copiado ? 'Copiado!' : 'Copiar código'}
          </button>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const inputClass =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

export default function WhatsAppPainel() {
  const [status, setStatus] = useState(null);
  const [telefone, setTelefone] = useState('');
  const [link, setLink] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarStatus = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setStatus(await api.whatsappStatus());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarStatus();
  }, [carregarStatus]);

  async function gerarLink(e) {
    e.preventDefault();
    setErro('');
    setLink('');
    try {
      const data = await api.whatsappLink(telefone.trim() || undefined);
      setLink(data.link);
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-medium">WhatsApp</h2>
      <p className="mb-4 text-sm text-stone-500">
        Gera link <strong>wa.me</strong> para envio manual pelo celular — não há API de envio
        automático. Nos pedidos e rotas, use os botões WhatsApp com mensagem já montada.
      </p>

      {carregando ? (
        <p className="text-sm text-stone-500">Carregando…</p>
      ) : status ? (
        <p className="mb-4 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700">
          {status.mensagem}
          {status.numero_granja && (
            <span className="mt-1 block text-xs text-stone-500">
              Número da granja: {status.numero_granja}
            </span>
          )}
        </p>
      ) : null}

      {erro && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      <form onSubmit={gerarLink} className="flex flex-wrap items-end gap-3">
        <label className="min-w-[200px] flex-1">
          <span className="mb-1 block text-sm font-medium text-stone-700">
            Telefone do cliente (opcional)
          </span>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className={inputClass}
            placeholder="Vazio = usa número da granja"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-[#25D366] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1da851]"
        >
          Gerar link
        </button>
      </form>

      {link && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm font-medium text-emerald-800 underline"
          >
            Abrir no WhatsApp
          </a>
        </div>
      )}
    </section>
  );
}

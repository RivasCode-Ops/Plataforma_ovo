import { linkWhatsApp, mensagemPorTipo } from '../utils/whatsapp.js';

const ROTULOS = {
  pedido: 'Avisar cliente no WhatsApp',
  assinatura: 'Avisar assinatura no WhatsApp',
  entrega: 'Lembrete de entrega',
};

/**
 * Botão manual — nunca abre WhatsApp automaticamente.
 * @param {{ tipo: 'pedido'|'assinatura'|'entrega', telefone?: string, dados?: object, compacto?: boolean, className?: string }} props
 */
export default function BotaoWhatsApp({
  tipo,
  telefone,
  dados = {},
  compacto = false,
  className = '',
}) {
  const tel = String(telefone || '').trim();
  if (!tel) return null;

  const mensagem = mensagemPorTipo(tipo, dados);
  if (!mensagem) return null;

  const href = linkWhatsApp(tel, mensagem);
  if (!href) return null;

  function abrir(e) {
    e.preventDefault();
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  const base =
    'inline-flex items-center justify-center rounded-lg bg-[#25D366] font-semibold text-white hover:bg-[#1da851] print:hidden';
  const size = compacto
    ? 'px-2.5 py-1 text-xs'
    : 'px-4 py-2 text-sm';

  return (
    <button
      type="button"
      onClick={abrir}
      className={`${base} ${size} ${className}`.trim()}
      title="Abre o WhatsApp com a mensagem pronta — envio manual"
    >
      {ROTULOS[tipo] || 'WhatsApp'}
    </button>
  );
}

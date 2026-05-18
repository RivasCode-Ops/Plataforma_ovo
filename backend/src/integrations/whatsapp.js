/**
 * WhatsApp — sem API externa.
 * Gera link wa.me para o operador ou cliente abrir no app.
 */

export function numeroGranja() {
  return (process.env.GRANJA_WHATSAPP || '').replace(/\D/g, '');
}

export function formatarTelefoneWhatsapp(telefone) {
  let n = String(telefone || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = n.slice(1);
  if (!n.startsWith('55') && (n.length === 10 || n.length === 11)) {
    n = `55${n}`;
  }
  return n;
}

export function gerarLinkWhatsApp(telefoneCliente, mensagem) {
  const cliente = formatarTelefoneWhatsapp(telefoneCliente);
  const granja = numeroGranja();
  const destino = cliente || granja;

  if (!destino) {
    return {
      ok: false,
      erro: 'Configure GRANJA_WHATSAPP no .env ou informe telefone do cliente',
    };
  }

  const link = `https://wa.me/${destino}?text=${encodeURIComponent(mensagem)}`;
  return {
    ok: true,
    link,
    numero: destino,
    modo: 'link',
    mensagem: 'Abra o link para enviar pelo WhatsApp (sem integração de API)',
  };
}

export function statusWhatsApp() {
  const granja = numeroGranja();
  return {
    configurado: Boolean(granja),
    modo: 'link_wa_me',
    numero_granja: granja || null,
    mensagem: granja
      ? 'WhatsApp via link direto — sem vínculo com sistemas anteriores.'
      : 'Defina GRANJA_WHATSAPP no .env (ex.: 5511999999999).',
  };
}

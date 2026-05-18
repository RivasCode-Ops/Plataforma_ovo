/**
 * Integração Merkus (WhatsApp).
 * Em dev, sem credenciais, apenas registra no console.
 */
export async function enviarWhatsApp(telefone, mensagem) {
  const apiUrl = process.env.MERKUS_API_URL;
  const apiKey = process.env.MERKUS_API_KEY;
  const instance = process.env.MERKUS_INSTANCE;

  if (!apiUrl || !apiKey) {
    console.log('[WhatsApp simulado]', telefone, mensagem);
    return { ok: true, simulado: true };
  }

  const numero = telefone.replace(/\D/g, '');
  const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
    body: JSON.stringify({
      number: numero,
      text: mensagem,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Merkus: ${response.status} - ${body}`);
  }

  return response.json();
}

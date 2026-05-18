import { createStaticPix, hasError } from 'pix-utils';

export function pixConfigurado() {
  return Boolean(process.env.GRANJA_PIX_CHAVE?.trim());
}

function normalizarTexto(str, max) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .slice(0, max)
    .toUpperCase();
}

export async function gerarPixCobranca({ valor, pedidoId, clienteNome }) {
  if (!pixConfigurado()) {
    return {
      ok: false,
      erro: 'PIX não configurado. Defina GRANJA_PIX_CHAVE no .env',
    };
  }

  const amount = Number(valor);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, erro: 'Valor do pedido inválido para PIX' };
  }

  const pix = createStaticPix({
    merchantName: normalizarTexto(process.env.GRANJA_PIX_NOME || 'Granja Uniao', 25),
    merchantCity: normalizarTexto(process.env.GRANJA_PIX_CIDADE || 'SAO PAULO', 15),
    pixKey: process.env.GRANJA_PIX_CHAVE.trim(),
    transactionAmount: amount,
    infoAditional: normalizarTexto(`Pedido ${pedidoId} ${clienteNome || ''}`.trim(), 50),
  });

  if (hasError(pix)) {
    return { ok: false, erro: 'Não foi possível gerar o código PIX. Verifique a chave.' };
  }

  const copia_cola = pix.toBRCode();
  const qr_data_url = await pix.toImage();

  return {
    ok: true,
    copia_cola,
    qr_data_url,
    valor: amount,
    pedido_id: pedidoId,
  };
}

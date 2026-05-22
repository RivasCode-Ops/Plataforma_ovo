/** URL da API em produção (painel HTTPS). Sobrescreva com VITE_API_URL no build. */
export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://app.granjauniao.com.br';

/** Token publicável — definir em .env.production ou secrets do GitHub Actions. */
export const SITE_PEDIDO_TOKEN =
  (import.meta.env.VITE_SITE_PEDIDO_TOKEN as string | undefined) || '';

export const pedidoSiteHabilitado = Boolean(SITE_PEDIDO_TOKEN.trim());

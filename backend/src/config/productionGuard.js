const WEAK_JWT = 'dev-secret-altere-em-producao';
const WEAK_ADMIN = 'plataforma123';

export function assertProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return;

  const jwt = process.env.JWT_SECRET?.trim();
  if (!jwt || jwt === WEAK_JWT) {
    throw new Error(
      'JWT_SECRET obrigatorio e forte em NODE_ENV=production (nao use o valor de desenvolvimento)'
    );
  }

  const adminPass = process.env.ADMIN_PASSWORD?.trim();
  if (!adminPass || adminPass === WEAK_ADMIN) {
    throw new Error(
      'ADMIN_PASSWORD obrigatorio e forte em NODE_ENV=production (nao use plataforma123)'
    );
  }

  const siteToken = process.env.SITE_PEDIDO_TOKEN?.trim();
  if (!siteToken) {
    throw new Error('SITE_PEDIDO_TOKEN obrigatorio em NODE_ENV=production');
  }
}

export function resolveAdminPassword() {
  const senha = process.env.ADMIN_PASSWORD?.trim();
  if (senha) return senha;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD obrigatorio em NODE_ENV=production');
  }
  return 'plataforma123';
}

import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const start = Date.now();
  const checks = {
    database: false,
    stone_api: 'not_configured',
    uptime_s: Math.round(process.uptime()),
  };

  try {
    await pool.query('SELECT 1');
    checks.database = true;
  } catch (err) {
    console.error('[health] database:', err.message);
  }

  const stoneToken = Boolean(process.env.STONE_TOKEN?.trim());
  checks.stone_api = stoneToken ? 'configured' : 'not_configured';

  const warnings = [];
  if (!stoneToken) {
    warnings.push('STONE_TOKEN não configurado — pagamentos Stone desativados (opcional).');
  }

  const healthy = checks.database === true;
  res.status(healthy ? 200 : 503).json({
    ok: healthy,
    status: healthy ? 'healthy' : 'unhealthy',
    service: 'plataforma-ovo-api',
    timestamp: new Date().toISOString(),
    response_time_ms: Date.now() - start,
    checks,
    warnings,
  });
});

export default router;

#!/usr/bin/env node
/**
 * Testes pós-deploy: idempotência, rate limit, health, tabelas.
 * Uso: API_BASE=http://localhost:3000 node scripts/test-producao.mjs
 */
import crypto from 'crypto';
import pg from 'pg';

const BASE = process.env.API_BASE || 'http://localhost:3000';
const DATABASE_URL = process.env.DATABASE_URL;

let pass = 0;
let fail = 0;

function ok(msg) {
  pass += 1;
  console.log(`  OK  ${msg}`);
}
function bad(msg) {
  fail += 1;
  console.log(`  FAIL ${msg}`);
}

async function json(method, path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function login() {
  const r = await json('POST', '/api/auth/login', {
    usuario: 'admin',
    senha: process.env.ADMIN_PASSWORD || 'plataforma123',
  });
  return r.data?.token || r.data?.data?.token;
}

async function testHealth() {
  console.log('\n1. Health');
  const r = await json('GET', '/api/health');
  if (r.data.checks?.database === true) ok('database: true');
  else bad(`database: ${r.data.checks?.database}`);
  if (Array.isArray(r.data.warnings)) ok('warnings presente');
  else bad('sem campo warnings');
}

async function testTabelas() {
  console.log('\n2. Tabelas no banco');
  if (!DATABASE_URL) {
    console.log('  SKIP (DATABASE_URL não definido)');
    return;
  }
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  for (const t of ['idempotencia', 'auditoria', 'contas_a_receber', 'eventos_transacionais']) {
    const { rows } = await pool.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
      [t]
    );
    if (rows.length) ok(`tabela ${t}`);
    else bad(`tabela ${t} ausente`);
  }
  await pool.end();
}

async function testIdempotencia(token) {
  console.log('\n3. Idempotência pedido');
  const key = crypto.randomUUID();
  const payload = {
    cliente: { nome: 'Teste Idem', telefone: `55${Date.now().toString().slice(-9)}` },
    itens: [{ produto_id: 1, quantidade: 1 }],
    confirmar: false,
  };
  const h = { Authorization: `Bearer ${token}`, 'Idempotency-Key': key };
  const a = await json('POST', '/api/pedidos', payload, h);
  const b = await json('POST', '/api/pedidos', payload, h);
  const idA = a.data?.data?.pedido_id ?? a.data?.pedido_id;
  const idB = b.data?.data?.pedido_id ?? b.data?.pedido_id;
  if (a.status === 201 && idA && idB === idA) ok(`mesmo pedido_id ${idA}`);
  else bad(`a=${a.status} idA=${idA} b=${b.status} idB=${idB}`);
}

async function testRateLimit(token) {
  console.log('\n4. Rate limit (11 POST críticos — limite 10/min)');
  const h = { Authorization: `Bearer ${token}` };
  const payload = {
    cliente: { nome: 'RL', telefone: `55${Date.now().toString().slice(-8)}1` },
    itens: [{ produto_id: 1, quantidade: 1 }],
    confirmar: false,
  };
  let got429 = false;
  for (let i = 0; i < 12; i++) {
    const r = await json('POST', '/api/pedidos', payload, h);
    if (r.status === 429) got429 = true;
  }
  if (got429) ok('HTTP 429 após limite');
  else bad('não retornou 429 (pode estar em janela nova)');
}

async function main() {
  console.log(`API: ${BASE}`);
  await testHealth();
  await testTabelas();
  const token = await login();
  if (!token) {
    bad('login falhou — pulando testes autenticados');
  } else {
    await testIdempotencia(token);
    await testRateLimit(token);
  }
  console.log(`\n--- ${pass} ok, ${fail} fail ---`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

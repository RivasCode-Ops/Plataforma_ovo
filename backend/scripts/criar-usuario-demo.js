/**
 * Cria ou atualiza usuario demo para testes (senha simples).
 *
 * Local:  cd backend && npm run criar:demo
 * VPS:    docker exec plataforma_ovo_api node scripts/criar-usuario-demo.js
 */
import dotenv from 'dotenv';
import pg from 'pg';
import { hashSenha } from '../src/utils/senha.js';

dotenv.config();
dotenv.config({ path: '../infra/.env.prod' });

const LOGIN = process.env.DEMO_LOGIN || 'demo';
const SENHA = process.env.DEMO_SENHA || 'demo123';
const NOME = process.env.DEMO_NOME || 'Usuario Demo';
const PAPEL = process.env.DEMO_PAPEL === 'admin' ? 'admin' : 'operador';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Defina DATABASE_URL ou rode dentro do container plataforma_ovo_api.');
    process.exit(1);
  }

  const senha_hash = await hashSenha(SENHA);
  const { rows } = await pool.query(
    `INSERT INTO operadores (nome, login, senha_hash, papel, ativo)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (login) DO UPDATE SET
       nome = EXCLUDED.nome,
       senha_hash = EXCLUDED.senha_hash,
       papel = EXCLUDED.papel,
       ativo = true
     RETURNING id, nome, login, papel`,
    [NOME, LOGIN.toLowerCase(), senha_hash, PAPEL]
  );

  const u = rows[0];
  console.log('');
  console.log('Usuario demo pronto:');
  console.log(`  Login:  ${u.login}`);
  console.log(`  Senha:  ${SENHA}`);
  console.log(`  Perfil: ${u.papel}`);
  console.log(`  URL:    http://app.granjauniao.com.br`);
  console.log('');
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

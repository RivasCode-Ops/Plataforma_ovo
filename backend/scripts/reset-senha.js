/**
 * Redefine senha de um operador (cria se não existir).
 *
 * VPS:
 *   docker exec -e LOGIN=admin -e SENHA='SuaSenhaNova' -e PAPEL=admin \
 *     plataforma_ovo_api node scripts/reset-senha.js
 */
import dotenv from 'dotenv';
import pg from 'pg';
import { hashSenha } from '../src/utils/senha.js';

dotenv.config();

const LOGIN = (process.env.LOGIN || process.env.DEMO_LOGIN || 'admin').trim().toLowerCase();
const SENHA = process.env.SENHA || process.env.DEMO_SENHA;
const NOME = process.env.NOME || process.env.DEMO_NOME || 'Operador';
const PAPEL = process.env.PAPEL === 'admin' ? 'admin' : 'operador';

if (!SENHA) {
  console.error('Defina SENHA=... (ex.: SENHA=MinhaSenha123!)');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL ausente — rode dentro do container plataforma_ovo_api.');
    process.exit(1);
  }

  const senha_hash = await hashSenha(SENHA);
  const { rows } = await pool.query(
    `INSERT INTO operadores (nome, login, senha_hash, papel, ativo)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (login) DO UPDATE SET
       senha_hash = EXCLUDED.senha_hash,
       ativo = true,
       nome = COALESCE(NULLIF(EXCLUDED.nome, 'Operador'), operadores.nome),
       papel = EXCLUDED.papel
     RETURNING id, nome, login, papel, ativo`,
    [NOME, LOGIN, senha_hash, PAPEL]
  );

  const u = rows[0];
  console.log('');
  console.log('Senha atualizada:');
  console.log(`  Login:  ${u.login}`);
  console.log(`  Senha:  ${SENHA}`);
  console.log(`  Perfil: ${u.papel}`);
  console.log(`  Ativo:  ${u.ativo}`);
  console.log('  URL:    https://app.granjauniao.com.br');
  console.log('');
  await pool.end();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

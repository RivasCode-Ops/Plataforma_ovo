import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '..', 'schema.sql');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  const sql = readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('Schema aplicado com sucesso.');
} catch (err) {
  console.error('Erro ao aplicar schema:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}

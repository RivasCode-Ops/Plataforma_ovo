import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const useMemory =
  process.env.USE_MEMORY_DB === '1' ||
  process.env.DATABASE_URL === 'memory';

async function createMemoryPool() {
  const { newDb } = await import('pg-mem');
  const db = newDb();

  db.public.registerFunction({
    name: 'current_database',
    implementation: () => 'plataforma_ovo',
  });

  const { Pool: MemPool } = db.adapters.createPg();
  const pool = new MemPool();

  const schema = readFileSync(join(__dirname, '..', 'schema-memory.sql'), 'utf8');
  await pool.query(schema);

  console.log('[db] PostgreSQL em memória — prova local (sem Docker)');
  return pool;
}

export const pool = useMemory
  ? await createMemoryPool()
  : new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

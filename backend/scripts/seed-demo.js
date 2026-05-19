/**
 * Dados fictícios para demonstração — Granja União / Picos PI
 * Uso local:  cd backend && npm run seed:demo
 * Uso na VPS:  docker exec plataforma_ovo_api node scripts/seed-demo.js
 *
 * Não apaga dados existentes. Se já houver clientes demo, não roda de novo.
 */
import dotenv from 'dotenv';
import pg from 'pg';
import { hashSenha } from '../src/utils/senha.js';

dotenv.config();
dotenv.config({ path: '../infra/.env.prod' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const DEMO_TEL = '89999751';

async function jaTemDemo(client) {
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS n FROM clientes WHERE telefone LIKE $1`,
    [`${DEMO_TEL}%`]
  );
  return rows[0].n > 0;
}

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('Defina DATABASE_URL (ou rode dentro do container backend na VPS).');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    if (await jaTemDemo(client)) {
      console.log('Seed demo já aplicado (clientes 89999751*). Nada a fazer.');
      return;
    }

    await client.query('BEGIN');

    const senhaDemo = await hashSenha('demo123');
    await client.query(
      `INSERT INTO operadores (nome, login, senha_hash, papel)
       VALUES
         ('Ana Rodrigues', 'ana', $1, 'operador'),
         ('Marcos Lima', 'marcos', $1, 'operador')
       ON CONFLICT (login) DO NOTHING`,
      [senhaDemo]
    );
    console.log('✓ Operadores demo (ana/marcos · senha: demo123)');

    for (const [nome, ordem] of [
      ['Centro', 1],
      ['Caiçara — Junco', 2],
      ['Morada Nova', 3],
    ]) {
      await client.query(
        `INSERT INTO rotas (nome, ordem)
         SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM rotas WHERE nome = $1)`,
        [nome, ordem]
      );
    }
    const { rows: rotas } = await client.query(`SELECT id, nome FROM rotas ORDER BY ordem`);
    const rotaCentro = rotas.find((r) => r.nome.includes('Centro'))?.id ?? rotas[0]?.id;
    const rotaCaiçara = rotas.find((r) => r.nome.includes('Cai'))?.id ?? rotas[1]?.id;

    for (const [nome, unidade, preco, estoque] of [
      ['Ovo branco M (caixa 30)', 'caixa', 18, 200],
      ['Ovo branco G (caixa 30)', 'caixa', 20, 150],
      ['Ovo vermelho M (caixa 30)', 'caixa', 19, 120],
      ['Ovo vermelho G (caixa 30)', 'caixa', 21.5, 80],
      ['Ovo caipira (20 un)', 'caixa', 28, 60],
      ['Bandeja 6 ovos', 'unid', 6.5, 300],
    ]) {
      await client.query(
        `INSERT INTO produtos (nome, unidade, preco, estoque, ativo)
         SELECT $1, $2, $3, $4, true
         WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = $1)`,
        [nome, unidade, preco, estoque]
      );
    }
    const { rows: produtos } = await client.query(
      `SELECT id, nome, preco FROM produtos ORDER BY id`
    );

    const insCliente = async (nome, tel, endereco, rota_id) => {
      const { rows } = await client.query(
        `INSERT INTO clientes (nome, telefone, endereco, rota_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (telefone) DO UPDATE SET nome = EXCLUDED.nome
         RETURNING id`,
        [nome, tel, endereco, rota_id]
      );
      return rows[0].id;
    };

    const c1 = await insCliente('João da Silva', `${DEMO_TEL}001`, 'Rua das Flores, 12 — Centro', rotaCentro);
    const c2 = await insCliente('Maria Oliveira', `${DEMO_TEL}002`, 'Av. Getúlio Vargas, 340 — Junco', rotaCaiçara);
    const c3 = await insCliente('Mercadinho do Bairro', `${DEMO_TEL}003`, 'Rua Rui Barbosa, 88 — Caiçara', rotaCaiçara);
    const c4 = await insCliente('Restaurante Sertão', `${DEMO_TEL}004`, 'Av. Principal, 210 — Centro', rotaCentro);
    const c5 = await insCliente('Padaria Pão de Mel', `${DEMO_TEL}005`, 'Rua Tiradentes, 55 — Morada Nova', rotaCentro);
    console.log('✓ Clientes');

    const p = (i) => produtos[i]?.id ?? produtos[0].id;

    for (const [cod, pid, qtd, dias] of [
      ['L-0038', p(0), 480, 14],
      ['L-0039', p(1), 300, 16],
      ['L-0040', p(2), 360, 10],
      ['L-0041', p(3), 200, 5],
    ]) {
      await client.query(
        `INSERT INTO lotes (produto_id, codigo, quantidade, quantidade_inicial, data_validade)
         VALUES ($1, $2, $3, $3, CURRENT_DATE + $4::int)`,
        [pid, cod, qtd, dias]
      );
    }
    console.log('✓ Lotes');

    const insPedido = async (clienteId, status, total, diasAtras, itens) => {
      const { rows } = await client.query(
        `INSERT INTO pedidos (cliente_id, status, total, data_pedido)
         VALUES ($1, $2, $3, NOW() - ($4::int * INTERVAL '1 day'))
         RETURNING id`,
        [clienteId, status, total, diasAtras]
      );
      const pedidoId = rows[0].id;
      for (const [produtoId, qtd, preco] of itens) {
        await client.query(
          `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [pedidoId, produtoId, qtd, preco, qtd * preco]
        );
      }
      return pedidoId;
    };

    await insPedido(c1, 'entregue', 54, 6, [[p(0), 3, 18]]);
    await insPedido(c2, 'entregue', 38, 5, [
      [p(5), 4, 6.5],
      [p(0), 1, 18],
    ]);
    await insPedido(c3, 'entregue', 310, 4, [
      [p(1), 10, 17],
      [p(3), 8, 18.5],
    ]);
    await insPedido(c1, 'confirmado', 84, 1, [
      [p(0), 3, 18],
      [p(1), 1, 20],
    ]);
    await insPedido(c4, 'novo', 252, 0, [[p(1), 12, 17]]);
    console.log('✓ Pedidos');

    const insAss = async (clienteId, freq, dia, diasProx, itens) => {
      const { rows } = await client.query(
        `INSERT INTO assinaturas (cliente_id, frequencia, dia_semana, proxima_entrega, status)
         VALUES ($1, $2, $3, CURRENT_DATE + $4::int, 'ativa')
         RETURNING id`,
        [clienteId, freq, dia, diasProx]
      );
      for (const [produtoId, qtd] of itens) {
        await client.query(
          `INSERT INTO assinatura_itens (assinatura_id, produto_id, quantidade) VALUES ($1, $2, $3)`,
          [rows[0].id, produtoId, qtd]
        );
      }
    };

    await insAss(c1, 'semanal', 2, 2, [[p(0), 3]]);
    await insAss(c3, 'quinzenal', 4, 7, [[p(1), 8]]);
    console.log('✓ Assinaturas');

    await client.query(
      `INSERT INTO cliente_precos (cliente_id, produto_id, preco) VALUES
         ($1, $2, 14.50), ($1, $3, 16.00),
         ($4, $2, 14.00), ($4, $3, 15.50)
       ON CONFLICT (cliente_id, produto_id) DO UPDATE SET preco = EXCLUDED.preco`,
      [c3, p(0), p(1), c4]
    );
    console.log('✓ Preços atacado');

    await client.query('COMMIT');
    console.log('\n✅ Seed demo concluído.');
    console.log('   Operadores: ana / marcos — senha demo123');
    console.log('   Clientes: telefones 89999751001…');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

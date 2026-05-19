import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import BotaoWhatsApp from './BotaoWhatsApp.jsx';

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function CardPedido({ p }) {
  return (
    <article className="break-inside-avoid rounded-lg border border-stone-200 p-4 print:border-stone-400">
      <div className="flex flex-wrap justify-between gap-2 border-b border-stone-100 pb-2">
        <strong>
          #{p.id} — {p.cliente_nome}
        </strong>
        <span className="text-sm capitalize">{p.status}</span>
      </div>
      <p className="mt-2 text-sm">
        {p.cliente_telefone}
        {p.cliente_endereco && ` · ${p.cliente_endereco}`}
      </p>
      <ul className="mt-2 text-sm">
        {p.itens?.map((i, idx) => (
          <li key={idx}>
            {i.quantidade}× {i.nome} ({i.unidade}) — R$ {i.subtotal.toFixed(2)}
          </li>
        ))}
      </ul>
      <p className="mt-2 font-semibold">Total: R$ {Number(p.total).toFixed(2)}</p>
      {p.observacao && <p className="mt-1 text-xs text-stone-600">Obs: {p.observacao}</p>}
      <div className="mt-3 print:hidden">
        <BotaoWhatsApp
          tipo="entrega"
          telefone={p.cliente_telefone}
          compacto
          dados={{
            nome: p.cliente_nome,
            itens: p.itens?.map((i) => ({
              nome: i.nome,
              quantidade: i.quantidade,
              subtotal: i.subtotal,
            })),
            endereco: p.cliente_endereco,
          }}
        />
      </div>
    </article>
  );
}

function SecaoRota({ titulo, pedidos, total, qtd }) {
  if (!pedidos?.length) return null;
  return (
    <section className="break-inside-avoid">
      <h3 className="mb-3 rounded-lg bg-stone-800 px-3 py-2 text-sm font-semibold text-white print:bg-stone-200 print:text-stone-900">
        {titulo} — {qtd} pedido(s) · R$ {total.toFixed(2)}
      </h3>
      <div className="space-y-4">
        {pedidos.map((p) => (
          <CardPedido key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

export default function PedidosHojePainel() {
  const [dia, setDia] = useState(hojeISO());
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setDados(await api.pedidosDoDia(dia));
    } catch {
      setDados(null);
    } finally {
      setCarregando(false);
    }
  }, [dia]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function imprimir() {
    window.print();
  }

  const dataFormatada = new Date(dia + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const temPedidos =
    dados?.pedidos?.length > 0 ||
    dados?.por_rota?.some((g) => g.pedidos?.length) ||
    dados?.sem_rota?.pedidos?.length;

  return (
    <section className="pedidos-hoje rounded-xl border border-stone-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-lg font-medium">Pedidos do dia</h2>
          <p className="text-sm text-stone-500">Agrupados por rota de entrega — pronto para imprimir</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-stone-500">Data</span>
            <input
              type="date"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
              className="rounded-lg border border-stone-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={carregar}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm hover:bg-stone-50"
          >
            Atualizar
          </button>
          <button
            type="button"
            onClick={imprimir}
            className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-900"
          >
            Imprimir
          </button>
        </div>
      </div>

      <div className="hidden print:block print:mb-4">
        <h1 className="text-xl font-bold">meuzovo — Entregas</h1>
        <p className="text-sm">{dataFormatada}</p>
      </div>

      {carregando ? (
        <p className="text-sm text-stone-500 print:hidden">Carregando…</p>
      ) : !temPedidos ? (
        <p className="text-sm text-stone-500">Nenhum pedido nesta data.</p>
      ) : (
        <>
          <p className="mb-4 text-sm font-medium text-stone-700">
            {dados.qtd} pedido(s) · Total (exc. cancelados): R$ {dados.total.toFixed(2)}
          </p>
          <div className="space-y-8">
            {dados.por_rota?.map((g) => (
              <SecaoRota
                key={g.rota_id}
                titulo={`Rota: ${g.rota_nome}`}
                pedidos={g.pedidos}
                total={g.total}
                qtd={g.qtd}
              />
            ))}
            <SecaoRota
              titulo="Sem rota definida"
              pedidos={dados.sem_rota?.pedidos}
              total={dados.sem_rota?.total ?? 0}
              qtd={dados.sem_rota?.qtd ?? 0}
            />
          </div>
        </>
      )}
    </section>
  );
}

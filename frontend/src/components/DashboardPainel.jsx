import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPainel({ produtos, papel = 'admin', onIrPara }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      if (papel === 'operador') {
        setStats({ modo: 'operador' });
        return;
      }
      try {
        const [hoje, alertas, assinaturas, resumo, notif] = await Promise.all([
          api.pedidosDoDia(hojeISO()),
          api.lotesAlertas(7),
          api.assinaturasEntregasSemana(),
          api.relatorioResumo(hojeISO(), hojeISO()),
          api.listarNotificacoes().catch(() => ({ resumo: { total: 0, alta: 0 } })),
        ]);
        const estoqueBaixo = produtos.filter((p) => p.estoque < 10).length;
        setStats({
          pedidosHoje: hoje.qtd,
          totalHoje: hoje.total,
          alertasLotes: alertas.length,
          assinaturasSemana: assinaturas.length,
          estoqueBaixo,
          vendasHoje: resumo.resumo.total_vendas,
          alertasTotal: notif.resumo?.total ?? 0,
          alertasAlta: notif.resumo?.alta ?? 0,
        });
      } catch {
        setStats(null);
      }
    }
    load();
  }, [produtos, papel]);

  if (!stats) {
    return <p className="text-sm text-stone-500">Carregando resumo…</p>;
  }

  if (stats.modo === 'operador') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium">Operação de rota</h2>
          <p className="text-sm text-stone-500">
            Use o módulo Turno/Rota para saída, entregas e prestação de contas com o admin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onIrPara?.('entrega-turno')}
          className="w-full rounded-xl border border-violet-200 bg-violet-50 p-6 text-left transition hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-violet-800">Turno / Rota</p>
          <p className="mt-2 text-2xl font-semibold text-violet-900">Abrir rota do dia →</p>
          <p className="mt-1 text-sm text-violet-700">Iniciar turno, paradas, vendas avulsas e demandas</p>
        </button>
      </div>
    );
  }

  const cards = [
    {
      label: 'Alertas',
      valor: stats.alertasTotal,
      sub: stats.alertasAlta > 0 ? `${stats.alertasAlta} urgente` : 'ver detalhes',
      acao: 'alertas',
      cor:
        stats.alertasAlta > 0
          ? 'bg-red-50 border-red-200'
          : stats.alertasTotal > 0
            ? 'bg-brand-50 border-brand-200'
            : 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Pedidos hoje',
      valor: stats.pedidosHoje,
      sub: `R$ ${stats.totalHoje.toFixed(2)}`,
      acao: 'hoje',
      cor: 'bg-brand-50 border-brand-200',
    },
    {
      label: 'Turno / Rota',
      valor: '→',
      sub: 'saída e prestação',
      acao: 'entrega-turno',
      cor: 'bg-violet-50 border-violet-200',
    },
    {
      label: 'Assinaturas (7 dias)',
      valor: stats.assinaturasSemana,
      sub: 'entregas programadas',
      acao: 'assinaturas',
      cor: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Alertas validade',
      valor: stats.alertasLotes,
      sub: 'lotes a vencer',
      acao: 'lotes',
      cor: stats.alertasLotes > 0 ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-stone-200',
    },
    {
      label: 'Estoque baixo',
      valor: stats.estoqueBaixo,
      sub: 'produtos < 10 un.',
      acao: 'produtos',
      cor: stats.estoqueBaixo > 0 ? 'bg-brand-50 border-brand-300' : 'bg-stone-50 border-stone-200',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Bom dia!</h2>
        <p className="text-sm text-stone-500">
          Resumo de {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <button
            key={c.acao}
            type="button"
            onClick={() => onIrPara?.(c.acao)}
            className={`rounded-xl border p-4 text-left transition hover:shadow-md ${c.cor}`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-stone-600">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{c.valor}</p>
            <p className="mt-1 text-xs text-stone-500">{c.sub}</p>
          </button>
        ))}
      </div>
      <p className="text-sm text-stone-500">Clique em um card para ir à seção correspondente.</p>
    </div>
  );
}

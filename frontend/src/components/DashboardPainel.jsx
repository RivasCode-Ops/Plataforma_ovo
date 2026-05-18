import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPainel({ produtos, papel = 'admin', onIrPara }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [hoje, alertas, assinaturas, resumo, controle] = await Promise.all([
          api.pedidosDoDia(hojeISO()),
          api.lotesAlertas(7),
          api.assinaturasEntregasSemana(),
          api.relatorioResumo(hojeISO(), hojeISO()),
          api.controleDia(hojeISO()).catch(() => null),
        ]);
        const faltaOvos = controle?.totais?.ovos?.falta_vender ?? 0;
        const estoqueBaixo = produtos.filter((p) => p.estoque < 10).length;
        setStats({
          pedidosHoje: hoje.qtd,
          totalHoje: hoje.total,
          alertasLotes: alertas.length,
          assinaturasSemana: assinaturas.length,
          estoqueBaixo,
          vendasHoje: resumo.resumo.total_vendas,
        });
      } catch {
        setStats(null);
      }
    }
    load();
  }, [produtos]);

  if (!stats) {
    return <p className="text-sm text-stone-500">Carregando resumo…</p>;
  }

  const cards = [
    {
      label: 'Pedidos hoje',
      valor: stats.pedidosHoje,
      sub: `R$ ${stats.totalHoje.toFixed(2)}`,
      acao: 'hoje',
      cor: 'bg-amber-50 border-amber-200',
    },
    {
      label: 'Falta vender (ovos)',
      valor: stats.faltaOvos,
      sub: 'para bater a meta do dia',
      acao: 'controle',
      cor: stats.faltaOvos > 0 ? 'bg-orange-50 border-orange-300' : 'bg-emerald-50 border-emerald-200',
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
      cor: stats.estoqueBaixo > 0 ? 'bg-amber-50 border-amber-300' : 'bg-stone-50 border-stone-200',
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
        {cards
          .filter((c) => papel === 'admin' || c.acao !== 'produtos')
          .map((c) => (
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

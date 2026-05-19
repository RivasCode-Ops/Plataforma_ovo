import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const NIVEL_STYLE = {
  alta: 'border-red-200 bg-red-50 text-red-900',
  media: 'border-brand-200 bg-brand-50 text-brand-900',
  baixa: 'border-stone-200 bg-stone-50 text-stone-700',
};

const NIVEL_LABEL = { alta: 'Urgente', media: 'Atenção', baixa: 'Info' };

export default function NotificacoesPainel({ onIrPara, pushAtivo, onAtivarPush }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setDados(await api.listarNotificacoes());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 60_000);
    return () => clearInterval(t);
  }, [carregar]);

  const itens = dados?.itens ?? [];
  const resumo = dados?.resumo;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Alertas</h2>
          <p className="text-sm text-stone-500">
            Pedidos novos, estoque, validade de lotes e assinaturas — atualiza a cada minuto.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={carregar}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50"
          >
            Atualizar
          </button>
          {typeof Notification !== 'undefined' && (
            <button
              type="button"
              onClick={onAtivarPush}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                pushAtivo
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              {pushAtivo ? 'Push ativo' : 'Ativar no celular'}
            </button>
          )}
        </div>
      </div>

      {erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      {resumo && resumo.total > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-stone-200 px-3 py-1">{resumo.total} total</span>
          {resumo.alta > 0 && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-red-800">
              {resumo.alta} urgente
            </span>
          )}
          {resumo.media > 0 && (
            <span className="rounded-full bg-brand-100 px-3 py-1 text-brand-800">
              {resumo.media} atenção
            </span>
          )}
        </div>
      )}

      {carregando && !dados ? (
        <p className="text-sm text-stone-500">Carregando alertas…</p>
      ) : itens.length === 0 ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-800">
          Nenhum alerta no momento. Tudo em dia.
        </p>
      ) : (
        <ul className="space-y-2">
          {itens.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => onIrPara?.(n.acao)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition hover:shadow-sm ${NIVEL_STYLE[n.nivel]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{n.titulo}</p>
                    <p className="mt-0.5 text-sm opacity-90">{n.mensagem}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium">
                    {NIVEL_LABEL[n.nivel]}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

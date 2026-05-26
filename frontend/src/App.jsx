import { useCallback, useEffect, useState } from 'react';
import NovoPedidoForm from './components/NovoPedidoForm.jsx';
import VendaBalcaoForm from './components/VendaBalcaoForm.jsx';
import PedidosHojePainel from './components/PedidosHojePainel.jsx';
import AssinaturasPainel from './components/AssinaturasPainel.jsx';
import LotesPainel from './components/LotesPainel.jsx';
import WhatsAppPainel from './components/WhatsAppPainel.jsx';
import RelatorioPainel from './components/RelatorioPainel.jsx';
import ProdutosPainel from './components/ProdutosPainel.jsx';
import ClientesPainel from './components/ClientesPainel.jsx';
import PedidosLista from './components/PedidosLista.jsx';
import DashboardPainel from './components/DashboardPainel.jsx';
import InstalarApp from './components/InstalarApp.jsx';
import OperadoresPainel from './components/OperadoresPainel.jsx';
import NotificacoesPainel from './components/NotificacoesPainel.jsx';
import RotasPainel from './components/RotasPainel.jsx';
import PrevisaoPainel from './components/PrevisaoPainel.jsx';
import EntregaTurnoPainel from './components/EntregaTurnoPainel.jsx';
import PrestacaoContasPainel from './components/PrestacaoContasPainel.jsx';
import { useNotificacoes } from './hooks/useNotificacoes.js';
import { useAuth } from './context/AuthContext.jsx';
import { api } from './services/api.js';

const MENU = [
  { id: 'inicio', label: 'Início' },
  { id: 'alertas', label: 'Alertas', badge: true },
  { id: 'novo', label: 'Novo pedido' },
  { id: 'balcao', label: 'Venda balcão' },
  { id: 'hoje', label: 'Pedidos do dia' },
  { id: 'rotas', label: 'Rotas' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'assinaturas', label: 'Assinaturas' },
  { id: 'lotes', label: 'Lotes' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'relatorio', label: 'Relatório' },
  { id: 'previsao', label: 'Previsão', admin: true },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'operadores', label: 'Operadores', admin: true },
  { id: 'prestacao', label: 'Prestação', admin: true },
  { id: 'entrega-turno', label: 'Turno / Rota' },
];

const SECOES_OPERADOR = new Set([
  'inicio',
  'alertas',
  'novo',
  'balcao',
  'hoje',
  'entrega-turno',
  'rotas',
  'pedidos',
  'assinaturas',
  'lotes',
  'clientes',
  'whatsapp',
]);

function menuVisivel(papel) {
  if (papel === 'admin') return MENU;
  return MENU.filter((m) => !m.admin && SECOES_OPERADOR.has(m.id));
}

/** Atalhos PWA (?secao=...) → id da seção no painel */
const SECAO_QUERY = {
  'novo-pedido': 'novo',
  novo: 'novo',
  balcao: 'balcao',
  'pedidos-dia': 'hoje',
  hoje: 'hoje',
  rota: 'entrega-turno',
  'minha-rota': 'entrega-turno',
};

function secaoInicial() {
  const q = new URLSearchParams(window.location.search).get('secao');
  if (!q) return 'inicio';
  return SECAO_QUERY[q] || q;
}

export default function App() {
  const { usuario, logout } = useAuth();
  const papel = usuario?.papel || 'admin';
  const menu = menuVisivel(papel);
  const { resumo: alertasResumo, pushAtivo, ativarPush } = useNotificacoes();
  const [secao, setSecao] = useState(secaoInicial);
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [buscaPedidos, setBuscaPedidos] = useState('');
  const [offsetPedidos, setOffsetPedidos] = useState(0);
  const [temMaisPedidos, setTemMaisPedidos] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const LIMITE_PEDIDOS = 50;

  const carregar = useCallback(
    async (append = false) => {
      setCarregando(true);
      setErro('');
      try {
        const offset = append ? offsetPedidos : 0;
        const pedidosQuery =
          filtro === '__aguardando__'
            ? { aguardandoPagamento: true }
            : filtro
              ? { status: filtro }
              : {};
        const [peds, prods] = await Promise.all([
          api.listarPedidos({
            ...pedidosQuery,
            limite: LIMITE_PEDIDOS,
            offset,
            q: buscaPedidos.trim() || undefined,
          }),
          api.listarProdutos(),
        ]);
        const novoOffset = offset + peds.length;
        setPedidos(append ? (prev) => [...prev, ...peds] : peds);
        setOffsetPedidos(novoOffset);
        setTemMaisPedidos(peds.length >= LIMITE_PEDIDOS);
        setProdutos(prods);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    },
    [filtro, buscaPedidos, offsetPedidos]
  );

  useEffect(() => {
    setOffsetPedidos(0);
    setTemMaisPedidos(false);
    (async () => {
      setCarregando(true);
      setErro('');
      try {
        const pedidosQuery =
          filtro === '__aguardando__'
            ? { aguardandoPagamento: true }
            : filtro
              ? { status: filtro }
              : {};
        const [peds, prods] = await Promise.all([
          api.listarPedidos({
            ...pedidosQuery,
            limite: LIMITE_PEDIDOS,
            offset: 0,
            q: buscaPedidos.trim() || undefined,
          }),
          api.listarProdutos(),
        ]);
        setPedidos(peds);
        setOffsetPedidos(peds.length);
        setTemMaisPedidos(peds.length >= LIMITE_PEDIDOS);
        setProdutos(prods);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [filtro, buscaPedidos]);

  useEffect(() => {
    if (!menu.some((m) => m.id === secao)) {
      setSecao('inicio');
    }
  }, [menu, secao]);

  async function mudarStatus(id, status) {
    try {
      await api.atualizarStatus(id, status);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function confirmarPedido(id) {
    try {
      await api.confirmarPedido(id);
      await carregar();
    } catch (e) {
      setErro(e.message);
      throw e;
    }
  }

  async function marcarPedidoPago(id, forma_pagamento = 'pix') {
    try {
      await api.marcarPedidoPago(id, forma_pagamento);
      await carregar();
    } catch (e) {
      setErro(e.message);
      throw e;
    }
  }

  function renderSecao() {
    switch (secao) {
      case 'inicio':
        return (
          <DashboardPainel produtos={produtos} papel={papel} onIrPara={setSecao} />
        );
      case 'alertas':
        return (
          <NotificacoesPainel
            onIrPara={setSecao}
            pushAtivo={pushAtivo}
            onAtivarPush={ativarPush}
          />
        );
      case 'novo':
        return (
          <NovoPedidoForm produtos={produtos} onCriado={() => carregar()} onIrPara={setSecao} />
        );
      case 'balcao':
        return (
          <VendaBalcaoForm produtos={produtos} onVenda={() => carregar()} />
        );
      case 'hoje':
        return (
          <PedidosHojePainel onMarcarPago={marcarPedidoPago} onMudarStatus={mudarStatus} />
        );
      case 'rotas':
        return <RotasPainel onIrPara={setSecao} />;
      case 'pedidos':
        return (
          <PedidosLista
            pedidos={pedidos}
            filtro={filtro}
            busca={buscaPedidos}
            onFiltroChange={setFiltro}
            onBuscaChange={setBuscaPedidos}
            carregando={carregando}
            onMudarStatus={mudarStatus}
            onMarcarPago={marcarPedidoPago}
            onConfirmarPedido={confirmarPedido}
            onCarregarMais={() => carregar(true)}
            temMais={temMaisPedidos}
          />
        );
      case 'assinaturas':
        return <AssinaturasPainel produtos={produtos} onPedidoGerado={carregar} />;
      case 'lotes':
        return (
          <LotesPainel produtos={produtos} onAtualizado={carregar} onIrPara={setSecao} />
        );
      case 'produtos':
        return <ProdutosPainel onAtualizado={carregar} />;
      case 'clientes':
        return <ClientesPainel onIrPara={setSecao} />;
      case 'relatorio':
        return <RelatorioPainel />;
      case 'previsao':
        return papel === 'admin' ? <PrevisaoPainel /> : null;
      case 'whatsapp':
        return <WhatsAppPainel />;
      case 'operadores':
        return papel === 'admin' ? <OperadoresPainel /> : null;
      case 'prestacao':
        return papel === 'admin' ? <PrestacaoContasPainel /> : null;
      case 'entrega-turno':
        return <EntregaTurnoPainel />;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-50 lg:flex-row">
      <aside className="border-b border-stone-200 bg-white lg:w-56 lg:flex-shrink-0 lg:border-b-0 lg:border-r">
        <div
          className="hidden lg:block"
          style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}
        >
          <img
            src="/icons/meuzovo-logo-horizontal.png"
            alt="meuzovo"
            className="h-9 w-auto"
          />
          <p className="mt-1 text-xs text-stone-500">Granja União</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:gap-0.5 lg:p-3">
          {menu.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSecao(m.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition lg:w-full ${
                secao === m.id
                  ? 'bg-brand-100 text-brand-900'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span className="flex items-center gap-2">
                {m.label}
                {m.badge && alertasResumo.total > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                      alertasResumo.alta > 0
                        ? 'bg-red-600 text-white'
                        : 'bg-brand-500 text-white'
                    }`}
                  >
                    {alertasResumo.total}
                  </span>
                )}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
          <span className="font-semibold">meuzovo</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={carregar}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white"
            >
              Atualizar
            </button>
            <button type="button" onClick={logout} className="text-sm text-stone-600">
              Sair
            </button>
          </div>
        </header>

        <header className="hidden items-center justify-between border-b border-stone-200 bg-white px-6 py-3 lg:flex">
          <p className="text-sm text-stone-500">
            Olá,{' '}
            <span className="font-medium text-stone-800">
              {usuario?.nome || usuario?.login}
            </span>
            <span className="text-stone-500"> — meuzovo</span>
            {usuario?.papel && usuario.papel !== 'admin' && (
              <span className="ml-2 rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600 capitalize">
                {usuario.papel}
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={carregar}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Atualizar
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <InstalarApp />
          {erro && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </p>
          )}
          {renderSecao()}
        </main>
      </div>
    </div>
  );
}

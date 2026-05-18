import { useCallback, useEffect, useState } from 'react';
import NovoPedidoForm from './components/NovoPedidoForm.jsx';
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
import { useNotificacoes } from './hooks/useNotificacoes.js';
import { useAuth } from './context/AuthContext.jsx';
import { api } from './services/api.js';

const MENU = [
  { id: 'inicio', label: 'Início' },
  { id: 'alertas', label: 'Alertas', badge: true },
  { id: 'novo', label: 'Novo pedido' },
  { id: 'hoje', label: 'Pedidos do dia' },
  { id: 'rotas', label: 'Rotas' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'assinaturas', label: 'Assinaturas' },
  { id: 'lotes', label: 'Lotes' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'relatorio', label: 'Relatório' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'operadores', label: 'Operadores', admin: true },
];

const SECOES_OPERADOR = new Set([
  'inicio',
  'alertas',
  'novo',
  'hoje',
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

export default function App() {
  const { usuario, logout } = useAuth();
  const papel = usuario?.papel || 'admin';
  const menu = menuVisivel(papel);
  const { resumo: alertasResumo, pushAtivo, ativarPush } = useNotificacoes();
  const [secao, setSecao] = useState('inicio');
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [peds, prods] = await Promise.all([
        api.listarPedidos(filtro || undefined),
        api.listarProdutos(),
      ]);
      setPedidos(peds);
      setProdutos(prods);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [filtro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

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
        return <NovoPedidoForm produtos={produtos} onCriado={() => carregar()} />;
      case 'hoje':
        return <PedidosHojePainel />;
      case 'rotas':
        return <RotasPainel />;
      case 'pedidos':
        return (
          <PedidosLista
            pedidos={pedidos}
            filtro={filtro}
            onFiltroChange={setFiltro}
            carregando={carregando}
            onMudarStatus={mudarStatus}
          />
        );
      case 'assinaturas':
        return <AssinaturasPainel produtos={produtos} onPedidoGerado={carregar} />;
      case 'lotes':
        return <LotesPainel produtos={produtos} onAtualizado={carregar} />;
      case 'produtos':
        return <ProdutosPainel onAtualizado={carregar} />;
      case 'clientes':
        return <ClientesPainel />;
      case 'relatorio':
        return <RelatorioPainel />;
      case 'whatsapp':
        return <WhatsAppPainel />;
      case 'operadores':
        return papel === 'admin' ? <OperadoresPainel /> : null;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 lg:flex-row">
      <aside className="border-b border-stone-200 bg-white lg:w-56 lg:flex-shrink-0 lg:border-b-0 lg:border-r">
        <div className="hidden border-b border-stone-100 p-4 lg:block">
          <h1 className="font-semibold tracking-tight">Plataforma Ovo</h1>
          <p className="text-xs text-stone-500">Granja União</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:gap-0.5 lg:p-3">
          {menu.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSecao(m.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition lg:w-full ${
                secao === m.id
                  ? 'bg-amber-100 text-amber-900'
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
                        : 'bg-amber-500 text-white'
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
          <span className="font-semibold">Plataforma Ovo</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={carregar}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm text-white"
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
            {usuario?.papel === 'operador' && (
              <span className="ml-2 rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                operador
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={carregar}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
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

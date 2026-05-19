import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import PixPedidoModal from './PixPedidoModal.jsx';

const inputClass =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

const PAGAMENTOS = [
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'pix', label: 'PIX' },
  { id: 'cartao', label: 'Cartão' },
  { id: 'fiado', label: 'Fiado' },
];

export default function VendaBalcaoForm({ produtos, onVenda }) {
  const [busca, setBusca] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [nomeAvulso, setNomeAvulso] = useState('');
  const [precosAtacado, setPrecosAtacado] = useState({});
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [itens, setItens] = useState([]);
  const [pagamento, setPagamento] = useState('dinheiro');
  const [troco, setTroco] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [pixModal, setPixModal] = useState(null);

  useEffect(() => {
    if (!produtoId && produtos.length > 0) {
      setProdutoId(String(produtos[0].id));
    }
  }, [produtos, produtoId]);

  useEffect(() => {
    const q = busca.trim();
    if (q.length < 2) {
      setSugestoes([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const lista = await api.listarClientes(q);
        setSugestoes(lista.slice(0, 8));
      } catch {
        setSugestoes([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [busca]);

  const precoUnitario = useCallback(
    (produto) => {
      if (!produto) return 0;
      const atacado = precosAtacado[produto.id];
      return atacado != null ? Number(atacado) : Number(produto.preco);
    },
    [precosAtacado]
  );

  const total = useMemo(
    () =>
      itens.reduce((acc, item) => {
        const p = produtos.find((x) => x.id === item.produto_id);
        return acc + precoUnitario(p) * item.quantidade;
      }, 0),
    [itens, produtos, precoUnitario]
  );

  async function selecionarCliente(c) {
    setCliente(c);
    setBusca('');
    setSugestoes([]);
    setNomeAvulso('');
    setErro('');
    try {
      const data = await api.precosPorTelefone(c.telefone);
      setPrecosAtacado(data.precos || {});
    } catch {
      setPrecosAtacado({});
    }
  }

  function limparCliente() {
    setCliente(null);
    setPrecosAtacado({});
    setBusca('');
    setPagamento((p) => (p === 'fiado' ? 'dinheiro' : p));
  }

  function adicionarItem(e) {
    e?.preventDefault?.();
    setErro('');
    const id = Number(produtoId);
    const qtd = Number(quantidade);
    if (!id || qtd < 1) {
      setErro('Selecione produto e quantidade.');
      return;
    }
    const existente = itens.find((i) => i.produto_id === id);
    if (existente) {
      setItens(
        itens.map((i) =>
          i.produto_id === id ? { ...i, quantidade: i.quantidade + qtd } : i
        )
      );
    } else {
      setItens([...itens, { produto_id: id, quantidade: qtd }]);
    }
    setQuantidade(1);
  }

  function adicionarRapido(id) {
    setProdutoId(String(id));
    const existente = itens.find((i) => i.produto_id === id);
    if (existente) {
      setItens(
        itens.map((i) =>
          i.produto_id === id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      );
    } else {
      setItens([...itens, { produto_id: id, quantidade: 1 }]);
    }
  }

  function removerItem(produto_id) {
    setItens(itens.filter((i) => i.produto_id !== produto_id));
  }

  function resetForm() {
    setCliente(null);
    setNomeAvulso('');
    setBusca('');
    setItens([]);
    setPagamento('dinheiro');
    setTroco('');
    setPrecosAtacado({});
    setQuantidade(1);
    setProdutoId(produtos[0]?.id?.toString() ?? '');
  }

  async function finalizarVenda(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setPixModal(null);

    if (itens.length === 0) {
      setErro('Adicione ao menos um produto.');
      return;
    }
    if (pagamento === 'fiado' && !cliente?.id) {
      setErro('Fiado só para cliente cadastrado — busque por nome ou telefone.');
      return;
    }

    setEnviando(true);
    try {
      const data = await api.vendaBalcao({
        cliente_id: cliente?.id,
        nome_avulso: !cliente ? nomeAvulso.trim() || undefined : undefined,
        itens,
        pagamento,
        troco: pagamento === 'dinheiro' && troco ? Number(troco) : undefined,
      });

      let msg = `Venda #${data.pedido_id} — R$ ${Number(data.total).toFixed(2)} · ${PAGAMENTOS.find((p) => p.id === pagamento)?.label || pagamento}`;
      if (data.cliente_nome) msg += ` · ${data.cliente_nome}`;
      if (data.fiado_id) msg += ` · Fiado registrado (#${data.fiado_id})`;
      setSucesso(msg);

      if (data.pix?.copia_cola) {
        setPixModal({ pedidoId: data.pedido_id, pix: data.pix });
      }

      resetForm();
      onVenda?.(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const temAtacado = cliente && Object.keys(precosAtacado).length > 0;

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-medium">Venda balcão</h2>
      <p className="mb-4 text-sm text-stone-500">
        Venda presencial — baixa estoque na hora. Busque o cliente ou venda sem cadastro.
      </p>

      {sucesso && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {sucesso}
        </p>
      )}
      {erro && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      <form onSubmit={finalizarVenda} className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-stone-700">Cliente</legend>
          {cliente ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <div>
                <p className="font-medium text-blue-900">{cliente.nome}</p>
                <p className="text-xs text-blue-700">{cliente.telefone}</p>
                {temAtacado && (
                  <p className="mt-1 text-xs font-medium text-blue-800">Preço atacado aplicado</p>
                )}
              </div>
              <button
                type="button"
                onClick={limparCliente}
                className="text-sm text-blue-800 underline"
              >
                Trocar / venda avulsa
              </button>
            </div>
          ) : (
            <>
              <label className="block">
                <span className="mb-1 block text-xs text-stone-500">
                  Buscar por nome ou telefone
                </span>
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className={inputClass}
                  placeholder="Digite para buscar…"
                  autoComplete="off"
                />
              </label>
              {sugestoes.length > 0 && (
                <ul className="max-h-40 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-sm">
                  {sugestoes.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => selecionarCliente(c)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-brand-50"
                      >
                        <span className="font-medium">{c.nome}</span>
                        <span className="ml-2 text-stone-500">{c.telefone}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <label className="block">
                <span className="mb-1 block text-xs text-stone-500">
                  Nome avulso (opcional, se não cadastrar)
                </span>
                <input
                  type="text"
                  value={nomeAvulso}
                  onChange={(e) => setNomeAvulso(e.target.value)}
                  className={inputClass}
                  placeholder="Consumidor"
                />
              </label>
            </>
          )}
        </fieldset>

        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">Produtos rápidos</p>
          <div className="flex flex-wrap gap-2">
            {produtos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => adicionarRapido(p.id)}
                disabled={p.estoque < 1}
                className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-left text-sm hover:border-brand-400 hover:bg-brand-50 disabled:opacity-40"
              >
                <span className="font-medium">{p.nome}</span>
                <span className="ml-1 text-stone-500">
                  R$ {precoUnitario(p).toFixed(2)} · {p.estoque}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-stone-100 bg-stone-50 p-4">
          <p className="mb-3 text-sm font-medium text-stone-700">Carrinho</p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[160px] flex-1">
              <span className="mb-1 block text-xs text-stone-500">Produto</span>
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                className={inputClass}
              >
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — R$ {precoUnitario(p).toFixed(2)} · est: {p.estoque}
                  </option>
                ))}
              </select>
            </label>
            <label className="w-20">
              <span className="mb-1 block text-xs text-stone-500">Qtd</span>
              <input
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className={inputClass}
              />
            </label>
            <button
              type="button"
              onClick={adicionarItem}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium hover:bg-stone-50"
            >
              + Adicionar
            </button>
          </div>

          {itens.length > 0 && (
            <ul className="mt-4 space-y-2">
              {itens.map((item) => {
                const p = produtos.find((x) => x.id === item.produto_id);
                const unit = precoUnitario(p);
                const sub = unit * item.quantidade;
                return (
                  <li
                    key={item.produto_id}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                  >
                    <span>
                      {item.quantidade}× {p?.nome} — R$ {sub.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerItem(item.produto_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remover
                    </button>
                  </li>
                );
              })}
              <li className="border-t border-stone-200 pt-2 text-right text-lg font-bold text-stone-900">
                Total: R$ {total.toFixed(2)}
              </li>
            </ul>
          )}
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-stone-700">Pagamento</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PAGAMENTOS.map((p) => (
              <label
                key={p.id}
                className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition ${
                  pagamento === p.id
                    ? 'border-brand-500 bg-brand-50 text-brand-900'
                    : 'border-stone-200 hover:border-stone-300'
                } ${p.id === 'fiado' && !cliente ? 'opacity-50' : ''}`}
              >
                <input
                  type="radio"
                  name="pagamento"
                  value={p.id}
                  checked={pagamento === p.id}
                  disabled={p.id === 'fiado' && !cliente}
                  onChange={() => setPagamento(p.id)}
                  className="sr-only"
                />
                {p.label}
              </label>
            ))}
          </div>
          {pagamento === 'dinheiro' && (
            <label className="block max-w-xs">
              <span className="mb-1 block text-xs text-stone-500">Troco para (R$)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={troco}
                onChange={(e) => setTroco(e.target.value)}
                className={inputClass}
                placeholder="Ex.: 50"
              />
            </label>
          )}
          {pagamento === 'fiado' && cliente && (
            <p className="text-xs text-brand-800">
              A dívida será registrada em fiado para <strong>{cliente.nome}</strong>.
            </p>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={enviando || itens.length === 0}
          className="w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {enviando ? 'Registrando…' : `Finalizar venda · R$ ${total.toFixed(2)}`}
        </button>
      </form>

      {pixModal && (
        <PixPedidoModal
          pedidoId={pixModal.pedidoId}
          pix={pixModal.pix}
          onFechar={() => setPixModal(null)}
        />
      )}
    </section>
  );
}

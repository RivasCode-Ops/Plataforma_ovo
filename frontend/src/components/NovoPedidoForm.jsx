import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import PixPedidoModal from './PixPedidoModal.jsx';
import NextStepsCard from './NextStepsCard.jsx';

const inputClass =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500';

export default function NovoPedidoForm({ produtos, onCriado, onIrPara }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacao, setObservacao] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [itens, setItens] = useState([]);
  const [precosAtacado, setPrecosAtacado] = useState({});
  const [clienteAtacado, setClienteAtacado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [pixModal, setPixModal] = useState(null);
  const [pedidoSalvo, setPedidoSalvo] = useState(null);

  const precoUnitario = useCallback(
    (produto) => {
      if (!produto) return 0;
      const atacado = precosAtacado[produto.id];
      return atacado != null ? Number(atacado) : Number(produto.preco);
    },
    [precosAtacado]
  );

  useEffect(() => {
    if (!produtoId && produtos.length > 0) {
      setProdutoId(String(produtos[0].id));
    }
  }, [produtos, produtoId]);

  useEffect(() => {
    const tel = telefone.replace(/\D/g, '');
    if (tel.length < 8) {
      setPrecosAtacado({});
      setClienteAtacado(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const data = await api.precosPorTelefone(telefone.trim());
        setPrecosAtacado(data.precos || {});
        setClienteAtacado(data.cliente);
        if (data.cliente?.nome && !nome.trim()) {
          setNome(data.cliente.nome);
        }
      } catch {
        setPrecosAtacado({});
        setClienteAtacado(null);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [telefone, nome]);

  const total = useMemo(
    () =>
      itens.reduce((acc, item) => {
        const p = produtos.find((x) => x.id === item.produto_id);
        return acc + precoUnitario(p) * item.quantidade;
      }, 0),
    [itens, produtos, precoUnitario]
  );

  function adicionarItem(e) {
    e.preventDefault();
    setErro('');
    const id = Number(produtoId);
    const qtd = Number(quantidade);
    if (!id || qtd < 1) {
      setErro('Selecione um produto e quantidade válida.');
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

  function removerItem(produto_id) {
    setItens(itens.filter((i) => i.produto_id !== produto_id));
  }

  async function enviarPedido(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!nome.trim() || !telefone.trim()) {
      setErro('Nome e telefone do cliente são obrigatórios.');
      return;
    }
    if (itens.length === 0) {
      setErro('Adicione ao menos um item ao pedido.');
      return;
    }

    setEnviando(true);
    try {
      const data = await api.criarPedido({
        cliente: {
          nome: nome.trim(),
          telefone: telefone.trim(),
          endereco: endereco.trim() || undefined,
        },
        itens,
        observacao: observacao.trim() || undefined,
        confirmar: true,
      });
      let msgSucesso = `Pedido #${data.pedido_id} criado — R$ ${Number(data.total).toFixed(2)}`;
      if (clienteAtacado && Object.keys(precosAtacado).length > 0) {
        msgSucesso += ' (preço atacado aplicado)';
      }
      if (data.whatsapp?.ok && data.whatsapp.link) {
        window.open(data.whatsapp.link, '_blank', 'noopener');
        msgSucesso += ' · Link WhatsApp aberto';
      } else if (data.whatsapp?.erro) {
        msgSucesso += ` · ${data.whatsapp.erro}`;
      }
      setSucesso(msgSucesso);
      const produtoNome =
        produtos.find((p) => p.id === itens[0]?.produto_id)?.nome || 'Pedido';
      setPedidoSalvo({
        id: data.pedido_id,
        produto: produtoNome,
        total: data.total,
      });
      if (data.pix?.copia_cola) {
        setPixModal({ pedidoId: data.pedido_id, pix: data.pix });
      }
      setNome('');
      setTelefone('');
      setEndereco('');
      setObservacao('');
      setItens([]);
      setPrecosAtacado({});
      setClienteAtacado(null);
      setProdutoId(produtos[0]?.id?.toString() ?? '');
      onCriado?.(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const temAtacado = Object.keys(precosAtacado).length > 0;

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-medium">Novo pedido</h2>
      <p className="mb-4 text-sm text-stone-500">
        Lance pedidos recebidos por WhatsApp, telefone ou presencial.
      </p>

      {temAtacado && (
        <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
          Cliente com <strong>preço atacado</strong>
          {clienteAtacado ? ` — ${clienteAtacado.nome}` : ''}
        </p>
      )}

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

      <form onSubmit={enviarPedido} className="space-y-6">
        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="sr-only">Cliente</legend>
          <label className="block sm:col-span-1">
            <span className="mb-1 block text-sm font-medium text-stone-700">Nome *</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputClass}
              placeholder="Maria Silva"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">Telefone *</span>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className={inputClass}
              placeholder="11999990000"
              required
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="mb-1 block text-sm font-medium text-stone-700">Endereço</span>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className={inputClass}
              placeholder="Rua, número, bairro"
            />
          </label>
        </fieldset>

        <div className="rounded-lg border border-stone-100 bg-stone-50 p-4">
          <p className="mb-3 text-sm font-medium text-stone-700">Itens</p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[180px] flex-1">
              <span className="mb-1 block text-xs text-stone-500">Produto</span>
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                className={inputClass}
              >
                <option value="">Selecione…</option>
                {produtos.map((p) => {
                  const preco = precoUnitario(p);
                  const atacado = precosAtacado[p.id] != null;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.nome} — R$ {preco.toFixed(2)}
                      {atacado ? ' (atacado)' : ''} · est: {p.estoque}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="w-24">
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
                const atacado = p && precosAtacado[p.id] != null;
                return (
                  <li
                    key={item.produto_id}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                  >
                    <span>
                      {item.quantidade}× {p?.nome ?? 'Produto'} — R$ {sub.toFixed(2)}
                      {atacado && (
                        <span className="ml-1 text-xs text-blue-600">atacado</span>
                      )}
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
              <li className="border-t border-stone-200 pt-2 text-right font-semibold">
                Total: R$ {total.toFixed(2)}
              </li>
            </ul>
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Observação</span>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Entregar após 14h, troco para R$ 50…"
          />
        </label>

        <button
          type="submit"
          disabled={enviando || itens.length === 0}
          className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? 'Salvando…' : 'Confirmar pedido'}
        </button>
      </form>

      {pixModal && (
        <PixPedidoModal
          pedidoId={pixModal.pedidoId}
          pix={pixModal.pix}
          onFechar={() => setPixModal(null)}
        />
      )}

      {pedidoSalvo && (
        <NextStepsCard
          context="pedido"
          data={pedidoSalvo}
          onIrPara={onIrPara}
        />
      )}
    </section>
  );
}

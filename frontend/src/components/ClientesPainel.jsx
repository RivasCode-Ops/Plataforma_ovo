import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import NextStepsCard from './NextStepsCard.jsx';

const inputClass =
  'w-20 rounded border border-stone-300 px-2 py-1 text-sm tabular-nums focus:border-brand-500 focus:outline-none';

export default function ClientesPainel({ onIrPara }) {
  const { usuario } = useAuth();
  const isAdmin = usuario?.papel === 'admin';
  const [lista, setLista] = useState([]);
  const [busca, setBusca] = useState('');
  const [detalhe, setDetalhe] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [rotas, setRotas] = useState([]);
  const [precosForm, setPrecosForm] = useState({});
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [clienteSalvo, setClienteSalvo] = useState(null);
  const [mostrarNovo, setMostrarNovo] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoTel, setNovoTel] = useState('');
  const [novoEndereco, setNovoEndereco] = useState('');
  const [novoRotaId, setNovoRotaId] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setLista(await api.listarClientes(busca || undefined));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [busca]);

  useEffect(() => {
    const t = setTimeout(carregar, 300);
    return () => clearTimeout(t);
  }, [carregar]);

  useEffect(() => {
    api.listarRotas(true).then(setRotas).catch(() => {});
    if (isAdmin) {
      api.listarProdutosGerenciar().then(setProdutos).catch(() => {});
    }
  }, [isAdmin]);

  async function criarCliente(e) {
    e.preventDefault();
    setErro('');
    setMsg('');
    try {
      const criado = await api.criarCliente({
        nome: novoNome.trim(),
        telefone: novoTel.trim(),
        endereco: novoEndereco.trim() || undefined,
        rota_id: novoRotaId ? Number(novoRotaId) : undefined,
      });
      setMsg(`Cliente "${criado.nome}" cadastrado.`);
      setMostrarNovo(false);
      setNovoNome('');
      setNovoTel('');
      setNovoEndereco('');
      setNovoRotaId('');
      await carregar();
      await verCliente(criado.id);
    } catch (err) {
      setErro(err.message);
    }
  }

  async function verCliente(id) {
    setErro('');
    setMsg('');
    try {
      const d = await api.obterCliente(id);
      setDetalhe(d);
      const map = {};
      for (const pr of d.precos_atacado || []) {
        map[pr.produto_id] = String(pr.preco);
      }
      setPrecosForm(map);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function salvarPreco(produtoId) {
    if (!detalhe?.id) return;
    const preco = Number(precosForm[produtoId]);
    if (!Number.isFinite(preco) || preco < 0) {
      setErro('Informe um preço válido');
      return;
    }
    setErro('');
    try {
      await api.salvarPrecoAtacado(detalhe.id, produtoId, preco);
      setMsg('Preço atacado salvo.');
      setClienteSalvo({ id: detalhe.id, nome: detalhe.nome });
      await verCliente(detalhe.id);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function mudarRota(rotaId) {
    if (!detalhe?.id) return;
    try {
      await api.atribuirClienteRota(detalhe.id, rotaId || null);
      setMsg('Rota atualizada.');
      setClienteSalvo({ id: detalhe.id, nome: detalhe.nome });
      await verCliente(detalhe.id);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function removerPreco(produtoId) {
    if (!detalhe?.id) return;
    try {
      await api.removerPrecoAtacado(detalhe.id, produtoId);
      setMsg('Preço atacado removido.');
      await verCliente(detalhe.id);
    } catch (e) {
      setErro(e.message);
    }
  }

  const precosCadastrados = detalhe?.precos_atacado ?? [];

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium">Clientes</h2>
          <p className="text-sm text-stone-500">
            Cadastro manual ou automático ao criar pedidos. Preço atacado por produto (admin).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMostrarNovo(!mostrarNovo)}
          className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm font-medium text-white"
        >
          {mostrarNovo ? 'Fechar' : '+ Novo cliente'}
        </button>
      </div>

      {mostrarNovo && (
        <form
          onSubmit={criarCliente}
          className="mb-4 grid gap-3 rounded-lg border bg-stone-50 p-4 sm:grid-cols-2"
        >
          <label className="block">
            <span className="mb-1 block text-xs text-stone-500">Nome</span>
            <input
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-stone-500">Telefone</span>
            <input
              value={novoTel}
              onChange={(e) => setNovoTel(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs text-stone-500">Endereço</span>
            <input
              value={novoEndereco}
              onChange={(e) => setNovoEndereco(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-stone-500">Rota (opcional)</span>
            <select
              value={novoRotaId}
              onChange={(e) => setNovoRotaId(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
              <option value="">Sem rota</option>
              {rotas.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Salvar cliente
            </button>
          </div>
        </form>
      )}

      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome ou telefone…"
        className="mb-4 w-full max-w-md rounded-lg border border-stone-300 px-3 py-2 text-sm"
      />

      {erro && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}
      {msg && (
        <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {msg}
        </p>
      )}

      {clienteSalvo && (
        <NextStepsCard context="cliente" data={clienteSalvo} onIrPara={onIrPara} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          {carregando ? (
            <p className="text-sm text-stone-500">Carregando…</p>
          ) : lista.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum cliente encontrado.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {lista.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => verCliente(c.id)}
                    className={`w-full px-1 py-3 text-left hover:bg-stone-50 ${
                      detalhe?.id === c.id ? 'bg-brand-50' : ''
                    }`}
                  >
                    <p className="font-medium">{c.nome}</p>
                    <p className="text-xs text-stone-500">{c.telefone}</p>
                    <p className="mt-1 text-xs text-stone-400">
                      {c.total_pedidos} pedido(s) · R$ {Number(c.total_gasto).toFixed(2)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {detalhe && (
          <div className="rounded-lg border border-stone-100 bg-stone-50 p-4">
            <h3 className="font-medium">{detalhe.nome}</h3>
            <p className="text-sm text-stone-600">{detalhe.telefone}</p>
            {detalhe.endereco && (
              <p className="mt-1 text-sm text-stone-500">{detalhe.endereco}</p>
            )}

            <label className="mt-3 block text-sm">
              <span className="font-medium text-stone-700">Rota de entrega</span>
              <select
                className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                value={detalhe.rota_id ?? ''}
                onChange={(e) =>
                  mudarRota(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Sem rota</option>
                {rotas.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                  </option>
                ))}
              </select>
            </label>

            {isAdmin && produtos.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-stone-700">Preços atacado</h4>
                <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
                  {produtos
                    .filter((p) => p.ativo)
                    .map((p) => {
                      const cadastrado = precosCadastrados.find((x) => x.produto_id === p.id);
                      return (
                        <div
                          key={p.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded bg-white px-2 py-1.5"
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {p.nome}{' '}
                            <span className="text-stone-400">
                              (varejo R$ {Number(p.preco).toFixed(2)})
                            </span>
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-stone-500">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="—"
                              value={precosForm[p.id] ?? ''}
                              onChange={(e) =>
                                setPrecosForm({ ...precosForm, [p.id]: e.target.value })
                              }
                              className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() => salvarPreco(p.id)}
                              className="rounded bg-brand-600 px-2 py-1 text-xs text-white"
                            >
                              OK
                            </button>
                            {cadastrado && (
                              <button
                                type="button"
                                onClick={() => removerPreco(p.id)}
                                className="text-xs text-red-600 underline"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <h4 className="mb-2 mt-4 text-sm font-medium text-stone-700">Últimos pedidos</h4>
            {detalhe.pedidos?.length ? (
              <ul className="space-y-2 text-sm">
                {detalhe.pedidos.map((p) => (
                  <li key={p.id} className="flex justify-between rounded bg-white px-2 py-1.5">
                    <span>
                      #{p.id} · {p.status}
                    </span>
                    <span className="tabular-nums">R$ {Number(p.total).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500">Sem pedidos.</p>
            )}
            <button
              type="button"
              onClick={() => {
                setDetalhe(null);
                setPrecosForm({});
              }}
              className="mt-3 text-xs text-stone-500 underline"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const DIAS = [
  { v: 0, l: 'Domingo' },
  { v: 1, l: 'Segunda' },
  { v: 2, l: 'Terça' },
  { v: 3, l: 'Quarta' },
  { v: 4, l: 'Quinta' },
  { v: 5, l: 'Sexta' },
  { v: 6, l: 'Sábado' },
];

const inputClass =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none';

export default function AssinaturasPainel({ produtos, onPedidoGerado }) {
  const [semana, setSemana] = useState([]);
  const [todas, setTodas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [frequencia, setFrequencia] = useState('semanal');
  const [diaSemana, setDiaSemana] = useState(3);
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [ent, list] = await Promise.all([
        api.assinaturasEntregasSemana(),
        api.listarAssinaturas(),
      ]);
      setSemana(ent);
      setTodas(list);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    if (produtos.length && !produtoId) setProdutoId(String(produtos[0].id));
  }, [carregar, produtos, produtoId]);

  function adicionarItem(e) {
    e.preventDefault();
    const id = Number(produtoId);
    const qtd = Number(quantidade);
    if (!id || qtd < 1) return;
    const exist = itens.find((i) => i.produto_id === id);
    if (exist) {
      setItens(itens.map((i) => (i.produto_id === id ? { ...i, quantidade: i.quantidade + qtd } : i)));
    } else {
      setItens([...itens, { produto_id: id, quantidade: qtd }]);
    }
    setQuantidade(1);
  }

  async function criarAssinatura(e) {
    e.preventDefault();
    setErro('');
    setMsg('');
    if (!nome.trim() || !telefone.trim() || !itens.length) {
      setErro('Preencha cliente e itens.');
      return;
    }
    try {
      const data = await api.criarAssinatura({
        cliente: { nome: nome.trim(), telefone: telefone.trim(), endereco: endereco.trim() || undefined },
        frequencia,
        dia_semana: diaSemana,
        itens,
      });
      setMsg(`Assinatura #${data.assinatura_id} criada. Próxima entrega: ${data.proxima_entrega}`);
      setMostrarForm(false);
      setNome('');
      setTelefone('');
      setEndereco('');
      setItens([]);
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function gerarPedido(id) {
    setErro('');
    setMsg('');
    try {
      const data = await api.gerarPedidoAssinatura(id);
      setMsg(`Pedido #${data.pedido.pedido_id} gerado. Próxima entrega: ${data.proxima_entrega}`);
      if (data.pedido.whatsapp?.link) window.open(data.pedido.whatsapp.link, '_blank', 'noopener');
      await carregar();
      onPedidoGerado?.();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function mudarStatus(id, status) {
    try {
      await api.atualizarAssinaturaStatus(id, status);
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  function CardAssinatura({ a, destacar }) {
    const atrasada = a.proxima_entrega <= new Date().toISOString().slice(0, 10);
    return (
      <article
        className={`rounded-lg border p-4 ${
          destacar ? (atrasada ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50') : 'border-stone-200'
        }`}
      >
        <div className="flex flex-wrap justify-between gap-2">
          <div>
            <p className="font-medium">
              {a.cliente_nome} · {a.frequencia} · {a.dia_semana_nome}
            </p>
            <p className="text-xs text-stone-500">{a.cliente_telefone}</p>
          </div>
          <span className="text-sm capitalize text-stone-600">{a.status}</span>
        </div>
        <p className="mt-2 text-sm">
          Próxima entrega: <strong>{a.proxima_entrega}</strong>
        </p>
        <ul className="mt-2 text-sm text-stone-600">
          {a.itens?.map((i) => (
            <li key={i.produto_id}>
              {i.quantidade}× {i.nome}
            </li>
          ))}
        </ul>
        {a.status === 'ativa' && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => gerarPedido(a.id)}
              className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Gerar pedido desta entrega
            </button>
            <button
              type="button"
              onClick={() => mudarStatus(a.id, 'pausada')}
              className="rounded border border-stone-300 px-2 py-1 text-xs"
            >
              Pausar
            </button>
          </div>
        )}
        {a.status === 'pausada' && (
          <button
            type="button"
            onClick={() => mudarStatus(a.id, 'ativa')}
            className="mt-3 text-xs font-medium text-emerald-700"
          >
            Reativar
          </button>
        )}
      </article>
    );
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium">Assinaturas</h2>
          <p className="text-sm text-stone-500">Entregas semanais ou quinzenais fixas</p>
        </div>
        <button
          type="button"
          onClick={() => setMostrarForm(!mostrarForm)}
          className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm font-medium text-white"
        >
          {mostrarForm ? 'Fechar' : '+ Nova assinatura'}
        </button>
      </div>

      {msg && (
        <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {msg}
        </p>
      )}
      {erro && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      {mostrarForm && (
        <form onSubmit={criarAssinatura} className="mb-6 space-y-4 rounded-lg border border-stone-100 bg-stone-50 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} required />
            <input placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputClass} required />
            <input placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={frequencia} onChange={(e) => setFrequencia(e.target.value)} className={inputClass}>
              <option value="semanal">Semanal</option>
              <option value="quinzenal">Quinzenal</option>
            </select>
            <select value={diaSemana} onChange={(e) => setDiaSemana(Number(e.target.value))} className={inputClass}>
              {DIAS.map((d) => (
                <option key={d.v} value={d.v}>
                  {d.l}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} className={`${inputClass} min-w-[160px]`}>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            <input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className={`${inputClass} w-20`} />
            <button type="button" onClick={adicionarItem} className="rounded border border-stone-300 bg-white px-3 py-2 text-sm">
              + Item
            </button>
          </div>
          {itens.length > 0 && (
            <p className="text-sm text-stone-600">
              Itens: {itens.map((i) => {
                const p = produtos.find((x) => x.id === i.produto_id);
                return `${i.quantidade}× ${p?.nome}`;
              }).join(', ')}
            </p>
          )}
          <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white">
            Salvar assinatura
          </button>
        </form>
      )}

      {carregando ? (
        <p className="text-sm text-stone-500">Carregando…</p>
      ) : (
        <>
          <h3 className="mb-2 text-sm font-medium text-stone-700">Entregas nos próximos 7 dias</h3>
          {semana.length === 0 ? (
            <p className="mb-6 text-sm text-stone-500">Nenhuma entrega nesta semana.</p>
          ) : (
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {semana.map((a) => (
                <CardAssinatura key={a.id} a={a} destacar />
              ))}
            </div>
          )}

          <h3 className="mb-2 text-sm font-medium text-stone-700">Todas as assinaturas</h3>
          {todas.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhuma assinatura cadastrada.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {todas.map((a) => (
                <CardAssinatura key={a.id} a={a} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

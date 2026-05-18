import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const inputClass =
  'w-full rounded border border-stone-300 px-2 py-1 text-sm focus:border-amber-500 focus:outline-none';

export default function ProdutosPainel({ onAtualizado }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setLista(await api.listarProdutosGerenciar());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar() {
    if (!form?.id) return;
    setErro('');
    try {
      await api.atualizarProduto(form.id, {
        nome: form.nome,
        unidade: form.unidade,
        preco: Number(form.preco),
        estoque: Number(form.estoque),
        ativo: form.ativo,
      });
      setForm(null);
      await carregar();
      onAtualizado?.();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function criar(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.criarProduto({
        nome: form.nome,
        unidade: form.unidade,
        preco: Number(form.preco),
        estoque: Number(form.estoque) || 0,
      });
      setForm(null);
      await carregar();
      onAtualizado?.();
    } catch (err) {
      setErro(err.message);
    }
  }

  const isNovo = form && !form.id;

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium">Produtos e estoque</h2>
        <button
          type="button"
          onClick={() =>
            setForm({ nome: '', unidade: 'dúzia', preco: '', estoque: 0, ativo: true })
          }
          className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-900"
        >
          + Novo produto
        </button>
      </div>

      {erro && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      {form && (
        <form
          onSubmit={isNovo ? criar : (e) => { e.preventDefault(); salvar(); }}
          className="mb-4 grid gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:grid-cols-2 lg:grid-cols-6"
        >
          <input
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className={inputClass}
            required
          />
          <input
            placeholder="Unidade"
            value={form.unidade}
            onChange={(e) => setForm({ ...form, unidade: e.target.value })}
            className={inputClass}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Preço"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
            className={inputClass}
            required
          />
          <input
            type="number"
            placeholder="Estoque"
            value={form.estoque}
            onChange={(e) => setForm({ ...form, estoque: e.target.value })}
            className={inputClass}
          />
          {!isNovo && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              />
              Ativo
            </label>
          )}
          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <button type="submit" className="flex-1 rounded bg-amber-600 py-1.5 text-sm text-white">
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded border border-stone-300 px-2 py-1.5 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {carregando ? (
        <p className="text-sm text-stone-500">Carregando…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-stone-500">
                <th className="py-2 pr-3">Produto</th>
                <th className="py-2 pr-3">Preço</th>
                <th className="py-2 pr-3">Estoque</th>
                <th className="py-2 pr-3">Ativo</th>
                <th className="py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-stone-50 ${!p.ativo ? 'opacity-50' : ''}`}
                >
                  <td className="py-2 pr-3">
                    {p.nome} <span className="text-stone-400">({p.unidade})</span>
                  </td>
                  <td className="py-2 pr-3 tabular-nums">R$ {Number(p.preco).toFixed(2)}</td>
                  <td
                    className={`py-2 pr-3 tabular-nums ${p.estoque < 10 ? 'font-semibold text-amber-700' : ''}`}
                  >
                    {p.estoque}
                  </td>
                  <td className="py-2 pr-3">{p.ativo ? 'Sim' : 'Não'}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          id: p.id,
                          nome: p.nome,
                          unidade: p.unidade,
                          preco: p.preco,
                          estoque: p.estoque,
                          ativo: p.ativo,
                        })
                      }
                      className="text-xs font-medium text-amber-700 hover:text-amber-900"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

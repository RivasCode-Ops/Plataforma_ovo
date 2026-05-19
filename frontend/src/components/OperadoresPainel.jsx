import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const inputClass =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

export default function OperadoresPainel() {
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({
    nome: '',
    login: '',
    senha: '',
    papel: 'operador',
  });
  const [senhaId, setSenhaId] = useState(null);
  const [novaSenha, setNovaSenha] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setLista(await api.listarOperadores());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function criar(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.criarOperador(form);
      setForm({ nome: '', login: '', senha: '', papel: 'operador' });
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function alternarAtivo(op) {
    try {
      await api.atualizarOperador(op.id, { ativo: !op.ativo });
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function salvarSenha(e) {
    e.preventDefault();
    try {
      await api.redefinirSenhaOperador(senhaId, novaSenha);
      setSenhaId(null);
      setNovaSenha('');
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Operadores</h2>
        <p className="text-sm text-stone-500">
          Contas de quem usa o painel. Operador: pedidos e clientes. Admin: tudo, incluindo produtos.
        </p>
      </div>

      {erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      <form
        onSubmit={criar}
        className="rounded-xl border border-stone-200 bg-white p-4 space-y-3 max-w-lg"
      >
        <p className="font-medium text-sm">Novo operador</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs text-stone-600">Nome</span>
            <input
              className={inputClass}
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-stone-600">Login</span>
            <input
              className={inputClass}
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              autoComplete="off"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-stone-600">Senha</span>
            <input
              type="password"
              className={inputClass}
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              minLength={6}
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs text-stone-600">Perfil</span>
            <select
              className={inputClass}
              value={form.papel}
              onChange={(e) => setForm({ ...form, papel: e.target.value })}
            >
              <option value="operador">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Cadastrar
        </button>
      </form>

      {senhaId && (
        <form
          onSubmit={salvarSenha}
          className="rounded-xl border border-brand-200 bg-brand-50 p-4 flex flex-wrap gap-2 items-end"
        >
          <label className="flex-1 min-w-[200px]">
            <span className="mb-1 block text-xs text-stone-600">Nova senha</span>
            <input
              type="password"
              className={inputClass}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              minLength={6}
              required
            />
          </label>
          <button type="submit" className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-white">
            Salvar
          </button>
          <button
            type="button"
            onClick={() => {
              setSenhaId(null);
              setNovaSenha('');
            }}
            className="text-sm text-stone-600 underline"
          >
            Cancelar
          </button>
        </form>
      )}

      {carregando ? (
        <p className="text-sm text-stone-500">Carregando…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-100 bg-stone-50 text-left text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Login</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((op) => (
                <tr key={op.id} className="border-t border-stone-100">
                  <td className="px-4 py-3 font-medium">{op.nome}</td>
                  <td className="px-4 py-3 text-stone-600">{op.login}</td>
                  <td className="px-4 py-3 capitalize">{op.papel}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        op.ativo ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {op.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSenhaId(op.id)}
                      className="text-xs text-brand-700 underline"
                    >
                      Nova senha
                    </button>
                    <button
                      type="button"
                      onClick={() => alternarAtivo(op)}
                      className="text-xs text-stone-600 underline"
                    >
                      {op.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

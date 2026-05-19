import { useState } from 'react';

const inputClass =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('admin');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await onLogin(usuario.trim(), senha);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-stone-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-900">meuzovo</h1>
          <p className="mt-1 text-sm text-stone-500">Painel da granja</p>
        </div>

        {erro && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {erro}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">Usuário</span>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className={inputClass}
              autoComplete="username"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
              required
            />
          </label>
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-400">
          Acesso restrito ao operador da granja
        </p>
      </div>
    </div>
  );
}

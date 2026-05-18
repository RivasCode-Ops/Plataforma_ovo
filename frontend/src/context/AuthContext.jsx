import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setOnUnauthorized, setToken } from '../services/api.js';
import Login from '../components/Login.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(() => {});
  }, [logout]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCarregando(false);
      return;
    }
    api
      .me()
      .then((data) => setUsuario(data.usuario))
      .catch(() => logout())
      .finally(() => setCarregando(false));
  }, [logout]);

  async function login(usuarioInput, senha) {
    const data = await api.login(usuarioInput, senha);
    setToken(data.token);
    setUsuario(data.usuario);
    return data;
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-sm text-stone-500">Carregando…</p>
      </div>
    );
  }

  if (!usuario) {
    return <Login onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={{ usuario, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

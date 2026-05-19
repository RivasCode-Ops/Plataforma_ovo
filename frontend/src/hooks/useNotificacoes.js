import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';

const PUSH_KEY = 'plataforma_ovo_push_ok';

export function useNotificacoes() {
  const [resumo, setResumo] = useState({ total: 0, alta: 0 });
  const [pushAtivo, setPushAtivo] = useState(
    () => localStorage.getItem(PUSH_KEY) === '1' && Notification?.permission === 'granted'
  );
  const ultimaAlta = useRef(0);

  const carregar = useCallback(async () => {
    try {
      const data = await api.listarNotificacoes();
      setResumo(data.resumo ?? { total: 0, alta: 0 });

      if (
        pushAtivo &&
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted' &&
        data.resumo?.alta > ultimaAlta.current &&
        ultimaAlta.current > 0
      ) {
        const urgentes = data.itens?.filter((n) => n.nivel === 'alta').slice(0, 3) ?? [];
        const corpo =
          urgentes.map((n) => n.titulo).join(' · ') || `${data.resumo.alta} alertas urgentes`;
        new Notification('meuzovo', { body: corpo, icon: '/icons/icon-192.png', tag: 'alertas-meuzovo' });
      }
      ultimaAlta.current = data.resumo?.alta ?? 0;
    } catch {
      setResumo({ total: 0, alta: 0 });
    }
  }, [pushAtivo]);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 60_000);
    return () => clearInterval(t);
  }, [carregar]);

  async function ativarPush() {
    if (typeof Notification === 'undefined') return;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      localStorage.setItem(PUSH_KEY, '1');
      setPushAtivo(true);
      new Notification('meuzovo', {
        body: 'Alertas urgentes serão avisados aqui.',
        icon: '/icon.svg',
      });
    }
  }

  return { resumo, pushAtivo, ativarPush, recarregar: carregar };
}

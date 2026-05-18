import { useEffect, useState } from 'react';

export default function InstalarApp() {
  const [escondido, setEscondido] = useState(true);
  const [deferred, setDeferred] = useState(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem('pwa_banner_ok') === '1') return;

    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIos(isIos);
    setEscondido(false);

    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function fechar() {
    localStorage.setItem('pwa_banner_ok', '1');
    setEscondido(true);
  }

  async function instalar() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    fechar();
  }

  if (escondido) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-amber-900">Instalar no celular</p>
          {ios ? (
            <p className="mt-1 text-sm text-amber-800">
              Safari → compartilhar → <strong>Adicionar à Tela de Início</strong>
            </p>
          ) : deferred ? (
            <p className="mt-1 text-sm text-amber-800">
              Acesso rápido como app, sem abrir o navegador toda vez.
            </p>
          ) : (
            <p className="mt-1 text-sm text-amber-800">
              No Chrome: menu ⋮ → Instalar aplicativo (ou Adicionar à tela inicial).
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {deferred && (
            <button
              type="button"
              onClick={instalar}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white"
            >
              Instalar
            </button>
          )}
          <button type="button" onClick={fechar} className="text-sm text-amber-700 underline">
            Depois
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

export default function InstalarApp() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [dispensado, setDispensado] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setStandalone(true);
      return;
    }
    if (localStorage.getItem('pwa_banner_ok') === '1') {
      setDispensado(true);
    }

    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIos(isIos);

    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dispensar() {
    localStorage.setItem('pwa_banner_ok', '1');
    setDispensado(true);
    setInstallPrompt(null);
  }

  async function instalar() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    dispensar();
  }

  if (standalone || dispensado) return null;
  if (!installPrompt && !ios) return null;

  return (
    <div
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-300 bg-brand-50 px-4 py-3"
      role="region"
      aria-label="Instalar aplicativo"
    >
      <p className="text-sm text-brand-900">
        {ios ? (
          <>
            <strong>Instale no iPhone/iPad:</strong> Safari → compartilhar →{' '}
            <strong>Adicionar à Tela de Início</strong> para acesso rápido.
          </>
        ) : (
          <>
            Instale o app para acesso rápido pelo desktop e celular.
          </>
        )}
      </p>
      <div className="flex shrink-0 gap-2">
        {installPrompt && (
          <button
            type="button"
            onClick={instalar}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Instalar agora
          </button>
        )}
        <button
          type="button"
          onClick={dispensar}
          className="rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm text-brand-800 hover:bg-brand-100"
        >
          Depois
        </button>
      </div>
    </div>
  );
}

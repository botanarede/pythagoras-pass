import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { Language } from '../game/i18n.ts';

interface PWAInstallButtonProps {
  language: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const labels = {
    'pt-BR': {
      install: 'Instalar App',
      installIos: 'Instalar no iOS',
      iosTitle: 'Instalar no iPhone / iPad',
      iosStep1: '1. Toque no botão',
      iosShare: 'Compartilhar',
      iosStep2: 'na barra do Safari.',
      iosStep3: '2. Role para baixo e selecione',
      iosAdd: 'Adicionar à Tela de Início',
      close: 'Fechar',
    },
    'en': {
      install: 'Install App',
      installIos: 'Install on iOS',
      iosTitle: 'Install on iPhone / iPad',
      iosStep1: '1. Tap the',
      iosShare: 'Share',
      iosStep2: 'button in the Safari toolbar.',
      iosStep3: '2. Scroll down and tap',
      iosAdd: 'Add to Home Screen',
      close: 'Close',
    },
    'es': {
      install: 'Instalar App',
      installIos: 'Instalar en iOS',
      iosTitle: 'Instalar en iPhone / iPad',
      iosStep1: '1. Toca el botón',
      iosShare: 'Compartir',
      iosStep2: 'en la barra de Safari.',
      iosStep3: '2. Desplázate hacia abajo y toca',
      iosAdd: 'Añadir a Pantalla de Inicio',
      close: 'Cerrar',
    },
  }[language];

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        title={labels.install}
        aria-label={labels.install}
      >
        <Download size={14} />
        <span>{labels.install}</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shadow transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title={labels.installIos}
          aria-label={labels.installIos}
        >
          <Download size={14} />
          <span>{labels.installIos}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Share2 size={18} /> {labels.iosTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed space-y-1">
                <span>{labels.iosStep1} <strong>{labels.iosShare}</strong> {labels.iosStep2}</span><br />
                <span>{labels.iosStep3} <strong>{labels.iosAdd}</strong>.</span>
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white border border-slate-700"
              >
                {labels.close}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

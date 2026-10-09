import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';
import { Language } from '../game/i18n.ts';

interface OfflineIndicatorProps {
  language: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ language }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  const text = {
    'pt-BR': 'Modo Offline — Operando com cache local',
    'en': 'Offline Mode — Operating from cached data',
    'es': 'Modo Offline — Operando con datos en caché',
  }[language];

  return (
    <aside
      aria-label="Offline Mode"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-500/95 border border-amber-400 text-slate-950 px-3.5 py-2 text-xs font-black shadow-2xl backdrop-blur select-none animate-bounce"
    >
      <WifiOff size={15} />
      <span>{text}</span>
    </aside>
  );
};

import React from 'react';
import { Eye, EyeOff, Sparkles, MapPin, Globe } from 'lucide-react';
import { Difficulty } from '../game/types.ts';
import { GamePhaseId } from '../game/themes.ts';
import { Language, Translations } from '../game/i18n.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface HeaderProps {
  difficulty: Difficulty;
  onSelectDifficulty: (d: Difficulty) => void;
  isHelpOpen: boolean;
  onToggleHelp: () => void;
  currentPhase: GamePhaseId;
  phaseName: string;
  stadiumName: string;
  language: Language;
  onSelectLanguage: (l: Language) => void;
  t: Translations;
}

export const Header: React.FC<HeaderProps> = ({
  difficulty,
  onSelectDifficulty,
  isHelpOpen,
  onToggleHelp,
  currentPhase,
  phaseName,
  stadiumName,
  language,
  onSelectLanguage,
  t,
}) => {
  const phases: { id: GamePhaseId; label: string }[] = [
    { id: 1, label: 'Bahia' },
    { id: 2, label: 'Flamengo' },
    { id: 3, label: 'Cruzeiro' },
  ];

  const langs: { code: Language; label: string }[] = [
    { code: 'pt-BR', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ];

  return (
    <header className="bg-slate-900/95 text-white border-b border-slate-800/80 px-3 py-2.5 shadow-md shrink-0">
      <div className="w-full flex flex-col items-center gap-2.5">
        {/* Branding & Titles */}
        <div className="flex items-center gap-2.5 w-full justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-lg text-white shadow-md border border-blue-400 shrink-0">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">
                  RALECAB GAMES
                </span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-500" />
                <span className="text-[10px] font-semibold text-sky-300 flex items-center gap-0.5">
                  <MapPin size={10} className="text-sky-400" /> {stadiumName}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                {t.title}
              </h1>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px] font-bold" role="group" aria-label="Idioma / Language">
            <span className="pl-1 pr-0.5 text-slate-400 flex items-center" aria-hidden="true">
              <Globe size={11} />
            </span>
            {langs.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => onSelectLanguage(l.code)}
                aria-pressed={language === l.code}
                className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  language === l.code
                    ? 'bg-blue-600 text-white shadow font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Phase Tracker, Difficulty, PWA Install & Help Toggle */}
        <div className="flex items-center justify-between w-full gap-1.5 flex-wrap">
          {/* 3-Phase step tracker */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-[10px] font-bold" aria-label="Fases do jogo">
            {phases.map((p) => {
              const isActive = p.id === currentPhase;
              const isPast = p.id < currentPhase;
              return (
                <div
                  key={p.id}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : isPast
                      ? 'bg-slate-700/60 text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {p.id}. {p.label}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* In-app PWA install button */}
            <PWAInstallButton language={language} />

            {/* Difficulty selector */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px] font-bold" role="group" aria-label="Dificuldade">
              <button
                type="button"
                onClick={() => onSelectDifficulty('easy')}
                aria-pressed={difficulty === 'easy'}
                className={`px-2 py-1 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  difficulty === 'easy'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.easy}
              </button>
              <button
                type="button"
                onClick={() => onSelectDifficulty('hard')}
                aria-pressed={difficulty === 'hard'}
                className={`px-2 py-1 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  difficulty === 'hard'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.hard}
              </button>
            </div>

            {/* Help formula toggle */}
            <button
              type="button"
              onClick={onToggleHelp}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isHelpOpen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
              aria-label={isHelpOpen ? t.hideHelp : t.showHelp}
            >
              {isHelpOpen ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{isHelpOpen ? t.hideHelp : t.showHelp}</span>
              {isHelpOpen && <Sparkles size={11} className="text-amber-400" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { ChangeEvent } from 'react';
import {
  Play,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import { RoundPhase } from '../game/types.ts';
import { GamePhaseId } from '../game/themes.ts';
import { Translations } from '../game/i18n.ts';

interface ControlsPanelProps {
  rawInput: string;
  onChangeInput: (val: string) => void;
  onAdjust: (delta: number) => void;
  onLaunch: () => void;
  onRetry: () => void;
  onNewRound: () => void;
  onAdvancePhase: () => void;
  onReplayGame: () => void;
  phase: RoundPhase;
  currentPhase: GamePhaseId;
  nextPhaseName: string | null;
  isValid: boolean;
  validationError?: string;
  t: Translations;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  rawInput,
  onChangeInput,
  onAdjust,
  onLaunch,
  onRetry,
  onNewRound,
  onAdvancePhase,
  onReplayGame,
  phase,
  currentPhase,
  nextPhaseName,
  isValid,
  validationError,
  t,
}) => {
  const isAnimating = phase === 'passing' || phase === 'shooting';
  const hasFinished = phase === 'goal' || phase === 'miss_short' || phase === 'miss_long';
  const isGoal = phase === 'goal';
  const isLast = currentPhase === 3;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeInput(e.target.value);
  };

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl text-white">
      <div className="flex flex-col items-center justify-between gap-3">
        {/* Left/Top: Input for C & Increment/Decrement */}
        <div className="flex flex-col items-center gap-2 w-full">
          <label htmlFor="input-c" className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
            {t.passDistance}:
          </label>

          <div className="flex items-center gap-1 sm:gap-1.5 w-full justify-center">
            {/* Quick Decrement buttons */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onAdjust(-10)}
                disabled={isAnimating}
                className="min-h-[44px] min-w-[42px] px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-40 text-xs font-mono font-bold border border-slate-700 transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                title={`${t.decreaseBy} 0.10`}
                aria-label={`${t.decreaseBy} 0.10`}
              >
                -0.10
              </button>
              <button
                type="button"
                onClick={() => onAdjust(-1)}
                disabled={isAnimating}
                className="min-h-[44px] min-w-[42px] px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-40 text-xs font-mono font-bold border border-slate-700 transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                title={`${t.decreaseBy} 0.01`}
                aria-label={`${t.decreaseBy} 0.01`}
              >
                <Minus size={13} className="mr-0.5" /> 0.01
              </button>
            </div>

            {/* Direct Input */}
            <div className="relative">
              <input
                id="input-c"
                type="text"
                inputMode="decimal"
                value={rawInput}
                onChange={handleInputChange}
                disabled={isAnimating}
                placeholder={t.inputPlaceholder}
                className={`min-h-[44px] w-24 sm:w-28 px-2.5 py-2 text-center text-lg font-mono font-bold rounded-xl border transition outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isValid
                    ? 'border-emerald-500 bg-slate-800 text-white focus:ring-2 focus:ring-emerald-400'
                    : rawInput
                    ? 'border-rose-500 bg-slate-800/80 text-rose-300 focus:ring-2 focus:ring-rose-400'
                    : 'border-slate-700 bg-slate-800 text-slate-200 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Quick Increment buttons */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onAdjust(1)}
                disabled={isAnimating}
                className="min-h-[44px] min-w-[42px] px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-40 text-xs font-mono font-bold border border-slate-700 transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                title={`${t.increaseBy} 0.01`}
                aria-label={`${t.increaseBy} 0.01`}
              >
                <Plus size={13} className="mr-0.5" /> 0.01
              </button>
              <button
                type="button"
                onClick={() => onAdjust(10)}
                disabled={isAnimating}
                className="min-h-[44px] min-w-[42px] px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-40 text-xs font-mono font-bold border border-slate-700 transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                title={`${t.increaseBy} 0.10`}
                aria-label={`${t.increaseBy} 0.10`}
              >
                +0.10
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: Actions */}
        <div className="flex items-center gap-2 w-full justify-center">
          {hasFinished ? (
            <>
              <button
                type="button"
                onClick={onRetry}
                className="min-h-[44px] flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-sm text-slate-200 hover:text-white transition shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <RotateCcw size={16} />
                <span>{t.retry}</span>
              </button>

              {isGoal ? (
                isLast ? (
                  <button
                    type="button"
                    onClick={onReplayGame}
                    className="min-h-[44px] flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <Trophy size={16} />
                    <span>{t.playAgain}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onAdvancePhase}
                    className="min-h-[44px] flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <span>{t.advanceToPhase} {currentPhase + 1} ({nextPhaseName})</span>
                    <ArrowRight size={16} />
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={onNewRound}
                  className="min-h-[44px] flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white transition shadow-lg shadow-blue-900/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <RefreshCw size={16} />
                  <span>{t.nextPass}</span>
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onLaunch}
              disabled={!isValid || isAnimating}
              className={`min-h-[44px] w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-base transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isValid && !isAnimating
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 shadow-emerald-950/50'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Play size={18} className="fill-current" />
              <span>{isAnimating ? t.launching : t.launch}</span>
            </button>
          )}
        </div>
      </div>

      {/* Validation or Result Status Feedback Line */}
      <div className="mt-2.5 text-xs flex items-center gap-1.5 justify-center sm:justify-start">
        {validationError ? (
          <span className="text-rose-400 flex items-center gap-1 font-medium">
            <AlertCircle size={14} />
            {validationError}
          </span>
        ) : isGoal ? (
          isLast ? (
            <span className="text-amber-300 flex items-center gap-1 font-bold">
              <Trophy size={14} className="text-amber-400" />
              {t.championSuccess}
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 size={14} />
              {t.goalSuccess}
            </span>
          )
        ) : phase === 'miss_short' ? (
          <span className="text-rose-400 flex items-center gap-1 font-medium">
            <AlertCircle size={14} />
            {t.missShort}
          </span>
        ) : phase === 'miss_long' ? (
          <span className="text-rose-400 flex items-center gap-1 font-medium">
            <AlertCircle size={14} />
            {t.missLong}
          </span>
        ) : (
          <span className="text-slate-400">
            {t.tip}
          </span>
        )}
      </div>
    </div>
  );
};

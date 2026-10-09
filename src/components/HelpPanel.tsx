import React from 'react';
import { Calculator, ArrowRight, Check } from 'lucide-react';
import { RoundConfig } from '../game/types.ts';
import { Translations } from '../game/i18n.ts';

interface HelpPanelProps {
  config: RoundConfig;
  onUseCalculatedValue: (val: number) => void;
  t: Translations;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({
  config,
  onUseCalculatedValue,
  t,
}) => {
  const { a, b, targetHundredths, isIntegerTriple, formattedApprox } = config;
  const aSq = a * a;
  const bSq = b * b;
  const sumSq = aSq + bSq;

  return (
    <div
      role="region"
      aria-label={t.theoremTitle}
      className="w-full max-w-4xl bg-slate-900/95 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl text-white"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Step-by-step formula */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
              <Calculator size={18} />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              {t.theoremTitle}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm font-mono bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-300">C² = A² + B²</span>
            <ArrowRight size={14} className="text-slate-500" />
            <span className="text-amber-400">C² = {a}² + {b}²</span>
            <ArrowRight size={14} className="text-slate-500" />
            <span className="text-cyan-400">C² = {aSq} + {bSq} = {sumSq}</span>
            <ArrowRight size={14} className="text-slate-500" />
            <span className="text-emerald-400 font-bold">
              C = √{sumSq} {isIntegerTriple ? `= ${targetHundredths / 100}` : `≈ ${formattedApprox}`}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            {isIntegerTriple ? (
              <span className="text-emerald-300 font-medium">
                🎯 {t.pythagoreanTripleNote} ({targetHundredths / 100}).
              </span>
            ) : (
              <span className="text-amber-300 font-medium">
                📐 √{sumSq} — {t.irrationalApproxNote}: <strong>{formattedApprox}</strong>.
              </span>
            )}
          </p>
        </div>

        {/* Action: Use calculated value */}
        <div className="flex flex-col sm:flex-row md:flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onUseCalculatedValue(targetHundredths)}
            className="min-h-[44px] w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Check size={16} strokeWidth={3} />
            <span>{t.useCalculated} ({formattedApprox})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

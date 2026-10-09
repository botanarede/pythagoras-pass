/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { PitchCanvas } from './components/PitchCanvas.tsx';
import { ControlsPanel } from './components/ControlsPanel.tsx';
import { HelpPanel } from './components/HelpPanel.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import {
  Difficulty,
  RoundConfig,
  RoundPhase,
} from './game/types.ts';
import {
  GamePhaseId,
  getPhaseTheme,
  getNextPhase,
} from './game/themes.ts';
import {
  Language,
  getTranslations,
} from './game/i18n.ts';
import {
  computeReferenceHypotenuse,
  parseHundredths,
  formatHundredths,
  adjustHundredths,
  generateRoundPair,
  evaluatePass,
} from './game/math.ts';

export default function App() {
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [currentPhase, setCurrentPhase] = useState<GamePhaseId>(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [roundConfig, setRoundConfig] = useState<RoundConfig>(() =>
    createRoundConfig('easy', null)
  );

  const [rawInput, setRawInput] = useState<string>('');
  const [enteredHundredths, setEnteredHundredths] = useState<number | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [phase, setPhase] = useState<RoundPhase>('idle');
  const [animationProgress, setAnimationProgress] = useState<number>(0);

  const t = getTranslations(language);
  const activeTheme = getPhaseTheme(currentPhase);
  const nextPhaseId = getNextPhase(currentPhase);
  const nextTheme = nextPhaseId ? getPhaseTheme(nextPhaseId) : null;

  // Sync document language attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Animation frame reference for clean lifecycle cancellation
  const animFrameRef = useRef<number | null>(null);
  const animStartTimeRef = useRef<number | null>(null);

  // Stop running animation loop
  const cancelRunningAnimation = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    animStartTimeRef.current = null;
  }, []);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      cancelRunningAnimation();
    };
  }, [cancelRunningAnimation]);

  // Handle direct text changes in input
  const handleInputChange = (val: string) => {
    setRawInput(val);
    const parsed = parseHundredths(val);
    if (parsed.valid && parsed.hundredths !== undefined) {
      setEnteredHundredths(parsed.hundredths);
    } else {
      setEnteredHundredths(null);
    }
  };

  // Handle step adjustments (+- 0.01 or +- 0.10)
  const handleAdjust = (delta: number) => {
    const base = enteredHundredths !== null ? enteredHundredths : roundConfig.targetHundredths;
    const nextVal = adjustHundredths(base, delta);
    setEnteredHundredths(nextVal);
    setRawInput(formatHundredths(nextVal));
  };

  // Quick action from Help panel: fill the exact calculated answer
  const handleUseCalculatedValue = (targetVal: number) => {
    setEnteredHundredths(targetVal);
    setRawInput(formatHundredths(targetVal));
  };

  // Change difficulty
  const handleSelectDifficulty = (newDiff: Difficulty) => {
    if (newDiff === difficulty) return;
    setDifficulty(newDiff);
    cancelRunningAnimation();
    const newConfig = createRoundConfig(newDiff, { a: roundConfig.a, b: roundConfig.b });
    setRoundConfig(newConfig);
    setRawInput('');
    setEnteredHundredths(null);
    setPhase('idle');
    setAnimationProgress(0);
  };

  // Start new round with fresh pair
  const handleNewRound = () => {
    cancelRunningAnimation();
    const newConfig = createRoundConfig(difficulty, { a: roundConfig.a, b: roundConfig.b });
    setRoundConfig(newConfig);
    setRawInput('');
    setEnteredHundredths(null);
    setPhase('idle');
    setAnimationProgress(0);
  };

  // Retry current round (keeps A, B and position)
  const handleRetry = () => {
    cancelRunningAnimation();
    setPhase('idle');
    setAnimationProgress(0);
  };

  // Advance to next cosmetic phase upon goal
  const handleAdvancePhase = () => {
    cancelRunningAnimation();
    if (nextPhaseId) {
      setCurrentPhase(nextPhaseId);
      const newConfig = createRoundConfig(difficulty, { a: roundConfig.a, b: roundConfig.b });
      setRoundConfig(newConfig);
      setRawInput('');
      setEnteredHundredths(null);
      setPhase('idle');
      setAnimationProgress(0);
    }
  };

  // Replay game from Phase 1 after finishing Phase 3
  const handleReplayGame = () => {
    cancelRunningAnimation();
    setCurrentPhase(1);
    const newConfig = createRoundConfig(difficulty, { a: roundConfig.a, b: roundConfig.b });
    setRoundConfig(newConfig);
    setRawInput('');
    setEnteredHundredths(null);
    setPhase('idle');
    setAnimationProgress(0);
  };

  // Launch the ball pass
  const handleLaunch = () => {
    if (enteredHundredths === null || phase === 'passing' || phase === 'shooting') {
      return;
    }

    cancelRunningAnimation();
    setPhase('passing');
    setAnimationProgress(0);

    const outcome = evaluatePass(enteredHundredths, roundConfig.targetHundredths);
    const passDuration = 1000; // 1s pass flight
    const shootDuration = 600; // 0.6s striker shot

    const animatePass = (timestamp: number) => {
      if (!animStartTimeRef.current) {
        animStartTimeRef.current = timestamp;
      }
      const elapsed = timestamp - animStartTimeRef.current;
      const progress = Math.min(1, elapsed / passDuration);
      setAnimationProgress(progress);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animatePass);
      } else {
        // Pass completed its trajectory
        animStartTimeRef.current = null;
        if (outcome === 'success') {
          // Attacker receives and shoots to goal
          setPhase('shooting');
          const animateShot = (shotTime: number) => {
            if (!animStartTimeRef.current) {
              animStartTimeRef.current = shotTime;
            }
            const shotElapsed = shotTime - animStartTimeRef.current;
            const shotProgress = Math.min(1, shotElapsed / shootDuration);
            setAnimationProgress(shotProgress);

            if (shotProgress < 1) {
              animFrameRef.current = requestAnimationFrame(animateShot);
            } else {
              setPhase('goal');
              animStartTimeRef.current = null;
            }
          };
          animFrameRef.current = requestAnimationFrame(animateShot);
        } else {
          // Missed pass
          setPhase(outcome);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animatePass);
  };

  // Validation status
  const parsed = parseHundredths(rawInput);
  let validationError: string | undefined;
  if (rawInput.trim() !== '') {
    if (parsed.error === 'negative') {
      validationError = t.errors.negative;
    } else if (parsed.error === 'malformed') {
      validationError = t.errors.malformed;
    } else if (parsed.error === 'excessive_precision') {
      validationError = t.errors.excessivePrecision;
    } else if (parsed.error === 'out_of_bounds') {
      validationError = t.errors.outOfBounds;
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-start sm:py-4 sm:px-4 font-sans select-none antialiased">
      {/* Offline Connectivity Notification */}
      <OfflineIndicator language={language} />

      {/* Mobile Stage Shell (Smartphone framed on desktop, edge-to-edge on mobile) */}
      <div className="w-full max-w-[460px] min-h-[100dvh] sm:min-h-0 sm:my-auto flex flex-col bg-slate-900 border-x sm:border border-slate-800/80 sm:rounded-3xl sm:shadow-2xl overflow-x-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
        {/* 1. Header Region */}
        <Header
          difficulty={difficulty}
          onSelectDifficulty={handleSelectDifficulty}
          isHelpOpen={isHelpOpen}
          onToggleHelp={() => setIsHelpOpen((prev) => !prev)}
          currentPhase={currentPhase}
          phaseName={`Fase ${currentPhase}: ${activeTheme.name}`}
          stadiumName={activeTheme.stadiumName}
          language={language}
          onSelectLanguage={setLanguage}
          t={t}
        />

        {/* Screen Reader Live Region for Announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {phase === 'goal'
            ? (currentPhase === 3 ? t.championSuccess : t.goalSuccess)
            : phase === 'miss_short'
            ? t.missShort
            : phase === 'miss_long'
            ? t.missLong
            : ''}
        </div>

        {/* 2. Main Game Viewport Region (Scene + Controls) */}
        <main className="flex-1 w-full px-3 py-2.5 sm:px-4 sm:py-3 flex flex-col items-center gap-3">
          {/* Pitch Stage */}
          <PitchCanvas
            config={roundConfig}
            phase={phase}
            animationProgress={animationProgress}
            enteredHundredths={enteredHundredths}
            isHelpOpen={isHelpOpen}
            theme={activeTheme}
            t={t}
          />

          {/* Learning / Formula Panel (Revealed when help is toggled) */}
          {isHelpOpen && (
            <HelpPanel
              config={roundConfig}
              onUseCalculatedValue={handleUseCalculatedValue}
              t={t}
            />
          )}

          {/* Controls Region */}
          <ControlsPanel
            rawInput={rawInput}
            onChangeInput={handleInputChange}
            onAdjust={handleAdjust}
            onLaunch={handleLaunch}
            onRetry={handleRetry}
            onNewRound={handleNewRound}
            onAdvancePhase={handleAdvancePhase}
            onReplayGame={handleReplayGame}
            phase={phase}
            currentPhase={currentPhase}
            nextPhaseName={nextTheme?.name || null}
            isValid={parsed.valid && enteredHundredths !== null}
            validationError={validationError}
            t={t}
          />
        </main>

        {/* Footer */}
        <footer className="text-center py-2 text-xs text-slate-500 border-t border-slate-800/80">
          {t.footer} &bull; &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

// Helper to generate full round configuration
function createRoundConfig(
  difficulty: Difficulty,
  prev: { a: number; b: number } | null
): RoundConfig {
  const { a, b } = generateRoundPair(difficulty, prev);
  const mathRef = computeReferenceHypotenuse(a, b);
  const passerSide = Math.random() > 0.5 ? 'left' : 'right';

  return {
    a,
    b,
    targetHundredths: mathRef.targetHundredths,
    referenceHypotenuse: mathRef.hypotenuse,
    isIntegerTriple: mathRef.isIntegerTriple,
    formattedApprox: mathRef.formattedApprox,
    passerSide,
  };
}

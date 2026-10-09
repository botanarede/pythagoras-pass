# Slice 003: Complete Internationalization & Accessibility - Design

## 1. Localization Architecture (`src/game/i18n.ts`)
```typescript
export type Language = 'pt-BR' | 'en' | 'es';

export interface Translations {
  title: string;
  subtitle: string;
  easy: string;
  hard: string;
  showHelp: string;
  hideHelp: string;
  passDistance: string;
  inputPlaceholder: string;
  decreaseBy: string; // e.g. "Decrease by {val}"
  increaseBy: string; // e.g. "Increase by {val}"
  launch: string;
  launching: string;
  retry: string;
  nextPass: string;
  advanceToPhase: string; // "Advance to Phase {n} ({name})"
  playAgain: string;
  goalSuccess: string;
  championSuccess: string;
  missShort: string;
  missLong: string;
  tip: string;
  theoremTitle: string;
  pythagoreanTripleNote: string;
  irrationalApproxNote: string;
  useCalculated: string;
  errors: {
    negative: string;
    malformed: string;
    excessivePrecision: string;
    outOfBounds: string;
  };
  canvasLabel: string;
  passerLabel: string;
  attackerLabel: string;
  footer: string;
}
```

A lightweight pure translation dictionary `DICTIONARIES: Record<Language, Translations>` with typed accessor `getTranslations(lang: Language): Translations`.

## 2. Accessibility Engineering (WCAG 2.1 AA)
1. **Zero-Answer Leakage Invariant**:
   - Canvas `aria-label`: "Campo de futebol com passador e atacante separados pelos catetos A e B. Calcule a distância do passe C." (Does not reveal C!).
   - When Help is Shown: Help region contains `role="region"` and `aria-label="Explicação do Teorema de Pitágoras"`.
2. **Screen Reader Live Announcements**:
   - `<div aria-live="polite" aria-atomic="true" className="sr-only">...</div>`
   - Announces phase outcomes when phase changes.
3. **Keyboard & Focus Ring Consistency**:
   - `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900` on all interactive buttons and inputs.
4. **Color-Independent Status**:
   - Every status message is accompanied by clear semantic icons (`CheckCircle2`, `AlertCircle`, `Trophy`) and explicit descriptive text.

## 3. Test Strategy
1. Unit tests in `tests/i18n.test.ts`:
   - Validates completeness of dictionary keys across all 3 languages (no missing keys).
   - Validates that translations preserve correct mathematical and football terminology.
2. Accessibility unit tests in `tests/accessibility.test.ts`:
   - Validates that hidden mode accessibility strings do not contain reference answers or square root solutions.
   - Validates screen reader live region announcements and ARIA attributes.

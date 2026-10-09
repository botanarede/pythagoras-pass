# Slice 002: Complete Round Lifecycle & Three Themes - Design

## Architecture & Data Contracts

### 1. Phase Configuration Model
We define a clean phase theme system in `src/game/themes.ts`:
```typescript
export type GamePhaseId = 1 | 2 | 3;

export interface PhaseTheme {
  id: GamePhaseId;
  name: string; // "Bahia", "Flamengo", "Cruzeiro"
  stadiumName: string; // "Arena Fonte Nova", "Maracanã", "Mineirão"
  timeOfDay: 'day' | 'sunset' | 'night';
  grassBaseColor: string;
  grassStripeColor: string;
  skyColor: string;
  bannerColors: string[]; // perimeter banner segments
  passerJersey: string;
  passerShorts: string;
  passerTrim: string;
  attackerJersey: string;
  attackerShorts: string;
  attackerTrim: string;
}
```

### 2. State Machine & Round Lifecycle
```typescript
export interface GameSessionState {
  currentPhase: GamePhaseId;
  difficulty: Difficulty;
  isGameComplete: boolean;
  roundConfig: RoundConfig;
  enteredHundredths: number | null;
  rawInput: string;
  isHelpOpen: boolean;
  phase: RoundPhase; // 'idle' | 'passing' | 'shooting' | 'goal' | 'miss_short' | 'miss_long'
  animationProgress: number;
}
```

- When in Phase 1 (Bahia) and goal is scored: Button displays "Avançar para Fase 2 (Flamengo)".
- When in Phase 2 (Flamengo) and goal is scored: Button displays "Avançar para Fase 3 (Cruzeiro)".
- When in Phase 3 (Cruzeiro) and goal is scored: Button displays "Parabéns! Jogar Novamente" (reset to Phase 1, `isGameComplete: true`).
- Retry preserves current $(A, B)$, player placement, and PhaseId.
- Difficulty toggle applies to subsequent fresh rounds.

### 3. Rendering Integration in `PitchCanvas.tsx`
- Background stadium perimeter draws appropriate banners and atmospheric lighting depending on `timeOfDay`:
  - Day: Clean sunlight with bright green pitch.
  - Sunset: Warm amber-tinted stadium glow, sunset grass with red/black striped perimeter.
  - Night: Deep midnight stands, geometric floodlight reflectors at perimeter, royal blue & white banners.
- Player sprites render custom team jersey & trim matching the phase theme while keeping identical proportions and anchor points.

### 4. Test Strategy
- Unit tests in `tests/lifecycle.test.ts`:
  - Test phase sequence 1 -> 2 -> 3 -> 1.
  - Test theme definition contracts and color invariants.
  - Test that difficulty bounds and mathematical evaluation remain strictly unchanged across all phases.
  - Test retry preservation of $(A, B)$ across all phases.
- Unit & layout regression tests (`tests/math.test.ts`, `tests/geometry.test.ts`, `tests/layout.test.ts`, `tests/penaltyArc.test.ts`) must all continue passing.

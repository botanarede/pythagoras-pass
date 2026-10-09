# Slice 001: Playable Foundation - Design

## Architecture Overview
The application is structured into decoupled pure domain modules and React presentation components:
1. `src/game/math.ts`: Pure mathematics for right triangles, integer hundredths parsing/formatting, bounds validation, and generation.
2. `src/game/geometry.ts`: Uniform scale coordinate projection, player anchor points, trajectory vectors, and right-triangle vertex calculation.
3. `src/game/types.ts`: TypeScript contracts for game state, round, trajectory, and animation states.
4. `src/components/PitchCanvas.tsx`: High-DPR, zero-distortion HTML5 Canvas 2D renderer. Draws pitch lines, goal, team banners, players, triangle legs, right-angle symbol, guide/preview (when enabled), and animated ball flight with height arc and ground shadow.
5. `src/components/ControlsPanel.tsx`: Accessible input controls, $\pm0.01$ and $\pm0.10$ adjustments, validation feedback, Launch and Reset/Retry buttons.
6. `src/components/HelpPanel.tsx`: Formula explanation, Pythagorean theorem step-by-step substitution, approximation notes, and "Usar valor calculado".
7. `src/components/Header.tsx`: Title, subtitle with RALECAB GAMES branding, difficulty toggle, and Show/Hide toggle.

## Data Contracts

```typescript
export type Difficulty = 'easy' | 'hard';

export interface RoundConfig {
  a: number; // Horizontal leg (1..10 or 11..30)
  b: number; // Vertical leg (1..10 or 11..30)
  targetHundredths: number; // Math.round(Math.hypot(a, b) * 100)
  referenceHypotenuse: number; // Math.hypot(a, b)
  isIntegerTriple: boolean; // Number.isInteger(referenceHypotenuse)
  passerSide: 'left' | 'right'; // Safe orientation variation
}

export type RoundPhase = 'idle' | 'passing' | 'shooting' | 'goal' | 'miss_short' | 'miss_long';

export interface RoundState {
  config: RoundConfig;
  difficulty: Difficulty;
  enteredHundredths: number | null; // null if empty
  rawInputString: string;
  isHelpOpen: boolean;
  phase: RoundPhase;
  animationProgress: number; // 0..1
}
```

## Uniform Projection System
Let pitch logical dimensions be fixed, e.g., $W_L = 100$ meters, $H_L = 120$ meters (or half-pitch $100 \times 80$).
Scale $S = \min(W_{\text{canvas}} / W_L, H_{\text{canvas}} / H_L)$.
Offset $X_0 = (W_{\text{canvas}} - S \cdot W_L) / 2$, $Y_0 = (H_{\text{canvas}} - S \cdot H_L) / 2$.
Horizontal distance is strictly $S \cdot A$.
Vertical distance is strictly $S \cdot B$.
Diagonal distance is strictly $S \cdot \sqrt{A^2 + B^2}$.
Aspect ratio is guaranteed 1:1 with zero distortion.

## Test Strategy
- Vitest unit tests in `tests/math.test.ts` verifying all requirements:
  - Exact triples (3, 4 -> 5.00)
  - Irrational hypotenuses (2, 3 -> ~3.61)
  - Hard mode values (20, 21 -> 29.00)
  - Hundredths conversion and locale parsing (`3,61` and `3.61`)
  - Increments and decrements
  - Boundary and validation checks
- Vitest unit tests in `tests/geometry.test.ts` verifying uniform scaling and trajectory vectors.
- Ralph loop script `scripts/ralph-loop.mjs` verifying lint, tests, build, and requirements traceability.

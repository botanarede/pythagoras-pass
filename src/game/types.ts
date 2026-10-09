export type Difficulty = 'easy' | 'hard';

export interface RoundConfig {
  a: number; // Horizontal leg
  b: number; // Vertical leg
  targetHundredths: number; // Math.round(hypot(a, b) * 100)
  referenceHypotenuse: number; // full precision Math.hypot(a, b)
  isIntegerTriple: boolean;
  formattedApprox: string; // e.g. "5.00" or "3.61"
  passerSide: 'left' | 'right';
}

export type PassOutcome = 'success' | 'miss_short' | 'miss_long';

export type RoundPhase =
  | 'idle'
  | 'passing'
  | 'shooting'
  | 'goal'
  | 'miss_short'
  | 'miss_long';

export interface ParseResult {
  valid: boolean;
  hundredths?: number;
  error?: 'empty' | 'negative' | 'malformed' | 'excessive_precision' | 'out_of_bounds';
}

export interface RoundState {
  config: RoundConfig;
  difficulty: Difficulty;
  enteredHundredths: number | null;
  rawInput: string;
  isHelpOpen: boolean;
  phase: RoundPhase;
  animationProgress: number; // 0 to 1
  attemptCount: number;
}

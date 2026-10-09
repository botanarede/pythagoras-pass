import { Difficulty, ParseResult, PassOutcome } from './types.ts';

export function computeReferenceHypotenuse(a: number, b: number) {
  const hypotenuse = Math.hypot(a, b);
  const targetHundredths = Math.round(hypotenuse * 100);
  const isIntegerTriple = Number.isInteger(hypotenuse);
  const formattedApprox = (targetHundredths / 100).toFixed(2);

  return {
    hypotenuse,
    targetHundredths,
    isIntegerTriple,
    formattedApprox,
  };
}

export function parseHundredths(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: 'empty' };
  }

  // Check for negative
  if (trimmed.startsWith('-')) {
    return { valid: false, error: 'negative' };
  }

  // Standardize comma to dot
  const normalized = trimmed.replace(',', '.');

  // Validate format: positive number with at most 2 decimal digits
  const regex = /^\d+(\.\d+)?$/;
  if (!regex.test(normalized)) {
    return { valid: false, error: 'malformed' };
  }

  const parts = normalized.split('.');
  if (parts.length === 2 && parts[1].length > 2) {
    return { valid: false, error: 'excessive_precision' };
  }

  const num = parseFloat(normalized);
  if (!Number.isFinite(num) || num <= 0) {
    return { valid: false, error: 'malformed' };
  }

  const hundredths = Math.round(num * 100);

  // Upper bound check (e.g. 100 meters / 10000 hundredths)
  if (hundredths > 10000) {
    return { valid: false, error: 'out_of_bounds' };
  }

  return {
    valid: true,
    hundredths,
  };
}

export function formatHundredths(hundredths: number): string {
  return (hundredths / 100).toFixed(2);
}

export function adjustHundredths(current: number, delta: number): number {
  const next = current + delta;
  const clamped = Math.max(1, Math.min(10000, next));
  return clamped;
}

export function generateRoundPair(
  difficulty: Difficulty,
  previousPair: { a: number; b: number } | null
): { a: number; b: number } {
  const min = difficulty === 'easy' ? 1 : 11;
  const max = difficulty === 'easy' ? 10 : 30;

  for (let attempt = 0; attempt < 100; attempt++) {
    const a = Math.floor(Math.random() * (max - min + 1)) + min;
    const b = Math.floor(Math.random() * (max - min + 1)) + min;

    if (previousPair) {
      const isDuplicate =
        (a === previousPair.a && b === previousPair.b) ||
        (a === previousPair.b && b === previousPair.a);
      if (isDuplicate) {
        continue;
      }
    }

    return { a, b };
  }

  // Fallback safe defaults if all attempts somehow clash
  return difficulty === 'easy' ? { a: 3, b: 4 } : { a: 20, b: 21 };
}

export function evaluatePass(
  enteredHundredths: number,
  targetHundredths: number
): PassOutcome {
  if (enteredHundredths === targetHundredths) {
    return 'success';
  }
  if (enteredHundredths < targetHundredths) {
    return 'miss_short';
  }
  return 'miss_long';
}

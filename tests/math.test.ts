import { describe, it, expect } from 'vitest';
import {
  computeReferenceHypotenuse,
  parseHundredths,
  formatHundredths,
  adjustHundredths,
  generateRoundPair,
  evaluatePass,
} from '../src/game/math.ts';

describe('Math Engine - Hypotenuse & Acceptance Contract', () => {
  it('computes exact integer triple A=3, B=4 with targetHundredths=500', () => {
    const res = computeReferenceHypotenuse(3, 4);
    expect(res.hypotenuse).toBe(5);
    expect(res.targetHundredths).toBe(500);
    expect(res.isIntegerTriple).toBe(true);
    expect(res.formattedApprox).toBe('5.00');
  });

  it('computes irrational hypotenuse A=2, B=3 with targetHundredths=361 and approx flag', () => {
    const res = computeReferenceHypotenuse(2, 3);
    expect(res.hypotenuse).toBeCloseTo(3.605551275, 5);
    expect(res.targetHundredths).toBe(361);
    expect(res.isIntegerTriple).toBe(false);
    expect(res.formattedApprox).toBe('3.61');
  });

  it('computes hard mode triple A=20, B=21 with targetHundredths=2900', () => {
    const res = computeReferenceHypotenuse(20, 21);
    expect(res.hypotenuse).toBe(29);
    expect(res.targetHundredths).toBe(2900);
    expect(res.isIntegerTriple).toBe(true);
    expect(res.formattedApprox).toBe('29.00');
  });
});

describe('Input Parsing & Hundredths Representation', () => {
  it('parses dot decimal separator "3.61" as 361 hundredths', () => {
    const parsed = parseHundredths('3.61');
    expect(parsed.valid).toBe(true);
    expect(parsed.hundredths).toBe(361);
  });

  it('parses comma decimal separator "3,61" as 361 hundredths', () => {
    const parsed = parseHundredths('3,61');
    expect(parsed.valid).toBe(true);
    expect(parsed.hundredths).toBe(361);
  });

  it('parses whole integer "5" as 500 hundredths', () => {
    const parsed = parseHundredths('5');
    expect(parsed.valid).toBe(true);
    expect(parsed.hundredths).toBe(500);
  });

  it('parses single decimal digit "3.6" as 360 hundredths', () => {
    const parsed = parseHundredths('3.6');
    expect(parsed.valid).toBe(true);
    expect(parsed.hundredths).toBe(360);
  });

  it('rejects empty input without throwing', () => {
    const parsed = parseHundredths('');
    expect(parsed.valid).toBe(false);
    expect(parsed.error).toBe('empty');
  });

  it('rejects negative numbers and malformed characters', () => {
    expect(parseHundredths('-5').valid).toBe(false);
    expect(parseHundredths('abc').valid).toBe(false);
    expect(parseHundredths('3.6.1').valid).toBe(false);
  });

  it('rejects excessive precision (more than 2 decimal places)', () => {
    const parsed = parseHundredths('3.619');
    expect(parsed.valid).toBe(false);
    expect(parsed.error).toBe('excessive_precision');
  });

  it('formats hundredths back to standard string display', () => {
    expect(formatHundredths(361)).toBe('3.61');
    expect(formatHundredths(500)).toBe('5.00');
    expect(formatHundredths(1)).toBe('0.01');
  });

  it('adjusts hundredths accurately by delta avoiding floating point drift', () => {
    expect(adjustHundredths(500, 1)).toBe(501);
    expect(adjustHundredths(500, -1)).toBe(499);
    expect(adjustHundredths(500, 10)).toBe(510);
    expect(adjustHundredths(500, -10)).toBe(490);
    // Boundary clamp: minimum 1 (0.01)
    expect(adjustHundredths(2, -10)).toBe(1);
  });
});

describe('Round Pair Generation & Difficulty Constraints', () => {
  it('generates easy difficulty within [1..10]', () => {
    for (let i = 0; i < 20; i++) {
      const pair = generateRoundPair('easy', null);
      expect(pair.a).toBeGreaterThanOrEqual(1);
      expect(pair.a).toBeLessThanOrEqual(10);
      expect(pair.b).toBeGreaterThanOrEqual(1);
      expect(pair.b).toBeLessThanOrEqual(10);
    }
  });

  it('generates hard difficulty within [11..30]', () => {
    for (let i = 0; i < 20; i++) {
      const pair = generateRoundPair('hard', null);
      expect(pair.a).toBeGreaterThanOrEqual(11);
      expect(pair.a).toBeLessThanOrEqual(30);
      expect(pair.b).toBeGreaterThanOrEqual(11);
      expect(pair.b).toBeLessThanOrEqual(30);
    }
  });

  it('does not repeat immediately previous pair or its swapped equivalent', () => {
    const prev = { a: 3, b: 4 };
    for (let i = 0; i < 30; i++) {
      const pair = generateRoundPair('easy', prev);
      const isSame = (pair.a === 3 && pair.b === 4) || (pair.a === 4 && pair.b === 3);
      expect(isSame).toBe(false);
    }
  });
});

describe('Pass Evaluation Contract', () => {
  it('evaluates exact match as success', () => {
    expect(evaluatePass(500, 500)).toBe('success');
    expect(evaluatePass(361, 361)).toBe('success');
  });

  it('evaluates shorter input as miss_short', () => {
    expect(evaluatePass(499, 500)).toBe('miss_short');
    expect(evaluatePass(300, 361)).toBe('miss_short');
  });

  it('evaluates longer input as miss_long', () => {
    expect(evaluatePass(501, 500)).toBe('miss_long');
    expect(evaluatePass(400, 361)).toBe('miss_long');
  });
});

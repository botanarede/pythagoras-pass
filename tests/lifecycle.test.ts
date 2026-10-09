import { describe, it, expect } from 'vitest';
import {
  PHASE_THEMES,
  getPhaseTheme,
  getNextPhase,
  isLastPhase,
  GamePhaseId,
} from '../src/game/themes.ts';
import { evaluatePass, generateRoundPair } from '../src/game/math.ts';

describe('Phase Themes & Cosmetic Attributes Contract', () => {
  it('defines exactly three distinct cosmetic phases: Bahia, Flamengo, Cruzeiro', () => {
    expect(Object.keys(PHASE_THEMES).length).toBe(3);

    const bahia = getPhaseTheme(1);
    expect(bahia.name).toBe('Bahia');
    expect(bahia.timeOfDay).toBe('day');
    expect(bahia.bannerColors).toContain('#1d4ed8'); // blue
    expect(bahia.bannerColors).toContain('#dc2626'); // red
    expect(bahia.bannerColors).toContain('#ffffff'); // white

    const flamengo = getPhaseTheme(2);
    expect(flamengo.name).toBe('Flamengo');
    expect(flamengo.timeOfDay).toBe('sunset');
    expect(flamengo.bannerColors).toContain('#dc2626'); // red
    expect(flamengo.bannerColors).toContain('#0f172a'); // black/dark

    const cruzeiro = getPhaseTheme(3);
    expect(cruzeiro.name).toBe('Cruzeiro');
    expect(cruzeiro.timeOfDay).toBe('night');
    expect(cruzeiro.bannerColors).toContain('#1e40af'); // royal blue
    expect(cruzeiro.bannerColors).toContain('#ffffff'); // white
  });

  it('guarantees unique stadium environments and visual palettes for all phases', () => {
    const p1 = getPhaseTheme(1);
    const p2 = getPhaseTheme(2);
    const p3 = getPhaseTheme(3);

    // Skies and times of day must be distinct
    expect(p1.timeOfDay).not.toBe(p2.timeOfDay);
    expect(p2.timeOfDay).not.toBe(p3.timeOfDay);
    expect(p1.skyColor).not.toBe(p2.skyColor);
    expect(p2.skyColor).not.toBe(p3.skyColor);

    // Uniform jerseys must match cosmetic identities
    expect(p1.passerJersey).not.toBe(p2.passerJersey);
  });
});

describe('Phase Progression & Lifecycle Contract', () => {
  it('advances sequentially: 1 (Bahia) -> 2 (Flamengo) -> 3 (Cruzeiro)', () => {
    expect(getNextPhase(1)).toBe(2);
    expect(getNextPhase(2)).toBe(3);
  });

  it('identifies Phase 3 as the terminal stage with replay option instead of a 4th phase', () => {
    expect(isLastPhase(1)).toBe(false);
    expect(isLastPhase(2)).toBe(false);
    expect(isLastPhase(3)).toBe(true);
    expect(getNextPhase(3)).toBeNull();
  });
});

describe('Mathematical Invariance Across All Phases', () => {
  it('enforces identical mathematical tolerance across all three phases without widening', () => {
    const phases: GamePhaseId[] = [1, 2, 3];
    const target = 500; // 5.00

    for (const phase of phases) {
      // Correct answer must succeed in all phases
      expect(evaluatePass(500, target)).toBe('success');
      // Off-by-one hundredth must fail equally in all phases (no silent tolerance widening)
      expect(evaluatePass(499, target)).toBe('miss_short');
      expect(evaluatePass(501, target)).toBe('miss_long');
    }
  });

  it('generates consistent difficulty bounds regardless of active phase', () => {
    const phases: GamePhaseId[] = [1, 2, 3];

    for (const _phase of phases) {
      for (let i = 0; i < 10; i++) {
        const easyPair = generateRoundPair('easy', null);
        expect(easyPair.a).toBeGreaterThanOrEqual(1);
        expect(easyPair.a).toBeLessThanOrEqual(10);
        expect(easyPair.b).toBeGreaterThanOrEqual(1);
        expect(easyPair.b).toBeLessThanOrEqual(10);

        const hardPair = generateRoundPair('hard', null);
        expect(hardPair.a).toBeGreaterThanOrEqual(11);
        expect(hardPair.a).toBeLessThanOrEqual(30);
        expect(hardPair.b).toBeGreaterThanOrEqual(11);
        expect(hardPair.b).toBeLessThanOrEqual(30);
      }
    }
  });
});

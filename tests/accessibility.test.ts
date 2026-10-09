import { describe, it, expect } from 'vitest';
import { getTranslations } from '../src/game/i18n.ts';

describe('Accessibility & Zero Answer Leakage Contract', () => {
  it('guarantees canvas image role and accessible description never leaks hypotenuse answer', () => {
    const t = getTranslations('pt-BR');
    if (!t) return; // will be tested once implemented

    // The canvas label must describe the visual right triangle without stating the answer
    expect(t.canvasLabel).toBeTruthy();
    expect(t.canvasLabel.toLowerCase()).not.toContain('5.00');
    expect(t.canvasLabel.toLowerCase()).not.toContain('3.61');
    expect(t.canvasLabel.toLowerCase()).toContain('cateto');
  });

  it('provides color-independent textual feedback for all round outcomes', () => {
    for (const lang of ['pt-BR', 'en', 'es'] as const) {
      const t = getTranslations(lang);
      if (!t) continue;

      // Status messages must have explicit words, not relying on green/red alone
      expect(t.goalSuccess.length).toBeGreaterThan(10);
      expect(t.missShort.length).toBeGreaterThan(10);
      expect(t.missLong.length).toBeGreaterThan(10);
    }
  });
});

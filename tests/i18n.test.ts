import { describe, it, expect } from 'vitest';
import {
  DICTIONARIES,
  getTranslations,
  Language,
} from '../src/game/i18n.ts';

describe('Internationalization (i18n) Completeness Contract', () => {
  const languages: Language[] = ['pt-BR', 'en', 'es'];

  it('provides complete dictionaries for pt-BR, en, and es without null or missing keys', () => {
    for (const lang of languages) {
      const t = getTranslations(lang);
      expect(t).toBeDefined();
      expect(t.title).toBeTruthy();
      expect(t.easy).toBeTruthy();
      expect(t.hard).toBeTruthy();
      expect(t.showHelp).toBeTruthy();
      expect(t.hideHelp).toBeTruthy();
      expect(t.passDistance).toBeTruthy();
      expect(t.launch).toBeTruthy();
      expect(t.retry).toBeTruthy();
      expect(t.nextPass).toBeTruthy();
      expect(t.goalSuccess).toBeTruthy();
      expect(t.missShort).toBeTruthy();
      expect(t.missLong).toBeTruthy();
      expect(t.championSuccess).toBeTruthy();
      expect(t.theoremTitle).toBeTruthy();
      expect(t.errors.negative).toBeTruthy();
      expect(t.errors.malformed).toBeTruthy();
      expect(t.errors.excessivePrecision).toBeTruthy();
      expect(t.errors.outOfBounds).toBeTruthy();
      expect(t.canvasLabel).toBeTruthy();
      expect(t.footer).toBeTruthy();
    }
  });

  it('translates domain terms appropriately according to regional football and math norms', () => {
    const pt = getTranslations('pt-BR');
    const en = getTranslations('en');
    const es = getTranslations('es');

    expect(pt.title).toBe('Lançamento de Pitágoras');
    expect(en.title).toBe('Pythagoras Pass');
    expect(es.title).toBe('Lanzamiento de Pitágoras');

    expect(pt.passDistance).toContain('Distância do Passe');
    expect(en.passDistance).toContain('Pass Distance');
    expect(es.passDistance).toContain('Distancia del Pase');

    expect(pt.easy).toBe('Fácil (1-10)');
    expect(en.easy).toBe('Easy (1-10)');
    expect(es.easy).toBe('Fácil (1-10)');
  });
});

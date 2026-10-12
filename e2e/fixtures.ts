import { test as base, Page } from '@playwright/test';

/**
 * PRNG Mulberry32 determinístico para substituir Math.random no navegador do teste
 * Garantindo geração repetível de rounds e posicionamento do passador
 */
export function getMulberry32InitScript(seed: number = 1337): string {
  return `
    (function() {
      let s = ${seed} >>> 0;
      Math.random = function() {
        let t = (s += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })();
  `;
}

/**
 * Fixture estendida com suporte a PRNG determinístico, relógio fixo e emulação PWA
 */
export const test = base.extend<{
  seededPage: (seed?: number) => Promise<Page>;
}>({
  seededPage: async ({ page }, use) => {
    const setup = async (seed: number = 1337) => {
      await page.addInitScript(getMulberry32InitScript(seed));
      return page;
    };
    await use(setup);
  },
});

export { expect } from '@playwright/test';

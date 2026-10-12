import { test, expect } from './fixtures.ts';

test.describe('PWA & Offline Deterministic Suite', () => {
  test('[E2E-PWA-01] Service Worker, Cache Storage e Operação Offline', async ({ page, context }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');

    // 1. Aguardar o registro do Service Worker
    const hasSW = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.ready;
      return !!reg;
    });
    expect(hasSW).toBe(true);

    // 2. Simular desconexão de rede via API oficial BrowserContext
    await context.setOffline(true);

    try {
      // 3. Recarregar a página em modo offline
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // 4. Interface e canvas devem continuar disponíveis
      const canvas = page.locator('canvas[role="img"]');
      await expect(canvas).toBeVisible();

      // 5. Controles continuam operacionais
      const inputC = page.locator('#input-c');
      await expect(inputC).toBeVisible();
    } finally {
      // Restaurar conectividade para testes subsequentes
      await context.setOffline(false);
    }
  });
});

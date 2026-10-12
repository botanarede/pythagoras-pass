import { test, expect } from './fixtures.ts';

test.describe('Visual Regression & Deterministic Snapshots Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Semente fixa determinística Mulberry32 para todos os cenários de snapshot
    await page.addInitScript(`
      (function() {
        let s = 987654321 >>> 0;
        Math.random = function() {
          let t = (s += 0x6D2B79F5);
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      })();
    `);
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
  });

  // 1. idle
  test('[E2E-VIS-01] scenario=idle: Estado inicial estático da cena', async ({ page }) => {
    const canvas = page.locator('canvas[role="img"]');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(500); // Aguarda flush visual
    // Snapshot comparativo (quando baselines estiverem aprovadas pelo mantenedor)
    if (process.env.PLAYWRIGHT_VISUAL_REGRESSION === 'true') {
      await expect(canvas).toHaveScreenshot('canvas-idle.png', { maxDiffPixels: 50 });
    }
  });

  // 2. formula
  test('[E2E-VIS-01] scenario=formula: Painel de fórmula expandido', async ({ page }) => {
    const helpBtn = page.getByRole('button', { name: /Ajuda|Help/i });
    await helpBtn.click();
    await expect(page.locator('text=A² + B² = C²')).toBeVisible();
    await page.waitForTimeout(300);
    if (process.env.PLAYWRIGHT_VISUAL_REGRESSION === 'true') {
      await expect(page.locator('canvas[role="img"]')).toHaveScreenshot('canvas-formula.png', { maxDiffPixels: 50 });
    }
  });

  // 3. miss_short
  test('[E2E-VIS-01] scenario=miss_short: Bola interrompida antes do atacante', async ({ page }) => {
    const inputC = page.locator('#input-c');
    await inputC.fill('0.10');
    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await launchBtn.click();
    await expect(page.getByText(/Passe Curto|Short Pass|Pase Corto/i)).toBeVisible({ timeout: 15_000 });
    if (process.env.PLAYWRIGHT_VISUAL_REGRESSION === 'true') {
      await expect(page.locator('canvas[role="img"]')).toHaveScreenshot('canvas-miss-short.png', { maxDiffPixels: 50 });
    }
  });

  // 4. miss_long
  test('[E2E-VIS-01] scenario=miss_long: Bola ultrapassando o atacante', async ({ page }) => {
    const inputC = page.locator('#input-c');
    await inputC.fill('50.00');
    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await launchBtn.click();
    await expect(page.getByText(/Passe Longo|Long Pass|Pase Largo/i)).toBeVisible({ timeout: 15_000 });
    if (process.env.PLAYWRIGHT_VISUAL_REGRESSION === 'true') {
      await expect(page.locator('canvas[role="img"]')).toHaveScreenshot('canvas-miss-long.png', { maxDiffPixels: 50 });
    }
  });

  // 5. goal
  test('[E2E-VIS-01] scenario=goal: Celebração de gol e bola na rede', async ({ page }) => {
    const helpBtn = page.getByRole('button', { name: /Ajuda|Help/i });
    await helpBtn.click();
    const quickFill = page.getByRole('button', { name: /Usar valor calculado|Use calculated value|Usar valor calculado/i });
    await quickFill.click();
    await helpBtn.click();

    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await launchBtn.click();
    await expect(page.getByText(/GOL!/i)).toBeVisible({ timeout: 15_000 });
    if (process.env.PLAYWRIGHT_VISUAL_REGRESSION === 'true') {
      await expect(page.locator('canvas[role="img"]')).toHaveScreenshot('canvas-goal.png', { maxDiffPixels: 50 });
    }
  });

  // 6. phase_transition
  test('[E2E-VIS-01] scenario=phase_transition: Transição para a Fase 2 (Flamengo)', async ({ page }) => {
    const helpBtn = page.getByRole('button', { name: /Ajuda|Help/i });
    await helpBtn.click();
    const quickFill = page.getByRole('button', { name: /Usar valor calculado|Use calculated value|Usar valor calculado/i });
    await quickFill.click();
    await helpBtn.click();

    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await launchBtn.click();
    const advanceBtn = page.getByRole('button', { name: /Avançar|Advance|Avanzar/i });
    await expect(advanceBtn).toBeVisible({ timeout: 15_000 });
    await advanceBtn.click();

    // Fase 2 iniciada com novo tema
    await expect(page.getByText(/Fase 2/i)).toBeVisible();
    if (process.env.PLAYWRIGHT_VISUAL_REGRESSION === 'true') {
      await expect(page.locator('canvas[role="img"]')).toHaveScreenshot('canvas-phase2.png', { maxDiffPixels: 50 });
    }
  });

  // 7. champion
  test('[E2E-VIS-01] scenario=champion: Celebração de Campeão na Fase 3', async ({ page }) => {
    // Avançar até Fase 3
    for (let p = 1; p <= 2; p++) {
      const helpBtn = page.getByRole('button', { name: /Ajuda|Help/i });
      await helpBtn.click();
      const quickFill = page.getByRole('button', { name: /Usar valor calculado|Use calculated value|Usar valor calculado/i });
      await quickFill.click();
      await helpBtn.click();

      const launch = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
      await launch.click();
      const advanceBtn = page.getByRole('button', { name: /Avançar|Advance|Avanzar/i });
      await expect(advanceBtn).toBeVisible({ timeout: 15_000 });
      await advanceBtn.click();
    }

    // Completar Fase 3
    const helpBtn = page.getByRole('button', { name: /Ajuda|Help/i });
    await helpBtn.click();
    const quickFill = page.getByRole('button', { name: /Usar valor calculado|Use calculated value|Usar valor calculado/i });
    await quickFill.click();
    await helpBtn.click();

    const launch = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await launch.click();

    // Troféu de campeão visível
    const playAgainBtn = page.getByRole('button', { name: /Jogar Novamente|Play Again|Jugar de Nuevo/i });
    await expect(playAgainBtn).toBeVisible({ timeout: 15_000 });
    if (process.env.PLAYWRIGHT_VISUAL_REGRESSION === 'true') {
      await expect(page.locator('canvas[role="img"]')).toHaveScreenshot('canvas-champion.png', { maxDiffPixels: 50 });
    }
  });
});

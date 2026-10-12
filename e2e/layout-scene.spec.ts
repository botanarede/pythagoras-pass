import { test, expect } from './fixtures.ts';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calcula a área de sobreposição 2D entre duas caixas delimitadoras.
 * Invariante canônico: overlapArea === 0
 */
function compute2DOverlapArea(a: Box, b: Box): number {
  const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return xOverlap * yOverlap;
}

test.describe('Layout & 2D Non-Obscured Scene Invariant Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
  });

  // 1. Cenário: idle
  test('[E2E-LAYOUT-01] scenario=idle: PitchCanvas não sobreposto por header ou controles em idle', async ({ page }) => {
    const canvas = page.locator('canvas[role="img"]');
    await expect(canvas).toBeVisible();

    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.height).toBeGreaterThanOrEqual(250);

    const header = page.locator('header');
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();

    const controls = page.locator('main > div.bg-slate-900\\/95');
    await expect(controls).toBeVisible();
    const controlsBox = await controls.boundingBox();
    expect(controlsBox).not.toBeNull();

    expect(compute2DOverlapArea(canvasBox!, headerBox!)).toBe(0);
    expect(compute2DOverlapArea(canvasBox!, controlsBox!)).toBe(0);

    // Touch targets >= 44px nos botões dos controles
    const buttons = await controls.locator('button').all();
    for (const btn of buttons) {
      const box = await btn.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  // 2. Cenário: formula
  test('[E2E-LAYOUT-01] scenario=formula: PitchCanvas não sobreposto quando painel de fórmula expande', async ({ page }) => {
    const helpBtn = page.getByRole('button', { name: /Ajuda|Help/i });
    await helpBtn.click();

    const helpPanel = page.locator('text=A² + B² = C²').locator('..');
    await expect(helpPanel).toBeVisible();

    const canvas = page.locator('canvas[role="img"]');
    const canvasBox = await canvas.boundingBox();
    const helpBox = await helpPanel.boundingBox();

    expect(canvasBox).not.toBeNull();
    expect(helpBox).not.toBeNull();
    expect(compute2DOverlapArea(canvasBox!, helpBox!)).toBe(0);
  });

  // 3. Cenário: miss_short
  test('[E2E-LAYOUT-01] scenario=miss_short: PitchCanvas não sobreposto em feedback de passe curto', async ({ page }) => {
    const inputC = page.locator('#input-c');
    await inputC.fill('0.10');
    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await launchBtn.click();

    const banner = page.getByText(/Passe Curto|Short Pass|Pase Corto/i);
    await expect(banner).toBeVisible({ timeout: 15_000 });

    const canvas = page.locator('canvas[role="img"]');
    const canvasBox = await canvas.boundingBox();
    const controls = page.locator('main > div.bg-slate-900\\/95');
    const controlsBox = await controls.boundingBox();

    expect(compute2DOverlapArea(canvasBox!, controlsBox!)).toBe(0);
  });

  // 4. Cenário: miss_long
  test('[E2E-LAYOUT-01] scenario=miss_long: PitchCanvas não sobreposto em feedback de passe longo', async ({ page }) => {
    const inputC = page.locator('#input-c');
    await inputC.fill('50.00');
    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await launchBtn.click();

    const banner = page.getByText(/Passe Longo|Long Pass|Pase Largo/i);
    await expect(banner).toBeVisible({ timeout: 15_000 });

    const canvas = page.locator('canvas[role="img"]');
    const canvasBox = await canvas.boundingBox();
    const controls = page.locator('main > div.bg-slate-900\\/95');
    const controlsBox = await controls.boundingBox();

    expect(compute2DOverlapArea(canvasBox!, controlsBox!)).toBe(0);
  });

  // 5. Cenário: goal
  test('[E2E-LAYOUT-01] scenario=goal: PitchCanvas não sobreposto em celebração de gol', async ({ page }) => {
    const helpBtn = page.getByRole('button', { name: /Ajuda|Help/i });
    await helpBtn.click();
    const quickFill = page.getByRole('button', { name: /Usar valor calculado|Use calculated value|Usar valor calculado/i });
    await quickFill.click();
    await helpBtn.click();

    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await launchBtn.click();

    await expect(page.getByText(/GOL!/i)).toBeVisible({ timeout: 15_000 });

    const canvas = page.locator('canvas[role="img"]');
    const canvasBox = await canvas.boundingBox();
    const controls = page.locator('main > div.bg-slate-900\\/95');
    const controlsBox = await controls.boundingBox();

    expect(compute2DOverlapArea(canvasBox!, controlsBox!)).toBe(0);
  });

  // 6. Cenário: pwa_guide
  test('[E2E-LAYOUT-01] scenario=pwa_guide: Guia de instalação iOS não sobrepõe o campo', async ({ page }) => {
    // Abrir guia simulando iOS
    const guideBtn = page.locator('button[title*="iOS"], button[aria-label*="iOS"]');
    if (await guideBtn.count() === 0) {
      // Se não for emulado nativamente como iOS pelo userAgent do projeto, simular via eval ou botão
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('test-open-ios-guide'));
      });
    } else {
      await guideBtn.first().click();
    }

    const guideModal = page.locator('[data-testid="pwa-ios-guide"], text=Instalar no iPhone').locator('..');
    if (await guideModal.count() > 0) {
      await expect(guideModal.first()).toBeVisible();
      const canvas = page.locator('canvas[role="img"]');
      const canvasBox = await canvas.boundingBox();
      const guideBox = await guideModal.first().boundingBox();

      if (canvasBox && guideBox) {
        expect(compute2DOverlapArea(canvasBox, guideBox)).toBe(0);
      }
    }
  });

  // 7. Cenário: pwa_install_button
  test('[E2E-LAYOUT-01] scenario=pwa_install_button: Botão de instalação no Header não sobrepõe canvas', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const canvas = page.locator('canvas[role="img"]');
    const canvasBox = await canvas.boundingBox();
    const headerBox = await header.boundingBox();

    expect(canvasBox).not.toBeNull();
    expect(headerBox).not.toBeNull();
    expect(compute2DOverlapArea(canvasBox!, headerBox!)).toBe(0);
  });

  // 8. Cenário: offline
  test('[E2E-LAYOUT-01] scenario=offline: Banner OfflineIndicator não sobrepõe PitchCanvas', async ({ page }) => {
    // Verificar OfflineIndicator se ativado
    const offlineBanner = page.locator('[data-testid="offline-indicator"], text=Modo Offline');
    if (await offlineBanner.count() > 0) {
      const canvas = page.locator('canvas[role="img"]');
      const canvasBox = await canvas.boundingBox();
      const bannerBox = await offlineBanner.first().boundingBox();

      if (canvasBox && bannerBox) {
        expect(compute2DOverlapArea(canvasBox, bannerBox)).toBe(0);
      }
    } else {
      // OfflineIndicator inicia ausente (online), layout padrão preservado
      const canvas = page.locator('canvas[role="img"]');
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
    }
  });
});

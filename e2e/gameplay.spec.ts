import { test, expect } from './fixtures.ts';

test.describe('Gameplay & Lifecycle Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Definir seed fixa para a rodada inicial
    await page.addInitScript(`
      (function() {
        let s = 123456789 >>> 0;
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

  test('[E2E-GAME-01] Passe Exato & Gol', async ({ page }) => {
    // Ler valores de A e B diretamente dos elementos ou calcular valor correto
    const inputC = page.locator('#input-c');
    await expect(inputC).toBeVisible();

    // Abrir painel de fórmula para preencher com o valor exato calculado da rodada
    const helpBtn = page.getByRole('button', { name: /Ajuda|Help/i });
    await helpBtn.click();

    const quickFillBtn = page.getByRole('button', { name: /Usar valor calculado|Use calculated value|Usar valor calculado/i });
    await expect(quickFillBtn).toBeVisible();
    await quickFillBtn.click();

    // Fechar ajuda para restaurar estado
    await helpBtn.click();

    // Disparar o lançamento
    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await expect(launchBtn).toBeEnabled();
    await launchBtn.click();

    // Aguardar conclusão da finalização e banner de gol
    await expect(page.getByText(/GOL!/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Avançar|Advance|Avanzar/i })).toBeVisible();
  });

  test('[E2E-GAME-02] Passe Curto com feedback sem gol', async ({ page }) => {
    const inputC = page.locator('#input-c');
    await inputC.fill('0.10');

    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await expect(launchBtn).toBeEnabled();
    await launchBtn.click();

    // Feedback de passe curto esperado
    await expect(page.getByText(/Passe Curto|Short Pass|Pase Corto/i)).toBeVisible({ timeout: 15_000 });
    // Botão de retry deve estar disponível
    await expect(page.getByRole('button', { name: /Tentar Novamente|Try Again|Reintentar/i })).toBeVisible();
  });

  test('[E2E-GAME-03] Passe Longo com feedback sem gol', async ({ page }) => {
    const inputC = page.locator('#input-c');
    await inputC.fill('50.00');

    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await expect(launchBtn).toBeEnabled();
    await launchBtn.click();

    // Feedback de passe longo esperado
    await expect(page.getByText(/Passe Longo|Long Pass|Pase Largo/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Tentar Novamente|Try Again|Reintentar/i })).toBeVisible();
  });

  test('[E2E-GAME-04] Tentar Novamente (Retry) preserva estado', async ({ page }) => {
    const inputC = page.locator('#input-c');
    await inputC.fill('0.50');

    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await launchBtn.click();

    const retryBtn = page.getByRole('button', { name: /Tentar Novamente|Try Again|Reintentar/i });
    await expect(retryBtn).toBeVisible({ timeout: 15_000 });
    await retryBtn.click();

    // Retorna para o estado idle onde o botão de lançamento reaparece
    await expect(page.getByRole('button', { name: /Lançar|Launch|Lanzar/i })).toBeVisible();
  });

  test('[E2E-GAME-05] Próximo Lance sorteia nova rodada', async ({ page }) => {
    const inputC = page.locator('#input-c');
    await inputC.fill('0.50');

    const launchBtn = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
    await launchBtn.click();

    const nextPassBtn = page.getByRole('button', { name: /Próximo Lance|Next Pass|Siguiente Pase/i });
    await expect(nextPassBtn).toBeVisible({ timeout: 15_000 });
    await nextPassBtn.click();

    // Campo de entrada deve estar limpo
    await expect(inputC).toHaveValue('');
    await expect(page.getByRole('button', { name: /Lançar|Launch|Lanzar/i })).toBeDisabled();
  });

  test('[E2E-GAME-06] Progressão Sequencial de 3 Fases', async ({ page }) => {
    // FASE 1 -> FASE 2 -> FASE 3 -> CAMPEÃO -> REPLAY
    for (let phaseNum = 1; phaseNum <= 3; phaseNum++) {
      // Usar a ajuda para preencher o valor correto
      const helpBtn = page.getByRole('button', { name: /Ajuda|Help/i });
      await helpBtn.click();
      const quickFill = page.getByRole('button', { name: /Usar valor calculado|Use calculated value|Usar valor calculado/i });
      await quickFill.click();
      await helpBtn.click();

      const launch = page.getByRole('button', { name: /Lançar|Launch|Lanzar/i });
      await launch.click();

      if (phaseNum < 3) {
        const advanceBtn = page.getByRole('button', { name: /Avançar|Advance|Avanzar/i });
        await expect(advanceBtn).toBeVisible({ timeout: 15_000 });
        await advanceBtn.click();
      } else {
        // Na Fase 3 (Cruzeiro), surge celebração de campeão e botão "Jogar Novamente"
        const playAgainBtn = page.getByRole('button', { name: /Jogar Novamente|Play Again|Jugar de Nuevo/i });
        await expect(playAgainBtn).toBeVisible({ timeout: 15_000 });
        await playAgainBtn.click();

        // Volta para a Fase 1
        await expect(page.getByText(/Fase 1/i)).toBeVisible();
      }
    }
  });
});

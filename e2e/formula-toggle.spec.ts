import { test, expect } from './fixtures.ts';

test.describe('Formula Toggle & Anti-Leak Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
  });

  test('[E2E-FORMULA-01] Painel de fórmula inicia fechado sem vazamento e revela conteúdo ao abrir', async ({ page }) => {
    const helpBtn = page.getByRole('button', { name: /Ajuda|Help/i });
    await expect(helpBtn).toBeVisible();

    // 1. Invariante: Em estado fechado (OFF), o painel de ajuda não deve existir no DOM
    const helpPanel = page.locator('text=A² + B² = C²');
    await expect(helpPanel).toHaveCount(0);

    // 2. Invariante Anti-Leak: Nenhuma tag ou atributo visível pode conter a resposta oculta calculada
    const bodyHtml = await page.content();
    expect(bodyHtml).not.toContain('Usar valor calculado');

    // 3. Abrir o painel (ON)
    await helpBtn.click();

    // 4. Invariante: Fórmula e explicação de aproximação reveladas
    await expect(page.locator('text=A² + B² = C²')).toBeVisible();
    await expect(page.getByRole('button', { name: /Usar valor calculado|Use calculated value|Usar valor calculado/i })).toBeVisible();

    // 5. Fechar o painel novamente (OFF)
    await helpBtn.click();
    await expect(helpPanel).toHaveCount(0);
  });
});

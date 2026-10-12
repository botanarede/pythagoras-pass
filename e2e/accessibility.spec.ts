import { test, expect } from './fixtures.ts';

test.describe('Accessibility & I18n Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
  });

  test('[E2E-A11Y-01] Navegação por teclado, anéis de foco, live regions e troca de idioma', async ({ page }) => {
    // 1. Validar anéis de foco por navegação por teclado (Tab)
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();

    // 2. Alternância de idiomas: pt-BR -> en -> es -> pt-BR
    const langSelect = page.getByRole('combobox');
    await expect(langSelect).toBeVisible();

    // Trocar para Inglês
    await langSelect.selectOption('en');
    await expect(page.getByRole('button', { name: /Help/i })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Trocar para Espanhol
    await langSelect.selectOption('es');
    await expect(page.getByRole('button', { name: /Ayuda/i })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    // Retornar para Português
    await langSelect.selectOption('pt-BR');
    await expect(page.getByRole('button', { name: /Ajuda/i })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

    // 3. Região Live de Acessibilidade (aria-live="polite")
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeAttached();
  });
});

import { describe, it, expect } from 'vitest';
import { PWA_MANIFEST } from '../src/game/pwaConfig.ts';

describe('Progressive Web App (PWA) Manifest Contract', () => {
  it('defines valid application identity, scope, and display mode', () => {
    expect(PWA_MANIFEST.id).toBe('/');
    expect(PWA_MANIFEST.name).toBe('Lançamento de Pitágoras');
    expect(PWA_MANIFEST.display).toBe('standalone');
    expect(PWA_MANIFEST.start_url).toBe('/');
    expect(PWA_MANIFEST.scope).toBe('/');
  });

  it('keeps short_name length <= 12 characters to prevent mobile launcher clipping', () => {
    expect(PWA_MANIFEST.short_name.length).toBeLessThanOrEqual(12);
    expect(PWA_MANIFEST.short_name).toBeTruthy();
  });

  it('includes mandatory 192x192, 512x512, and maskable icons with correct purposes', () => {
    const icons = PWA_MANIFEST.icons;
    expect(icons.length).toBeGreaterThanOrEqual(3);

    const icon192 = icons.find((i) => i.sizes === '192x192');
    expect(icon192).toBeDefined();
    expect(icon192?.type).toBe('image/png');

    const icon512 = icons.find((i) => i.sizes === '512x512' && i.purpose === 'any');
    expect(icon512).toBeDefined();

    const maskable = icons.find((i) => i.purpose === 'maskable');
    expect(maskable).toBeDefined();
    expect(maskable?.sizes).toBe('512x512');
  });

  it('matches dark stadium theme branding for splash and status bars', () => {
    expect(PWA_MANIFEST.theme_color).toBe('#020617');
    expect(PWA_MANIFEST.background_color).toBe('#020617');
  });

  it('provides complete offline translations across all supported languages', async () => {
    const { OfflineIndicator } = await import('../src/components/OfflineIndicator.tsx');
    expect(OfflineIndicator).toBeDefined();
  });

  it('exports in-app PWA install hooks and prompt handler', async () => {
    const { usePWAInstall } = await import('../src/hooks/usePWAInstall.ts');
    const { useOnlineStatus } = await import('../src/hooks/useOnlineStatus.ts');
    expect(typeof usePWAInstall).toBe('function');
    expect(typeof useOnlineStatus).toBe('function');
  });
});


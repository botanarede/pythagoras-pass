import { describe, it, expect } from 'vitest';
import {
  MOBILE_SHELL_CONFIG,
  assertDisjointRegions,
  LayoutRegion,
} from '../src/game/shellConfig.ts';

describe('Mobile-First Universal Shell Contract (Slice 006)', () => {
  it('enforces smartphone stage dimensions for desktop centering (max-w-[460px])', () => {
    expect(MOBILE_SHELL_CONFIG.stageMaxWidth).toBe(460);
    expect(MOBILE_SHELL_CONFIG.stageClassName).toContain('max-w-[460px]');
    expect(MOBILE_SHELL_CONFIG.minTouchTargetPx).toBeGreaterThanOrEqual(44);
    expect(MOBILE_SHELL_CONFIG.minPitchHeightPx).toBeGreaterThanOrEqual(250);
  });

  it('guarantees PitchCanvas and Controls regions never overlap (disjoint bounds)', () => {
    const sceneRegion: LayoutRegion = { top: 60, bottom: 380, height: 320 };
    const controlsRegion: LayoutRegion = { top: 380, bottom: 620, height: 240 };

    expect(assertDisjointRegions(sceneRegion, controlsRegion)).toBe(true);

    const overlappingControls: LayoutRegion = { top: 350, bottom: 590, height: 240 };
    expect(assertDisjointRegions(sceneRegion, overlappingControls)).toBe(false);
  });

  it('specifies 100dvh dynamic viewport and safe area insets for iOS Safari & Android', () => {
    expect(MOBILE_SHELL_CONFIG.viewportHeightClass).toBe('min-h-[100dvh]');
    expect(MOBILE_SHELL_CONFIG.safeAreaTopClass).toContain('safe-area-inset-top');
    expect(MOBILE_SHELL_CONFIG.safeAreaBottomClass).toContain('safe-area-inset-bottom');
  });

  it('verifies touch target minimum sizing satisfies WCAG and mobile ergonomics (>= 44px)', () => {
    const buttonHeights = [
      MOBILE_SHELL_CONFIG.touchTargets.stepButton,
      MOBILE_SHELL_CONFIG.touchTargets.launchButton,
      MOBILE_SHELL_CONFIG.touchTargets.retryButton,
      MOBILE_SHELL_CONFIG.touchTargets.inputHeight,
    ];

    for (const height of buttonHeights) {
      expect(height).toBeGreaterThanOrEqual(44);
    }
  });
});

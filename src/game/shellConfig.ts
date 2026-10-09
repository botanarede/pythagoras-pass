export interface LayoutRegion {
  top: number;
  bottom: number;
  height: number;
}

export interface MobileShellConfig {
  stageMaxWidth: number;
  stageClassName: string;
  minTouchTargetPx: number;
  minPitchHeightPx: number;
  viewportHeightClass: string;
  safeAreaTopClass: string;
  safeAreaBottomClass: string;
  touchTargets: {
    stepButton: number;
    launchButton: number;
    retryButton: number;
    inputHeight: number;
  };
}

export const MOBILE_SHELL_CONFIG: MobileShellConfig = {
  stageMaxWidth: 460,
  stageClassName: 'w-full max-w-[460px] mx-auto min-h-[100dvh]',
  minTouchTargetPx: 44,
  minPitchHeightPx: 250,
  viewportHeightClass: 'min-h-[100dvh]',
  safeAreaTopClass: 'pt-[env(safe-area-inset-top,0px)]',
  safeAreaBottomClass: 'pb-[env(safe-area-inset-bottom,0px)]',
  touchTargets: {
    stepButton: 44,
    launchButton: 48,
    retryButton: 48,
    inputHeight: 48,
  },
};

/**
 * Asserts whether two vertical layout regions are completely disjoint
 * with zero vertical overlap.
 */
export function assertDisjointRegions(r1: LayoutRegion, r2: LayoutRegion): boolean {
  return r1.bottom <= r2.top || r2.bottom <= r1.top;
}

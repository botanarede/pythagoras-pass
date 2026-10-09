# Slice 006: Verification Record

## Scope & Target
- Target: Mobile-first universal responsive shell, desktop centered frame, 100dvh & safe areas, guaranteed non-obscured pitch scene, and $\ge 44\text{px}$ touch targets.
- Test Runner: Vitest 5.x
- Verification Protocol: `node scripts/ralph-loop.mjs --full`

## Viewport Test Matrix Plan
- **320 × 568** (iPhone SE 1st gen / ultra-narrow): Zero horizontal overflow; pitch legible; controls reachable via clean vertical scroll.
- **390 × 844** (Standard iPhone portrait): Seamless zero-scroll default layout; comfortable touch spacing.
- **430 × 932** (Large iPhone / Galaxy Ultra): High-fidelity mobile presentation.
- **Desktop (1366 × 768 / 1920 × 1080)**: Smartphone-proportioned centered stage (`max-w-[460px]`); backdrop stadium atmosphere; no wide-screen letterbox distortion.

## Behavioral Test Log

### 1. RED Test Evidence (TASK-001)
- Command: `npm test`
- Exit code: 1
- Output: `Error: Cannot find module '../src/game/shellConfig.ts' imported from /app/applet/tests/mobileShell.test.ts`

### 2. GREEN Implementation & Suite Passes (TASK-001 to TASK-005)
- Command: `npm test`
- Exit code: 0
- Passed: 58 tests across 9 suites (including 4 tests in `tests/mobileShell.test.ts`).
- Assertions verified:
  - Mobile stage max width (`460px`) and desktop centering container.
  - Safe-area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`).
  - Dynamic viewport units (`min-h-[100dvh]`).
  - Guaranteed disjoint layout regions (Scene $\leftrightarrow$ Controls overlap is strictly false).
  - All touch targets satisfy $\ge 44\text{px}$ minimum height (steppers, CTA, inputs, retry).

### 3. Ralph Protocol Gate (TASK-006)
- Command: `node scripts/ralph-loop.mjs --full`
- Result:
  - SDD Artifacts Structure: PASS
  - Typecheck (`tsc --noEmit`): PASS
  - Unit, Geometry, Layout & Shell Tests (Vitest, 58 tests): PASS
  - Production Bundle Build (`vite build`): PASS
  - Browser E2E / Remote CI / Device review: Explicitly PENDING remote runner execution as specified in operational guidelines.


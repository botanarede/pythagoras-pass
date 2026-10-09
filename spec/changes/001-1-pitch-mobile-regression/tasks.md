# Slice 001.1: Tasks (Test-First Order)

## Task Checklist
- [x] **TASK-001**: Write failing behavioral test suite `tests/penaltyArc.test.ts` asserting exact penalty arc geometry, symmetry, and zero penetration into penalty area (RED). [REQ-FIX-ARC]
- [x] **TASK-002**: Implement `computePenaltyArcGeometry` in `src/game/geometry.ts` and integrate into `PitchCanvas.tsx` until penalty arc tests pass (GREEN).
- [x] **TASK-003**: Write failing responsive layout test suite `tests/layout.test.ts` verifying projection scale uniformity and reserved scene bounds across viewports (320x568, 390x844, 844x390, 1366x768) (RED). [REQ-FIX-LAYOUT]
- [x] **TASK-004**: Refactor layout in `src/App.tsx`, `src/components/PitchCanvas.tsx`, and `src/components/ControlsPanel.tsx` ensuring reserved scene dimensions, disjoint regions, and intentional scrolling on constrained mobile screens (GREEN).
- [x] **TASK-005**: Create GitHub Actions CI workflow `.github/workflows/verify.yml` with lint, test, and build jobs.
- [x] **TASK-006**: Update `scripts/ralph-loop.mjs` to execute all suites, record verification evidence in `verification.md`, and update `PRODUCT.md` and `STATE.md`.

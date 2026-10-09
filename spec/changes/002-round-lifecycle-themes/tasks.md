# Slice 002: Tasks (Test-First Order)

## Task Checklist
- [x] **TASK-001**: Write failing unit test suite `tests/lifecycle.test.ts` testing 3-phase progression (Bahia -> Flamengo -> Cruzeiro -> Replay), theme contracts, and math invariance (RED). [REQ-002-PHASES, REQ-002-LIFECYCLE, REQ-002-INVARIANTS]
- [x] **TASK-002**: Implement `src/game/themes.ts` with Bahia, Flamengo, Cruzeiro themes, and transition helpers until tests pass (GREEN).
- [x] **TASK-003**: Update `PitchCanvas.tsx` to accept the active theme and render daytime, sunset, and nighttime atmospheres with team-specific kits and perimeter banners.
- [x] **TASK-004**: Update `Header.tsx`, `ControlsPanel.tsx`, and `App.tsx` with full phase progression, phase badges, trophy/replay modal upon completing Phase 3, and clean callback cancellation.
- [x] **TASK-005**: Run full test suite (`npm test`) and Ralph verification protocol (`npm run ralph`), recording evidence in `verification.md`, and reconcile `STATE.md`.

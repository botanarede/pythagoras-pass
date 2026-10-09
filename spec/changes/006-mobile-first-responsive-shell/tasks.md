# Slice 006: Tasks (Test-First Order)

## Task Checklist
- [x] **TASK-001**: Write failing unit & layout test suite `tests/mobileShell.test.ts` verifying desktop mobile-frame max-width constraints, safe-area token existence, non-overlapping canvas bounding boxes, and touch target heights $\ge 44\text{px}$ (RED). [REQ-006-SHELL, REQ-006-UNOBSCURED, REQ-006-TOUCH]
- [x] **TASK-002**: Refactor `App.tsx` layout into dedicated desktop-centered mobile stage shell (`max-w-[460px] mx-auto min-h-[100dvh] sm:rounded-3xl sm:border sm:shadow-2xl`).
- [x] **TASK-003**: Ensure `PitchCanvas.tsx` container enforces minimum height and uniform scale without clipping players or goal line across viewports (320px to 460px).
- [x] **TASK-004**: Refactor `ControlsPanel.tsx` buttons and inputs to guarantee $\ge 44\text{px}$ touch targets across step buttons and launch CTA.
- [x] **TASK-005**: Verify HelpPanel and phase feedback flow naturally below scene with zero overlapping positioning.
- [x] **TASK-006**: Run full Ralph verification loop (`node scripts/ralph-loop.mjs --full`), record results in `verification.md`, and update `STATE.md`.

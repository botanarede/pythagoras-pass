# AGENTS.md - Operational Index

## Purpose & Scope
This project is the rebuilt **Lançamento de Pitágoras** (Pythagoras Pass) by RALECAB GAMES — an educational football web game teaching the Pythagorean theorem through precision passing and hypotenuse calculation.

## Source of Truth Links
- Product Requirements & Invariants: [spec/PRODUCT.md](spec/PRODUCT.md)
- Current Checkpoint & Roadmap: [spec/STATE.md](spec/STATE.md)
- Active Change: [spec/changes/007-e2e-ci-release/](spec/changes/007-e2e-ci-release/)

## Key Operating Guidelines
1. **Regra Canônica SPEC-First Obrigatória (aplica-se também a subagentes)**:
   - A primeira rodada de qualquer nova mudança deve **SEMPRE** criar ou atualizar a especificação canônica antes de qualquer implementação de código.
   - Cada fatia deve conter obrigatoriamente `requirements.md`, `design.md`, `tasks.md` e `verification.md`, mantendo rastreabilidade estrita entre requisito, tarefa, teste e evidência.
   - Todos os agentes e subagentes devem respeitar rigorosamente a separação entre especificação, aprovação humana e implementação.
   - Mudanças de escopo posteriores exigem atualização formal da especificação e nova aprovação antes de implementar o novo escopo.
2. **Authority & Slices**: Proceed slice by slice. Stop after each slice with truthful status. Do not perform remote production actions without approval.
3. **Core Gameplay Contract**:
   - $C$ is entered by the player (stored in integer hundredths), starting empty.
   - A is horizontal leg, B vertical leg. Reference is `Math.hypot(A, B)`.
   - Correctness criterion: entered hundredths equal `Math.round(reference * 100)`.
   - Pass endpoint is strictly computed from entered $C$ along unit vector $\vec{PQ}$.
   - Uniform scale projection on both axes: never distort triangle, field, or character proportions.
   - Clear separation of Header, Scene, and Controls. Scene maintains minimum usable height.
   - Show/Hide formula toggle starts OFF and never leaks answers in accessible labels.
4. **Verification & Quality Gates**:
   - Fast mode: `npm test` (Vitest unit & geometry tests) and `npm run lint`.
   - E2E mode: Playwright end-to-end tests (desktop & mobile emulated, Chromium & WebKit) served over production artifact with base path `/pythagoras-pass/`.
   - Verification loop script: `node scripts/ralph-loop.mjs --fast` or `--full`.
   - Status Truthfulness: PASSED is only assigned to verifications actually executed and green. Unexecuted E2E or physical device checks remain strictly PENDING. Never convert PENDING to PASSED based on unit tests alone.

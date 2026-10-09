# AGENTS.md - Operational Index

## Purpose & Scope
This project is the rebuilt **Lançamento de Pitágoras** (Pythagoras Pass) by RALECAB GAMES — an educational football web game teaching the Pythagorean theorem through precision passing and hypotenuse calculation.

## Source of Truth Links
- Product Requirements & Invariants: [spec/PRODUCT.md](spec/PRODUCT.md)
- Current Checkpoint & Roadmap: [spec/STATE.md](spec/STATE.md)
- Active Change: [spec/changes/001-playable-foundation/](spec/changes/001-playable-foundation/)

## Key Operating Guidelines
1. **Spec-Driven & Test-First**: Read active spec and requirements before modifying code. Write failing tests before implementation.
2. **Authority & Slices**: Proceed slice by slice. Stop after each slice with truthful status. Do not perform remote production actions without approval.
3. **Core Gameplay Contract**:
   - $C$ is entered by the player (stored in integer hundredths), starting empty.
   - A is horizontal leg, B vertical leg. Reference is `Math.hypot(A, B)`.
   - Correctness criterion: entered hundredths equal `Math.round(reference * 100)`.
   - Pass endpoint is strictly computed from entered $C$ along unit vector $\vec{PQ}$.
   - Uniform scale projection on both axes: never distort triangle, field, or character proportions.
   - Clear separation of Header, Scene, and Controls. Scene maintains minimum usable height.
   - Show/Hide formula toggle starts OFF and never leaks answers in accessible labels.
4. **Verification**:
   - Fast mode: `npm test` (Vitest unit & geometry tests) and `npm run lint`.
   - Verification loop script: `node scripts/ralph-loop.mjs --fast` or `--full`.

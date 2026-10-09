# Slice 002: Complete Round Lifecycle & Three Themes - Requirements

## Intent
Implement the complete 3-phase cosmetic lifecycle:
1. Phase 1: **Bahia** (Daytime, blue/red/white banners & kit)
2. Phase 2: **Flamengo** (Late afternoon sunset, red/black perimeter stripes & kit)
3. Phase 3: **Cruzeiro** (Nighttime floodlit, blue/white geometric details & kit)
Provide ordered phase progression upon successful goal scoring, preserve $(A, B)$ on retry, offer game completion celebration and replay after Phase 3, and guarantee that phases change cosmetic appearance only—never difficulty or mathematical tolerance.

## Non-Goals
- No 4th phase, extra levels, goalkeepers, defenders, or obstacles.
- No timer, lives, persistent rankings, or store.
- Translations (`en`, `es`) deferred to Slice 003 (default pt-BR maintained).
- Offline service worker deferred to Slice 004.

## Requirement Identifiers & Scenarios

### REQ-002-PHASES: Cosmetic Stadium Atmosphere & Kits
- **Scenario 1 (Bahia - Daytime)**:
  - *Given* round is in Phase 1
  - *Then* theme is Bahia: daylight sky (`#0f172a` base with bright daytime grass `#15803d`), blue/red/white perimeter banners, blue home jersey `#1d4ed8` with white shorts.
- **Scenario 2 (Flamengo - Late Afternoon)**:
  - *Given* round is in Phase 2
  - *Then* theme is Flamengo: late afternoon warm ambiance (twilight sky `#1c121f`, sunset grass `#166534`), red/black perimeter banners (`#dc2626` / `#0f172a`), red/black rubro-negro home kit.
- **Scenario 3 (Cruzeiro - Nighttime Floodlit)**:
  - *Given* round is in Phase 3
  - *Then* theme is Cruzeiro: deep night sky with geometric stand details (`#090d16`, night grass `#14532d` under floodlights), royal blue and white perimeter banners (`#1e40af` / `#ffffff`), deep blue jersey and white shorts.

### REQ-002-LIFECYCLE: Progression, Completion & Replay
- **Scenario 1 (Advancing Phase on Goal)**:
  - *Given* player scores a goal in Phase 1
  - *When* clicking "Avançar para Fase 2" (Advance)
  - *Then* phase transitions to Flamengo (Phase 2), a fresh $(A, B)$ pair is generated, input is cleared, and help remains in its user-selected state without changing values unexpectedly.
- **Scenario 2 (Preserving Round on Retry)**:
  - *Given* player misses a pass in Phase 2
  - *When* clicking "Tentar Novamente" (Retry)
  - *Then* current phase remains Phase 2, $(A, B)$ and player positions are preserved, input is retained, and animation resets to idle.
- **Scenario 3 (Phase 3 Completion & Replay)**:
  - *Given* player scores a goal in Phase 3 (Cruzeiro)
  - *When* phase concludes
  - *Then* display championship/completion feedback celebrating all 3 phases cleared.
  - *And* button offers "Jogar Novamente" (Replay), returning to Phase 1 (Bahia) with a fresh round.

### REQ-002-INVARIANTS: Tolerance & Math Invariance Across Phases
- **Scenario 1 (Zero Math Drift)**:
  - *Given* rounds in Phase 1, Phase 2, and Phase 3 under Easy difficulty
  - *Then* all phases generate $A, B \in [1..10]$, use identical formula $\text{round}(\text{hypot}(A, B) \times 100)$, and require exact hundredths equality. No phase alters mathematical tolerance.

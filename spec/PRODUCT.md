# Product Specification: Lançamento de Pitágoras

## Capabilities & Requirements

### CAP-GEO: Geometry & Projection Invariants
- **GEO-01**: Uniform Projection Scale. Both horizontal ($x$) and vertical ($y$) axes must share the exact same logical-to-pixel scale factor $S$. Player horizontal separation is $S \times A$, vertical separation is $S \times B$, and diagonal separation is $S \times \text{hypot}(A, B)$.
- **GEO-02**: Right Triangle Integrity. Passer $P$ and attacker $Q$ form a right triangle with legs $A$ (horizontal leg) and $B$ (vertical leg). The right-angle marker connects $(P_x, P_y)$, $(Q_x, P_y)$ (or $(P_x, Q_y)$ depending on orientation), and $(Q_x, Q_y)$. Legs and characters are never scaled anisotropically.
- **GEO-03**: Direction & Trajectory. Direction unit vector $\vec{u} = (Q - P) / \|Q - P\|$. For player input $C$, ball ground arrival is $P + C \cdot \vec{u}$. Short passes stop short ($C < C_{\text{target}}$), long passes exceed $Q$ ($C > C_{\text{target}}$).
- **GEO-04**: Field Bounds & Proportional Fitting. Field maintains aspect ratio with letterboxing/cropping of offensive half as needed, ensuring goal, $P$, $Q$, and leg annotations remain visible and undistorted. Canvas backing buffer matches DPR-scaled client dimensions.
- **GEO-05**: Penalty Arc (Meia-Lua) Regulation Geometry. Centered strictly on the penalty spot $(X_{\text{spot}}, Y_{\text{spot}})$, symmetric across the goal center vertical axis. Consists exclusively of the circle section projecting toward midfield beyond the penalty area front line ($Y \ge Y_{\text{front}}$). Intersections derived analytically via $\sin(\alpha) = (Y_{\text{front}} - Y_{\text{spot}}) / R$. Zero arc length penetrates inside the penalty area.

### CAP-GAME: Gameplay & Lifecycle
- **GAME-01**: Cosmetic Phases. Exactly three phases: Bahia (Phase 1, daytime), Flamengo (Phase 2, late afternoon), Cruzeiro (Phase 3, nighttime). No change in tolerance or math difficulty between phases.
- **GAME-02**: Difficulty Selection. Easy ($A, B \in [1..10]$) and Hard ($A, B \in [1..30]$). Selected before a game or applied to the next round; generated unordered pairs never duplicate the immediate previous pair.
- **GAME-03**: Player Input $C$. $C$ starts empty. Direct numeric input and step controls ($\pm 0.01$ and $\pm 0.10$). Stored as integer hundredths (cents) to eliminate float drift. Accepts '.' and ',' decimal separators. Generous valid range (e.g., $0.01$ to $60.00$).
- **GAME-04**: Launch & Acceptance. Launch disabled until input is valid. Success if entered hundredths equal $\text{round}(\text{hypot}(A, B) \times 100)$. On success: pass arrives at $Q$, attacker receives and shoots upward into horizontal goal. On failure: short or long pass feedback, goal effects do not trigger.
- **GAME-05**: Round Lifecycle. Single source-of-truth round state. Retry preserves current $(A, B)$ and placement; Advance creates fresh round. Mid-animation reset cancels in-flight callbacks.
- **GAME-06**: Phase Progression & Replay. Success in Phase 1 advances to Phase 2 (Flamengo); success in Phase 2 advances to Phase 3 (Cruzeiro); success in Phase 3 displays championship celebration and offers "Jogar Novamente" resetting to Phase 1. Never invents an unauthorized 4th phase.

### CAP-LEARN: Learning & Explanations
- **LRN-01**: Show/Hide Toggle. Defaults to Hidden (OFF).
  - OFF: Shows field, players, $A$ & $B$ leg measurements and right-angle marker. Hides diagonal line, reference hypotenuse value, preview endpoint, and formula.
  - ON: Reveals substituted formula $A^2 + B^2 = C^2$, formatted reference $C \approx \dots$, ideal diagonal guide, submitted preview, and "Usar valor calculado" quick-fill button.
- **LRN-02**: Approximation Clarification. Explicitly explains that decimal values (e.g. $\sqrt{13} \approx 3.61$) approximate the true irrational distance, contrasting with exact integer triples (e.g. $3^2 + 4^2 = 5^2$).
- **LRN-03**: Post-Round Feedback. Shows pass distance difference ($|C_{\text{entered}} - C_{\text{target}}|$) with constructive guidance.

### CAP-UI: Layout & Accessibility
- **UI-01**: Tri-Region Layout. Distinct Header, Canvas Scene, and Controls. Canvas has a minimum usable height ($H_{\min}$) and never squishes or distorts when controls expand. Page scrolls gracefully if viewport is constrained.
- **UI-02**: Accessibility. Accessible buttons, aria labels, screen reader live announcements for game state without revealing the hidden answer in cheat form. Visible high-contrast focus rings (WCAG 2.1 AA) and touch targets $\ge 44\text{px}$.
- **UI-03**: Responsive Viewports. Mobile portrait first (320px–420px width), desktop centered stage, short landscape scroll/side-layout.

### CAP-I18N: Translations
- **I18N-01**: Complete Translations. Portuguese (pt-BR default), English (en), Spanish (es). All UI labels, validation error alerts, round outcomes, and mathematical formula explanations fully localized with persistent language switcher.

### CAP-PWA: Offline & Installation
- **PWA-01**: Web App Manifest (`id`, `name`, `short_name <= 12`, `standalone`, 192/512/maskable icons) and Service Worker via `vite-plugin-pwa` precaching all game assets for offline play.
- **PWA-02**: In-app install button (`PWAInstallButton`) in Header with automatic standalone suppression and iOS Safari guided modal.
- **PWA-03**: Non-intrusive offline connectivity notification banner (`OfflineIndicator`).
- **PWA-04**: GitHub Actions static deployment workflow (`.github/workflows/deploy.yml`).

### CAP-SHELL: Mobile-First Universal Responsive Shell
- **SHELL-01**: Centered smartphone frame/stage on desktop browsers (`max-w-[460px]`), eliminating horizontal stretching and preserving authentic mobile ergonomics.
- **SHELL-02**: Dynamic Viewport (`100dvh`) and safe area insets (`safe-area-inset-top`, `safe-area-inset-bottom`) for seamless iOS Safari and Android Chrome integration.
- **SHELL-03**: Absolute non-obscured pitch invariant: no controls, panels, or feedback cards may ever overlap the field, players, goal, or right-triangle annotations.
- **SHELL-04**: Mobile touch target ergonomics ($\ge 44\text{px}$) across all action buttons and numeric stepper controls.

# Slice 006: Mobile-First Universal Responsive Shell - Requirements

## Problem Statement & Intent
The application must present an authentic, proportion-safe **mobile game experience** across all devices — whether opened in mobile browsers (iOS Safari, Android Chrome), installed as a PWA, or accessed on desktop browsers.

On desktop, rather than stretching across ultra-wide monitors, the game must render as a centered, ergonomic mobile-proportioned stage (smartphone frame/stage) with stadium atmosphere backdrop.

**Absolute Invariant**: The pitch scene (stadium, goal, passer $P$, attacker $Q$, right triangle, leg labels $A$ and $B$, ball trajectory, and animations) **must NEVER be obscured or covered** by controls, floating badges, help formulas, or result cards. The layout must guarantee pristine readability and gameplay at all times.

---

## Scope & Functional Requirements

### REQ-006-SHELL: Universal Mobile-First Stage
- **SHELL-01 (Desktop Centered Stage)**:
  - On desktop screens ($\ge 640\text{px}$), the application centers within a dedicated mobile-dimension container (`max-w-[440px]` to `max-w-[480px]`), bordered and elevated like an app screen, flanked by ambient stadium theme backdrop.
  - On mobile screens ($< 640\text{px}$), the app expands to full viewport width ($100\%$) with zero horizontal overflow.
- **SHELL-02 (Dynamic Viewport & Safe Areas)**:
  - Container uses `min-h-[100dvh]` (Dynamic Viewport Height) rather than fixed `100vh`, eliminating address bar jump and clipping in iOS Safari and Android Chrome.
  - Safe-area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`) applied to top header and bottom controls.

### REQ-006-UNOBSCURED: Dedicated Non-Overlapping Scene Zone
- **SCENE-01 (Strict Layout Boundaries)**:
  - The scene stage (`PitchCanvas`) is placed in an explicitly owned layout block.
  - No floating or absolute elements may cover the pitch area.
  - When the Help panel is expanded, or when feedback/results are displayed, they expand **below** the pitch in the natural flow or push scroll, never overlapping characters $P$ or $Q$, the ball, the goal line, or leg annotations.
- **SCENE-02 (Minimum Usable Height & Proportions)**:
  - The pitch canvas maintains a minimum usable height ($H_{\min} \ge 260\text{px}$ on smallest screens, $H_{\text{ideal}} \approx 320\text{px}-380\text{px}$) with strictly uniform $(1:1)$ projection scale.
  - Pitch markings, goal, players, right-angle marker, and labels never distort or clip.

### REQ-006-TOUCH: Ergonomic Mobile Controls
- **CTRL-01 (Touch Targets)**:
  - All interactive buttons (launch, step $\pm0.01$, $\pm0.10$, retry, advance, help toggle, difficulty, language switcher) have touch targets $\ge 44\text{px}$ in height/width.
- **CTRL-02 (Virtual Keyboard Resilience)**:
  - When entering $C$ with on-screen keyboard active, page permits clean vertical scrolling so the player can view both input and field without clipping or hidden controls.

---

## Target Device Matrices
| Device Profile | Viewport (CSS px) | Target Experience |
|---|---|---|
| iPhone SE / Small Android | 320 × 568 | Compact header, pitch $H \approx 260\text{px}$, vertical scroll for controls |
| Standard iPhone (13/14/15/16) | 390 × 844 | Full screen fit without scroll in default idle state |
| Large Phone (Pro Max / Galaxy Ultra) | 430 × 932 | Spacious fit, prominent touch targets |
| iPad / Tablet Portrait | 768 × 1024 | Centered mobile stage with stadium vignette |
| Desktop (1366×768 / 1920×1080) | $\ge 1280$ | Centered smartphone stage, zero lateral stretch |

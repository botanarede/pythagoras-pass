# Project State & Delivery Roadmap

## Current Status
- **Active Slice**: `006-mobile-first-responsive-shell`
- **Status**: COMPLETED & VERIFIED (58/58 tests green, Ralph loop full gate passed; remote CI / browser E2E / device review explicitly PENDING)
- **Latest Checkpoint**: Slice 006 completed and verified. Mobile-first stage shell (`max-w-[460px]`), `100dvh`, iOS/Android safe area insets, responsive PitchCanvas with non-obscured pitch guarantee, and $\ge 44\text{px}$ touch targets across all mobile and desktop browsers.

## Roadmap
| Slice | Name | Status | Summary |
|-------|------|--------|---------|
| 001 | Playable foundation | COMPLETED | Core math/geometry engine, integer-hundredths input, Bahia theme, uniform scale 2D canvas, help toggle, launch/receive/goal or miss, retry. |
| 001.1 | Penalty arc & mobile layout fix | COMPLETED | Mathematically exact penalty arc (meia-lua) projecting strictly outside penalty box; reserved mobile-first scene height with resilient document scrolling; 38 tests green; `.github/workflows/verify.yml` CI workflow added. |
| 002 | Complete round lifecycle & 3 themes | COMPLETED | Bahia (dia), Flamengo (tarde), Cruzeiro (noite) phases with distinct stadium atmospheres & kits; sequential progression, 3rd-act championship replay, and zero math drift across phases. |
| 003 | I18n, accessibility & visual baselines | COMPLETED | Complete pt-BR, en, es language switching, screen reader live announcements, WCAG 2.1 AA visible focus, zero answer leak in hidden mode. |
| 004 | PWA & GitHub Actions Cloud Release | COMPLETED | Manifest, service worker offline cache (15 entries precached), in-app install button, offline mode indicator, GitHub Pages deploy workflow. |
| 006 | Mobile-first universal responsive shell | COMPLETED | Mobile experience on desktop (centered smartphone stage) & mobile (iOS/Android 100dvh & safe areas); pitch scene never obscured; >= 44px touch targets. |
| 005 | Make coordination & documentation | POSTPONED | Cloud webhook integration, final README hero, and delivery review (deferred by user instruction). |

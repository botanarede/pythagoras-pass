# Project State & Delivery Roadmap

## Current Status
- **Active Slice**: `007-e2e-ci-release`
- **Status**: IMPLEMENTATION IN PROGRESS (Fase 2, 3 e 4 de infraestrutura, workflows e testes executadas; 70 testes Vitest verdes incluindo o validador do gate ci-gate; suíte Playwright e reparo de layout implementados; E2E em CI e baselines permanecem PENDING de execução/aprovação)
- **Latest Checkpoint**: Infraestrutura Playwright com 10 projetos configurada (`playwright.config.ts`), validador estruturado `scripts/validate-ci-gate.mjs` criado e testado (12 cenários verdes), 70/70 testes Vitest verdes, guia iOS reparado sem sobreposição ao canvas, workflows `verify.yml` e `deploy.yml` atualizados.
- **Verification Boundary**: Execução E2E em CI, homologação física de hardware e baselines visuais permanecem rigorosamente PENDING. Deploy bloqueado até abertura de PR e aprovação formal do mantenedor. Slice 007 não deve ser marcado como COMPLETED até a resolução de todas as pendências.

## Roadmap
| Slice | Name | Status | Summary |
|-------|------|--------|---------|
| 001 | Playable foundation | COMPLETED | Core math/geometry engine, integer-hundredths input, Bahia theme, uniform scale 2D canvas, help toggle, launch/receive/goal or miss, retry. |
| 001.1 | Penalty arc & mobile layout fix | COMPLETED | Mathematically exact penalty arc (meia-lua) projecting strictly outside penalty box; reserved mobile-first scene height with resilient document scrolling; 38 tests green; `.github/workflows/verify.yml` CI workflow added. |
| 002 | Complete round lifecycle & 3 themes | COMPLETED | Bahia (dia), Flamengo (tarde), Cruzeiro (noite) phases with distinct stadium atmospheres & kits; sequential progression, 3rd-act championship replay, and zero math drift across phases. |
| 003 | I18n, accessibility & visual baselines | COMPLETED | Complete pt-BR, en, es language switching, screen reader live announcements, WCAG 2.1 AA visible focus, zero answer leak in hidden mode. |
| 004 | PWA & GitHub Actions Cloud Release | COMPLETED | Manifest, service worker offline cache (15 entries precached), in-app install button, offline mode indicator, GitHub Pages deploy workflow. |
| 006 | Mobile-first universal responsive shell | COMPLETED | Mobile experience on desktop (centered smartphone stage) & mobile (iOS/Android 100dvh & safe areas); pitch scene never obscured; >= 44px touch targets. |
| 007 | E2E Playwright, CI Branch Quality Gate & Release | SPEC REVISED | Testes E2E (Chromium/WebKit), governança branch/PR, validação integrada pré-deploy, publicação sem recompilação, Quality Gate bloqueante no GitHub Actions. |
| 005 | Make coordination & documentation | POSTPONED | Cloud webhook integration, final README hero, and delivery review (deferred by user instruction). |

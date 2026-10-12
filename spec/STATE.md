# Project State & Delivery Roadmap

## Current Status
- **Active Slice**: `007-e2e-ci-release`
- **Status**: SPEC REVISED — requisitos, design, tarefas e verificação atualizados com correções de rastreabilidade e alinhamento ao código real. Aguardando aprovação do mantenedor e comando `go 007` para início da implementação.
- **Latest Checkpoint**: Slice 006 concluído e verificado (58/58 testes unitários/geométricos históricos verdes). Slice 007 com especificação canônica revisada e corrigida (alinhada ao código-fonte real do repositório), critérios verificáveis e zero implementações não autorizadas.
- **Verification Boundary**: revisão documental não é aprovação de implementação, E2E, baselines ou hardware. Guia DOM iOS atual encobre o canvas; correção test-first prevista no 007. Main sem proteção (`protected:false`, consulta 2026-10-12); implantação/proteção/guardas permanecem PENDING. Esta sincronização documental em main é exceção solicitada com `[skip ci]`, sem deploy.

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

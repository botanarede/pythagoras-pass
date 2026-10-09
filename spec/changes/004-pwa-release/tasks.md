# Slice 004: Tasks (Test-First Order)

## Task Checklist
- [x] **TASK-001**: Write unit test suite `tests/pwa.test.ts` verifying PWA manifest compliance and hook contracts. [REQ-004-MANIFEST, REQ-004-OFFLINE, REQ-004-INSTALL]
- [x] **TASK-002**: Generate compliant icon assets in `public/` (`icon.svg`, `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`, `apple-touch-icon.png`).
- [x] **TASK-003**: Configure `vite.config.ts` with `VitePWA` plugin, manifest, workbox precaching, and dev options.
- [x] **TASK-004**: Implement `usePWAInstall.ts`, `useOnlineStatus.ts`, `PWAInstallButton.tsx`, and `OfflineIndicator.tsx` (GREEN).
- [x] **TASK-005**: Mount `PWAInstallButton` in `Header.tsx` and `OfflineIndicator` in `App.tsx`.
- [x] **TASK-006**: Configure GitHub Actions static deployment workflow `.github/workflows/deploy.yml`.
- [x] **TASK-007**: Run full verification protocol `node scripts/ralph-loop.mjs --full`, record evidence in `verification.md`, and update `PRODUCT.md` and `STATE.md`.

# Slice 004: PWA Offline & GitHub Actions Cloud Release - Requirements

## Intent
Deliver full Progressive Web App (PWA) compliance: installable Web App Manifest, Service Worker with precaching and offline replay capabilities, compliant icon assets (192x192, 512x512, maskable, apple-touch-icon), in-app install button (`PWAInstallButton`), offline status indicator (`OfflineIndicator`), and GitHub Actions deployment configuration for static release.

## Scope
- Web App Manifest: `id`, `name: "Lançamento de Pitágoras"`, `short_name: "Pitágoras"` (≤ 12 chars), `display: "standalone"`, `start_url: "/"`, `theme_color: "#020617"`, `background_color: "#020617"`.
- Service Worker via `vite-plugin-pwa` precaching HTML, CSS, JS, fonts, and icon assets with runtime caching.
- Icon assets in `public/`:
  - `public/icon.svg` (crisp vector logo)
  - `public/pwa-192x192.png`
  - `public/pwa-512x512.png`
  - `public/pwa-maskable-512x512.png`
  - `public/apple-touch-icon.png`
- React hooks and components:
  - `src/hooks/usePWAInstall.ts`: handles `beforeinstallprompt`, suppresses itself in standalone mode, provides iOS Safari guidance.
  - `src/hooks/useOnlineStatus.ts`: detects online/offline connectivity.
  - `src/components/PWAInstallButton.tsx`: in-app install button mounted in Header.
  - `src/components/OfflineIndicator.tsx`: non-intrusive offline connectivity notification.
- CI/CD workflow in `.github/workflows/deploy.yml` for static release to GitHub Pages.

## Non-Goals in Slice 004
- Make coordination webhook script (deferred to Slice 005).
- Remote deployment without user authorization.

## Requirement Identifiers & Scenarios

### REQ-004-MANIFEST: Compliant Web App Manifest
- **Scenario 1 (Manifest Validation)**:
  - *Given* the application build
  - *Then* manifest includes `id`, `name`, `short_name` (≤ 12 chars), `start_url`, `scope`, `display: standalone`, `theme_color`, `background_color`, and 192/512 icon entries with separated any/maskable purposes.

### REQ-004-OFFLINE: Service Worker & Precaching
- **Scenario 1 (Offline Replay)**:
  - *Given* an installed PWA or previously loaded page without network connection
  - *When* the user loads the game
  - *Then* the service worker serves precached shell and assets, allowing full game play without server roundtrips.
- **Scenario 2 (Offline Indicator)**:
  - *Given* connectivity transitions to offline
  - *Then* `OfflineIndicator` displays an amber non-blocking status banner informing the player.

### REQ-004-INSTALL: In-App Install Prompt
- **Scenario 1 (Desktop & Android Install Prompt)**:
  - *Given* a browser supporting `beforeinstallprompt`
  - *When* the app is not yet installed
  - *Then* `PWAInstallButton` appears in Header and triggers native prompt on click.
- **Scenario 2 (Suppression in Standalone Mode)**:
  - *Given* app is running in `display-mode: standalone`
  - *Then* `PWAInstallButton` automatically hides itself.

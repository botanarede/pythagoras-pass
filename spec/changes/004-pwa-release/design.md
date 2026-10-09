# Slice 004: PWA Offline & GitHub Actions Cloud Release - Design

## 1. Vite PWA Architecture
We configure `vite-plugin-pwa` in `vite.config.ts`:
- `registerType: 'autoUpdate'`
- `includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png']`
- `manifest`:
  ```json
  {
    "id": "/",
    "name": "Lançamento de Pitágoras",
    "short_name": "Pitágoras",
    "description": "Jogo educativo de futebol da RALECAB GAMES ensinando o Teorema de Pitágoras.",
    "theme_color": "#020617",
    "background_color": "#020617",
    "display": "standalone",
    "start_url": "/",
    "scope": "/",
    "icons": [
      {
        "src": "/pwa-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/pwa-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/pwa-maskable-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
      }
    ]
  }
  ```
- `workbox`:
  `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']`
- `devOptions`:
  `enabled: true` (for testability in development and build environments)

## 2. In-App Install & Offline Hooks
1. `src/hooks/usePWAInstall.ts`:
   - State: `isInstallable`, `isInstalled`, `isIOS`.
   - Listens for `beforeinstallprompt` and `appinstalled`.
   - Detects `display-mode: standalone`.
2. `src/hooks/useOnlineStatus.ts`:
   - Listens for `online` and `offline` browser window events.
3. `src/components/PWAInstallButton.tsx`:
   - Mounts prominently in the Header.
   - Shows install icon and button text.
   - Hides in standalone mode.
   - On iOS Safari, provides modal guide with "Share" $\to$ "Add to Home Screen" instructions.
4. `src/components/OfflineIndicator.tsx`:
   - Fixed amber status badge notifying of offline cached operation.

## 3. GitHub Pages Release Workflow
`.github/workflows/deploy.yml`:
- Trigger: `push` to `main` (configured for manual or automated execution).
- Steps: Checkout, Node 22 setup, `npm ci`, `npm run lint`, `npm test`, `npm run build`.
- Deploys `dist` directory via `actions/deploy-pages@v4`.

## 4. Test Strategy
- Unit tests in `tests/pwa.test.ts`:
  - Validates manifest configuration values (`id`, `name`, `short_name <= 12`, `display: standalone`, icon entries).
  - Validates hook logic for online/offline events and prompt handling.
- Build test: `npm run build` generates `sw.js` and `workbox-*.js` alongside `dist/manifest.webmanifest`.

export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

export interface PwaManifestConfig {
  id: string;
  name: string;
  short_name: string;
  description: string;
  theme_color: string;
  background_color: string;
  display: 'standalone' | 'fullscreen';
  start_url: string;
  scope: string;
  icons: ManifestIcon[];
}

export const PWA_MANIFEST: PwaManifestConfig = {
  id: '/',
  name: 'Lançamento de Pitágoras',
  short_name: 'Pitágoras',
  description: 'Jogo educativo de futebol da RALECAB GAMES ensinando o Teorema de Pitágoras através de passes precisos.',
  theme_color: '#020617',
  background_color: '#020617',
  display: 'standalone',
  start_url: '/',
  scope: '/',
  icons: [
    {
      src: '/pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/pwa-maskable-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};

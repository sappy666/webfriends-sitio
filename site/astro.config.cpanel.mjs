// @ts-check
// Build estático para hosting cPanel/Apache: sin adaptador de Cloudflare ni
// admin de Keystatic (requieren servidor). Uso: npm run build:cpanel
// y subir el contenido de dist/ a public_html.
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import legacySlugRedirects from './integrations/legacy-slug-redirects.mjs';

export default defineConfig({
  site: process.env.SITE_URL || 'https://webfriends.cl',
  output: 'static',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/keystatic'),
    }),
    legacySlugRedirects({ format: 'htaccess' }),
  ]
});

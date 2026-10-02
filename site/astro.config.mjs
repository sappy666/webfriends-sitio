// @ts-check
// Sitio 100% estático para el hosting (cPanel/Apache). `npm run build` deja todo en dist/,
// que se sube tal cual a public_html. Los contenidos se editan en src/content/ (YAML/Markdown).
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import legacySlugRedirects from './integrations/legacy-slug-redirects.mjs';

export default defineConfig({
  site: process.env.SITE_URL || 'https://webfriends.cl',
  output: 'static',
  integrations: [
    sitemap(),
    legacySlugRedirects(),
  ],
});

// @ts-check
// Sitio 100% estático para el hosting (cPanel/Apache). `npm run build` deja todo en dist/,
// que se sube tal cual a public_html. Los contenidos se editan en src/content/ (YAML/Markdown).
import { defineConfig } from 'astro/config';
import legacySlugRedirects from './integrations/legacy-slug-redirects.mjs';
import singleSitemap from './integrations/single-sitemap.mjs';

export default defineConfig({
  site: process.env.SITE_URL || 'https://webfriends.cl',
  output: 'static',
  // CSS dentro del HTML: sin peticiones que bloqueen el primer pintado (PageSpeed).
  build: { inlineStylesheets: 'always' },
  integrations: [
    singleSitemap(),   // un solo dist/sitemap.xml, sin páginas noindex
    legacySlugRedirects(),
  ],
});

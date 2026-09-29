// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import legacySlugRedirects from './integrations/legacy-slug-redirects.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://site.webfriendschile.workers.dev',
  adapter: cloudflare(),
  output: 'server',
  integrations: [
    react(),
    keystatic(),
    sitemap({
      filter: (page) => !page.includes('/keystatic'),
    }),
    legacySlugRedirects(),
  ]
});
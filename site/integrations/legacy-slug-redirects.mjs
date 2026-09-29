import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'js-yaml';

/**
 * Genera dist/client/_redirects (formato nativo de Cloudflare) a partir del
 * campo previousSlugs de cada singleton de página, para que las URLs viejas
 * respondan con un 301 real hacia el slug actual y no se pierda el SEO
 * acumulado cuando alguien cambia una URL desde Keystatic.
 */
export default function legacySlugRedirects() {
  return {
    name: 'legacy-slug-redirects',
    hooks: {
      'astro:build:done': async () => {
        const contentDir = join(process.cwd(), 'src/content/site');
        const files = readdirSync(contentDir).filter(
          (f) => f.startsWith('page-') && f.endsWith('.yaml')
        );

        const lines = [];
        for (const file of files) {
          const data = load(readFileSync(join(contentDir, file), 'utf8'));
          if (!data?.urlSlug) continue;
          for (const oldSlug of data.previousSlugs ?? []) {
            const from = `/${String(oldSlug).replace(/^\/+|\/+$/g, '')}`;
            const to = `/${data.urlSlug}`;
            if (from !== to) lines.push(`${from} ${to} 301`);
          }
        }

        // Artículos del blog: previousSlugs en el frontmatter → /blog/<slug>.
        const blogDir = join(process.cwd(), 'src/content/blog');
        for (const file of readdirSync(blogDir).filter((f) => /\.(md|mdoc)$/.test(f))) {
          const fm = readFileSync(join(blogDir, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
          const data = fm ? load(fm[1]) : null;
          const to = `/blog/${file.replace(/\.(md|mdoc)$/, '')}`;
          for (const old of data?.previousSlugs ?? []) {
            const from = `/${String(old).replace(/^\/+|\/+$/g, '')}`;
            if (from !== to) lines.push(`${from} ${to} 301`, `${from}/ ${to} 301`);
          }
        }

        if (lines.length > 0) {
          writeFileSync(join(process.cwd(), 'dist/client/_redirects'), lines.join('\n') + '\n');
        }
      },
    },
  };
}

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';

/**
 * Genera un único dist/sitemap.xml (sin índice ni partes) a partir de las páginas compiladas.
 * - Omite las páginas con <meta name="robots" content="noindex..."> (productos ocultos, etc.).
 * - Los artículos del blog llevan <lastmod> con su fecha (campo `updated` o `date` del frontmatter).
 * robots.txt apunta a este archivo (src/pages/robots.txt.ts).
 */
export default function singleSitemap() {
  let site = '';
  return {
    name: 'single-sitemap',
    hooks: {
      'astro:config:done': ({ config }) => { site = config.site; },
      'astro:build:done': async ({ dir, pages }) => {
        const outDir = fileURLToPath(dir);

        // Fechas de los artículos: blog/<slug>/ → AAAA-MM-DD
        const lastmod = {};
        const blogDir = join(process.cwd(), 'src/content/blog');
        for (const file of readdirSync(blogDir).filter((f) => /\.(md|mdoc)$/.test(f))) {
          const fm = readFileSync(join(blogDir, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
          const data = fm ? load(fm[1]) : null;
          const d = data?.updated ?? data?.date;
          if (d) lastmod[`blog/${file.replace(/\.(md|mdoc)$/, '')}/`] = new Date(d).toISOString().slice(0, 10);
        }

        const urls = [];
        for (const { pathname } of pages) {
          const html = join(outDir, pathname, 'index.html');
          if (!existsSync(html)) continue; // 404, llms.txt, robots.txt y otros que no son páginas
          if (/<meta name="robots" content="noindex/.test(readFileSync(html, 'utf8'))) continue;
          urls.push({ loc: new URL(pathname, site).href, lastmod: lastmod[pathname] });
        }
        urls.sort((a, b) => a.loc.localeCompare(b.loc));

        const body = urls
          .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
          .join('\n');
        writeFileSync(
          join(outDir, 'sitemap.xml'),
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
        );
      },
    },
  };
}

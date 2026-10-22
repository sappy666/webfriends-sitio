import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';

/**
 * Genera un único dist/sitemap.xml (sin índice ni partes) a partir de las páginas compiladas.
 * - Omite las páginas con <meta name="robots" content="noindex..."> (productos ocultos, etc.).
 * - Los artículos del blog llevan <lastmod> con su fecha (campo `dateModified`, `updated` o `date` del frontmatter).
 * - Páginas y productos lo toman de `dateModified` en su YAML; blog/ y autor/<id>/, del artículo más reciente que enlazan.
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
        // Explicit editorial dates: never substitute the build date.
        const pageDir = join(process.cwd(), 'src/content/site');
        for (const file of readdirSync(pageDir).filter((f) => /^page-.*\.yaml$/.test(f))) {
          const data = load(readFileSync(join(pageDir, file), 'utf8'));
          if (!data?.dateModified) continue;
          const date = new Date(data.dateModified);
          if (!Number.isFinite(+date) || +date > Date.now()) {
            throw new Error(`Invalid or future dateModified in ${file}`);
          }
          const pathname = data.urlSlug ? `${data.urlSlug}/` : '';
          lastmod[pathname] = date.toISOString().slice(0, 10);
        }

        // Fichas de producto: producto/<archivo>/ con su `dateModified`.
        const productDir = join(process.cwd(), 'src/content/productos');
        for (const file of readdirSync(productDir).filter((f) => /\.yaml$/.test(f))) {
          const data = load(readFileSync(join(productDir, file), 'utf8'));
          if (!data?.dateModified) continue;
          const date = new Date(data.dateModified);
          if (!Number.isFinite(+date) || +date > Date.now()) {
            throw new Error(`Invalid or future dateModified in productos/${file}`);
          }
          lastmod[`producto/${file.replace(/\.yaml$/, '')}/`] = date.toISOString().slice(0, 10);
        }

        const blogDir = join(process.cwd(), 'src/content/blog');
        for (const file of readdirSync(blogDir).filter((f) => /\.(md|mdoc)$/.test(f))) {
          const fm = readFileSync(join(blogDir, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
          const data = fm ? load(fm[1]) : null;
          const d = data?.dateModified ?? data?.updated ?? data?.date;
          // Nunca una fecha futura: un lastmod posterior al día de compilación no es válido.
          const day = new Date(Math.min(+new Date(d), Date.now())).toISOString().slice(0, 10);
          if (d) lastmod[`blog/${file.replace(/\.(md|mdoc)$/, '')}/`] = day;
        }

        const urls = [];
        for (const { pathname } of pages) {
          const html = join(outDir, pathname, 'index.html');
          if (!existsSync(html)) continue; // 404, llms.txt, robots.txt y otros que no son páginas
          const source = readFileSync(html, 'utf8');
          if (/<meta name="robots" content="noindex/.test(source)) continue;
          let date = lastmod[pathname];
          // Listados del blog (blog/ y autor/<id>/): la fecha del artículo más reciente que enlazan.
          if (!date && /^(blog|autor\/[^/]+)\/$/.test(pathname)) {
            const linked = [...source.matchAll(/href="\/(blog\/[^/"]+\/)"/g)].map((m) => lastmod[m[1]]);
            date = linked.filter(Boolean).sort().at(-1);
          }
          urls.push({ loc: new URL(pathname, site).href, lastmod: date });
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

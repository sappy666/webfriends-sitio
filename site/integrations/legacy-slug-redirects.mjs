import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';

/**
 * Genera _redirects en el directorio de salida del cliente (formato nativo de Cloudflare) a partir del
 * campo previousSlugs de cada singleton de página, para que las URLs viejas
 * respondan con un 301 real hacia el slug actual y no se pierda el SEO
 * acumulado cuando alguien cambia una URL desde Keystatic.
 *
 * Con { format: 'htaccess' } genera en cambio un .htaccess para Apache (cPanel).
 */
export default function legacySlugRedirects({ format = 'cloudflare' } = {}) {
  return {
    name: 'legacy-slug-redirects',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const outDir = fileURLToPath(dir);
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

        if (format === 'htaccess') {
          const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const slash = (to) => (to.endsWith('/') ? to : `${to}/`); // destino final directo, sin 2º salto
          // Un solo RewriteRule por URL antigua; acepta con y sin "/" final.
          const seen = new Set();
          const slugRules = lines
            .map((l) => l.split(' '))
            .map(([from, to]) => [from.replace(/\/+$/, ''), to])
            .filter(([from]) => from && !seen.has(from) && seen.add(from))
            .map(([from, to]) => `RewriteRule ^${escape(from.slice(1))}/?$ ${slash(to)} [R=301,L]`);
          const htaccess = [
            'DirectoryIndex index.html',
            'ErrorDocument 404 /404.html',
            '',
            'RewriteEngine On',
            '',
            '# Dominio canónico: https y sin www',
            'RewriteCond %{HTTPS} off [OR]',
            'RewriteCond %{HTTP_HOST} ^www\\. [NC]',
            'RewriteRule ^(.*)$ https://webfriends.cl/$1 [R=301,L]',
            '',
            '# URLs antiguas (previousSlugs de páginas y artículos)',
            ...slugRules,
            '',
            '# Secciones del WordPress anterior que ya no existen',
            'RewriteRule ^tienda-virtual/?$ /producto/tienda-virtual/ [R=301,L]',
            'RewriteRule ^(category|tag)(/.*)?$ /blog/ [R=301,L]',
            'RewriteRule ^(carrito|mi-cuenta|categoria-producto)(/.*)?$ /tienda/ [R=301,L]',
          ];
          writeFileSync(join(outDir, '.htaccess'), htaccess.join('\n') + '\n');
        } else if (lines.length > 0) {
          writeFileSync(join(process.cwd(), 'dist/client/_redirects'), lines.join('\n') + '\n');
        }
      },
    },
  };
}

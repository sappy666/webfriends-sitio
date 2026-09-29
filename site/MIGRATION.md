# Migración a Astro + Cloudflare + Keystatic

## Estado actual

**✅ Migración completa.** Las 13 páginas + el blog (12 artículos vía Keystatic) ya están en `site/`. Los `.html` sueltos en la raíz del repo quedan como referencia/respaldo, pero ya no son necesarios para servir el sitio — se pueden borrar cuando quieras (ver "Próximo paso" más abajo).

**Hecho:**
- Proyecto Astro inicializado en `site/`, con adaptador `@astrojs/cloudflare` (output `server` + `prerender = true` por página, así todo se sirve como HTML estático salvo el admin de Keystatic).
- `@keystatic/astro` + `@astrojs/react` instalados y configurados (`keystatic.config.ts` en la raíz de `site/`). El admin queda disponible en `/keystatic`.
  - **Actualización:** Keystatic ya corre en modo `github` (`storage.kind: 'github'` en `keystatic.config.ts`), autenticado vía una GitHub App. Esto reemplazó el workaround anterior del adaptador condicional en `astro.config.mjs` — ya no hace falta, porque el modo `github` no depende de `fs` de Node, así que el adaptador de Cloudflare queda activo siempre, tanto en `astro dev` como en `astro build`. Ver la sección "Despliegue en Cloudflare Workers" más abajo para el detalle de secrets y configuración.
- Layout compartido extraído del HTML original a componentes reutilizables:
  - `src/layouts/BaseLayout.astro` — `<head>`, tema (con detección de preferencia del sistema, sin parpadeo), sprite de íconos, header, footer, botones flotantes y scripts base.
  - `src/components/Header.astro`, `Footer.astro`, `Sprite.astro`, `FloatButtons.astro`, `SiteScripts.astro`.
  - `src/styles/global.css` — todo el CSS compartido (tokens, header, footer, hero, cards, pricing, etc.), tomado de `index.html`.
- **Home (`/`)** migrado completo, incluyendo el modal "antes que te vayas".
- **`/seo`** migrado completo (hero con imagen, sección dark-band "SEO local" con 4 pasos, planes de precios, FAQ acordeón). CSS propio de las páginas de servicio en `public/styles/service.css` (compartido para las próximas: google-ads, sitios-web, ux-ui, salud). El acordeón de FAQ (`.faq-item`) se movió a `SiteScripts.astro` porque es común a varias páginas.
- **`/google-ads`** migrado completo (hero con imagen, métricas en texto, dark-band "Cómo trabajamos" de 5 columnas, planes de precios, FAQ). Agregué la variante `.cols-5` y `.metric-n.is-text` al `service.css` compartido.
- **`/sitios-web`** migrado completo (hero con imagen, dark-band "Comercio electrónico", planes de precios). No tenía CSS propio nuevo ni sección FAQ en el original.
- **`/ux-ui`** migrado completo (hero con imagen, "Señales" y "Entregables" con foto, dark-band "Nuestro proceso" en grilla 3×2, FAQ). Agregué la variante `.cols-3-2` al `service.css` compartido.
- **`/salud`** migrado completo (reusa `service.css`, sin CSS propio nuevo).
- **`/casos`** migrado completo. CSS propio en `public/styles/casos.css` (`.case-detail-card`, `.grouped`/`.row`, `.rubro-*`) — también lo usan `/nosotros` y `/terminos` por sus secciones "Cómo trabajamos"/"Modificaciones" en formato lista numerada.
- **`/nosotros`**, **`/contacto`**, **`/terminos`** migrados completos.
- **`/404`** migrado — Astro lo sirve automáticamente como página de error en rutas inexistentes (probado con `wrangler`/`astro preview`).
- **Blog** migrado completo a colección de contenido + Keystatic:
  - `src/content.config.ts` define el schema.
  - Los 12 artículos existentes (`blog-*.html`) se convirtieron a Markdown en `src/content/blog/*.md` con el script `scripts/migrate-blog.mjs` (uso puntual, ya ejecutado — no hace falta volver a correrlo salvo que se re-importe algo).
  - `/blog` — listado con filtro por categoría, orden, búsqueda (+ dictado por voz) y paginación (9 por página), igual que el sitio original.
  - `/blog/[slug]` — detalle del artículo, con barra de progreso de lectura y botón "Escuchar" (texto a voz).
  - Estilos específicos de blog en `public/styles/blog.css` y `public/styles/post.css` (se sirven como archivos estáticos, no como módulo CSS, para no inflar el bundle global).

## Próximo paso (opcional)

Con todo migrado, lo que queda es housekeeping:
1. Borrar los `.html`, `assets/` y `favicon.svg` sueltos de la raíz del repo (ya están duplicados dentro de `site/public/`).
2. Mover el contenido de `site/` a la raíz del repo (o dejarlo en `site/` y configurar ese como directorio raíz en Cloudflare Pages — ver más abajo).

## Cómo seguir editando

1. `cd site && npm run dev` — sirve todo el sitio, incluido `/keystatic` para editar/crear artículos del blog.
2. Cualquier cambio de contenido nuevo (texto, imágenes, secciones) ahora se hace directo sobre los `.astro` en `site/src/pages/`, no sobre los `.html` de la raíz.

## Despliegue en Cloudflare Workers

El proyecto se despliega como **Cloudflare Worker** (no Cloudflare Pages) — `site/wrangler.jsonc` define `main` + `assets` binding, que es el modelo de deploy de Workers, no de Pages.

Deploy manual, una vez logueado (`npx wrangler login`):
```
cd site
npm run deploy
```
(equivalente a `astro build && wrangler deploy`, definido como script `deploy` en `package.json`).

URL de producción actual: `https://site.webfriendschile.workers.dev` (sin dominio propio conectado todavía).

**Keystatic en producción:** corre en modo `github` (`storage.kind: 'github'` en `keystatic.config.ts`), autenticado con una GitHub App creada en la cuenta personal del owner (pendiente de traspasar a la organización `Webfriends26` más adelante). Las credenciales se cargan como secrets del Worker, nunca en archivos del repo:
```
npx wrangler secret put KEYSTATIC_GITHUB_CLIENT_ID
npx wrangler secret put KEYSTATIC_GITHUB_CLIENT_SECRET
npx wrangler secret put KEYSTATIC_SECRET
```
Además, `wrangler.jsonc` necesita el flag `nodejs_compat` en `compatibility_flags` — sin él, `process.env` no existe en el runtime de Workers y Keystatic no puede leer esas credenciales aunque estén cargadas.

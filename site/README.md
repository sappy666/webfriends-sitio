# Webfriends — sitio web

Sitio estático hecho con [Astro](https://astro.build). Se compila a HTML/CSS/JS y se sube tal cual al hosting cPanel (webfriends.cl). No usa servidor, base de datos ni panel de administración.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias (una vez). |
| `npm run dev` | Sitio en local con recarga automática: http://localhost:4321 |
| `npm run build` | Compila el sitio en `dist/`. |
| `npm run preview` | Sirve `dist/` en local para revisar la versión final. |
| `npm run deploy` | Compila y sube `dist/` al hosting por FTPS. |

`npm run deploy` necesita la contraseña FTP en la variable de entorno `FTP_PASS` (en Windows: `[Environment]::SetEnvironmentVariable("FTP_PASS", "...", "User")` y reiniciar la terminal). No sube `.htaccess`, porque el del servidor tiene configuración de PHP de cPanel.

## Dónde editar

| Qué | Dónde |
|---|---|
| Textos de cada página (títulos, secciones, SEO) | `src/content/site/page-*.yaml` |
| Planes y precios | `src/content/plan-sets/*.yaml` |
| Comisión de Google Ads por tramos | `src/data/adsFee.ts` |
| Preguntas frecuentes | `src/content/faqs/*.yaml` |
| Artículos del blog | `src/content/blog/*.md` |
| Casos de éxito y productos de la tienda | `src/content/casos/`, `src/content/productos/` |
| Estructura de cada página | `src/components/pages/*.astro` |
| Estilos globales | `src/styles/global.css` y `src/styles/minimal.css` (capa de diseño actual) |
| Estilos por tipo de página | `public/styles/*.css` (al cambiarlos, subir el `?v=` en el `<link>`) |
| Imágenes de los mockups (laptop/celular) | `public/assets/img/proj/<proyecto>-d.webp` y `-m.webp` |
| Íconos de línea de servicios | `src/data/lineArt.ts` |

El esquema de cada contenido está en `src/content.config.ts`: si un YAML no lo cumple, `npm run build` falla y dice qué campo revisar.

## URLs antiguas

Si cambias el `urlSlug` de una página, agrega el anterior a `previousSlugs`. Al compilar se genera `dist/.htaccess` con las redirecciones 301 (`integrations/legacy-slug-redirects.mjs`). Como `deploy` no sube ese archivo, copia las reglas nuevas al `.htaccess` del servidor cuando cambies una URL.

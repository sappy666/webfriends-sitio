## Proyecto

Sitio Astro 100% estático para hosting cPanel. Sin adaptador, sin CMS, sin React. Ver README.md (comandos y dónde editar).

- Contenido: `src/content/` (YAML/Markdown) validado por `src/content.config.ts`.
- Estilos: `src/styles/global.css` + `src/styles/minimal.css` (capa de diseño vigente; los cambios visuales van aquí). `public/styles/*.css` se cargan por `<link>` en las páginas de servicio/blog/casos.
- Publicar: `npm run deploy` (compila y sube `dist/` por FTPS; no sube `.htaccess`).

## Documentación

https://docs.astro.build — [content collections](https://docs.astro.build/en/guides/content-collections/), [componentes](https://docs.astro.build/en/basics/astro-components/), [estilos](https://docs.astro.build/en/guides/styling/).

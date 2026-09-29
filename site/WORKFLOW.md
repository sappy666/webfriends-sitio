# Flujo de ramas: edición, revisión y publicación

Este documento describe cómo se mantiene y despliega el sitio día a día, una vez que Keystatic (modo `github`) y Cloudflare Workers Builds ya están configurados.

## Ramas

- **`keystatic`** — rama donde Keystatic comitea directamente. Se usa solo para editar contenido desde el panel `/keystatic` (posts, casos de éxito, FAQs, textos de página, SEO). **No tiene deploy automático conectado.**
- **`dev`** — rama de staging. Recibe el contenido de `keystatic` vía Pull Request. Tiene **preview deploy automático** en Cloudflare (se activó "Habilitar compilaciones de vista previa" al conectar el repo a Workers Builds).
- **`main`** — rama de producción. Recibe cambios de `dev` vía Pull Request. Tiene **deploy automático a producción** (`https://site.webfriendschile.workers.dev`) en cada push/merge.

## 1. Edición de contenido (no-técnica, vía Keystatic)

1. Entrar a `https://site.webfriendschile.workers.dev/keystatic`.
2. En el selector de rama (`BranchPicker`) del panel, elegir la rama **`keystatic`**.
3. Editar posts del blog, casos de éxito, FAQs, textos de página (hero, encabezados de sección) o metadatos SEO/GEO.
4. Cada guardado genera un commit directo en la rama `keystatic`. No dispara ningún build.

## 2. Revisión y paso a `dev` (preview)

1. En GitHub, abrir un Pull Request `keystatic → dev`.
2. Revisar el diff.
3. Hacer **Squash and merge**.
4. Esto dispara un build automático de **vista previa** en Cloudflare — URL visible en el dashboard del Worker (Workers & Pages → `site` → Deployments) o en el propio PR si la integración lo comenta.

## 3. Chequeo en preview

Entrar a la URL de preview y revisar visualmente que los cambios se vean bien (textos, imágenes, SEO) antes de tocar producción.

## 4. Publicación a producción

1. Abrir un Pull Request `dev → main` en GitHub.
2. **Squash and merge**.
3. Esto dispara el build de producción automático → se publica solo en `https://site.webfriendschile.workers.dev`. No hace falta correr `wrangler deploy` a mano.

## 5. Mantenimiento técnico (cambios de código)

Cambios que no son de contenido (componentes, layouts, nuevas páginas, dependencias) se manejan igual que cualquier cambio de software:

1. Rama nueva desde `dev` (o directo en `dev` si es un cambio chico).
2. PR de revisión → merge a `dev` (dispara preview) → probar en preview.
3. PR `dev → main` → merge → deploy de producción automático.

## 6. Monitoreo

- **Cloudflare Dashboard → Workers & Pages → `site` → Metrics**: errores, latencia, requests.
- **`npx wrangler tail`** (desde `site/`, con sesión de `wrangler login` activa): logs en vivo del Worker en producción, útil para depurar un problema puntual (por ejemplo, fallas de login de Keystatic).

## Notas pendientes

- **`BranchPicker` de Keystatic**: falta confirmar en vivo si la rama seleccionada (`keystatic`) persiste entre sesiones/navegadores o si hay que reelegirla cada vez que se entra a editar. No asumir — probar y actualizar esta nota con lo observado.
- **Traspaso de administración**: procedimiento completo (repo, GitHub App, colaboradores, Cloudflare) documentado en `README.md` §11 — no ejecutado todavía.

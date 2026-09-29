# Metodología de desarrollo

Este documento describe cómo se construyen cambios de **código** (componentes, layouts,
integraciones, schema de Keystatic, configuración de build/deploy) en el proyecto Webfriends.
Para cambios de **contenido** (textos, imágenes, precios, FAQs), ver
[METODOLOGIA-MANTENIMIENTO.md](./METODOLOGIA-MANTENIMIENTO.md).

---

## 1. Roles

| Rol | Quién | Responsabilidad |
|---|---|---|
| **Product owner** | Dueño del proyecto (Webfriends) | Define qué se construye y por qué. Aprueba merges a `main`. Único que puede tocar el dashboard de Cloudflare y GitHub org settings. |
| **Desarrollador** | Agente (Claude Code) u otro dev humano | Implementa, valida localmente, documenta el porqué en el commit. No decide alcance por su cuenta — si algo no fue pedido explícitamente, se señala en vez de implementarse de más. |
| **Editor de contenido** | Cualquier persona con acceso al panel `/keystatic` | No participa en esta metodología — ver la de mantenimiento. Su trabajo nunca debería requerir tocar código. |

---

## 2. Ramas y su propósito

```
keystatic → dev → main
```

- **`keystatic`** — destino de los commits del panel de administración. El código vive ahí
  también (se sincroniza), pero nunca se desarrolla código directamente en esta rama.
- **`dev`** — rama de trabajo para todo cambio de código. Tiene preview deploy automático en
  Cloudflare Workers Builds.
- **`main`** — producción. Se actualiza solo después de validar en preview.

Regla dura: **el código nunca se edita directo en `main`**. Todo pasa por `dev` primero.

---

## 3. Ciclo de una tarea de desarrollo

1. **Entender el pedido antes de tocar código.** Si hay ambigüedad real (alcance, comportamiento
   esperado, qué pasa con datos existentes), se pregunta antes de implementar — no se asume.
2. **Explorar el código existente** para reusar patrones ya establecidos (ver §5) en vez de
   inventar uno nuevo por tarea.
3. **Implementar en `dev`.**
4. **Validar con un build real antes de commitear.** `npm run build` dentro de `site/` tiene que
   terminar limpio, sin warnings nuevos. Para cambios de ruteo/redirects, se prueba con datos
   temporales (agregar un valor de prueba, verificar el HTML/archivo generado, revertir el dato
   de prueba) antes de dar por buena la implementación.
5. **Commit descriptivo:** el mensaje explica el *porqué*, no solo el qué — especialmente si el
   cambio corrige un bug no obvio (ver ejemplos reales en el historial: el bug de `data.slug`
   reservado por Astro, el bug de `props` no propagados por el prerenderer de Cloudflare).
6. **Push a `dev`.** Dispara el preview deploy automático.
7. **Revisar el preview** antes de tocar `main` — sobre todo en cambios de ruteo, SEO o
   integraciones externas (Cloudflare, Keystatic GitHub App).
8. **Llevar el cambio a `main`.** Cuando `main` y `dev` ya coinciden en contenido salvo por el
   commit nuevo (situación normal en este repo, donde el squash-merge históricamente generó
   hashes distintos pero árboles idénticos), se aplica ese único commit a `main` — no un merge
   masivo de todo el historial divergente.
9. **Sincronizar `keystatic`** con el mismo commit, para que no quede código desactualizado
   esperando el próximo ciclo de contenido (ver por qué en §4).
10. **Nunca dar una tarea por terminada solo porque el build pasó.** Si el cambio es de
    riesgo real (rutas, redirects, SEO, credenciales), se verifica el resultado concreto —
    leer el HTML generado, el archivo `_redirects`, el sitemap — no solo confiar en "no tiró
    error".

---

## 4. Por qué `keystatic` necesita el código al día

La rama `keystatic` es el destino de los commits que genera el panel de administración al
guardar contenido (ver metodología de mantenimiento). Si el código de esa rama queda atrasado
respecto a `main`, el próximo PR `keystatic → dev` mezcla contenido nuevo con una reversión
accidental de código viejo. Mantenerla sincronizada en cada cambio de código evita ese lío.

---

## 5. Patrones establecidos a reusar

- **Slug editable por página:** cada singleton de página en Keystatic tiene `urlSlug` (nunca
  `slug` a secas — Astro reserva `data.slug` para el loader `glob()` y lo absorbe
  silenciosamente) y `previousSlugs`, que genera redirects 301 automáticos vía
  `integrations/legacy-slug-redirects.mjs`.
- **Links de navegación dinámicos:** cualquier link interno a una página con `urlSlug` se
  resuelve en build time contra `getCollection('pages')`, nunca se hardcodea un `href="/algo"`.
  Ver el helper `slug(id)` en `Header.astro`, `Footer.astro`, `index.astro` y
  `blog/[slug].astro`.
- **Páginas de servicio como componentes, no como rutas:** el markup de cada página vive en
  `src/components/pages/*Page.astro`; la ruta real la resuelve `src/pages/[...slug].astro` vía
  `getStaticPaths()`.
- **SEO por página:** `metaTitle`, `metaDescription`, `ogImage` (objeto con imagen subida +
  título/alt/leyenda opcionales) son campos de Keystatic, no texto hardcodeado.
- **Archivos "especiales" (`robots.txt`, `llms.txt`) son endpoints dinámicos**
  (`src/pages/robots.txt.ts`, `src/pages/llms.txt.ts`) que leen contenido de Keystatic, no
  archivos estáticos en `public/`. El `sitemap-index.xml` se genera solo con
  `@astrojs/sitemap`, nunca a mano.

---

## 6. Reglas duras (no negociables sin pedirlo explícitamente)

- No se hacen cambios destructivos (`git reset --hard`, force-push, borrar ramas) sin
  confirmación explícita.
- No se agregan dependencias, abstracciones o "por si acaso" que la tarea no pidió.
- No se hace scope creep: si se detecta un problema relacionado pero no pedido, se señala al
  usuario y se pregunta si lo quiere resuelto ahora — no se implementa solo.
- Todo cambio de código se valida con build real antes de considerarse terminado.
- Los secretos (API keys, tokens) se cargan vía `wrangler secret put`, nunca en archivos
  versionados.

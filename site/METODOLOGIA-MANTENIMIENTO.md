# Metodología de mantenimiento

Este documento describe cómo se mantiene el sitio día a día una vez que Keystatic (modo
`github`), Cloudflare Workers Builds y las 3 ramas ya están configurados: edición de
**contenido**, monitoreo, e incidentes de infraestructura. Para cambios de **código**, ver
[METODOLOGIA-DESARROLLO.md](./METODOLOGIA-DESARROLLO.md).

---

## 1. Roles

| Rol | Quién | Puede hacer |
|---|---|---|
| **Editor de contenido** | Cualquier persona con acceso a `/keystatic` | Editar posts, casos, FAQs, textos de página, SEO por página, `robots.txt`, `llms.txt`, slugs. No necesita saber git. |
| **Revisor** | Product owner o quien delegue | Aprueba los Pull Requests `keystatic → dev` y `dev → main` en GitHub. |
| **Administrador técnico** | Quien tiene acceso a Cloudflare y GitHub org | Gestiona la GitHub App de Keystatic, el dashboard de Cloudflare (Workers Builds, secrets, dominios), colaboradores del repo. |

---

## 2. Edición de contenido (flujo normal, no-técnico)

1. Entrar a `https://<dominio-del-sitio>/keystatic`.
2. En el **BranchPicker** del panel, elegir la rama **`keystatic`** (no `main`, no `dev`).
3. Editar lo que corresponda: posts del blog, casos de éxito, FAQs, textos de página (hero,
   secciones), SEO por página (`metaTitle`, `metaDescription`, imagen Open Graph con su alt),
   `urlSlug`/`previousSlugs` si hay que cambiar una URL, `robots.txt`, `llms.txt`.
4. Cada guardado genera un commit directo en `keystatic`. **No dispara ningún build** — esa
   rama no tiene deploy conectado, es solo el buzón de entrada del contenido.

### Regla especial al cambiar un `urlSlug`

Si se cambia la URL de una página que ya estaba publicada e indexada, **agregar el slug viejo a
`previousSlugs`** de esa misma página antes de guardar. Eso genera un redirect 301 automático
(`_redirects`, formato Cloudflare) y evita perder el SEO acumulado en esa URL. Los links internos
(menú, footer, home, "servicio relacionado" del blog) se actualizan solos — no hace falta tocar
nada más a mano.

---

## 3. Publicar el contenido (revisión y despliegue)

1. **PR `keystatic → dev`** en GitHub. Revisar el diff (qué archivos YAML/MD cambiaron).
2. **Squash and merge.** Dispara un build de **preview** en Cloudflare.
3. **Revisar visualmente el preview** — textos, imágenes, que los links del menú apunten donde
   corresponde si se cambió algún slug, que el `robots.txt`/`llms.txt` se vean bien si se
   tocaron.
4. **PR `dev → main`** en GitHub → **squash and merge** → deploy de producción automático.
   No hace falta correr `wrangler deploy` a mano; el push a `main` lo dispara.

No saltarse el paso de preview salvo que el cambio sea trivial y de bajo riesgo (un typo en un
texto, por ejemplo).

---

## 4. Monitoreo

- **Cloudflare Dashboard → Workers & Pages → `site` → Metrics**: errores, latencia, requests.
- **Cloudflare Dashboard → Workers & Pages → `site` → Settings → Build**: acá viven `Root
  directory` (debe ser `site`), `Build command` (`npm run build`) y `Deploy command`
  (`npx wrangler deploy`). Si el deploy empieza a fallar con "Could not detect a directory
  containing static files" sin haber tocado el repo, revisar primero estos tres campos antes de
  sospechar del código.
- **`npx wrangler tail --format pretty`** (desde `site/`, con `wrangler login` activo): logs en
  vivo del Worker en producción. Útil para depurar un problema puntual mientras se reproduce en
  el navegador (ej. una falla de login del panel de Keystatic).

---

## 5. Incidentes de infraestructura — cómo diagnosticar

1. **Leer el log de build/deploy completo**, no solo la última línea. El error final suele ser
   un síntoma; la causa está unas líneas arriba (ej. "No dependencies detected to cache" es la
   pista de que el `Root directory` está mal configurado, no un problema del código).
2. **Reproducir localmente antes de tocar nada en producción**: `npm run build` en `site/`, y si
   el error es de deploy, `npx wrangler deploy --dry-run --outdir tmp-dry-run` (no gasta
   recursos ni requiere estar logueado). Si el dry-run pasa limpio, el problema casi seguro está
   en la configuración del dashboard, no en el código.
3. **Separar causa raíz de síntoma.** No parchear lo primero que aparece — confirmar qué archivo
   o configuración específica generó el error antes de cambiar algo.
4. **Un error de GitHub API devolviendo 500** (visto durante este proyecto en un push) suele ser
   transitorio del lado del servidor: reintentar el mismo comando antes de asumir un problema
   propio.

---

## 6. Gestión de accesos y secretos

- Los colaboradores del repo se agregan con el rol mínimo necesario: **Write** para quien solo
  hace push/PR, **Maintain** para quien coordina PRs sin necesitar tocar settings, **Admin**
  reservado a quien administra la GitHub App, webhooks y colaboradores.
- Las credenciales del CMS (GitHub App client ID/secret, clave de sesión) se cargan con
  `npx wrangler secret put NOMBRE_VARIABLE` — nunca en un archivo del repo.
- Si un secreto se pegó en texto plano en algún lado por error (chat, terminal, archivo), se
  trata como comprometido y se genera uno nuevo. No se confía en "borrarlo" del lugar donde
  quedó expuesto.

---

## 7. Reglas duras (no negociables sin pedirlo explícitamente)

- Nunca editar contenido directo en `main` o `dev` — siempre vía el panel, comiteando a
  `keystatic`.
- Nunca saltarse el redirect (`previousSlugs`) al cambiar una URL ya indexada.
- Nunca desconectar o modificar la integración de Cloudflare/GitHub sin avisar, aunque parezca
  el atajo más rápido para "solucionar" un error de deploy.
- Ante cualquier duda sobre si algo se rompe en producción, verificar en el preview antes, no
  después.

# Webfriends — sitio web

Sitio de la agencia Webfriends Chile. Astro 7, desplegado como **Cloudflare Worker** (no Pages), con CMS **Keystatic** en modo GitHub para edición de contenido sin tocar código.

Este documento es la referencia central para cualquier persona que tome el repo y siga desarrollando. Para el flujo de ramas y publicación día a día, ver [`WORKFLOW.md`](./WORKFLOW.md). Para el historial de la migración desde el sitio estático original, ver [`MIGRATION.md`](./MIGRATION.md).

## 1. Arquitectura

```
Navegador ──▶ Cloudflare Worker (site.webfriendschile.workers.dev)
                 │
                 ├─ Astro SSR (output: 'server') — renderiza páginas .astro
                 │    con prerender=true por página (HTML estático servido
                 │    desde el edge, no hay SSR real por request salvo /keystatic)
                 │
                 ├─ /keystatic/* — panel de administración (React, SPA)
                 │    corre en el navegador del editor, no en el Worker
                 │
                 └─ /api/keystatic/* — rutas de OAuth (login, callback,
                      refresh-token) entre el panel y GitHub
```

- **Astro** compila cada página a HTML estático en build time (`prerender = true` en cada `.astro`). El adaptador `@astrojs/cloudflare` empaqueta eso como un Worker que sirve esos assets, no un servidor Node tradicional.
- **Keystatic** (`storage.kind: 'github'`) no tiene base de datos propia: cuando alguien edita y guarda en el panel, hace un **commit directo al repo de GitHub** vía la API de GitHub, usando el token OAuth de la sesión del editor. El contenido nuevo llega al sitio recién cuando ese commit se construye y despliega (ver §5 y `WORKFLOW.md`).
- No hay backend propio, base de datos, ni servidor Node persistente. Todo el estado vive en el repo de Git (contenido) + Cloudflare (hosting, secrets, KV para sesión).

## 2. Stack y por qué

| Pieza | Qué es | Por qué |
|---|---|---|
| [Astro 7](https://docs.astro.build) | Framework de sitio, `output: 'server'` | Genera HTML estático por página; solo el panel de Keystatic necesita JS pesado |
| [`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) | Adaptador de deploy | Empaqueta el sitio como Worker con `assets` binding |
| [`@keystatic/core`](https://keystatic.com) + `@keystatic/astro` | CMS | Modo `github`: no requiere backend propio, escribe directo al repo |
| [`@astrojs/react`](https://docs.astro.build/en/guides/integrations-guide/react/) | Integración React | La requiere el panel de Keystatic (`@keystatic/astro` está construido en React) |
| `astro:content` (Content Collections) | Capa de lectura tipada | Astro lee los mismos YAML/MD que Keystatic escribe — ver §4 |
| Cloudflare Workers | Hosting | Deploy edge, sin servidor que mantener; KV para sesión, Images binding para optimización |
| Wrangler | CLI de Cloudflare | Deploy manual (`npm run deploy`) y gestión de secrets |

## 3. Estructura de carpetas

```
site/
├── keystatic.config.ts       # Schema del CMS: qué es editable y sus reglas de validación
├── astro.config.mjs          # Config de Astro (site URL, adapter, integraciones)
├── wrangler.jsonc             # Config del Worker (nombre, compat flags, assets binding)
├── src/
│   ├── content.config.ts     # Schema de lectura (astro:content) — DEBE reflejar keystatic.config.ts
│   ├── content/
│   │   ├── blog/*.md         # Posts (colección "posts" en Keystatic)
│   │   ├── casos/*.yaml      # Casos de éxito
│   │   ├── faqs/*.yaml       # Preguntas frecuentes, filtradas por categoría/página
│   │   ├── plan-sets/*.yaml  # Sets de planes de precios (compartidos entre páginas)
│   │   └── site/
│   │       ├── negocio.yaml            # Datos NAP del negocio (schema.org LocalBusiness)
│   │       ├── proceso-seis-etapas.yaml # Proceso de 6 pasos compartido (home/nosotros/ux-ui)
│   │       └── page-*.yaml             # Un archivo por página: meta SEO, hero, secciones
│   ├── pages/*.astro         # Una ruta por archivo; cada una lee su page-*.yaml
│   ├── layouts/BaseLayout.astro  # <head>, SEO/OG tags, JSON-LD, tema, header/footer
│   ├── components/           # Header, Footer, FaqSchema, LocalBusinessSchema, etc.
│   └── styles/global.css     # Design tokens + estilos compartidos (ver §6)
└── public/styles/             # CSS específico por tipo de página (no es módulo, se sirve tal cual)
    ├── service.css            # Páginas de servicio (seo, ads, sitios-web, ux-ui, salud)
    ├── casos.css               # /casos, /nosotros, /terminos
    ├── blog.css / post.css     # Listado y detalle de blog
```

## 4. Modelo de contenido (Keystatic ↔ Astro)

**Regla de oro: cada cambio de schema se hace en DOS lugares que deben quedar sincronizados manualmente:**

1. `keystatic.config.ts` — define qué campos ve y puede editar un humano en el panel `/keystatic`, con validaciones y labels en español.
2. `src/content.config.ts` — define con Zod qué forma tiene ese mismo contenido cuando Astro lo lee para renderizar. Usa `glob()` loaders que apuntan a los mismos archivos que Keystatic escribe.

No hay generación automática entre ambos: si agregás un campo en uno y no en el otro, o el build de Astro falla (campo requerido ausente) o el campo queda invisible en el panel. Después de tocar cualquiera de los dos, correr `npx astro sync` y `npm run build` antes de dar por terminado el cambio.

### Colecciones (múltiples entradas)

| Colección | Formato | Dónde vive | Qué es |
|---|---|---|---|
| `posts` | Markdown (`.md`, contenido en Markdoc) | `src/content/blog/*.md` | Artículos del blog. **Extensión debe ser `.md` explícito** (`fields.markdoc({ extension: 'md' })`) — si se omite, Keystatic espera `.mdoc` y no lista los posts aunque el sitio los renderice igual. |
| `casos` | YAML | `src/content/casos/*.yaml` | Casos de éxito. Campo `featured` decide si aparece en home. |
| `faqs` | YAML | `src/content/faqs/*.yaml` | Preguntas frecuentes. Campo `category` las filtra por página (`seo`/`ads`/`web`/`uxui`/`salud`); `order` define el orden dentro de cada página. |
| `planSets` | YAML | `src/content/plan-sets/*.yaml` | Sets de planes de precios, identificados por `id` (slug del archivo: `desarrollo-web`, `google-ads`, `seo`, `salud`). Una página los referencia por id fijo en su `.astro` (`getEntry('planSets', 'desarrollo-web')`) — **no hay campo de página que liste qué set usa cada una**, está hardcodeado en el `.astro` de esa página. |

### Singletons (una sola entrada)

| Singleton | Dónde vive | Qué es |
|---|---|---|
| `negocio` | `src/content/site/negocio.yaml` | Datos NAP (nombre, dirección, teléfono, zonas) — alimenta el JSON-LD `LocalBusiness` en `LocalBusinessSchema.astro`, se incluye en TODAS las páginas vía `BaseLayout`. |
| `procesoSeisEtapas` | `src/content/site/proceso-seis-etapas.yaml` | Los 6 pasos del proceso de trabajo, compartidos por `index.astro`, `nosotros.astro` y `ux-ui.astro` (cada uno los renderiza con su propio layout visual — arco vs. tarjetas con chips). Editar acá actualiza las tres páginas a la vez. |
| `page-home`, `page-seo`, `page-google-ads`, `page-sitios-web`, `page-ux-ui`, `page-salud`, `page-casos`, `page-nosotros`, `page-contacto`, `page-terminos` | `src/content/site/page-*.yaml` | Uno por página: `metaTitle`, `metaDescription`, `ogImage`, hero (`heroEyebrow`/`heroH1`/`heroLede`) y `sections[]` (una por cada `<h2>` de la página, con `id` fijo que el `.astro` usa para ubicarla, `eyebrow`, `heading`, y opcionalmente `cards[]` y/o `steps[]` si esa sección tiene tarjetas o un proceso numerado). |

### Cómo un `.astro` de página consume esto (patrón repetido en las 9 páginas de contenido)

```astro
---
const page = (await getEntry('pages', 'page-seo'))!.data;
const sec = (id: string) => page.sections.find((s) => s.id === id)!;
const seoPlans = (await getEntry('planSets', 'seo'))!.data.plans;
---
<BaseLayout title={page.metaTitle} description={page.metaDescription} ogImage={page.ogImage}>
  <h1>{page.heroH1}</h1>
  <h2 id="capas-h">{sec('capas-h').heading}</h2>
  {sec('capas-h').cards.map(card => <article><h3>{card.title}</h3><p>{card.description}</p></article>)}
</BaseLayout>
```

Los `id` de sección (`capas-h`, `planes-h`, `cta-h`, etc.) son la clave que une el YAML con el HTML — **no se deben renombrar** sin actualizar el `.astro` correspondiente al mismo tiempo, o `sec(id)!` explota en build (non-null assertion sobre `undefined`).

### Íconos de tarjetas y pasos: NO son editables por diseño

Cada tarjeta/paso tiene un ícono SVG que se asigna **por posición** en el array (`cardsIcons[i]`), hardcodeado en cada `.astro` como una constante local. Esto es intencional: los íconos son una decisión de diseño, no contenido editorial. **Consecuencia práctica: si alguien reordena las tarjetas/pasos desde Keystatic, los íconos van a quedar desalineados** con el texto (el ícono N sigue mostrándose en la posición N, no "sigue" al texto que se movió). No hay validación que lo prevenga — es una limitación conocida, aceptada por simplicidad.

## 5. Cómo edita contenido un editor no técnico

Ver el flujo completo de ramas en [`WORKFLOW.md`](./WORKFLOW.md). Resumen: editar vía `/keystatic` en la rama `keystatic` → PR a `dev` (dispara preview) → PR a `main` (dispara producción). Un guardado en el panel **no publica nada por sí solo** — solo crea un commit; el deploy real ocurre cuando ese commit llega a `main` (Cloudflare Workers Builds).

## 6. Sistema de diseño

Todo vive en `src/styles/global.css` como custom properties CSS (no hay un design-token build step, ni Tailwind, ni CSS-in-JS):

- **Color**: tokens semánticos (`--bg`, `--card`, `--label`, `--label-2`/`--label-3` para jerarquía de texto, `--amber`/`--accent` como color de marca). Cada token tiene una variante redefinida bajo modo oscuro (mismo nombre, otro valor — ver el segundo bloque de `:root` en el CSS, activado por clase, no por `prefers-color-scheme` únicamente).
- **Espaciado y radios**: `--r-sm` a `--r-2xl`, `--pad`, `--maxw` (1120px, ancho máximo de contenido).
- **Tipografía fluida**: `--s--1` a `--s-4`, todos con `clamp()` — escalan solo con el viewport, no hay breakpoints de tamaño de fuente por media query.
- **Motion**: `--spring`/`--ease`/`--soft` son curvas de easing reutilizadas en transiciones y en las animaciones `data-reveal`/`data-reveal-group` (scroll-triggered, implementadas en `SiteScripts.astro`).
- **CSS por tipo de página** vive en `public/styles/*.css` (no en `src/styles/`) a propósito: son archivos estáticos servidos tal cual, no procesados por el bundler de Astro, para no inflar el CSS global de páginas que no los necesitan (ej. `/terminos` no necesita `service.css`).

**No hay Storybook, ni librería de componentes visuales documentada aparte del CSS.** Para ver los patrones visuales disponibles (`.card`, `.cards-4`, `.local-step`, `.plan`, `.rubro-card`, etc.) hay que leer `global.css` + el `.css` de la página relevante en `public/styles/`.

## 7. Reglas y limitaciones (leer antes de tocar código)

- **Nunca commitear secrets.** Client ID/Secret de GitHub y el secreto de sesión de Keystatic viven solo como Worker secrets (`wrangler secret put`), nunca en `.env` versionado ni en `wrangler.jsonc`. Ver §8.
- **`nodejs_compat` es obligatorio** en `compatibility_flags` de `wrangler.jsonc`. Sin él, `process.env` no existe en el runtime del Worker y Keystatic no puede leer las credenciales de GitHub aunque estén cargadas como secrets.
- **YAML: strings con `: ` (dos puntos + espacio) rompen el parser si no van entre comillas.** Ej: `answer: No, y desconfía de quien lo haga: Google no vende...` falla; tiene que ir `answer: "No, y desconfía..."`. Ya pasó dos veces en `faqs/*.yaml`.
- **`content.config.ts` y `keystatic.config.ts` deben mantenerse en sync a mano** (§4) — no hay codegen entre ambos.
- **No editar `sections[].id` de un `page-*.yaml`** sin actualizar el `.astro` que lo consume (`sec('ese-id')`) — es una non-null assertion, un mismatch rompe el build, no falla silenciosamente en runtime.
- **No confundir "guardar en Keystatic" con "publicar".** Un guardado en el panel es un commit a la rama activa (normalmente `keystatic`), no un deploy. Ver `WORKFLOW.md`.
- **El repo vive en `speqio/webfriends` (cuenta personal), no en `Webfriends26/webfriends`** (org original, abandonada a mitad de proyecto por falta de permisos de admin). Si alguien encuentra el repo de la org desactualizado, es esperado — no es el que está en producción. El traspaso de administración a la org queda pendiente (ver `WORKFLOW.md`).
- **`keystatic.config.ts` vive en `site/`, no en la raíz del repo** — por eso el `storage.kind: 'github'` necesita `pathPrefix: 'site/'`. Si alguien mueve el proyecto a la raíz del repo en el futuro, hay que quitar ese `pathPrefix` o todas las colecciones del panel vuelven a aparecer vacías (bug real que ya ocurrió, ver `MIGRATION.md`).
- **No hay tests automatizados** (unit, integration, ni e2e). La única red de seguridad es `npm run build` (falla si Zod rechaza algún YAML/MD contra `content.config.ts`) y revisión visual manual. Si agregás lógica no trivial, considerá si vale la pena un test — hoy no hay convención establecida para dónde ponerlo.
- **Los íconos de tarjetas/pasos no son editables** (ver §4, "Íconos... NO son editables por diseño").
- **Texto legal de `/terminos` está hardcodeado**, deliberadamente fuera de Keystatic — se decidió que cambios legales requieren revisión humana antes de publicarse, no edición libre vía CMS.

## 8. Variables de entorno y secrets

No hay archivo `.env` en este proyecto — todo el estado sensible vive como **Cloudflare Worker secret**, inyectado en runtime, nunca en el repo.

| Variable | Dónde se usa | Cómo se carga |
|---|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | OAuth de la GitHub App que autentica el panel | `npx wrangler secret put KEYSTATIC_GITHUB_CLIENT_ID` |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Idem — intercambio de código por token | `npx wrangler secret put KEYSTATIC_GITHUB_CLIENT_SECRET` |
| `KEYSTATIC_SECRET` | Firma la cookie de sesión del panel | `npx wrangler secret put KEYSTATIC_SECRET` |

**Al cargar un secret, usar `printf` en vez de `echo`:**
```bash
printf '%s' 'valor-exacto-sin-salto-de-linea' | npx wrangler secret put NOMBRE_DEL_SECRET
```
`echo` (bash y PowerShell) agrega un salto de línea al final que queda incluido en el valor, y eso corrompe el intercambio de token OAuth con GitHub de forma silenciosa (el login falla con "Authorization failed" sin más detalle). Ya pasó y costó tiempo de debugging — ver `MIGRATION.md`.

Ver secrets cargados (sin revelar el valor): `npx wrangler secret list`.

## 9. Desarrollo local

```bash
cd site
npm install
npm run dev          # localhost:4321 — incluye /keystatic
```

`astro.config.mjs` usa el adaptador de Cloudflare **siempre**, también en dev — Keystatic en modo `github` no depende de `fs` de Node, así que no hace falta ningún workaround condicional. El panel `/keystatic` en local igual requiere login real contra GitHub (no hay modo "local storage" configurado) — necesitás las credenciales de la GitHub App para probarlo en tu máquina; pedile acceso a quien administre la app.

Comandos útiles:
```bash
npm run build         # build de producción a dist/
npm run deploy        # astro build && wrangler deploy (deploy manual directo)
npx astro sync         # regenera tipos de astro:content tras tocar content.config.ts
npx wrangler tail      # logs en vivo del Worker en producción
npx wrangler secret list
```

## 10. De este estado a un dominio real con hosting cPanel

Este es el punto que más suele confundir: **cPanel no puede alojar este sitio.** cPanel es hosting tradicional (Apache/Nginx + PHP/MySQL sobre un servidor); este proyecto es un **Cloudflare Worker**, una arquitectura completamente distinta (edge, sin servidor propio). No hay manera de "subir" el Worker a un cPanel.

Lo que sí existe casi siempre en un contrato de hosting con cPanel es **control del DNS del dominio** (o, si el dominio está en otro proveedor, control de sus nameservers). Eso es lo único que se necesita tocar ahí. Dos caminos:

### Opción A — Cloudflare administra el DNS del dominio (recomendado)
1. Agregar el dominio (ej. `webfriends.cl`) como sitio nuevo en el dashboard de Cloudflare (cuenta que tenga el Worker).
2. Cloudflare da 2 nameservers propios (ej. `xxx.ns.cloudflare.com`).
3. En cPanel (o en el panel del registrador del dominio, según dónde esté delegado), cambiar los nameservers del dominio a esos dos. Esto mueve **todo** el DNS a Cloudflare — hay que recrear ahí cualquier registro que ya existiera (MX de correo, subdominios, etc.) antes de cortar.
4. Workers & Pages → el Worker `site` → Settings → Domains & Routes → Add Custom Domain → `webfriends.cl` (y/o `www.webfriends.cl`). Cloudflare emite el certificado SSL automáticamente.
5. Verificar que el correo (si usa el mismo dominio, típicamente alojado en el mismo cPanel) siga funcionando: los registros MX se migran igual dentro de la zona DNS de Cloudflare, apuntando al mismo servidor de correo que ya tenían.

### Opción B — El DNS se queda en cPanel, solo se apunta al Worker (si no se puede/quiere delegar nameservers)
1. En Workers & Pages → el Worker → Settings → Triggers, Cloudflare da una URL de "custom domain" tipo `site.webfriendschile.workers.dev` — para usar un dominio propio sin mover nameservers hace falta un plan de Cloudflare que soporte "Fallback origin" / Cloudflare for SaaS, o poner el dominio completo detrás de Cloudflare igual (Opción A es la vía soportada y gratuita; esta opción B es más compleja y con más fricción de certificados — evaluarla solo si mover nameservers no es viable por política de la organización).

### Qué NO hay que hacer
- No hay que "exportar" el sitio a HTML estático plano y subirlo por FTP a cPanel — se pierde toda la lógica server-side de Astro (aunque hoy casi todo es `prerender=true`, el panel `/keystatic` y las rutas `/api/keystatic/*` sí necesitan el runtime del Worker) y el sitio quedaría sin CMS funcional.
- No hay que instalar Node.js en el cPanel para "correr" el proyecto ahí — el adaptador es específicamente para el runtime de Cloudflare Workers (V8 isolates), no para Node.

### Pendiente de decisión (no resuelto en este documento)
Quién administra el dominio real y si el correo corporativo (`@webfriends.cl` u otro) depende de ese mismo hosting cPanel es información que solo tiene el dueño del negocio — confirmarlo antes de tocar nameservers, porque un corte mal coordinado corta el correo también.

## 11. Próximos pasos: traspaso de administración (pendiente, no ejecutado)

Hoy el repo vive en la cuenta personal `speqio/webfriends` (ver §7) porque la GitHub App no pudo instalarse en el repo original de la organización (`Webfriends26/webfriends`) sin permisos de admin ahí. Esto queda documentado para cuando alguien con esos permisos retome el traspaso. Son **tres transferencias independientes** — repo, GitHub App, y (si corresponde) cuenta de Cloudflare — que no ocurren automáticamente entre sí.

### 11.1 Traspaso del repo

GitHub → repo `speqio/webfriends` → Settings → General → "Transfer ownership" → destino `Webfriends26`.

Después de transferir:
- Actualizar `repo: { owner: 'speqio', name: 'webfriends' }` → `repo: { owner: 'Webfriends26', name: 'webfriends' }` en `keystatic.config.ts` (única línea a tocar).
- Redesplegar (`npm run deploy` o esperar el push a `main` si ya se editó ahí).
- Reconectar el remote local si alguien sigue trabajando desde una copia vieja: `git remote set-url personal https://github.com/Webfriends26/webfriends.git`.

### 11.2 GitHub App bajo el nuevo administrador

Dos caminos, no hace falta elegir de antemano — se evalúa cuando se llegue a este punto:

- **Transferir la App existente**: GitHub → Settings → Developer settings → GitHub Apps → la app usada por Keystatic → General → "Transfer ownership" → org/cuenta destino. Ventaja: el Client ID se mantiene. **No está confirmado si el Client Secret sobrevive la transferencia** — verificar en el dashboard apenas se haga; si no, generar uno nuevo.
- **Crear una App nueva** en la cuenta/org del nuevo administrador (mismo procedimiento que la instalación original, ver `MIGRATION.md`) e instalarla sobre el repo ya transferido.

En cualquiera de los dos casos, si cambia algún valor, recargar los secrets del Worker:
```bash
printf '%s' 'nuevo-client-id' | npx wrangler secret put KEYSTATIC_GITHUB_CLIENT_ID
printf '%s' 'nuevo-client-secret' | npx wrangler secret put KEYSTATIC_GITHUB_CLIENT_SECRET
```
(`KEYSTATIC_SECRET` no depende de la App — solo firma la cookie de sesión — no hace falta tocarlo salvo que se quiera invalidar sesiones activas.)

Si la organización restringe la instalación de GitHub Apps de terceros, la instalación puede quedar como "Request" pendiente de aprobación de un admin de la org — ya pasó una vez con el repo original, no es un bug, es una política de la org que hay que resolver ahí.

### 11.3 Colaboradores y ramas por defecto

**Limitación real que hay que tener presente**: Keystatic no tiene un concepto de "rama por defecto por usuario". El `storage.kind: 'github'` solo acepta `repo`, `pathPrefix` y `branchPrefix` (este último solo prefiltra nombres en el selector de rama del panel, no fija cuál queda activa). Cada editor elige la rama a mano en el `BranchPicker` del panel cada vez que entra — si esa elección persiste entre sesiones no está confirmado (queda como nota pendiente en `WORKFLOW.md`).

La forma práctica de lograr "todo colaborador nuevo trabaja en `keystatic` por defecto" **no es configuración de Keystatic, es permisos de GitHub**:
1. Agregar el colaborador al repo (Settings → Collaborators and teams) con rol **Write** (no Admin, no Maintain — así no puede mergear PRs ni tocar `main`).
2. Configurar **Branch protection rules** sobre `main` y `dev`: exigir Pull Request antes de mergear, sin push directo permitido para roles Write. Esto deja `keystatic` como la única rama donde un colaborador Write puede comitear directo (vía Keystatic o vía git), que es exactamente el flujo que ya se sigue hoy — la protección solo lo hace obligatorio en vez de una convención informal.
3. Instruir al colaborador nuevo: la primera vez que entra a `/keystatic`, verificar en el `BranchPicker` que la rama activa sea `keystatic` antes de guardar cualquier cambio.

### 11.4 Flujo de desarrollo: no cambia

El flujo de ramas (`keystatic` → PR → `dev` → PR → `main`, documentado en `WORKFLOW.md`) es independiente de quién administra el repo, la App o Cloudflare. El traspaso cambia **quién tiene los permisos de admin**, no el proceso — nadie tiene que reaprender nada.

### 11.5 Lado de Cloudflare: sí hay que tocar algo

La cuenta de Cloudflare (dueña del Worker `site`, el KV de sesión, y la conexión de Workers Builds) es **independiente** de quién es owner del repo de GitHub — transferir el repo **no** transfiere el Worker ni nada de Cloudflare.

- **Si el repo cambia de owner pero la cuenta de Cloudflare sigue siendo la misma**: reconectar Workers Builds. Dashboard → Workers & Pages → `site` → Settings → Builds → la conexión al repo queda atada al owner/nombre anterior, hay que reautorizar apuntando a `Webfriends26/webfriends`.
- **Si también cambia quién administra la cuenta de Cloudflare**: agregar al nuevo administrador como miembro de la cuenta (Manage Account → Members) con los permisos que corresponda, en vez de recrear todo desde cero. Si se necesita mover el Worker a una cuenta de Cloudflare completamente distinta (no solo agregar un miembro a la actual), eso requiere gestión con soporte de Cloudflare — no es un botón de autoservicio.
- **Secrets**: si la GitHub App cambió de Client ID/Secret (§11.2), recargarlos en el Worker con `wrangler secret put` como se detalló arriba. `wrangler login` es una sesión por persona/máquina — el nuevo administrador necesita loguearse con su propia cuenta de Cloudflare (o una cuenta de servicio compartida, a decidir) antes de poder correr `wrangler secret put`/`wrangler deploy` desde su máquina.
- El dominio custom y el DNS (§10) no se ven afectados por el traspaso de repo — viven en la cuenta de Cloudflare, se tocan solo si también cambia esa cuenta.

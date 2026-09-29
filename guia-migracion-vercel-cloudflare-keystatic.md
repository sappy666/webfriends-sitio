# Guía: migrar un sitio Astro de Vercel a Cloudflare Workers (+ CMS git-based en modo producción)

Guía genérica basada en una migración real (Astro 7 + Keystatic CMS), pensada para
reutilizarse en otros proyectos con stack similar (Astro, Next.js u otro framework con
adapter de Cloudflare, y opcionalmente un CMS "git-based" tipo Keystatic/TinaCMS/Decap CMS).

No es específica de un proyecto — reemplazá nombres de repo, dominios y paths de ejemplo
por los tuyos.

---

## Parte 1 — Migrar el hosting: Vercel → Cloudflare Workers

### Por qué considerar este cambio

- **Ancho de banda**: el plan gratuito de Vercel (Hobby) tiene tope de 100GB/mes y es solo
  para uso personal/no comercial. El plan gratuito de Cloudflare no tiene ese techo de
  ancho de banda y sí permite uso comercial.
- **Costo a largo plazo**: si el proyecto va a escalar en tráfico sin presupuesto para
  planes pagos, Cloudflare tiene menos probabilidad de forzar una tarjeta de crédito.

### Paso 0 — Verificar que no haya acoplamiento al hosting viejo

Antes de tocar nada, buscá en el código si hay algo que dependa de APIs específicas del
hosting actual:

```bash
grep -rn "Astro.locals\|context.locals\|@astrojs/vercel" src/
```

Si el proyecto es 100% estático (páginas generadas con `getStaticPaths()`, sin
`Astro.locals` custom, sin ISR/edge config específico), la migración es mecánica. Si hay
lógica server-side atada a APIs del hosting viejo, hay que revisar esa parte aparte.

### Paso 1 — Cambiar el adapter

```bash
npm uninstall @astrojs/vercel
npm install @astrojs/cloudflare
npm install --save-dev wrangler
```

En el archivo de config del framework (`astro.config.mjs` en Astro):

```js
// antes
import vercel from '@astrojs/vercel';
export default defineConfig({ adapter: vercel() });

// después
import cloudflare from '@astrojs/cloudflare';
export default defineConfig({ adapter: cloudflare() });
```

### Paso 2 — Actualizar el framework si hace falta

Si el build tira un error tipo `MISSING_EXPORT` o similar al usar el nuevo adapter, **no
asumas que el adapter está roto** — probá primero actualizar el framework a su última
versión patch:

```bash
npm install astro@latest
```

Los rangos de `peerDependencies` de un adapter suelen quedar más laxos de lo que la
versión instalada realmente necesita a nivel de API interna — un adapter reciente puede
llamar a una función que se agregó recién en un patch del framework.

### Paso 3 — Crear la config de Wrangler

Cloudflare fue deprecando el flujo clásico de "Pages" (dashboard con integración git) en
favor de **Cloudflare Workers** para frameworks modernos. Antes de configurar nada a mano,
**corré un build real y mirá qué genera el adapter** — muchas veces ya deja un
`wrangler.json`/config de referencia dentro de la carpeta de salida del build (ej.
`dist/server/wrangler.json` en el caso de Astro) que revela la config exacta esperada
para la versión instalada.

Config mínima típica en la raíz del proyecto (`wrangler.jsonc`):

```jsonc
{
  "name": "mi-proyecto",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2026-01-01", // usar la fecha actual
  "compatibility_flags": ["nodejs_compat"]
}
```

`nodejs_compat` hace falta si alguna dependencia usa APIs de Node (crypto, streams, etc.)
en su código server-side — CMSs y librerías de auth suelen necesitarlo.

### Paso 4 — Validar antes de desplegar de verdad

```bash
npm run build
npx wrangler deploy --dry-run --outdir tmp-dry-run
```

El `--dry-run` bundlea y valida todo (incluyendo bindings automáticos como KV/Images que
algunos adapters provisionan solos) **sin necesitar estar logueado ni gastar ningún
recurso real**. Si pasa esto, el deploy real casi seguro funciona.

Limpiar después: `rm -rf tmp-dry-run` (agregar también `.wrangler/` al `.gitignore` — es
el cache local de Miniflare para `wrangler dev`).

### Paso 5 — Login y deploy real

```bash
npx wrangler login      # abre el navegador, autoriza con la cuenta de Cloudflare
npx wrangler whoami      # confirma qué cuenta quedó autenticada
npx wrangler deploy      # sube el contenido de dist/ generado por el último build
```

Importante: **`wrangler deploy` no compila nada por sí solo** — siempre corré el build
del framework inmediatamente antes.

Agregar como scripts de conveniencia en `package.json`:

```json
{
  "scripts": {
    "deploy": "wrangler deploy",
    "cf:preview": "wrangler dev"
  }
}
```

### Paso 6 — Automatizar el deploy en cada push (equivalente a lo que Vercel hacía solo)

El reemplazo actual de "conectar el repo y que compile en cada push" para Workers se
llama **Workers Builds**: Cloudflare Dashboard → tu Worker → Settings → Builds → Connect.
Requiere que exista un archivo de config de Wrangler en el repo con un `name` que
coincida con el nombre del Worker en el dashboard, o el build falla. Soporta preview
deployments por rama/PR.

### Paso 7 — Manejar el hosting viejo durante la transición

Si el repo viejo (Vercel) sigue conectado a la misma rama (`main`), va a intentar
reconstruir en cada push y **puede fallar ruidosamente** en cuanto el adapter viejo
desaparezca de `package.json`. Decidí explícitamente antes de pushear:
- Desconectar la integración de Vercel del repo, o
- Aceptar que falle (si ya no te importa ese hosting), o
- Posponer el push hasta estar listo para cortar del todo.

No dejes que sea una sorpresa vía notificación de "build failed".

---

## Parte 2 — CMS git-based en modo "producción real" (ej. Keystatic, y el patrón aplica a Decap/TinaCMS)

Aplica si tenés un CMS que en su modo por defecto ("local"/"local-storage") solo escribe
archivos en el disco de quien lo corre — útil en desarrollo, pero inútil en producción
porque un proceso serverless no tiene disco persistente.

### El cambio de modelo

- **Modo local**: vos corrés el CMS localmente → escribe archivos → vos hacés `git push` a mano.
- **Modo GitHub** (o equivalente git-remoto): el CMS corre en producción → al guardar, se
  autentica contra la API de GitHub → comitea el archivo directo al repo → eso dispara el
  build automático de siempre.

### Paso 1 — Crear una GitHub App (no una OAuth App clásica)

En GitHub → Settings → Developer settings → **GitHub Apps** → New GitHub App:

| Campo | Valor |
|---|---|
| Homepage URL | la URL de producción del sitio |
| Callback URL | depende del CMS — **verificar el path exacto en el código del CMS instalado** (ver Paso 2) |
| Webhook | desactivado, no hace falta |
| Repository permissions → Contents | Read and write |
| Repository permissions → Metadata | Read-only (obligatorio, GitHub no ofrece "write" para esto — no confundir con metadatos SEO de las páginas, son conceptos totalmente distintos) |
| Where can this GitHub App be installed | Only on this account |

Generar el **Client ID** y un **Client secret** (el secret solo se muestra completo una
vez, en el momento de generarlo — si navegás a otra pantalla se pierde y hay que generar
uno nuevo). Instalar la App en el repo específico (no "todos los repositorios").

⚠️ **Cuidado con confundir un fingerprint con el secret real**: algunos dashboards (GitHub
incluido) muestran un hash/fingerprint de un secret ya generado en su vista de listado —
eso NO es el secret usable, es solo un identificador visual. El secret real siempre tiene
un formato de cadena alfanumérica plana, sin prefijos tipo `SHA256:`.

### Paso 2 — Verificar el path de callback contra el código real, no solo la doc

La documentación pública de un CMS puede estar incompleta o desactualizada respecto a la
versión que tenés instalada. Antes de crear la App, confirmá el path real:

```bash
grep -r "oauth/callback" node_modules/<paquete-del-cms>/dist/
```

Un callback URL mal configurado falla con un error genérico de GitHub
("redirect_uri is not associated with this application") que no te dice cuál es el path
correcto — hay que ir a buscarlo.

### Paso 3 — Cambiar la config de storage del CMS

Ejemplo (Keystatic):

```ts
// antes
storage: { kind: 'local' }

// después
storage: {
  kind: 'github',
  repo: { owner: 'tu-usuario-o-org', name: 'tu-repo' },
}
```

### Paso 4 — Cargar credenciales como secrets, nunca en archivos versionados

```bash
npx wrangler secret put NOMBRE_DE_LA_VARIABLE
```

(el comando pide el valor por stdin — no queda en ningún archivo del repo). Típicamente
se necesitan 3 secrets: client id, client secret, y una clave de sesión propia del CMS
(se puede generar con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).

**Si un secret se llegó a pegar en texto plano en algún lado (chat, terminal, un archivo
por error) — tratalo como comprometido y generá uno nuevo**, no confíes en "borrarlo" del
lugar donde quedó expuesto.

### Paso 5 — Actualizar el propio CMS si hace falta

Este fue el paso menos obvio de toda la migración: **el bug real no estaba en el adapter
de hosting ni en el sitio, sino en una versión vieja del CMS**. El código server-side del
CMS (que corre dentro del mismo Worker/función que sirve el sitio) puede depender de una
API específica del runtime del hosting viejo (por ejemplo, una forma vieja de leer
variables de entorno) que el framework recién dejó de soportar. Si después de migrar el
adapter el CMS tira un error 500 al intentar autenticar o guardar, **probá actualizar el
paquete del CMS a su última versión antes de seguir debuggeando otra cosa**.

### Paso 6 — Diagnosticar un 500 en producción

Un error 500 en el navegador casi nunca dice la causa real en un entorno serverless/edge.
Hay que mirar los logs en vivo del lado del servidor mientras se reproduce la falla:

```bash
npx wrangler tail --format pretty
```

(dejarlo corriendo, reproducir la acción que falla en el navegador, y leer el stack trace
que aparece ahí — no en la consola del navegador ni en la pantalla de error genérica).

---

## Checklist resumido

- [ ] Confirmar que no hay código atado a APIs específicas del hosting viejo (grep).
- [ ] Cambiar el adapter, actualizar el framework si el build lo pide.
- [ ] Crear/verificar la config de Wrangler contra un build real, no contra docs viejas.
- [ ] `wrangler deploy --dry-run` antes del deploy real.
- [ ] `wrangler login` + `wrangler deploy` de prueba manual.
- [ ] Conectar Workers Builds (o el equivalente del hosting elegido) para automatizar.
- [ ] Decidir qué pasa con la integración git del hosting viejo antes de pushear.
- [ ] (Si aplica CMS git-based) Crear la GitHub App con el callback verificado contra el código instalado, no solo la doc.
- [ ] Cargar credenciales solo vía el comando de secrets de la plataforma, nunca en archivos.
- [ ] Si el login/guardado del CMS falla en producción, probar actualizar el propio paquete del CMS antes de asumir que es un problema de config.
- [ ] Diagnosticar cualquier 500 en runtime serverless con el log tail en vivo de la plataforma, reproduciendo la acción en el momento.

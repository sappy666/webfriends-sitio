# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Principal: centros médicos y dentales de Chile.** Es el segmento prioritario confirmado, no solo uno más del catálogo: tiene página propia de primer nivel (`/salud/`), su propio set de planes (`src/content/plan-sets/salud.yaml`) y es la línea con casos reales publicados.

Quien visita es la persona que decide y contrata dentro del centro —dueño, socio o administrador—, no un encargado de marketing: busca resolver captación de pacientes, reservas de hora y presencia digital, y necesita saber cuánto cuesta antes de hablar con nadie.

El sitio también atiende empresas de otros rubros (servicios profesionales, comercio, emprendimiento) con planes de desarrollo web, tienda virtual, SEO y Google Ads. Son audiencia real, pero no gobiernan las decisiones de diseño cuando hay conflicto con el segmento salud.

## Product Purpose

Webfriends es una agencia chilena de marketing digital fundada en 2019. El sitio existe para conseguir contactos cualificados: que una empresa entienda qué se hace, cuánto cuesta y escriba por WhatsApp, formulario o correo.

El éxito del sitio es el contacto iniciado, no la visita. Ese es el punto históricamente débil: el análisis de Clarity del sitio anterior registró 36 sesiones que llegaron a la sección de contacto y prácticamente ningún envío completado.

## Positioning

Las cuatro son vinculantes y el trabajo futuro debe preservarlas:

1. **Especialización en salud.** Plataformas para centros médicos y dentales con reserva de horas, fichas de especialistas y convenios, como línea propia con planes aparte.
2. **Precios publicados en pesos chilenos.** Las páginas de planes muestran montos reales (`/precios/`, `/tienda/`, los sets de planes por servicio). Es inusual entre agencias chilenas y obliga a sostener la transparencia en todo el sitio: nada de "consultar valores".
3. **Trayectoria medible.** Más de $500M gestionados en campañas (2019–2026), más de 150 plataformas desarrolladas, más de 500 clientes, Google Partner hace 7 años.
4. **100% en línea a todo Chile.** Sin oficina pública ni atención presencial: videollamada, correo y WhatsApp. Una empresa de cualquier región se atiende igual que una de Viña.

## Operating Context

- **Contacto:** contacto@webfriends.cl · +56 9 3197 1436 (también WhatsApp). Lunes a viernes, 9:00 a 18:30 (hora de Chile). Compromiso publicado: respuesta en menos de 24 horas hábiles.
- **Domicilio legal:** Viña del Mar, Región de Valparaíso. Es solo domicilio: la calle no se publica y no se presenta como oficina. Por eso el JSON-LD marca `Organization` y no `LocalBusiness`, con Chile como área de servicio (ver `src/content/site/negocio.yaml`).
- **Equipo con nombre propio**, cada uno firma los artículos de su especialidad (`src/data/authors.ts`): Macarena Ramdohr (Diseño UX/UI), Maite Aranda (SEO), Luis Quiroga (Google Ads), Paolo Mori Rojas (Desarrollo web).
- **Proceso de seis etapas** publicado y usado como argumento de venta (`src/content/site/proceso-seis-etapas.yaml`): Descubrimiento, Arquitectura, Diseño, Desarrollo, Control de calidad, Publicación y soporte.
- **Mitad del tráfico es móvil**, y más de la mitad de las sesiones registradas eran bots (476 de 865 en el periodo medido).

## Capabilities and Constraints

**Servicios:** Google Ads · SEO y GEO (posicionamiento en buscadores y en respuestas de IA) · sitios web y tiendas virtuales · plataformas para centros de salud · diseño UX/UI.

**Precios publicados** (CLP; los planes mensuales se informan + IVA):

- Salud: Centro Único $390.000 · Centro con Reservas $590.000 · Red Multisede desde $890.000
- Tienda: One Page Emprende $190.000 · Sitio Emprende $260.000 · Tienda Virtual $460.000; Sitio Empresa y Tienda Virtual Básica van "a cotizar"
- La comisión de Google Ads se calcula por tramos (`src/data/adsFee.ts`)

**Restricciones técnicas duras:**

- Astro 100% estático, sin adaptador, sin servidor, sin base de datos y sin React. Se compila a HTML/CSS/JS y se sube tal cual.
- Hosting cPanel (webfriends.cl); publicación por FTPS con `npm run deploy`, que **no** sube el `.htaccess` de la raíz porque el del servidor tiene configuración PHP de cPanel.
- El único código de servidor es `public/api/contacto.php` (envía los formularios por correo a contacto@webfriends.cl, con honeypot, tiempo mínimo de llenado y límite por IP).
- Todo el contenido vive en `src/content/` como YAML/Markdown validado por `src/content.config.ts`: si un campo no cumple el esquema, el build falla.
- Idioma `es-CL`, tuteo.

**Decisión abierta — panel de administración.** Hoy los textos y precios se editan en el repo. Hay intención de incorporar un CMS, y en la raíz del proyecto existe un andamiaje exploratorio con Keystatic, adaptador de Cloudflare y React que **no está conectado al sitio que se publica**. No está decidido si se adopta, ni cuál. Hasta que se decida, el contenido sigue siendo responsabilidad de quien maneja el repo.

## Brand Commitments

- Nombre **Webfriends** (alterno: Webfriends Chile). Logotipo blanco sobre oscuro (`/assets/img/webfriends-logo.webp`) y negro sobre claro (`/assets/img/logotipo-negro-webfriends.webp`).
- Voz en español de Chile, tuteo, directa y sin jerga: los textos explican en vez de impresionar ("Una línea basta: nosotros te preguntamos el resto").
- Tipografía **Plus Jakarta Sans**, autoalojada en `public/fonts/`. Es la tipografía de la marca, no una elección por defecto.
- Tema claro y oscuro, ambos con soporte real y elección persistida del visitante.
- Perfiles oficiales: LinkedIn `/company/webfriends-chile` · Instagram `@webfriendschile` · Behance `webfriendscl` · Perfil de Empresa de Google.

## Evidence on Hand

**Real y publicable** (ya está en el sitio):

- Más de $500M gestionados en campañas (2019–2026), 150+ plataformas, 500+ clientes.
- Google Partner hace 7 años; calificación 4,4 de 5 en Google con 18 reseñas.
- Casos de éxito con cliente identificado (`src/content/casos/`): CEAPSI, Liv Salud, Familia Salud, Punto Cero Patagonia.
- Logos de clientes reales en `public/assets/img/` y capturas de proyectos en `public/assets/img/proj/`.
- 26 artículos de blog firmados por el equipo, con preguntas frecuentes por servicio.
- Análisis de Clarity del sitio anterior, con datos de campo: `../Analisis-Clarity-y-cambios.md`.

**Lo que no existe y no se debe inventar:** no hay testimonios citables de clientes, ni benchmarks de resultados por cliente, ni cifras de retorno publicables. Las 18 reseñas son de Google y no están transcritas en el sitio. Cualquier cifra nueva debe salir del Perfil de Empresa o de datos que el equipo entregue; no se estima.

## Product Principles

1. **El precio se muestra, no se negocia a puerta cerrada.** Si algo tiene valor conocido, va publicado en pesos. "A cotizar" se reserva para lo que de verdad depende del alcance.
2. **Salud manda cuando hay conflicto.** Ante una decisión que favorece al segmento general y perjudica a un centro médico, gana el centro médico.
3. **El contacto es el resultado.** Toda superficie se juzga por si acerca o aleja el momento de escribir. La fricción se agrega solo cuando el dato que pide se usa de verdad.
4. **Lo estático es una ventaja, no una limitación.** Sin servidor ni base de datos, el sitio debe ser rápido y robusto: eso fue lo que se vino a arreglar del sitio anterior.
5. **Se dice lo que se puede probar.** Las cifras publicadas tienen origen verificable; la ausencia de testimonios no se rellena con texto de relleno.

## Accessibility & Inclusion

No se ha fijado un estándar formal (no hay un nivel WCAG comprometido). Sí hay decisiones aplicadas que el trabajo futuro debe preservar:

- La mitad del tráfico es móvil: las áreas táctiles se ampliaron deliberadamente (botones a 54 px, accesos de contacto a 64 px) tras el análisis de Clarity.
- El contenido es visible por defecto y la animación es mejora progresiva, con red de seguridad: en el sitio anterior un error del motor de animaciones dejaba texto invisible a usuarios reales (57,5% de los errores de JavaScript registrados).
- `prefers-reduced-motion`, enlace para saltar al contenido, etiquetas `sr-only` y foco visible ya están implementados de forma transversal.

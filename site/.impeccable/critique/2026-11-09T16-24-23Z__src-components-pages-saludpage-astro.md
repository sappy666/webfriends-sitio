---
target: /salud/
total_score: 17
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\Webfriends E2\\Documents\\webfriends-nuevo\\webfriends-sitio\\site\\src\\components\\pages\\SaludPage.astro"
target_fingerprint: "sha256:5ed1fb63773dfc274787ce2ffc467f86812d671111fd92a78a199f5eb3fb5bef"
target_path: "C:\\Users\\Webfriends E2\\Documents\\webfriends-nuevo\\webfriends-sitio\\site\\src\\components\\pages\\SaludPage.astro"
timestamp: 2026-11-09T16-24-23Z
slug: src-components-pages-saludpage-astro
---
# Crítica de diseño — /salud/

Método: doble agente aislado (A: revisión de diseño sin detector; B: evidencia determinista).
Limitación: sin automatización de navegador. Nadie vio píxeles. Contenido, orden del DOM, encabezados, textos y JSON-LD son hechos observados sobre el HTML construido; la maquetación y el espaciado están inferidos del CSS.

## CORRECCIÓN POSTERIOR Y ESTADO DE LOS ARREGLOS (misma sesión)

RETIRADO — el P1 "El botón principal del hero no cumple contraste en tema claro (3,12:1)" es
FALSO. Asumí que el fondo del botón seguía siendo --amber #9A5600. No lo es: light.css:14
redefine el botón entero en tema claro con background var(--brand) #FFB020 y color var(--on-brand)
#231600, verificado en el CSS construido. El valor real es 9,68:1 normal y 8,21:1 en hover; ambos
cumplen. La regla del hero (light.css:118) solo repite un color ya puesto. No se tocó nada por esto.

APLICADOS en esta misma sesión, verificados sobre el build:
- P0 planes: RESUELTO. #planes renderiza las 3 tarjetas (1 destacada, "Más elegido") y los tres
  precios ya aparecen en el cuerpo visible. Bajada reescrita para encuadrar la elección. Comentario
  falso de la línea 25 corregido.
- P1 FAQ cita planes invisibles: RESUELTO por el anterior.
- P1 CTA a formulario genérico: RESUELTO. Los CTA de la página llevan /contacto/?interes=salud#form
  (6 enlaces, incluidas las tarjetas); PlanCard acepta href opcional sin romper las otras páginas;
  ContactoPage preselecciona la opción y muestra una línea de confirmación.
- P2 colocación móvil: RESUELTO vía grid-column en service.css, NO renombrando a .step-body, que
  habría heredado display:none y ocultado el contenido entero en móvil.
- Pie 3,71:1 en tema oscuro: RESUELTO. --f-txt-3 de .42 a .5, ahora 4,95:1. Alcance: todo el sitio.
- Menores: og:image:alt ya se emite; dateModified al día; service.css de ?v=9 a ?v=10 en las 6 páginas.

PENDIENTE, no abordado:
- P2 "ninguna prueba del rubro salud": requiere una sección nueva (franja de casos con CEAPSI,
  Liv Salud, Familia Salud). Es diseño aditivo con decisiones reales, no reparación de defecto.
- El rótulo sobre el titular (.eyebrow) choca con el piso de calidad, que lo prohíbe. Se preservó:
  es un patrón de todo el sistema y quitarlo solo aquí rompería la consistencia.
- El interceptor de /contacto/ en SiteScripts.astro:338 nunca se dispara: el patrón exige ?, # o
  fin de cadena tras "contacto" y todo el sitio usa /contacto/ con barra final. Bug preexistente,
  ajeno a esta crítica, sin tocar.

## Puntaje de salud de diseño

Modo: Persuade. Heurísticas 7 y 10 = n/a.

| # | Heurística | Puntaje | Problema clave |
|---|---|---|---|
| 1 | Visibilidad del estado | 2 | "Comparar planes" ancla a #planes, donde no hay nada que comparar |
| 2 | Correspondencia mundo real | 3 | Vocabulario clínico fluido, pero "Inversión" encabeza sección sin cifras |
| 3 | Control y libertad | 3 | Sin trampas; falta señal de llegada tras el salto de ancla |
| 4 | Consistencia y estándares | 1 | #planes = tarjetas en /seo/ y /sitios-web/; aquí = titular + botón |
| 5 | Prevención de errores | 2 | Los 7 CTA van a /contacto/ pelado; el interés cae en "Asesoría general" |
| 6 | Reconocer antes que recordar | 1 | El FAQ cita "Red Multisede" y "todos los planes" sin planes en pantalla |
| 7 | Flexibilidad y eficiencia | n/a | Página de decisión de un solo camino |
| 8 | Estético y minimalista | 3 | Sistema disciplinado; #planes carga peso tipográfico sin contenido |
| 9 | Recuperación de errores | 2 | El único fallo (ancla muerta) falla en silencio |
| 10 | Ayuda y documentación | n/a | El FAQ se puntúa en H6/H2 |
| Total | | 17/32 | 53% → Aceptable (borde inferior) |

## Veredicto de especificidad

El vocabulario está escrito para clínicas chilenas; la arquitectura no. Lo único que convierte esto en página de salud —los precios publicados en CLP— no está en la página.

El texto no es intercambiable (previsión, Fonasa e isapres, fichas de especialistas, agenda por profesional). Pero junto a SeoPage.astro la estructura es el mismo archivo con otros sustantivos: mismos imports en el mismo orden, mismo hero, misma banda de cifras, misma cola. Salud no tiene ni un tipo de sección que la plantilla genérica no tenga; tiene menos (2 cifras contra 4 de SEO, sin grilla de planes).

Barrido determinista: SaludPage.astro y BaseLayout.astro = 0 hallazgos. Las 32 incidencias salen del HTML construido (página + cabecera + pie + CSS compartido). El detector no puede ver una sección que falta: por eso el problema de esta página no aparece en ninguna herramienta automática.

Superposiciones visuales: no existen (sin navegador, sin inyección). No hay pestaña [Human].

## Lo que funciona

1. El patrón Problema/Solución es una invención persuasiva real, no decoración. Imita cómo un dueño diagnostica su propio sitio. Ninguna página hermana lo tiene.
2. El lenguaje del rubro es falsable. salud-01: "Depende del sistema. Si tiene API o permite exportar disponibilidad, sí. Lo revisamos en la reunión inicial antes de comprometer nada." Se niega a sobreprometer, que es lo que gana confianza.
3. Andamiaje accesible consistente: un solo h1, jerarquía sin saltos, cada sección con aria-labelledby a un h2 real, 43 de 66 SVG con aria-hidden, 0 enlaces con nombre vacío o genérico. Verificado sobre el HTML construido.

## Problemas prioritarios

### P0 — #planes no renderiza ningún plan; los precios existen solo en el JSON-LD

SaludPage.astro:6 importa PlanCard, la línea 18 carga saludPlans, y la plantilla no lo usa nunca. La sección #planes (líneas 137-149) renderiza rótulo + h2 + bajada + un botón.

Cuerpo visible: 0 apariciones de 390.000 / 590.000 / 890.000 / "Centro Único".
JSON-LD de la misma página: "name":"Centro Único" … "price":390000; "Centro con Reservas" … "price":590000, con "url":"https://webfriends.cl/salud/#planes".

La página le dice a Google que publica tres precios en #planes y al humano no le dice nada. Rompe 3 de los 4 diferenciadores vinculantes en la página del segmento prioritario, y el principio "El precio se muestra, no se negocia a puerta cerrada": la bajada de #planes ejecuta literalmente la conducta que el principio prohíbe. Daño secundario: discordancia de datos estructurados. El comentario de la línea 25 afirma paridad que no existe.

Arreglo: renderizar la grilla como SeoPage.astro; "Centro con Reservas" ya trae featured: true.
Comando: /impeccable harden src/components/pages/SaludPage.astro

### P1 — El botón principal del hero no cumple contraste en tema claro (3,12:1)

Hallazgo del detector que la revisión de diseño no vio; recalculado y confirmado. light.css:118 → body .hero .btn-accent { color: var(--on-brand) } = #231600 sobre --amber #9A5600 = 3,12:1. El mismo botón fuera del hero es #fff sobre #9A5600 = 5,67:1 (aprueba). .btn mide 16px, bajo el umbral de texto grande, así que aplica 4,5:1. El hover general (#fff sobre #C97800) da 3,40:1, tampoco cumple.

Es el CTA más importante para conversión y solo falla dentro del hero.
Comando: /impeccable audit src/styles/light.css

### P1 — El FAQ cita planes que la página nunca muestra

HTML visible: "Sí, el plan Red Multisede contempla una página por sede". "Red Multisede" aparece una sola vez en el cuerpo visible y es esta respuesta. salud-04: "todos los planes incluyen…". El lector infiere una taxonomía de producto desde una nota al pie y cree que se saltó algo. Se resuelve al arreglar el P0.

### P1 — Los 7 CTA llevan a un formulario genérico que cae en "Asesoría general"

Las 7 apariciones son href="/contacto/" pelado. El formulario ofrece "Plataforma para salud" como quinta de seis opciones, con general por defecto, y no existe relleno por parámetro. Viola "la fricción se agrega solo cuando el dato que pide se usa de verdad".

Arreglo: href="/contacto/?interes=salud#form" y preselección por parámetro.
Comando: /impeccable clarify src/components/pages/ContactoPage.astro

### P2 — Ninguna prueba del rubro salud en la página de salud

0 enlaces href="/casos…" en la página. Tres de los cuatro casos publicados son de salud: CEAPSI, Liv Salud, Familia Salud. Tampoco aparecen "100% en línea a todo Chile", Google Partner, ni la respuesta en menos de 24 horas hábiles. La evidencia más fuerte ya existe y está aprobada.
Comando: /impeccable bolder src/components/pages/SaludPage.astro

### P2 — Colocación móvil del detalle Problema/Solución (inferido, sin verificar en pantalla)

A ≤640px .local-step pasa a grilla de 3 columnas con .local-step-top{display:contents}. El patrón compartido espera .step-body, que recibe grid-column:1 / -1. /salud/ emite `<div class="flujo-detail">`, cuya única regla (service.css:230) no tiene colocación de grilla: cae en fila 2 / columna 1, dimensionada por el número de 1,7rem. Afecta la mejor sección de la página en el dispositivo de la mitad de la audiencia. Confirmar a 390px antes de tocarlo.
Comando: /impeccable adapt src/components/pages/SaludPage.astro

## Banderas rojas por persona

Jordan (primera vez): clic en "Comparar planes" → titular sin nada que comparar; concluye que rompió algo. Lee "Red Multisede" en el FAQ sin haberlo conocido. Llega al CTA sin orden de magnitud y abandona antes que arriesgar una conversación de venta que no puede presupuestar.

Casey (móvil, mitad del tráfico): no obtiene el precio sin llenar un formulario; la respuesta a "cuánto cuesta" es "cuéntanos cómo funciona el tuyo", o sea redactar un mensaje entre pacientes. Lo único fijo en la zona del pulgar es la burbuja de WhatsApp de 52px. Tras el FAQ recibe cuatro tarjetas que invitan a irse.

Riley (pone a prueba): encuentra la contradicción en 30 segundos. El código fuente trae "price":390000 apuntando a #planes y #planes no muestra precios. Lectura: la agencia que promete precios publicados escondió los de salud y se los sigue declarando a Google. Peor que no tenerlos.

Dra. Paulina (dueña de centro, derivada de PRODUCT.md): vino porque esta agencia publica precios. Bajo "Inversión" encuentra "Cuéntanos cómo funciona el tuyo", la misma frase de las otras dos agencias que la cotizaron. Cierra la pestaña. Su pregunta sobre datos de pacientes está bien respondida pero plegada en la posición dos de seis acordeones indistinguibles, cuando para ella es objeción de entrada.

## Observaciones menores

- Pie en tema oscuro: 3,71:1, 6 de los 16 hallazgos de contraste. No es color escrito a mano: --f-txt-3: rgba(242,245,251,.42) sobre negro compone exactamente #666769. Afecta el marcador de posición del correo, los tres encabezados de columna y el copyright. Heredado, no propio.
- .step-toggle no lo crea nadie en todo el código, y el is-open que existe lo aplica otro script a .cards .card. Como .local-steps .step-body{display:none} en móvil, /google-ads/ y /ux-ui/ tendrían ese contenido permanentemente oculto en móvil. Fuera del objetivo de esta crítica y sin verificar en pantalla; si se confirma es más grave que todo lo anterior. /salud/ se salva por accidente, por no usar el patrón compartido.
- Cinco párrafos sustanciales incrustados en el componente mientras el resto vive en page-salud.yaml; quedarían invisibles a un CMS futuro.
- ogImage tiene image pero no alt, así que ogImageAlt llega undefined.
- DeviceShowcase usa project="odontosalud" sin textos alternativos propios. No verificado si OdontoSalud es cliente real: no está en la lista publicable de PRODUCT.md.
- dateModified: 2026-10-19, tres semanas atrás; alimenta el esquema.

Falsos positivos descartados: overused-font es Plus Jakarta Sans, tipografía propia de la marca; pulsing-dot y marquee vienen de CSS compartido y ninguno de los dos elementos existe en esta página (además ambos quedan desactivados bajo prefers-reduced-motion, verificado regla por regla); los dos contrastes del hero a 1,0:1 y 3,43:1 son artefactos de medir el HTML sin JavaScript, antes de que el script fije el tema; el tiny-text de 11,84px son micro-etiquetas (.74rem), no texto corrido.

## Preguntas para considerar

1. Si #planes se borrara entera mañana, ¿qué perdería la página? Nada: prueba de que hoy es un titular haciéndose pasar por sección.
2. ¿Por qué el buscador recibe los precios y el comprador no? Lo que produjo esa asimetría va a repetirse.
3. "Salud manda cuando hay conflicto": nombra una decisión de esta página donde salud haya ganado.
4. Si 36 sesiones llegaron a contacto y casi ninguna convirtió, ¿por qué el remedio sigue siendo "mejor formulario" y no "que sepan el precio antes de llegar al formulario"?
5. El patrón Problema/Solución es lo único original. ¿Por qué vive en cuatro pasos pequeños y no es la columna vertebral de la página?

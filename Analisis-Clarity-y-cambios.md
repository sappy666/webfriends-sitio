# Análisis del informe de Clarity y decisiones aplicadas
**Periodo:** 20/04/2026 – 17/08/2026 · **Proyecto:** Webfriends

---

## 1. Lo primero: el tamaño real de la muestra

| Dato | Valor |
|---|---|
| Sesiones totales | 865 |
| **Sesiones de bots** | **476 (55%)** |
| **Sesiones humanas reales** | **389** |
| Usuarios únicos | 593 |

Más de la mitad del tráfico registrado son bots. Esto significa que cualquier porcentaje del informe calculado sobre 865 sesiones **subestima el problema real por más del doble**. Los porcentajes que siguen los recalculo sobre 389 sesiones humanas cuando corresponde.

Esta proporción de bots es también coherente con el hallazgo original: un sitio con `noindex, nofollow` recibe poco tráfico humano cualificado, y el ruido de rastreadores pesa proporcionalmente más.

---

## 2. Hallazgo crítico: el error de JavaScript confirma el bug de las animaciones

De 40 errores de JavaScript registrados:

| Error | Sesiones | % |
|---|---|---|
| **`cannot read properties of undefined (reading 'opacity')`** | **14** | **35%** |
| `script error.` | 11 | 27,5% |
| **`undefined is not an object (evaluating 'this.effects[l]')`** | **9** | **22,5%** |

Esto es la confirmación técnica exacta de lo que deduje de las capturas de pantalla. En la auditoría v2 escribí que el texto cortado o invisible bajo los bloques de íconos parecía una animación de Elementor que no terminaba de dispararse. Ahora hay evidencia directa:

- `reading 'opacity'` es el motor de animación intentando aplicar opacidad a un elemento que no existe todavía.
- `this.effects[l]` es literalmente el módulo **Motion Effects de Elementor** fallando.

Juntos son el **57,5% de todos los errores del sitio**. No era una hipótesis visual: es un bug reproducible que deja contenido invisible a usuarios reales.

---

## 3. Rendimiento en campo: peor de lo que mostró el laboratorio

| Métrica | Clarity (campo) | Umbral bueno |
|---|---|---|
| **LCP** | **10,94 s** | < 2,5 s |
| INP | 240 ms | < 200 ms |
| CLS | 0,039 | < 0,1 |
| Score | 64,8 | — |

El LCP de campo es de casi **11 segundos con usuarios reales**. PageSpeed había dado 16,4 s en móvil simulado y 3,2 s en escritorio; el dato real se sitúa entre ambos y confirma que el problema no era un artefacto del laboratorio. El INP de 240 ms también está sobre el umbral: la página tarda en responder a las interacciones, consistente con los 4,9 s de trabajo en el hilo principal que reportó Lighthouse.

CLS es el único indicador sano.

---

## 4. Comportamiento: la conversión es el punto más débil

| Evento | Sesiones | % sobre humanas (389) |
|---|---|---|
| Contact us | 36 | 9,3% |
| Outbound click | 31 | 8,0% |
| Show more | 13 | 3,3% |
| Book | 8 | 2,1% |
| Request quote | 8 | 2,1% |
| **Submit form** | **2** | **0,5%** |

**Solo 2 sesiones enviaron el formulario.** Hay 36 sesiones que llegaron a la sección de contacto y 8 que pidieron cotización, pero prácticamente ninguna completó el envío. La caída entre "quiero contactar" y "envié" es casi total.

Otras señales de fricción:

- **Quick back click: 71 sesiones (8,2% del total, ~18% de las humanas).** El usuario entra a una página y vuelve atrás de inmediato: la página no era lo que esperaba o no cargó a tiempo. Con un LCP de 11 s, lo segundo es muy probable.
- **Dead clicks: 57 sesiones (6,6%).** Clics en elementos que parecen interactivos pero no lo son.
- **Profundidad de scroll: 51%.** La mitad inferior de las páginas casi no se ve.
- **Tiempo activo: 78 s de 253 s totales.** Solo el 31% del tiempo hay interacción real; el resto son pestañas abiertas sin atención.
- **Páginas por sesión: 1,82.** Poca navegación entre secciones.

---

## 5. Arquitectura de información: URLs canibalizadas

Las páginas más visitadas revelan un problema estructural serio:

| URL | Sesiones |
|---|---|
| `/` | 380 |
| `/sitios-web/` | 142 |
| **`/plataformas-web/soluciones-web-salud/`** | **101** |
| `/google-ads/` | 87 |
| `/tienda-virtual/` | 73 |
| `/contacto/` | 68 |
| **`/ads/`** | **66** |
| `/desarrollo-web/` | 42 |
| `/contrata-tu-sitio-web/` | 37 |
| `/diseno-ux/` | 35 |
| `/seo/` | 30 |
| `/plataformas-web/` | 17 |

Dos duplicaciones evidentes:

1. **`/google-ads/` (87) y `/ads/` (66)** son el mismo servicio en dos URLs. Entre ambas suman 153 sesiones divididas, compitiendo entre sí en buscadores.
2. **Cuatro URLs para desarrollo web**: `/sitios-web/` (142), `/tienda-virtual/` (73), `/desarrollo-web/` (42), `/contrata-tu-sitio-web/` (37) y `/plataformas-web/` (17). Suman 311 sesiones repartidas en cinco páginas que cuentan variaciones de lo mismo.

Esta dispersión reparte la autoridad de dominio entre URLs que compiten, en vez de concentrarla.

---

## 6. Hallazgo estratégico: el sector salud es el motor real del negocio

Dos datos que apuntan a lo mismo:

**La página de salud es la tercera más visitada de todo el sitio** (101 sesiones), por encima de Google Ads, tienda virtual y contacto. Está enterrada tres niveles abajo, en `/plataformas-web/soluciones-web-salud/`.

**Los referentes confirman la concentración del rubro:**

| Origen | Sesiones |
|---|---|
| livsalud.cl | 63 |
| patagoniapartners.cl | 19 |
| ceapsi.cl | 13 |
| clinit.cl | 9 |
| mq.cl | 9 |
| familiasalud.cl | 5 |

**118 sesiones llegan desde sitios de clientes** (créditos en el pie de página), y la mayoría son del sector salud. Es el segundo canal de adquisición después de Google (260) y por encima de cualquier red social. Facebook aportó 4 sesiones.

---

## 7. Dispositivos: la mitad del tráfico es móvil

| Categoría | % |
|---|---|
| Chrome escritorio | 43,0% |
| **Chrome móvil** | **36,7%** |
| Safari móvil | 7,9% |
| App de Facebook | 3,1% |
| Samsung Internet | 1,6% |
| App de Instagram | 0,2% |

**Aproximadamente el 50% del tráfico es móvil**, incluyendo navegadores embebidos de apps. Es exactamente donde el LCP es peor.

---

## 8. Cambios aplicados al rediseño

| # | Hallazgo | Cambio |
|---|---|---|
| 1 | Mega menú translúcido ilegible | Fondo **opaco** (`--card`), borde más marcado y sombra reforzada. Barra superior de 72% a 92% de opacidad. |
| 2 | Salud es la 3.ª página más vista, enterrada a 3 niveles | **Página propia `salud.html`** en el primer nivel, enlazada desde el mega menú y el pie. Con planes específicos del rubro. |
| 3 | Solo 0,5% envía el formulario | Formulario reducido a **2 campos obligatorios** (nombre y correo) más un mensaje libre. Teléfono, empresa e interés quedan plegados tras un botón opcional. |
| 4 | Dead clicks (6,6%) | Chevrons y estados de hover explícitos en todo lo interactivo; nada decorativo simula ser un botón. |
| 5 | 50% de tráfico móvil | Áreas táctiles ampliadas en móvil: botones a 54 px, accesos de contacto a 64 px. |
| 6 | LCP 10,9 s en campo | Sin imágenes, sin librerías, CSS en el documento, animaciones en el compositor. ~64 KB por página. |
| 7 | Error de `opacity` en animaciones | El contenido es visible por defecto; la animación es mejora progresiva con red de seguridad a 3,5 s. |
| 8 | Scroll al 51% | Contenido clave subido sobre el pliegue; secciones más cortas y CTA repetido a media página. |

---

## 9. Pendiente de tu lado (no puedo resolverlo desde el diseño)

**Redirecciones 301 obligatorias** al publicar, para consolidar la autoridad dispersa:

```
/ads/                          → /google-ads/
/desarrollo-web/               → /sitios-web/
/contrata-tu-sitio-web/        → /sitios-web/
/plataformas-web/              → /sitios-web/
/tienda-virtual/               → /sitios-web/#tienda
/plataformas-web/soluciones-web-salud/ → /salud/
/diseno-ux/                    → /ux-ui/
```

**Otras acciones:**

1. **Quitar el `noindex, nofollow`** de la home. Sigue siendo la acción de mayor impacto y menor esfuerzo del proyecto completo.
2. **Filtrar bots en Clarity** para que las métricas futuras sean confiables.
3. **Conectar el formulario a un backend** y configurar el evento de conversión en Analytics: hoy no se puede medir qué campaña genera contactos reales.
4. **Aprovechar el canal de referidos**: 118 sesiones llegan desde sitios de clientes. Vale la pena estandarizar ese enlace en el pie de cada proyecto entregado, con UTM para medirlo.
5. **Considerar el sector salud como línea principal de negocio** en la estrategia comercial, no como una subpágina: los datos muestran que es donde hay demanda y cartera.

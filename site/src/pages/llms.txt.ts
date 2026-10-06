import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';

// /llms.txt (https://llmstxt.org): resumen del sitio para modelos de lenguaje.
// El encabezado se edita en src/content/site/llms-txt.yaml; el resto se arma solo desde los
// contenidos (servicios, planes con precio, páginas y artículos), con URLs absolutas.

// Páginas por sección, con una descripción breve y factual para LLM (la meta descripción es más comercial).
const SERVICES: [string, string, string][] = [
  ['page-google-ads', 'Google Ads', 'Campañas en Google con seguimiento de conversiones e informe mensual; planes mensuales con la comisión incluida.'],
  ['page-seo', 'SEO y GEO', 'Posicionamiento orgánico (técnico, contenido, autoridad y SEO local / Google Mi Negocio) y posicionamiento en respuestas de IA (ChatGPT, Gemini, Perplexity).'],
  ['page-sitios-web', 'Sitios y tiendas web', 'One Page, sitios de varias páginas y tiendas virtuales con Webpay o Mercado Pago; hosting, SSL y correos incluidos el primer año.'],
  ['page-salud', 'Soluciones para salud', 'Sitios para centros médicos y dentales con reserva de horas, fichas de especialistas y convenios.'],
  ['page-ux-ui', 'Diseño UX/UI', 'Investigación con usuarios, arquitectura de información, prototipos y sistemas de diseño accesibles.'],
];
const COMPANY: [string, string, string][] = [
  ['page-servicios', 'Servicios', 'Resumen de todos los servicios y cómo combinarlos en una estrategia integral.'],
  ['page-precios', 'Precios', 'Cotizador en línea con los precios publicados de cada servicio.'],
  ['page-nosotros', 'Nosotros', 'Quiénes somos, cómo trabajamos, certificaciones y casos de éxito.'],
  ['page-contacto', 'Contacto', 'Formulario, WhatsApp, teléfono y correo.'],
];
const OPTIONAL: [string, string, string][] = [
  ['page-tienda', 'Tienda', 'Planes de sitio web con precio cerrado para comprar en línea.'],
  ['page-tutoriales', 'Tutoriales', 'Guías para administrar un sitio web: respaldos, correo SMTP y más.'],
  ['page-terminos', 'Términos y condiciones', 'Condiciones de contratación y privacidad.'],
];
const PLAN_SETS: [string, string][] = [
  ['desarrollo-web', 'Sitios web (pago único)'],
  ['tienda-virtual', 'Tiendas virtuales (pago único)'],
  ['google-ads', 'Google Ads (mensual)'],
  ['seo', 'SEO y GEO (mensual)'],
  ['salud', 'Soluciones para salud'],
];

export const GET: APIRoute = async ({ site }) => {
  const abs = (path: string) => new URL(path, site).href;
  const pages = await getCollection('pages');
  const url = (id: string) => {
    const p = pages.find((x) => x.id === id);
    return p?.data.urlSlug ? abs(`/${p.data.urlSlug}/`) : null;
  };
  const list = (items: [string, string, string][]) =>
    items.map(([id, name, desc]) => (url(id) ? `- [${name}](${url(id)}): ${desc}` : null)).filter(Boolean).join('\n');

  const plans = (
    await Promise.all(
      PLAN_SETS.map(async ([id, label]) => {
        const set = await getEntry('planSets', id);
        if (!set) return null;
        const rows = set.data.plans.map((p) => `  - ${p.name}: ${p.price} (${p.renewalTerms}). ${p.tagline}`);
        return [`- ${label}:`, ...rows].join('\n');
      }),
    )
  ).filter(Boolean).join('\n');

  const posts = (await getCollection('blog'))
    .sort((a, b) => +b.data.date - +a.data.date)
    .map((p) => `- [${p.data.title}](${abs(`/blog/${p.id}/`)}): ${p.data.description}`)
    .join('\n');

  const [header] = await getCollection('llmsTxt');
  const body = [
    header.data.content.trim(),
    `## Servicios\n${list(SERVICES)}`,
    `## Planes y precios\n${plans}`,
    `## Empresa\n${list(COMPANY)}`,
    `## Blog\n- [Blog](${abs('/blog/')}): Artículos sobre SEO, Google Ads, desarrollo web, UX/UI y salud digital.\n${posts}`,
    `## Optional\n${list(OPTIONAL)}`,
  ].join('\n\n');

  return new Response(body + '\n', { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};

import { config, fields, collection, singleton } from '@keystatic/core';

const chipItemLabel = (props: { value: string }) => props.value || 'Etiqueta';

function cardOrStepList(itemNoun: string, description: string) {
  return fields.array(
    fields.object({
      title: fields.text({ label: 'Título' }),
      description: fields.text({ label: 'Descripción', multiline: true }),
      chips: fields.array(fields.text({ label: 'Etiqueta' }), {
        label: 'Etiquetas (chips)',
        itemLabel: chipItemLabel,
      }),
    }),
    {
      label: `${itemNoun} de esta sección (opcional)`,
      description,
      itemLabel: (props) => props.fields.title.value || itemNoun,
    }
  );
}

function ogImageField() {
  return fields.object(
    {
      image: fields.image({
        label: 'Imagen',
        directory: 'public/assets/img',
        publicPath: '/assets/img/',
        description: 'Imagen para compartir en redes sociales (Open Graph). Dejar vacía si la página no tiene imagen destacada.',
      }),
      title: fields.text({ label: 'Título de la imagen (opcional)' }),
      alt: fields.text({ label: 'Texto alternativo (opcional)' }),
      caption: fields.text({ label: 'Leyenda (opcional)' }),
    },
    { label: 'Imagen para compartir en redes (Open Graph)' }
  );
}

function pageSingleton(label: string, path: string, options: { includeSlug?: boolean } = {}) {
  const { includeSlug = true } = options;
  return singleton({
    label,
    path,
    format: 'yaml',
    schema: {
      ...(includeSlug
        ? {
            urlSlug: fields.text({
              label: 'Slug / URL',
              description: 'Ruta de la página, sin barra inicial ni final. Soporta subcarpetas (ej: plataformas-web/soluciones-web-salud). Cambiar esto cambia la URL real de la página.',
              validation: { length: { min: 1 } },
            }),
            previousSlugs: fields.array(fields.text({ label: 'Slug anterior' }), {
              label: 'URLs anteriores (redirigen 301 a la actual)',
              description: 'Slugs que esta página usó antes (o que uses del sitio viejo en producción). Cada uno genera un redirect 301 automático hacia el slug actual, para no perder SEO.',
              itemLabel: (props) => props.value || 'slug anterior',
            }),
          }
        : {}),
      metaTitle: fields.text({
        label: 'Meta title (SEO / pestaña del navegador)',
        validation: { length: { min: 1 } },
      }),
      metaDescription: fields.text({
        label: 'Meta description (SEO)',
        multiline: true,
        validation: { length: { min: 1 } },
      }),
      ogImage: ogImageField(),
      heroEyebrow: fields.text({ label: 'Antetítulo del hero' }),
      heroH1: fields.text({ label: 'Título principal (H1)', multiline: true }),
      heroLede: fields.text({ label: 'Bajada del hero', multiline: true }),
      sections: fields.array(
        fields.object({
          id: fields.text({ label: 'ID de sección (no editar salvo que sepas lo que haces)' }),
          eyebrow: fields.text({ label: 'Antetítulo de la sección' }),
          heading: fields.text({ label: 'Título de la sección (H2)' }),
          cards: cardOrStepList('Tarjeta', 'Úsalo para secciones de tipo "tarjetas" (features, problemas, síntomas, rubros, etc.). Dejar vacío si la sección no tiene tarjetas.'),
          steps: cardOrStepList('Paso', 'Úsalo para secciones de tipo "proceso numerado" propias de esta página. Dejar vacío si no aplica.'),
        }),
        {
          label: 'Secciones (títulos H2)',
          itemLabel: (props) => props.fields.heading.value || 'Sección',
        }
      ),
    },
  });
}

function planFeature() {
  return fields.object({
    label: fields.text({ label: 'Qué incluye' }),
    description: fields.text({ label: 'Detalle (opcional)', multiline: true }),
  });
}

export default config({
  storage: {
    kind: 'github',
    repo: { owner: 'speqio', name: 'webfriends' },
    pathPrefix: 'site/',
  },
  singletons: {
    negocio: singleton({
      label: 'Datos del negocio',
      path: 'src/content/site/negocio',
      format: 'yaml',
      schema: {
        name: fields.text({ label: 'Nombre del negocio', validation: { length: { min: 1 } } }),
        description: fields.text({ label: 'Descripción corta', multiline: true }),
        streetAddress: fields.text({ label: 'Calle y número' }),
        addressLocality: fields.text({ label: 'Comuna / ciudad' }),
        addressRegion: fields.text({ label: 'Región' }),
        addressCountry: fields.text({ label: 'Código de país (ej: CL)' }),
        telephone: fields.text({ label: 'Teléfono (formato +569...)' }),
        email: fields.text({ label: 'Email de contacto' }),
        areaServed: fields.array(fields.text({ label: 'Zona' }), {
          label: 'Zonas de cobertura',
          itemLabel: (props) => props.value || 'Zona',
        }),
      },
    }),
    pageHome: pageSingleton('Página: Home', 'src/content/site/page-home', { includeSlug: false }),
    pageSeo: pageSingleton('Página: SEO', 'src/content/site/page-seo'),
    pageGoogleAds: pageSingleton('Página: Google Ads', 'src/content/site/page-google-ads'),
    pageSitiosWeb: pageSingleton('Página: Sitios web', 'src/content/site/page-sitios-web'),
    pageUxUi: pageSingleton('Página: UX/UI', 'src/content/site/page-ux-ui'),
    pageSalud: pageSingleton('Página: Salud', 'src/content/site/page-salud'),
    pageCasos: pageSingleton('Página: Casos de éxito', 'src/content/site/page-casos'),
    pageNosotros: pageSingleton('Página: Nosotros', 'src/content/site/page-nosotros'),
    pageContacto: pageSingleton('Página: Contacto', 'src/content/site/page-contacto'),
    pageTerminos: pageSingleton('Página: Términos', 'src/content/site/page-terminos'),
    pageServicios: pageSingleton('Página: Servicios', 'src/content/site/page-servicios'),
    pagePrecios: pageSingleton('Página: Precios', 'src/content/site/page-precios'),
    pageTutoriales: pageSingleton('Página: Tutoriales', 'src/content/site/page-tutoriales'),
    pageTienda: pageSingleton('Página: Tienda', 'src/content/site/page-tienda'),
    robotsTxt: singleton({
      label: 'robots.txt',
      path: 'src/content/site/robots-txt',
      format: 'yaml',
      schema: {
        rules: fields.text({
          label: 'Reglas',
          description: 'Contenido de robots.txt, sin la línea "Sitemap:" (se agrega automático con la URL real del sitio).',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
      },
    }),
    llmsTxt: singleton({
      label: 'llms.txt',
      path: 'src/content/site/llms-txt',
      format: 'yaml',
      schema: {
        content: fields.text({
          label: 'Contenido (Markdown)',
          description: 'Resumen del sitio para crawlers de LLMs, formato llms.txt (https://llmstxt.org).',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
      },
    }),
    procesoSeisEtapas: singleton({
      label: 'Proceso de 6 etapas (compartido: home, nosotros, UX/UI)',
      path: 'src/content/site/proceso-seis-etapas',
      format: 'yaml',
      schema: {
        steps: fields.array(
          fields.object({
            title: fields.text({ label: 'Título' }),
            description: fields.text({ label: 'Descripción', multiline: true }),
            chips: fields.array(fields.text({ label: 'Etiqueta' }), {
              label: 'Etiquetas (chips, solo se muestran en UX/UI)',
              itemLabel: chipItemLabel,
            }),
          }),
          {
            label: 'Etapas',
            itemLabel: (props) => props.fields.title.value || 'Etapa',
          }
        ),
      },
    }),
  },
  collections: {
    planSets: collection({
      label: 'Planes de precios',
      slugField: 'id',
      path: 'src/content/plan-sets/*',
      format: 'yaml',
      schema: {
        id: fields.slug({ name: { label: 'ID (ej: desarrollo-web)' } }),
        plans: fields.array(
          fields.object({
            name: fields.text({ label: 'Nombre del plan' }),
            tagline: fields.text({ label: 'Para quién es (bajada corta)' }),
            price: fields.text({ label: 'Precio (ej: $190.000 o Desde $890.000)' }),
            renewalTerms: fields.text({ label: 'Condición de pago/renovación' }),
            featured: fields.checkbox({ label: 'Destacar este plan', defaultValue: false }),
            badge: fields.text({ label: 'Etiqueta destacada (ej: "Más elegido", opcional)' }),
            features: fields.array(planFeature(), {
              label: 'Qué incluye',
              itemLabel: (props) => props.fields.label.value || 'Item',
            }),
            ctaLabel: fields.text({ label: 'Texto del botón (ej: "Cotizar One Page")' }),
            deliveryNote: fields.text({ label: 'Nota final (ej: "Entrega estimada: 2 semanas")' }),
          }),
          {
            label: 'Planes',
            itemLabel: (props) => props.fields.name.value || 'Plan',
          }
        ),
      },
    }),
    productos: collection({
      label: 'Productos (sitios y tiendas)',
      slugField: 'name',
      path: 'src/content/productos/*',
      format: 'yaml',
      schema: {
        name: fields.slug({ name: { label: 'Nombre' }, slug: { label: 'URL (/producto/…)' } }),
        tagline: fields.text({ label: 'Bajada corta' }),
        description: fields.text({ label: 'Descripción', multiline: true }),
        price: fields.text({ label: 'Precio (ej: "$260.000" o "A cotizar")' }),
        renewalTerms: fields.text({ label: 'Condiciones (ej: "Pago único · Renovación $45.000 + IVA al año")' }),
        deliveryNote: fields.text({ label: 'Nota de entrega (ej: "Entrega estimada: 3 semanas")' }),
        image: fields.text({ label: 'Imagen (ruta en /assets/img/)', defaultValue: '/assets/img/web-1.webp' }),
        order: fields.integer({ label: 'Orden', defaultValue: 0 }),
        hidden: fields.checkbox({
          label: 'Ocultar de Google',
          description: 'La página existe pero con noindex (útil para borradores o demos).',
          defaultValue: false,
        }),
        features: fields.array(planFeature(), {
          label: 'Qué incluye',
          itemLabel: (props) => props.fields.label.value || 'Item',
        }),
      },
    }),
    posts: collection({
      label: 'Artículos del blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        metaTitle: fields.text({
          label: 'Meta title (SEO / pestaña del navegador, opcional)',
          description: 'Si se deja vacío, se usa "Título — Blog Webfriends".',
        }),
        description: fields.text({
          label: 'Descripción (SEO / meta description)',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        excerpt: fields.text({
          label: 'Bajada (se muestra en la tarjeta del listado)',
          multiline: true,
        }),
        category: fields.select({
          label: 'Categoría',
          options: [
            { label: 'SEO', value: 'seo' },
            { label: 'Google Ads', value: 'ads' },
            { label: 'Desarrollo web', value: 'web' },
            { label: 'UX/UI', value: 'uxui' },
            { label: 'Salud', value: 'salud' },
            { label: 'Marketing', value: 'marketing' },
          ],
          defaultValue: 'seo',
        }),
        previousSlugs: fields.array(fields.text({ label: 'URL antigua' }), {
          label: 'URLs antiguas (redirigen con 301 a este artículo)',
          description: 'Ej: /que-es-seo/ del sitio anterior.',
          itemLabel: (props) => props.value || 'URL',
        }),
        date: fields.date({ label: 'Fecha de publicación' }),
        readingTime: fields.text({
          label: 'Tiempo de lectura (ej: "6 min")',
          defaultValue: '5 min',
        }),
        coverIcon: fields.select({
          label: 'Ícono de portada',
          options: [
            { label: 'Búsqueda (SEO)', value: 'search' },
            { label: 'Tendencia (Ads)', value: 'trending' },
            { label: 'Pantalla (Web)', value: 'monitor' },
            { label: 'Gema (UX/UI)', value: 'gem' },
            { label: 'Escudo (Salud)', value: 'shield-check' },
            { label: 'Barras (SEO técnico)', value: 'chart-bars' },
            { label: 'Ubicación', value: 'pin' },
          ],
          defaultValue: 'search',
        }),
        relatedService: fields.select({
          label: 'Servicio relacionado (CTA al final del artículo)',
          description: 'El link se resuelve automático contra el slug actual de esa página, aunque lo cambies después.',
          options: [
            { label: 'SEO', value: 'page-seo' },
            { label: 'Google Ads', value: 'page-google-ads' },
            { label: 'Sitios web', value: 'page-sitios-web' },
            { label: 'UX/UI', value: 'page-ux-ui' },
            { label: 'Salud', value: 'page-salud' },
          ],
          defaultValue: 'page-seo',
        }),
        content: fields.markdoc({ label: 'Contenido del artículo', extension: 'md' }),
      },
    }),
    casos: collection({
      label: 'Casos de éxito',
      slugField: 'client',
      path: 'src/content/casos/*',
      format: 'yaml',
      schema: {
        client: fields.slug({ name: { label: 'Cliente' } }),
        tag: fields.text({
          label: 'Etiqueta (ej: "Sitio web + SEO local")',
          validation: { length: { min: 1 } },
        }),
        sector: fields.text({ label: 'Sector', validation: { length: { min: 1 } } }),
        challenge: fields.text({
          label: 'El desafío',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        checklist: fields.array(
          fields.text({ label: 'Item' }),
          {
            label: 'Qué hicimos',
            itemLabel: (props) => props.value || 'Item',
          }
        ),
        result: fields.text({
          label: 'Resultado',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        featured: fields.checkbox({
          label: 'Destacado en home',
          defaultValue: false,
        }),
      },
    }),
    faqs: collection({
      label: 'Preguntas frecuentes',
      slugField: 'question',
      path: 'src/content/faqs/*',
      format: 'yaml',
      schema: {
        question: fields.slug({ name: { label: 'Pregunta' } }),
        category: fields.select({
          label: 'Página / servicio',
          options: [
            { label: 'SEO', value: 'seo' },
            { label: 'Google Ads', value: 'ads' },
            { label: 'Sitios web', value: 'web' },
            { label: 'UX/UI', value: 'uxui' },
            { label: 'Salud', value: 'salud' },
          ],
          defaultValue: 'seo',
        }),
        answer: fields.text({
          label: 'Respuesta',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        order: fields.integer({
          label: 'Orden (menor va primero)',
          defaultValue: 0,
        }),
      },
    }),
  },
});

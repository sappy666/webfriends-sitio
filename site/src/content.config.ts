import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cardItem = z.object({
  title: z.string(),
  description: z.string(),
  chips: z.array(z.string()).default([]),
});

const stepItem = cardItem;

const pages = defineCollection({
  loader: glob({ pattern: 'page-*.yaml', base: './src/content/site' }),
  schema: z.object({
    urlSlug: z.string().optional(),
    previousSlugs: z.array(z.string()).default([]),
    metaTitle: z.string(),
    metaDescription: z.string(),
    ogImage: z
      .object({
        image: z.string().nullable().optional(),
        title: z.string().optional(),
        alt: z.string().optional(),
        caption: z.string().optional(),
      })
      .optional(),
    heroEyebrow: z.string(),
    heroH1: z.string(),
    heroLede: z.string(),
    sections: z.array(
      z.object({
        id: z.string(),
        eyebrow: z.string().optional(),
        heading: z.string(),
        cards: z.array(cardItem).default([]),
        steps: z.array(stepItem).default([]),
      })
    ),
  }),
});

const procesoSeisEtapas = defineCollection({
  loader: glob({ pattern: 'proceso-seis-etapas.yaml', base: './src/content/site' }),
  schema: z.object({
    steps: z.array(stepItem),
  }),
});

const planSets = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/plan-sets' }),
  schema: z.object({
    id: z.string(),
    plans: z.array(
      z.object({
        name: z.string(),
        tagline: z.string(),
        price: z.string(),
        renewalTerms: z.string(),
        featured: z.boolean().default(false),
        badge: z.string().optional(),
        features: z.array(
          z.object({
            label: z.string(),
            description: z.string().optional(),
          })
        ),
        ctaLabel: z.string(),
        deliveryNote: z.string(),
      })
    ),
  }),
});

const negocio = defineCollection({
  loader: glob({ pattern: 'negocio.yaml', base: './src/content/site' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    streetAddress: z.string(),
    addressLocality: z.string(),
    addressRegion: z.string(),
    addressCountry: z.string(),
    telephone: z.string(),
    email: z.string(),
    areaServed: z.array(z.string()),
  }),
});

const robotsTxt = defineCollection({
  loader: glob({ pattern: 'robots-txt.yaml', base: './src/content/site' }),
  schema: z.object({
    rules: z.string(),
  }),
});

const llmsTxt = defineCollection({
  loader: glob({ pattern: 'llms-txt.yaml', base: './src/content/site' }),
  schema: z.object({
    content: z.string(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdoc}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string().optional(),
    description: z.string(),
    excerpt: z.string(),
    category: z.enum(['seo', 'ads', 'web', 'uxui', 'salud', 'marketing']),
    previousSlugs: z.array(z.string()).default([]),
    date: z.coerce.date(),
    readingTime: z.string(),
    coverIcon: z.string(),
    relatedService: z.enum(['page-seo', 'page-google-ads', 'page-sitios-web', 'page-ux-ui', 'page-salud']),
  }),
});

const casos = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/casos' }),
  schema: z.object({
    tag: z.string(),
    client: z.string(),
    sector: z.string(),
    challenge: z.string(),
    checklist: z.array(z.string()),
    result: z.string(),
    featured: z.boolean().default(false),
  }),
});

const faqs = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/faqs' }),
  schema: z.object({
    category: z.enum(['seo', 'ads', 'web', 'uxui', 'salud']),
    question: z.string(),
    answer: z.string(),
    order: z.number().default(0),
  }),
});

const productos = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/productos' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    price: z.string(),
    renewalTerms: z.string(),
    deliveryNote: z.string().default(''),
    image: z.string().default('/assets/img/web-1.webp'),
    order: z.number().default(0),
    hidden: z.boolean().default(false),
    features: z.array(z.object({ label: z.string(), description: z.string().optional() })).default([]),
  }),
});

export const collections = { productos, blog, casos, faqs, pages, negocio, procesoSeisEtapas, planSets, robotsTxt, llmsTxt };

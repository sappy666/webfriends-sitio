// Identificadores estables de las entidades del JSON-LD (src/components/SiteSchema.astro).
// Todas las páginas apuntan a la misma organización y al mismo sitio por @id, así los buscadores
// y asistentes las reconocen como una sola entidad en vez de una ficha distinta por página.
const SITE = 'https://webfriends.cl';

export const ORG_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;
export const pageId = (url: string) => `${url}#webpage`;

type Plan = { name: string; tagline: string; price: string; renewalTerms: string };

/** Precio publicado ("$260.000", "Desde $890.000") → oferta en CLP. "A cotizar" no genera oferta. */
function offerOf(plan: Plan, url: string) {
  const amount = Number(plan.price.replace(/[^\d]/g, ''));
  if (!amount) return null;
  const base = {
    '@type': 'Offer',
    name: plan.name,
    description: `${plan.tagline} ${plan.renewalTerms}.`,
    priceCurrency: 'CLP',
    url,
  };
  return /^desde/i.test(plan.price.trim())
    ? { ...base, priceSpecification: { '@type': 'PriceSpecification', minPrice: amount, priceCurrency: 'CLP' } }
    : { ...base, price: amount };
}

/**
 * Nodo Service para una página de servicio. Los planes salen de los mismos YAML que se muestran
 * en la página (src/content/plan-sets), así el precio del marcado nunca difiere del visible.
 */
export function serviceNode(opts: {
  url: string;
  name: string;
  serviceType: string;
  description: string;
  plans?: Plan[];
  audience?: string;
}) {
  const offers = (opts.plans ?? []).map((p) => offerOf(p, `${opts.url}#planes`)).filter(Boolean);
  return {
    '@type': 'Service',
    '@id': `${opts.url}#service`,
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url: opts.url,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Chile' },
    ...(opts.audience ? { audience: { '@type': 'BusinessAudience', name: opts.audience } } : {}),
    ...(offers.length ? { offers } : {}),
  };
}

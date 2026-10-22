// Autores del blog. Cada artículo toma el autor de su categoría; para cambiarlo en un artículo
// puntual, agrega en su frontmatter `author: <id>` (ej. `author: luis`).
//
// Página de autor (/autor/<id>/): se genera para cada persona (no para "equipo"). Muestra solo
// los campos que estén completos, así que se pueden ir llenando de a poco:
//   bio        → párrafo corto de presentación (va en la página y en el JSON-LD, no en la meta description)
//   linkedin   → URL completa del perfil
//   experience → [{ title, place, period }] (lo más reciente primero)
//   skills     → lista corta de especialidades
type Job = { title: string; place: string; period: string };
type Author = {
  name: string;
  role: string;
  bio?: string;
  linkedin?: string;
  experience?: Job[];
  skills?: string[];
};

export const AUTHORS = {
  macarena: {
    name: 'Macarena Ramdohr',
    role: 'Diseño UX/UI',
    bio: 'Arquitecta de formación con una profunda pasión por el diseño, me he especializado en diseño UX/UI. Mi objetivo es crear productos digitales que no solo sean intuitivos y funcionales, sino que también reflejen una sensibilidad estética. Me enfoco en elevar la calidad visual y la experiencia de usuario a través de un diseño consciente, porque el diseño genera emociones, conecta personas y crea experiencias que perduran.',
    skills: ['Diseño de experiencia de usuario (UX)', 'Diseño web', 'Diseño gráfico', 'Diseño de WordPress', 'Marketing digital', 'Marketing de redes sociales'],
  },
  maite: { name: 'Maite Aranda', role: 'SEO' },
  luis: { name: 'Luis Quiroga', role: 'Google Ads' },
  paolo: { name: 'Paolo Mori Rojas', role: 'Desarrollo web' },
  equipo: { name: 'Equipo Webfriends', role: 'Marketing digital' },
} satisfies Record<string, Author>;

export type AuthorId = keyof typeof AUTHORS;
export const AUTHOR_IDS = Object.keys(AUTHORS) as [AuthorId, ...AuthorId[]];

/** Personas con página propia (el "equipo" no la tiene). */
export const PERSON_IDS = AUTHOR_IDS.filter((id) => id !== 'equipo');

/** Autor por defecto según la categoría del artículo. */
const BY_CATEGORY: Record<string, AuthorId> = {
  uxui: 'macarena',
  seo: 'maite',
  ads: 'luis',
  web: 'paolo',
  salud: 'equipo',
  marketing: 'equipo',
};

export function authorOf(data: { category: string; author?: AuthorId }) {
  const id: AuthorId = data.author ?? BY_CATEGORY[data.category] ?? 'equipo';
  const a: Author = AUTHORS[id];
  return { id, ...a, href: id === 'equipo' ? undefined : `/autor/${id}/` };
}

/** Iniciales para el avatar: "Equipo Webfriends" → "EW", "Maite" → "M". */
export const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

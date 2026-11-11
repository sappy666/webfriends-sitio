// Reseñas públicas de Webfriends en Google Maps (4,4 ★ · 18 reseñas). Viven aquí porque las usan
// dos superficies: el bloque de testimonios del inicio y la cinta de la landing de salud. Si se
// agregan más, copiar el texto tal cual (se puede recortar con «[…]», nunca reescribir).
export const reviewsUrl = 'https://maps.google.com/?cid=6592386168463781065';

export const reviews = [
  {
    quote: 'Excelentes profesionales, es segunda vez que acudo para crear un sitio web y el trabajo es impecable […] los valores son super razonables y rápidos, 100% recomendados.',
    name: 'Eduardo Muñoz Toro',
    role: 'Reseña en Google',
  },
  {
    quote: 'La eficiencia, profesionalismo y la calidad del trabajo entregado superaron nuestras expectativas, consolidando a Webfriends como un aliado clave para el desarrollo futuro de Techscala.',
    name: 'Hugo Manriquez Arias',
    role: 'Techscala',
  },
  {
    quote: 'El equipo de atención al cliente fue muy amable y eficiente, resolvieron todas mis dudas y me ayudaron a elegir las mejores opciones para mi página web y publicidad.',
    name: 'Rocio Lopez',
    role: 'Reseña en Google',
  },
  {
    quote: 'Webfriends es una empresa que se adapta a las necesidades propias de sus clientes […] se adaptan y se preocupan de los clientes. Son muy buen partner de trabajo.',
    name: 'Rodrigo Alonso',
    role: 'Reseña en Google',
  },
  {
    quote: 'Excelente servicio! Empresa muy alineada con nuestro objetivo, nos aumentaron mucho las ventas […] Recomendable 100%.',
    name: 'Dagoberto Vasquez',
    role: 'Reseña en Google',
  },
];

export const iniciales = (n: string) => n.split(' ').slice(0, 2).map((w) => w[0]).join('');

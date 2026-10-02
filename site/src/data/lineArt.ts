// Ilustraciones lineales de cada servicio (SVG 160×120; trazo = color del texto, `.acc` = detalle ámbar).
// Las claves son las mismas que usaban las imágenes 3D anteriores (`/assets/img/<clave>.webp`).
// Se dibujan con <LineArt name="..." />.
export const lineArt: Record<string, string> = {
  // Web: ventana de navegador con layout
  'web-1': `<rect x="14" y="16" width="132" height="88" rx="8"/><path d="M14 32h132"/><circle cx="25" cy="24" r="2"/><circle cx="33" cy="24" r="2"/><circle cx="41" cy="24" r="2"/>
   <rect x="26" y="44" width="52" height="34" rx="4"/><path d="M90 46h40M90 56h32M90 66h36"/><path d="M26 90h70"/>
   <path class="acc" d="M112 70l12 28 4-10 10-4z"/>`,
  // SEO: lupa sobre resultados
  'seo-1': `<path d="M18 26h70M18 40h52M18 54h62M18 68h40M18 82h56"/>
   <circle cx="108" cy="58" r="26"/><path d="M127 77l18 18"/>
   <path class="acc" d="M96 66l9-9 7 6 10-12"/>`,
  // Google Ads: barras con tendencia ascendente
  ads: `<path d="M16 104h128"/><rect x="26" y="74" width="16" height="30" rx="2"/><rect x="54" y="60" width="16" height="44" rx="2"/><rect x="82" y="44" width="16" height="60" rx="2"/><rect x="110" y="28" width="16" height="76" rx="2"/>
   <path class="acc" d="M22 58l32-18 28 8 44-30"/><path class="acc" d="M114 18h12v12"/>`,
  // Salud: ficha con cruz y pulso
  'medical-1': `<rect x="20" y="18" width="78" height="86" rx="10"/><path d="M50 40h18M59 31v18"/><path d="M34 68h50M34 80h36"/>
   <path class="acc" d="M86 62h14l7-14 10 30 8-16h21"/>`,
  // UX/UI: wireframe con cursor
  'uxui-1': `<rect x="14" y="16" width="100" height="76" rx="8"/><rect x="26" y="28" width="34" height="24" rx="3"/><path d="M70 30h32M70 40h24M26 64h76M26 76h52"/>
   <rect x="96" y="58" width="50" height="46" rx="6" style="fill:var(--bg)"/><circle cx="111" cy="73" r="5"/><path d="M104 96l12-12 8 7 10-10 8 8"/>
   <path class="acc" d="M126 18l6 20 5-6 9 8 4-4-9-8 6-5z"/>`,
};

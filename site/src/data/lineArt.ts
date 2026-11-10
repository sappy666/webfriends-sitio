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

  // Desafío 1: sitio lento o difícil de recorrer. Ventana con cronómetro y barra a medias.
  'lento': `<rect x="10" y="22" width="106" height="78" rx="8"/><path d="M10 38h106"/><circle cx="22" cy="30" r="2.5"/><circle cx="31" cy="30" r="2.5"/>
   <path d="M26 54h48M26 66h66M26 78h34"/>
   <circle cx="124" cy="46" r="24" style="fill:var(--bg)"/><path d="M124 46V32m0 14 10 7M118 18h12m-6 0v4"/>
   <path class="acc" d="M26 90h30"/>`,

  // Desafío 2: cuesta encontrarlos. Lupa sobre un mapa con un punto fuera de foco.
  'invisible': `<rect x="12" y="18" width="100" height="84" rx="8"/><path d="m12 44 26-10 26 10 26-10 22 8M50 24v62M78 34v62"/>
   <circle cx="104" cy="74" r="22" style="fill:var(--bg)"/><circle cx="104" cy="74" r="15"/><path d="m115 85 14 14"/>
   <path class="acc" d="M104 68a4 4 0 0 1 4 4c0 3-4 8-4 8s-4-5-4-8a4 4 0 0 1 4-4z"/>`,

  // Desafío 3: impulsar un servicio concreto. Barras que suben hacia una diana.
  'impulso': `<path d="M14 100h118M26 100V78M48 100V62M70 100V84"/>
   <circle cx="110" cy="44" r="26"/><circle cx="110" cy="44" r="15"/>
   <path d="M92 100V54"/>
   <path class="acc" d="M110 44h-1m1 0 24-24m0 0h-9m9 0v9"/><circle class="acc" cx="110" cy="44" r="4"/>`,

  // Vinculación con la agenda del centro: calendario y eslabón.
  'agenda': `<rect x="12" y="24" width="76" height="72" rx="8"/><path d="M12 44h76M32 18v12M68 18v12"/>
   <path d="M28 58h10m12 0h10M28 76h10m12 0h10"/>
   <path d="M88 60h8"/><rect x="94" y="49" width="32" height="22" rx="11"/>
   <rect class="acc" x="118" y="49" width="32" height="22" rx="11"/>`,
};

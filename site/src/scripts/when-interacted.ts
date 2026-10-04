// Rendimiento: los efectos de scroll (GSAP + ScrollTrigger) se cargan y miden recién cuando la persona
// interactúa (scroll, toque, rueda o tecla), o de inmediato si la página ya abrió con scroll.
// Así no compiten con la primera carga; nadie llega a esas secciones sin hacer scroll antes.
const EVENTS = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
let fired = false;
const queue: Array<() => void> = [];

function fire() {
  if (fired) return;
  fired = true;
  EVENTS.forEach((e) => removeEventListener(e, fire));
  queue.splice(0).forEach((fn) => fn());
}

if (scrollY > 0 || location.hash) fire();
else EVENTS.forEach((e) => addEventListener(e, fire, { passive: true }));

export function whenInteracted(fn: () => void) {
  if (fired) fn();
  else queue.push(fn);
}

// GSAP con ScrollTrigger, importado una sola vez y solo cuando se necesita.
let gsapPromise: Promise<{ gsap: typeof import('gsap').gsap; ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }> | null = null;
export function loadScrollGsap() {
  gsapPromise ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger);
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
  });
  return gsapPromise;
}

/**
 * Compra: un terminal de pago con cinco teclas de producto y una ranura de tarjeta.
 * La tecla bajo el puntero se hunde del todo; sus vecinas ceden cada vez menos,
 * escalonadas hacia afuera, porque las cinco van sobre una misma placa flexible.
 * Cada tecla lleva su numero en un codigo de puntos sobre la cara. El deslizador
 * es cuanto baja la tecla apretada, en unidades de mundo.
 *
 * El patron: items discretos. Tweens, escalonado por distancia, caida con tope,
 * identidad en la geometria, y el test del puntero contra la pose de reposo de
 * cada tecla, que no se mueve, para que al hundirse no se pierda la eleccion.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, proj, ringAt, rings, prism, run, unproj,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, reflect, register, solid,
} = HL;

const N = 5;
const KW = 44, KD = 17, G = 24, KH = 10;          // tecla: ancho en x, fondo en y, paso entre teclas, alto
const SLAB = 7;                                   // alto de la placa del terminal
const X0 = -16, X1 = KW + 16, Y0 = -17, Y1 = (N - 1) * G + 34;
const STEP = 44;                                  // escalonado por distancia, en ms
const REST = [1.3, 0, 2.5, 0.65, 1.8];           // reposo disparejo: ninguna tecla a ras (regla 05)
const FALL = [1, 0.34, 0.12, 0.05];               // la vecina cede menos; mas alla de 3, nada (regla 03)
const MARK = 3;                                   // la tecla que lleva el brillo en reposo (regla 04/05)

/** Centro de la tecla i en el mundo. */
const kc = (i) => [KW / 2, i * G];

/** Los cinco puntos del codigo de una tecla: i + 1 de ellos van medios. */
function code(P, i, z) {
  const [cx, cy] = kc(i), pts = [];
  for (let k = 0; k < 5; k++) pts.push(P(cx + (k - 2) * 6.1, cy + 4.5, z));
  return pts;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let depth = value;

  // La camara se ajusta a la pose mas extrema: la placa entera y una tecla arriba del todo.
  const C = Cam(45, 0.5, 1.78);
  fit(C, [
    [X0, Y0, 0], [X1, Y1, 0], [X1, Y0, 0], [X0, Y1, 0],
    [X0, Y0, SLAB + KH], [X1, Y1, SLAB + KH],
  ], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);

  // --- La placa, que nunca se mueve -------------------------------------------------
  const [sOut, sIn] = rings(X0, Y0, X1, Y1, 10, 3);
  reflect(svg, g, P, front, sOut, 0, 18);
  put(solid(g), prism(P, front, sOut, sIn, 0, SLAB));

  // La ranura de la tarjeta, hundida en la cara de arriba, delante de las teclas.
  const sy = (N - 1) * G + 19;
  const [rOut, rIn] = rings(3, sy - 4.6, KW - 3, sy + 4.6, 3.5, 1.6);
  mk("path", { d: poly(ringAt(P, rOut, SLAB)), class: "nf" }, g);
  mk("path", { d: poly(ringAt(P, rIn, SLAB - 2.2)), class: "nf lo" }, g);

  // --- Las teclas, de la mas lejana a la mas cercana (regla 06) ---------------------
  const keys = [];
  for (let i = 0; i < N; i++) {
    const [cx, cy] = kc(i);
    const [kOut, kIn] = rings(cx - KW / 2, cy - KD / 2, cx + KW / 2, cy + KD / 2, 5, 1.75);
    const grp = mk("g", {}, g);
    const body = solid(grp);
    const dots = [];
    for (let k = 0; k < 5; k++) dots.push(mk("circle", { r: 1.05, class: "dot " + (k <= i ? "m" : "off") }, grp));
    keys.push({ kOut, kIn, body, dots, z: tween(REST[i]), last: null });
  }

  /** Dibuja la tecla i hundida `s` unidades. */
  function draw(i, s) {
    const k = keys[i];
    if (k.last !== null && Math.abs(k.last - s) < 0.01) return;   // no reescribir lo que no cambio (regla 07)
    k.last = s;
    const z0 = 0, z1 = SLAB + KH - s;
    put(k.body, prism(P, front, k.kOut, k.kIn, z0, z1));
    code(P, i, z1).forEach((p, j) => place(k.dots[j], p));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    keys.forEach((k, i) => { draw(i, tval(k.z, now)); if (!tdone(k.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // --- El puntero: contra la pose de REPOSO de cada tecla (regla 01) ----------------
  /** La tecla cuyo centro de reposo queda mas cerca del puntero; -1 si ninguna. */
  function hit([x, y]) {
    let best = -1, bestD = Infinity;
    for (let i = 0; i < N; i++) {
      const w = unproj(C, x, y, SLAB + KH - REST[i]);   // el plano propio de su cara, que no se mueve
      const [cx, cy] = kc(i);
      const dx = w[0] - cx, dy = w[1] - cy;
      if (Math.abs(dx) > KW / 2 + 3 || Math.abs(dy) > G / 2) continue;
      const d = Math.hypot(dx, dy * 1.6);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  let act = -1;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    keys.forEach((k, i) => {
      const dist = Math.abs(i - a);
      const give = a < 0 ? 0 : depth * (FALL[dist] ?? 0);
      tset(k.z, clamp(REST[i] + give, 0, KH - 1.5), now, Math.abs(i - from) * STEP);
      k.body.sil.classList.toggle("hi", a < 0 ? i === MARK : i === a);
      k.dots.forEach((el, j) => el.setAttribute("class", "dot " + (j <= i ? "m" : "off")));
    });
    read.textContent = a < 0 ? "rest" : "item " + String(a + 1).padStart(2, "0");
    B.wake();
  }

  // El brillo de reposo, antes de que nadie toque nada.
  keys[MARK].body.sil.classList.add("hi");

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { depth = v; if (act >= 0) { const a = act; act = -1; setActive(a); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "compra",
  means: "Cinco teclas de compra en un terminal: la que aprieta el puntero se hunde y sus vecinas ceden cada vez menos.",
  rules: [1, 2, 3, 10],
  range: [2, 5.5, 9],
  tour: [[150, 181], [211, 151], [272, 121], null],
  mount,
});

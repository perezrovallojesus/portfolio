// LIB-01 Orbital disc (origen: v3)
const TAU = Math.PI * 2;
const f = (n) => n.toFixed(1);
const line = (pts) => 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L');
const path = (d, cls, draw) => `<path class="${cls}${draw ? ' draw' : ''}" d="${d}"${draw ? ' pathLength="1"' : ''}/>`;

  /* ---------- 1. Disco orbital (hero): retícula ondulada en 3D que gira ---------- */
  // a = ángulo de giro; el disco se inclina sobre el eje X y se proyecta en 2D
  function orbit(a, cx = 300, cy = 312, R = 205) {
    const tilt = 1.12;                                   // ~64°
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const z = (r, t) => 0.11 * r * r * Math.sin(3 * t) + 0.035 * Math.sin(r * 11);
    const proj = (r, t) => {
      const x = r * Math.cos(t + a), y = r * Math.sin(t + a), h = z(r, t);
      return [cx + R * x, cy + R * (y * ct - h * st)];
    };
    let out = '';
    // anillos
    for (let i = 1; i <= 10; i++) {
      const r = 0.12 + i * 0.088, pts = [];
      for (let k = 0; k <= 72; k++) pts.push(proj(r, (k / 72) * TAU));
      out += path(line(pts), i === 10 ? 'w-acc' : 'w');
    }
    // meridianos
    for (let m = 0; m < 24; m++) {
      const t = (m / 24) * TAU, pts = [];
      for (let k = 0; k <= 12; k++) pts.push(proj(0.2 + (k / 12) * 0.8, t));
      out += path(line(pts), 'w-dim');
    }
    // eje vertical y núcleo
    out += path(`M${cx} ${cy - 190}L${cx} ${cy + 60}`, 'w-dim w-dash');
    for (let i = 1; i <= 3; i++) {
      const pts = [];
      for (let k = 0; k <= 36; k++) { const t = (k / 36) * TAU; pts.push([cx + R * 0.05 * i * Math.cos(t), cy - 6 * i + R * 0.05 * i * Math.sin(t) * ct]); }
      out += path(line(pts), 'w');
    }
    // órbita exterior plana con satélite
    const orb = [], ro = 1.18;
    for (let k = 0; k <= 90; k++) { const t = (k / 90) * TAU; orb.push([cx + R * ro * Math.cos(t), cy + R * ro * Math.sin(t) * ct - 40]); }
    out += path(line(orb), 'w-dim w-dash');
    const s = a * 1.7;
    out += `<circle class="w-sat" cx="${f(cx + R * ro * Math.cos(s))}" cy="${f(cy + R * ro * Math.sin(s) * ct - 40)}" r="6"/>`;
    return out;
  }

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function animate(host, render) {
  render(0);
  if (reduceMotion) return;
  let t = 0, last = 0, live = true;
  const tick = (ts) => {
    if (!live) { last = 0; return; }
    t += Math.min(ts - (last || ts), 100); last = ts;
    render(t);
    requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => {
    const was = live; live = e.isIntersecting;
    if (live && !was) requestAnimationFrame(tick);
  }).observe(host);
  requestAnimationFrame(tick);
}
const orbitEl = document.getElementById('orbit');
animate(document.querySelector('.window'), (t) => { orbitEl.innerHTML = orbit(0.4 + t * 0.00011); });

// LIB-04 Wave terrain (origen: v3)
const TAU = Math.PI * 2;
const f = (n) => n.toFixed(1);
const line = (pts) => 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L');
const path = (d, cls, draw) => `<path class="${cls}${draw ? ' draw' : ''}" d="${d}"${draw ? ' pathLength="1"' : ''}/>`;

  /* ---------- 3. Terreno ondulado en perspectiva ---------- */
  // phase: desplaza la ondulación hacia el observador. draw: trazo de entrada.
  function terrain(w = 320, h = 180, phase = 0, draw = true) {
    const rows = 11, cols = 22, cx = w / 2, horizon = 34;
    const pt = (i, j) => {
      const depth = i / (rows - 1);                       // 0 lejos · 1 cerca
      const spread = 0.35 + depth * 0.75;
      const u = j / (cols - 1) - 0.5;
      const y0 = horizon + Math.pow(depth, 1.35) * (h - horizon - 14);
      const elev = (Math.sin(u * 9 + depth * 3 - phase) * 0.6 + Math.sin(u * 3.3 - depth * 5 + phase * 0.6) * 0.4) * (10 + depth * 18);
      return [cx + u * w * spread, y0 - elev];
    };
    let out = '';
    for (let i = 0; i < rows; i++) { const pts = []; for (let j = 0; j < cols; j++) pts.push(pt(i, j)); out += path(line(pts), 'w', draw); }
    for (let j = 0; j < cols; j += 2) { const pts = []; for (let i = 0; i < rows; i++) pts.push(pt(i, j)); out += path(line(pts), 'w-dim', draw); }
    const peak = pt(6, 14);
    out += `<circle class="w-sat" cx="${f(peak[0])}" cy="${f(peak[1] - 8)}" r="4"/>`;
    out += path(`M${f(peak[0])} ${f(peak[1] - 4)}L${f(peak[0])} ${f(peak[1] + 22)}`, 'w-acc', draw);
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
const art = document.getElementById('art');
animate(art, (t) => { art.innerHTML = terrain(320, 180, t * 0.0011, false); });

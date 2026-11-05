// LIB-03 Twin spheres (origen: v3)
const TAU = Math.PI * 2;
const f = (n) => n.toFixed(1);
const line = (pts) => 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L');
const path = (d, cls, draw) => `<path class="${cls}${draw ? ' draw' : ''}" d="${d}"${draw ? ' pathLength="1"' : ''}/>`;

  /* ---------- 2. Esfera de alambre doble (plataforma híbrida) ---------- */
  // rot: giro sobre su eje (los meridianos se desplazan). draw: trazo de entrada.
  function sphere(cx = 140, cy = 92, R = 66, rot = 0, draw = true) {
    const tilt = 0.38, ct = Math.cos(tilt), st = Math.sin(tilt);
    const globe = (gx, gy, gr, spin) => {
      let o = '';
      const p = (lat, lon) => {
        const x = Math.cos(lat) * Math.sin(lon + spin), y = Math.sin(lat), zz = Math.cos(lat) * Math.cos(lon + spin);
        return [gx + gr * x, gy - gr * (y * ct - zz * st)];
      };
      for (let la = -60; la <= 60; la += 20) {
        const pts = []; for (let k = 0; k <= 48; k++) pts.push(p((la * Math.PI) / 180, (k / 48) * TAU));
        o += path(line(pts), 'w', draw);
      }
      for (let lo = 0; lo < 180; lo += 22.5) {
        const pts = []; for (let k = 0; k <= 48; k++) pts.push(p((k / 48) * TAU, (lo * Math.PI) / 180));
        o += path(line(pts), 'w-dim', draw);
      }
      return o;
    };
    // la esfera pequeña gira en sentido contrario y más rápido
    let out = globe(cx, cy, R, rot) + globe(cx + 112, cy + 18, R * 0.42, -rot * 1.8);
    const x0 = cx + R * 0.7, y0 = cy - 30, qx = cx + 95, qy = cy - 70, x1 = cx + 112, y1 = cy - 10;
    out += path(`M${x0} ${y0}Q${qx} ${qy} ${x1} ${y1}`, 'w-acc', draw);
    // un pulso recorre el enlace entre las dos esferas (punto sobre la curva de Bézier)
    const t = (Math.sin(rot * 2.2) + 1) / 2, u = 1 - t;
    out += `<circle class="w-sat" cx="${f(u * u * x0 + 2 * u * t * qx + t * t * x1)}" cy="${f(u * u * y0 + 2 * u * t * qy + t * t * y1)}" r="4"/>`;
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
animate(art, (t) => { art.innerHTML = sphere(140, 92, 66, t * 0.00035, false); });

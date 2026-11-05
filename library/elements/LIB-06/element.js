// LIB-06 Contact dial (origen: v3)
const TAU = Math.PI * 2;
const f = (n) => n.toFixed(1);
const line = (pts) => 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L');
const path = (d, cls, draw) => `<path class="${cls}${draw ? ' draw' : ''}" d="${d}"${draw ? ' pathLength="1"' : ''}/>`;

  /* ---------- 4. Dial de anillos concéntricos ---------- */
  // spin: si es true, el anillo de marcas va en un grupo que gira con CSS
  function dial(cx, cy, R, spin) {
    let rings = '';
    for (let i = 1; i <= 5; i++) {
      const r = R * (0.22 + i * 0.15);
      rings += path(`M${f(cx + r)} ${cy}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${cy}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${cy}`, i === 5 ? 'w' : 'w-dim', true);
    }
    let ticks = '';
    for (let k = 0; k < 60; k++) {
      const t = (k / 60) * TAU, long = k % 5 === 0;
      const r1 = R * 1.0, r2 = R * (long ? 0.88 : 0.94);
      ticks += `M${f(cx + r1 * Math.cos(t))} ${f(cy + r1 * Math.sin(t))}L${f(cx + r2 * Math.cos(t))} ${f(cy + r2 * Math.sin(t))}`;
    }
    const tickPath = `<path class="w" d="${ticks}"/>`;
    const needle = path(`M${cx} ${cy}L${f(cx + R * 0.62 * Math.cos(-0.9))} ${f(cy + R * 0.62 * Math.sin(-0.9))}`, 'w-acc w-needle', true);
    return rings
      + (spin ? `<g class="spin" style="transform-origin:${cx}px ${cy}px">${tickPath}</g>` : tickPath)
      + needle + `<circle class="w-sat" cx="${cx}" cy="${cy}" r="${f(R * 0.06)}"/>`;
  }

const art = document.getElementById('art');
art.innerHTML = dial(150, 150, 120, true);
requestAnimationFrame(() => art.classList.add('is-drawn'));

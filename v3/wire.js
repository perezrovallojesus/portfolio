// Ilustraciones de alambre (diseño propio), generadas como SVG.
// Todas devuelven marcado <path> con class "w" (línea), "w-dim" (tenue) o "w-acc" (naranja).

(function () {
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

  /* ---------- 4. Dial de anillos concéntricos ---------- */
  // Anillos con clase "ring" (laten con CSS), marcas que giran y aguja que barre.
  function dial(cx, cy, R) {
    let rings = '';
    for (let i = 1; i <= 5; i++) {
      const r = R * (0.22 + i * 0.15);
      rings += `<g class="ring" style="--i:${i}">` + path(`M${f(cx + r)} ${cy}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${cy}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${cy}`, i === 5 ? 'w' : 'w-dim', true) + '</g>';
    }
    let ticks = '';
    for (let k = 0; k < 60; k++) {
      const t = (k / 60) * TAU, long = k % 5 === 0;
      const r1 = R * 1.0, r2 = R * (long ? 0.88 : 0.94);
      ticks += `M${f(cx + r1 * Math.cos(t))} ${f(cy + r1 * Math.sin(t))}L${f(cx + r2 * Math.cos(t))} ${f(cy + r2 * Math.sin(t))}`;
    }
    const origin = `transform-origin:${cx}px ${cy}px`;
    const needle = path(`M${cx} ${cy}L${cx} ${f(cy - R * 0.62)}`, 'w-acc', true);
    return rings
      + `<g class="spin" style="${origin}"><path class="w" d="${ticks}"/></g>`
      + `<g class="needle" style="${origin}">${needle}</g>`
      + `<circle class="w-sat" cx="${cx}" cy="${cy}" r="${f(R * 0.06)}"/>`;
  }

  window.Wire = { orbit, sphere, terrain, dial };
})();

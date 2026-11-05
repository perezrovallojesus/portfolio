// LIB-17 Interactive 3D mesh (origen: archived)
const TAU = Math.PI * 2;
const f = (n) => n.toFixed(1);
const line = (pts) => 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L');
const path = (d, cls, draw) => `<path class="${cls}${draw ? ' draw' : ''}" d="${d}"${draw ? ' pathLength="1"' : ''}/>`;

  /* ---------- 1. Disco orbital (hero): malla 3D proyectada en perspectiva ---------- */
  // v = { yaw, pitch, zoom, sat } en radianes / factor. La malla son puntos 3D
  // (anillos deformados + meridianos) que se giran y proyectan en cada frame.
  function orbit(v, cx = 300, cy = 312, R = 205) {
    const yaw = v.yaw || 0, zoom = v.zoom || 1;
    const tilt = 1.12 + (v.pitch || 0);                  // vista base ~64°, el pitch se suma
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const D = 3.2;                                       // distancia de cámara (en radios)
    // Proyección: (x, y) en el plano del disco ya girado, h = altura sobre el plano
    const P = (x, y, h) => {
      const depth = -(y * st + h * ct);                  // negativo = más cerca de la cámara
      const k = (D / (D + depth)) * zoom;
      return [cx + R * x * k, cy + R * (y * ct - h * st) * k];
    };
    const z = (r, t) => 0.11 * r * r * Math.sin(3 * t) + 0.035 * Math.sin(r * 11);
    const disc = (r, t) => P(r * Math.cos(t + yaw), r * Math.sin(t + yaw), z(r, t));
    let out = '';
    // anillos concéntricos deformados (el exterior en naranja)
    for (let i = 1; i <= 10; i++) {
      const r = 0.12 + i * 0.088, pts = [];
      for (let k = 0; k <= 72; k++) pts.push(disc(r, (k / 72) * TAU));
      out += path(line(pts), i === 10 ? 'w-acc' : 'w');
    }
    // meridianos
    for (let m = 0; m < 24; m++) {
      const t = (m / 24) * TAU, pts = [];
      for (let k = 0; k <= 12; k++) pts.push(disc(0.2 + (k / 12) * 0.8, t));
      out += path(line(pts), 'w-dim');
    }
    // eje vertical y núcleo
    out += path(line([P(0, 0, -0.3), P(0, 0, 0.95)]), 'w-dim w-dash');
    for (let i = 1; i <= 3; i++) {
      const pts = [], rr = 0.05 * i;
      for (let k = 0; k <= 36; k++) { const t = (k / 36) * TAU; pts.push(P(rr * Math.cos(t), rr * Math.sin(t), 0.03 * i)); }
      out += path(line(pts), 'w');
    }
    // órbita exterior punteada con satélite
    const orb = [], ro = 1.18, ho = 0.2;
    for (let k = 0; k <= 90; k++) { const t = (k / 90) * TAU; orb.push(P(ro * Math.cos(t), ro * Math.sin(t), ho)); }
    out += path(line(orb), 'w-dim w-dash');
    const s = (v.sat || 0) + yaw, sp = P(ro * Math.cos(s), ro * Math.sin(s), ho);
    out += `<circle class="w-sat" cx="${f(sp[0])}" cy="${f(sp[1])}" r="${f(6 * zoom)}"/>`;
    return out;
  }

const Wire = { orbit };
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasIO = 'IntersectionObserver' in window;
(function heroOrbit() {
  const win = document.querySelector('.window');
  const orbitEl = document.getElementById('orbit');
  const readout = document.getElementById('orbit-readout');
  const DEG = Math.PI / 180;
  const INIT = { yaw: 0.4, pitch: 0, zoom: 1 };
  const PITCH_MAX = 60 * DEG, ZOOM_MIN = 0.7, ZOOM_MAX = 1.8;
  const AUTO_SPEED = 0.00011;                       // rad/ms, el mismo giro lento de antes
  const v = { ...INIT, sat: 0 };
  let vYaw = 0, vPitch = 0;                         // inercia (rad/ms)
  let lastInput = -Infinity, dragging = false, dirty = true, visible = true, rafId = 0, last = 0;
  const pointers = new Map();
  let pinch = null, prev = null;

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  // Cada acción redibuja al instante (también con movimiento reducido) y despierta el bucle
  const touch = () => { lastInput = performance.now(); render(); wake(); };
  // Arrastre y pellizco: solo marcan la vista; se dibuja en el siguiente frame (≤ 60 fps)
  const nudge = () => { lastInput = performance.now(); dirty = true; wake(); };
  const setZoom = (z) => { v.zoom = clamp(z, ZOOM_MIN, ZOOM_MAX); touch(); };
  const reset = () => { Object.assign(v, INIT); vYaw = vPitch = 0; touch(); };

  function render() {
    orbitEl.innerHTML = Wire.orbit(v);
    const yawDeg = Math.round((((v.yaw / DEG) % 360) + 360) % 360);
    const pitchDeg = Math.round(v.pitch / DEG);
    readout.textContent = `YAW ${String(yawDeg).padStart(3, '0')}° · PITCH ${pitchDeg >= 0 ? '+' : ''}${pitchDeg}° · ZOOM ${v.zoom.toFixed(1)}x`;
    dirty = false;
  }

  function frame(ts) {
    rafId = 0;
    if (!visible) return;
    const dt = Math.min(ts - (last || ts), 50);
    last = ts;
    if (!dragging && !reduceMotion) {
      // inercia con decaimiento suave (independiente de los fps)
      if (Math.abs(vYaw) + Math.abs(vPitch) > 1e-6) {
        v.yaw += vYaw * dt; v.pitch = clamp(v.pitch + vPitch * dt, -PITCH_MAX, PITCH_MAX);
        const decay = Math.pow(0.9, dt / 16.7); vYaw *= decay; vPitch *= decay;
        dirty = true;
      }
      // giro automático tras 3 s sin interacción
      if (ts - lastInput > 3000) { v.yaw += AUTO_SPEED * dt; dirty = true; }
      v.sat += 0.00008 * dt;
    }
    if (dirty) render();
    // Sigue el bucle sin reiniciar el reloj. Con movimiento reducido solo
    // se redibuja mientras el usuario actúa.
    if (visible && (!reduceMotion || dragging)) rafId = requestAnimationFrame(frame);
  }
  function wake() { if (!rafId && visible) { last = 0; rafId = requestAnimationFrame(frame); } }

  /* Arrastre y pellizco (pointer events: mouse, lápiz y touch) */
  win.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.win-ctrl') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { win.setPointerCapture(e.pointerId); } catch (err) {}
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: v.zoom };
      dragging = false;
    } else {
      dragging = true; prev = { x: e.clientX, y: e.clientY, t: performance.now() };
      vYaw = vPitch = 0; win.classList.add('is-grabbing');
    }
    touch();
  });
  win.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      v.zoom = clamp(pinch.z * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.d), ZOOM_MIN, ZOOM_MAX); nudge();
      return;
    }
    if (!dragging || !prev) return;
    const now = performance.now(), dt = Math.max(now - prev.t, 8);
    const dYaw = (e.clientX - prev.x) * 0.008, dPitch = (e.clientY - prev.y) * 0.006;
    v.yaw += dYaw; v.pitch = clamp(v.pitch + dPitch, -PITCH_MAX, PITCH_MAX);
    // velocidad suavizada y limitada (~230°/s) para una inercia suave al soltar
    const VMAX = 0.004;
    vYaw = clamp(vYaw * 0.6 + (dYaw / dt) * 0.4, -VMAX, VMAX);
    vPitch = clamp(vPitch * 0.6 + (dPitch / dt) * 0.4, -VMAX / 3, VMAX / 3);
    prev = { x: e.clientX, y: e.clientY, t: now };
    nudge();
  });
  const endPointer = (e) => {
    if (!pointers.delete(e.pointerId)) return;
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) {
      dragging = false; prev = null; win.classList.remove('is-grabbing');
      if (reduceMotion) vYaw = vPitch = 0;
    }
    touch();
  };
  win.addEventListener('pointerup', endPointer);
  win.addEventListener('pointercancel', endPointer);

  /* Zoom con Ctrl/Cmd + rueda (o pellizco de trackpad); la rueda sola sigue haciendo scroll */
  win.addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    setZoom(v.zoom * Math.exp(-e.deltaY * 0.002));
  }, { passive: false });

  win.addEventListener('dblclick', (e) => { if (!e.target.closest('.win-ctrl')) reset(); });

  /* Botones de la ventana */
  win.querySelector('.win-ctrl').addEventListener('click', (e) => {
    const act = e.target.closest('button')?.dataset.act;
    if (act === 'in') setZoom(v.zoom * 1.15);
    else if (act === 'out') setZoom(v.zoom / 1.15);
    else if (act === 'reset') reset();
  });

  /* Teclado: flechas rotan, + / − zoom, 0 reinicia */
  win.addEventListener('keydown', (e) => {
    if (e.target.closest('button') && (e.key === 'Enter' || e.key === ' ')) return;
    const step = 8 * DEG;
    switch (e.key) {
      case 'ArrowLeft': v.yaw -= step; break;
      case 'ArrowRight': v.yaw += step; break;
      case 'ArrowUp': v.pitch = clamp(v.pitch - step, -PITCH_MAX, PITCH_MAX); break;
      case 'ArrowDown': v.pitch = clamp(v.pitch + step, -PITCH_MAX, PITCH_MAX); break;
      case '+': case '=': setZoom(v.zoom * 1.1); break;
      case '-': case '_': setZoom(v.zoom / 1.1); break;
      case '0': case 'Home': reset(); break;
      default: return;
    }
    e.preventDefault(); vYaw = vPitch = 0; touch();
  });

  /* Pausa fuera de pantalla */
  render();
  if (hasIO) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }).observe(win);
  }
  wake();
})();

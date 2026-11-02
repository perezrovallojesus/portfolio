// v3: render de proyectos, ilustraciones animadas y tema.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasIO = 'IntersectionObserver' in window;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Proyectos desde projects.js ---------- */

const thumbs = {
  dial: () => Wire.dial(160, 92, 74),
  sphere: () => Wire.sphere(),
  terrain: () => Wire.terrain()
};

const projects = window.PROJECTS || [];
document.getElementById('projects').innerHTML = projects.map((p) => `
  <article class="pod project" aria-labelledby="p-${esc(p.id)}">
    <div class="pod-in">
      <div class="proj-top">
        <span class="chip">${esc(p.id)}</span>
        <span class="label">${esc(p.company)}</span>
        <span class="dot" aria-hidden="true"></span>
      </div>
      <div class="screen thumb anim-host" data-wire="${esc(p.wire)}" aria-hidden="true">
        <svg viewBox="0 0 320 180" focusable="false">${(thumbs[p.wire] || thumbs.dial)()}</svg>
        <span class="thumb-label">FIG. ${esc(p.id)}</span>
      </div>
      <h3 id="p-${esc(p.id)}">${esc(p.title)}</h3>
      <p class="line">${esc(p.line)}</p>
      <dl class="spec">
        <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
        <div><dt>Tools</dt><dd>${p.tools.map(esc).join(' · ')}</dd></div>
        <div><dt>Year</dt><dd>${esc(p.year)}</dd></div>
      </dl>
      <p class="proj-link">${p.link
        ? `<a class="cta cta-sm" href="${esc(p.link)}" rel="noopener" target="_blank">View case ↗<span class="visually-hidden"> (opens in a new tab)</span></a>`
        : '<span class="todo">[TODO: case link]</span>'}</p>
    </div>
  </article>`).join('');

/* ---------- Osciloscopio de contacto: traza periódica que CSS desplaza en bucle ---------- */
// Periodo de 140 unidades: la traza mide 280 + 140 y al desplazarse -140 encaja sin salto.

(function buildTrace() {
  const P = 140, pts = [];
  for (let x = 10; x <= 10 + 280 + P; x += 2) {
    const a = (2 * Math.PI * x) / P;
    pts.push(`${x} ${(100 - (26 * Math.sin(a) + 9 * Math.sin(3 * a + 0.6) + 5 * Math.sin(7 * a))).toFixed(1)}`);
  }
  document.getElementById('osc-trace').setAttribute('d', 'M' + pts.join('L'));
})();

/* ---------- Animaciones en bucle (un solo rAF, solo lo visible) ---------- */
// Cada bucle acumula su propio tiempo mientras está visible; las animaciones CSS
// de las miniaturas se pausan con .is-live (ver .anim-host en styles.css).

const loops = [];
const orbitEl = document.getElementById('orbit');
orbitEl.innerHTML = Wire.orbit(0.4);
loops.push({ el: document.querySelector('.window'), t: 0, ready: true, render: (t) => { orbitEl.innerHTML = Wire.orbit(0.4 + t * 0.00011); } });

document.querySelectorAll('.thumb').forEach((thumb) => {
  const svg = thumb.querySelector('svg');
  const kind = thumb.dataset.wire;
  // La esfera gira y el terreno ondula (se redibujan); el dial se anima solo con CSS
  if (kind === 'sphere') loops.push({ el: thumb, t: 0, ready: false, render: (t) => { svg.innerHTML = Wire.sphere(140, 92, 66, t * 0.00035, false); } });
  if (kind === 'terrain') loops.push({ el: thumb, t: 0, ready: false, render: (t) => { svg.innerHTML = Wire.terrain(320, 180, t * 0.0011, false); } });
});

let last = 0;
function tick(ts) {
  const dt = Math.min(ts - (last || ts), 100);
  if (ts - last >= 33 || !last) {                   // ~30 fps basta para movimientos lentos
    loops.forEach((l) => { if (l.live && l.ready) { l.t += dt; l.render(l.t); } });
    last = ts;
  }
  if (loops.some((l) => l.live)) requestAnimationFrame(tick); else last = 0;
}

/* ---------- Entrada (trazo) y visibilidad ---------- */

const hosts = document.querySelectorAll('.thumb, .signal-mod');
if (reduceMotion || !hasIO) {
  hosts.forEach((el) => el.classList.add('is-drawn'));
} else {
  // Trazo de entrada una vez; al terminar, la miniatura pasa al bucle continuo
  const drawIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-drawn');
      drawIO.unobserve(e.target);
      const l = loops.find((x) => x.el === e.target);
      if (l) setTimeout(() => { l.ready = true; }, 1900);
    });
  }, { threshold: 0.3 });
  hosts.forEach((el) => drawIO.observe(el));

  // Pausa todo lo que sale de pantalla (rAF y animaciones CSS)
  const liveIO = new IntersectionObserver((entries) => {
    const wasIdle = !loops.some((l) => l.live);
    entries.forEach((e) => {
      e.target.classList.toggle('is-live', e.isIntersecting);
      const l = loops.find((x) => x.el === e.target);
      if (l) l.live = e.isIntersecting;
    });
    if (wasIdle && loops.some((l) => l.live)) requestAnimationFrame(tick);
  });
  [...hosts, document.querySelector('.window')].forEach((el) => liveIO.observe(el));
}

/* ---------- Tema: oscuro por defecto; solo se recuerda si el usuario elige ---------- */

const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');
const currentTheme = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

function updateToggleLabel() {
  toggle.setAttribute('aria-label', `Switch to ${currentTheme() === 'dark' ? 'light' : 'dark'} theme`);
}
toggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  updateToggleLabel();
});
updateToggleLabel();

/* ---------- Números de regla del patrón de fondo ---------- */
// Una etiqueta por línea mayor (cada 5 módulos) en los bordes superior e izquierdo.
// Se recalcula cuando cambia el tamaño de la página.

const mat = document.querySelector('.mat');
const matNums = mat.querySelector('.mat-nums');
let matFrame = 0;

function drawRulerNumbers() {
  const mod = parseFloat(getComputedStyle(root).getPropertyValue('--mod')) || 12;
  const step = mod * 5;
  const w = mat.clientWidth, h = mat.clientHeight;
  let html = '';
  for (let x = step; x < w - step / 2; x += step) html += `<span style="left:${x + 3}px;top:12px">${Math.round(x / mod)}</span>`;
  for (let y = step; y < h - step / 2; y += step) html += `<span style="left:13px;top:${y + 3}px">${Math.round(y / mod)}</span>`;
  matNums.innerHTML = html;
}
const scheduleRuler = () => { cancelAnimationFrame(matFrame); matFrame = requestAnimationFrame(drawRulerNumbers); };
if ('ResizeObserver' in window) new ResizeObserver(scheduleRuler).observe(mat);
else window.addEventListener('resize', scheduleRuler);
drawRulerNumbers();

document.getElementById('year').textContent = new Date().getFullYear();

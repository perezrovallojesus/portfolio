// v3: render de proyectos e ilustraciones animadas.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Proyectos desde projects.js ---------- */

const thumbs = {
  dial: () => Wire.dial(160, 92, 74, false),
  sphere: () => Wire.sphere(),
  terrain: () => Wire.terrain()
};

document.getElementById('projects').innerHTML = (window.PROJECTS || []).map((p) => `
  <article class="pod project" aria-labelledby="p-${esc(p.id)}">
    <div class="pod-in">
      <div class="proj-top">
        <span class="chip">${esc(p.id)}</span>
        <span class="label">${esc(p.company)}</span>
        <span class="dot" aria-hidden="true"></span>
      </div>
      <div class="screen thumb" aria-hidden="true">
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
      ${p.link
        ? `<p class="proj-link"><a class="link" href="${esc(p.link)}" rel="noopener" target="_blank">View case ↗<span class="visually-hidden"> (opens in a new tab)</span></a></p>`
        : ''}
    </div>
  </article>`).join('');

/* ---------- Dial de contacto ---------- */

document.getElementById('dial').innerHTML = Wire.dial(150, 150, 120, true);

/* ---------- Disco orbital del hero: gira despacio y se pausa fuera de pantalla ---------- */

const orbitEl = document.getElementById('orbit');
let angle = 0.4, last = 0, running = false, rafId = 0;

function frame(ts) {
  if (!running) return;
  if (ts - last > 33) {                     // ~30 fps es suficiente para un giro lento
    angle += reduceMotion ? 0 : (ts - (last || ts)) * 0.00011;
    orbitEl.innerHTML = Wire.orbit(angle);
    last = ts;
  }
  rafId = requestAnimationFrame(frame);
}
orbitEl.innerHTML = Wire.orbit(angle);

if (!reduceMotion && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) { last = 0; rafId = requestAnimationFrame(frame); } else cancelAnimationFrame(rafId);
  }).observe(document.querySelector('.window'));
}

/* ---------- Líneas que se dibujan al entrar en vista ---------- */

const drawTargets = document.querySelectorAll('.thumb, .dial-mod');
if (reduceMotion || !('IntersectionObserver' in window)) {
  drawTargets.forEach((el) => el.classList.add('is-drawn'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-drawn'); io.unobserve(e.target); } });
  }, { threshold: 0.3 });
  drawTargets.forEach((el) => io.observe(el));
}

document.getElementById('year').textContent = new Date().getFullYear();

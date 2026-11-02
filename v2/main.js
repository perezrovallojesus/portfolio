// v2: render de proyectos, perilla selectora y tecla con estado presionado.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Proyectos desde projects.js ---------- */

const list = document.getElementById('projects');
const projects = window.PROJECTS || [];
list.innerHTML = projects.map((p, i) => `
  <li class="project" data-index="${i + 1}">
    <span class="project-num">${esc(p.id)}</span>
    <h3 class="project-title">${esc(p.title)}</h3>
    <p class="project-role">${esc(p.role)}</p>
    <p class="project-line">${esc(p.line)}</p>
    <p>${p.link
      ? `<a class="link" href="${esc(p.link)}" rel="noopener" target="_blank">View case ↗<span class="visually-hidden"> (opens in a new tab)</span></a>`
      : '<span class="todo">[TODO: case link]</span>'}</p>
  </li>`).join('');

/* ---------- Perilla: elige el proyecto en foco ---------- */

const knob = document.getElementById('knob');
const max = projects.length;
const SPAN = 60;                         // grados entre posiciones
const angleOf = (v) => (v - (max + 1) / 2) * SPAN;
const limit = angleOf(max) + 15;         // tope de giro a cada lado
let value = 1;

// Marcas de la escala: menores cada 15° y mayores con número en cada posición
const ticks = knob.querySelector('.ticks');
let svg = '';
for (let a = -limit; a <= limit; a += 15) {
  const r = (a * Math.PI) / 180;
  svg += `<line x1="${Math.sin(r) * 64}" y1="${-Math.cos(r) * 64}" x2="${Math.sin(r) * 70}" y2="${-Math.cos(r) * 70}" opacity=".45"/>`;
}
for (let v = 1; v <= max; v++) {
  const r = (angleOf(v) * Math.PI) / 180;
  svg += `<line x1="${Math.sin(r) * 62}" y1="${-Math.cos(r) * 62}" x2="${Math.sin(r) * 72}" y2="${-Math.cos(r) * 72}"/>`;
  svg += `<text x="${Math.sin(r) * 84}" y="${-Math.cos(r) * 84 + 3}" text-anchor="middle">${String(v).padStart(2, '0')}</text>`;
}
ticks.innerHTML = svg;

function setValue(v) {
  value = Math.min(max, Math.max(1, v));
  knob.style.setProperty('--angle', `${angleOf(value)}deg`);
  const p = projects[value - 1];
  knob.setAttribute('aria-valuenow', value);
  knob.setAttribute('aria-valuetext', `${String(value).padStart(2, '0')}, ${p ? p.title : ''}`);
  list.querySelectorAll('.project').forEach((el) => el.classList.toggle('is-active', +el.dataset.index === value));
}

// Arrastre: el ángulo sigue al puntero y al soltar encaja en la posición más cercana
let dragging = false;
knob.addEventListener('pointerdown', (e) => {
  dragging = true;
  try { knob.setPointerCapture(e.pointerId); } catch (err) {}
  knob.classList.add('is-dragging');
});
knob.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const r = knob.getBoundingClientRect();
  const deg = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
  const a = Math.max(-limit, Math.min(limit, deg));
  knob.style.setProperty('--angle', `${a}deg`);
  const nearest = Math.round(a / SPAN + (max + 1) / 2);
  if (nearest !== value) setValue(nearest), knob.style.setProperty('--angle', `${a}deg`);
});
const release = () => {
  if (!dragging) return;
  dragging = false;
  knob.classList.remove('is-dragging');
  setValue(value);
};
knob.addEventListener('pointerup', release);
knob.addEventListener('pointercancel', release);

// Rueda: un paso por gesto (solo con el cursor sobre la perilla)
let wheelLock = false;
knob.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (wheelLock) return;
  wheelLock = true;
  setValue(value + (e.deltaY > 0 ? 1 : -1));
  setTimeout(() => { wheelLock = false; }, 180);
}, { passive: false });

// Teclado: comportamiento estándar de slider
knob.addEventListener('keydown', (e) => {
  const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
  if (e.key in map) setValue(value + map[e.key]);
  else if (e.key === 'Home') setValue(1);
  else if (e.key === 'End') setValue(max);
  else return;
  e.preventDefault();
});

// Clic en una fila también la pone en foco
list.addEventListener('click', (e) => {
  const row = e.target.closest('.project');
  if (row && !e.target.closest('a')) setValue(+row.dataset.index);
});

setValue(1);

/* ---------- Tecla: mantiene el estado presionado un instante (también con teclado) ---------- */

document.querySelectorAll('.key').forEach((k) => {
  k.addEventListener('click', () => {
    k.classList.add('is-pressed');
    setTimeout(() => k.classList.remove('is-pressed'), 220);
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

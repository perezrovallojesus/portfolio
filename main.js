// Interacciones: render de proyectos, tema, copiar email, texto tecleado y reveal.

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Utilidades de texto ---------- */

// Escapa HTML para insertar datos de projects.js de forma segura
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Escapa y convierte cada "[TODO: ...]" en un marcador visible
const rich = (s) => esc(s).replace(/\[TODO:[^\]]*\]/g, (m) => `<span class="todo">${m}</span>`);

/* ---------- Esquemas SVG (placeholder de imagen, uno por proyecto) ---------- */

const SCHEMATICS = [
  // Dashboard de sistema de eventos
  `<rect class="s-frame" x="2" y="2" width="356" height="216"/>
   <rect class="s-ink" x="2" y="2" width="356" height="22"/>
   <rect class="s-fill" x="14" y="36" width="70" height="170"/>
   <rect class="s-acc" x="22" y="46" width="54" height="10"/>
   <rect class="s-fill" x="96" y="36" width="120" height="60"/><rect class="s-fill" x="226" y="36" width="120" height="60"/>
   <path class="s-line" d="M96 116H346M96 140H346M96 164H346M96 188H346"/>`,
  // Pantallas responsive (desktop + móvil)
  `<rect class="s-frame" x="2" y="10" width="230" height="160"/>
   <rect class="s-ink" x="2" y="10" width="230" height="18"/>
   <rect class="s-fill" x="16" y="42" width="200" height="56"/>
   <rect class="s-acc" x="16" y="110" width="60" height="14"/>
   <path class="s-line" d="M16 140H216M16 154H170"/>
   <rect class="s-frame" x="262" y="40" width="94" height="176"/>
   <rect class="s-ink" x="262" y="40" width="94" height="16"/>
   <rect class="s-fill" x="272" y="66" width="74" height="50"/>
   <rect class="s-acc" x="272" y="126" width="40" height="10"/>
   <path class="s-line" d="M272 150H346M272 164H330M272 178H346"/>`,
  // Página web
  `<rect class="s-frame" x="2" y="2" width="356" height="216"/>
   <rect class="s-ink" x="2" y="2" width="356" height="20"/>
   <rect class="s-fill" x="18" y="36" width="324" height="70"/>
   <rect class="s-acc" x="34" y="78" width="70" height="14"/>
   <rect class="s-fill" x="18" y="120" width="100" height="84"/><rect class="s-fill" x="130" y="120" width="100" height="84"/><rect class="s-fill" x="242" y="120" width="100" height="84"/>`,
  // Piezas de marketing / redes
  `<rect class="s-frame" x="2" y="2" width="110" height="110"/><rect class="s-frame" x="124" y="2" width="110" height="110"/><rect class="s-frame" x="246" y="2" width="110" height="110"/>
   <rect class="s-acc" x="14" y="14" width="40" height="40"/><rect class="s-ink" x="136" y="62" width="86" height="38"/><rect class="s-fill" x="258" y="14" width="86" height="86"/>
   <rect class="s-frame" x="2" y="124" width="232" height="92"/><rect class="s-fill" x="246" y="124" width="110" height="92"/>
   <path class="s-line" d="M16 150H180M16 170H210M16 190H120"/>`
];

/* ---------- Render de case studies desde projects.js ---------- */

function field(label, content) {
  return `<div class="field"><p class="tag">${label}</p><div>${content}</div></div>`;
}

function renderCase(p, i) {
  const n = String(i + 1).padStart(2, '0');
  const headingId = `case-${p.id.toLowerCase()}`;
  const media = p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.title)} — ${esc(p.company)}" loading="lazy">`
    : `<div class="media-inner">
         <svg class="schematic" viewBox="0 0 360 220" aria-hidden="true" focusable="false">${SCHEMATICS[i % SCHEMATICS.length]}</svg>
         <span class="todo">[TODO: ${esc(p.company)} project image]</span>
       </div>`;
  // Si el enlace es el perfil general de Behance, falta el link directo del proyecto
  const genericLink = /behance\.net\/rovallo\/?$/.test(p.link);

  return `
  <article class="case reveal" aria-labelledby="${headingId}">
    <div class="case-head">
      <div class="case-num" aria-hidden="true">${n}</div>
      <dl class="case-meta">
        <div class="cell"><dt class="tag">ID</dt><dd class="val">${esc(p.id)}</dd></div>
        <div class="cell"><dt class="tag">Date</dt><dd class="val">${esc(p.date)}</dd></div>
        <div class="cell"><dt class="tag">Role</dt><dd class="val">${rich(p.role)}</dd></div>
        <div class="cell"><dt class="tag">Tools</dt><dd class="val">${p.tools.map(rich).join(' · ')}</dd></div>
      </dl>
    </div>
    <div class="case-main">
      <div class="case-media brackets">${media}</div>
      <div class="cell case-body">
        <p class="tag">${esc(p.company)}</p>
        <h3 id="${headingId}">${esc(p.title)}</h3>
        <p class="case-brief">${rich(p.brief)}</p>
        <div class="fields">
          ${field('Process', `<ol>${p.process.map((s) => `<li>${rich(s)}</li>`).join('')}</ol>`)}
          ${field('Design decisions', `<ul class="plain">${p.decisions.map((s) => `<li>${rich(s)}</li>`).join('')}</ul>`)}
          ${field('Visual system', `<p>${rich(p.visualSystem)}</p>`)}
          ${field('Deliverables', `<ul class="chips">${p.deliverables.map((s) => `<li>${rich(s)}</li>`).join('')}</ul>`)}
        </div>
        <div class="case-links">
          <a class="btn btn-ghost" href="${esc(p.link)}" rel="noopener" target="_blank">View on Behance ↗<span class="visually-hidden"> (opens in a new tab)</span></a>
          ${genericLink ? '<span class="todo">[TODO: direct project link]</span>' : ''}
        </div>
      </div>
    </div>
  </article>`;
}

const casesEl = document.getElementById('cases');
if (casesEl && Array.isArray(window.PROJECTS)) {
  casesEl.innerHTML = window.PROJECTS.map(renderCase).join('');
}

/* ---------- Tema claro/oscuro ---------- */

const toggle = document.querySelector('.theme-toggle');
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');

function updateToggleLabel() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  toggle.setAttribute('aria-label', `Switch to ${next} theme`);
}
toggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  updateToggleLabel();
});
darkQuery.addEventListener('change', updateToggleLabel);
updateToggleLabel();

/* ---------- Copiar email ---------- */

const live = document.getElementById('live-region');
document.querySelectorAll('.copy-email').forEach((btn) => {
  const label = btn.querySelector('.copy-label');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.email);
      label.textContent = 'Copied ✓';
      live.textContent = 'Email address copied to clipboard';
    } catch (e) {
      // Sin permiso de portapapeles: abrimos el cliente de correo
      window.location.href = `mailto:${btn.dataset.email}`;
      return;
    }
    setTimeout(() => { label.textContent = 'Copy email'; live.textContent = ''; }, 2000);
  });
});

/* ---------- Texto que se escribe (solo visual; el texto real está oculto para lectores) ---------- */

const typed = document.querySelector('.typed');
if (typed && !reduceMotion) {
  const text = typed.textContent;
  typed.textContent = '';
  let i = 0;
  const tick = () => {
    typed.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, 38);
  };
  setTimeout(tick, 300);
}

/* ---------- Reveal al hacer scroll ---------- */

if ('IntersectionObserver' in window && !reduceMotion) {
  const targets = document.querySelectorAll(
    // Módulos completos: si se animan celdas sueltas, asoma el fondo de líneas de la cuadrícula
    '.sec-head, .company-grid, .service-grid, .process, .about-grid, .contact-inner, .case'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  targets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}

document.getElementById('year').textContent = new Date().getFullYear();

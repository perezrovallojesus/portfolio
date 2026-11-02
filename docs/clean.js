// Limpieza del sitio publicado (lo copia scripts/publish.sh en cada versión de docs/).
// Se carga con defer después de main.js, cuando el contenido ya está renderizado:
// quita los marcadores [TODO], los enlaces sin destino y los contenedores que quedan vacíos.
(function () {
  // Elementos que no se tocan aunque estén vacíos (regiones vivas, anclas con id, etc.)
  const keep = (el) => el.id || el.hasAttribute('aria-live');
  const hasMedia = (el) => el.querySelector('img, svg, a, button, input');
  const isEmpty = (el) => !el.textContent.trim() && !hasMedia(el);

  // 1. Marcadores [TODO] y enlaces sin destino real
  document.querySelectorAll('.todo').forEach((el) => el.remove());
  document.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === null || href === '' || href === '#') a.remove();
  });

  // 2. Valores de ficha vacíos: se marcan con "—" para no romper la retícula de celdas
  document.querySelectorAll('dd').forEach((dd) => { if (isEmpty(dd)) dd.textContent = '—'; });

  // 3. Contenedores que quedaron vacíos (en varias pasadas: un hueco puede vaciar a su padre)
  let changed = true;
  while (changed) {
    changed = false;
    document.querySelectorAll('p, li, ul, ol, .proj-link, .case-links').forEach((el) => {
      if (keep(el) || !isEmpty(el)) return;
      el.remove();
      changed = true;
    });
  }

  // 4. Campos de ficha (etiqueta + contenido) cuyo contenido quedó vacío
  document.querySelectorAll('.field').forEach((f) => {
    const content = f.lastElementChild;
    if (content && isEmpty(content)) f.remove();
  });
})();

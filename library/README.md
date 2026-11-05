1. Crea `library/elements/LIB-XX/` con `index.html`, `element.css` y, si hace falta, `element.js`; debe funcionar sola, sin depender de v1 ni v3.
2. Añade su entrada a `library/elements.json`: `id`, `name`, `description`, `origin` (v1, v3 o archived), `status` (in use o removed), `usedIn`, `motion` y `files`.
3. El catálogo se renderiza desde el JSON: no hay que tocar `library/index.html`.
4. Ábrelo con el servidor local en `http://localhost:8080/library/` (con `file://` no puede leer el JSON).
5. La biblioteca es solo local: no la copies a `docs/` ni la enlaces desde el sitio publicado.

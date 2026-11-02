#!/usr/bin/env bash
# Regenera docs/ (sitio de GitHub Pages) desde las versiones de trabajo:
#   v3/ -> docs/      (raíz del sitio)
#   v1/ -> docs/v1/
#   v2/ -> docs/v2/   (con noindex; no se enlaza desde ningún sitio)
# Además ajusta los enlaces entre versiones y oculta los [TODO] y enlaces sin destino.
# Uso: scripts/publish.sh   (no hace commit ni push)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOCS="$ROOT/docs"
SITE_URL="https://perezrovallojesus.github.io/portfolio/"

# Copia los archivos del sitio de una versión (sin DESIGN.md ni notas de trabajo)
copy_version() {
  local src="$1" dest="$2"
  mkdir -p "$dest"
  for f in index.html styles.css main.js projects.js wire.js; do
    [ -f "$src/$f" ] && cp "$src/$f" "$dest/"
  done
  [ -d "$src/assets" ] && cp -R "$src/assets" "$dest/"
  # Limpieza en el navegador: tras main.js quita [TODO], enlaces vacíos y huecos
  cp "$ROOT/scripts/publish-clean.js" "$dest/clean.js"
  perl -0pi -e 's#</head>#  <!-- Publicado: oculta marcadores [TODO] -->\n  <style>.todo{display:none!important}</style>\n  <script src="clean.js" defer></script>\n</head>#' "$dest/index.html"
}

echo "-> Limpiando docs/"
rm -rf "$DOCS"
mkdir -p "$DOCS"

echo "-> v3 en la raíz"
copy_version "$ROOT/v3" "$DOCS"
# En la raíz, v1 está en una subcarpeta
perl -pi -e 's#href="\.\./v1/"#href="v1/"#g' "$DOCS/index.html"

echo "-> v1 en docs/v1/"
copy_version "$ROOT/v1" "$DOCS/v1"
# Desde v1, v3 es la raíz del sitio
perl -pi -e 's#href="\.\./v3/"#href="../"#g' "$DOCS/v1/index.html"
# URLs absolutas (canonical, og:url, og:image) apuntan a la carpeta de v1
perl -pi -e "s#\Q$SITE_URL\E(?!v1/)#${SITE_URL}v1/#g" "$DOCS/v1/index.html"

echo "-> v2 en docs/v2/ (noindex)"
copy_version "$ROOT/v2" "$DOCS/v2"
grep -q 'name="robots"' "$DOCS/v2/index.html" || \
  perl -pi -e 's#(<meta name="viewport"[^>]*>)#$1\n  <meta name="robots" content="noindex">#' "$DOCS/v2/index.html"

touch "$DOCS/.nojekyll"

# Comprobaciones: ninguna referencia a carpetas de trabajo ni a references/
if grep -rnE '\.\./v[123]/|references/' "$DOCS" --include=index.html; then
  echo "ERROR: quedan rutas a carpetas de trabajo en docs/" >&2
  exit 1
fi

echo "-> Listo:"
find "$DOCS" -type f | sed "s#$ROOT/##" | sort

# v3 — DESIGN.md

**Densidad media:** poco texto, pero cada módulo comunica algo (un dato real, una ilustración, una lectura o una acción). No hay celdas vacías decorativas.

## 1. Referencias (reinterpretadas, nada copiado)

| Ref | Qué tomamos |
|---|---|
| ref-12.jpg (interior de nave) | Paneles blancos mate con costuras finas, esquinas biseladas, **marco octagonal** como ventana, pantalla negra con líneas blancas y arcos de marcas, tornillos y remaches pequeños, etiquetas técnicas diminutas y puntos naranjas. |
| ref-13.jpg (pósters Y2K) | **Módulos redondeados anidados** (borde exterior + borde interior), **wireframes protagonistas** (disco, terreno, superficie), retícula fina, títulos condensados y pesados, barras y diales como medidores. |

## 2. Tokens

### Color
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#ECECE8` | Base blanco cálido mate |
| `--plate` | `#F7F7F4` | Paneles claros (ref-12) |
| `--pearl` | `#DCDCD6` | Gris perla: paneles secundarios, celdas de ficha |
| `--seam` | `#C4C4BC` | Costuras y retícula (decorativo) |
| `--ink` | `#121212` | Texto y bordes de módulos |
| `--ink-soft` | `#4A4A45` | Texto secundario (≥ 6:1 sobre bg y pearl) |
| `--screen` | `#121212` | Pantallas negras |
| `--screen-ink` | `#ECECE8` | Texto y líneas en pantalla |
| `--screen-dim` | `#9A9A93` | Texto secundario en pantalla (≥ 5.5:1) |
| `--orange` | `#FF5B14` | Acento principal: relleno con texto negro, puntos y LEDs. En pantallas negras también se permite como texto (≈ 6:1). **Nunca como texto sobre claro.** |
| `--petrol` | `#12303F` | Segundo acento: ilustraciones y **2 módulos** (Education y el dial de Contact). Texto encima `--screen-ink` (≈ 11:1). |

### Tipografía
- **Display:** Anton (condensada y pesada), en mayúsculas, para el nombre, los títulos y las cifras.
- **Mono:** JetBrains Mono 400/700 para cuerpo, etiquetas, fichas y nav.
- Escala: nombre `clamp(3.6rem, 8vw, 8.5rem)` · h2 `clamp(2.6rem, 6vw, 5.5rem)` · h3 `clamp(1.6rem, 2.4vw, 2.2rem)` · cifra de módulo `clamp(2.4rem, 4vw, 3.6rem)` · etiqueta `0.68rem` en mayúsculas con tracking 0.12em.

### Forma y espacio
- Base de 8px. El gap entre módulos es 12px en móvil y 16px en escritorio. El padding interior es de 16–28px.
- **Pod** (ref-13): borde de 1.5px `--ink` con radio 20px, y dentro otro borde de 1px con radio 14px y un margen de 6px.
- **Plate** (ref-12): relleno `--plate`, esquinas biseladas (`--cut: 14px`), costura interior de 1px `--seam` y 4 remaches en las esquinas.
- **Screen:** fondo `--screen`, radio 12px y retícula fina al 10% de opacidad.

## 3. Componentes
- **Ventana octagonal (hero):** marco plate octagonal con bisel interior y remaches. Dentro, una pantalla negra con el disco orbital de alambre animado.
- **Módulos de dato:** etiqueta mono, cifra en Anton y un medidor que representa el dato real: 6 marcas para 6+ años, la escala A1–C2 para el inglés y la lista de herramientas.
- **Ficha de proyecto:** pod con barra superior (ID y año), miniatura de alambre en pantalla, título, una línea y una tabla (rol, herramientas, año).
- **Pantalla de lecturas (About):** filas `TOOL ······ USE` con LED de estado.
- **CTA:** relleno naranja, texto negro, radio 999px, mono en mayúsculas y un punto LED.

## 4. Ilustraciones (SVG generado con JS, diseño propio)
1. **Disco orbital** (hero): anillos y meridianos de un disco con retícula ondulada, proyectado en 3D y girando despacio.
2. **Esfera de alambre** (Mocion: plataforma híbrida): latitudes y longitudes.
3. **Terreno ondulado** (UENI: sectores diversos): líneas de un terreno en perspectiva.
4. **Dial de anillos concéntricos** (Shocklogic y Contact): anillos, marcas y aguja.

## 5. Movimiento
- El disco gira despacio y se pausa fuera de pantalla. Las líneas de las miniaturas se dibujan al entrar en vista y los LEDs parpadean con suavidad.
- Con `prefers-reduced-motion: reduce` se muestra un fotograma estático, las líneas aparecen completas y no hay parpadeo.

## 6. Accesibilidad
- Contraste AA en todo el texto y foco visible de 3px `--ink`, o `--screen-ink` sobre pantallas.
- Las ilustraciones son `aria-hidden`. Los datos de los módulos son texto real.

## 7. Contenido
- Datos solo del CV. Lo que falta se marca con `[TODO: …]` visible. Sin métricas, producción ni conversión. Sin teléfono.
- Los proyectos viven en `v3/projects.js`.

# DESIGN.md — Sistema visual

Dirección: **industrial-brutalista, técnica, hoja de especificaciones.** El sitio se lee como un panel de control o una ficha técnica: una cuadrícula visible, módulos rotulados con códigos y un solo acento cálido.

## 1. Referencias analizadas (`references/`)

| Ref | Qué tomamos |
|---|---|
| ref-1 | Marco con líneas de 1px y celdas visibles; cuadrados naranjas en las esquinas del bloque del nombre; nombre gigante a todo el ancho; celda negra con *corner brackets* y objeto 3D (cruz de 6 brazos); botón naranja con esquina biselada; nav en mono. |
| ref-2 | Módulos con esquinas biseladas, etiquetas mono pequeñas dentro de las celdas, bloque de color saturado como acento puntual. |
| ref-3 | Fichas técnicas: campos `ID`, `REF`, `DATE`, `SYSTEM OK`, números enormes apilados, franjas de peligro naranja/negro, barras de datos, código de barras. |
| ref-4 | Números y tipografía display enormes, bloques sólidos naranja/negro con texto negro. |
| ref-5 | Dashboards técnicos: celdas con número + etiqueta, bloque naranja como celda destacada, línea de tiempo por fases. |
| ref-6 | Amarillo como bloque con texto negro, `DC-05`, `S01`, detalles de interfaz mecánica. |
| ref-7 | Aparato retro gris claro con botones naranjas, osciloscopio, teclado de cuadraditos, numeración lateral 01–09. |
| ref-8 | Layout tipo ficha de producto: columna con tabla de specs (encabezado negro, filas con líneas finas), cuerpo en mono, callouts con líneas. |
| ref-9, ref-10 | Paneles mecánicos: ranuras de ventilación, biseles, tornillos, superficie gris mate. |
| ref-11 | Monocromo gris con acento naranja mínimo. |

## 2. Tokens

### Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | `#E3E3E0` | `#121212` | Base mate |
| `--panel` | `#D5D5D1` | `#1B1B1A` | Paneles / celdas secundarias |
| `--panel-2` | `#C6C6C1` | `#262624` | Paneles más profundos, cuerpo del objeto |
| `--line` | `#9E9E99` | `#3D3D3A` | Líneas de la cuadrícula (decorativas, 1px) |
| `--ink` | `#121212` | `#E3E3E0` | Texto principal |
| `--ink-soft` | `#4A4A46` | `#A8A8A3` | Texto secundario (≥ 6:1) |
| `--block` | `#121212` | `#E3E3E0` | Bloques sólidos (se invierten en oscuro) |
| `--block-ink` | `#E3E3E0` | `#121212` | Texto sobre `--block` |
| `--orange` | `#FF6A1A` | `#FF6A1A` | Acento: **solo relleno** |
| `--yellow` | `#F5C518` | `#F5C518` | Secundario: **solo relleno** |
| `--on-accent` | `#121212` | `#121212` | Texto sobre naranja/amarillo, siempre negro |

**Reglas de color**
- El naranja y el amarillo se usan **solo como relleno**: botones, celdas invertidas, cuadrados marcadores, franjas y barras. El texto encima siempre es `--on-accent` (#121212). El contraste #121212 sobre #FF6A1A es ≈ 6.7:1 y sobre #F5C518 ≈ 11:1.
- **Nunca** naranja como color de texto (sobre #E3E3E0 da ≈ 2.1:1).
- No se usan degradados de color, glassmorphism ni sombras suaves. La profundidad sale de capas planas, biseles y sombras duras de 1 color sin desenfoque.

### Tipografía

| Rol | Familia | Uso |
|---|---|---|
| Display | **Unbounded** 700/900 (ancha, pesada) | Nombre, títulos de sección, números grandes, nombres de empresa |
| Mono | **JetBrains Mono** 400/700 | Nav, etiquetas, metadatos, cuerpo de texto, botones |

Escala (fluida con `clamp`):
- `--fs-name`: 2.4rem → 10.5rem (nombre del hero)
- `--fs-h2`: 2rem → 5rem
- `--fs-h3`: 1.25rem → 2rem
- `--fs-num`: 3rem → 7rem (números de sección/proyecto)
- `--fs-body`: 0.95rem → 1rem, interlineado 1.65
- `--fs-label`: 0.72rem, MAYÚSCULAS, tracking 0.08em

### Espaciado y forma
- Base de 8px: `--s1` 8 · `--s2` 16 · `--s3` 24 · `--s4` 32 · `--s6` 48 · `--s8` 64 · `--s12` 96.
- Bordes rectos (radio 0). Biseles con `clip-path` usando `--cut: 14px`, solo en botones y en algunos paneles.
- Líneas: 1px `--line` para la cuadrícula y 2px `--ink` para separadores fuertes.

## 3. Componentes y patrones

- **Marco** (`.frame`): contenedor de hasta 1440px con bordes laterales de 1px, como el marco de ref-1.
- **Cuadrícula de módulos** (`.grid`): `gap: 1px` sobre fondo `--line`, de modo que las celdas dejan ver las líneas.
- **Celda** (`.cell`): padding de 24–40px, etiqueta mono arriba (`.tag`) y un código opcional a la derecha (`REF`, `ID`).
- **Corner brackets** (`.brackets`): 4 esquinas en L dibujadas con `background` (8 gradientes planos, sin elementos extra).
- **Cruz de registro** (`.reg`): "+" de 1px en las intersecciones clave.
- **Marcador** (`.sq`): cuadrado naranja de 10px.
- **Franja de peligro** (`.hazard`): `repeating-linear-gradient` de 45° naranja/negro, 14px de alto, como separador entre secciones.
- **Marquee** de herramientas: banda `--block` con texto `--block-ink` y separadores `.sq`.
- **Ficha técnica de proyecto**: cabecera con `ID / DATE / ROLE / TOOLS` en tabla, número enorme y bloques Brief · Role · Process · Design decisions · Visual system · Deliverables.
- **Tabla de specs** (ref-8): encabezado `--block` y filas separadas por 1px.
- **Botón primario**: relleno naranja, texto negro mono en mayúsculas, esquina inferior derecha biselada. El secundario es igual pero con contorno de 2px `--ink`.
- **Barras de datos**: barras verticales decorativas (`aria-hidden`).

## 4. Movimiento

Sutil y con propósito; todo se desactiva con `prefers-reduced-motion: reduce`.
- **Hover que invierte**: la celda pasa a relleno naranja con texto `--on-accent` (120ms).
- **Texto que se escribe**: el rol del hero se teclea una vez. El texto real queda accesible para lectores de pantalla.
- **Reveal al hacer scroll**: opacidad y 16px de desplazamiento con IntersectionObserver, una sola vez. Sin JS, todo es visible.
- **Ambiente**: la cruz del hero gira lento, el osciloscopio recorre su onda y el marquee avanza (se pausa con hover o foco).

## 5. Accesibilidad
- Contraste AA en todo el texto (ver reglas de color).
- Foco visible: contorno de 3px `--ink` con offset. En botones biselados el contorno va hacia dentro (`outline-offset: -6px`) para que el `clip-path` no lo recorte.
- Todo lo decorativo (SVG, barras, franjas, marquee duplicado) lleva `aria-hidden="true"`.
- Objetivos táctiles de al menos 44px.

## 6. Contenido
- Los case studies cuentan **proceso, decisiones de diseño y sistema visual**. No incluyen métricas, lanzamientos, "producción" ni conversión.
- No se inventan datos: lo que falta se marca con `[TODO: …]`, que se renderiza visible (`.todo`, relleno amarillo y texto negro).
- Los proyectos viven en `projects.js`: se edita un solo array.

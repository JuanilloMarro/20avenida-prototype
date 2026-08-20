# 10 — Inventario de componentes

Qué existe, qué props tiene y qué falta. Se actualiza cada vez que se añade un
componente: es lo que evita que dentro de dos meses haya tres botones.

Material: **uno**, «Velo negro» ([`01-velo-negro.md`](01-velo-negro.md)).
Ningún componente lo modifica.

---

## Existen

### `<GlassSurface>`

La única superficie de vidrio del sistema. Todo lo que flota pasa por aquí.

| prop | tipo | default | qué hace |
|---|---|---|---|
| `radius` | Number | `0` | px. 0 = el token `--lg-r` (18). **999 = píldora** |
| `tag` | String | `'div'` | la etiqueta que renderiza |

```vue
<GlassSurface :radius="999" tag="nav"> … </GlassSurface>
```

Con `999` el composable lo recorta solo a `min(w, h) / 2`: no hay que calcular
nada. Y **no hay prop de material** — si hiciera falta, el material dejaría de
ser estandarizado.

Cuatro capas: `__back` (refracción + desenfoque) · `__veil` (el velo negro) ·
`__spec` (filo especular, sigue al ratón) · `__body` (el contenido).

Lo que el componente **no** puede hacer cumplir solo:

- **Vidrio sobre vidrio, no.** Lo que va encima se resuelve con relleno sólido o
  sólo tipografía.
- **Vidrio en la capa de contenido, no.** Tarjetas de grilla, filas de tabla,
  ítems de lista: sólidos.
- **La acción principal no es de vidrio.** El contraste AA de la conversión no
  puede depender de la foto que haya detrás ese día.
- **Coste.** Cada instancia es una capa compuesta. Con nav + barra + ficha (≈9)
  va fluido; nada de vidrio en una grilla larga de producto.

### `<AppNav>`

| prop | tipo | default |
|---|---|---|
| `items` | Array | los seis de la referencia |
| `active` | String | `'home'` |
| `bag` | Number | `0` — 0 esconde el badge |

Emite `select(id)` y `open(id)` (`bag` · `wishlist` · `account`).

**Cinco piezas separadas, no una barra:** marca · píldora de enlaces · tres
botones. Cada una es su propia `GlassSurface`.

- **La marca va FUERA de la píldora**, en su propio panel circular. Dentro sería
  vidrio sobre vidrio.
- **Las cinco miden `--av-nav-h` = 46 px.** Un solo token: cambiarlo mueve las
  cinco a la vez. A 46 px los topes recortan la lente a 15.6 y la compresión a
  50.0 — la regla del material actuando, no una excepción.
- **Una píldora de 900 px** obligaría a regenerar un mapa de desplazamiento de
  900 px en cada resize. Tres piezas pequeñas son tres mapas pequeños.
- **El ítem activo es sólido**, `--av-solid-*`.

Es **`fixed`**, no `sticky`: sticky depende de que ningún ancestro tenga
`overflow`, y en una tienda ese ancestro aparece tarde o temprano. El contenido
deja libre `--av-nav-space`. El contenedor lleva `pointer-events: none` y las
piezas `auto`, para que el hueco entre ellas deje pasar el cursor.

### `<ProductShowcase>` — el frame de producto, con scrollover

Dos capas y tres filas:

```
FRAME DE ATRÁS      el texto gigante de marca, nada más
FRAME DE ENFRENTE
  fila 1   texto corto, centrado en horizontal y en vertical
  fila 2   el zapato — la secuencia
  fila 3   dos columnas: info izquierda · info derecha
```

| prop | tipo | default | qué hace |
|---|---|---|---|
| `variant` | clave de `COLORWAYS` | `'samba-green'` | el colorway, con su secuencia |
| `frame` | `'fluid'\|'fixed'` | `'fluid'` | `fixed` = 1440×1024 y un solo frame |
| `hold` | Number | `55` | vh de scroll por frame |
| `still` | Number | `0` | sólo en `fixed`: qué frame se pinta |
| `word` | String | `'ADIDAS'` | el texto gigante del fondo |
| `eyebrow` | String | nombre + línea | fila 1 |

Slots `left` y `right` para la fila 3.

**El scrollover.** Un carril alto con la pieza `sticky` dentro. Mientras el
carril cruza el viewport, la composición se queda clavada y lo único que cambia
es el frame: **no se puede llegar al contenido de abajo hasta que la secuencia
termina**. Con 6 frames y `hold` 55 el carril mide 375vh — 275 de recorrido, 55
por frame.

Está hecho con `sticky` y no interceptando la rueda a propósito: funciona igual
con rueda, trackpad, barra de scroll y teclado, y es reversible — si el usuario
sube, el zapato gira al revés sin desincronizarse. Un scroll-jack con
`preventDefault` rompe las tres cosas.

Los frames van **todos apilados** en el DOM y sólo cambia cuál es opaco. Cambiar
el `src` de un solo `<img>` parpadea la primera vez que toca cada frame porque
la decodificación no es instantánea.

**El texto del fondo llena el ancho** vía `useFitText`: con un tamaño fijo en vw
el margen dependería de cuántas letras tenga la palabra. Y va difuminado
(`--ps-word-blur`, 7px) para que el foco se lo lleve el zapato — sigue siendo
legible, es el 2% de la altura de mayúscula.

**El tamaño del zapato lo manda el ALTO**, no el ancho: `--ps-shoe-max-h` (68)
es el % del alto de pantalla que no pasa ningún frame.

Con una sola escala para los seis no se pueden elegir los dos ejes por separado,
y no es una limitación del CSS sino del zapato: la tinta del perfil mide 1055 px
de ancho y la de la cenital 1068 de alto. Casi el mismo número — un zapato visto
de lado es tan largo como visto desde arriba. **Fijar el ancho del perfil fija el
alto de la cenital**, y al revés.

A 1440×1024 sale así:

| frame | ancho | alto |
|---|---|---|
| 3/4 delantero | 40.0% | 44.2% |
| Perfil ext. / int. | 47.7% | ~29% |
| 3/4 trasero | 41.2% | 37.2% |
| Cenital / Suela | ~17% | **67.9%** |

El tope va en `vh` y no en `%`: un porcentaje se mide sobre el ancho de la fila,
así que en una pantalla baja y ancha el zapato volvería a salirse por arriba.
Comprobado a 1680×760 → 67.9% de alto igual, y a 1280×1024 → 63.8%.

Su caja puede ser más alta que su fila: las dos vistas verticales sobresalen y
pasan por detrás del texto de arriba y del bloque de info.

**Ruta `/frame`** renderiza a 1440×1024 sin barra. `?v=samba-night` cambia el
colorway, `?f=3` el frame.

### `<BrandMark>`

`props: size` (px) · `wordmark` (Boolean).

Lo que tenemos es una **foto** del rótulo, no un asset de marca. Se recorta con
`mix-blend-mode: screen` + negros aplastados. Funciona siempre porque el velo es
negro fijo: la marca está siempre sobre oscuro. **Pendiente: el vectorial**
(D-01).

### `<DevPanel>` — solo en dev

Fondo y grano. Ya no hay conmutadores de velo ni de glifo porque no hay nada que
conmutar.

---

## La secuencia del Samba

`app/assets/js/colorways.js` → `SAMBA_FRAMES`, seis frames en orden de rotación:
3/4 delantero → perfil exterior → 3/4 trasero → perfil interior → cenital →
suela. Reordenar la secuencia es reordenar ese array.

Los assets se generan con `scripts/cutout-bg.py`; ver `20-decisiones.md` para el
porqué de cada decisión del recorte.

---

## Faltan — por orden de lo que desbloquea

| Componente | Nota |
|---|---|
| `<ProductCard>` | **sólido**, capa de contenido. Nada de vidrio |
| `<SizePicker>` | el activo va sólido |
| `<MiniCart>` | cifras que se comparan y se suman |
| `<FilterPanel>` | formulario denso con estados |
| `<SearchBar>` | |
| `<DropdownMenu>` | shadcn dentro del slot |
| `<Toast>` · `<Tooltip>` | |
| `<StickyBuyBar>` | es la conversión |
| `<Gallery>` | ahí van las dos fotos `detail-*` que no entran en la secuencia |

Del showcase falta: selector de talla real (hoy los dos `select` son maquetas
sin comportamiento) y el paso a carrito.

---

## Antes de añadir uno

1. **¿Flota o es contenido?** Si hace scroll con la página, es contenido: sólido.
2. **¿Va encima de otra `GlassSurface`?** Entonces no lleva vidrio: relleno y
   tipografía.
3. **¿Aguanta la altura su lente?** Lente 26 necesita 77 px de lado corto. Por
   debajo, el material que se pinta es su versión recortada. Eso está bien; lo
   que no vale es fingir que no pasa.
4. Usa `--av-on-glass*` y `--av-solid-*`. Nada de colores literales para texto
   sobre vidrio.
5. **No toques el material.** Ni el velo, ni el blur, ni por instancia, ni por lo
   que haya debajo. Si algo no se lee, cambia el texto o el fondo.
6. Anótalo en esta tabla.

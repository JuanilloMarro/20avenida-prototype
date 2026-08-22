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
| `items` | Array | sólo lo que NAVEGA: Inicio · Tienda · Ofertas · Próximamente · Nosotros · Cuenta |
| `active` | String | `'home'` |
| `bag` | Number | `0` — 0 esconde el badge |
| `suggestions` | Array | tres literales (PLACEHOLDER) |
| `catalog` | Array | `[]` — lo que el buscador encuentra |
| `filters` | Array | el árbol: Sneakers · Ropa · Accesorios |

Emite `select(id)`, `open(id)` (`bag` · `wishlist` · `account`), `search` y
`filter({ node, path, ids, to })` — el camino entero hasta la hoja elegida y a
dónde lleva.

#### El menú de móvil — el panel del ⋯

**A pantalla completa**, la misma caja que el buscador: `inset: 0`, sangre,
`--lg-r: 0` y el mismo padding que esquiva notch y barra de gestos. Cierra con
la X de su cabecera; sin velo detrás, porque ya no hay fuera.

Dentro, dos cosas y en este orden:

1. **Lo que navega** — Inicio, Nosotros, Cuenta. Fuera del scroll y sin
   encogerse: se ven siempre.
2. **Los filtros** — el árbol, y se llevan el alto que sobra.

**Sneakers, Ropa y Accesorios son FILTROS, no destinos.** Estuvieron un rato
arriba, en `items`, como botones que abrían un desplegable de categoría propio
a pantalla completa. Fuera: no son sitios a los que se va, son por dónde se
corta el catálogo. En el árbol reemplazan a los antiguos Hombre / Mujer /
Productos — hombre y mujer no desaparecieron, **bajaron un nivel**. Llevan
icono, y sólo ellos: más abajo son marcas y cortes, y ahí un icono sería un
logo o un adorno repetido. La columna del icono se reserva en todos los
niveles, así que las etiquetas siguen alineadas.

**Y no se marcan: DIRECCIONAN.** Una hoja del árbol es el final del recorrido, y
el final del recorrido es Tienda con ese corte hecho — por eso una rama es
`<button aria-expanded>` y una hoja es `<a href="/tienda?f=…">` de verdad, que se
puede abrir en pestaña nueva y que un lector anuncia como enlace. Hubo un rato
de casillas con check y contador; ese modelo pedía un «ver resultados» al final
y dejaba al usuario eligiendo dentro de un panel en vez de dentro de la tienda.
Filtrar de verdad — varios cortes a la vez, sin salir — es cosa de Tienda.

**«Limpiar»** sale sólo cuando se ha bajado del primer nivel y devuelve el árbol
a su raíz de una vez, en lugar de cerrar rama por rama. Va del MISMO color que
el título que acompaña — están en la misma línea, y a dos tonos parecía que uno
de los dos se había apagado; lo que los separa es el peso y el subrayado.

**Los dos títulos del panel — «Menú» y «Filtros» — arrancan en la misma
vertical.** Ninguno lleva relleno lateral propio: los dos cuelgan del padding de
`__body`. Las filas sí van 13 px más adentro, y no es incoherencia — una fila
tiene fondo al pasar por encima y ese fondo necesita respirar por dentro; un
título no tiene caja.

**El recorrido.** Al desplegar una rama sus hermanas **desaparecen** y sus hijos
salen justo debajo de ella, un escalón más adentro (15 px por nivel). La rama
abierta se queda arriba, y con ella las que llevaron hasta aquí: eso es lo que
dice dónde está el usuario. Tocar una fila del recorrido la cierra y devuelve a
su nivel — la misma fila abre y cierra, así que no hay botón de volver.

No es un acordeón: nunca hay dos niveles abiertos a la vez.

#### Tipografía — las dos reglas

Valen para todo, no sólo para la barra:

- **NUNCA versales.** Primera mayúscula y el resto minúsculas, sea un título,
  una etiqueta o una fila. Ni con `text-transform` ni escritas a mano. Y con las
  versales se va el trazo ancho que las acompañaba (`.2em`, `.42em`): ese aire
  estaba para que un bloque de mayúsculas se leyera, y en minúscula lo único que
  hace es descoser la palabra.
- **Un solo cuerpo por panel** — 13.5 px en la barra y sus dos paneles. Lo que
  separa un título de una opción es el **peso**: 700 contra 500. Única excepción
  escrita: el input del buscador va a 16 px porque por debajo iOS hace zoom solo
  al enfocar, y la burbuja de un contador, que es un número y no texto.

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

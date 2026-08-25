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
| `variant` | String | `''` | una o varias variantes, separadas por espacio |

```vue
<GlassSurface :radius="999" tag="nav"> … </GlassSurface>
<GlassSurface variant="panel"> … </GlassSurface>
<GlassSurface variant="panel light"> … </GlassSurface>
```

Con `999` el composable lo recorta solo a `min(w, h) / 2`: no hay que calcular
nada.

Expone **`sync()`** por `defineExpose`: reconstruye la lente. Lo necesita quien
muestre un panel con `v-show` — nace en `display: none`, no hay nada que medir,
y ningún observador rescata ese caso de forma fiable.

#### Variantes — conjunto CERRADO

Viven en `glass.css`, junto al material, **no** en el CSS de cada componente. Es
de ahí de donde venían, y por eso llegó a haber dos paneles repitiendo a mano
los mismos tres tokens sin nada que los mantuviera sincronizados. Eso no es un
material estandarizado, es uno copiado.

| variante | qué mueve | para qué |
|---|---|---|
| `panel` | `--lg-r: 0` · `--lg-edge: 80` · `--lg-scale: 50` | superficie a pantalla completa — menú, buscador |
| `light` | velo **blanco**, brillo, especular, halo y los cuatro `--av-on-glass-*` a tinta | piezas que deben leerse como luz. **Hoy no la usa nadie**: se probó en los botones de la barra y en la ficha del buscador, y las dos veces se descartó mirándolo. Si alguna vez lleva TEXTO, súbele el velo de 0.16 a ~0.42 — a 0.16 el tono suave se queda en 3.9:1 |

Una variante **no es un material nuevo**: es el mismo Velo negro con unos pocos
tokens movidos. Lo que no se nombra, se hereda — y esa es toda la herencia que
hace falta, porque el material ya está escrito entero en custom properties.

**La regla para crear una:** existe cuando **varios** tokens tienen que moverse
juntos y quedarse sincronizados. Si sólo cambia el radio, eso es el prop
`radius` o una línea de CSS. Dos formas de hacer lo mismo es justo el desorden
que esto viene a quitar.

`light` es el ejemplo de por qué la regla importa: no basta con cambiar el velo,
porque lo que va **encima** tiene que invertirse a la vez o queda texto blanco
sobre vidrio blanco. Velo, halo del glifo y tokens de contenido se mueven en el
mismo bloque.

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

#### Qué pieza lleva qué material

Uno solo, «Velo negro», y **dos cajas** que lo piden con distinto grosor de
lente. La diferencia no la elige nadie: la impone el **tope 1** del material
(`lente ≤ 34% del lado corto`), y por eso las piezas bajas nunca llegan a los 80.

| pieza | caja | `--lg-edge` pedido | lente real | compresión real |
|---|---|---|---|---|
| píldora · botón de acción · barra de teléfono | 58 de alto | 26 (base) | **19.7** | −63.1 |
| menú y buscador | pantalla completa | 80 (`variant="panel"`) | **80** | −50 |

**Los mismos números en los tres anchos.** Un teléfono de 375 y un escritorio de
1440 abren el MISMO elemento y obtienen la misma lente: nada del material
depende de la media query, y nada debe hacerlo. Si alguna vez un panel se ve
distinto arriba y abajo, el fallo está en dónde vive su CSS, no en el material —
ver `20-decisiones.md`, 2026-08-22.

#### El panel a pantalla completa — menú y buscador

**A SANGRE** — `inset: 0`, sin bordes ni radio, y el mismo padding que esquiva
notch, barra de gestos y teclado. Cierran con la X de su cabecera; sin velo
detrás, porque no hay fuera. El CSS de los dos vive **fuera de todo `@media`**:
quien decide si se ven es `v-show`.

Con los 26 px de la base, la banda que refracta era el **19%** de una superficie
de este tamaño, recta y pegada al bisel: sólo se leía velo y desenfoque. Los 80
de la variante caben enteros aquí (el tope daría hasta 127 en un teléfono de
375), y el suavizado del mapa los funde con el centro.

**Quién los abre:** el buscador, desde la lupa — que está en las dos barras. El
menú, sólo desde el ⋯ de la barra de teléfono; en escritorio los enlaces ya se
ven enteros en la píldora, así que no hay ⋯ arriba.

> Nota histórica, porque se buscó y no estaba: este panel **nunca** tuvo
> deformación en toda su superficie. `useGlassLens.js` nació en el primer commit
> y no se ha tocado desde entonces; `--lg-edge` vale 26 px desde ese mismo
> commit; y `.av-search` nació ya con `inset: 0` y `--lg-r: 0`. Lo que se veía
> antes era la banda de 26 px del perímetro.

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

  **Sin excepciones, y se ha comprobado dos veces.** El texto gigante del fondo
  del showcase —`.ps__word`, 300 px de cuerpo, difuminado y en `aria-hidden`—
  parecía la excepción evidente y no lo es: se pinta «Adidas», tal y como llega
  en el prop. Con una didona la caja mixta gana además lo que en palo seco no
  daba: la `d` sube, la `s` se cierra, y el fondo pasa de rectángulo de letras a
  tener perfil.

  Corolario práctico: **el dato se escribe como se lee**. Ninguna pieza tiene un
  `text-transform` que lo cambie, así que el mismo nombre vale para el fondo del
  showcase, para el acordeón y para el pie.

- **Punto medio para separar, no raya.** «Samba OG · Collegiate Green». La raya
  es puntuación —abre un inciso y pide pausa— y lo que hay entre esos dos datos
  no es una frase: son dos campos del mismo rango, uno al lado del otro. El
  punto medio separa y no dice nada más.
- **Un solo cuerpo por panel** — 13.5 px en la barra y sus dos paneles. Lo que
  separa un título de una opción es el **peso**: 700 contra 500. Única excepción
  escrita: el input del buscador va a 16 px porque por debajo iOS hace zoom solo
  al enfocar, y la burbuja de un contador, que es un número y no texto.

**Piezas separadas, no una barra:** marca · **barra de búsqueda** · píldora de
enlaces · tres botones (bolsa · favoritos · cuenta). Cada una es su propia
`GlassSurface`. Marca y buscador van juntos a la izquierda; la píldora, centrada
sobre la pantalla; los botones, a la derecha.

**Buscar es un campo, no un botón** — y los resultados caen debajo con su mismo
ancho, no en una ventana. La ventana a pantalla completa se queda para el
teléfono. Misma pieza, distinta caja: la diferencia es una `@media`.

- **La marca va FUERA de la píldora, en su propio panel circular.** Dentro sería
  vidrio sobre vidrio. El círculo **recorta** el rótulo —el recorte es casi
  cuadrado y pierde las esquinas— y está aceptado: importa más que no haya
  ninguna pieza de la cabecera con material distinto. Y ya no lleva halo: dentro
  del vidrio el velo negro la despega sola, y un `filter` ahí crearía un
  backdrop root.
- **Todas miden `--av-nav-h` = 55 px.** Un solo token: cambiarlo las mueve a la
  vez, la marca incluida — `<BrandMark>` ya no lleva `size`, hereda
  `--av-mark-h`. A 55 los topes recortan la lente a 18.7 y la compresión a
  59.8 — la regla del material actuando, no una excepción. El suelo del número
  es el botón de la barra de teléfono: mide `--av-nav-h` menos 10, o sea 45, y
  por debajo de 44 deja de ser un objetivo táctil.
- **Una píldora de 900 px** obligaría a regenerar un mapa de desplazamiento de
  900 px en cada resize. Piezas pequeñas son mapas pequeños.
- **El ítem activo NO es sólido:** lleva `.av-glass-sel`, la única excepción
  escrita del material (`01-velo-negro.md` §7). El texto no cambia.
- **Cada enlace lleva su icono a 16 px**, el mismo `item.icon` que usan las filas
  del menú de teléfono. Va en un `<span class="av-glyph">` propio y nunca en el
  `<a>`: `.av-glyph` lleva `filter`, y un ancestro con `filter` es un backdrop
  root — mataría el `backdrop-filter` de la selección que tiene al lado.

**La píldora va centrada sobre la PANTALLA**, no sobre el hueco que le dejan la
marca y los botones. Va `position: absolute; left: 50%; translateX(-50%)`, fuera
del flujo. En una rejilla `auto 1fr auto` la columna de en medio arranca después
de la marca y termina antes de las acciones, así que su centro caía 96 px a la
izquierda del de la pantalla; y `1fr auto 1fr`, que sí la centraría, desborda
porque un `1fr` no baja de su contenido.

**El corte entre disposiciones está en 1279 px.** Ha subido dos veces, siempre
porque creció lo que la píldora pide: 900 (sólo texto) → 1023 (con iconos, +143
px) → 1279 (centrada de verdad). Centrada, el lado corto es el de las acciones,
y lo que le sobra al borde derecho es:

| ancho | 1024 | 1100 | 1180 | **1280** | 1366 | 1440 |
|---|---|---|---|---|---|---|
| holgura | −60 | −37 | −14 | **+15** | +43 | +68 |

Por debajo de ~1240 la píldora se metería bajo los botones, y no se arregla
apretando: quitar margen da 15 px y bajar los botones a 48 otros 28 — 43 de los
60 que faltan, rompiendo además el alto único. Lo que sí lo arreglaría es una
píldora más corta: con cuatro enlaces en vez de seis sobrarían ~115 px y el
corte podría volver a 1024. Es una decisión de contenido.

Para que quepa, tres medidas de la barra son **fluidas y atadas a los dos
extremos** (1440 → el valor aprobado, 1024 → el mínimo que cabe), en vez de a un
`vw` suelto: el `clamp` mide el ancho de la VENTANA, no el hueco que le queda a
la píldora, así que la recta se apunta a mano.

| | 1440 | 1024 |
|---|---|---|
| relleno lateral del enlace | 20 | 10 |
| hueco icono ↔ texto | 8 | 6 |
| hueco de la rejilla de la barra | 16 | 10 |
| hueco entre botones de acción | 10 | 6 |

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
  fila 3   tres huecos: info izquierda · comprar ahora · info derecha
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

| evento | payload | cuándo |
|---|---|---|
| `buy` | `{ id, size }` | «Comprar ahora», el botón del centro de la fila 3 |

`id` es el colorway; `size` llega **siempre `null`** — aquí no se elige talla, así
que el botón es la entrada a la ficha y no una compra cerrada. La firma es la
misma que la de `<ProductAccordion>` y `<ProductReel>` para que los tres puedan
colgar del mismo manejador.

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

### `<ProductReel>` — el rollo

| prop | tipo | default |
|---|---|---|
| `items` | Array | los cinco Air Jordan |
| `initial` | Number | `0` |
| `bg` | String | `'#050506'` |
| `grain` | Number | `GRAIN_DEFAULT` |

Emite `select(id)` y `change(id)`.

```
              ░░    ░░░░    ██████    ░░░░    ░░
            extremo  lado    FOCO      lado  extremo

                       Air Jordan 1
                    Yellow Ochre · Sail
                      [ Ver detalle → ]
                        ─ ── ─ ─ ─
```

**Hubo un primer piso de MARCAS y se quedó fuera.** La idea era encadenar dos
rollos —marcas → productos— y metía dos pantallas donde el usuario sólo quería
una: el rollo es un escaparate, y un escaparate no pide que elijas la marca
antes de dejarte mirar. `assets/js/brands.js` **sigue existiendo** con el mapa de
marca → productos, que es cierto y hará falta en la Tienda; simplemente ya no lo
usa esta pieza.

**Sin precio.** El rollo da ganas de abrir la ficha; el precio es información de
decisión y vive donde se decide.

**Fondo negro plano `#050506`, el mismo del panal** — la primera parada de la
rampa `negro` de marca, no un negro inventado. Tapa la rampa del escenario a
propósito: sobre negro liso lo único que se ve es la silueta del zapato y el filo
del vidrio. Y con él viene el **grano**, que no es textura decorativa sino lo que
el vidrio dobla: sobre negro plano la lente no tiene detalle que doblar y las
flechas se leerían como cristal limpio. Va en un `::before` —necesita opacidad
propia— y **debajo** de todo, porque un `backdrop-filter` sólo ve lo que se pintó
antes que él.

**Alto: `100svh`, el MISMO que el acordeón.** Las dos piezas se comen el viewport
y tienen que medir lo mismo o la página deja de avanzar de pantalla en pantalla
— verificado sobre la página real. Se probó `lvh` para tapar el hueco que `svh`
deja cuando la barra del navegador se retrae y se descartó: rompía esa igualdad.
El hueco se cubre por el otro lado, con **`--rl-suelo: 70px`** de reserva abajo
— donde se posa la barra del navegador — más `--av-nav-space` arriba. Medido: el
botón queda a 84 px del borde inferior en los dos anchos.

**El nombre cambia de sitio según el ancho:** encima del zapato en teléfono,
debajo —junto al botón— en escritorio. En 375 px el zapato ocupa casi todo y el
nombre arriba es lo primero que se lee; en escritorio el zapato es la pieza
grande y el nombre trabaja mejor de pie de foto. Marcado duplicado con una copia
en `display: none`, y el `aria-live` sólo en una: dos regiones vivas anunciarían
lo mismo dos veces.

**El botón es pequeño a propósito** (134×38 en escritorio): la atención es del
nombre y del zapato. En teléfono sube a 44 de alto, el mínimo de un objetivo
táctil.

**Regla del encuadre: un rollo, un encuadre.** Los productos de un rollo tienen
que compartir caja de recorte o el zapato pega un salto de tamaño justo en el
momento en que se está mirando. Los cinco Jordan comparten 647×636.

#### Las cinco columnas — sólo escritorio y tableta

```
│ extremo │  opción  │   FOCO   │  opción  │ extremo │
0        20        40        60        80       100vw
```

**Cinco puestos y tres planos de profundidad:** foco (escala 1), vecinos
(0.52 · blur 10 · opacidad .42) y extremos (0.30 · blur 17 · opacidad .20). Los
extremos **no se pueden tocar**: a esa escala son fondo, no opción — quien
quiera uno gira. En teléfono se apagan y quedan tres, porque a 375 px caerían
encima de las flechas.

`--rl-side-shift: 20vw` es **una columna hacia fuera**, no un número a ojo. Antes
era `33%`, y ese porcentaje se resolvía contra el ancho del propio zapato —125
px en un monitor de 1440—, así que los tres se amontonaban en el tercio central
y las dos quintas partes de los extremos quedaban vacías.

`translateX` va el primero de la cadena de transformaciones, así que el
desplazamiento se aplica en el espacio del padre y **no lo encoge el `scale`**
que viene detrás. Por eso puede ir en `vw` y significa lo que dice.

**Y los puestos NO están a distancias iguales.** Los vecinos van a una columna
del centro y los extremos a **1.55**, no a dos. Es lo que separa una fila plana
de un rollo: un carrete redondo visto de frente tiene a los de fuera girando
hacia el fondo, así que su separación aparente se encoge conforme se alejan. Es
la proyección de un cilindro, `sin θ` — con pasos de 40° sale 0 · 0.64 · 0.99,
o sea que el segundo salto es la mitad del primero.

**Lo que se mide en el zapato es la TINTA, no la caja.** El recorte tiene margen
transparente por los cuatro lados: con el ítem a 285 px la caja girada medía 351
pero la tinta sólo 250, así que el «hueco de 9 px» que decía la caja eran 95 px
de aire de verdad y el zapato estaba pequeño para nada. Subió un 25%.

Medido en tinta a 1425 de ancho: **105 px** entre foco y vecino, **74** entre
vecino y extremo — y ese 74 contra 105 es la perspectiva del rollo, no un
descuadre.

#### En teléfono

**No hay cinco columnas:** los vecinos vuelven al desplazamiento relativo al
propio ítem (`42%`), que es lo que a 375 px hace que se lean como profundidad y
no como tres fotos. Los extremos se apagan.

**El zapato va centrado en la PANTALLA, no en lo que sobra.** En flujo, el
escenario se quedaba con el hueco entre el nombre y el botón, y ese hueco no
está centrado: arriba pesan los 87 px que reserva la barra del ecommerce más los
104 del nombre, y abajo sólo los 70 del suelo más el botón — 203 contra 140, o
sea el zapato 31 px por debajo del centro. Sacándolo del flujo con
`position: absolute; inset: 0` el escenario pasa a medir la **padding box**
entera —que es contra lo que se resuelve un absoluto— así que su centro es el de
la sección. Medido: centro del zapato 406, centro del viewport 406.

**Sin flechas: el gesto es el dedo.** Un botón de 44 px sobre el zapato en una
pantalla de 375 quita más de lo que da. Lo único que hacía falta era decirlo, y
para eso está la pista —«Desliza para ver más»— encima del botón: una línea de
12 px al 60% de opacidad. Es la única excepción al cuerpo del sistema en toda la
pieza, y es a propósito: no es contenido, es una ayuda que tiene que poder
ignorarse. El teclado y el toque en un vecino siguen girando el rollo.

### `<SiteFooter>` — el pie

`props: bg` (`#050506`) · `grain` (0–100).

Cierra la página: la casa a la izquierda —letrero, una línea de qué es la tienda
y las cuatro redes— y tres columnas de enlaces (20 Avenida · Métodos de pago ·
Marcas).

**Vive en el layout, detrás de `</main>`, no en la landing.** Un `<footer>`
metido dentro de `<main>` sigue siendo HTML válido pero deja de ser el landmark
`contentinfo`, y con eso un lector de pantalla pierde el salto directo al pie. Es
además la simetría de `<AppNav>`: la barra y el pie son el marco, no el
contenido. Sustituye al banco de pruebas del scroll —el héroe con el letrero—
que estaba ahí sólo para tener altura que scrollear.

**El fondo es el negro del panal, no el del escenario.** `#050506`, la primera
parada de la rampa `negro`, y el mismo grano al 4%. Los dos plafones se tocan, y
la única forma de que se lean como un solo bloque negro de cierre es que sean el
mismo plafón; con la rampa del escenario debajo, el pie se aclara justo donde el
panal es más oscuro y el empalme se ve como una costura.

**El color del texto va escrito, no heredado.** `.is-light-bg` cambia la tinta
del escenario a `--av-ink`, y esa regla llegaría hasta aquí: sobre un plafón que
es negro siempre, dejaría el pie en negro sobre negro.

**La tercera columna sale de `brands.js`.** La referencia enseña marcas que no
están en el catálogo; escribirlas aquí sería la segunda lista de marcas de la
casa y las dos se separarían el primer día.

**El hover es amarillo, no blanco.** El enlace en reposo va al 72%; subirlo a
blanco es un salto de brillo que se lee como movimiento, no como enlace.
`--av-y-400` cambia de tono, que es lo único que no se confunde con el resto de
la columna, y es el mismo gesto del icono de red y del foco.

**Los títulos de columna no gritan.** Primera mayúscula y el resto minúsculas
aunque sean títulos y aunque la referencia los ponga en versales — la regla de
tipografía de arriba no tiene excepción aquí. Lo que separa un título de un
enlace son el peso (800 contra 400), el cuerpo y el color: tres señales, de
sobra. Las versales serían una cuarta y la única que además cuesta legibilidad.

**Los cuatro glifos de red van dibujados en el componente.** lucide 1.0 trae
`facebook` e `instagram` pero ya no trae youtube ni tiktok; importar dos y
dibujar dos deja una fila corta con dos trazos distintos. Van los cuatro en el
idioma de lucide —caja 24, trazo 2, remates redondos— y en trazo, no macizos
como la referencia: el peso visual del resto de la casa manda sobre el parecido.

**Pendiente:** ninguna de las rutas existe (`/nosotros`, `/faq`, `/marca/:id`…) y
los perfiles de red están sin verificar. Y el título «Métodos de pago» no
describe su lista —envíos, tiendas, ayuda, FAQ—: viene así de la referencia y se
reproduce tal cual, pero es una decisión de contenido pendiente.

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

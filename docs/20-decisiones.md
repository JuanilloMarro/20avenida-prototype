# 20 — Decisiones

Lo abierto, quién lo cierra, y qué bloquea. Cuando una se cierra, se mueve a
«Cerradas» con fecha y razón.

---

## Abiertas — necesitan al cliente

### D-01 · El logo vectorial
**Bloquea:** que la marca se vea bien a cualquier tamaño.
Lo que hay es una **foto** del rótulo (520×483, extraída del artefacto 02). Se
recorta con `mix-blend-mode: screen` y negros aplastados, que funciona —el velo
es negro fijo, así que la marca está siempre sobre oscuro— pero es un truco.
Con un SVG son dos rellenos y el truco desaparece.
**Pedir:** SVG del rótulo, o PNG/webp con transparencia a 2000 px.

### D-02 · La tipografía
**Bloquea:** cualquier decisión fina de layout.
`--av-font` es la pila del sistema. El titular del showcase pide algo con
carácter; los 13 px de la nav piden algo que aguante a cuerpo pequeño sobre
vidrio — probablemente no la misma.
**Pedir:** licencia o elección. Si no hay presupuesto, se elige una de Google
Fonts y se documenta.

---

## Abiertas — decisión nuestra

### D-05 · El techo de instancias por vista
Cada `<GlassSurface>` es una capa compuesta con `backdrop-filter`. En la página
de listado eso se multiplica por tarjeta.
**Falta medir** cuántas aguanta un móvil de gama media. Mitigación ya prevista:
la tarjeta de producto es **sólida**.

### D-06 · Contraste real, no estimado
Falta medir **APCA** de cada componente sobre los tres fondos y sobre el frame
de producto. Y ahora corre más prisa: el velo bajó de 0.42 a 0.35, y el velo es
justo lo que da contraste a lo que se pinta encima. Sobre el frame claro del
showcase, la píldora queda en un gris medio y el texto blanco al 72% andará por
debajo de 2.5:1. Si al medirlo molesta, **lo que se cambia es el texto o el
frame, nunca el material**.

### D-08 · Las dos fotos de detalle
`detail-1` y `detail-2` están recortadas en `public/products/samba/` pero no se
usan. No entran en la secuencia (ver abajo) — les toca una galería, que no
existe todavía.

---

## Cerradas

**2026-08-20 · La marca sale del panel de vidrio y va a la altura de la barra.**
70 px, suelta sobre el fondo, sin burbuja. Es la pieza más alta de la barra y por
eso se nota.
Eso obligó a resolver una deuda: la marca iba con `mix-blend-mode: screen` para
quitarle el negro a la foto, y eso **sólo funciona sobre fondo oscuro** — lo tenía
garantizado mientras vivía dentro de un panel con velo negro. Fuera del panel,
sobre el frame verde claro, el screen la borraba entera.
La salida no fue otro truco sino recortar el fondo de verdad:
`scripts/cutout-bg.py --dark`, que inunda desde los bordes sobre lo oscuro. En
esa foto el histograma está partido en dos (mediana del máximo de canal en 33,
tercer cuartil en 253, borde por debajo de 59), así que la separación es limpia y
las contraformas de las letras se conservan. Queda `letrero-20av-cut.webp`, con
alfa de verdad, y un halo tipo glifo para que el «20» blanco se despegue también
de un fondo claro. **Un truco menos y un asset menos dependiente del contexto.**

**2026-08-20 · La selección vuelve al blanco; el amarillo se queda sólo en la
burbuja.** Se probó `.av-glass-sel` con `#FFD600` al 24 % y no funcionó: el tinte
convierte la selección en un elemento de color más en una barra que no tiene
ninguno, y compite con la burbuja del contador, que es el único sitio donde ese
amarillo sí trabaja como acento. La selección vuelve a blanco al 10 % — ahí no
es un color, es luz: el mismo vidrio un poco más encendido.
La burbuja (`.av-glass-bubble`) se queda en `#FFD600` al 78 %, que es donde
estaba, pero ahora es vidrio y no relleno.
De paso salió un bug real: `.av-glyph` lleva `filter`, y un ancestro con `filter`
crea un **backdrop root**, así que el `backdrop-filter` de la burbuja y el de la
selección se quedaban sin nada que refractar. La clase se movió a un `<span>`
alrededor del icono.

**2026-08-20 · Móvil: la marca entra en la píldora y las acciones bajan a un dock.**
Por debajo de 900 px la barra superior se queda con una sola pieza —la píldora
centrada, con la marca dentro— y bolsa, favoritos y cuenta se van a un dock
inferior centrado, en un único panel, con la misma selección amarilla.
Resuelto en **CSS con el marcado duplicado**, no con `matchMedia` + `v-if`: el
servidor no sabe el ancho, así que con JS renderizaría una disposición y el
navegador tendría que corregirla al hidratar. La copia oculta sale del árbol de
accesibilidad, así que tampoco hay botones repetidos para un lector.
Los seis enlaces no caben en 375 px: la píldora se desplaza en horizontal por
dentro (542 px de contenido en 343), sin barra a la vista.

**2026-08-20 · La barra sube a 70 px.**
Y con ella las cinco piezas, que comparten `--av-nav-h`. Efecto secundario
bueno: a 70 px los topes de seguridad casi no muerden — lente 26 → 23.8 y
compresión 82 → 76.2, o sea el **92 % del material real**. A 46 px se quedaba en
el 60 %.

**2026-08-20 · El texto de la fila 1 sube a 14 px** (era 11 y no se leía).

**2026-08-20 · El tamaño del zapato lo acota el ALTO, no el ancho.**
Se pasó por 50 % y por 45 % de ancho del frame 01 y en las dos las vistas
verticales quedaban demasiado altas (85.5 % y 76.8 %). El criterio bueno era
otro: **ningún frame pasa de `--ps-shoe-max-h` = 68 % del alto de pantalla.**

No se pueden elegir los dos ejes por separado, y no es cosa del CSS: la tinta del
perfil mide 1055 px de ancho y la de la cenital 1068 de alto. Casi el mismo
número, porque un zapato visto de lado es tan largo como visto desde arriba. Con
una escala común, fijar uno fija el otro. Elegido el alto, el ancho cae donde
cae: 47.7 % los perfiles, 40 % el 3/4 delantero.

El tope va en **`vh`, no en `%`** — un porcentaje se mide sobre el ancho de la
fila, así que en una pantalla baja y ancha el zapato se volvería a salir por
arriba. Verificado: 1440×1024 → 67.9 %, 1680×760 → 67.9 %, 1280×1024 → 63.8 %.
La caja del zapato es a propósito **más alta que su fila**: antes el zapato
estaba limitado por el alto de la fila y no pasaba del 44 %. Lo que sobresale
son sólo las dos vistas verticales, y pasan por **detrás** del texto de arriba y
del bloque de info, que llevan `z-index` por encima.

**2026-08-20 · El texto del fondo va difuminado** (`blur(7px)` sobre un cuerpo
de ~344 px, o sea el 2 % de la altura de mayúscula). Mantiene las contraformas,
así que se sigue leyendo, y el foco se lo lleva el zapato. Lo que lo convertiría
en mancha sería bajarle el contraste o cerrar las contraformas; ninguna de las
dos se hace. Ajustable con `--ps-word-blur`.

**2026-08-19 · Velo `0.42` → `0.35`, cobertura 100%.**
Deja pasar más de lo que hay detrás. La contrapartida es directa y va a D-06: el
velo es lo que da contraste a lo que se pinta encima, así que a 0.35 el texto
sobre vidrio pierde algo. Sobre el fondo `negro` no se nota; sobre el frame
claro del showcase es donde hay que mirarlo cuando se mida.

**2026-08-19 · El item activo de la barra ya no es un relleno sólido.**
Lleva `.av-glass-sel`: vidrio también, más claro que el velo. Y el texto del
activo **no cambia en nada** — mismo color (72%) y mismo grosor (500) que sus
vecinos. Lo que marca la selección es el panel y sólo el panel: subir el texto a
blanco puro lo saca de la fila y vuelve a leerse como un botón pegado encima, que
era justo el problema del relleno sólido.
Es **la única excepción** a «nada de vidrio sobre vidrio», está documentada como
tal en `01-velo-negro.md` §7, y no lleva lente propia — a 30 px de alto los topes
la dejarían en nada.

**2026-08-19 · EL MATERIAL · «Velo negro», uno y para todo.**
Preset cerrado: radio 18, lente 26, compresión 82, aberración 0, blur 3, sat
1.12, brillo 0.85, velo `#0E0E0F` al 35% con cobertura 100% (ajustado el 20-08,
salió a 0.42), specular 0.85,
elevación 0.80, glifo blanco fijo al 72% (activo 100%), luz que sigue al ratón
**por elemento, desde su propio centro**.
Vive en `app/assets/css/glass.css` y la lente lee de ahí con `getComputedStyle`:
lo que se ve en devtools es la fuente de verdad, sin objeto de JS paralelo.
Especificación completa en [`01-velo-negro.md`](01-velo-negro.md).

**Esto cerró de golpe cuatro cosas que estaban abiertas:**
- Los cinco materiales (`nav` · `clear` · `regular` · `dock` · `sheet`) →
  **uno**. El mapa del documento 03 pasa a histórico. D-04 muere con él.
- El velo adaptativo → **negro fijo**. No cambia con el fondo del escenario ni
  con la sección que pase por debajo.
- El glifo adaptativo y su canvas de muestreo de luminancia → **blanco fijo al
  72%**. `useAdaptiveInk` y la directiva `v-ink` borrados.
- El ángulo de luz global → **por elemento**. Dos piezas en sitios distintos de
  la pantalla reciben la luz desde ángulos distintos, que es lo que la hace leer
  como cristal físico.

**2026-08-19 · D-00 · La foto del Samba, resuelta.** Llegaron ocho vistas en
`resources/`. Procesadas con `scripts/cutout-bg.py`. Tres decisiones del recorte,
todas medidas y no opinadas:

- **Inundación desde los bordes, no umbral global.** Un umbral se come las tres
  bandas del Samba, que son casi blancas. La inundación sólo alcanza lo
  conectado con el borde de la imagen.
- **La sombra de estudio NO se quita con la tolerancia.** Se intentó y se
  descartó con números: el borde de la sombra y el talón blanco del zapato valen
  prácticamente lo mismo, así que toda tolerancia que atraviesa la sombra entra
  también por el talón. A 78 ya le come el borde al talón del frame 03; a 90 se
  lo lleva entero. La tolerancia se quedó en **44**, que es lo justo para el
  fondo.
- **La sombra se quita por GEOMETRÍA.** Por color es imposible, medido: el talón
  blanco tiene saturación 7.5 y las bandas 5.7–6.4; la sombra, 1.0–5.6. Se
  solapan. Y por claridad tampoco — el talón está en min 215 y hay sombra en 200.
  Lo que sí los separa es que el talón y las bandas están **metidos** en el
  zapato y la sombra **sobresale** al fondo. Así que de cada mancha ambigua se
  mide qué porcentaje de su contorno da al fondo: lo que hay que conservar llega
  como mucho a 0.32 y lo que hay que tirar empieza en 0.49. El umbral, 0.35.
- **El núcleo se define por color o por MUCHA oscuridad (min < 125).** A 185 la
  sombra entraba entera en el núcleo, pegada a la suela y ya inseparable — las
  sombras también son oscuras y acromáticas.
- **La sombra la pone el CSS**, con dos `drop-shadow` (una corta y densa, otra
  larga y difusa). Una sola sombra media es lo que se lee como mancha gris. La
  del estudio, compuesta sobre un fondo de color, además *aclararía*.
- **Encuadre común.** Recortar cada frame a su contenido normalizaría cada
  zapato a su caja y el tamaño saltaría entre frames. Caja unión: **1103×1116**
  para los seis. Eso es lo que hace que se lea como giro.

**2026-08-19 · La secuencia son SEIS frames, no ocho.**
3/4 delantero → perfil exterior → 3/4 trasero → perfil interior → cenital →
suela. Las dos `detail-view` quedan fuera **por medida, no por gusto**: son
macros que sangran hasta el borde (su caja de contenido es la imagen entera),
así que el encuadre común pasaría a ser el frame completo y encogería los otros
seis. Van a una galería futura (D-08).

**2026-08-19 · El scrollover bloquea, y con `sticky`.**
Carril alto + pieza `sticky`: no se llega al contenido de abajo hasta que la
secuencia acaba. Hecho así y no interceptando la rueda con `preventDefault`
porque el `sticky` funciona igual con rueda, trackpad, barra y teclado, y es
reversible — si el usuario sube, el zapato gira al revés sin desincronizarse.

**2026-08-19 · `overflow-x: clip`, nunca `hidden`.**
`hidden` implica `overflow-y: auto` y convierte al escenario en contenedor de
scroll; cualquier `sticky` de dentro se pega a *ese* elemento, que no scrollea,
y deja de pegarse. Rompía el scrollover entero.

**2026-08-19 · El texto del fondo se ajusta al ancho.**
`useFitText` mide y reescala. Con un tamaño fijo en vw el margen a los lados
dependía de cuántas letras tuviera la palabra.

**2026-08-19 · D-03 · La barra mide 46 px, y con ella todo lo demás.**
La proporción de la referencia: la píldora ciñe la tipografía de 13 px en vez de
flotar alrededor. Consecuencia asumida: los topes recortan la lente de 26 → 15.6
y la compresión de 82 → 50.0. No es el material cambiando, es su propia regla.

**2026-08-19 · La marca sale de la píldora de la nav.**
Panel circular propio a la izquierda. Dentro era vidrio sobre vidrio.

**2026-08-19 · Una sola altura para toda la barra.** `--av-nav-h`.

**2026-08-19 · La barra es `fixed`, no estática.**

**2026-08-19 · Fondo por defecto → `negro`**, con las paradas del artefacto
(`#050506 → #32323A` a 157°), no las de la tabla del documento 02, que estaban
desactualizadas.

**2026-08-19 · REVERTIDO · el material no se ajusta por sección.**
Hubo un rato en que la barra invertía velo y texto al cruzar el showcase claro
(`data-surface` + `useNavSurface` + un prop `veil`). Fuera. El liquid es uno y
estandarizado, y esa es justamente la propiedad que lo convierte en sistema.

**2026-08-22 · El menú del ⋯ pasa a PANTALLA COMPLETA.**
Colgaba de la esquina superior derecha, ceñido a su ítem más largo, con suelo de
244 px. Cayó por el ancho: el recorrido de filtros mete sangría en cada nivel y
«New Balance» dentro de Sneakers › Hombre ya no cabía en una línea. Ahora es la
misma caja que el buscador — `inset: 0`, sangre, `--lg-r: 0` — y con ella se van
el velo de fuera (ya no hay fuera) y el `height: calc(100dvh - ...)` que estaba
para estirar un panel que no llegaba al suelo.

**2026-08-22 · Sneakers, Ropa y Accesorios son filtros, no destinos.**
Estuvieron un rato en `items`, como botones que abrían un desplegable de
categoría a pantalla completa (`megaMenu`, `<div class="av-mega">`). Fuera los
tres del menú de navegación y fuera el panel entero: son la RAÍZ del árbol de
`filters`, donde reemplazan a Hombre / Mujer / Productos. Hombre y mujer no
desaparecen — bajan un nivel, que es donde estaban en realidad: no son la
primera pregunta que se le hace al catálogo, son cómo se corta cada categoría.

**2026-08-22 · El recorrido de filtros se despliega DEBAJO, no reemplaza.**
Antes la rama abierta se llevaba la lista entera y dejaba un título con un
botón de volver. Ahora la rama abierta se queda en su sitio, sus hermanas
desaparecen y sus hijos salen justo debajo, 15 px más adentro. El camino
completo queda a la vista, fila a fila, y tocar cualquiera de esas filas la
cierra y devuelve a su nivel — así que el botón de volver sobra: decía que se
podía salir, pero no a dónde. Sigue sin ser un acordeón: un solo camino abierto.

**2026-08-22 · REGLA · nunca versales.**
Primera mayúscula y el resto minúsculas, sea un título, una etiqueta o una fila.
Se fue `text-transform: uppercase` de los siete sitios que lo tenían — los dos
títulos de sección de la barra, el eyebrow y las tres etiquetas del showcase, el
kicker de la landing y el del panel de desarrollo — y con él el trazo ancho que
lo acompañaba. `.42em` separaba mayúsculas; en minúscula descose la palabra.
El texto gigante del showcase pasa de `ADIDAS` a `Adidas` por la misma regla.

**2026-08-22 · REGLA · un solo cuerpo, y el peso hace de jerarquía.**
13.5 px en la barra y en sus dos paneles, títulos incluidos. Lo que separa un
título de una opción es 700 contra 500. La tarjeta de resultado tenía cuatro
cuerpos distintos — 10.5, 12.5, 14 y 14.5 — y ahora tiene uno. Excepciones, y
están escritas: el input del buscador a 16 (por debajo iOS hace zoom solo al
enfocar) y las burbujas de contador, que son un número dentro de una píldora y
no texto.

**2026-08-22 · Los filtros del menú direccionan, no se marcan.**
Una hoja del árbol era una casilla con check y burbuja de contador. Fuera las
tres cosas: la hoja es el final del recorrido, y el final del recorrido es
Tienda con ese corte hecho — `<a href="/tienda?f=…">`, cierra el menú y emite el
camino entero. Marcar dentro del panel pedía un «ver resultados» que nadie
había pedido y dejaba al usuario eligiendo en un menú en vez de en la tienda.
Filtrar de verdad — varios cortes a la vez, sin salir — es cosa de Tienda, y
está por ver.

**2026-08-22 · «Limpiar» devuelve el árbol a su raíz.**
Ya no hay aplicados que borrar; lo único que ensucia el panel es haber bajado.
Sale sólo cuando se ha bajado, y va del mismo color que el título al que
acompaña — en la misma línea, a dos tonos, uno de los dos parecía apagado.

**2026-08-22 · Icono sólo en la raíz del árbol de filtros.**
Sneakers, Ropa y Accesorios lo llevan. Más abajo son marcas y cortes: un icono
ahí sería un logo, que no toca, o decoración repetida. La columna se reserva en
todos los niveles y las etiquetas siguen alineadas.

**2026-08-22 · Los dos títulos del menú arrancan en la misma vertical.**
«Filtros» tenía 10 px de relleno lateral que «Menú» no tenía. Fuera: los dos
cuelgan del padding de `__body`. Las filas sí van 13 px más adentro, porque una
fila tiene fondo al pasar por encima y un título no tiene caja.

**2026-08-22 · REVERTIDO · los paneles vuelven a ir a sangre.**
Hubo un rato en que flotaban con margen y radio del sistema, para devolverles el
filo curvo por donde la lente pudiera doblar. Se descartó: los paneles tienen que
abarcar la pantalla entera, sin bordes. La deformación se resuelve por otro
lado — ver la entrada de abajo.

**2026-08-22 · `--lg-edge: 132` en los dos paneles a pantalla completa.**
Única desviación del preset, escrita en el CSS y aquí. Con los 26 px oficiales
el mapa sólo refractaba el **19%** de la superficie — una franja recta pegada al
bisel — contra el 72% de la barra y el 90% de un botón; se leía como pura
transparencia, que es lo que se reportó dos veces. 132 pide la lente más ancha
que el material permite y el tope 1 la recorta a `34% del lado corto` (127.5 en
un 375): cubre el **78%**, y con el suavizado del mapa a 89 px la deformación
recorre el panel entero en vez de morir en el filo. El tope NO se toca — está
para que ninguna pieza se deforme entera. La compresión tampoco: sigue en 82.

**2026-08-22 · El panel de búsqueda nunca tuvo deformación de superficie.**
Se buscó en el historial porque se recordaba haberla visto. No existe tal commit:
`useGlassLens.js` nació en `1a78cf3` (el primero) y no se ha modificado nunca,
`--lg-edge` vale 26 px desde ese mismo commit, y `.av-search` nació en `d2e8a40`
ya con `inset: 0` y `--lg-r: 0`. Lo que se veía era la banda de 26 px del
perímetro. Queda escrito para no volver a buscarlo.

**2026-08-22 · La lente no se enchufa hasta haber medido.**
`--lg-lens` y `is-lensed` sólo se ponen con el `<filter>` ya lleno. Un filter
vacío referenciado desde `backdrop-filter` deja el backdrop transparente y tira
la cadena entera — adiós lente, desenfoque, saturación y brillo. Y tres
observadores en vez de uno: `ResizeObserver`, `IntersectionObserver` y
`MutationObserver`. El tercero porque los dos primeros entregan dentro del ciclo
de render, y con la pestaña en segundo plano ese ciclo no corre — un panel de
`v-show` se quedaba sin lente hasta que se pintara.

**2026-08-22 · `min-width: 0` en el cuerpo del panel.**
El panel es un flex en fila y su cuerpo es el ítem: con el `auto` por defecto no
podía encoger por debajo de su contenido más ancho. A sangre (375) sobraba
sitio y no se veía; al flotar (343) el cuerpo se quedaba en 370 y las tarjetas
de resultado salían por el filo derecho. Es el mismo motivo que el `min-height`
que ya estaba, en el otro eje.

**2026-08-22 · La lente del buscador no existía hasta que redimensionabas.**
El síntoma que se reportó tres veces — «parece sólo transparencia» — no era de
calibración: la lente **no se estaba aplicando**. Se resolvió comparando dos
capturas del mismo panel: en una el texto del fondo salía deformado («Samba OG»
se leía «wa the OG») y en la otra nítido. La pista fue que medían **351 y 383 px
de ancho**: entre las dos hubo un resize, y el resize despertaba al
`ResizeObserver` que construye el filtro.

Causa: `.av-search` vive con `v-show`, o sea que nace en `display: none`, y ahí
`offsetWidth` es 0 — el filtro no se llega a construir. Ninguno de los tres
observadores lo rescata de forma fiable: el de tamaño y el de intersección
entregan dentro del ciclo de render, y el de mutaciones depende de que el
`style` cambie de una forma concreta.

Arreglo: `<GlassSurface>` **expone `sync()`** y `openSearch()` lo llama en el
`nextTick` de mostrarse. Quien abre el panel es el único que sabe con certeza
cuándo hay algo que medir. Los observadores se quedan para el resto de casos.

**2026-08-22 · `--lg-scale: 90` en los dos paneles, y la lección que deja.**
`feDisplacementMap` mueve como mucho `scale / 2` píxeles: 45 px, apenas por
encima de los 41 del preset oficial.

El recorrido fue 82 → 240 → 180 → 90, y todo el tramo de subida se hizo a ciegas
persiguiendo el síntoma equivocado. **La compresión nunca fue el problema.** En
cuanto la lente se construyó de verdad (ver la entrada anterior), la
deformación se vio igual de bien a 90 que a 240 — y se habría visto a 82. Regla
para quien venga detrás: **si no se ve deformación, la lente no se está
aplicando; no es que doble poco.** El sitio donde mirar es si el `<filter>`
existe y tiene primitivas dentro, no este número.

La desviación que sí hace falta es `--lg-edge`, por el tamaño del panel. La
barra y los botones no se tocan: siguen en los 26 y 82 oficiales.

**2026-08-22 · El mapa de la lente deformaba sólo por un lado.**
Bug desde el primer commit, invisible hasta que la lente se ensanchó. El
`feGaussianBlur` del mapa difumina hacia fuera, y fuera es negro transparente
(`0`), no gris neutro (`128`). El borde izquierdo ya valía 0 y no cambiaba; el
derecho valía 255 y se arrastraba hacia 0. Medido: **45 px de deformación a la
izquierda contra 0.2 a la derecha.** Arreglo: `feFlood` + `feComposite over`
antes del `feDisplacementMap`. Verificado sobre el mapa rasterizado — izquierda
+44.6, derecha −44.6, arriba +44.6, abajo −44.6, centro −0.2.

**2026-08-22 · `--lg-edge: 56` — la lente ancha causaba zoom, no deformación.**
A 132 el desenfoque del mapa (89, alcance 268) se comía el núcleo neutro del
panel (60 libres). La rampa dejaba de ser un efecto de borde y recorría toda la
superficie: el fondo se muestreaba de 45 a 330 px sobre 375 de ancho, o sea un
**zoom de 1.32×**. Se leía como fondo ampliado, no deformado. 56 es el grosor
mayor que deja el núcleo intacto en un 375 (alcance 118 contra 132 libres):
centro a escala 1:1, deformación concentrada en el filo, 40% de la superficie.
La cuenta queda en la tabla de 01-velo-negro.md.

**2026-08-22 · El menú y el buscador comparten la MISMA configuración de vidrio.**
Se compararon los once parámetros del material en los dos paneles y el único
campo que difiere es el id del filtro, que es por instancia y tiene que ser
distinto. Además el menú recibe ahora la misma llamada explícita a
`glass.sync()` al abrirse que el buscador. No la necesita — se monta con `v-if`,
ya visible, y se sincroniza solo — pero la lleva a propósito: en cuanto uno de
los dos se abre por un camino distinto, el material empieza a divergir.

**2026-08-22 · REVERTIDO · aligerar el velo en los paneles.**
Se bajó el velo de 0.35 a 0.12 y el brillo de 0.85 a 0.95 en los dos paneles,
buscando parecerse a la referencia de Apple — donde el vidrio está casi limpio
y la barra azul se lee entera a través del centro. Fuera en el acto: **el velo
no está para dejar ver el fondo, está para que se lean las OPCIONES que van
encima.** Con 0.12 el menú dejaba de leerse.

Queda la regla: de la referencia de Apple se copia **la deformación del filo y
nada más**. El centro limpio de esa imagen es un lente flotando sobre contenido;
esto es un panel de navegación a pantalla completa, y lo que va encima manda
sobre lo que se ve detrás.

**2026-08-22 · El material se hace POLIMÓRFICO, con variantes cerradas.**
Hasta hoy no había variantes por principio — la nota decía que un prop de velo
o de polaridad rompería la estandarización. Sigue siendo verdad de un prop
LIBRE, pero lo que apareció en su lugar fue peor: `.av-menu` y `.av-search`
repitiendo a mano `--lg-r`, `--lg-edge` y `--lg-scale` en su CSS scoped, con la
única garantía de que alguien se acordara de tocar los dos a la vez.

Ahora hay un conjunto **cerrado** en `glass.css` y un prop `variant` validado
contra él: `panel` y `light`. Regla para añadir: sólo si VARIOS tokens tienen
que moverse juntos. Un token suelto es el prop `radius` o una línea de CSS —
dos formas de hacer lo mismo es el desorden que esto viene a quitar.

Consecuencia técnica: `.av-glyph` deja de pintar `#FFFFFF` fijo y pasa a
`var(--av-on-glass-strong)`, y su halo a `--lg-halo` / `--lg-glow`. Sin eso una
variante de velo claro dejaba glifos blancos sobre vidrio blanco. Verificado:
con `light` el glifo pasa de `rgb(255,255,255)` a `rgb(14,14,15)` y el halo se
invierte.

**2026-08-22 · Los botones de la barra llevan velo BLANCO (`variant="light"`).**
La barra de móvil y los tres botones sueltos de escritorio — son los mismos
botones, así que el mismo velo. Son la pieza con la que se interactúa y `light`
los pone del lado de la luz en vez del de la sombra. Verificado: velo
`255,255,255 @ 0.16`, glifos a `rgb(14,14,15)`, halo invertido a blanco, y la
lente sigue viva. La burbuja amarilla del contador no se toca — ya iba con
tinta encima.

**2026-08-22 · Por qué el menú parece no tener liquid, y no es que no lo tenga.**
Se comparó con el buscador hasta el fondo: mismas clases (`av-glass--panel`),
mismos tokens, mismas tres capas con la misma caja y la misma `backdrop-filter`,
mismo padre, cadena de ancestros idéntica y lo mismo pintado por encima. La
única diferencia es el `z-index` y el id del filtro, que tiene que ser distinto.

Lo que SÍ difiere es cuánto tapa el contenido el anillo que deforma. Medido, con
un anillo de 56 px:

| panel | piezas con tinta | pisando el anillo |
|---|---|---|
| menú | 11 | **11 (100%)** |
| buscador · sugerencias | 4 | 4 (100%) |
| buscador · resultados | 12 | 4 (**33%**) |

Las filas del menú ocupan el ancho completo, así que el icono de cada una cae en
la banda izquierda y su chevron en la derecha. El anillo está ahí y deforma,
pero va lleno de contenido. En el buscador con resultados las tarjetas son
sólidas y viven en el núcleo, que deja el anillo despejado.

Si alguna vez hace falta que el menú lea como el buscador, la palanca es el
relleno lateral de `.av-menu__body` (hoy 16, el anillo 56), no el material.

**2026-08-22 · El coeficiente de desenfoque del mapa era lo que mataba la lente.**
`soft = edge × 0.70`, fijo en el composable desde el primer commit. El
desenfoque promedia la rampa con el gris neutro de los dos lados, así que los
valores fuertes no sobreviven: **con lente de 56 el mapa crudo prometía 45 px de
desplazamiento y el mapa ya desenfocado entregaba 21.** Durante días se midió el
mapa CRUDO y se reportó una deformación que no existía.

Ahora es un token, `--lg-soft`, y vale 0.30. Barrido medido sobre el mapa
rasterizado y desenfocado de verdad, en un panel de 375×812:

| lente | coef | desplazamiento real |
|---|---|---|
| 56 | 0.70 | 29 px |
| 56 | 0.45 | 41 px |
| 80 | 0.70 | 27 px |
| **80** | **0.30** | **47 px** |
| 127 | 0.70 | 22 px |

**2026-08-22 · La variante `panel` queda en `edge 80 · scale 80 · soft 0.30`.**
Pasó por `scale 145`, que daba 54 px y **plegaba** la imagen sobre sí misma en
un 11.5% del ancho — un lente real hace eso en su bisel, pero leía como exceso.
A 80 el desplazamiento baja a 30 px y el pliegue desaparece del todo. Sin
pliegue mientras se quede por debajo de 126.

**2026-08-22 · REVERTIDO · `variant="light"` en la barra.**
Se probó y se descartó: la barra dejaba de leerse como parte del sistema. Vuelve
al velo negro. La variante se queda en `glass.css` para cuando haya botones que
sí la quieran.

**2026-08-22 · El menú pasa a `v-show`, y era eso lo que le faltaba.**
Se reportó cinco veces que el menú no tenía deformación cuando los demás sí.
Todas las mediciones decían que su material era idéntico al del buscador — y lo
era. La única diferencia estructural que quedaba era `v-if` contra `v-show`: con
`v-if` el panel se monta y se destruye en cada apertura, así que su `<filter>`
se crea y se borra cada vez y el navegador no llega a resolver la referencia del
`backdrop-filter` contra un nodo recién aparecido. Con `v-show` el filtro se
construye una vez y se queda, igual que en el buscador.

Cuesta una instancia de vidrio de más en el árbol mientras el menú está
cerrado. Es el mismo coste que ya pagaba el buscador, y oculta no compone nada.

**2026-08-22 · El velo sube de 0.35 a 0.45.**
Con 0.35 y el brillo en 0.85 pasaba el 55% del fondo y las superficies leían
claras. A 0.45 pasa el 47%. Vale para todo el material, no sólo para los
paneles: el velo no está para dejar ver el fondo, está para que se lea lo que va
encima — la misma razón por la que se revirtió el intento de bajarlo a 0.12.

**2026-08-22 · `--lg-scale` de la variante `panel`: 145 → 80 → 50.**
Las tres bajadas se pidieron mirando el resultado, no calculando. Donde quedó:

| scale | desplazamiento | pliegue |
|---|---|---|
| 145 | 54 px | 11.5% |
| 80 | 30 px | 0% |
| **50** | **19 px** | **0%** |

En estos paneles la deformación es un acento del filo, no el tema: el centro
tiene que quedar limpio y el fondo reconocible. El pliegue aparece por encima de
126, muy lejos, así que hay sitio de sobra para volver a subir.

**2026-08-22 · El material `panel` deja de ser exclusivo del teléfono.**
El CSS de `.av-menu` vivía DENTRO de `@media (max-width: 900px)`, así que la
variante `panel` —la de la lente de 80 px sin recortar— sólo existía por debajo
de ese ancho. Escritorio y tableta se quedaban con las píldoras de la barra,
donde el **tope 1** (`lente ≤ 34% del lado corto`) recorta 26 px a **19.7** sobre
una pieza de 58 de alto. No era una diferencia de tamaño: era otro material.

| pieza | alto | `--lg-edge` pedido | lente real | compresión real |
|---|---|---|---|---|
| píldora / botón / barra | 58 | 26 | **19.7** | −63.1 |
| panel (menú, buscador) | 812–910 | 80 | **80** | −50 |

Dos cambios, y ninguno toca el material:

1. `.av-menu` sale del `@media`. Es la misma pieza en los tres anchos y quien
   decide si se ve es `v-show`, igual que en el buscador.
2. La barra de escritorio gana el icono de **Buscar**. Era el eslabón que
   faltaba: el panel ya funcionaba a cualquier ancho, pero por encima de 900 px
   no había ningún botón que lo abriera.

El **⋯ NO** se añade a escritorio: el menú de tres puntos es una pieza de
teléfono. Arriba los enlaces se ven enteros en la píldora del centro, así que un
botón que los volviera a esconder sobraría. El menú sigue existiendo sólo en la
barra de teléfono.

Y `.av-nav` gana `.is-away`, la misma regla que ya tenía `.av-bar`: con un panel
abierto la barra se esconde con `visibility`. Además del motivo de siempre —no
queda nada más que tocar— hay uno del material: el panel es `backdrop-filter`
sobre todo lo que tiene debajo, así que una barra que siguiera ahí se vería
refractada DENTRO del panel, que es vidrio detrás de vidrio.

**2026-08-22 · El relleno de `.av-nav__link` pasa a `clamp(12px, 1.4vw, 20px)`.**
Con cuatro iconos en vez de tres, la barra de acciones creció 68 px y el punto
en que la píldora dejaba de caber subió de ~924 a ~992 — justo dentro de la
banda de tableta, donde se recortaba «Cuenta». Los enlaces son `nowrap` y la
píldora vive en una columna `minmax(0, 1fr)`: al no caber no se encogen, se
salen. A 1440 —el ancho de referencia— `1.4vw` da 20.2 y el tope de 20 manda, así
que ahí no cambia nada.

**2026-08-22 · Iconos en la píldora de escritorio, y el corte sube a 1023.**
Los enlaces de la barra de arriba llevan ahora el mismo `item.icon` que las
filas del menú de teléfono, a 16 px — menos que los 21 de un botón de acción,
donde el icono ES el botón; aquí acompaña a una letra de 13.5 y tiene que pesar
menos que ella.

El icono cuesta 143 px de píldora (579 → 722 a 1440). Eso saca la disposición de
escritorio de la banda 900–1023, donde ya no cabe: el mínimo de la píldora con
iconos es 591 px y a 920 sólo quedan 498 libres. El corte pasa de 900 a **1023**,
elegido para que la tableta en horizontal (1024) entre en escritorio con margen
y no justo en el filo. Por debajo queda la barra de teléfono, que es una
disposición completa y aprobada, no un escritorio recortado.

El coste, escrito para que se vea: la banda 768–1023 —tableta en vertical—
ahora enseña la barra de teléfono, una píldora de 320 px en medio de la
pantalla. Si eso molesta, lo que hay que mover no es el corte sino la píldora:
con seis etiquetas no hay más sitio del que hay.

Para que quepa en 1024 hay cuatro medidas fluidas, y todas **atadas a los dos
extremos** en vez de a un `vw` suelto — 1440 da el valor aprobado, 1024 el
mínimo que cabe:

| | 1440 | 1024 | expresión |
|---|---|---|---|
| relleno lateral del enlace | 20 | 10 | `clamp(10px, 2.4vw - 14.6px, 20px)` |
| hueco icono ↔ texto | 8 | 6 | `clamp(6px, 1.2vw - 7.3px, 8px)` |
| rejilla de la barra | 16 | 10 | `clamp(10px, 1.44vw - 4.8px, 16px)` |
| entre botones de acción | 10 | 6 | `clamp(6px, .96vw - 3.9px, 10px)` |

Un `1.4vw` limpio no vale: el `clamp` mide el ancho de la VENTANA, no el hueco
que le queda a la píldora. A 1024 daba 14.3 px de relleno y la píldora se pasaba
27 — recortando «Cuenta», porque los enlaces son `nowrap` y la píldora vive en
una columna `minmax(0, 1fr)`, así que al no caber no se encogen: se salen.

Medido, sin recorte en ningún ancho: 1024 → 29 px libres · 1100 → 75 · 1280 →
179 · 1440 → 284.

**2026-08-22 · Los paneles van a sangre DE VERDAD: fuera marco y fuera hueco.**
Se veía «un leve borde» alrededor del menú y del buscador. Eran tres cosas, y
ninguna era un `border`:

1. La **elevación** de `.av-glass` — una sombra pensada para despegar la pieza
   de lo que tiene al lado. Un panel que se come la pantalla no tiene lado.
2. El **filo especular**: `.av-glass__spec` pinta sombras internas en los cuatro
   cantos y su `::after` un anillo de 1.4 px pegado al perímetro. Con una
   esquina que doblar eso es el brillo del bisel; sin ella, es el marco de una
   ventana.
3. Un **hueco real de 15 px a la derecha** en escritorio: `inset: 0` mide contra
   el bloque contenedor inicial, que no incluye la barra de scroll de la página,
   así que asomaba una franja del fondo.

Los dos primeros se apagan en la VARIANTE `panel`, no en cada componente: son
consecuencia del tamaño de la pieza, no una decisión de dos paneles sueltos. El
tercero se arregla con `width: 100vw`, que sí incluye la barra — y no provoca
scroll horizontal porque un `fixed` no cuenta para el desbordamiento del
documento. Medido a 1440×900: el panel mide 1440×900 clavados.

**Velo, lente y desenfoque no se tocan.** Lo que se va es el marco, no el
material.

**2026-08-22 · La detección de respaldo miraba la MARCA y tenía que mirar el MOTOR.**
Reportado que en el despliegue no se ve deformación, sólo transparencia. No es
el despliegue: se compiló en producción y se sirvió el `.output` en local, y las
nueve instancias construyen su filtro igual que en desarrollo — cinco
primitivas, mapa `data:` completo, `is-lensed` puesto. El build no es el
problema.

Lo que había era esto, en `useGlassLens`:

```js
!/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)
```

Excluía a Safari **y dejaba pasar a `crios` y `fxios`** — Chrome y Firefox en
iPhone. Está al revés: en iOS y iPadOS todos los navegadores son WebKit, porque
la plataforma no permite otro motor. Y colarse ahí es peor que quedarse fuera:
WebKit acepta la GRAMÁTICA de `backdrop-filter: url(#f)` —`CSS.supports` dice
que sí— pero no resuelve la referencia, y un `backdrop-filter` que apunta a algo
irresoluble se lleva por delante la cadena entera. El que se colaba no perdía la
lente: perdía el vidrio.

Ahora se detecta el motor (`iPhone|iPad|iPod`, los sufijos `CriOS/FxiOS/EdgiOS/
OPiOS`, el «Macintosh con táctil» de iPadOS 13+, y Safari de escritorio como
«dice Safari y no dice ningún Chromium»). Verificado contra ocho UA reales:

| | lente |
|---|---|
| Chrome / Edge / Opera / Samsung — escritorio y Android | **sí** |
| Safari iOS · Chrome iOS · Firefox iOS · iPadOS · Safari macOS | no — desenfoque |
| Firefox escritorio | no — desenfoque |

**En iPhone no va a haber deformación en ningún navegador.** No es algo que se
pueda arreglar desde aquí: es el motor. Allí el material es velo + desenfoque +
saturación + el filo especular, sin refracción.

**2026-08-22 · Fuera la luz que sigue al ratón.**
`useGlassLight` era un `pointermove` global que recalculaba `--lg-ang` para cada
superficie desde su propio centro. En teoría eso separa un cristal físico de un
degradado pegado; en la práctica se veía como un fallo — con un gesto rápido el
puntero cruza el centro de la pieza y el filo salta de un lado al otro en un
fotograma, y el `transition: background .12s` que lo suavizaba sólo convertía el
salto en un parpadeo.

`--lg-ang` pasa a ser una diagonal fija de 135°, la misma para el velo y para el
especular. El fichero se borró; está en el historial de git.

**2026-08-22 · La ficha del buscador: de sólida a vidrio `light` con texto blanco.**
Era `background: var(--av-solid-bg)` — el único objeto opaco de todo el sistema,
y sobre el panel a pantalla completa se leía como un parche. Contradice el §6
(«nada de vidrio en la capa de contenido, nada de vidrio sobre vidrio») y la
contradicción es deliberada.

Se probaron las dos combinaciones y se eligió mirándolas:

| | fondo compuesto | contraste del texto |
|---|---|---|
| `light` + tinta negra | ~140 gris | 6.0:1 · tono suave 3.9:1 |
| velo negro + blanco | ~57 | 11.3:1 · tono suave 6.8:1 |
| **`light` + blanco** ← elegido | ~140 gris | **3.2:1 · tono suave 2.4:1** |

El elegido es el que peor mide. Queda escrito: está por debajo del 4.5:1 de AA.
Si hay que subirlo sin cambiar el color de la letra, el botón es BAJAR
`--lg-veil-a` en la ficha —menos velo blanco, fondo más oscuro, blanco que
resalta más—; subirlo lo empeora.

La ficha es además la única pieza que rompe una variante por dentro: `light`
invierte los cuatro `--av-on-glass-*` a tinta y la ficha se los devuelve a
claro. Van como tokens y no como `color` suelto, así que los hijos siguen sin
escribir ni un color propio.

**2026-08-22 · `:deep()` descendiente filtrándose a vidrios anidados.**
`.av-search :deep(.av-glass__body)` alcanzaba también al cuerpo de la ficha, que
es otra `GlassSurface` dentro del panel. La ficha heredaba
`flex-direction: column` y se pintaba en columna — foto arriba, texto debajo,
chevron al final. Todos los `:deep(.av-glass__body)` pasan a `> :deep(...)`:
cada superficie manda sobre SU cuerpo y sobre ninguno más.

**2026-08-22 · La píldora se centra sobre la PANTALLA, y el corte sube a 1279.**
Estaba en la columna de en medio de una rejilla `auto 1fr auto`, y esa columna
no está centrada: arranca tras la marca (58) y acaba antes de las acciones
(250). Su centro caía en 616 de 1425 — 96 px a la izquierda del de la pantalla.

`1fr auto 1fr` la centraría pero desborda: un `1fr` no baja de su contenido y a
1024 las dos laterales pedirían 250 cada una. La solución es sacarla del flujo
(`absolute; left: 50%; translateX(-50%)`), y el precio es que ya no empuja a
nadie, así que el solape hay que impedirlo con el ancho mínimo de la
disposición. Holgura contra los botones, medida:

| 1024 | 1100 | 1180 | **1280** | 1366 | 1440 |
|---|---|---|---|---|---|
| −60 | −37 | −14 | **+24** | +48 | +69 |

De ahí el corte en **1279**. No se arregla apretando —quitar margen da 15 px y
bajar los botones a 48 otros 28, de los 60 que faltan, rompiendo además el alto
único—. Lo que sí lo arreglaría es una píldora más corta: con cuatro enlaces en
vez de seis sobrarían ~115 px y el corte podría volver a 1024. Es una decisión
de contenido.

**2026-08-22 · `--av-nav-h`: 58 → 55.**
El suelo del número es el botón de la barra de teléfono, que vive dentro y tiene
que quedarse en 44 px de objetivo táctil. Era `--av-nav-h` menos 14 (44 clavados
a 58); al bajar a 55 habría caído a 41, así que el resto pasa a menos 10 y da 45.

Y la marca dejó de llevar su propio número: `<BrandMark>` tenía `:size="58"` en
la plantilla, que ganaba por estilo en línea, así que la barra bajaba y la marca
no. Ahora `size` es `null` por defecto y el alto lo pone `--av-mark-h`, que la
barra ata a `--av-nav-h`. Un número.

En material, 55 recorta la lente a 18.7 y la compresión a 59.8 — el 72% del
preset. A 58 era el 76%.

**2026-08-22 · Aire alrededor de la selección de la píldora: `--av-nav-air`.**
La selección quedaba a 4.5 px del filo de arriba y a 1 px de su vecina, porque
la separaban tres números sin relación: 13 de relleno vertical del enlace, 2 de
hueco entre enlaces y 9 de relleno interior de la píldora. Ahora es UNO, y vale
para los cuatro lados: el enlace mide `--av-nav-h` menos dos veces el aire, la
píldora reserva ese aire de relleno, y entre dos enlaces va el doble — así a
cada selección le toca lo mismo contra su vecina que contra el borde.

A 5 px, los huecos pasaron de 2 a 10 y eso engorda la píldora 40 px. Como va
centrada, ese ancho se paga a los dos lados, así que el relleno lateral del
enlace bajó de 20 a 17 (a 1280, a 12) para devolverlo.

**2026-08-22 · Buscar: ventana en teléfono, barra + desplegable en escritorio.**
A pantalla completa sólo tiene sentido donde no hay sitio para colgar nada. En
escritorio y tableta ocupaba la pantalla entera para enseñar dos resultados.

Ahora en la cabecera hay un CAMPO, no un botón, y los resultados caen debajo con
su mismo ancho. Es la MISMA pieza —`#av-search`, con sus sugerencias, sus fichas
y su «ver todos»—: lo único que cambia entre los dos casos es la caja, en una
`@media`. Por eso no hay un segundo componente.

**Va a la izquierda, junto a la marca, y no es gusto.** Con la píldora centrada
sobre la pantalla el hueco de la derecha daba 69 px a 1440 y 24 a 1280 — no cabe
un campo de texto. Y no se arregla estrechando la píldora: aun con su relleno al
mínimo, el hueco derecho llega a 160 px a 1440 y a 83 a 1280. El izquierdo daba
265 y 215. Es el único sitio donde entra sin descentrar la píldora.

Medido después del cambio, con la barra ya puesta:

| ancho | barra | holgura izq. | holgura der. | desvío del centro |
|---|---|---|---|---|
| 1280 | 179 | 28 | 93 | 0 |
| 1366 | 191 | 38 | 115 | 0 |
| 1440 | 202 | 47 | 134 | 0 |
| 1600 | 224 | 105 | 214 | 0 |

Dos números nuevos en `tokens.css`, y viven ahí y no en el componente porque el
desplegable es HERMANO de la cabecera, no hijo, y necesita la misma cuenta para
caer alineado: `--av-search-x` (`relleno + marca + hueco`, donde el flujo pone
la barra) y `--av-search-w` (su ancho, que es también el del desplegable).

La cabecera deja de esconderse con el buscador abierto: el campo vive dentro de
ella. Y aparece un velo transparente para el clic de fuera, que sólo existe en
escritorio — la ventana de teléfono no tiene «fuera».

**2026-08-22 · `--lg-frame`: el marco del material pasa a ser un token.**
La variante `panel` apagaba la elevación y el filo especular con
`box-shadow: none` en tres reglas sueltas. Dejó de servir en cuanto la misma
superficie tuvo dos casos: el buscador va a sangre en teléfono y es un
desplegable CON esquina en escritorio, y deshacer tres reglas en una media query
es justo el desorden que el material evita.

Ahora `--lg-frame` (1 = con marco · 0 = a sangre) multiplica las alfas de la
sombra de elevación y de las tres sombras internas del especular, y es la
opacidad del anillo de 1.4 px. `panel` lo pone a 0; el buscador de escritorio lo
devuelve a 1 con una línea.

**2026-08-22 · `:deep()` otra vez: el `<form>` del buscador.**
Mismo tropiezo que la ficha, y por eso vale la pena escribirlo dos veces: puse
`display: flex` en `.av-nav__search`, que es la RAÍZ de una `GlassSurface`. Las
cuatro capas del material son `absolute` y el contenido vive en `__body`, así
que la lupa y la X se salían del campo por arriba y por abajo. La fila siempre
va en `> :deep(.av-glass__body)`.

**2026-08-22 · La marca vuelve a su panel circular, y pierde el halo.**
Estuvo suelta sobre el fondo, apoyada en un `drop-shadow` propio, desde que se
la sacó del vidrio para que se leyera sobre el frame claro. Vuelve al panel para
que en la cabecera no quede ninguna pieza con material distinto: marca, barra de
búsqueda, píldora y botones son ahora el mismo Velo negro y el mismo
`--av-nav-h`.

El círculo recorta el rótulo —el recorte es casi cuadrado y pierde las
esquinas— y está aceptado. El halo se va porque el velo negro ya la despega, y
además porque `filter` crea un backdrop root: un halo ahí dejaría sin fondo que
refractar a cualquier `backdrop-filter` que entrara por dentro. Es la misma
trampa que ya costó un bug con `.av-glyph`.

**2026-08-22 · La barra de búsqueda, más ancha.**

| ancho de ventana | barra antes | ahora |
|---|---|---|
| 1280 | 179 | **193** |
| 1366 | 191 | **214** |
| 1440 | 202 | **232** |
| 1600 | 224 | **250** |

El panel de resultados crece con ella sin tocar nada: los dos leen
`--av-search-w`. Lo paga la píldora, cuyo relleno lateral baja a 10 px en el
corte (era 11). Queda una holgura de 16–19 px entre la barra y la píldora, que
es justo el hueco de la cabecera (`--av-nav-lgap`, 13.6–16): todos los huecos de
la fila miden ya lo mismo.

**2026-08-22 · La barra de búsqueda crece SÓLO en escritorio.**
En tableta en horizontal (1280) se queda en 193 px, que es lo que cabe. De ahí
para arriba sube deprisa, porque el sitio existe y sólo hay que quitárselo a la
píldora:

| ventana | barra | relleno del enlace | holgura izq. |
|---|---|---|---|
| 1280 | 193 | 10 | 19 |
| 1366 | 230 | 11 | 18 |
| 1440 | **262** | 12 | 16 |
| 1600 | **320** | 12 | 38 |

La cuenta es fija: con la píldora centrada, cada píxel que gana la barra se lo
tiene que quitar la píldora por DOS —uno a cada lado del centro—. De 232 a 262
son 60 px de píldora, o sea 5 de relleno en cada uno de sus doce costados. El
tope de la barra está en 320: más allá el relleno del enlace bajaría de 10 y las
etiquetas empezarían a tocarse.

Efecto secundario que conviene ver escrito: a la derecha quedan 164 px libres a
1440 y 244 a 1600. Es el precio de centrar la píldora sobre la pantalla teniendo
un lado más cargado que el otro, y se aceptó a sabiendas.

**2026-08-22 · El rótulo, con aire dentro de su burbuja.**
Iba a ras del círculo y se recortaba por las esquinas. Ahora va al **60% del
alto**: quedan ~11 px de aire a los lados y ~4 en las esquinas, así que se ve
que hay una burbuja y no un icono cortado. Lo que manda es la diagonal —el
recorte es casi cuadrado—, y a partir del 68% las esquinas vuelven a tocar el
filo. El `overflow: hidden` se queda de red por si algún día entra un asset más
alto.

**2026-08-22 · La luz vuelve al FILO: fuera los resplandores de borde completo.**
`.av-glass__spec` llevaba dos `inset` blancos que recorrían ENTERO el canto de
arriba y el de abajo. En una pieza pequeña pasaban por reflejo; en una píldora
de 700 px eso no es un reflejo, es una barra encendida — y era justo lo que se
veía mal. Se van los dos. Queda la sombra interna oscura, que da volumen sin
iluminar nada, y el anillo del `::after`, que ahora es toda la luz que hay.

**El perfil del anillo pasa a ser MONÓTONO: máximo en el borde y caída continua.**
Primero se probó con el pico al 16/84% para que el círculo lo viera —ver la nota
de geometría de abajo—, y estaba mal por otro lado: con el máximo dentro, la luz
nacía apagada en la esquina, subía y se desplomaba, y eso se lee como un parche
brillante en medio del canto, no como luz entrando por el filo.

Ahora los dos extremos del degradado son las dos esquinas de la diagonal de
`--lg-ang` —0% la superior izquierda, 100% la inferior derecha— y de cada una
sale el brillo a tope difuminándose (.86 · .62 · .36 · .21) hasta un **suelo de
.17** en el centro. La caída es más rápida que lineal: a un tercio del camino ya
sólo queda el 36%. En una píldora el brillo vive en las dos tapas y su entorno;
en un círculo es un arco que recorre el cuadrante.

**Suelo y no cero**, y esto fue la última corrección: bajando a cero el canto
largo de la píldora desaparecía y la pieza se quedaba sin silueta. Lo que se
busca es un filo CONTINUO con dos zonas encendidas, no dos trozos de filo
sueltos.

**Y vuelve un resplandor interior**, esta vez como `box-shadow: inset` y no como
capa con máscara. Un `box-shadow` se difumina y no tiene filo interior — que es
exactamente lo que arruinó el `::before`. Uniforme y flojo (.13): la dirección
la pone el anillo; esto sólo evita que el filo parezca una línea pegada encima.

**La geometría que condiciona el perfil.** Un `linear-gradient` mide sobre la
CAJA, no sobre la forma. En un círculo la diagonal de la caja es 1.414·d y el
círculo sólo ocupa el tramo central: su punto más «arriba-izquierda» cae en el
**14.6%** del degradado y el opuesto en el **85.4%**. Por eso el perfil no puede
desplomarse antes del 15% — si lo hace, el anillo del círculo sólo ve las colas
y el botón sale apagado, que es exactamente lo que pasaba con los picos en 0/100
y una caída brusca. Con el máximo en el borde y una caída suave, a 14.6% todavía
queda el 78%.

**Y un intento fallido que conviene no repetir: el halo del `::before`.**
Se añadió un segundo anillo, más grueso y tenue, para que el filo pareciera luz
entrando en el canto y no una línea dibujada encima. Salió mal y se quitó: la
máscara de `padding` recorta una BANDA de grosor constante, con el filo interior
tan nítido como el exterior, así que en vez de un resplandor aparecía un
**segundo borde** a 6 px del primero. Un halo de verdad pediría desenfocar esa
capa, y el desenfoque se sale de la pieza. Un solo anillo.

**2026-08-22 · Se va todo el negro pegado al filo, y el especular baja a 0.60.**
Reportado que en las esquinas encendidas «sobresale un negro». Aislado
apagando cada sospechoso por separado y midiendo el perfil de luminancia a
través del canto, en vez de a ojo. Eran dos, y la sombra de elevación —el
sospechoso obvio— **no** era ninguno: quitarla mueve el fondo de 222 a 225,
tres niveles.

1. **La viñeta oscura de `.av-glass__spec`** — `inset 0 0 lip*1.5 lip*-.9
   rgba(14,10,0,.34)`, puesta en su día para dar volumen. Aporta poco tono pero
   cae exactamente donde el anillo brilla, y ese salto de blanco a gris sucio es
   lo que se lee como borde negro. Fuera; el volumen ya lo dan el velo y el
   propio anillo.
2. **El contorno oscuro de `.av-glass-sel`** — `inset 0 -1px 0 rgba(0,0,0,.16)`
   más `0 1px 3px rgba(0,0,0,.18)`. Los dos juntos recortaban la selección en
   negro justo por debajo de su filo encendido. Fuera también: la selección se
   distingue por ser MÁS CLARA que el velo, no necesita que la perfilen.

Y `--lg-spec` baja de **0.85 a 0.60**: el filo estaba demasiado marcado y se
leía como un trazo dibujado encima. Al ser el multiplicador de todo lo
especular, baja a la vez el anillo, el resplandor interior y el filo superior de
la selección — la pieza se apaga entera, no sólo su contorno.

Queda una cosa que NO es un defecto y conviene no confundirla con esto: sobre un
fondo claro el vidrio mide 112 contra los 222 de la página. Esa diferencia es el
velo negro al 45% con el brillo al 0.85, o sea el material haciendo su trabajo,
y la silueta oscura que se ve alrededor de la pieza sale de ahí.

**2026-08-22 · La variante `light` se había quedado con el filo a tope.**
Al bajar `--lg-spec` de 0.85 a 0.60, `.av-glass--light` seguía pinchándolo a 1
—lo tenía desde que se creó, porque sobre un velo claro el filo necesita algo
más para despegarse—. Resultado: las fichas del buscador eran las ÚNICAS piezas
con el contorno marcado mientras todo lo demás se había suavizado.

Pasa a **0.72**, que es el 0.60 de la base con el mismo +20% que tenía antes.
No puede escribirse como `calc(var(--lg-spec) * 1.2)`: sería una referencia
cíclica, porque se está redefiniendo la misma propiedad. Queda anotado en
`glass.css` para que se mueva con la base si ésta vuelve a cambiar.

Auditadas las diez superficies visibles: todas con el mismo anillo de 1.5 px a
135°, `--lg-frame: 1`, y `--lg-spec` en 0.60 salvo las dos fichas `light` en
0.72.

**2026-08-24 · El rollo pasa a tener dos pisos: marcas → productos.**
Era un carrusel de producto suelto. Ahora el primer piso gira MARCAS —texto por
ahora, logotipo cuando lo haya— con su lista abajo a la izquierda, y «Ver
productos» entra al segundo piso, que es el carrusel de siempre con un «←
Marcas» arriba a la izquierda.

Un solo componente, porque el mecanismo del giro es el mismo y partirlo en dos
habría garantizado que en tres semanas se comportaran distinto. Lo que sí van
separados son los índices: uno por piso, o volver atrás te deja en otra marca de
la que saliste.

**2026-08-24 · El rollo de escritorio se reparte en cinco columnas.**
Los tres zapatos se amontonaban en el tercio central. La causa: `translateX(33%)`
resuelve el porcentaje contra el ancho del PROPIO zapato —125 px a 1440—, no
contra el de la sección. Ahora `--rl-side-shift: 20vw`, que es exactamente una
columna de cinco, y los lados caen clavados en los centros de la 2 y la 4
(medido: 425 y 1001 contra los 427.5 y 997.5 teóricos).

Al tocar tamaños hay que medir la caja GIRADA, no la nominal: un cuadrado de
285 px a 16° ocupa 351 de ancho real, y es esa la que no puede tocar a la del
vecino. Por eso el ancho del ítem bajó a una columna clavada y el cuerpo del
nombre de marca a 66 px — con «New Balance» a 84 el nombre medía 472 y se metía
debajo de los lados.

**Teléfono no se tocó**: allí los lados siguen con el desplazamiento relativo al
propio ítem, que es lo que los hace leer como profundidad en 375 px.

**2026-08-24 · El rollo, a pantalla completa de verdad, y con reservas arriba y abajo.**
`height: 100svh` en vez de `min-height`: con un mínimo la pieza podía crecer y
dejar de ser fullscreen en cuanto la ficha ganara una línea. Y dos reservas que
antes no estaban escritas como tales: `--av-nav-space` arriba (la barra fija del
ecommerce) y `--rl-suelo`, 70 px, abajo — donde se posa la barra del navegador
en teléfono. Medido: los botones quedan a 90 px del borde inferior en los dos
anchos.

La lista de marcas sube de la esquina inferior izquierda a un **navbar de
categorías** arriba, en columnas. Y la fila que lo contiene tiene alto propio
(46 px) lleve el navbar o el botón de volver: sin eso, el escenario cambiaba de
alto al cambiar de piso y el zapato pegaba un salto.

En teléfono, volver baja junto a «Ver detalle» y los dos forman pareja —flecha
izquierda / flecha derecha—. Marcado duplicado con una copia en `display: none`,
que es el patrón que ya usa la barra de navegación.

**2026-08-24 · Lo que limita el tamaño del ítem es la TINTA, no la caja.**
El zapato se veía pequeño para una pieza a pantalla completa. La caja decía que
no había sitio —9 px de hueco— pero eso era mentira: el recorte lleva margen
transparente por los cuatro lados, y medido sobre el pixel la tinta del foco
ocupaba 250 px de los 351 de su caja girada. El aire real eran 95 px.

Subido un 25% (`min(25vw, 46vh, 440px)`), la tinta del foco pasa a 313 y siguen
quedando **47 px** de aire real hasta el zapato de al lado.

Una letra no tiene ese margen. Por eso el cuerpo del nombre de marca no pudo
subir con el zapato: a 76 px «New Balance» mide 445 y su cola se mete debajo del
ítem de la derecha. Se queda en 66.

**Y fuera el «Pronto».** Todas las marcas del navbar son marcas reales; que a
una le falten fotos hoy es un hueco del prototipo, no un estado del producto.
Lo único que queda de eso es que su botón «Ver productos» está apagado.

**2026-08-24 · Cinco puestos en el rollo de escritorio, y NO a distancias iguales.**
Las columnas 1 y 5 se dejaban libres; ahora las ocupan dos ítems más, con un
tercer plano de profundidad (escala 0.30, blur 17, opacidad .20) y sin poder
tocarse — a esa escala son fondo, no opción. En teléfono se apagan y quedan
tres, porque a 375 px caerían encima de las flechas.

Los vecinos van a una columna del centro y los extremos a **1.55**, no a dos.
Con pasos iguales lo que se ve es una fila de fotos alineadas; un carrete
redondo visto de frente tiene a los de fuera girando hacia el fondo y su
separación aparente se encoge. Es `sin θ`: con pasos de 40°, 0 · 0.64 · 0.99 —
el segundo salto es la mitad del primero. Medido en tinta a 1425: **105 px**
entre foco y vecino, **74** entre vecino y extremo.

Con 4 ítems y 5 puestos uno de los extremos queda vacío, y es inevitable: el que
está a distancia 2 es el MISMO por los dos caminos. Se prefiere el izquierdo
(`d >= total/2` en el empate) porque es el lado por el que se lee.

**2026-08-24 · El alto del rollo se ata al del acordeón, y se descarta `lvh`.**
Se había cambiado a `100lvh` para que la sección no dejara asomar la siguiente
cuando la barra del navegador se retrae. Descartado: importa más que las dos
piezas a pantalla completa midan LO MISMO, o la página deja de avanzar de
pantalla en pantalla. Vuelve a `100svh`, igual que el acordeón — verificado en
la página real: acordeón en 3375 con 900 de alto, rollo en 4275 con 900.

El hueco que `svh` deja cuando la barra se retrae se cubre por el otro lado, con
`--rl-suelo: 70px` de reserva abajo.

**2026-08-24 · «N modelos» baja a su botón, y el nombre cambia de lado.**
La cuenta estaba en la cabecera, arriba del todo, separada de «Ver productos»
por el escenario entero. Es el pie del botón, no un titular: van juntos.

El nombre del producto va **encima** del zapato en teléfono y **debajo**, junto
a los botones, en escritorio. En 375 px el zapato ocupa casi todo y el nombre
arriba es lo primero que se lee; en escritorio el zapato es la pieza grande y el
nombre trabaja mejor de pie de foto. Marcado duplicado con una copia en
`display: none`, y el `aria-live` sólo en una: dos regiones vivas anunciarían lo
mismo dos veces.

Y los botones bajan de 158×46 a **134×38** en escritorio. A 46 competían con el
nombre y con el zapato, que es donde tiene que estar la atención. En teléfono se
quedan en 44 de alto porque ahí manda el objetivo táctil.

**2026-08-24 · Un quinto Jordan y una quinta marca, para poder ver los cinco puestos.**
El rollo tiene cinco puestos y con cuatro ítems uno quedaba siempre vacío. Se
añaden `jordan-royal` —**PLACEHOLDER COMPLETO**: reutiliza la foto del pino, no
es un colorway real— y la marca **Veja**, sin catálogo como Nike y New Balance.

El quinto Jordan es un id NUEVO y no el mismo repetido, y esto importa: dos
entradas con el mismo id romperían la clave del `v-for` y Vue reutilizaría el
nodo equivocado al girar. Cuando llegue una quinta foto de verdad se cambian
`frames`, `line` y `short`; y si no llega, se borra — un catálogo con un
producto inventado es peor que uno corto.

**2026-08-24 · REVERTIDO · el primer piso de marcas del rollo.**
Se quitó entero. Metía dos pantallas donde el usuario sólo quería una: el rollo
es un escaparate, y un escaparate no pide que elijas la marca antes de dejarte
mirar. Con él se van el navbar de categorías y el botón de volver — queda un
solo botón, «Ver detalle».

`assets/js/brands.js` **se queda**: el mapa de marca → productos sigue siendo
cierto y hará falta en la Tienda. Lo que se fue es el componente que lo usaba.

**2026-08-24 · Fuera el precio del rollo.**
El rollo da ganas de abrir la ficha; el precio es información de decisión y vive
donde se decide.

**2026-08-24 · El rollo pinta su propio fondo: negro plano, como el panal.**
`#050506`, la primera parada de la rampa `negro` de marca. Tapa la rampa del
escenario a propósito: sobre negro liso lo único que se ve es la silueta del
zapato y el filo del vidrio.

Y con él entra el grano, que no es decoración: sobre negro plano la lente no
tiene detalle que doblar y las flechas se leerían como cristal limpio. Va en un
`::before` —necesita opacidad propia— y debajo de todo, porque un
`backdrop-filter` sólo ve lo que se pintó antes que él. Es la misma solución que
ya usa el panal, con los mismos dos props (`bg` y `grain`).

**2026-08-24 · Centrado del teléfono: comprobado, y no había desvío.**
Se reportó que en teléfono no todo estaba centrado. Medido pieza a pieza contra
el centro del área de contenido: foco 0, nombre 0, botón 0, contador 0. Lo que
descuadraba la medición hecha sobre el pixel eran dos cosas ajenas al
componente: la barra de scroll del navegador headless —15 px que no existen en
un teléfono— y el engranaje del `DevPanel`, que flota abajo a la derecha y sólo
existe en desarrollo.

Lo que sí cambió, y probablemente era lo que se veía torcido: con dos botones el
par se centraba como fila; ahora hay uno solo y no hay nada que repartir.

**2026-08-24 · Teléfono: el zapato se centra en la pantalla y se van las flechas.**
El zapato se veía bajo, y no era una impresión: en flujo el escenario ocupaba el
hueco entre el nombre y el botón, y ese hueco no está centrado. Arriba pesan los
87 px que reserva la barra del ecommerce más los 104 del nombre; abajo, sólo los
70 del suelo más el botón. 203 contra 140 — el zapato caía 31 px por debajo del
centro.

Se arregla sacando el escenario del flujo: `position: absolute; inset: 0` lo
hace medir la **padding box** entera —que es contra lo que se resuelve un
absoluto, no contra la caja de contenido— así que su centro es el de la sección.
El nombre y el botón siguen en flujo por encima, con `space-between`. Medido:
centro del zapato 406, centro del viewport 406.

Y fuera las flechas: en 375 px un botón de 44 sobre el zapato quita más de lo
que da, y el gesto ya existía. Lo que faltaba era decirlo — de ahí la pista
«Desliza para ver más» encima del botón, a 12 px y al 60% de opacidad. Es la
única excepción al cuerpo del sistema en la pieza, y deliberada: no es
contenido, es una ayuda que tiene que poder ignorarse. Un carrusel sin mando
visible es un carrusel que nadie descubre.

**2026-08-24 · Entra `<SiteFooter>` y se va el banco de pruebas del scroll.**
La landing terminaba en el héroe con el letrero —dos botones y un párrafo sobre
el material— que estaba ahí sólo para tener altura que scrollear mientras se
comprobaba que la barra fija aguantaba hasta abajo y que el velo no se inmutaba
al pasar de sección clara a oscura. Su propio comentario decía que se borraba en
cuanto hubiera contenido real. Lo hay: cuatro componentes de producto comprueban
ya las dos cosas, y lo que faltaba era el cierre.

**El pie va en el LAYOUT, no en la página.** Un `<footer>` dentro de `<main>` es
HTML válido pero no es el landmark `contentinfo`: deja de ser el pie de la
página y un lector pierde el salto directo. Va detrás de `</main>`, junto a
`<AppNav>` — la barra y el pie son el marco, no el contenido, y el día que haya
una segunda ruta ya están puestos.

**Y pisa el fondo del escenario con el negro del panal.** Es la excepción a lo
que documenta `backgrounds.js` —no pintar plano propio— y tiene motivo
geométrico, no estético: el panal es quien lo toca por arriba, y sobre la rampa
del escenario el pie se aclara justo donde el panal es más oscuro. La costura
horizontal se ve. Mismo `#050506` y mismo grano al 4% = misma superficie, y los
dos plafones se leen como un solo bloque negro de cierre. Por lo mismo el color
del texto va escrito: `.is-light-bg` llegaría hasta aquí y dejaría el pie en
negro sobre negro.

**Las marcas salen de `brands.js`.** La referencia enseña Puma y Under Armour,
que no están en el catálogo. Escribirlas en el pie sería la segunda lista de
marcas de la casa; a la primera alta empiezan a separarse.

**Hover amarillo en los enlaces, no blanco.** El enlace en reposo va al 72% de
blanco; subirlo a blanco puro es un salto de BRILLO, y sobre una columna de
texto del mismo tono eso se lee como que algo se ha movido, no como que hay un
enlace. `--av-y-400` cambia de tono — lo único que no se confunde con sus
vecinos— y repite el gesto que ya hacen el icono de red y el foco.

**Los cuatro glifos de red van dibujados a mano.** lucide 1.0 trae `facebook` e
`instagram` pero ya no youtube ni tiktok. Importar dos y dibujar dos deja una
fila de cuatro con dos trazos distintos, y en una fila corta eso se ve. Los
cuatro en el idioma de lucide —caja 24, trazo 2, remates redondos— y en trazo,
no macizos como la referencia: todos los iconos de la casa son de trazo y el
peso visual manda sobre el parecido.

**2026-08-24 · «Nunca versales» se queda SIN excepciones, y el fondo del showcase estrena Playfair Display.**
La regla de tipografía se puso a prueba en las dos direcciones el mismo día y
sale reforzada: primera mayúscula y el resto minúsculas, sea un título, una
etiqueta, una fila o una palabra de 300 px de cuerpo.

El pie nuevo la cumple entera —sus tres títulos de columna van en caja mixta
aunque la referencia los grite—: lo que separa ahí un título de un enlace son el
peso (800 contra 400), el cuerpo y el color; tres señales bastan, y las versales
serían la única cuarta que además cuesta legibilidad.

Y `.ps__word`, el texto gigante del frame de atrás, TAMPOCO es excepción. Pasó
un rato en versales con el argumento de que no es texto sino una mancha —va
difuminada, va en `aria-hidden`— y de que una mancha necesita bloque. No se
sostiene: con la letra nueva, la caja mixta es precisamente lo que le da perfil.
La `d` sube, la `s` se cierra, y el fondo deja de ser un rectángulo de letras.
Un bloque de versales lo aplanaba.

Corolario práctico, que es lo que hay que recordar: **ninguna pieza lleva
`text-transform`**, así que el dato se escribe como se lee y el mismo nombre
vale para el fondo del showcase, para el acordeón y para el pie. Un dato en
mayúsculas no se puede devolver a minúsculas.

**La letra: Playfair Display, y sólo ahí.** Es la primera pieza del proyecto que
no usa la pila del sistema. Una didona —contraste altísimo entre el grueso y el
fino, remates de pelo— es justo lo que se le pide a un fondo a ese cuerpo: la
mancha deja de ser plana y pasa a tener dibujo. Por eso el token se llama
`--av-font-display` y no `--av-font-serif`: a 14 px los finos se rompen y no
vale para nada más. Ni un título de sección, ni una etiqueta.

Se pide **un solo corte** (900, sin cursiva) y no el rango variable entero: la
familia completa son ~120 KB para usar exactamente un peso, y con `wght@900`
Google sirve una instancia estática de ~30 KB. Con `display=swap`, porque con el
`block` por defecto habría hasta 3 s de hueco en blanco donde va la palabra; el
salto de ancho al llegar la buena no descoloca nada, porque `useFitText` ya
vuelve a medir con `document.fonts.ready` — es justo el caso para el que está.
Y dos `preconnect`, porque son dos dominios: el CSS sale de `googleapis` y el
fichero de `gstatic`, y sin el segundo esa conexión no se abre hasta haber leído
el CSS.

**El trazo se abre de -.055em a -.015em**, y el relleno de compensación con él
—los dos números son siempre el mismo. El -.055 estaba calculado para una
grotesca, donde apretar sólo acerca dos verticales. Con remates, a ese trazo el
de la `d` se mete debajo del de la `i` y la palabra se lee como una sola forma
pegada, que es lo contrario de lo que hace una didona. Sigue negativo —la mancha
tiene que quedar compacta—, sólo deja pasar el remate.

**Y el separador pasa de raya a punto medio.** «Samba OG · Collegiate Green», no
«Samba OG — Collegiate Green». La raya es un signo de puntuación: abre un inciso
y pide una pausa de lectura. Lo que hay entre esos dos datos no es una frase,
son dos campos del mismo rango puestos uno al lado del otro, y para eso está el
punto medio, que separa y no dice nada más. Era el separador que ya usaba el
rollo en su ficha, así que ahora los dos componentes separan igual. Cambia
también el `alt` de los frames, que llevaba la misma raya.

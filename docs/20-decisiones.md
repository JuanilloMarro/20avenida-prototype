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


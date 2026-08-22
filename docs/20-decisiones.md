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

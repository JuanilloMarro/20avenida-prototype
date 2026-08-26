# 09 · `<ProductDiptych>` — el díptico

> **Guía de migración.** Todo lo necesario para reconstruirlo desde cero,
> incluidas las decisiones que costaron y las cuentas que hay detrás de cada
> número.
>
> **Archivo:** `app/components/product/ProductDiptych.vue` — 864 líneas.
> **Depende de:** `assets/js/sneakers.js` · `assets/js/backgrounds.js` ·
> `<GlassSurface>` · los tokens del anfitrión (§9).

---

## 1 · Qué es

Dos hojas, como su nombre. A la izquierda una **lámina** fija; a la derecha un
**carrusel de celdas hexagonales** que gira.

```
┌──────────────────────┐   ┌──────────────────────────────┐
│                      │   │                              │
│     ▒▒▒▒▒▒▒▒▒▒▒▒     │   │   ‹     ⬡    ⬢    ⬡     ›    │
│     ▒  lámina  ▒     │   │       lado  FOCO  lado       │
│     ▒▒▒▒▒▒▒▒▒▒▒▒     │   │                              │
│                      │   │                              │
└──────────────────────┘   └──────────────────────────────┘
        44.7 %                        44.7 %
```

**No es una pieza nueva sino un cruce de tres que ya existen:**

| mitad | de dónde sale |
|---|---|
| la lámina | una tarjeta sólida — el plano largo contra el que se mueve el resto |
| la celda | el hexágono de `<ProductHoneycomb>`: misma geometría, mismo filo |
| el giro | la distancia cíclica de `<ProductReel>`, recortada a **tres** puestos |

**Lo que NO lleva, y es la mitad del encargo:** ni título, ni descripción, ni
botón, ni contador. Sólo las flechas y la celda. El díptico es una pieza de
**imagen** — lo que tenga que decirse se dice en la ficha, no aquí.

---

## 2 · Proporciones de ocupación

Medidas del DOM con las transiciones apagadas.

### 2.1 · Escritorio — 1440 × 1024 (sección 1425 × 714.2)

| pieza | posición | tamaño | % del ancho |
|---|---|---|---|
| **sección** | 0, 0 | 1425 × 714.2 | 100 % |
| retícula | 57.6, 47.1 | 1309.8 × 620 | 91.9 % |
| **lámina** | 57.6, 47.1 | 637.6 × 620 | **44.7 %** |
| foto | 57.6, 47.1 | 637.6 × 620 | 44.7 % — **a sangre** |
| **carrusel** | 729.8, 47.1 | 637.6 × 620 | **44.7 %** |
| hexágono foco | 940.6, 232.4 | **216 × 249.4** | 15.2 % |
| hexágono lado | 1180.3, 284.8 | 125.3 × 144.7 | 8.8 % |
| flecha izq. | 729.8, 334.1 | 46 × 46 | 3.2 % |
| flecha der. | 1321.4, 334.1 | 46 × 46 | 3.2 % |

**Las holguras**, que es lo que hay que verificar:

- foco ↔ lado: **23.7 px**
- lado ↔ flecha: **15.8 px**
- el foco está centrado en su columna al píxel: centro del carrusel 1048.6,
  centro del hexágono 1048.6.

Las dos columnas son iguales (`1fr 1fr`) y el hueco se lo reparten, así que cada
una acaba en **44.7 %** y no en un 50 % exacto. Eso es lo correcto: «mitad»
describe el reparto, no un ancho al píxel.

### 2.2 · Teléfono — 375 × 812 (sección 375 × 657.1)

**Una columna.** Dos hojas de media pantalla en 375 px son dos hojas de 180: la
lámina deja de leerse y el hexágono cae por debajo de los 100 px, que es donde
una foto de zapatilla deja de reconocerse.

| pieza | posición | tamaño |
|---|---|---|
| lámina | 16.5, 42 | 342 × 427.5 — **4:5 exacto** |
| carrusel | 16.5, 481.5 | 342 × 133.6 |
| hexágono foco | 140, 493.5 | 95 × 109.6 |
| hexágono lado | 245.4, 516.5 | 55.1 × 63.6 |
| flechas | 16.5 / 314.5, 526.3 | 44 × 44 |

Filas: `auto 1fr` → **427.5 / 133.6**. `auto` para la lámina, que lleva su
proporción escrita, y el resto para el carrusel — en vez de repartir la altura a
medias entre una foto y unos hexágonos.

Holguras: foco ↔ lado **10.4 px**, lado ↔ flecha **14 px**. Sin desbordes.

---

## 3 · El ancho del hexágono sale de una cuenta, no del ojo

```css
--pd-col: calc((min(100vw - 2*var(--pd-pad), var(--pd-max)) - var(--pd-gap)) / 2);
--pd-w:   min(15vw, calc((var(--pd-col) * .5 - var(--pd-arrow) - 18px) / 1.19));
```

**Es el mínimo entre lo que se querría y lo que CABE.** De media columna hay que
descontar la flecha y algo de aire; lo que quede tiene que dar para el
**medio-vano** del carrusel:

```
medio-vano = desplazamiento + escala/2 = 0.90 + 0.58/2 = 1.19 anchos de celda
```

Despejado, sale el techo. **Esto es lo que deja subir el `vw` sin miedo** —
sabiendo que en ningún ancho el vecino se va a meter por debajo de la flecha. Con
el número suelto, subirlo era apostar.

**El `1.19` va escrito y no derivado** porque `--pd-shift` es un porcentaje y CSS
no puede dividir por él. Si esos dos tokens se tocan, este número se toca con
ellos — por eso están anotados a un palmo el uno del otro.

### ⚠️ Los 18 px de aire son 8 de holgura y 10 de BARRA DE SCROLL

`100vw` incluye la barra y la sección no. A 1440 con barra clásica, `--pd-col` se
pasaba 7.5 px y **el vecino acababa a 6 px de la flecha en vez de a los 14 que
decía la cuenta** — medido. No hay forma limpia en CSS de restar la barra, así
que se reserva.

### En teléfono cambia UNA variable, no la fórmula

```css
--pd-col: min(100vw - 2*var(--pd-pad), var(--pd-max));   /* la columna es TODA */
--pd-w:   min(30vw, calc((var(--pd-col)*.5 - var(--pd-arrow) - 14px) / 1.19));
```

La misma cuenta con la única variable que cambia: aquí la columna del carrusel es
la retícula entera. **Sin suelo a propósito** — por debajo de ~340 px el hexágono
se queda pequeño, y eso es preferible a que la flecha le muerda una esquina.
Encogerse se lee como una pantalla estrecha; solaparse, como un fallo.

---

## 4 · El hexágono

```css
clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
--pd-ratio: 1.1547;    /* 2/√3 */
```

**Punta arriba**, y la proporción es la del hexágono **regular** — 2/√3 =
1.1547. Verificado: 249.4/216 = **1.1547** clavado. El 25 % y el 75 % son los
cuatro vértices laterales.

**`clip-path` y no una máscara ni un cuadrado girado:** recorta la caja entera,
así que la foto de dentro sale con forma de hexágono en vez de quedar un hexágono
dibujado encima de una foto rectangular.

### La celda es `<GlassSurface variant="sheet">`, no un `<button>` pelado

Y esto **no es preferencia, es obligatorio.** `--lg-spec`, `--lg-ang` y
`--lg-elev` viven en `.av-glass`, **no en `:root`** — sólo el radio está ahí. Sin
la clase del material esas variables no resuelven, y **una declaración con una
custom property sin resolver es inválida en tiempo de cálculo: el navegador la
tira entera y en silencio.**

El anillo salía `background-image: none` y la elevación `filter: none` — o sea
hexágonos sin filo y sin sombra, sin un aviso en consola. Medido en el DOM.

`sheet` apaga la lente (`--lg-lens-on: 0`), así que `useGlassLens` se rinde al
montar y **no crea ni el nodo `<filter>` ni sus observadores**. Son 14 celdas: el
presupuesto del material es de ≈9 instancias **con lente**.

### ⚠️ `--pd-elev` se declara EN LA CELDA, no en `.pd`

Mismo problema por otra puerta, y costó un `filter: none` medido. **Un `var()`
dentro de una custom property se sustituye donde la propiedad se DECLARA, no
donde se usa**: el valor computado de `--pd-elev` es su valor especificado con
las variables ya resueltas.

En `.pd` no existe `--lg-elev`, así que el token nacía inválido, se heredaba
vacío, y `filter: var(--pd-elev)` caía al valor inicial — `none`.

Declarado en la celda, que sí es `.av-glass`, resuelve, y las tres reglas que lo
usan —base, vecino y foco de teclado— lo comparten.

### El anillo es un polígono CON AGUJERO

Se traza el hexágono exterior y después el interior, y `evenodd` deja pintado
sólo lo que hay entre los dos. Así el filo tiene **grosor constante en toda la
vuelta**, incluidas las diagonales — que es donde la máscara de `padding` del
material no puede seguir a un polígono.

Los factores del hexágono interior no son mágicos: meter los lados `t` hacia
dentro en un hexágono regular da otro semejante, y como el alto es 2/√3 del
ancho, la reducción vertical es `t · 1.1547` en cada punta y `t · 0.5774` en cada
hombro.

Va a `z-index: 4`, **por encima de `__body`** (que es la capa 3). Estuvo como
fondo de la celda —debajo del vidrio— y el velo es translúcido: el degradado
blanco se veía **a través** de toda la celda y no sólo en el margen.

**La elevación es la del PANAL**, copiada valor por valor de `.ph__cell`: dos
capas por `--lg-elev`. Verificado idéntica byte a byte contra el panal. Va en
`drop-shadow` y no en `box-shadow` porque el segundo sigue la caja **rectangular**
y dibujaría una sombra cuadrada detrás de un hexágono.

---

## 5 · Las celdas y su encaje

Las catorce salen de **`assets/js/sneakers.js`** — el mismo catálogo que alimenta
a `<ProductReel>`. El díptico las enseña recortadas en hexágono y el rollo a
pedestal, pero el producto es el mismo y **el dato vive en un solo sitio**.

### Aquí hubo una regla por EXTENSIÓN, y se fue

Cuando estas celdas llevaban dos fotografías editoriales con un recorte suelto en
medio, había que distinguirlas para encajarlas: la fotografía a sangre (`cover`),
el recorte entero y centrado (`contain`). Lo decidía la **extensión** — un `.png`
en un catálogo de zapatillas está ahí porque lleva alfa.

Con el catálogo real esa regla no sólo sobra: **sería falsa.** Los catorce
recortes son `.webp`, así que la extensión diría «fotografía» de todos y les
cortaría la puntera contra los biseles. Lo que era una señal pasó a ser una
coincidencia del formato, y una señal que ya no señala se quita — con ella se fue
la clase `is-recorte`.

### El encaje sale de la geometría

```css
.pd__shot { object-fit: contain; padding: 0 5%; }
```

Los recortes vienen en **caja unión 1160 × 599** (proporción 1.94, muy tumbada) y
el hexágono del foco mide 216 × 249. Con `contain`, la imagen encaja **por
ancho** y deja la tinta centrada **del 29.9 % al 70.1 %** de la celda.

Los hombros del hexágono están al **25 % y al 75 %**: el zapato cae entero dentro
de la banda que tiene el ancho completo y no se acerca a ninguna punta. **No hace
falta relleno vertical** — eso es geometría, no ajuste a ojo.

El 5 % lateral sí: la tinta llena el 97.5 % de la caja unión, así que sin él el
zapato quedaría a 2 px de los lados. Con el 5 % son unos 9 px de aire por lado.

### El cuerpo del vidrio va en absoluto

`__back`, `__veil` y `__spec` ya son absolutos y llenan la celda; **`__body` es
la única capa en flujo**, así que sin `position: absolute; inset: 0` se encogería
al tamaño de la imagen y la celda se quedaría con el hexágono a medio llenar.

---

## 6 · Los tres puestos y el giro

**Tres, no cinco.** La columna mide la mitad de la página, así que a partir del
segundo vecino la celda cae debajo de la flecha.

| puesto | escala | desenfoque | opacidad |
|---|---|---|---|
| foco | 1 | — | 1 |
| vecino | `0.58` | `5px` | `0.50` |
| fuera | 0.58 | — | 0, `visibility: hidden` |

El resto sigue en el DOM —para que la foto esté decodificada cuando le toque—
pero fuera del encuadre. **`visibility` y no `display`**: la foto sigue
decodificada, así que al entrar no parpadea.

`--pd-shift: 90%` es el desplazamiento del vecino y va en **% del ancho de la
propia celda**, no de la columna: `translateX` en porcentaje se resuelve contra
la caja de borde del elemento **sin escalar**, y va primero en la cadena — así
que 90 % es 90 % de `--pd-w` pase lo que pase con el `scale` que viene detrás.

**El 90 sale de una cuenta:** con el vecino a 0.58, los bordes quedan separados
`0.90 − 0.5 − 0.29 = 0.11` anchos. Menos de eso y los hexágonos se tocan por los
hombros.

### La distancia cíclica

```js
let d = i - idx
if (d >=  total/2) d -= total
if (d <  -total/2) d += total
```

Sin esto, al pasar de la última a la primera la celda cruzaría todo el encuadre
en vez de entrar por el lado que le toca.

**`>=` y no `>` en el primer tope:** con un número **par** de celdas la que cae
justo a la mitad está a la misma distancia por los dos caminos, y sin esto se
quedaba siempre a la derecha con el puesto izquierdo vacío. **Hoy son catorce, o
sea par: el caso se da.**

---

## 7 · El fondo y la lámina

### El fondo es negro, y es una decisión de PÁGINA

`#050506` — la primera parada de la rampa `negro` de marca. **Tuvo el lila de las
fotos (`#c4b3e9`) y se cambió.**

El motivo no es de pieza sino de página: rollo, panal y díptico van seguidos y
cierran con el pie, que también es negro. Con cuatro planos del mismo tono la
costura entre ellos desaparece y el final de la página se lee como un bloque; con
uno lila en medio, cada cambio de sección era un corte.

**Trae grano**, por el mismo motivo que el panal: un plano liso no le da nada que
doblar a la lente, así que el vidrio de las flechas se leería como cristal
limpio. Va en un `::before` porque necesita **opacidad propia**, y **debajo de
todo en orden de pintado** — un `backdrop-filter` sólo ve lo que se pintó antes
que él.

### Y con el fondo se fue la sombra de la lámina

La lámina llevaba una sombra morada (`rgba(46,28,84)`), sacada del lila que este
componente tenía de fondo. **Con el plano ya en negro dejó de ser una sombra:**
un morado es **más claro** que `#050506`, así que en vez de hundir la lámina le
pintaba un halo alrededor.

Y no se sustituye por una neutra: **sobre negro no hay nada que hundir.** Lo que
despega la lámina del fondo es su propio blanco, que ya es el contraste más alto
de la página.

### La lámina

```css
background: #FFFFFF;
border-radius: clamp(14px, 1.5vw, 26px);   /* 21.6 px a 1440 */
overflow: hidden;
```

**La foto va a sangre** — sin relleno. Hubo un paspartú blanco de ~16 px y se
quitó: la idea era leer la foto como copia montada, pero con una fotografía a
color que llega hasta sus propios bordes el filo blanco no montaba nada,
recortaba.

El blanco **se queda de fondo aunque no se vea**: es lo que hay debajo mientras
la foto carga, y una tarjeta que aparece en blanco y se rellena se lee mejor que
un agujero por el que asoma el fondo.

`overflow: hidden` porque ahora es él quien recorta: sin relleno, las esquinas de
la foto son las de la tarjeta, y **una imagen no sigue el radio de su padre por sí
sola**.

### ⚠️ `.pd__plate` NO lleva `height: 100%`

Con la fila ya definida, `align-items: stretch` le da un alto definitivo — y hace
falta que venga de ahí y no de un porcentaje: **un `height: 100%` deja de estirar
el elemento** (pasa a tener alto propio) y la foto de dentro vuelve a medir contra
algo indefinido.

### ⚠️ La fila de la retícula va ESCRITA

```css
grid-template-rows: minmax(0, 1fr);
```

Sin ella la fila es implícita y `auto`, o sea que la mide su contenido — y el
contenido es una foto cuyo `height: 100%` no resuelve contra una fila indefinida,
así que cae a su alto intrínseco. **Medido a 1440: la fila daba 820 px dentro de
una retícula de 630 y la lámina se salía 190 px por abajo**, que el `overflow:
hidden` de la sección recortaba en silencio.

El `0` del `minmax` es la otra mitad: `1fr` por sí solo tiene mínimo automático y
volvería a crecer con el contenido.

---

## 8 · El aire, y por qué tiene un token

```css
--pd-aire: 42px;
padding: clamp(var(--pd-aire), 4.6vh, 64px) var(--pd-pad);
```

La sección lleva `overflow: hidden` por el grano, así que **el relleno tiene que
ser mayor que el alcance de la sombra** o la sombra sale cortada en recto — que se
lee peor que no tener sombra.

Hoy la lámina no lleva sombra, pero el suelo se queda: el mínimo del relleno
vertical sigue siendo un número con un porqué, y si alguien le devuelve la sombra
a la lámina, **la cuenta ya está escrita al lado**.

---

## 9 · Lo que le pide al anfitrión

| token | para qué |
|---|---|
| `--lg-spec` · `--lg-ang` | el anillo especular de la celda |
| `--lg-elev` | la elevación de la celda |
| `--av-on-glass-strong` | tinta sobre el vidrio de las flechas |

**Componentes:** `<GlassSurface>` — 14 celdas en `sheet` y 2 flechas con lente.
**Datos:** `assets/js/sneakers.js` (compartido con el rollo) y
`assets/js/backgrounds.js` (el grano).
**Assets:** `public/products/diptico/columna.jpg` (la lámina) y
`public/products/sneakers/*.webp` (las catorce celdas).

---

## 10 · Accesibilidad

- La sección es `role="group"` con `aria-roledescription="carrusel"`.
- Las celdas son `<button>` con `aria-label` que cambia según el puesto: «Ver
  detalle» en el centro, «Traer al centro» en los lados.
- Las que están fuera del encuadre llevan `aria-hidden` y `tabindex="-1"`.
- **El foco del teclado no puede ir por `outline`:** el `clip-path` lo recorta y
  no se ve nada. Se marca con un halo dentro del mismo `filter` que la elevación,
  que sí sobrevive al recorte.
- El arrastre horizontal es de la pieza (`touch-action: pan-y`); el vertical
  sigue siendo de la página.

---

## 11 · Qué revisar al reconstruir

- [ ] **Las dos columnas miden lo mismo** — 44.7 % cada una a 1440, no 50 %.
- [ ] **El hexágono cumple 1.1547** de proporción. Si no, se estiró y los biseles
      dejan de encajar.
- [ ] **La celda es `GlassSurface`**, no un `<button>`. Si el anillo sale
      `background-image: none`, es esto.
- [ ] **`--pd-elev` está declarado en la celda**, no en la sección.
- [ ] **El anillo va a `z-index: 4`**, por encima del cuerpo.
- [ ] **La fila de la retícula es `minmax(0, 1fr)`.** Si la lámina se sale por
      abajo, la fila volvió a ser `auto`.
- [ ] **La lámina no lleva `height: 100%`.**
- [ ] **Holguras:** foco ↔ lado ≈ 24 px y lado ↔ flecha ≈ 16 px a 1440. Si la
      segunda baja de 10, alguien tocó el `vw` sin la cuenta.
- [ ] **La tinta del zapato cae entre el 25 % y el 75 %** del alto del hexágono.
- [ ] **Sin desborde horizontal** en teléfono.

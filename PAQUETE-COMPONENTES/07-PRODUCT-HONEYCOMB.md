# 07 · `<ProductHoneycomb>` — el panal

> **Estado: CONSTRUIDO y verificado.** Todos los números están medidos en el
> navegador, no calculados.

**Sitio:** en la landing, justo debajo de `<ProductAccordion />`.
**Archivo:** `components/product/ProductHoneycomb.vue` (447 líneas)
**Sí usa liquid glass**, con la variante `sheet` — y con el filo reproducido a
mano por un motivo que no es opcional. Ver §7.

---

## 1 · Qué es

Treinta y cuatro celdas hexagonales de vidrio sobre negro sólido, cada una con un
producto. Las filas pares van desplazadas media celda, que es lo que convierte una
retícula en un panal.

```
fila 1   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡      9
fila 2    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡       8 · desplazada media celda
fila 3   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡      9
fila 4    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡       8      = 34
```

En teléfono son **4 columnas y diez filas — las mismas 34 celdas**, ninguna se
queda fuera.

Es una pieza de **catálogo, no de ficha**: enseña variedad de un vistazo. No hay
nombre ni precio en la celda — a 150 px no caben y no es lo que se mira. Va
después del acordeón porque el acordeón enseña cuatro productos de cerca y el
panal enseña que hay muchos más; al revés son dos cuadrículas seguidas.

---

## 2 · API

```vue
<ProductHoneycomb @pick="onCelda" />
```

| Prop | Tipo | Defecto | Qué hace |
|---|---|---|---|
| `items` | `Array` | 34 rutas | las fotos, en orden de lectura |
| `bg` | `String` | `'#050506'` | el plano de detrás. **Sólido** — ver §9 |
| `grain` | `Number` | `4` | el grano, 0–100 |

| Evento | Payload | Cuándo |
|---|---|---|
| `pick` | `id` | se pulsa una celda |

`items` acepta **dos formas** y es a propósito: una cadena es una ruta suelta —el
caso del prototipo, donde no hay catálogo— y un objeto `{ src, alt, id }` es lo que
mandará el backend. El día que haya ids reales no se toca el componente, sólo lo
que se le pasa.

---

## 3 · El hexágono

**Punta arriba** (*pointy-top*), que es el de lado plano girado 30°:

```css
clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
--ph-ratio: 1.1547;   /* 2/√3 */
```

El 25% y el 75% son los hombros: un hexágono regular con punta arriba tiene sus
cuatro vértices laterales a un cuarto y a tres cuartos del alto.

**La proporción tiene que ser la regular.** Con punta arriba, el desplazamiento de
media celda y el paso vertical de ¾ sólo encajan si el hexágono no está deformado;
estirarlo abre huecos en rombo entre filas.

> Estuvo primero con **lado plano** y proporción `.96`. Se cambió a punta arriba
> por diseño, y el giro trajo consigo el paso vertical (§5): los de lado plano no
> encajan entre sí, se apilan.

**`clip-path` y no una máscara SVG ni un cuadrado girado**, porque `clip-path`
recorta *también* el `backdrop-filter`: lo que queda es vidrio con forma de
hexágono, no un hexágono dibujado encima de un vidrio rectangular. Con cualquier
otra técnica el desenfoque del fondo seguiría siendo el del rectángulo y se vería
asomar por los cortes.

---

## 4 · Las filas nacen de `flex-wrap`

**No hay elementos «fila».** Las celdas son una lista plana y el número de
columnas es el **ancho del contenedor**:

```css
.ph__comb {
  width: calc(var(--ph-cols) * var(--ph-w)
              + (var(--ph-cols) - 1) * var(--ph-gap) + .5px);
  margin-inline: auto;
  display: flex;
  flex-wrap: wrap;
}
```

Se le da exactamente lo que ocupan `--ph-cols` celdas con sus huecos, así que la
siguiente no cabe y `flex-wrap` la baja. **Cambiar de medida es cambiar
`--ph-cols`**; no hay que tocar el marcado ni esconder nada.

> **El medio píxel** es holgura contra el redondeo: el navegador calcula en
> fracciones y una fila que suma *exactamente* el ancho disponible puede perder su
> última celda por una milésima. Con `.5px` no hay empate posible, y sigue estando
> muy lejos de dejar entrar una celda de más.

### Por qué esto importa (y qué se hizo mal antes)

La primera versión tenía las filas como **elementos**, con el reparto en un prop.
En escritorio bien; en teléfono, nueve por fila no caben en 390 px, así que
**escondía celdas con CSS y dejaba doce zapatos fuera**. Eso no era una
adaptación: era una pérdida.

Cambiar el reparto por medida obligaba a decidirlo en JS, y eso mueve la decisión
al cliente — el servidor no sabe el ancho, pinta un reparto y el navegador lo
corrige al hidratar. Con el ancho del contenedor, la decisión se queda en CSS y
las 34 celdas se pintan siempre en las dos medidas.

**Lo que cuesta:** desaparece el prop `pattern`. Con celdas que fluyen, el
desplazamiento se marca con `:nth-child` y un selector no puede leer una custom
property. Los dos números viven en el CSS y **tienen que cuadrar entre ellos**
(§6).

---

## 5 · El solape vertical

Un panal de verdad tiene las filas pisadas **un cuarto del alto**: con punta
arriba, el triángulo superior de un hexágono encaja exactamente en el hueco que
dejan dos de la fila de arriba, y ese encaje es lo que convierte tiras en panal.

```css
--ph-pull: calc(var(--ph-h) * .25 - var(--ph-gap));

.ph__cell  { margin-bottom: calc(var(--ph-pull) * -1); }
.ph__comb  { row-gap: 0; padding-bottom: var(--ph-pull); }
```

**Encoge la LÍNEA, no la celda.** En un contenedor con `wrap`, el alto de cada
línea es el del mayor de sus elementos *más sus márgenes*: con el margen negativo,
cada línea mide `alto − pull`, que es justo el paso de ¾.

Y el `padding-bottom` del panal devuelve el hueco que el margen de la última fila
se lleva — sin él, la fila de abajo se sale del contenedor y se la come el
`overflow`.

### ⚠️ `gap` no admite valores negativos

Estuvo escrito como `gap: calc(var(--ph-h) * -.25 + var(--ph-gap))`. **La
declaración entera se descarta en silencio** y las filas quedan apiladas sin
encajar — medido: paso de 189 px donde tenía que ser 142. Por eso `column-gap` va
suelto y el solape va en `margin-bottom`.

---

## 6 · El desplazamiento de las filas pares

Se le da a la **primera celda de cada fila par**, y ella arrastra a las demás:

```css
.ph__comb > :nth-child(17n + 10) {   /* escritorio, 9 columnas */
  margin-left: calc((var(--ph-w) + var(--ph-gap)) * .5);
}
```

| columnas | período `2n−1` | primer desplazado `n+1` | selector |
|---|---|---|---|
| **9** | 17 | 10 | `17n + 10` |
| **4** | 7 | 5 | `7n + 5` |

Una fila impar y una par suman `2 × columnas − 1` celdas: ése es el período. Y la
primera de la fila par es la `columnas + 1`.

**Media celda más medio hueco**, no media celda: el vértice de abajo tiene que
caer en el centro del hueco de arriba, y ese centro está a medio **paso**.

> Estos dos números y `--ph-cols` **no se pueden derivar uno del otro** — un
> selector no lee custom properties. Van juntos y con una nota entre ellos. Si se
> cambia el número de columnas hay que cambiar los tres.

---

## 7 · El filo, y por qué se reproduce en vez de encenderse

**Ésta es la parte que hay que entender antes de tocar nada.**

Sobre un fondo liso, de las cuatro capas del vidrio sólo trabaja una: **el filo**.
El desenfoque de un plano es el mismo plano y la lente refracta lo mismo que
había. Así que la pieza se sostiene entera sobre el filo especular, que es
exactamente la iluminación que tienen la barra y los demás componentes.

Y aquí está el problema: **el filo del material se dibuja con una máscara sobre el
`border-radius`**. Sobre un `clip-path` de polígono no sigue al hexágono — queda
un anillo rectangular cortado en diagonal. **No es que no valga: es que no
puede.**

Se reproduce sobre el hexágono con **sus mismos valores**, leídos del material y
nunca redefinidos:

```css
.ph__cell::after {
  position: absolute; inset: 0;
  z-index: 4;                 /* por encima de `__body`, que es la capa 3 */
  background: linear-gradient(var(--lg-ang), /* las once paradas de glass.css */ …);
  clip-path: polygon(evenodd,
    50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%,
    50% calc(var(--ph-rim) * 1.1547),
    calc(100% - var(--ph-rim)) calc(25% + var(--ph-rim) * .5774),
    …);
}
```

### El anillo es un polígono con agujero

Se traza el hexágono exterior y después el interior, y **`evenodd`** deja pintado
sólo lo que hay entre los dos. Así el filo tiene grosor constante en toda la
vuelta, **incluidas las diagonales** — que es donde la máscara del material falla.

Los factores del hexágono interior no son mágicos: meter los lados `t` hacia
dentro en un hexágono regular da otro semejante, y como el alto es 2/√3 del ancho,
la reducción vertical es `t · 1.1547` en cada punta y `t · 0.5774` en cada hombro.
Verificado: con `--ph-rim: 1.5px` resuelven a `1.732px` y `0.866px`.

`--ph-rim` es **1.5 px**, el mismo `padding` con el que el material dibuja su
anillo: la celda no tiene un filo más gordo ni más fino que la barra.

### ⚠️ El anillo va ENCIMA, no detrás

Estuvo puesto como **fondo de la celda**, o sea por debajo de las capas del
vidrio. Y el velo es translúcido (`.38`) y el desenfoque además recoge lo que hay
detrás, así que ese degradado blanco **se veía a través de toda la celda**: no
iluminaba el borde, iluminaba el zapato por dentro, y la pieza se leía como un
degradado y no como un filo.

El material lo pinta en su capa superior (`__spec`) por esta misma razón.

### Lo que NO se reproduce

- **El resplandor interior** (`box-shadow: inset` del material). Los `inset`
  siguen la caja **rectangular**: sobre un hexágono aparece sólo en los dos lados
  rectos y como luz metida hacia dentro — lo contrario de lo que se quiere.
- **La sombra exterior** (`box-shadow` de `.av-glass`). También rectangular, y el
  `clip-path` la borra entera. Se sustituye por `drop-shadow`, que **sigue el
  canal alfa** —o sea la silueta ya recortada— con los números de `--lg-elev`. Lo
  que se pierde en la traducción es el `spread` negativo, que `drop-shadow` no
  tiene: se compensa con radios más cortos.

> **Verificado:** el degradado que compone la celda es **idéntico parada por
> parada** al anillo de la barra — mismo `--lg-spec: 0.60`, mismo `--lg-ang`,
> mismas once paradas. Si el filo del sistema cambia, éste cambia con él.

---

## 8 · El coste — `sheet` no es opcional aquí

Son **34 instancias** de vidrio contra un presupuesto medido de **≈9 con lente**.
Cada lente es un `feDisplacementMap` con su mapa `data:` URI propio.

```vue
<GlassSurface variant="sheet" tag="button" …>
```

`sheet` (doc 01 §5) apaga la lente y el marco. Y **la lente que quita no se vería
ni encendida**: sobre un plano no hay detalle que refractar. El marco apagado es
lo que deja sitio al anillo reproducido de §7 — si estuviera encendido, el anillo
rectangular del material se pintaría encima del hexagonal.

> **Medido en el navegador: 40 instancias de vidrio en la página y 14 filtros
> SVG.** Las 34 celdas no crean ninguno. El corte va en `onMounted`, así que no se
> crea ni el nodo `<filter>` ni los tres observadores por celda.

---

## 8b · El margen lateral es el del sistema

```css
padding: clamp(16px, 2.6vw, 34px) var(--av-gutter);
```

El lateral era `clamp(10px, 2vw, 26px)` —el más estrecho de las cinco piezas de
la página— y ahora es `--av-gutter`. El vertical se queda propio y no es
descuido: el panal **no reserva barra arriba ni suelo abajo**, a diferencia del
acordeón y del rollo, así que su aire vertical no tiene por qué ser el de ellos.

Ojo con la tabla del §14: la fila «margen lateral 24» es de antes de este cambio.
A 1440 el número de hoy es **57.6**. Ver doc 04 §3b.

---

## 9 · El fondo

**Negro sólido `#050506`** — la primera parada de la rampa `negro` de marca, no un
negro inventado. Más el **grano al 4 %**, en un `::before`.

El grano **no es decoración**: `backgrounds.js` lo dice desde antes de que
existiera este componente — *«sobre `negro` le da al vidrio algo que refractar»*.
Y va **debajo** de las celdas en orden de pintado; si fuera encima, el
`backdrop-filter` no lo recogería, porque un backdrop sólo ve lo que se pintó
antes que él. De ahí el `z-index: 1` del panal.

Va en un `::before` y no como segunda capa de `background` porque necesita
**opacidad propia**, y un `background-image` no la tiene.

### El recorrido, porque explica la pieza

1. **Gris plano `#3A3A3A`.** Razonamiento: una foto debajo convertiría 34 vidrios
   en ruido. Cierto — pero pasarse al plano fue frenar de más: sobre un color
   plano el vidrio no existe, y las celdas parecían hexágonos oscuros.
2. **Rampa de marca + grano.** El material volvió, pero la rampa competía con el
   filo.
3. **Negro sólido + el filo bien puesto.** La iluminación hace el trabajo, que es
   lo que se pidió.

---

## 10 · Los datos y los assets

`public/products/panel/` — **26 `.webp`**, ~45 KB cada uno, 136 KB en total.

**Todos en la misma caja unión: 182 × 134**, con 12 px de margen a cada lado. El
margen no es estético: dos de los originales venían a sangre y habrían tocado el
borde del hexágono mientras los otros 24 tenían aire — la misma lección que el
Chicago del acordeón (doc 06 §13).

### 26 fotos en 34 celdas

Las ocho repetidas **no van pegadas a su original**: se toman con paso 3 (índices
1, 4, 7, 10…) para que ninguna copia caiga al lado ni justo debajo de su gemela,
que es donde el ojo las caza.

> Es una solución de **prototipo**. Con catálogo real desaparece sola: se pasan 34
> ids y ya está.

La `:key` del `v-for` es la **posición**, no el id: con fotos repetidas hay ids
repetidos, y dos `:key` iguales rompen el `v-for`.

La foto va al **78 %** del ancho de la celda: el hexágono sólo tiene su ancho
completo en el centro, y una foto a ras de caja se saldría por los cuatro biseles.
`width`/`height` van declarados en el HTML — una imagen `lazy` sin proporción
intrínseca mide **cero** hasta que llega el fichero.

---

## 11 · Accesibilidad

| Qué | Cómo |
|---|---|
| La celda | `<button type="button">`, no un `<div>` con handler |
| El `alt` | **vacío a propósito** — ver abajo |
| Foco | no por `outline`: el `clip-path` lo recorta y no se ve nada |
| Movimiento | `@media (prefers-reduced-motion: reduce)` apaga la transición |

El `alt` vacío no es un descuido: el panal es **decorativo** mientras no haya
nombre real detrás de cada celda. Un lector que anuncie treinta y cuatro veces
«zapatilla» no informa, estorba. Con backend, el nombre entra por `items` y el
`alt` deja de estar vacío solo.

El foco se marca con la misma elevación del hover más un halo en `drop-shadow`,
que sí sobreviven al recorte.

---

## 12 · Dependencias — el contrato

La superficie completa, medida sobre el código.

### Imports — 2

| Import | Qué se usa | ¿Evitable? |
|---|---|---|
| `~/assets/js/colorways` | `COLORWAYS`, sólo para la forma `{ id }` | Sí, si `items` siempre trae `src` |
| `~/assets/js/backgrounds` | `GRAIN_URL`, `GRAIN_DEFAULT` | Sí, a costa del grano |

### Componentes — 1

`<GlassSurface>` con la variante **`sheet`** (doc 01 §5). Obligatoria — ver §8.

### CSS del anfitrión — 3 tokens, todos del material

| Token | Usos | Para qué |
|---|---|---|
| `--lg-spec` | 11 | las once paradas del anillo |
| `--lg-elev` | 6 | las dos capas de sombra |
| `--lg-ang` | 1 | la diagonal del anillo |

Se **leen**, nunca se redefinen. **No usa ni un solo `--av-*`**: el panal no
depende de `tokens.css` para nada. Y de las clases del material sólo toca
`.av-glass__body`, para que llene la celda y centre la foto.

### Para llevárselo a otro repo

```
components/product/ProductHoneycomb.vue
public/products/panel/*.webp          (26 ficheros)
```

…más `GlassSurface` y `backgrounds.js`, que ya vienen por los docs 01 y 04. **No
hay CSS global propio de esta pieza.**

---

## 13 · Trampas que ya costaron una vez

| Síntoma | Causa real |
|---|---|
| El filo iluminaba el zapato por dentro y parecía un degradado | el anillo estaba de **fondo de la celda**, detrás de un velo translúcido |
| Las filas no encajaban (paso 189 en vez de 142) | **`gap` no admite negativos**; la declaración se descarta en silencio |
| Doce zapatos no aparecían en teléfono | las filas eran elementos y CSS **escondía** las que no cabían |
| El desplazamiento medía 91 px en vez de 61 | un `margin-left` **se sumaba** al centrado del contenedor |
| Las celdas parecían hexágonos oscuros, no vidrio | fondo de color **plano**: no hay nada que desenfocar ni refractar |
| El panal parecía llevar «otro liquid» | filo dibujado a ojo en vez de con los valores del material |

---

## 14 · Medidas verificadas

| | 1440 | 1280 | 390 | 375 |
|---|---|---|---|---|
| celdas | **34** | 34 | 34 | 34 |
| patrón | 9/8/9/8 | 9/8/9/8 | 4/3…/2 (10 filas) | igual |
| escondidas | 0 | 0 | **0** | 0 |
| celda | 144×166 | 128×148 | 88×101 | 84×97 |
| desplazamiento | — | 68 (= paso/2) | 46 | — |
| paso vertical | — | 120 (= ¾·148 + 8) | — | — |
| margen lateral | 24 | — | — | 11 |
| desborde horizontal | 0 | 0 | 0 | 0 |

Los arranques de fila caen en **1 · 10 · 18 · 27** (escritorio) y
**1 · 5 · 8 · 12 · 15 · 19 · 22 · 26 · 29 · 33** (teléfono) — exactamente lo que
asumen las fórmulas `17n+10` y `7n+5`.

Y el zapato queda a **16 px del borde** de la celda, con un anillo de 1.5: el filo
no lo toca.

---

## 15 · Qué revisar al reconstruir

1. **`clip-path: polygon(evenodd, …)`** es lo único del componente sin
   alternativa: sin `<fill-rule>` no hay anillo hexagonal. Está soportado en los
   navegadores actuales (verificado con `CSS.supports`), pero conviene comprobarlo
   en el objetivo antes de dar por hecho el filo.
2. **El día que el material sepa dibujar filos no rectangulares**, el `::after` de
   §7 se borra y se enciende `--lg-frame`. Está construido para poder retirarse.
3. **Los tres números que tienen que cuadrar** (§6): `--ph-cols` y los dos
   `:nth-child`. Es el único sitio del componente donde algo se puede desincronizar
   en silencio.
4. **`pick` no hace nada todavía.** Cuando exista `/producto/:id` es un
   `navigateTo`, igual que en el acordeón.
5. **Las repeticiones de §10 son de prototipo.** Con 34 productos reales se van
   solas.

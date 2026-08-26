# 06 · `<ProductAccordion>` — el acordeón de productos

> **Guía de migración.** Todo lo necesario para reconstruirlo desde cero,
> incluidas las decisiones que costaron y las trampas que ya se pisaron una vez.
>
> **Archivos:** `app/components/product/ProductAccordion.vue` (328 líneas, el
> reparto) · `app/components/product/ProductAccordionPanel.vue` (1174 líneas, el
> recorte y la ficha).
> **Depende de:** `assets/js/colorways.js` · `composables/useFitText.js` ·
> `<GlassSurface>` · los tokens del anfitrión (§12).

---

## 1 · Qué es

Cuatro planos de color, uno por producto. Al señalar uno se expande y los demás
se reparten lo que queda.

```
reposo         ┌─────┬─────┬─────┬─────┐    25 · 25 · 25 · 25
señalado #2    ┌───┬────────┬───┬───┐       20 · 40 · 20 · 20
detalle  #2    ┌────────────────────────┐    0 · 100 ·  0 ·  0
```

**LA IDEA, y de donde sale todo lo demás:** el panel contraído **recorta** el
producto; al expandirse no lo escala, lo **destapa**. Es una ventana que se abre,
no una foto que crece.

Ésa es la diferencia con el escaparate, que está justo encima: el escaparate
enseña **un** producto y lo hace girar; el acordeón enseña **cuatro** y deja
compararlos. De lo concreto a lo general.

---

## 2 · Proporciones de ocupación

Medidas del DOM, con las transiciones apagadas para leer los estados destino.

### 2.1 · Escritorio — sección 1425 × 1024

| estado | p1 | p2 | p3 | p4 |
|---|---|---|---|---|
| reposo | 356.3 (**25 %**) | 356.3 | 356.3 | 356.3 |
| señalado #2 | 285 (**20 %**) | 570 (**40 %**) | 285 | 285 |
| detalle #2 | 0 | 1425 (**100 %**) | 0 | 0 |

**El cuerpo del panel mide 570 px SIEMPRE** — `--pa-body: 40cqw`, el ancho del
expandido — en los tres estados y en los cuatro paneles. Lo único que cambia es
cuánto de él deja ver el panel:

| estado | panel | cuerpo visible | recortado |
|---|---|---|---|
| reposo | 356.3 | **62.5 %** | 18.75 % por cada lado |
| señalado | 570 | **100 %** | — |
| contraído | 285 | **50 %** | 25 % por cada lado |

Y como el cuerpo va centrado en absoluto, **el recorte es simétrico**: el
producto se cierra por los dos lados a la vez, como una persiana, no se desplaza.

### 2.2 · La ficha del detalle — escritorio

Relleno: **87 px arriba** (el hueco de la barra) · **57 px a los lados**.

| pieza | posición | tamaño | % del ancho |
|---|---|---|---|
| título | 57, 155 | 217.6 × 144.9 | 15.3 % |
| precio | 57, 307.9 | 217.6 × 48 | 15.3 % |
| descripción | 57, 369.9 | 217.6 × 80.6 | 15.3 % |
| **Regresar** | 57, **893** | 164 × 44 | 11.5 % |
| tallas | 1056, 771 | 312 × 104 | 21.9 % |
| **Comprar ahora** | 1204, **893** | 164 × 44 | 11.5 % |
| zapato | 340.5, 173.1 | 743.9 × 677.9 | 52.2 % |
| palabra | 330.2, 282.9 | 764.6 × 376.2 | 53.7 % |

**Las dos salidas comparten línea de base** — `y = 893` las dos, en esquinas
opuestas. Volver y comprar quedan a la misma altura de la mano y no se
confunden.

La rejilla de tallas son **5 × 2** de 56 × 48 con 8 de hueco → 312 × 104.

### 2.3 · Teléfono — 375 × 812

**El acordeón se tumba: filas, no columnas.**

| estado | p1 | p2 | p3 | p4 |
|---|---|---|---|---|
| reposo | 203 (**25 %**) | 203 | 203 | 203 |
| detalle #2 | 0 | 812 (**100 %**) | 0 | 0 |

El cuerpo pasa a tener **alto** fijo: `--pa-body-h: calc(100svh * 0.4)` = 324.8
px, centrado, así que se recorta **60.9 px por arriba y por abajo**. Zapato
461.2 × 453.8. **La palabra gigante se apaga** (`display: none`).

La ficha en teléfono, en una columna (345 px), relleno **87 / 15**:

| pieza | y | tamaño |
|---|---|---|
| **Regresar** | 87 | 164 × 44 — **arriba**, encima del título |
| título | 143 | 217.6 × 27.3 |
| banda del zapato | 178.6 (**22 %**) | alto 324.8 (**40 %**) |
| tallas | 559 | 312 × 104 |
| **Comprar ahora** | 681 | 164 × 44 |

La descripción se apaga: no cabe, y el nombre ya orienta.

---

## 3 · API

```vue
<ProductAccordion
  :items="['nb-sea-salt', 'nb-mushroom', 'nb-dark-mushroom', 'nb-angora']"
  :open="40"
  :initial="null"
  height="100svh"
  blend-from="mind-001"
  @select="id => {}"
  @buy="({ id, size }) => {}"
/>
```

| prop | tipo | por defecto | notas |
|---|---|---|---|
| `items` | Array | **requerido** | ids de `colorways.js`. **3–5**; por encima de 5 el contraído deja de reconocerse |
| `open` | Number | `40` | % del expandido; el resto se reparte |
| `initial` | String | `null` | `null` = reposo, todos iguales |
| `height` | String | `'100svh'` | ver §11 |
| `blendFrom` | String | `''` | id del colorway de la sección de encima |

Los ids que no existen **se caen sin reventar**: un colorway mal escrito deja
tres paneles, no una página en blanco.

**Eventos:** `select` con el id · `buy` con `{ id, size }` — misma firma que el
escaparate y el rollo, para que la página enganche los tres al mismo manejador.

---

## 4 · El reparto — `@property`, y por qué

```css
@property --pa-w {
  syntax: '<length-percentage>';
  inherits: false;
  initial-value: 25%;
}
```

**Sin registrar, una custom property es texto que se sustituye**: el navegador no
sabe que «del 25 % al 40 %» es un recorrido y no puede interpolarlo, así que una
transición sobre ella no tiene nada que animar. Registrada pasa a ser una
propiedad **con tipo**, el navegador la interpola, y `flex-basis` se limita a
seguirla fotograma a fotograma.

**Por eso la transición va sobre `--pa-w` y no sobre `flex-basis`.**

La geometría se calcula en JS porque **depende de cuántos paneles hay y CSS no
sabe contar hermanos**:

```
contraído = (100 − open) / (n − 1)      reposo = 100 / n
```

### El orden de la cascada ES la lógica

```css
.pa > *                              { --pa-w: var(--pa-rest); }
.pa.is-picking > *,
.pa:has(:focus-visible) > *          { --pa-w: var(--pa-shut); }
@media (hover:hover) and (pointer:fine) { .pa:hover > * { --pa-w: var(--pa-shut); } }
.pa > .is-open,
.pa > *:focus-visible                { --pa-w: var(--pa-open); }
@media (hover:hover) and (pointer:fine) { .pa > *:hover { --pa-w: var(--pa-open); } }
.pa.is-detail > *                    { --pa-w: 0%; }
.pa.is-detail > .is-detail           { --pa-w: 100%; }
```

**No se pueden reordenar.** Primero se contraen todos, después se expande el
señalado: al tener la misma especificidad gana el último, y así cualquier motivo
para abrir (tap, foco o ratón) le gana a cualquier motivo para cerrar.

Y el bloque del detalle va **al final, después del hover**: mientras hay un
detalle abierto el ratón no debe poder alterar nada — pasándolo sobre un panel
plegado, la regla de hover intentaría devolverlo al 40 %.

### ⚠️ `:focus-visible`, nunca `:focus-within`

Al hacer clic el navegador deja el foco puesto en el enlace, y `:focus-within`
seguía casando después de soltar el ratón: **el panel se quedaba abierto aunque
el cursor ya estuviera lejos**. En escritorio el ancho lo manda el hover y nada
más.

`:focus-visible` sólo casa cuando el navegador decide que el foco debe verse —
en la práctica, navegando con teclado. Así el teclado sigue abriendo el panel
(sin eso, con `Tab` sólo se vería el recorte) y el ratón no deja nada pegado.

### ⚠️ El hover pide `pointer: fine`, no sólo `hover: hover`

Un portátil táctil cumple `hover: hover` pero no `pointer: fine`, y ahí el hover
deja el acordeón pegado en un panel al salir.

---

## 5 · El recorte — la técnica

```css
.pa__panel { overflow: hidden; }        /* ← el recorte */
.pa__body  { width: var(--pa-body); }   /* ← 40cqw, SIEMPRE */
```

El cuerpo tiene el ancho del panel **expandido** y va centrado en absoluto; el
panel recorta. Así, al contraerse, el producto se recorta por los dos lados en
vez de encogerse.

**`container-type: inline-size` en el padre es lo que hace que `cqw` mida contra
el acordeón** y no contra el viewport. Sin eso habría que usar `vw` y la pieza
tendría que ir a sangre. Hay `@supports` de reserva que cae a `vw`.

### El zapato se mueve con `object-position`, no con `transform`

`transform` mueve la **caja**, así que el zapato se salía por el borde y el
`overflow: hidden` se lo comía. `object-position` mueve la imagen **dentro** de
una caja que no se mueve — imposible que se salga.

---

## 6 · Los tres modos de apertura

| entrada | qué hace |
|---|---|
| **hover** (puntero fino) | expande. CSS puro, sin estado |
| **teclado** (`:focus-visible`) | expande |
| **tap** | **doble**: el primero expande, el segundo abre el detalle |

En táctil no hay hover, así que el primer toque **expande** y el segundo abre —
si no, el primer toque dispararía el detalle sin que se haya llegado a ver lo que
se abrió. Con puntero fino el hover ya expandió, así que el clic abre directo.

**La consulta se hace al tocar y no al montar**: un portátil táctil tiene las dos
entradas y lo que manda es con cuál se acaba de tocar.

Y al abrir el detalle **se escribe el 40 % antes**: en escritorio el panel ya
estaba a 40 por el hover, pero eso es CSS puro — si el detalle arranca sin que el
estado lo diga, el punto de partida de la animación depende de dónde esté el
ratón en ese instante.

---

## 7 · La vuelta, en dos tiempos

```js
function volver() {
  detalle.value = null                                   // 100 → 40, y 0 → 20
  volviendo = setTimeout(() => { activo.value = null }, 520)   // 40 → 25
}
```

Primero se suelta **el detalle**: el panel pasa de 100 a 40 y los otros tres de 0
a 20, así que las cuatro opciones reaparecen mientras la que se miraba sigue
señalada. Es el mismo recorrido de la ida, al revés.

Y cuando esa animación termina se suelta **la selección**. Si se soltaran los dos
a la vez, el panel iría de 100 a 25 de un tirón y los otros de 0 a 25: se vería
un salto, no una vuelta.

**El temporizador se cancela al abrir** — si el usuario vuelve a entrar antes de
que termine, la selección no puede borrarse a media apertura.

`Escape` cierra el detalle. No sustituye al botón: es la salida que un teclado
espera, y una segunda vía si el botón queda fuera de vista.

---

## 8 · La ficha del detalle

Una rejilla de **dos columnas y dos filas**, con las cuatro piezas en cuatro
esquinas:

```css
grid-template-columns: minmax(0,1fr) minmax(0,1fr);
grid-template-rows: var(--pa-back-h) 1fr;
```

| pieza | celda |
|---|---|
| título · precio · descripción | fila 2, col 1, `align-self: start` |
| **Regresar** | fila 2, col 1, `align-self: end` |
| tallas · **Comprar ahora** | fila 2, col 2, `align-self: end` |

### ⚠️ La fila 1 está vacía y tiene que seguir estándolo

`Regresar` estuvo arriba y bajó a la esquina opuesta a `Comprar ahora`. **La
primera fila sigue reservando su hueco** (`--pa-back-h`) aunque ya no haya nadie
en ella: si pasara a `auto` se quedaría en cero y **el título subiría de golpe**
al abrir la ficha.

El alto está en un token que usan la fila y el propio botón, así que no pueden
separarse.

### ⚠️ Fila y columna van ESCRITAS, no automáticas

Al bajar el botón, la fila 1 quedó libre y la colocación automática metió ahí lo
primero que encontró. Pasó **dos veces** y de dos formas distintas:

1. el título subió a `y=87` y `Comprar ahora` se fue a la esquina de **arriba** a
   la derecha;
2. con la fila fijada pero no la columna, el título se cruzó a la **columna
   derecha**, encima de las tallas.

Las tres piezas llevan `grid-row` y `grid-column` explícitos. **Aquí no queda ni
un hueco a la suerte.**

Y la columna izquierda reserva por debajo el alto del botón, para que una
descripción larga no se le meta encima.

### La entrada

```css
@keyframes pa-detail-in { from { opacity: 0 } }
.pa__detail { animation: pa-detail-in .3s ease .25s both; }
```

Entra **cuando el panel ya casi ha terminado de abrirse** — 250 ms de los 500.
Aparecer a la vez que el ancho se lee como que el contenido empuja al panel;
aparecer después, como que el panel le hizo sitio.

**Es una animación CSS y no un `<Transition>`**, y la diferencia importa:
`<Transition>` secuencia con `requestAnimationFrame` y no retira el nodo hasta
que la salida termina. Si no hay fotogramas —pestaña de fondo, salida
interrumpida— el detalle se queda montado encima y no hay forma de volver. Con
`v-if` el desmontaje es inmediato e incondicional y la animación sólo decora la
entrada.

---

## 9 · El redondeo de las tallas — la esquina de Apple

Las tallas **no son píldoras**: llevan la esquina continua de Apple.

Apple tiene dos estilos de esquina y sólo uno es éste. `.circular` es un arco de
círculo, el `border-radius` de siempre. `.continuous` —el de los controles del
sistema— **no es un arco: es una superelipse**, |x|ⁿ + |y|ⁿ = 1 con **n ≈ 4**. El
arco entra en la curva de golpe y deja un punto donde la curvatura salta; la
superelipse la reparte a lo largo del lado, y por eso se ve «continua».

**No hace falta imitarla:** `corner-shape: squircle` está definido en la
especificación como exactamente `superellipse(2)`, y ese 2 es el logaritmo en
base 2 del exponente — o sea n = 2² = **4**. La misma curva.

> El squircle del icono de app es otra cosa: un bezier ajustado a mano, más cerca
> de n ≈ 5. Aquí no aplica — esto son controles, no iconos.

### ⚠️ El radio obliga a una altura

**CSS no deja que dos radios de un mismo lado sumen más que el lado**; si suman
de más, los escala todos por el mismo factor y **en silencio**.

Con las tallas a 40 px de alto, dos radios de 22 suman 44 contra 40: el navegador
pintaba **20** — media caja, o sea una **píldora otra vez**, justo lo contrario de
lo que se buscaba. Medido: 22 pedidos, 20 pintados.

Por eso el alto es **48** y no 40: por encima de 44, que es el mínimo para que 22
quepa entero. De regalo cruza el objetivo táctil de 44 px.

A 48 de alto el máximo posible es 24, así que **22 es el 92 % del camino a la
píldora** — muy blando, con 4 px de lado recto. Si algún día se quiere una
esquina suave pero con rectángulo claro, el número a este alto está entre 14 y
16.

### ⚠️ La forma tiene que llegar a TODAS las capas

`corner-shape` **no se hereda sola**, y el material apila cuatro capas dentro de
cada pieza —desenfoque, velo, especular y cuerpo— todas con `border-radius:
inherit`. Si la forma se quedara en la raíz, las capas seguirían siendo
rectángulos redondeados y asomarían por las esquinas.

Y el `::after` del especular **necesita su propia línea**: es el anillo de 1.5 px
del perímetro y un pseudo-elemento no entra en `:deep(*)`. Sin él, la pieza tiene
cuerpo de superelipse y filo de arco — el defecto que se ve y no se sabe nombrar.

```css
@supports (corner-shape: squircle) {
  .pa__dsize { corner-shape: squircle; }
  .pa__dsize :deep(*) { corner-shape: inherit; }
  .pa__dsize :deep(.av-glass__spec)::after { corner-shape: inherit; }
}
```

**Sólo las tallas.** `Regresar` y `Comprar ahora` pasaron por aquí y volvieron a
píldora: una casilla que se **elige** no puede parecerse a un botón que se
**pulsa**. Y la forma va en un `@supports` aparte del radio a propósito — donde
`corner-shape` no exista queda el rectángulo redondeado de siempre, no una
esquina rota.

---

## 10 · El texto gigante y la tinta

`useFitText(wordEl, body, fill)` — el mismo composable del escaparate, pero
**ajustando sólo por ancho**, sin tope de alto.

**No hace falta el tope aquí**, y conviene saber por qué para no copiarlo del
escaparate por inercia: estos paneles son **altos y estrechos**, así que el
ajuste por ancho ya deja el cuerpo pequeño respecto al alto. Medido: la tinta
ocupa el **14 %** del alto de la caja, con 250 px de aire hasta la línea de
arriba y 236 hasta el texto de abajo. El problema que el tope resuelve en el
escaparate **no se da**.

### ⚠️ VERSALES — la segunda excepción a la regla de la casa

La palabra del fondo va en mayúsculas, y es una excepción consciente:

- **no es texto, es TEXTURA.** Lleva `aria-hidden`, no se puede seleccionar ni
  buscar, y a 217 px de cuerpo detrás de un zapato hace de pared;
- la regla existe para que los títulos y las etiquetas no griten. Una marca de
  agua no grita.

Va por `text-transform`, **no cambiando el dato**: `cw.short` sigue siendo «Sal»
para el `alt` de la foto y para lo que venga después.

`useFitText` no se entera y no tiene que enterarse: mide `scrollWidth` con el
estilo ya aplicado, así que reescala solo con las letras más anchas.

### La tinta de la ficha es BLANCA en todas las medidas

```css
--pa-on-surface:      #FFFFFF;
--pa-on-surface-soft: rgba(255, 255, 255, .72);
```

Y **no** la `--ps-ink` del colorway. Va fuera de cualquier `@media` justamente
para eso: la ficha se lee igual en los cuatro planos y en cualquier pantalla, en
vez de cambiar de tinta según el panel o el ancho.

La jerarquía se mantiene con **alfa y no con otro color** — el nombre a blanco
puro, lo secundario al 72 %, que es el mismo «medio iluminado» del material.

**Tamaños del detalle:** título `clamp(26px, 3.5cqw, 46px)` · precio
`clamp(20px, 2.6cqw, 32px)`. Los dos se mueven **juntos y en la misma
proporción**: el precio no es un dato secundario del título, es la otra mitad de
la decisión.

La etiqueta de las tallas es **etiqueta y no encabezado** — 11.5 px, peso 600,
interletrado **positivo** (`.07em`). A ese cuerpo las letras se apelmazan y
abrirlas es lo que la convierte en etiqueta; al revés que todo lo demás del
sistema, donde el interletrado se cierra.

---

## 11 · `svh`, y no `dvh` ni `vh`

Sólo se nota en un teléfono de verdad:

| unidad | qué mide | qué pasa |
|---|---|---|
| `vh` | viewport con barras **retraídas** | con la barra a la vista, el último panel sale **cortado** |
| `dvh` | viewport **actual**, cambia al scrollear | no corta, pero los cuatro paneles se redimensionan mientras el dedo se mueve: **se ve temblar** |
| `svh` | viewport con barras **desplegadas** | el más pequeño y **el único estable** |

Lo que se paga con `svh` es un hueco cuando la barra se retrae, y para una pieza
de cuatro paneles es mejor trato. En escritorio los tres valen lo mismo.

**El acordeón y el rollo miden lo mismo a propósito** (`100svh` los dos): las dos
piezas se comen el viewport entero, y si no midieran igual la página dejaría de
avanzar de pantalla en pantalla.

---

## 12 · Lo que le pide al anfitrión

| token | hoy | para qué |
|---|---|---|
| `--av-nav-space` | `87px` | hueco de la barra, arriba **y abajo** |
| `--av-action-*` | 164/44/20/13.5/9/16 | medidas de los dos botones |
| `--av-track` | `.05em` | interletrado |
| `--av-on-glass-strong` | `#FFFFFF` | tinta sobre el vidrio |
| `--lg-*` | (el material) | las cuatro capas del vidrio |

`--av-nav-space` lleva **fallback** (`var(--av-nav-space, 87px)`) y es lo único
que la pieza le pide al anfitrión de forma blanda: una custom property que no
existe no resuelve, y una declaración que no resuelve se cae al valor inicial —
el hueco de la barra pasaba a 0 y el título se iba debajo de ella. Con el
respaldo, la pieza se monta sola en cualquier repo.

Se aplica **arriba y abajo por igual**: abajo no hay nada que esquivar, pero un
texto pegado al borde inferior contra otro que arranca 87 px más abajo se lee
torcido. Simétrico se lee como un encuadre.

**Componentes:** `<GlassSurface>` — el CTA de cada card, `Regresar`, `Comprar
ahora` y las diez tallas. Todos con el material **estándar**, velo negro y sin
variantes.

> **Coste:** son doce instancias de vidrio en el detalle. Está por encima del
> presupuesto que fija el material (≈9 por vista) y se acepta porque **sólo
> existen mientras el detalle está abierto y sólo hay un detalle a la vez**. Si
> en un móvil de gama media se nota, lo primero que cae es la lente de las diez
> tallas.

---

## 13 · Accesibilidad, y tres trampas que costaron un 404

### ⚠️ Siempre `<a>`, nunca `<component :is>`

El panel es un `<a>` con destino real **también en detalle**. Alternar la
etiqueta con `<component :is>` hace que Vue **destruya el elemento y cree otro**,
y un elemento recién creado no tiene estado previo del que transicionar: al
cerrar el detalle el panel saltaba del 100 % al 25 % de golpe mientras los otros
tres sí animaban.

En detalle sólo se le quita el `href`: un `<a>` sin él no es enlace, no recibe
foco y no se anuncia como tal — que es justo lo que hace falta, porque ya estás
viendo lo que el enlace llevaba.

### ⚠️ El `href` no se pinta hasta montar

Entre que el servidor manda el HTML y que Vue engancha el manejador hay una
ventana en la que el enlace **ya está pintado y no lo cancela nadie**: un clic
ahí lo sigue el navegador, se va a `/producto/<id>`, que no es una ruta que
exista, y el servidor devuelve **404**.

Por eso el error llegaba con traza de **servidor** y no de cliente: era una carga
entera. En desarrollo la ventana dura lo que tarde Vite en servir los módulos, y
por eso aparecía a ratos y no siempre.

Se arregla desde el HTML, no desde el manejador: **sin `href`, un `<a>` no tiene
comportamiento de activación y no hay nada que cancelar.** Se le pone después de
montar. El primer render del cliente coincide con el del servidor —los dos sin
`href`— así que no hay desajuste de hidratación.

### ⚠️ Los botones de dentro llevan `.stop.prevent`, y las DOS hacen falta

`.stop` corta la subida hasta el `<a>` del panel, que es lo que se quiere: un
botón de cerrar no debe pasar por el elemento que abre. **Pero al cortarla, el
`preventDefault` del panel ya no corre**, y el botón vive dentro del `<a>`: quien
cancela la navegación tiene que ser él mismo.

Y no basta con que en detalle el `<a>` no tenga `href`: el clic borra el detalle,
Vue repinta en el microtask siguiente —antes de que el navegador decida qué hacer
con el clic— y le devuelve el `href`. Para cuando toca la acción por defecto, el
enlace existe otra vez. **`.prevent` lo mata en el sitio.**

### Lo demás

`aria-expanded` sigue al **foco** y no al hover — quien lee ese atributo navega
con teclado, y para él foco y apertura son la misma cosa. Un ratón no consulta
aria.

Los paneles plegados llevan `inert`: los saca del teclado y de los lectores sin
tocar el pintado. **No se ocultan con `visibility` ni `display`** — un ancho de
cero con `overflow: hidden` ya no enseña nada, y quitarlos del pintado sólo
serviría para que la animación de plegado no se viera.

---

## 14 · El empalme con la pieza de encima

`blendFrom` recibe **el id del colorway** de la sección anterior, y el acordeón
difumina ese color sobre el borde de arriba de sus paneles: el corte entre las
dos piezas deja de ser una línea.

Es un **id y no un color a pelo** a propósito: el que está arriba es un colorway,
y pasar su id deja que sea `colorways.js` quien diga de qué color es. Si mañana
el escaparate cambia de zapato, el empalme le sigue solo.

Sin vecino resuelve a `transparent` — el degradado se sigue pintando, pero de
transparente a transparente. **Mejor eso que una regla condicional**: un valor
que resuelve siempre no puede dejar la declaración a medias.

La banda muere exactamente donde empieza el contenido (`--pa-blend-h:
var(--pa-pad-y)`), porque el texto de ahí es blanco al 72 % y sobre la niebla
clara perdería contraste.

**Y en teléfono sólo lo lleva el primero.** En columnas los cuatro tocan el borde
de arriba; en filas, el único que toca lo que hay encima es el primero. Sin eso,
cada fila estrenaría su propia niebla a media pieza — cuatro cortes nuevos en vez
del que se venía a quitar. Se apaga desde **el padre**, que es quien sabe cómo
está tumbado.

---

## 15 · Móvil — el acordeón se tumba

**Filas, no columnas.** Cuatro columnas en 390 px son tiras de 97, y ahí un
zapato no se reconoce: la foto es casi cuadrada, así que lo que la limita es el
lado corto, y en vertical el lado corto es ridículo.

Tumbado, cada fila tiene los 375 px enteros de ancho, el zapato pasa a estar
limitado por el **alto** de su fila —que es mucho más— y encima sobra sitio al
lado para la ficha.

**El reparto no se reescribe:** `flex-basis` mide el eje principal, y al girar el
eje las mismas declaraciones pasan de repartir ancho a repartir alto. 25 · 40 ·
20 se quedan como están.

En el detalle el zapato **sube y se le da una banda explícita**: del **22 % al
62 %** del alto. Arriba sólo hay un botón y dos líneas, así que no hace falta
reservarle media pantalla; el tercio de abajo queda entero para las tallas y el
botón de comprar, que es lo que se toca. En porcentaje y no en píxeles porque el
alto de un teléfono varía mucho y lo que tiene que mantenerse es la proporción
entre las tres zonas.

Y `Regresar` **vuelve arriba**, encima del título: en una columna la esquina de
abajo a la izquierda ya no es una esquina, es el final de una lista larga, debajo
de las tallas y del botón de comprar. Volver es lo que se hace cuando esto no era
lo que se buscaba — tiene que estar antes, no después.

---

## 16 · Qué revisar al reconstruir

Cosas que **se rompen en silencio** y no dan error:

- [ ] **El reparto da 25/25/25/25, 20/40/20/20 y 0/100/0/0.** Si el señalado no
      anima, `--pa-w` no está registrada con `@property`.
- [ ] **El cuerpo mide 570 px (40 cqw) en los tres estados.** Si cambia de ancho,
      el producto está escalando en vez de destaparse.
- [ ] **El recorte es simétrico** — 18.75 % por lado en reposo. Si se recorta por
      un lado, el cuerpo no está centrado.
- [ ] **`Regresar` y `Comprar ahora` comparten `y`** en escritorio.
- [ ] **El título no se mueve al abrir el detalle.** Si sube ~44 px, la fila 1
      dejó de reservar su hueco.
- [ ] **Las tres piezas de la ficha llevan `grid-row` y `grid-column` escritos.**
- [ ] **Las tallas miden 48 de alto y pintan 22 de radio.** Si pintan 20, alguien
      bajó el alto y CSS está recortando el radio en silencio.
- [ ] **El anillo especular de la talla es `squircle`**, no `round`.
- [ ] **El panel es `<a>` siempre**, y sin `href` hasta montar.
- [ ] **Los botones de dentro llevan `.stop.prevent`.**
- [ ] **La altura es `svh`.** Con `dvh` los paneles tiemblan al scrollear en
      teléfono; con `vh` el último sale cortado.
- [ ] **El empalme sólo en el primer panel** cuando está tumbado.

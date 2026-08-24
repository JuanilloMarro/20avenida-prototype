# 06 · `<ProductAccordion>` — el acordeón de productos

> **Estado: CONSTRUIDO y verificado.** Este documento ya no es una
> especificación: describe código que existe, y todos los números están medidos
> en el navegador, no recordados.

**Sitio:** en la landing, justo debajo de `<ProductShowcase />`.
**Archivos:** `components/product/ProductAccordion.vue` · `components/product/ProductAccordionPanel.vue`
**Sí usa liquid glass** — ver §8. Esto cambió respecto a la especificación original.

---

## 1 · Qué es

Cuatro paneles de color, uno por producto. Al señalar uno **se expande al 40% y
los otros se reparten el 60% restante**. El expandido enseña el producto entero
con su ficha; los contraídos, el producto recortado y nada más. Al hacer clic,
el panel **se come el componente entero** y aparece la ficha completa con tallas
— sin cambiar de página.

```
reposo         ┌────┬────┬────┬────┐      25 · 25 · 25 · 25
               └────┴────┴────┴────┘

señalado #2    ┌──┬───────┬──┬──┐         20 · 40 · 20 · 20
               └──┴───────┴──┴──┘

detalle #2     ┌───────────────────┐       0 · 100 ·  0 ·  0
               └───────────────────┘
```

**La idea central, y de donde sale todo lo demás:** el panel contraído
**recorta** el producto; al expandirse no lo escala, lo **destapa**. Es una
ventana que se abre, no una foto que crece.

---

## 2 · API

```vue
<ProductAccordion
  :items="['jordan-pine', 'jordan-brood', 'jordan-ochre', 'jordan-chi']"
  @select="onProducto"
  @buy="onComprar"
/>
```

| Prop | Tipo | Defecto | Qué hace |
|---|---|---|---|
| `items` | `Array` | — *(requerido)* | ids de colorways. 3–5. |
| `open` | `Number` | `40` | % que ocupa el expandido. |
| `initial` | `String` | `null` | cuál arranca expandido. `null` = reposo. |
| `height` | `String` | `'100svh'` | alto de la pieza. |

| Evento | Payload | Cuándo |
|---|---|---|
| `select` | `id` | se abre el detalle de un producto |
| `buy` | `{ id, size }` | se pulsa «Comprar ahora». `size` puede ser `null` |

Los ids que no existen en `COLORWAYS` **se filtran**, no revientan: un colorway
mal escrito deja tres paneles, no una página en blanco.

---

## 3 · La proporción

```
expandido  = open                       (40 por defecto)
contraído  = (100 − open) / (n − 1)
reposo     = 100 / n
```

| paneles | expandido | cada contraído |
|---|---|---|
| 3 | 40% | 30% |
| **4** | **40%** | **20%** ✅ el caso en uso |
| 5 | 40% | 15% |

> Con más de 5 el contraído baja de 15% y el producto deja de reconocerse. **Si
> hace falta más catálogo, es otro componente** (una grilla), no más paneles.

El cálculo vive en JS —`geometria`, en el padre— porque **depende de cuántos
paneles hay y CSS no sabe contar hermanos para repartir**. Lo que baja al CSS
son longitudes ya resueltas: `--pa-rest`, `--pa-open`, `--pa-shut`.

---

## 4 · El reparto — `@property`, y por qué

```css
@property --pa-w {
  syntax: '<length-percentage>';
  inherits: false;
  initial-value: 25%;
}
.pa__panel {
  flex-grow: 0; flex-shrink: 0;
  flex-basis: var(--pa-w);
  transition: --pa-w .5s cubic-bezier(.22, 1, .36, 1);
}
```

**La transición va sobre la variable, no sobre `flex-basis`.** Sin registrar con
`@property`, una custom property es texto que se sustituye: el navegador no sabe
que «del 25% al 40%» es un recorrido y no puede interpolarlo. Registrada pasa a
ser una propiedad **con tipo**, el navegador la interpola, y `flex-basis` se
limita a seguirla fotograma a fotograma.

`flex-basis` y no `grid-template-columns`: es una **longitud**, interpola en
todos lados sin sorpresas. Y mide el **eje principal** — que es lo que permite
que en móvil, con el acordeón tumbado, **las mismas declaraciones pasen de
repartir ancho a repartir alto sin duplicar una sola línea**.

### El orden de la cascada ES la lógica

No se pueden reordenar. Todas tienen la misma especificidad, así que gana la
última — y así **cualquier motivo para abrir le gana a cualquier motivo para
cerrar**.

```css
.pa > * { --pa-w: var(--pa-rest); }                 /* 1. reposo   */
.pa.is-picking > *,
.pa:has(:focus-visible) > * { --pa-w: var(--pa-shut); }  /* 2. cerrar */
@media (hover: hover) and (pointer: fine) {
  .pa:hover > * { --pa-w: var(--pa-shut); }
}
.pa > .is-open,
.pa > *:focus-visible { --pa-w: var(--pa-open); }   /* 3. abrir    */
@media (hover: hover) and (pointer: fine) {
  .pa > *:hover { --pa-w: var(--pa-open); }
}
.pa.is-detail > *          { --pa-w: 0%; }          /* 4. detalle  */
.pa.is-detail > .is-detail { --pa-w: 100%; }
```

El bloque del detalle va **al final, después del hover**, a propósito: mientras
hay un detalle abierto, pasar el ratón sobre un panel plegado no puede
devolverlo al 40%.

### ⚠️ `:focus-visible`, nunca `:focus-within`

**Al hacer clic, el navegador deja el foco puesto en el enlace.** Con
`:focus-within` la regla seguía casando después de soltar el ratón y el panel se
quedaba abierto con el cursor ya lejos. `:focus-visible` sólo casa cuando el
navegador decide que el foco debe verse — en la práctica, navegando con teclado.

**En escritorio el ancho lo manda el hover y nada más.**

---

## 5 · El recorte — la técnica

El cuerpo (`.pa__body`) tiene **el ancho del panel expandido** y va centrado en
absoluto; el panel recorta con `overflow: hidden`.

```css
.pa { container-type: inline-size; }      /* ← la clave */
.pa__body { width: var(--pa-body); }      /* --pa-body = `open`cqw = 40cqw */
```

`container-type: inline-size` convierte al acordeón en contenedor de consulta, y
con eso `cqw` mide contra **esta caja** y no contra el viewport. Sin esto habría
que usar `vw` y la pieza tendría que ir a sangre para que el número cuadre. Hay
fallback declarado para navegadores sin container queries:

```css
@supports not (container-type: inline-size) { .pa { --pa-body: var(--pa-body-vw); } }
```

El gemelo para el acordeón tumbado es `--pa-body-h`, y sale de un `calc()` sobre
`height` **y no de `cqh`**: `cqh` exigiría `container-type: size` —contención en
los dos ejes— y aquí basta con la del eje en línea.

### El zapato se mueve con `object-position`, no con `transform`

```css
.pa__shot { object-position: center; transition: object-position .5s …; }
.pa__panel.is-open .pa__shot { object-position: 14% center; }
```

En reposo el zapato está centrado; al abrirse se corre a la izquierda y deja
sitio a la derecha para la ficha. **Con `transform: translateX()` la caja se
movía entera y el zapato se salía del ancho.** `object-position` mueve la imagen
*dentro* de su caja, que no se mueve: el recorte sigue siendo el mismo.

---

## 6 · Los tres modos de apertura

| Entrada | Comportamiento |
|---|---|
| **Puntero fino** | `hover` expande. El clic abre el detalle **directo**. |
| **Táctil** | Primer tap expande. **Segundo tap** abre el detalle. |
| **Teclado** | `Tab` expande vía `:focus-visible`. `Enter` abre. `Escape` cierra. |

La consulta se hace **al tocar y no al montar**: un portátil táctil tiene las dos
entradas y lo que manda es con cuál se acaba de tocar.

```js
const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches
if (fino || activo.value === id) { /* abre detalle */ }
else { activo.value = id }        /* sólo expande  */
```

El doble tap existe porque **en táctil no hay hover**: sin él, el primer toque
dispararía el detalle sin que se haya llegado a ver lo que se abrió.

Y `activo` **se escribe también en escritorio** antes de abrir. El panel ya
estaba al 40% por el hover, pero eso es CSS puro: si el detalle arranca sin que
el estado lo diga, el punto de partida de la animación depende de dónde esté el
ratón en ese instante. Escribiéndolo, el recorrido es siempre **40 → 100**, y al
cerrar vuelve por donde vino.

---

## 7 · El detalle, y la vuelta en dos tiempos

El detalle **no es otra página**: es el mismo acordeón con un panel comiéndose
el ancho entero y los otros tres plegados a cero. Se hace así porque lo que se
mira es lo mismo —el producto—, sólo que más de cerca.

Los plegados **no se ocultan** con `visibility` ni `display`: un ancho de cero
con `overflow: hidden` ya no enseña nada. Para sacarlos del teclado y de los
lectores está **`inert`**, que es exactamente para eso y no toca el pintado.

### La vuelta

```js
function volver() {
  detalle.value = null
  clearTimeout(volviendo)
  volviendo = setTimeout(() => { activo.value = null }, 520)
}
```

**Dos tiempos a propósito.** Primero se suelta el detalle: el panel pasa de 100 a
40 y los otros tres de 0 a 20, así que las cuatro opciones reaparecen mientras la
que se estaba mirando sigue señalada. Cuando esa animación termina (520 ms,
20 más que la transición de 500) se suelta la selección y los cuatro quedan al
25%.

> Si se soltaran los dos a la vez, el panel iría de 100 a 25 de un tirón y los
> otros de 0 a 25: se vería un salto, no una vuelta.

El temporizador **se cancela al abrir**: si el usuario vuelve a entrar antes de
que termine, la selección no puede borrarse a media apertura.

---

## 8 · El vidrio de la pieza

Los planos de color son **sólidos** — son capa de contenido y ahí no va vidrio.
Lo que sí es vidrio son **los controles que flotan sobre el plano**: el CTA de
cada card, el botón de volver, el de comprar y cada talla.

**Material estándar, velo negro, sin variantes, en las dos disposiciones.**

```vue
<GlassSurface :radius="999" tag="span" class="pa__cta">
```

> La variante `light` se probó y se descartó: invierte a tinta oscura lo que va
> encima —es su diseño— y el propio `glass.css` avisa de que está calibrada para
> glifos, no para texto.

La talla seleccionada usa `.av-glass-sel`, la misma selección del sistema: sobre
el velo negro es **luz**, el mismo vidrio un poco más encendido.

---

## 9 · Móvil — el acordeón se tumba

```css
@media (max-width: 640px) { .pa { flex-direction: column; } }
```

**Filas, no columnas.** Cuatro columnas en 390 px son tiras de 97, y ahí un
zapato no se reconoce: la foto es casi cuadrada, así que lo que la limita es el
lado corto, y en vertical el lado corto es ridículo. Tumbado, cada fila tiene los
390 px enteros de ancho, el zapato pasa a estar limitado por el **alto** de su
fila —que es mucho más— y encima sobra sitio al lado para la ficha.

**El reparto no se reescribe**: 25 / 40 / 20, los mismos números, ahora de alto.

En las cards de móvil **se oculta la descripción**: sólo quedan título y precio
arriba a la izquierda y «Ver detalles» abajo a la derecha, los dos con el mismo
margen (`--pa-pad-m: clamp(12px, 3.5vw, 20px)`) para que no se peguen al borde.

### El detalle en móvil

```css
@media (max-width: 640px) {
  .pa__detail { grid-template-rows: auto auto 1fr; padding: var(--av-nav-space, 87px) …; }
  .pa__panel.is-detail .pa__body { inset-block: auto; top: 22%; height: 40%; transform: none; }
}
```

El zapato **no va centrado**: ocupa una banda del **22% al 62%** del alto. Arriba
sólo hay un botón y dos líneas, así que no necesita media pantalla; **el tercio
inferior queda entero para las tallas y el botón**, que es lo que se toca.

La banda va en **porcentaje y no en píxeles** a propósito: el alto de un teléfono
varía mucho y lo que tiene que mantenerse es la proporción entre las tres zonas,
no una distancia fija.

---

## 10 · El hueco de la barra

```css
--pa-pad-y: var(--av-nav-space, 87px);
```

El acordeón es una pieza a pantalla completa y la barra es `fixed`: sin reservar
su hueco, el título y el botón de volver acaban **debajo** de ella.

Se aplica **arriba y abajo por igual**. Abajo no hay nada que esquivar, pero un
texto pegado al borde inferior contra otro que arranca 87 px más abajo se lee
torcido; simétrico se lee como un encuadre. En un teléfono, además, abajo está la
barra del navegador.

**El fallback importa** — ver §14.

---

## 11 · Tipografía y tinta

**Tinta blanca en todas las medidas**, y no la `--ps-ink` del colorway. Va
declarada arriba del todo, fuera de cualquier `@media`, justamente para eso: la
ficha se lee igual en los cuatro planos y en cualquier pantalla.

```css
--pa-on-surface:      #FFFFFF;
--pa-on-surface-soft: rgba(255, 255, 255, .72);
```

**La jerarquía se mantiene con alfa, no con otro color**: el nombre a blanco
puro, la descripción y el precio al 72% — el mismo «medio iluminado» que usa el
material para lo secundario.

El texto gigante del fondo usa `useFitText` y **`short`, no `name`**: `short`
distingue el colorway (*Pino*, *Orquídea*, *Ocre*, *Chicago*), `name` los
repetiría los cuatro. Cumple **R1** — primera mayúscula y el resto minúsculas.

---

## 12 · Los datos

Reutiliza `colorways.js` **sin tocar el componente**: una entrada ya trae el
color del panel, la tinta, el acento, la foto, el nombre y el precio. Añadir un
producto es añadir un colorway.

| Campo | Uso en el acordeón |
|---|---|
| `name` | título de la card y del detalle |
| `short` | el texto gigante del fondo |
| `line` | la descripción de una línea (arriba a la izquierda) |
| `price` | precio |
| `blurb` | párrafo del detalle |
| `sizes` | las tallas del detalle |
| `frames[0].src` | la foto |
| tokens `--ps-*` | vía `toCss(id)`, aplicados por el padre como `:style` |

> ⚠️ **Placeholder:** `price` (180$), `blurb` y `sizes` son de relleno. `sizes`
> sale de `TALLAS_AJ1`, una constante compartida por los cuatro. Cuando llegue el
> backend, cada producto traerá las suyas — y con disponibilidad.

---

## 13 · Assets

`public/products/jordan/` — cuatro `.webp`, ~45 KB cada uno.

```
jordan-pine.webp   jordan-brood.webp   jordan-ochre.webp   jordan-chi.webp
```

**Todos en la misma caja unión: 647 × 636.** Es la tinta más ancha por la más
alta, **con 46 px de margen a cada lado**.

> Ese margen no es estético. Sin él, el Chicago —cuya tinta medía exactamente el
> alto del lienzo— tocaba el borde y era **el primero en verse cortado** al
> contraerse el panel, mientras los otros tres aún tenían aire. Cuatro zapatos a
> la misma escala tienen que tener también el mismo aire.

Y el `<img>` lleva **`width="647" height="636"` declarados**, que no son
decorativos: en el acordeón tumbado la foto se dimensiona por el alto
(`height: 100%; width: auto`), y **una imagen `lazy` que aún no ha cargado no
tiene proporción intrínseca** — medía cero de ancho y la fila salía vacía hasta
que llegaba el fichero.

La primera foto es `eager` + `fetchpriority="high"`; las demás esperan.

---

## 14 · Dependencias — el contrato

Esta es la superficie completa. **No hay nada más**, y está medida sobre el
código, no estimada.

### Imports de código — 3

| Import | Qué se usa | ¿Evitable? |
|---|---|---|
| `~/assets/js/colorways` | `COLORWAYS`, `toCss`, `DEFAULT_COLORWAY` | No — son los datos |
| `~/composables/useFitText` | el ajuste del texto gigante | No — compartido con `<ProductShowcase>` |
| `lucide-vue-next` | `ArrowLeft`, `ArrowRight` | Sí, sustituyendo por dos SVG inline |

### Componentes — 1

`<GlassSurface>` (auto-import de Nuxt). Es el material del paquete; ver doc 01.

### CSS del anfitrión — 1 token y 1 clase

| Qué | Dónde vive | Cómo se protege |
|---|---|---|
| `--av-nav-space` | `tokens.css` | **fallback `87px`** en los dos usos |
| `.av-glass-sel` | `glass.css` | viene con `GlassSurface` |

**Los `--ps-*` no cuentan como dependencia**: los inyecta el propio componente
con `toCss(id)` como `:style` en cada panel. No hace falta ninguna hoja de
estilos externa para que existan.

> El fallback de `--av-nav-space` no es cosmética. Una custom property que no
> existe **no resuelve**, y una declaración que no resuelve se cae al valor
> inicial: el hueco de la barra pasaba a **0** y el título se iba debajo de ella.
> Con el respaldo, la pieza se monta sola en cualquier repo; donde el token sí
> exista, manda el del anfitrión.

### Para llevárselo a otro repo

```
components/product/ProductAccordion.vue
components/product/ProductAccordionPanel.vue
public/products/jordan/*.webp          (4 ficheros)
```

…más `colorways.js`, `useFitText.js` y `GlassSurface` (docs 01 y 03), que ya
vienen por otros componentes. **No hay CSS global propio de esta pieza**: todo
está en los dos `<style scoped>`.

---

## 15 · Accesibilidad

| Qué | Cómo |
|---|---|
| El panel | `<a>` con destino real, `aria-expanded` |
| `aria-expanded` | sigue **el foco**, no el hover — quien lee ese atributo navega con teclado |
| Plegados | `inert` |
| Tallas | `role="group"` + `aria-pressed` |
| Cerrar | `Escape`, además del botón |
| El texto gigante | `aria-hidden="true"` — su contenido ya está en el `alt` de la foto |
| Movimiento | `@media (prefers-reduced-motion: reduce)` apaga transiciones y la animación del detalle |

### ⚠️ Siempre `<a>`, nunca `<component :is>`

También en detalle. Alternar la etiqueta hace que **Vue destruya el elemento y
cree otro**, y un elemento recién creado no tiene estado previo del que
transicionar: al cerrar el detalle el panel saltaba del 100% al 25% de golpe
mientras los otros tres sí animaban, y eso se lee como que algo se quedó colgado.

En detalle sólo se le **quita el `href`**: un `<a>` sin él no es enlace, no
recibe foco y no se anuncia como tal — que es justo lo que hace falta.

### ⚠️ El `href` no se pinta hasta montar

```vue
:href="isDetail || !montado ? undefined : '/producto/' + cwId"
```

Entre que el servidor manda el HTML y que Vue engancha el manejador hay una
ventana en la que el enlace ya está pintado y **no lo cancela nadie**: un clic
ahí lo sigue el navegador y se va a `/producto/<id>`, que hoy no es una ruta →
**404 con traza de servidor**, porque es una carga entera.

Se arregla desde el HTML y no desde el manejador: **sin `href`, un `<a>` no tiene
comportamiento de activación y no hay nada que cancelar.** El primer render del
cliente coincide con el del servidor —los dos sin `href`— así que no hay
desajuste de hidratación.

> Cuando exista `/producto/:id`, esta protección **se puede quitar**. Mientras no
> exista, el enlace es una promesa que la app no puede cumplir: abrirlo en
> pestaña nueva sigue dando 404.

### ⚠️ Los botones de dentro llevan `.stop.prevent`

Volver, tallas y comprar. `.stop` corta la subida hasta el `<a>` —un botón de
cerrar no debe pasar por el elemento que abre— pero **al cortarla, el
`preventDefault` del panel ya no corre**, y los tres viven dentro del `<a>`.
Quien corta la burbuja tiene que cancelar por su cuenta.

---

## 16 · Trampas que ya costaron una vez

| Síntoma | Causa real |
|---|---|
| El detalle se quedaba montado al cerrar | `<Transition>` de Vue usa `requestAnimationFrame`; sin frames nunca completa. Se sustituyó por `v-if` + `@keyframes` CSS, que desmonta sin condiciones |
| El panel se quedaba abierto tras el clic | `:focus-within` casaba con el foco que deja el ratón. → `:focus-visible` |
| El zapato se salía del ancho al abrir | `transform` movía la caja entera. → `object-position` |
| Una card se veía más compacta | el Chicago tenía 0 px de margen en el lienzo. → caja unión con 46 px |
| Las filas salían vacías en móvil | `<img loading="lazy">` sin `width`/`height` mide cero |
| La ficha del detalle desbordaba | `align-content: start` impedía que la fila `1fr` se estirara |
| El último panel se cortaba con la barra del navegador | `vh` mide el viewport con las barras retraídas. → `svh` |

### `svh`, y no `dvh` ni `vh`

- `vh` — viewport con las barras **retraídas**. Con la barra a la vista, el
  último panel sale cortado.
- `dvh` — el viewport **actual**, que cambia al scrollear. No corta, pero los
  cuatro paneles se redimensionan mientras el dedo se mueve y el reparto se ve
  temblar.
- `svh` — viewport con las barras **desplegadas**: el más pequeño de los tres, y
  por eso el único estable. Se paga un hueco cuando la barra se retrae, y para
  una pieza de cuatro paneles es mejor trato.

En escritorio los tres valen lo mismo.

---

## 17 · Medidas verificadas

Medido en el navegador sobre el prototipo, no calculado.

### Reparto

| Estado | 1280 px (columnas) | 390 px (filas) |
|---|---|---|
| reposo | 25 · 25 · 25 · 25 | 25 · 25 · 25 · 25 |
| señalado | 20 · 40 · 20 · 20 | 20 · 40 · 20 · 20 |
| detalle | 0 · 100 · 0 · 0 | 0 · 100 · 0 · 0 |
| tras volver | 25 · 25 · 25 · 25 | 25 · 25 · 25 · 25 |

### El detalle en teléfono — tres anchos

Distancias en px desde los bordes del panel.

| | 375 × 812 | 390 × 844 | 430 × 932 |
|---|---|---|---|
| Regresar (desde arriba) | 87 | 87 | 87 |
| Título | 137 | 137 | 137 |
| Zapato | 178 → 504 | 185 → 522 | 205 → 578 |
| Tallas | 581 | 613 | 701 |
| Comprar (desde abajo) | **87** | **87** | **87** |
| Desborde horizontal | 0 | 0 | 0 |
| Aire zapato↔tallas | 77 | 91 | 123 |

El zapato cae siempre en la banda **22%–62%** y el reserve superior e inferior es
siempre el mismo `--av-nav-space`.

---

## 18 · Qué revisar al reconstruir

1. **`@property` no tiene fallback útil.** En un navegador sin soporte, `--pa-w`
   no interpola y el reparto **salta** en vez de animarse. Funciona, pero sin
   transición. Es el único punto del componente que degrada de forma visible.
2. **Los tiempos están declarados, no juzgados.** 500 ms de transición y 520 de
   la vuelta salieron mirando el resultado en el prototipo; **verifícalos en un
   teléfono real**, que es donde el doble tap y la vuelta se sienten.
3. **`/producto/:id` sigue sin existir.** Cuando exista, `onProducto` en
   `pages/index.vue` pasa a ser un `navigateTo` y la protección del `href` (§15)
   se puede retirar.
4. **`buy` no hace nada todavía.** Cuando exista la bolsa, es un `cart.add()`.
5. **Los datos de §12 son placeholder.** Precio, descripción y tallas.

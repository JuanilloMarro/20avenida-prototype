# 08 · `<ProductReel>` — el rollo

**Archivo:** `components/product/ProductReel.vue` (~1800 líneas)
**Depende de:** el material (doc 01), los tokens compartidos (doc 04 §3b), `colorways.js`, `useFitText`, `backgrounds.js`, `lucide-vue-next`

Un carrusel de un producto a la vez sobre plano negro, con ficha de detalle a
pantalla completa. Es la pieza que enseña **un zapato en pedestal**; el panal,
que va justo después, enseña que hay muchos.

---

## 1 · API

```js
defineProps({
  items:   Array,   // ids de colorway, en orden de giro
  initial: Number,  // cuál arranca en el centro. default 0
  bg:      String,  // el plano de detrás. default '#050506'
  grain:   Number,  // 0–100
})

defineEmits(['select', 'change', 'buy'])
```

### `items` — un rollo, un encuadre

El default son **los cinco Jordan** y no una mezcla, y la regla generaliza:

> **Si los assets no comparten caja unión, no van en el mismo rollo.**

Los cinco Jordan comparten 647×636, así que se leen a la misma escala al pasar
de uno a otro. Meter los Samba —que vienen de otro recorte— haría que el zapato
pegara un salto de tamaño justo en el momento en que se está mirando, que es el
único momento que importa en esta pieza.

> ⚠️ **`jordan-royal` es un PLACEHOLDER.** Reutiliza la foto de `jordan-pine`
> con id propio, y está ahí sólo para que haya cinco puestos que mirar. Con
> catálogo real desaparece solo.

### `bg` acepta tonos claros, y no de refilón

`luminancia()` calcula la relativa de la WCAG y, por encima de 0.5, **la tinta
de todo lo que va suelto sobre el plano se da la vuelta sola**. Lo que va sobre
vidrio no se entera, y tampoco debe: el velo es negro fijo.

Tiene que ser **hexadecimal de 6 cifras** — `luminancia()` no sabe leer otra
cosa y ante la duda deja la pieza en oscuro. Un `rgb()` aquí no rompe nada, pero
tampoco hace lo que se espera.

> **Historia que explica el default:** cuando el rollo iba pegado al escaparate
> se le pasaba el `surface` claro del colorway para que la costura no se notara.
> Hoy va detrás del acordeón y es **una de las tres piezas negras con las que
> cierra la página** —rollo, panal y díptico, más el pie—, así que el default es
> `#050506`: la primera parada de la rampa `negro` de marca, no un negro
> inventado.

---

## 2 · El alto: `100svh`, el mismo que el acordeón

```css
.rl { height: 100svh; }
```

**No es una preferencia, es una igualdad.** Las dos piezas se comen el viewport
entero, y si no miden exactamente lo mismo la página deja de avanzar de pantalla
en pantalla: una se queda corta y asoma un trozo de la siguiente.

`svh` y no `dvh` ni `vh` — el razonamiento largo está en `ProductAccordion.vue`
(doc 06 §16) y es el mismo. **Se probó `lvh`** para tapar el hueco que `svh`
deja cuando la barra del navegador se retrae, y se descartó: rompía la igualdad
con el acordeón, que es lo que importa.

### Las dos franjas que no se usan

```css
--rl-suelo: 70px;
padding:
  var(--av-nav-space, 87px)                              /* la barra del sitio */
  var(--av-gutter)                                       /* el margen común    */
  calc(var(--rl-suelo) + env(safe-area-inset-bottom));   /* la del navegador   */
```

Arriba, lo que la barra fija del ecommerce ocupa sin estar en el flujo. Abajo,
los 70 px donde se posa la barra **del navegador** en teléfono. **Nada que haya
que leer o tocar entra en esas dos franjas** — y eso incluye la ficha, que
hereda las mismas medidas.

---

## 3 · Los cinco puestos y por qué no están repartidos por igual

```css
--rl-col:        20vw;                      /* la quinta parte de la pantalla */
--rl-side-shift: var(--rl-col);
--rl-far-shift:  calc(var(--rl-col) * 1.55);
```

En teléfono el rollo se leía muy bien y en escritorio se desaprovechaba media
pantalla: los desplazamientos eran relativos al propio ítem —un 42 % de unos
250 px en un monitor de 1440—, así que los cinco se amontonaban en el tercio
central y las dos quintas partes de los extremos quedaban vacías. De ahí `20vw`:
**cada puesto es una quinta parte del ancho**.

### El 1.55 es lo que lo convierte en un ROLLO y no en una fila

Un carrete redondo visto de frente tiene a los de fuera **girando hacia el
fondo**, así que su separación aparente **se encoge** conforme se alejan del
centro. Es la proyección de un cilindro, `sin θ`: con pasos de 40° sale
`0 · 0.64 · 0.99` — el segundo salto es la mitad del primero.

Si los extremos fueran a dos columnas exactas, los cinco quedarían a la misma
distancia y la pieza se leería plana.

**Medido en tinta a 1425 de ancho:** 105 px entre foco y vecino, **74** entre
vecino y extremo.

### `translateX` va el PRIMERO de la cadena

Así el desplazamiento se aplica en el espacio del padre y **no lo encoge el
`scale` que viene detrás**. Por eso puede ir en `vw` y significar lo que dice.
Invertir el orden es el fallo clásico aquí: los números dejan de corresponder
con nada.

### En teléfono son TRES puestos, no cinco

A 375 px los extremos caerían encima de las flechas y del borde. Se apagan **con
la misma regla que los que están fuera del encuadre** — no hay una segunda forma
de esconder un ítem. Y los vecinos vuelven al desplazamiento relativo al propio
ítem (`42%`), porque aquí no hay cinco columnas que repartir.

**Sin flechas en teléfono**, y en su lugar una pista escrita: «Desliza para ver
más». Las flechas a ese ancho se comían el sitio del zapato para decir algo que
el gesto ya dice.

---

## 4 · La ficha: dos columnas, 65 / 35

```css
.rl__ficha {
  position: absolute;
  inset: var(--av-nav-space, 87px) var(--av-gutter)
         calc(var(--rl-suelo) + env(safe-area-inset-bottom, 0px));
  display: grid;
  grid-template-columns: 65fr 35fr;
  align-items: center;
}
```

| columna | qué lleva |
|---|---|
| izquierda, 65 % | el nombre y, debajo, el zapato dentro de un panel `light` |
| derecha, 35 % | precio · descripción · tallas · Regresar + Comprar |

**Mismas medidas que el resto de la pieza**, no unas nuevas: el `inset` repite
el `padding` de la sección para que la ficha caiga exactamente donde caía el
carrusel.

`align-items: center` en las dos columnas: la derecha es más corta y alineada
arriba se quedaba flotando en el aire.

### Lo que se va al fondo es EL ZAPATO, no el título

Este es el rediseño entero, y cabe en una frase:

> En una ficha de producto, lo que puede permitirse estar fuera de foco es la
> copia grande del producto — **no su nombre**.

Antes el nombre viajaba hasta el centro y se desenfocaba detrás. Ahora:

```css
.rl.is-ficha .rl__stage      { position: absolute; inset: 0; }
.rl.is-ficha .rl__item.is-focus {
  transform: rotate(var(--rl-tilt)) scale(1.55);
  filter: blur(calc(var(--rl-title-blur) * 2.6));
  opacity: .34;
  pointer-events: none;
}
.rl.is-ficha .rl__title { opacity: 0; }
```

**Centrado en los dos ejes**, y el truco es `position: absolute; inset: 0` sobre
el escenario: `inset` se resuelve contra la **caja de relleno entera**, así que
su centro es el de la sección y no el del hueco que dejan la cabecera y el pie.

**El 1.55 es el tope, y está medido.** La caja del zapato ya girada mide unos
440 px a 1440×900, y el desenfoque añade su radio por los cuatro costados: 1.55
es donde la suma toca el borde sin pasarse. Más grande y el halo **se corta**
contra el `overflow: hidden` de la sección, y un desenfoque cortado en recto
deja de leerse como profundidad. Comprobado midiendo luminancia en el filo:
8.5–8.7 contra los ~7 del plano, o sea que el halo se apaga solo antes de
llegar.

### El título NO se mueve al volver

`.rl.is-ficha .rl__title { opacity: 0; }` y **nada más**. Hubo aquí una regla
con `transform: … scale(1)` que sobrevivió al rediseño y hacía que al cerrar la
ficha el título diera un salto que no daba al abrirla. Entrar y salir tienen que
verse igual: lo único que cambia es la opacidad.

El nombre del pie tampoco tiene regla propia — ya está apagado desde que hay
medida. Antes había un apagado suyo sincronizado con el encendido del otro: dos
textos haciendo un relevo, que es un fundido y no un viaje.

### El panel del zapato

`<GlassSurface variant="light">` con la foto en `object-fit: contain` y

```css
box-shadow: 0 34px 60px -24px rgba(0, 0, 0, .75);
```

**Vidrio `light` y no un relleno sólido:** es la única pieza clara de la sección
y aun así sigue siendo el material de la casa. Dentro no hay texto, así que el
velo claro no le quita contraste a nada.

**La sombra va debajo y muy abierta** porque es lo que lo despega del zapato
difuminado que tiene detrás. Sin ella los dos se leen en el mismo plano.

### Las dos salidas van JUNTAS y a la derecha

```css
.rl__fcol--r     { align-items: flex-end; text-align: right; }
.rl__facciones   { display: flex; justify-content: flex-end; gap: 0; }
```

`gap: 0` es deliberado: los dos botones se tocan y forman **un solo bloque** en
la esquina. Con separación se leían como dos decisiones independientes.

Toda la columna tira al margen derecho —precio, descripción, tallas y botones
acaban en la misma vertical— y esa vertical es el `--av-gutter`. Verificado:
Regresar acaba en x=1203, Comprar arranca en x=1203, el filo derecho de los dos
y el de las tallas en 1367 sobre un viewport de 1440 menos 57.6 de margen. Los
dos miden 164×44, que es `--av-action-*` (doc 04 §3b).

---

## 5 · Los títulos son SIEMPRE blancos

```css
.rl__ftitle, .rl__title { color: var(--av-on-glass-strong); }
```

Explícito y no heredado. La pieza tiene inversión automática de tinta por
luminancia del `bg` (§1), y los títulos quedan **fuera** de ella a propósito: van
sobre el zapato difuminado, no sobre el plano, así que su contraste no depende
del color de fondo sino de la silueta que tengan detrás.

---

## 6 · Lo que se apaga al abrir la ficha

```css
.rl.is-ficha .rl__arrow,
.rl.is-ficha .rl__ticks,
.rl.is-ficha .rl__pista,
.rl.is-ficha .rl__cta { opacity: 0; pointer-events: none; }
```

Todo el mando del carrusel, incluido el propio «Ver detalle», que ya cumplió.

**`pointer-events` además de la opacidad:** un botón invisible que sigue
respondiendo es peor que uno visible. Y los `tabindex` se invierten en el
marcado (`:tabindex="ficha ? -1 : 0"` fuera, `ficha ? 0 : -1` dentro) para que
el teclado no se pasee por lo que no está.

La cabecera y el pie se apagan enteros: la ficha trae su propio nombre, línea y
precio, y **dos copias del mismo dato en pantalla es peor que ninguna**.

---

## 7 · Accesibilidad

- `role="region"` + `aria-roledescription="carrusel"` en la sección.
- **`aria-live="polite"` en la cabecera**, que es donde cambia el texto al girar.
  Hay una copia visual en el pie sin `aria-live` — se anuncia una vez, no dos.
- El título grande del escenario va **`aria-hidden`**: su texto ya lo anuncia el
  `<h2>` de la ranura.
- Los ítems a más de un puesto del centro llevan `aria-hidden`, y el
  `aria-label` cambia según dónde estén: «Ver detalle de X» en el centro,
  «Traer al centro X» en los lados.
- La fila de tallas es un `role="group"` con `aria-label` — **sin etiqueta
  visible**, porque una fila de números sueltos sí necesita decir qué es a quien
  no la ve.
- Flechas de teclado para girar; arrastre horizontal con `touch-action: pan-y`,
  que deja el scroll vertical a la página.

---

## 8 · Dependencias — el contrato

**Imports de código:**
`colorways.js` · `useFitText` · `backgrounds.js` (`GRAIN_URL`, `GRAIN_DEFAULT`)
· `GlassSurface` · `lucide-vue-next` (`ArrowLeft`, `ChevronLeft`,
`ChevronRight`, `ShoppingBag`)

**Del anfitrión, en CSS:**

| token | con fallback | qué pasa sin él |
|---|---|---|
| `--av-nav-space` | ✅ `87px` | el título se metería debajo de la barra |
| `--av-gutter` | ❌ | el margen lateral se cae a 0 |
| `--av-action-*` | ❌ | los botones pierden la medida común |
| `--av-on-glass-strong` | ❌ | los títulos pierden el blanco |

> **Pendiente menor:** `--av-gutter` y `--av-action-*` deberían llevar fallback
> como lo lleva `--av-nav-space`, por el mismo motivo — una custom property que
> no existe no resuelve, y una declaración que no resuelve se cae al valor
> inicial. Hoy la pieza no se monta sola en un repo sin `tokens.css`.

---

## 9 · Trampas que ya costaron una vez

- **El grano va en un `::before` con `z-index: 0`, debajo de todo.** Un
  `backdrop-filter` sólo ve lo que se pintó antes que él: encima, el vidrio de
  las flechas no lo recogería y se leerían como cristal limpio. Sobre negro
  plano el grano es **lo único que la lente tiene que doblar**.
- **`min-width: 134px` y `150px` sueltos** en `.rl__cta` ganaban a
  `--av-action-w`. Si un botón no mide lo que debe, eso es lo primero que
  buscar.
- **El `bg` se puede pisar desde la página.** Llegó a llegarle el `surface`
  claro del escaparate desde `index.vue` y la sección entera se volvió blanca.
  Si el rollo aparece claro sin motivo, mirar la landing antes que el
  componente.

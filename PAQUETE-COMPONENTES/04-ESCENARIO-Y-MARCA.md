# 04 · Escenario, tokens y marca

**Archivos:** `layouts/default.vue` · `assets/css/tokens.css` · `assets/js/backgrounds.js` · `components/brand/BrandMark.vue` · `stores/useThemeStore.js`

Este es el **primer paso del orden de adopción**: sin el escenario, el material liquid glass no tiene nada que refractar y se ve mal aunque esté bien.

---

## 1 · El escenario — orden de pintado

**No es negociable.** Está escrito así en `layouts/default.vue`:

```
1. la rampa de fondo
2. el grano  ← ENCIMA de la rampa, DEBAJO del vidrio
3. el contenido
4. la capa que flota: nav, drawers, toasts
```

### Por qué el grano va debajo del vidrio

Dos motivos, y el segundo es el que casi nadie ve venir:

1. Si va encima, el `backdrop-filter` no lo recoge.
2. **Sobre `negro`, el grano es lo único que la lente tiene que refractar.** Sobre un negro plano la lente no tiene detalle que doblar y **el material desaparece aunque los parámetros estén bien**.

> Si al reconstruir el vidrio "no se ve", esto es lo primero que hay que comprobar — antes de tocar ningún token.

### Dos trampas del contenedor

```css
.stage {
  overflow-x: clip;   /* NUNCA hidden */
}
```

**`clip`, no `hidden`.** `overflow-x: hidden` implica `overflow-y: auto` y convierte al escenario en **contenedor de scroll**: cualquier `position: sticky` de dentro pasa a pegarse a *ese* elemento —que no scrollea— y deja de pegarse del todo. **Rompía el scrollover del showcase entero.**

**Sin `z-index` en `.stage__main`, a propósito.** Un `z-index` ahí crearía un contexto de apilado y dejaría el degradado del escenario **fuera del backdrop de sus hijos**. Como `.stage__grain` es posicionado con `z-index: 0` y va antes en el DOM, el contenido queda encima igual, por orden de árbol.

---

## 2 · Los fondos

Cuatro rampas, guardadas **como dato y no como texto** — el mismo array pinta el CSS y puede alimentar un muestreador de luminancia.

| id | nombre | nota | oscuro |
|---|---|---|---|
| `negro` | Negro | grafito limpio, sin color | ✅ |
| `amanecer` | Amanecer | papel → amarillo · default de tienda | ❌ |
| `oro` | Negro + oro | la variante cálida | ✅ |
| `blanco` | Blanco | control — **aquí el vidrio desaparece** | ❌ |

**Default: `negro`.**

### Una sola rampa lineal de 9 paradas a 157°

```js
{ id: 'negro', angle: 157, stops: [
  [0,    '#050506'], [0.14, '#08080A'], [0.28, '#0C0C0F'], [0.41, '#111114'],
  [0.54, '#161619'], [0.67, '#1C1C21'], [0.79, '#232329'], [0.90, '#2A2A31'],
  [1,    '#32323A'],
]}
```

**Nada de radiales:** un radial cierra su borde dentro del encuadre y se lee como mancha en la esquina.

Nueve paradas y no dos: con dos, una rampa de 8 bits hace *banding* visible en pantalla grande.

### El grano

```js
GRAIN_DEFAULT = 4    // 0–100
```

Es un `feTurbulence` SVG en `data:` URI, 170×170, `baseFrequency .85`, 3 octavas, desaturado. Va con `mix-blend-mode: overlay`.

**3–6% es donde el banding de una rampa de 8 bits deja de verse.** Por debajo no tapa; por encima ensucia.

---

## 3 · Tokens de marca y de contenido

`assets/css/tokens.css`. **El material NO está aquí** — vive entero en `glass.css`. Aquí está lo demás.

### La marca

```css
--av-y-400: #FFD600;   /* el amarillo, muestreado del letrero (h 50°, s 100%) */
--av-ink:   #0E0E0F;
--av-paper: #FBFAF7;
```
Con la escala completa `--av-y-50` … `--av-y-700`.

> **El amarillo es un acento corto, nunca un fondo.** En todo el prototipo aparece en **un solo sitio**: la burbuja del contador de la bolsa. Se probó como tinte de la selección de la barra y se descartó — convertía la selección en un elemento de color más en una barra que no tiene ninguno.

### Lo que va ENCIMA del vidrio

```css
--av-on-glass:        rgba(255,255,255,.72);
--av-on-glass-strong: #FFFFFF;
--av-on-glass-hover:  rgba(255,255,255,.10);
--av-on-glass-hair:   rgba(255,255,255,.14);
```

**Estos NO se invierten con el fondo, y es a propósito.** El velo es negro fijo, así que lo que se pinta encima está siempre sobre oscuro, dé igual lo que pase por debajo. **Ese es justamente el motivo de tener un material estandarizado:** el contraste del contenido deja de depender del contexto.

El 72% es el mismo «medio iluminado» de `.av-glyph` — texto y glifo van a la vez.

⚠️ Estos cinco tokens son la **única dependencia externa de `glass.css`**. Van juntos o el material se queda sin color de contenido.

### La capa de contenido (sólida)

```css
--av-solid-bg:      var(--av-paper);
--av-solid-fg:      var(--av-ink);
--av-solid-fg-soft: rgba(14,14,15,.56);
--av-solid-hair:    rgba(14,14,15,.12);
```

Para tarjetas, filas e ítems de lista cuando van sólidos: ahí el texto se apoya en papel, no en el velo, así que necesita sus propios tonos.

### Medidas de nav

Documentadas en el doc 02 §6.

---

## 3b · Las dos medidas COMPARTIDAS entre piezas

Estas no son de una pieza: son de la página. Llegaron tarde, después de tener
cinco componentes a pantalla completa hechos cada uno por su lado, y arreglan lo
que se veía al ponerlos uno detrás de otro.

### `--av-gutter` — el margen lateral, uno solo

```css
--av-gutter: clamp(16px, 4vw, 64px);
```

Había **cinco `clamp` distintos** para lo mismo: `24/4vw/64` en el escaparate,
`3cqw/34` en el acordeón, `16/4vw/64` en el rollo, `10/2vw/26` en el panal y
`18/3.4vw/56` en el díptico. Cada uno era defendible por separado; el problema
es que en una landing las piezas se ven **seguidas y en scroll**, y cinco
márgenes distintos se leen como cinco encuadres distintos — como si cada sección
viniera de una plantilla.

**Lo que NO entra aquí, y es la mitad de la regla:** lo que va a sangre por
diseño. El texto gigante del fondo del escaparate, el plano de color del
acordeón, las fotos del panal y el plafón de cada sección siguen llegando al
filo. **El margen es de lo que se LEE, no del fondo.**

> ⚠️ Una desviación viva: `<ProductDiptych>` se lo reescribe por debajo de
> 860 px (`--pd-pad: clamp(16px, 4.4vw, 30px)`). Es un tope más bajo que el del
> sistema (16→34 en ese rango) porque el díptico apila dos columnas y necesita
> el ancho. Está consentida, pero es la única — si aparece una segunda, la que
> hay que cambiar es la del sistema.

### `--av-action-*` — todos los botones miden lo mismo

```css
--av-action-w:   164px;   /* ancho MÍNIMO, no fijo */
--av-action-h:   44px;
--av-action-px:  20px;    /* relleno lateral */
--av-action-gap: 9px;     /* glifo ↔ palabra */
--av-action-fs:  13.5px;
--av-action-ico: 16px;
```

Los cinco botones de acción del sitio —«Comprar ahora» del escaparate, «Comprar
ahora» y «Regresar» del acordeón, «Ver detalles» y «Regresar» del rollo— eran
cinco tamaños. Se veían de dos en dos, uno al lado del otro, y la diferencia era
lo primero que saltaba.

**El ancho es `min-width`, no `width`.** «Regresar» y «Comprar ahora» no tienen
el mismo número de letras: con ancho fijo, o se corta la palabra larga o la
corta queda nadando. Con mínimo, los dos miden 164 salvo que el texto pida más,
y entonces crecen los dos —van en la misma fila y el `align-items: stretch` los
iguala.

**44 px de alto** no es una elección estética: es el suelo de un objetivo táctil.

> Al aplicarlo aparecieron `min-width: 134px` y `150px` sueltos en el rollo que
> ganaban al token. Si un botón nuevo no mide lo que debe, eso es lo primero que
> hay que buscar.

---

## 3c · La tipografía

**Una sola familia para todo el sitio**, en `--av-font`, y todos los componentes
escriben `font-family: inherit`. No hay ni una pieza con familia propia —
comprobado a grep sobre `app/`.

`--av-font-display` existe todavía y hoy **apunta a `--av-font`**. Se deja como
nombre y no se borra porque `<ProductShowcase>` lo pide así: el día que el texto
gigante del fondo vuelva a tener familia propia, se cambia aquí y en ningún otro
sitio.

### La regla que no depende de cuál sea la letra

**La pila de reserva tiene que tener las MISMAS proporciones que la buena.** No
es cosmética. Con `display=swap` la primera pintada siempre es con la reserva, y
si la buena es condensada y la reserva es Arial, la página se pinta un tercio
más ancha y se encoge de golpe al llegar la descarga. Del salto que quede se
ocupa `useFitText`, que vuelve a medir con `document.fonts.ready` — pero
`useFitText` sólo gobierna el texto gigante; el resto de la página se mueve.

**Corolario:** cambiar de letra es cambiar DOS cosas —el `family` que se pide en
`nuxt.config.ts` y la pila de reserva en `--av-font`— y hay que hacerlo a la
vez.

### ⚠️ Estado a 25-08-2026: la letra está en migración y DESINCRONIZADA

Este apartado es una foto, no una decisión. En tres días la familia ha sido
Playfair (sólo display) → Outfit → Anton → Oswald, y **en el árbol de trabajo
los dos extremos no coinciden**:

| dónde | qué dice |
|---|---|
| `nuxt.config.ts` | descarga **Oswald** `wght@400;500;600;700` |
| `tokens.css` → `--av-font` | pide **`"Anton"`**, con reserva Impact / Haettenschweiler |
| `main.css` | `font-synthesis-weight: none`, justificado por «Anton tiene un solo corte» |

O sea: se descarga una familia que el token no nombra, así que la página se
pinta con **Impact** y nunca cambia. Y el `font-synthesis-weight: none` estaba
puesto para tapar que Anton sólo tiene el 400 — con Oswald, que es variable de
200 a 700, ya no hace falta y lo único que hace es que el 800 caiga al 700.

**No se ha tocado desde aquí a propósito:** los tres archivos los está editando
otra sesión ahora mismo. Lo que falta es una línea —poner Oswald en `--av-font`
con reserva condensada— y decidir si el `font-synthesis-weight` se queda.

---

## 4 · `<BrandMark>`

```js
defineProps({
  size:     Number,   // alto en px. default null — A PROPÓSITO
  wordmark: Boolean,  // añade el wordmark tipográfico al lado
})
```

### Por qué `size` es `null` por defecto

Sin él la marca **no escribe nada** y el alto lo decide quien la coloca, atando `--av-mark-h` a su propio token. La barra hace justo eso:

```css
.av-nav__brand { --av-mark-h: calc(var(--av-nav-h) * .60); }
```

y así **el alto de la barra es UN número**. Con un default numérico el estilo en línea ganaba siempre y la marca se quedaba clavada mientras la barra cambiaba de alto.

### El recorte, y por qué ya no hay truco de blend

Lo que hay sigue siendo **una foto del rótulo**, no un asset de marca.

Antes iba con `mix-blend-mode: screen` para que el negro de la foto desapareciera. Eso **sólo funcionaba sobre fondo oscuro**: mientras la marca vivía dentro de un panel de vidrio con velo negro siempre lo tenía. **Al sacarla del panel dejó de tenerlo, y sobre el frame verde claro el screen la borraba entera.**

La salida no fue otro truco sino **recortar el fondo de verdad**: `scripts/cutout-bg.py --dark` inunda desde los bordes sobre lo oscuro. En esta foto el histograma está partido en dos —la mediana del máximo de canal está en **33** y el tercer cuartil en **253**, y el borde no pasa de **59**— así que la separación es limpia y las contraformas de las letras se conservan.

### La marca volvió a su burbuja, y el halo se fue con ella

Cuando salió del panel se quedó suelta sobre el fondo de la página y llevaba
**halo** —el mismo recurso que los glifos del material— porque el «20» es blanco
y sobre un fondo claro necesita su propia sombra. Hoy vuelve a ir dentro de una
`<GlassSurface :radius="999">` y **el halo se quitó**, por dos motivos que van
en este orden:

1. **Ya no hace falta.** Dentro de la burbuja tiene detrás el velo negro del
   material, que es exactamente el contraste que el halo fabricaba.
2. **Y sobre todo, hacía daño.** `filter: drop-shadow(…)` en un ancestro crea un
   **backdrop root**: cualquier vidrio de dentro se queda sin nada que refractar
   y deja de ser vidrio. Es la misma trampa que el doc 02 §7 documenta para
   `.av-glyph`, y aquí se estaba pisando de verdad.

**Al 60 % del alto y no a ras.** Deja unos 11 px de aire a los lados y 4 en las
esquinas, así que se lee como un rótulo DENTRO de una burbuja y no como un icono
recortado. El recorte es casi cuadrado, así que lo que manda es su diagonal: a
partir del 68 % las esquinas tocan el filo. El `overflow: hidden` del cuerpo se
queda de red — hoy no recorta nada, pero un asset más alto no se saldrá.

> **PENDIENTE (D-01):** el logo vectorial. Con un SVG esto son dos rellenos y se acaba el problema.

**Asset:** `public/brand/letrero-20av-cut.webp` (el recortado). El original sin recortar es `letrero-20av.webp`.

---

## 5 · `useThemeStore`

Store de Pinia que gobierna qué fondo está activo y expone:

- `isDark` — si el fondo activo es oscuro. El escenario lo usa para poner `.is-light-bg`, que **sólo afecta al texto que va directo sobre la página**, nunca al que va sobre vidrio.
- `stageStyle` — las custom properties del degradado
- `grainStyle` — el grano

Es lo que alimenta el `<DevPanel>` (el ⚙ de la esquina), que sirve para cambiar de fondo en caliente y ver el material contra los cuatro. **En el e-commerce el DevPanel probablemente no se lleva**, pero el store sí, si se quiere más de un fondo.

---

## 6 · Checklist de este paso

- [ ] `tokens.css` importado **antes** de `glass.css`
- [ ] El grano pintado **encima de la rampa y debajo del vidrio**
- [ ] `overflow-x: clip` en el contenedor, nunca `hidden`
- [ ] Sin `z-index` en el contenedor del contenido principal
- [ ] Verificar sobre `negro`: si el vidrio no se ve, revisar el grano antes que los tokens
- [ ] Verificar sobre `blanco`: es el control — ahí el vidrio **debe** desaparecer casi

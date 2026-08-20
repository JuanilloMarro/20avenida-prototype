# 20av · Material **Velo negro** — implementación

Preset cerrado, listo para copiar. Valores exactos del panel.

> **Ajustes posteriores a la especificación original** — 2026-08-19
>
> - **Velo `0.42` → `0.35`.** Cobertura sigue en 100%. Deja pasar mas de lo que
>   hay detras; a cambio baja el contraste de lo que va encima. Anotado en D-06.
> - **El item activo ya no es un relleno solido.** Lleva `.av-glass-sel`, que es
>   vidrio tambien. Es la unica excepcion a «nada de vidrio sobre vidrio» del §6,
>   y esta tomada a proposito — ver §7.

| | |
|---|---|
| Radio | `18px` |
| Grosor de la lente | `26px` |
| Compresión del filo | `82` |
| Aberración cromática | `0%` (un solo pase) |
| Desenfoque | `3px` |
| Saturación | `1.12` |
| Brillo | `0.85` |
| Velo | `#0E0E0F` · opacidad `0.35` · cobertura `100%` |
| Filo especular | `0.85` |
| Elevación | `0.80` |
| Color del glifo | blanco fijo, al `72%` (activo al `100%`) |
| Luz | sigue al ratón, por elemento |

Cuatro capas, ninguna con fondo opaco:

```
.av-glass                 radio · sombra exterior · isolation
 ├── .av-glass__back      refracción + desenfoque del fondo
 ├── .av-glass__veil      el velo negro
 ├── .av-glass__spec      filo especular (el que sigue al ratón)
 └── .av-glass__body      el contenido
```

---

## 1. `assets/css/glass.css`

```css
/* ══════════════════════════════════════════════════════════════
   20av · Liquid Glass — material "Velo negro"
   ══════════════════════════════════════════════════════════════ */

.av-glass{
  /* ── geometría ────────────────────────────────────────────── */
  --lg-r:        18px;   /* radio                                */
  --lg-edge:     26px;   /* grosor de la lente                   */
  --lg-scale:    82;     /* compresión del filo (va negativo)    */
  --lg-aberr:    0;      /* aberración cromática en %            */

  /* ── materia ──────────────────────────────────────────────── */
  --lg-blur:     3px;
  --lg-sat:      1.12;
  --lg-bri:      0.85;

  /* ── velo ─────────────────────────────────────────────────── */
  --lg-veil:     14, 14, 15;   /* #0E0E0F                        */
  --lg-veil-a:   0.35;         /* opacidad                       */
  --lg-veil-c:   1;            /* cobertura: 0 filos · 1 uniforme */

  /* ── luz ──────────────────────────────────────────────────── */
  --lg-spec:     0.85;   /* filo especular                       */
  --lg-elev:     0.80;   /* elevación → sombra exterior          */
  --lg-ang:      135deg; /* lo reescribe el ratón en runtime     */

  /* ── derivados (no tocar) ─────────────────────────────────── */
  --lip: clamp(5px, calc(var(--lg-edge) * .5), 15px);
  --v1:  calc(var(--lg-veil-a) * (1.55 - 0.55 * var(--lg-veil-c)));
  --v2:  calc(var(--lg-veil-a) * (0.55 + 0.45 * var(--lg-veil-c)));
  --v3:  calc(var(--lg-veil-a) * (1.15 - 0.15 * var(--lg-veil-c)));
  /* con a=0.35 y c=1 las tres valen 0.35 → velo plano */

  position: relative;
  isolation: isolate;
  border-radius: var(--lg-r);
  box-shadow:
    0 calc(var(--lg-elev) * 26px) calc(var(--lg-elev) * 52px)
      calc(var(--lg-elev) * -22px) rgba(20,14,0, calc(var(--lg-elev) * .42)),
    0 calc(var(--lg-elev) *  2px) calc(var(--lg-elev) *  6px)
      calc(var(--lg-elev) *  -2px) rgba(20,14,0, calc(var(--lg-elev) * .18));
  transition: box-shadow .32s ease;
}

.av-glass > *{ border-radius: inherit }

/* ── capa 1 · refracción + desenfoque ───────────────────────────
   Sin lente por defecto: así Safari y Firefox caen solos al
   desenfoque, sin @supports y sin salto de layout.              */
.av-glass__back{
  position: absolute; inset: 0; z-index: 0;
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat)) brightness(var(--lg-bri));
          backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat)) brightness(var(--lg-bri));
}
/* la clase la pone el composable sólo si el navegador soporta url() */
.av-glass.is-lensed .av-glass__back{
  backdrop-filter: var(--lg-lens) blur(var(--lg-blur))
                   saturate(var(--lg-sat)) brightness(var(--lg-bri));
}

/* ── capa 2 · velo ─────────────────────────────────────────────
   Las tres paradas salen de opacidad × cobertura.
   cobertura 0 = carga en los filos · 1 = película uniforme      */
.av-glass__veil{
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(var(--lg-ang),
    rgba(var(--lg-veil), var(--v1))   0%,
    rgba(var(--lg-veil), var(--v2))  46%,
    rgba(var(--lg-veil), var(--v3)) 100%);
}

/* ── capa 3 · specular ─────────────────────────────────────────
   El box-shadow da volumen; el ::after es el filo de luz, y su
   ángulo lo escribe el ratón (--lg-ang).                        */
.av-glass__spec{
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  box-shadow:
    inset 0 calc(var(--lip) *  .28) calc(var(--lip) * .55) calc(var(--lip) * -.42)
      rgba(255,255,255, calc(var(--lg-spec) * .55)),
    inset 0 calc(var(--lip) * -.34) calc(var(--lip) * .55) calc(var(--lip) * -.46)
      rgba(255,255,255, calc(var(--lg-spec) * .26)),
    inset 0 0 calc(var(--lip) * 1.5) calc(var(--lip) * -.9)
      rgba(14,10,0, calc(var(--lg-spec) * .34));
}
.av-glass__spec::after{
  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.4px;
  background: linear-gradient(var(--lg-ang),
    rgba(255,255,255, calc(var(--lg-spec) * 1))    0%,
    rgba(255,255,255, calc(var(--lg-spec) * .14)) 26%,
    rgba(255,255,255, 0)                          48%,
    rgba(255,255,255, calc(var(--lg-spec) * .30)) 72%,
    rgba(255,255,255, calc(var(--lg-spec) * .92)) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
  transition: background .12s linear;   /* suaviza el giro de la luz */
}

.av-glass__body{ position: relative; z-index: 3 }

/* ── glifos ────────────────────────────────────────────────────
   Blanco fijo al 72%: es el "medio iluminado". El activo sube a
   100%. El halo oscuro es lo que los salva cuando por detrás
   pasa algo claro — el vidrio limpio no garantiza contraste.    */
.av-glyph{
  color: #FFFFFF;
  opacity: .72;
  filter:
    drop-shadow(0 0 3px rgba(0,0,0,.80))
    drop-shadow(0 1px 1px rgba(255,255,255,.22));
  transition: opacity .25s ease, color .28s ease;
}
.av-glyph.is-active{ opacity: 1 }
.av-glyph svg{ display: block; width: 21px; height: 21px }

/* ── accesibilidad ─────────────────────────────────────────── */
@media (prefers-reduced-transparency: reduce){
  .av-glass__back{ display: none }
  .av-glass__veil{ background: #14141A }
}
@media (prefers-reduced-motion: reduce){
  .av-glass, .av-glass__spec::after, .av-glyph{ transition: none }
}
```

---

## 2. `composables/useGlassLens.js`

El mapa de desplazamiento: una rampa roja en X y una verde en Y con el centro
neutralizado (`#808080`), de modo que **sólo el filo refracta**. Se regenera por
instancia con un `ResizeObserver` porque depende de ancho, alto, radio y grosor.

Tres cosas que **no** son opcionales, verificadas en Chromium:

1. **`scale` va NEGATIVO.** Con positivo el filo muestrea fuera del recorte del
   elemento, Chromium devuelve transparente y aparece una banda sin filtrar del
   grosor exacto de la lente. Con negativo la lente comprime hacia dentro, que
   además es lo que hace un bisel convexo real.
2. **`color-interpolation-filters="sRGB"`.** Sin esto el filtro interpola en
   linearRGB, el 128 del mapa deja de ser el neutro y toda la superficie se
   desplaza en diagonal.
3. **Los dos topes.** `lente ≤ 34% del lado corto` y `compresión ≤ 3.2 × lente`.
   Sin ellos una píldora pequeña se deforma entera y su contenido deja de leerse.

```js
// composables/useGlassLens.js
import { onMounted, onBeforeUnmount, unref } from 'vue'

const NS = 'http://www.w3.org/2000/svg'
let uid = 0
let defs = null

function defsRoot () {
  if (defs) return defs
  defs = document.createElementNS(NS, 'svg')
  defs.setAttribute('aria-hidden', 'true')
  defs.style.cssText =
    'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
  document.body.appendChild(defs)
  return defs
}

const SUPPORTED = () =>
  typeof CSS !== 'undefined' &&
  CSS.supports('backdrop-filter', 'url(#a)') &&
  !/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)

function displacementMap (w, h, r, edge) {
  const e  = Math.max(1, Math.min(edge, Math.min(w, h) / 2 - 1))
  const ri = Math.max(r - e, 1)
  const iw = Math.max(w - 2 * e, 1)
  const ih = Math.max(h - 2 * e, 1)
  const svg =
    `<svg xmlns="${NS}" width="${w}" height="${h}"><defs>` +
      `<linearGradient id="x" x1="0" y1="0" x2="1" y2="0">` +
        `<stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/>` +
      `</linearGradient>` +
      `<linearGradient id="y" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/>` +
      `</linearGradient>` +
    `</defs>` +
    `<rect width="${w}" height="${h}" fill="#808080"/>` +
    `<rect width="${w}" height="${h}" rx="${r}" fill="url(#x)"/>` +
    `<rect width="${w}" height="${h}" rx="${r}" fill="url(#y)" style="mix-blend-mode:screen"/>` +
    `<rect x="${e}" y="${e}" width="${iw}" height="${ih}" rx="${ri}" fill="#808080"/>` +
    `</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/** lee un token numérico del propio elemento: el CSS manda */
function token (cs, name, fallback) {
  const v = parseFloat(cs.getPropertyValue(name))
  return Number.isFinite(v) ? v : fallback
}

export function useGlassLens (elRef) {
  const id = 'av-lens-' + (++uid)
  let node = null
  let ro = null

  const sync = () => {
    const el = unref(elRef)
    if (!el || !node) return
    const w = Math.round(el.offsetWidth)
    const h = Math.round(el.offsetHeight)
    if (!w || !h) return

    const cs = getComputedStyle(el)
    const r    = Math.min(token(cs, '--lg-r', 18), Math.min(w, h) / 2)
    // tope 1: la lente nunca se come la pieza
    const edge = Math.min(token(cs, '--lg-edge', 26), Math.min(w, h) * 0.34)
    // tope 2: la compresión nunca supera a la lente que la produce
    const scale = -Math.min(token(cs, '--lg-scale', 82), edge * 3.2)
    const soft  = Math.max(edge * 0.70, 2).toFixed(2)
    const uri   = displacementMap(w, h, r, edge)

    node.setAttribute('filterUnits', 'userSpaceOnUse')
    node.setAttribute('primitiveUnits', 'userSpaceOnUse')
    node.setAttribute('color-interpolation-filters', 'sRGB')  // ← obligatorio
    node.setAttribute('x', 0);     node.setAttribute('y', 0)
    node.setAttribute('width', w); node.setAttribute('height', h)
    node.innerHTML =
      `<feImage href="${uri}" x="0" y="0" width="${w}" height="${h}" ` +
        `preserveAspectRatio="none" result="map"/>` +
      `<feGaussianBlur in="map" stdDeviation="${soft}" result="mapSoft"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="mapSoft" scale="${scale}" ` +
        `xChannelSelector="R" yChannelSelector="G"/>`
  }

  onMounted(() => {
    const el = unref(elRef)
    if (!el || !SUPPORTED()) return          // fallback: se queda en blur
    node = document.createElementNS(NS, 'filter')
    node.setAttribute('id', id)
    defsRoot().appendChild(node)
    el.style.setProperty('--lg-lens', `url(#${id})`)
    el.classList.add('is-lensed')
    ro = new ResizeObserver(sync)
    ro.observe(el)
    sync()
  })

  onBeforeUnmount(() => {
    ro && ro.disconnect()
    node && node.remove()
  })

  return { sync }
}
```

> **Aberración cromática (aquí en 0).** Si algún día la subes: tres
> `feDisplacementMap` con `scale × (1±k)`, uno por canal, un `feColorMatrix` que
> deje sólo R, G o B, y recomponer con dos `feBlend mode="screen"`. Cuesta 3× el
> filtro; por encima de ~12 instancias en pantalla, quítala.

---

## 3. `composables/useGlassLight.js` — la luz sigue al ratón

Un único listener global y un `requestAnimationFrame`. Cada superficie calcula
el ángulo **desde su propio centro** hacia el puntero, así que dos piezas en
sitios distintos de la pantalla reciben la luz desde ángulos distintos — que es
lo que hace que se lea como cristal físico y no como un degradado pegado.

```js
// composables/useGlassLight.js
import { onMounted, onBeforeUnmount, unref } from 'vue'

const nodes = new Set()
let raf = 0, mx = 0, my = 0, bound = false

function apply () {
  raf = 0
  for (const el of nodes) {
    const r = el.getBoundingClientRect()
    if (!r.width) continue
    const a = Math.atan2(my - (r.top + r.height / 2),
                         mx - (r.left + r.width / 2)) * 180 / Math.PI + 90
    el.style.setProperty('--lg-ang', a.toFixed(1) + 'deg')
  }
}

function onMove (e) {
  mx = e.clientX; my = e.clientY
  if (!raf) raf = requestAnimationFrame(apply)
}

export function useGlassLight (elRef) {
  onMounted(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = unref(elRef); if (!el) return
    nodes.add(el)
    if (!bound) {
      window.addEventListener('pointermove', onMove, { passive: true })
      bound = true
    }
  })
  onBeforeUnmount(() => {
    const el = unref(elRef); if (el) nodes.delete(el)
    if (bound && nodes.size === 0) {
      window.removeEventListener('pointermove', onMove)
      bound = false
    }
  })
}
```

---

## 4. `components/glass/GlassSurface.vue`

```vue
<script setup>
import { ref } from 'vue'
import { useGlassLens }  from '~/composables/useGlassLens'
import { useGlassLight } from '~/composables/useGlassLight'

const props = defineProps({
  /** radio en px. 0 = usa el token --lg-r (18). 999 = píldora */
  radius: { type: Number, default: 0 },
  tag:    { type: String, default: 'div' }
})

const el = ref(null)
useGlassLens(el)
useGlassLight(el)
</script>

<template>
  <component
    :is="tag"
    ref="el"
    class="av-glass"
    :style="radius ? { '--lg-r': radius + 'px' } : null"
  >
    <span class="av-glass__back" aria-hidden="true" />
    <span class="av-glass__veil" aria-hidden="true" />
    <span class="av-glass__spec" aria-hidden="true" />
    <span class="av-glass__body"><slot /></span>
  </component>
</template>
```

Para píldoras pasa `:radius="999"`: el composable lo recorta solo a
`min(w, h) / 2`, así que no hace falta calcular nada.

---

## 5. Uso — navbar horizontal

```vue
<script setup>
import GlassSurface from '~/components/glass/GlassSurface.vue'
const items = [
  { id: 'buscar',    label: 'Buscar' },
  { id: 'catalogo',  label: 'Catálogo' },
  { id: 'favoritos', label: 'Favoritos' },
  { id: 'bolsa',     label: 'Bolsa' },
  { id: 'cuenta',    label: 'Cuenta' }
]
const active = ref('buscar')
</script>

<template>
  <GlassSurface :radius="30" class="av-navbar" tag="nav">
    <ul class="av-navbar__list">
      <li v-for="it in items" :key="it.id">
        <button
          class="av-glyph"
          :class="{ 'is-active': active === it.id }"
          :aria-label="it.label"
          :aria-current="active === it.id ? 'true' : undefined"
          @click="active = it.id"
        >
          <!-- tu icono aquí -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="11" cy="11" r="6.4" /><path d="M16 16l4 4" />
          </svg>
        </button>
      </li>
    </ul>
  </GlassSurface>
</template>

<style scoped>
.av-navbar{ height: 74px }
.av-navbar__list{
  display: flex; align-items: center; gap: 22px;
  height: 100%; padding: 0 26px; margin: 0; list-style: none;
}
.av-navbar__list button{
  display: grid; place-items: center;
  width: 34px; height: 34px;
  background: none; border: 0; padding: 0; cursor: pointer;
}
</style>
```

---

## 6. Lo que hay que respetar

- **Nada de vidrio sobre vidrio.** Lo que va encima de una superficie de vidrio
  se resuelve con relleno sólido o sólo tipografía. **Con una excepción, la del
  item activo de una barra: ver §7.**
- **Nada de vidrio en la capa de contenido.** Tarjetas de una grilla, filas de
  una tabla, ítems de una lista: sólidos. El vidrio es de la capa que flota.
- **La acción principal no es de vidrio.** El contraste AA de "Añadir a la
  bolsa" no puede depender de la foto que haya detrás ese día.
- **Coste.** Cada instancia es una capa compuesta con `backdrop-filter`. Con
  nav + barra + ficha (≈ 9 instancias) va fluido; no pongas vidrio en una grilla
  larga de producto.
- Con `--lg-veil-a: 0.35` este material **tapa bastante**: sirve para barras y paneles
  sobre foto, no para dejar ver el producto. Para eso baja la opacidad a ~0.10 y
  la cobertura a 0.6.

---

## 7. La selección — la única excepción

El §6 dice que el item activo de una barra va sólido. Se probó y se cambió, a
propósito.

**El problema del sólido:** un relleno claro obliga a invertir el glifo a tinta,
y entonces el item activo es la única pieza de toda la barra con otro color. Se
lee como un botón pegado encima, no como «esta es la opción en la que estás».

**La salida:** que la selección también sea vidrio, pero **más claro que el
velo** y teñida con el amarillo de marca (`#FFD600` al 24 %). No blanco: el
blanco lo único que hace es aclarar, y el tinte además dice de qué marca es.

Y el contenido del item activo **no cambia en nada**: mismo color y mismo grosor
que el de sus vecinos. Lo que marca la selección es el panel, y sólo el panel. En
cuanto el texto sube a blanco puro o a 600, el item deja de pertenecer a la fila
y se lee otra vez como un botón pegado encima — que era el problema del sólido.

Eso deja sin uso `.av-glyph.is-active` (el 100 % del §1) en la barra. La clase se
queda porque puede hacer falta en otro sitio, pero aquí no se usa.

```css
.av-glass-sel{
  --sel-tint: 255, 214, 0;   /* #FFD600 */
  --sel-a:    0.24;

  position: absolute; inset: 0; z-index: -1;
  border-radius: inherit;
  backdrop-filter: blur(2px) brightness(1.45) saturate(1.15);
  background: rgba(var(--sel-tint), var(--sel-a));
  box-shadow:
    inset 0  1px 0 rgba(255,255,255, calc(var(--lg-spec) * .30)),
    inset 0 -1px 0 rgba(0,0,0, .16),
    0 1px 3px rgba(0,0,0, .18);
}
```

**La burbuja del contador** es la misma pieza con más tinte: `.av-glass-bubble`,
mismo amarillo al 78 %. Sube porque a 17 px el dígito tiene que leerse y con el
24 % del panel grande se pierde. Sigue siendo vidrio — refracta y se aclara con
lo que pase por debajo.

**Trampa que costó un bug:** `.av-glyph` lleva `filter: drop-shadow(...)`, y un
ancestro con `filter` crea un **backdrop root** — cualquier `backdrop-filter` de
dentro se queda sin nada que refractar. Así que `.av-glyph` va en un `<span>`
alrededor del icono, **nunca en el botón** que contiene la selección o la
burbuja.

```html
<a class="av-nav__link is-active">
  <span class="av-glass-sel" aria-hidden="true"></span>
  Home
</a>
```

**Por qué no lleva lente propia.** Sería un tercer filtro por item, y la pieza
mide unos 30 px de alto: ahí los dos topes de seguridad dejarían la lente en
nada (`26 → 10`, y con ella la compresión). Lo que sí se ve a ese tamaño es el
desenfoque y el filo, y eso es lo que lleva.

**Lo que hay que vigilar.** Es una capa compuesta más. Una sola —sólo hay un
item activo por barra— no se nota; una grilla de chips seleccionables con esto
en cada uno, sí. Ahí vuelve la regla del §6.

# 01 · El material Liquid Glass

**Archivos:** `assets/css/glass.css` · `components/glass/GlassSurface.vue` · `composables/useGlassLens.js`

Es la pieza más trabajada del prototipo y la que más contexto necesita. Todo el liquid son **17 custom properties dentro de una sola clase**, y la lente SVG las lee del CSS computado en vez de tener constantes propias. Por eso es un sistema y no un efecto.

---

## 1 · Las cuatro capas

`<GlassSurface>` renderiza siempre la misma pila:

```
z-3  .av-glass__body   el contenido (slot)
z-2  .av-glass__spec   filo especular + resplandor interior
z-1  .av-glass__veil   el velo (degradado a 135°)
z-0  .av-glass__back   backdrop-filter: lente + blur + saturate + brightness
```

La raíz aporta `position: relative`, `isolation: isolate`, `border-radius` y la sombra de elevación.

⚠️ **`backdrop-filter` es sensible a los ancestros.** Cualquier ancestro con `filter`, `opacity < 1`, `transform`, `mask` o `will-change` crea un *backdrop root* y deja la capa 0 sin nada que refractar. Al reconstruir, auditar la cadena de cada instancia — los patrones tipo `transition-all` / `hover:scale-105` de Tailwind generan `transform`.

---

## 2 · Los 17 tokens — valores exactos y por qué

```css
:root{ --lg-r-base: 18px }   /* el radio del sistema, también para lo que NO es vidrio */

.av-glass{
  /* ── geometría ── */
  --lg-r:        var(--lg-r-base);
  --lg-edge:     26px;
  --lg-scale:    82;
  --lg-soft:     0.30;
  --lg-aberr:    0;

  /* ── materia ── */
  --lg-blur:     3px;
  --lg-sat:      1.12;
  --lg-bri:      0.85;

  /* ── velo ── */
  --lg-veil:     14, 14, 15;
  --lg-veil-a:   0.45;
  --lg-veil-c:   1;

  /* ── luz ── */
  --lg-spec:     0.60;
  --lg-halo:     0,0,0;
  --lg-glow:     255,255,255;
  --lg-elev:     0.80;
  --lg-frame:    1;
  --lg-ang:      135deg;
}
```

### Los que tienen historia

| Token | Valor | Por qué ese número |
|---|---|---|
| `--lg-soft` | `0.30` | **Estuvo en 0.70 y se estaba comiendo el efecto.** El desenfoque promedia la rampa del mapa con el neutro de los lados, así que los valores fuertes no sobreviven. Medido sobre el mapa ya desenfocado: a 0.70 un panel que prometía 45 px de desplazamiento entregaba **21**. |
| `--lg-veil-a` | `0.45` | Subido desde 0.35. Con 0.35 y brillo 0.85 pasaba el 55% del fondo y las superficies leían claras. A 0.45 pasa el **47%**. El velo no está para dejar ver el fondo: está para que se lea lo que va **encima**. |
| `--lg-spec` | `0.60` | Bajado desde 0.85. El filo se leía como un trazo dibujado encima, no como luz. Es el multiplicador de **todo** lo especular, así que baja a la vez el anillo, el resplandor interior y el filo de la selección — la pieza se apaga entera, no sólo su contorno. |
| `--lg-frame` | `1` | Token y no un `box-shadow: none` suelto porque **la misma superficie cambia de caso según el ancho**: el buscador va a sangre en teléfono y es un desplegable con esquina en escritorio. Con token eso es una línea en la media query. |
| `--lg-ang` | `135deg` **fijo** | Lo reescribía el ratón (`useGlassLight`, un `pointermove` global). **Se eliminó.** Con un gesto rápido el filo saltaba de golpe de un lado al otro y parecía un fallo. Un vidrio quieto se lee mejor como vidrio que uno que persigue el cursor. |

### Derivados — no tocar

```css
--lip: clamp(5px, calc(var(--lg-edge) * .5), 15px);
--v1:  calc(var(--lg-veil-a) * (1.55 - 0.55 * var(--lg-veil-c)));
--v2:  calc(var(--lg-veil-a) * (0.55 + 0.45 * var(--lg-veil-c)));
--v3:  calc(var(--lg-veil-a) * (1.15 - 0.15 * var(--lg-veil-c)));
```

Con `--lg-veil-c: 1` las tres valen lo mismo → velo plano.

---

## 3 · El filo especular — la geometría que no es gusto

El degradado del anillo tiene los picos **al 16% y al 84%**, no en los extremos. Esto es lo único del bloque que es geometría pura, y merece explicación porque su valor no es obvio:

> Un `linear-gradient` mide sobre la **caja**, no sobre la forma. En un círculo la diagonal de la caja es 1.414·d y el círculo sólo ocupa el tramo central: su punto más «arriba-izquierda» cae en el **14.6%** del degradado y el opuesto en el **85.4%**.
>
> Con los picos en 0% y 100% el brillo se queda entero en las esquinas de una caja que no se pinta, y el anillo sólo ve las colas. **Es exactamente lo que pasaba: los botones redondos salían apagados.**

Se probaron tres perfiles sobre fondo oscuro:

| Picos | Corte | Resultado |
|---|---|---|
| 12/88 | 30% | el canto de la píldora seguía encendido más de medio ancho |
| 14/86 | 26% | mejor, pero aún llegaba a la mitad |
| **16/84** | **24%** | el lóbulo muere en el primer tercio y el círculo conserva su arco entero ✅ |

Por debajo del 14.6% el círculo deja de ver el pico, así que 16 es casi el suelo. La ventana es estrecha.

**El perfil es monótono**: máximo en el borde y caída continua hacia dentro, con un **suelo de .17 en el centro**. Suelo y no cero: el contorno tiene que existir en toda la vuelta, o el canto largo de una píldora desaparece y la pieza se queda sin silueta.

### Dos cosas que se quitaron y no deben volver

1. **Los dos resplandores internos** que recorrían entero el borde superior e inferior. En una pieza pequeña pasaban por reflejo; en una barra de 700 px eso no es un reflejo, es una barra encendida.
2. **La viñeta oscura** (`inset 0 0 lip*1.5 lip*-.9 rgba(14,10,0,.34)`), puesta para dar volumen. Era una franja negra que asomaba justo por dentro del filo encendido, y donde el anillo brilla más el salto se leía como un borde negro pegado a la luz. El volumen ya lo dan el velo y el propio anillo.

---

## 4 · Las variantes

Conjunto **cerrado**, validado en el componente y definido en `glass.css`.

```vue
<GlassSurface variant="panel" />
<GlassSurface variant="panel light" />   <!-- se combinan -->
```

### La regla para crear una

> Una variante existe cuando **varios** tokens tienen que moverse **juntos** y quedarse sincronizados. Si sólo cambia uno —el radio de una píldora— eso es el prop `radius` o una línea de CSS.
>
> Dos formas de hacer lo mismo es el desorden que esto vino a quitar.

### `panel` — superficie que se come la pantalla

```css
.av-glass--panel{
  --lg-r:     0px;
  --lg-edge:  80px;
  --lg-scale: 50;
  --lg-soft:  0.30;
  --lg-frame: 0;
}
```

**El recorrido de `--lg-scale`, porque costó y conviene no repetirlo:**

| scale | desplazamiento real | pliegue en el filo |
|---|---|---|
| 145 | 54 px | 11.5% — la imagen se dobla sobre sí misma |
| 80 | 30 px | 0% |
| **50** | **19 px** | **0%** ✅ |

Cada bajada se pidió **mirando el resultado**, no calculando. Aquí la deformación es un acento del filo, no el tema: el centro tiene que quedar limpio y el fondo reconocible. El pliegue aparece por encima de 126, muy lejos.

**Por qué `--lg-edge: 80` y no 26:** con radio 0 la lente queda en una banda recta pegada al borde físico. A 26 px es el 19% de la superficie de un panel de este tamaño; a 80 es el 54%. Pero **más de ~80 tampoco**: el desenfoque del mapa invade el núcleo neutro y la refracción de borde se convierte en un **zoom global** — el fondo se ve ampliado en vez de deformado.

**Por qué `--lg-frame: 0`:** una superficie a sangre no tiene borde que enseñar, y el material entero está construido para enseñarlo. La elevación proyecta sombra sobre lo que hay al lado —y aquí no hay lado— y el especular dibuja un filo de 1.5 px que, sin esquina donde doblar, se lee como el borde de una ventana.

### `light` — velo blanco

```css
.av-glass--light{
  --lg-veil:   255,255,255;
  --lg-veil-a: 0.16;      /* ⚠️ ver §7 — hay que subirlo */
  --lg-bri:    1.10;
  --lg-spec:   0.72;
  --lg-halo:   255,255,255;
  --lg-glow:   0,0,0;

  --av-on-glass:        rgba(14,14,15,.72);   /* ⚠️ ver §7 */
  --av-on-glass-strong: var(--av-ink);
  --av-on-glass-hover:  rgba(14,14,15,.10);
  --av-on-glass-hair:   rgba(14,14,15,.14);
}
```

**Por qué es una variante y no una línea:** no basta con cambiar el velo. Lo que va **encima** tiene que invertirse a la vez o queda texto blanco sobre vidrio blanco. Velo, halo del glifo y tokens de contenido se mueven en el mismo bloque.

**Para qué existe:** permite fichas de vidrio dentro de un panel **sin perder el fondo**, que es el efecto buscado.

---

## 5 · ⚠️ ARREGLO PENDIENTE — variante `sheet` para listas

**Estado: NO aplicado en el prototipo. Aplicar al reconstruir.**

### El problema

Cada instancia de vidrio es una capa compuesta. **Lo caro no es el vidrio: es la lente.** El velo y el desenfoque son baratos; el `feDisplacementMap` con su mapa `data:` URI por instancia no.

Con `limit: 24` por página de catálogo, un `ProductCard` de vidrio son **24 filtros SVG** en pantalla, contra un presupuesto documentado de ≈9 instancias.

Y el efecto que se paga es marginal: en una ficha de ~62 px de alto, el **tope 1** recorta la lente a `62 × 0.34 = 21 px` y el **tope 2** la compresión a `67`. La deformación a ese tamaño casi no se ve.

### La solución

```css
/* en .av-glass, junto al resto de tokens */
--lg-lens-on: 1;

/* ── SHEET ─ vidrio de lista: velo, brillo y filo, SIN lente ──────────
   Para piezas que se repiten: fichas de producto, filas de resultado.
   Conserva el material —se ve igual a tamaño de ficha— y quita lo único
   que escala mal. */
.av-glass--sheet{
  --lg-lens-on: 0;
  --lg-frame:   0;
}
```

```js
// en useGlassLens.js, dentro de sync(), justo después de leer `cs`:
if (token(cs, '--lg-lens-on', 1) === 0) return false
```

El `return false` ya está soportado: sin lente la pieza cae al fallback de desenfoque, que es exactamente lo que se quiere.

Y añadir `'sheet'` a la lista cerrada del validador.

---

## 6 · ⚠️ ARREGLO PENDIENTE — la fuga de tokens

**Estado: NO aplicado. Es el hallazgo de mayor severidad estructural.**

En `AppNav.vue`, dentro de la media query de escritorio, el desplegable de búsqueda **deshace la variante `panel` reescribiendo cuatro tokens crudos**:

```css
/* ❌ ASÍ NO */
.av-search {
  --lg-r:     var(--lg-r-base);
  --lg-edge:  26px;
  --lg-scale: 82;
  --lg-frame: 1;
}
```

El *por qué* es correcto: a ~240 px de ancho una lente de 80 se comería la pieza. La *forma* es el anti-patrón — el día que la base cambie, esta copia se queda atrás en silencio.

### La solución — variante `dropdown`

```css
/* ✅ en glass.css, junto a las otras */
.av-glass--dropdown{
  --lg-r:     var(--lg-r-base);
  --lg-edge:  26px;
  --lg-scale: 82;
  --lg-frame: 1;
}
```

y aplicarla condicionalmente en vez de deshacerla:

```vue
<GlassSurface :variant="esEscritorio ? 'dropdown' : 'panel'" />
```

con `useMediaQuery('(min-width: 1280px)')` de `@vueuse/core`.

---

## 7 · ⚠️ ARREGLO PENDIENTE — `light` y el contraste AA

**Estado: NO aplicado. Tiene implicación legal en algunos mercados.**

### El problema, con números

La ficha del buscador usa `light` **y lleva texto corrido** (nombre, línea, precios).

En el **peor caso** (fondo negro bajo el panel), el velo blanco al 0.16 deja la superficie en una luminancia relativa ≈ `0.16`. Con tinta `#0E0E0F` (L ≈ `0.0044`):

```
contraste = (0.16 + 0.05) / (0.0044 + 0.05) = 3.9 : 1     ← AA exige 4.5
```

Y con la tinta al **72%** en vez de sólida, el texto se aclara hacia la superficie y cae aún más.

### La tensión

Subir el velo arregla el contraste **pero mata justo lo que `light` existe para conservar**: ver el fondo. Ir a `0.42` deja pasar sólo el 58%.

### La solución — subir la tinta, no el velo

La convención del 72% se diseñó para **blanco sobre oscuro**, donde sobra contraste. En `light` la polaridad se invierte y esa convención deja de valer.

Con **tinta sólida**, el velo mínimo para AA:

```
(L + 0.05) / (0.0044 + 0.05) ≥ 4.5   →   L ≥ 0.195
```

| Vía | Velo necesario | Fondo que pasa |
|---|---|---|
| mantener tinta al 72% | 0.42 | 58% |
| **tinta sólida** | **~0.20** (usar 0.24 con margen) | **76%** ✅ |

```css
.av-glass--light{
  /* … lo demás igual … */
  --lg-veil-a: 0.24;
  --av-on-glass:        var(--av-ink);
  --av-on-glass-strong: var(--av-ink);
}
```

**Matiz:** con tinta sólida se pierde el escalón entre texto principal y secundario que daba el 72%. En la ficha ya está resuelto por peso y tamaño. La regla pasa a ser: **en `light`, la jerarquía se hace con peso, no con opacidad.**

**Pendiente de verificación:** son cálculos de luminancia, no medición. Medir con contrastímetro sobre la ficha real con el fondo más claro y el más oscuro del catálogo.

---

## 8 · Otros arreglos pendientes (menores)

| # | Qué | Dónde |
|---|---|---|
| a | `.av-glass__spec::after` está declarado **tres veces** en `glass.css` (≈154, ≈192, ≈228). Las dos primeras son idénticas. ~20 líneas muertas. | `glass.css` |
| b | La cabecera de `GlassSurface.vue` **todavía declara la regla retirada** de "nada de vidrio sobre vidrio". Reescribir con la regla R3. | `GlassSurface.vue:24` |
| c | Un comentario en `AppNav.vue:914` dice *"sin variante, velo negro, se descartó light"* y el código dos líneas abajo dice `variant="light"`. | `AppNav.vue:914` |
| d | `--lg-spec` de `light` (0.72) es "el 0.60 de la base +20%" a mano, porque un `calc()` sería referencia cíclica. **Solución:** separar `--lg-spec-base` (entrada) de `--lg-spec` (uso), y entonces `light` puede escribir `calc(var(--lg-spec-base) * 1.2)`. | `glass.css` |
| e | La lista de variantes va **inline** en el validador porque `defineProps()` se iza fuera del `setup()` y no puede leer una constante local. **Solución:** moverla a `lib/glass-variants.js` — `defineProps` sí puede leer un import. | `GlassSurface.vue:56` |

---

## 9 · La lente (`useGlassLens.js`)

Genera por instancia un `<filter>` SVG y lo enchufa vía `backdrop-filter: url(#id)`.

```
feImage → feGaussianBlur → feFlood(#808080) → feComposite(over) → feDisplacementMap
```

### Los cinco invariantes que no son opcionales

**1. `scale` va NEGATIVO.** Con positivo el filo muestrea fuera del recorte del elemento, Chromium devuelve transparente y aparece una banda sin filtrar del grosor exacto de la lente. Con negativo la lente comprime hacia dentro, que además es lo que hace un bisel convexo real.

**2. `color-interpolation-filters="sRGB"`.** Sin esto el filtro interpola en linearRGB, el 128 del mapa deja de ser el neutro y **toda la superficie se desplaza en diagonal**.

**3. Los dos topes.**
- Tope 1: `edge ≤ 34% del lado corto`
- Tope 2: `scale ≤ 3.2 × edge`

> Consecuencia práctica que hay que conocer: **en piezas pequeñas mandan los topes, no los tokens.** Pedir `--lg-edge: 80` en un botón de 44 px no hace nada.

**4. La lente se enchufa DESPUÉS de medir, nunca antes.** Un `<filter>` vacío referenciado desde un `backdrop-filter` no es "un filtro que no hace nada": la spec dice que el resultado es transparente, y **Chromium tira la cadena entera** — se pierden la lente, el desenfoque, la saturación y el brillo. Por eso `--lg-lens` y la clase `is-lensed` sólo se ponen con el filtro ya lleno.

**5. El mapa desenfocado va compuesto SOBRE un gris neutro opaco.** El mapa codifica el desplazamiento en el canal: 128 = no muevas nada, 0 empuja a un lado, 255 al otro. El `feGaussianBlur` difumina también hacia **fuera**, y fuera no hay nada — y "nada" en SVG es **negro transparente, o sea 0**. No 128.

> Consecuencia medida: el borde izquierdo ya valía 0 y no cambiaba, mientras el derecho valía 255 y el desenfoque lo arrastraba hacia 0. Daba **45 px de deformación a la izquierda contra 0.2 a la derecha** — la pieza parecía doblar sólo por un lado. El `feFlood` + `feComposite over` lo arreglan.

### Los cuatro observadores

Cada uno tapa el agujero del anterior. **Ninguno sobra.**

| Observador | Cubre |
|---|---|
| `ResizeObserver` | cambios de tamaño |
| `IntersectionObserver` | la pieza pasa a ser visible |
| `MutationObserver` (`style`, `class`) | `v-show`, que muta el `style` inline |
| `window.resize` | piezas que aparecen por **media query** — el `display` lo cambia una regla CSS, no el DOM, así que no hay mutación de atributo que ver |

Más `defineExpose({ sync })` para disparo manual — porque quien abre un panel es el único que sabe con certeza cuándo hay algo que medir.

### Soporte

`CSS.supports('backdrop-filter','url(#a)')` **más** una detección explícita de WebKit de Apple: Safari acepta la gramática pero no la ejecuta. Sin lente, la pieza cae sola al desenfoque — sin `@supports` y sin salto de layout.

> **Pendiente:** decidir y documentar qué se ve en Safari iOS. Es una porción grande del tráfico móvil de una tienda y hoy no está expresado como contrato en ninguna parte.

---

## 10 · Cómo añadir un panel nuevo

```vue
<script setup>
import GlassSurface from '~/components/glass/GlassSurface.vue'
const panel = ref(null)
const abierto = ref(false)

function abrir() {
  abierto.value = true
  nextTick(() => panel.value?.sync())   // ← obligatorio con v-show
}
</script>

<template>
  <GlassSurface v-show="abierto" ref="panel" variant="panel" class="mi-panel">
    …
  </GlassSurface>
</template>
```

Hereda **todo**: deformación, iluminación, velo, brillo, opacidad, elevación, marco. Cero valores escritos.

### Propuesta: que las dos trampas dejen de ser conocimiento tribal

```js
// composables/useGlassPanel.js
export function useGlassPanel() {
  const panel = ref(null)
  const abierto = ref(false)

  function abrir() {
    abierto.value = true
    nextTick(() => panel.value?.sync())
  }
  function cerrar() { abierto.value = false }

  return { panel, abierto, abrir, cerrar }
}
```

Es la diferencia entre un sistema y un manual de instrucciones.

---

## 11 · Lo que el componente NO puede hacer cumplir solo

- **Nada de vidrio en la acción principal.** El contraste AA de «Añadir a la bolsa» no puede depender de la foto que haya detrás ese día.
- **Presupuesto de instancias.** Con nav + barra + ficha (≈9) va fluido. Nada de vidrio con lente en una grilla larga → usar `sheet` (§5).
- **Anidamiento máximo dos niveles** (regla R3).

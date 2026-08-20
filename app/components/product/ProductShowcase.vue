<script setup>
/**
 * <ProductShowcase> — el frame de producto a pantalla completa, con scrollover.
 *
 * Dos capas y tres filas, que es todo lo que hay:
 *
 *   FRAME DE ATRÁS   el texto gigante de marca. Nada más.
 *   FRAME DE ENFRENTE
 *     fila 1   texto corto, centrado en horizontal y en vertical
 *     fila 2   el zapato — se monta sobre el texto del fondo
 *     fila 3   dos columnas: info izquierda · info derecha
 *
 * El scrollover: un carril alto con la pieza `sticky` dentro. Mientras el
 * carril cruza el viewport la composición se queda quieta y lo único que gira
 * es el zapato. El texto gigante y las dos columnas no se mueven — es el
 * producto el que se enseña, no la página la que se agita.
 *
 * Variantes, dos ejes independientes:
 *   `variant`  el colorway (assets/js/colorways.js), que incluye la secuencia
 *              de frames. Añadir un zapato es añadir una entrada ahí.
 *   `frame`    'fluid' ocupa el viewport y hace el scrollover · 'fixed' fuerza
 *              1440×1024 exactos y un solo frame, que es la medida de diseño y
 *              la que sirve para capturas y para llevarlo a Figma.
 *
 * El contenido entra por props, con slots para los dos bloques de info cuando
 * un producto pida algo que no cabe en el molde.
 */
import { COLORWAYS, COLORWAY_IDS, DEFAULT_COLORWAY, toCss } from '~/assets/js/colorways'

const props = defineProps({
  variant: {
    type: String,
    default: DEFAULT_COLORWAY,
    validator: v => COLORWAY_IDS.includes(v),
  },
  frame: {
    type: String,
    default: 'fluid',
    validator: v => ['fluid', 'fixed'].includes(v),
  },
  /** Cuánto scroll cuesta pasar de un frame al siguiente, en vh. */
  hold: { type: Number, default: 55 },
  /** Sólo en frame="fixed": qué frame de la secuencia se pinta. */
  still: { type: Number, default: 0 },
  /** El texto gigante del frame de atrás. */
  word: { type: String, default: 'ADIDAS' },
  /** Fila 1 — texto corto, centrado. */
  eyebrow: { type: String, default: '' },
})

const cw = computed(() => COLORWAYS[props.variant] || COLORWAYS[DEFAULT_COLORWAY])
const frames = computed(() => cw.value.frames || [])
const eyebrowText = computed(() => props.eyebrow || `${cw.value.name} — ${cw.value.line}`)

const scrolls = computed(() => props.frame === 'fluid' && frames.value.length > 1)

const track = ref(null)
const { index: scrollIndex } = useScrollSequence(track, () => (scrolls.value ? frames.value.length : 0))

/* El texto del fondo llena el ancho del frame. Con un tamaño fijo en vw el
   margen a los lados dependería de cuántas letras tenga la palabra. */
const back = ref(null)
const wordEl = ref(null)
useFitText(wordEl, back, 0.995)

const active = computed(() => {
  if (!scrolls.value) return Math.min(frames.value.length - 1, Math.max(0, props.still))
  return scrollIndex.value
})

/* El carril: una pantalla para la pieza fija, más `hold` por cada frame extra.
   Con 6 frames y hold 55 son 375vh — 275 de recorrido, 55 por frame. */
const trackStyle = computed(() => (scrolls.value
  ? { height: `calc(100dvh + ${(frames.value.length - 1) * props.hold}vh)` }
  : null))
</script>

<template>
  <section class="ps" :class="[`ps--${frame}`]" :style="toCss(variant)">
    <div ref="track" class="ps__track" :style="trackStyle">
      <div class="ps__sticky">
        <!-- ── FRAME DE ATRÁS ─────────────────────────────────────────── -->
        <div ref="back" class="ps__back" aria-hidden="true">
          <span ref="wordEl" class="ps__word">{{ word }}</span>
        </div>

        <!-- ── FRAME DE ENFRENTE ──────────────────────────────────────── -->
        <div class="ps__front">
          <!-- fila 1 -->
          <div class="ps__eyebrow">
            <p>{{ eyebrowText }}</p>
          </div>

          <!-- fila 2 · la secuencia. Todos los frames apilados; sólo cambia
               cuál es visible, así el navegador los tiene ya decodificados. -->
          <div class="ps__stage">
            <div class="ps__seq">
              <img
                v-for="(f, i) in frames"
                :key="f.src"
                :src="f.src"
                :alt="`${cw.name} — ${f.label}`"
                class="ps__shoe"
                :class="{ 'is-on': i === active, 'is-flow': i === 0 }"
                :fetchpriority="i === 0 ? 'high' : 'auto'"
                decoding="async"
              >
            </div>
          </div>

          <!-- fila 3 -->
          <div class="ps__info">
            <div class="ps__info-l">
              <slot name="left">
                <p class="ps__label">Original</p>
                <p class="ps__name">{{ cw.name }}</p>
                <p class="ps__price">{{ cw.price }}</p>
                <div class="ps__selects">
                  <span class="ps__select">Color</span>
                  <span class="ps__select">Size</span>
                </div>
              </slot>
            </div>

            <div class="ps__info-r">
              <slot name="right">
                <p class="ps__index">{{ String(active + 1).padStart(2, '0') }}</p>
                <p class="ps__line">{{ frames[active]?.label || cw.line }}</p>
                <div v-if="scrolls" class="ps__ticks" aria-hidden="true">
                  <i v-for="(f, i) in frames" :key="f.src" :class="{ 'is-on': i === active }" />
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ps {
  position: relative;
  background: var(--ps-surface);
  color: var(--ps-ink);
}
/* la medida de diseño, exacta — para capturas y para Figma */
.ps--fixed { width: 1440px; height: 1024px; margin-inline: auto; overflow: hidden; }
.ps--fixed .ps__sticky { height: 1024px; }

.ps__track { position: relative; }
.ps__sticky {
  position: sticky;
  top: 0;
  height: 100dvh;
  overflow: hidden;
  isolation: isolate;
}
.ps--fixed .ps__track { height: 1024px; }
.ps--fixed .ps__sticky { position: relative; }

/* ── frame de atrás ────────────────────────────────────────────────────── */
.ps__back {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 0;
  pointer-events: none;
}
/* el tamaño de aquí es solo el punto de partida: useFitText lo reescala para
   que la palabra llene el ancho del frame, sea la palabra que sea — «ADIDAS» y
   «NIKE» acaban los dos pegados a los dos bordes */
.ps__word {
  font-size: 26vw;
  font-weight: 900;
  letter-spacing: -.055em;
  /* CSS aplica el letter-spacing TAMBIÉN después de la última letra, así que la
     caja acaba .055em antes que la tinta: centrada, dejaba margen a la
     izquierda y se comía la última letra por la derecha. Este padding devuelve
     justo ese hueco a la caja y el centrado vuelve a ser simétrico. Va en em
     para que escale con el tamaño que le ponga useFitText. */
  padding-inline-end: .055em;
  line-height: .8;
  white-space: nowrap;
  color: var(--ps-word);
  /* Difuminado para que el foco se lo lleve el zapato.
     Un `blur` uniforme y nada mas: mantiene los contraformas de las letras, asi
     que la palabra se sigue leyendo — a 344 px de cuerpo, 7 px de blur son el
     2% de la altura de mayuscula. Lo que la convertiria en mancha es bajarle el
     contraste o subir el blur hasta cerrar las contraformas; ninguna de las dos
     se hace aqui.
     La sombra del texto se quita: con el blur puesto solo aportaba suciedad. */
  filter: blur(var(--ps-word-blur, 7px));
  /* baja un pelo respecto al centro óptico: el zapato se monta encima y el
     texto tiene que asomar por arriba y por abajo, no quedar tapado */
  transform: translateY(-2%);
}

/* ── frame de enfrente ─────────────────────────────────────────────────── */
.ps__front {
  position: relative;
  z-index: 1;
  height: 100%;
  display: grid;
  /* las tres filas */
  grid-template-rows: auto minmax(0, 1fr) auto;
  padding: var(--av-nav-space) clamp(24px, 4vw, 64px) clamp(28px, 4vh, 56px);
}

/* fila 1 — centrado en horizontal Y en vertical dentro de su fila.
   z-index por encima de la secuencia: las vistas verticales (cenital, suela)
   sobresalen de su fila y pasan por detrás de este texto, no por encima. */
.ps__eyebrow {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  padding: clamp(8px, 2vh, 26px) 0;
}
.ps__eyebrow p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: .42em;
  text-transform: uppercase;
  color: var(--ps-ink-soft);
  text-align: center;
}

/* fila 2 — la secuencia.
   El ancho manda y el alto sale del propio lienzo: el primer frame va en flujo
   y los otros cinco encima en absoluto. Los seis comparten lienzo —el recorte
   se hizo con caja unión— así que basta con que uno lo dimensione, y así no hay
   que escribir la proporción a mano en ningún sitio.

   La caja puede ser MÁS ALTA que su fila: `overflow: visible` se lo permite, y
   por eso las vistas verticales pasan por detrás del texto de arriba y del
   bloque de info, que llevan z-index por encima. */
.ps__stage { display: grid; place-items: center; min-height: 0; overflow: visible; }

/* ── El tamaño del zapato: manda el ALTO ────────────────────────────────────
   Con una sola escala para los seis frames no se pueden elegir los dos ejes por
   separado, y no es una limitación del CSS sino del zapato: la tinta del perfil
   mide 1055 px de ancho y la de la cenital 1068 de alto. Son casi el mismo
   número —un zapato visto de lado es tan largo como visto desde arriba—, así
   que fijar el ancho del perfil fija el alto de la cenital, y al revés.

   Como lo que molestaba era el alto, el alto es lo que se acota. La cenital es
   la que decide: su tinta ocupa el 95.7% del alto del lienzo, así que

       alto_lienzo  = --ps-shoe-max-h / 0.957
       ancho_lienzo = alto_lienzo × (1103/1116)     ← proporción del lienzo
                    = --ps-shoe-max-h × 1.032

   El tope va en `vh` y no en `%` a propósito: un porcentaje se mide sobre el
   ancho de la fila, así que en una pantalla baja y ancha el zapato volvería a
   salirse por arriba. En `vh` el tope aguanta sea cual sea la proporción.

   El `58%` es solo la red para pantallas estrechas y altas, donde el que se
   pasaría es el ancho. */
.ps__seq {
  position: relative;
  --ps-shoe-max-h: 68;   /* % del alto de pantalla que NO pasa ningún frame */
  width: min(58%, calc(var(--ps-shoe-max-h) * 1.032vh), 910px);
}
.ps__shoe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  /* fundido muy corto: a 90 ms lee como continuidad, no como diapositiva, y no
     deja fantasma al scrollear rápido */
  transition: opacity .09s linear;
  /* La sombra la pone el CSS y sigue la silueta recortada — la del estudio se
     quitó al recortar, porque sobre un fondo de color aclararía en vez de
     oscurecer.

     Dos sombras, no una: una corta y densa que ancla el zapato al suelo, y otra
     larga y muy difusa que lo separa del fondo. Una sola sombra media es lo que
     se lee como una mancha gris — el gris no viene de que sea poco negra, viene
     de que su borde tiene la misma dureza en todo el recorrido. */
  filter:
    drop-shadow(0 12px 14px rgba(0, 0, 0, .30))
    drop-shadow(0 46px 56px rgba(0, 0, 0, .38));
}
/* el que va en flujo es el que le da el alto a la caja; los demas se apilan
   encima en absoluto. Sigue oculto si no es el activo. */
.ps__shoe.is-flow { position: relative; height: auto; }
.ps__shoe.is-on { opacity: 1; }

/* ── fila 3 — dos columnas ─────────────────────────────────────────────── */
.ps__info {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: end;
  gap: 24px;
}
.ps__info-r { text-align: right; }

.ps__label {
  margin: 0;
  font-size: 10.5px;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--ps-ink-soft);
}
.ps__name { margin: 2px 0 0; font-size: 19px; font-weight: 700; letter-spacing: -.02em; }
.ps__price { margin: 1px 0 0; font-size: 14px; font-variant-numeric: tabular-nums; color: var(--ps-ink-soft); }

.ps__selects { display: flex; gap: 12px; margin-top: 16px; }
.ps__select {
  min-width: 132px;
  padding: 10px 14px;
  border: 1px solid var(--ps-hair);
  border-radius: 4px;
  font-size: 11.5px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ps-ink-soft);
}

.ps__index {
  margin: 0;
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.ps__line {
  margin: 6px 0 0;
  font-size: 10.5px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--ps-ink-soft);
  min-height: 1em;
}

/* el contador de la referencia, hecho útil: dice por dónde va la secuencia */
.ps__ticks { display: flex; gap: 5px; justify-content: flex-end; margin-top: 10px; }
.ps__ticks i {
  width: 16px;
  height: 2px;
  border-radius: 2px;
  background: var(--ps-hair);
  transition: background .18s ease;
}
.ps__ticks i.is-on { background: var(--ps-ink); }

@media (max-width: 900px) {
  .ps__seq { width: 92%; }
  .ps__info { grid-template-columns: 1fr; }
  .ps__info-r { text-align: left; }
  .ps__ticks { justify-content: flex-start; }
}

/* Sin movimiento: la secuencia deja de depender del scroll y se queda en el
   primer frame. El resto de la composición no cambia. */
@media (prefers-reduced-motion: reduce) {
  .ps__shoe { transition: none; }
}
</style>

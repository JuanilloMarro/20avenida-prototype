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
 *     fila 3   tres huecos: info izquierda · comprar · info derecha
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
import { ShoppingBag } from 'lucide-vue-next'
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
  /**
   * El texto gigante del frame de atrás.
   *
   * VA EN VERSALES, y es la unica excepcion a la regla R1 en todo el proyecto:
   * aqui la palabra no es un titulo que se lee, es la MASA que ocupa el fondo
   * del encuadre. Las versales las pone `.ps__word` con `text-transform`, no
   * este valor — asi el dato sigue siendo el nombre de la marca y el que decide
   * como se pinta es quien lo pinta.
   *
   * «Nike» porque el zapato del escaparate es el Mind 001. Iba «Adidas» cuando
   * era el Samba; si se cambia el colorway por defecto hay que cambiar esto
   * tambien — son dos sitios y no uno, que es deuda conocida: la marca deberia
   * salir del propio colorway.
   */
  word: { type: String, default: 'Nike' },
  /** Fila 1 — texto corto, centrado. */
  eyebrow: { type: String, default: '' },
})

/* MISMA FIRMA que el acordeón y el rollo: `{ id, size }`. Aquí `size` va
   siempre `null` —el showcase no pide talla, sus dos «Color» y «Size» son
   maquetas sin estado— pero la forma del evento se respeta igual para que la
   página pueda enganchar los tres al mismo manejador. Cuando exista la bolsa,
   este botón lleva a elegir talla; el acordeón y el rollo ya la traen. */
const emit = defineEmits(['buy'])

const cw = computed(() => COLORWAYS[props.variant] || COLORWAYS[DEFAULT_COLORWAY])
const frames = computed(() => cw.value.frames || [])
/* PUNTO MEDIO, no raya. La raya —«—»— es un signo de puntuación: abre un inciso
   y pide una pausa de lectura, y lo que hay aquí no es una frase sino dos datos
   del mismo rango puestos uno al lado del otro. El punto medio es un SEPARADOR y
   no dice nada más. Es además el que ya usa el rollo en su ficha, así que los
   dos componentes separan igual. */
const eyebrowText = computed(() => props.eyebrow || `${cw.value.name} · ${cw.value.line}`)

const scrolls = computed(() => props.frame === 'fluid' && frames.value.length > 1)

const track = ref(null)
const { index: scrollIndex } = useScrollSequence(track, () => (scrolls.value ? frames.value.length : 0))

/* El texto del fondo llena el ancho del frame. Con un tamaño fijo en vw el
   margen a los lados dependería de cuántas letras tenga la palabra.

   Y con TOPE DE ALTO al 42% del frame. Sin él, una marca de pocas letras se
   pasa: «NIKE» necesita casi vez y media el cuerpo de «ADIDAS» para llenar el
   mismo ancho, y a ese cuerpo la palabra se sale del encuadre por arriba y por
   abajo. Con el tope manda el más pequeño de los dos — llena el ancho si cabe
   de alto, y si no, llena el alto y deja aire a los lados.

   42% y no más porque el zapato se monta encima y la palabra tiene que asomar,
   no rodearlo. */
const back = ref(null)
const wordEl = ref(null)
/* LA CAJA CONTRA LA QUE SE AJUSTA ES `.ps__stage`, LA BANDA — no `.ps__back`.
   Es el cambio que arregla esto de verdad, y merece la pena contar el camino
   porque el numero anterior parecia razonable y no lo era.

   `.ps__back` es la seccion ENTERA, asi que cualquier fraccion de su alto
   describe una caja que la palabra no debe respetar: por arriba esta la linea de
   marca y colorway, y por abajo el nombre, el precio y los selectores. Con
   `0.86` la tinta salia de 808 px sobre 940 y se comia las dos cosas — medido,
   la fraccion se cumplia clavada. El mecanismo estaba bien; la caja, no.

   Y NO SIRVE bajar el numero, que fue el primer intento. Los dos textos que hay
   que esquivar miden lo MISMO en pixeles a cualquier altura de ventana, asi que
   la banda libre no es una fraccion constante del alto: se estrecha en pantallas
   bajas. `0.62` despejaba a 940 con 39 px arriba y 30 abajo, y a 720 se pasaba —
   5 arriba y **-6** abajo, encima del bloque. Cualquier constante falla en un
   extremo o en el otro.

   `.ps__stage` es la fila 2 de la rejilla del frente, o sea literalmente el
   hueco que dejan libre la fila 1 y la fila 3. Comprobado: empieza donde acaba
   el subtitulo y acaba donde empieza el bloque de abajo, a las dos alturas. Ya
   no hay que estimar la banda porque la banda es un elemento, y se mueve sola
   con la disposicion.

   LO QUE SE PAGA: la banda respeta el margen lateral —es 102 px mas estrecha que
   la seccion a 1280— asi que la palabra deja de ir a sangre y se alinea con el
   resto del contenido. Se acepta: era lo unico que la sacaba del margen comun.

   `0.88` Y NO `0.95` por una asimetria que queda: la palabra se centra en
   `.ps__back` —la seccion— mientras que la banda NO esta centrada en ella,
   porque el bloque de abajo es mas alto que el subtitulo de arriba. Ese desfase
   se come el aire por abajo antes que por arriba, y 0.88 es lo que deja las dos
   holguras en positivo de 720 a 1080. */
const banda = ref(null)
useFitText(wordEl, banda, 0.995, 0.88)

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
          <div ref="banda" class="ps__stage">
            <div class="ps__seq">
              <img
                v-for="(f, i) in frames"
                :key="f.src"
                :src="f.src"
                :alt="`${cw.name} · ${f.label}`"
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

            <!-- EL BOTÓN VA EN LA FILA 3 Y NO FLOTANDO SOBRE EL FRAME, y es la
                 diferencia entre estar centrado y estar en medio: en su hueco
                 propio de la rejilla comparte línea de base con el precio y con
                 el contador, así que el borde inferior de la composición sigue
                 siendo uno. Puesto en absoluto quedaría encima de la fila y
                 taparía a alguien en cuanto la ventana se estrechara.

                 SÓLIDO, y el único macizo de toda la pieza. Aquí no cabe el
                 vidrio: detrás pasa el color plano del colorway, que cambia con
                 el zapato, y un velo translúcido sobre cuatro fondos distintos
                 es cuatro botones distintos. En tinta llena se lee igual sobre
                 todos, y de paso es lo que lo separa de los dos recuadros de
                 «Color» y «Size» que tiene al lado — aquéllos se eligen, éste se
                 pulsa. -->
            <GlassSurface :radius="999" class="ps__buy">
              <button
                type="button"
                @click="emit('buy', { id: variant, size: null })"
              >
                <ShoppingBag :stroke-width="1.8" /> Comprar ahora
              </button>
            </GlassSurface>

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
  /* El margen lateral del frame. Vive aquí y no dentro del `padding` para que
     el bloque de móvil lo cambie en un sitio y no reescriba la regla entera. */
  --ps-pad-x: var(--av-gutter);
  /* La unidad de alto del frame. En `fluid` es el viewport; en `fixed` se pina
     a 1024 (ver el bloque del final), y por eso pasa por una variable en vez de
     escribir `vh` a pelo en la fórmula del zapato. */
  --ps-vh: 1vh;
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
   que la palabra llene el ancho del frame, sea la palabra que sea — «Adidas» y
   «Nike» acaban las dos pegadas a los dos bordes */
.ps__word {
  /* LA DE DISPLAY, la única pieza del proyecto que no va con la letra del
     sistema. Hoy es BEBAS NEUE — condensada de palo seco, con `Roboto Condensed`
     y `Arial Narrow` de reserva.

     Ojo si se lee documentación vieja: aquí decía «Playfair Display, una didona
     de contraste altísimo y remates de pelo», y describía una letra que ya no
     es. El token cambió y el comentario se quedó atrás; queda escrito para que
     nadie vuelva a calibrar el interletrado contra unos remates que no existen
     — que es justo lo que explica el cambio de signo del trazo de aquí abajo.

     El token se llama `display` y no `sans` por lo de siempre: es para cuerpos
     enormes y para nada más. */
  font-family: var(--av-font-display);
  /* VERSALES. Es la excepcion a la regla de la casa —primera mayuscula y el
     resto minusculas— y va escrita: aqui la palabra no es un titulo que se lee,
     es la MASA que ocupa el fondo del encuadre, y en caja baja las astas
     descendentes obligan a dejar aire por abajo que rompe la banda. */
  text-transform: uppercase;
  font-size: 26vw;
  font-weight: 900;
  /* EL TRAZO SE ABRE DE -.055em A -.015em AL CAMBIAR DE LETRA, y no es un
     retoque: el -.055 estaba calculado para una grotesca de palo seco, donde
     apretar sólo acerca dos verticales. Playfair tiene REMATES, que son lo que
     más sobresale de la caja de cada letra — a ese trazo, el remate de la `d` se
     mete debajo del de la `i` y la palabra se lee como una sola forma pegada,
     que es exactamente lo contrario de lo que hace una didona. Sigue siendo
     negativo, que es lo que mantiene la mancha compacta; sólo deja pasar el
     remate. */
  letter-spacing: var(--av-track-display);
  /* CSS aplica el letter-spacing TAMBIÉN después de la última letra, así que la
     caja no acaba donde acaba la tinta y el centrado sale torcido. Este padding
     devuelve el mismo hueco por el otro lado y la caja vuelve a ser simétrica.

     OJO, QUE CAMBIÓ DE LADO. Con el trazo NEGATIVO que había antes la caja se
     quedaba CORTA por la derecha, así que el parche era `padding-inline-end`.
     Ahora el trazo es positivo: la caja se pasa por la derecha, y lo que hay
     que añadir va al PRINCIPIO. Mismo problema, lado contrario.

     Su valor es SIEMPRE el del trazo de arriba, por eso los dos leen el mismo
     token: si uno cambia, cambian los dos, y ahora eso pasa solo. */
  padding-inline-start: var(--av-track-display);
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
  /* Arriba, el hueco de la barra — que va arriba en las dos disposiciones, así
     que `--av-nav-space` sirve para las dos y no hay nada que reservar abajo.

     Los laterales se ciñen en estrecho (ver el bloque de 560 px): ahí cada píxel
     de ancho es alto de zapato, porque el que manda en un teléfono es el
     ancho. */
  padding:
    var(--av-nav-space)
    var(--ps-pad-x)
    clamp(28px, calc(4 * var(--ps-vh)), 56px);
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
/* Sin versales. El .42em de trazo se va con ellas: ese aire estaba para que
   una línea de mayúsculas no se leyera como un bloque, y en minúscula lo único
   que hace es descoser la palabra. */
.ps__eyebrow p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: .06em;
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

   `--ps-shoe-net` es solo la red para pantallas estrechas y altas, donde el que
   se pasaría es el ancho. Es una VARIABLE y no el `58%` literal a propósito: en
   móvil hay que abrir la red, y si eso se hace reescribiendo el `width` entero
   se pierde el tope por alto — que es justo el que salva al teléfono en
   horizontal, donde sobra ancho y no hay nada de alto. Se cambia la red, nunca
   la fórmula. */
.ps__seq {
  position: relative;
  --ps-shoe-max-h: 68;   /* % del alto de pantalla que NO pasa ningún frame */
  --ps-shoe-net: 58%;    /* red por ancho — la única pieza que cambia en móvil */
  width: min(var(--ps-shoe-net), calc(var(--ps-shoe-max-h) * 1.032 * var(--ps-vh)), 910px);
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

/* ── fila 3 — dos columnas y el botón en medio ─────────────────────────────
   `1fr auto 1fr` y no `1fr 1fr 1fr`: los dos `1fr` de los lados son IGUALES
   entre sí, así que el hueco de en medio queda centrado en el frame pase lo que
   pase — y como mide `auto`, el botón ocupa lo que ocupa su texto y no estira ni
   encoge con el ancho de la ventana. Con tres tercios el botón se centraría
   igual, pero el suyo sería un tercio de pantalla y en 1440 eso son 440 px de
   caja para 130 de texto: el `justify-self` lo volvería a apretar y estaríamos
   describiendo dos veces la misma medida. */
.ps__info {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 24px;
}
.ps__info-r { text-align: right; }

.ps__label {
  margin: 0;
  font-size: 10.5px;
  letter-spacing: var(--av-track);
  color: var(--ps-ink-soft);
}
.ps__name { margin: 2px 0 0; font-size: 19px; font-weight: 700; letter-spacing: var(--av-track); }
.ps__price { margin: 1px 0 0; font-size: 14px; font-variant-numeric: tabular-nums; color: var(--ps-ink-soft); }

.ps__selects { display: flex; gap: 12px; margin-top: 16px; }
.ps__select {
  min-width: 132px;
  padding: 10px 14px;
  border: 1px solid var(--ps-hair);
  border-radius: 4px;
  font-size: 11.5px;
  letter-spacing: var(--av-track);
  color: var(--ps-ink-soft);
}

/* VIDRIO, como los otros cuatro botones de la casa. Era de tinta maciza del
   colorway y se cambió: en una página donde «Comprar ahora» aparece en tres
   piezas seguidas —aquí, en el acordeón y en el rollo— tener uno macizo y dos
   de vidrio los convierte en tres botones distintos.

   Y las MEDIDAS son las del sistema (`--av-action-*`): mismo alto, mismo
   relleno, mismo cuerpo, mismo glifo y el mismo ancho mínimo que «Regresar» y
   «Ver detalle». Tenía 13 px de letra, 26 de relleno y alto libre.

   Lo que se pierde al dejar la tinta del colorway: el botón ya no se invierte
   con el zapato. No hace falta — sobre el velo negro el texto es claro siempre,
   que es justo para lo que existe un material estandarizado. */
.ps__buy {
  flex: none;
  min-width: var(--av-action-w);
  height: var(--av-action-h);
  white-space: nowrap;
  transition: opacity .18s ease, transform .18s ease;
}
.ps__buy :deep(.av-glass__body) { height: 100%; }
.ps__buy button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--av-action-gap);
  width: 100%;
  height: 100%;
  border: 0;
  background: none;
  padding: 0 var(--av-action-px);
  font-family: inherit;
  font-size: var(--av-action-fs);
  font-weight: 500;
  letter-spacing: var(--av-track);
  /* Sobre el velo negro el contenido es claro, dé igual el colorway. Es el
     motivo de tener un material estandarizado: el contraste del texto deja de
     depender del plano de color que haya detrás. */
  color: var(--av-on-glass-strong);
  cursor: pointer;
}
.ps__buy :deep(svg) { width: var(--av-action-ico); height: var(--av-action-ico); }
/* El hover no cambia el color —no hay un segundo tono de tinta en el colorway y
   no se va a inventar aquí—: lo abre un poco hacia el fondo, que es el mismo
   gesto sea cual sea el zapato. */
.ps__buy:hover { opacity: .86; }
.ps__buy:active { transform: translateY(1px); }

.ps__index {
  margin: 0;
  font-size: 44px;
  font-weight: 800;
  letter-spacing: var(--av-track);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.ps__line {
  margin: 6px 0 0;
  font-size: 10.5px;
  letter-spacing: var(--av-track);
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

/* ── estrecho ───────────────────────────────────────────────────────────────
   560 px, y NO los 900 del dock. Son dos preguntas distintas y confundirlas
   costaba caro: el dock aparece cuando la barra de arriba no cabe, pero las dos
   columnas de la fila 3 se apilan cuando no hay ANCHO para dos columnas. Un
   teléfono en horizontal mide 844 de ancho — entra por el corte del dock, pero
   le sobra ancho para las dos columnas, y apilándolas la fila pasaba de 120 px
   a 225 y se comía el poco alto que hay. */
@media (max-width: 560px) {
  /* Aquí el que manda es el ANCHO — al revés que en escritorio — así que cada
     píxel que se le quita al margen lateral es alto de zapato. */
  /* el minimo del token ya es 16 en pantalla estrecha; no hace falta repetirlo */

  /* Se abre la red, y SÓLO la red: el tope por alto sigue en la fórmula. */
  .ps__seq { --ps-shoe-net: 92%; }

  .ps__info { grid-template-columns: 1fr; }
  .ps__info-r { text-align: left; }
  .ps__ticks { justify-content: flex-start; }

  /* EL BOTÓN SE VA AL FINAL Y SE ESTIRA. Con una columna deja de haber un
     «medio» donde ponerlo: en el DOM está entre los dos bloques de info, y ahí
     partiría en dos lo que es un solo dato del producto —nombre, precio,
     contador—. `order` lo baja sin tocar el orden de lectura de arriba.

     Y ancho completo, que es lo que se hace en un teléfono con la única acción
     de la pantalla: el pulgar no apunta, barre. Deja además de estar centrado a
     ojo cuando el texto es corto — el borde del botón coincide con el de la
     columna, que es el mismo que el del nombre y el del precio. */
  .ps__buy { order: 1; justify-content: center; width: 100%; margin-top: 4px; }
}

/* ── la medida de diseño no mira por la ventana ─────────────────────────────
   `frame="fixed"` son 1440×1024 EXACTOS — es la ruta /frame, la de las capturas
   y la que va a Figma. El encuadre lo pone el propio frame, así que sus medidas
   no pueden depender del viewport: con el navegador estrecho, los cortes de
   arriba le metían el margen de teléfono y le apilaban la fila 3 dentro de un
   lienzo de 1440, y una captura así miente.

   Va DESPUÉS de los `@media` a propósito: misma especificidad, gana el último.
   Los tres de dentro necesitan un descendiente porque compiten con reglas de la
   misma forma. */
.ps--fixed {
  --ps-pad-x: 57.6px;   /* 4% de 1440, el mismo número que da el clamp ahí */
  --ps-vh: 10.24px;     /* 1% de 1024: el alto del frame, no el de la ventana */
}
.ps--fixed .ps__seq { --ps-shoe-net: 58%; }
.ps--fixed .ps__info { grid-template-columns: 1fr auto 1fr; }
.ps--fixed .ps__info-r { text-align: right; }
.ps--fixed .ps__ticks { justify-content: flex-end; }
/* deshace el bloque de teléfono: en la medida de diseño el botón vuelve a en
   medio y a medir lo que mide su texto */
.ps--fixed .ps__buy { order: 0; width: auto; margin-top: 0; }

/* Sin movimiento: la secuencia deja de depender del scroll y se queda en el
   primer frame. El resto de la composición no cambia. */
@media (prefers-reduced-motion: reduce) {
  .ps__shoe { transition: none; }
  .ps__buy { transition: none; }
  .ps__buy:active { transform: none; }
}
</style>

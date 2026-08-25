<script setup>
/**
 * <ProductDiptych> — el díptico.
 *
 * Dos hojas, como su nombre: a la izquierda una LÁMINA fija, a la derecha un
 * carrusel de celdas hexagonales. La lámina es el plano largo; el carrusel, el
 * detalle que gira.
 *
 *   ┌───────────────────┐   ┌───────────────────────────────┐
 *   │                   │   │                               │
 *   │   ▒▒▒▒▒▒▒▒▒▒▒▒▒   │   │   ‹     ⬡    ⬢    ⬡      ›    │
 *   │   ▒   foto    ▒   │   │       lado  FOCO  lado        │
 *   │   ▒▒▒▒▒▒▒▒▒▒▒▒▒   │   │                               │
 *   │                   │   │                               │
 *   └───────────────────┘   └───────────────────────────────┘
 *          50%                          50%
 *
 * DE DÓNDE SALE CADA MITAD, porque no es una pieza nueva sino un cruce de dos
 * que ya existen:
 *
 *   · la lámina  → una tarjeta SÓLIDA BLANCA con paspartú y sombra, no vidrio.
 *     Fue de vidrio y se quitó: sobre un lila claro el velo negro la volvía una
 *     mancha oscura al lado de dos fotos luminosas, y el paspartú blanco es lo
 *     que hace que la foto se lea como una foto MONTADA. La sombra corta no
 *     está para dar dramatismo: está para despegarla del lila un par de
 *     milímetros. Ver `.pd__plate`.
 *   · la celda   → el hexágono de <ProductHoneycomb>, con su MISMA geometría
 *     (punta arriba, proporción 2/√3) y su MISMO anillo especular leído de
 *     `--lg-spec` / `--lg-ang`. Ver `.pd__cell`.
 *   · el giro    → la distancia cíclica de <ProductReel>, recortada a tres
 *     puestos. Aquí no hay extremos: la columna mide la mitad de la página y
 *     un quinto puesto se saldría por debajo de las flechas.
 *
 * LO QUE NO LLEVA, y es la mitad del encargo: ni título, ni descripción, ni
 * botón, ni contador. Sólo las flechas y la celda. El díptico es una pieza de
 * IMAGEN — lo que tenga que decirse se dice en la ficha, no aquí.
 *
 * EL FONDO ES PROPIO Y ES CLARO — `#c4b3e9`, el lila de las fotos. Es la única
 * pieza de la landing que no se apoya en la rampa oscura del escenario, y por
 * eso trae su propio plano: entre el rollo y el panal, los dos negros, este
 * corte claro es lo que hace que se lean como dos piezas y no como una sola
 * larga.
 *
 * Y TRAE GRANO, por el mismo motivo que el panal: un plano liso no le da nada
 * que doblar a la lente, así que el vidrio de las flechas se leería como
 * cristal limpio — velo y desenfoque, sin refracción. El grano es lo que el
 * vidrio dobla. Está escrito en `backgrounds.js`.
 */
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { GRAIN_URL, GRAIN_DEFAULT } from '~/assets/js/backgrounds'

const props = defineProps({
  /**
   * La foto de la lámina — la hoja izquierda. Una sola y fija: la lámina no
   * gira, es el plano largo contra el que el carrusel de al lado se mueve.
   */
  plate: {
    type: Object,
    default: () => ({
      src: '/products/diptico/foto.jpg',
      alt: 'Air Jordan sobre un balón, tapicería lila',
    }),
  },
  /**
   * Las celdas del carrusel, en orden de giro.
   *
   * SIETE, y hay DOS clases de celda a propósito — es lo que esta lista está
   * para enseñar:
   *
   *   FOTOGRAFÍA (`.jpg`)  llena el hexágono a sangre. El vidrio queda debajo y
   *                        no se ve: lo que se lee es la foto recortada en
   *                        hexágono, con el filo especular por encima.
   *   RECORTE (`.png`)     fondo transparente, así que el zapato flota SOBRE el
   *                        material y el velo, el desenfoque y el filo se ven
   *                        enteros. Es la celda del panal.
   *
   * Cuál es cuál lo dice la EXTENSIÓN, no un prop — ver `celdas` más abajo.
   *
   * El reparto: alternando `foto-2`/`foto-1` ninguna celda queda al lado de su
   * gemela **tampoco en la vuelta**, y el recorte entra en el tercer puesto para
   * que se alcance con dos toques de flecha desde el arranque. Comprobado en
   * ciclo: 2·1·J·2·1·2·1 y de la última a la primera, sin dos iguales seguidas.
   *
   * Empieza por `foto-2` porque es el plano abierto: el par completo sobre la
   * pista. `foto-1` es el detalle de las punteras y funciona mejor de segunda,
   * cuando ya se sabe qué se está mirando.
   *
   * Con catálogo real esto desaparece solo: se pasan siete productos y ya está.
   * El componente no distingue una foto repetida de una que no lo es.
   */
  items: {
    type: Array,
    default: () => [
      { src: '/products/diptico/foto-2.jpg', alt: 'Air Jordan lila, par completo' },
      { src: '/products/diptico/foto-1.jpg', alt: 'Air Jordan lila, detalle de puntera' },
      { src: '/products/diptico/jordan.png', alt: 'Air Jordan 1 Yellow Ochre' },
      { src: '/products/diptico/foto-2.jpg', alt: 'Air Jordan lila, par completo' },
      { src: '/products/diptico/foto-1.jpg', alt: 'Air Jordan lila, detalle de puntera' },
      { src: '/products/diptico/foto-2.jpg', alt: 'Air Jordan lila, par completo' },
      { src: '/products/diptico/foto-1.jpg', alt: 'Air Jordan lila, detalle de puntera' },
    ],
  },
  /** Cuál arranca en el centro. */
  initial: { type: Number, default: 0 },
  /** El plano de detrás. El lila de las fotos, pedido en hexadecimal. */
  bg: { type: String, default: '#c4b3e9' },
  /** el grano, 0–100. No es textura: es lo que el vidrio dobla. */
  grain: { type: Number, default: GRAIN_DEFAULT },
})

const emit = defineEmits(['select', 'change'])

const estilo = computed(() => ({
  '--pd-bg': props.bg,
  '--pd-grain': GRAIN_URL,
  '--pd-grain-a': props.grain / 100,
}))

/* La clave es la POSICIÓN y no el `src`: con tres imágenes en siete celdas hay
   rutas repetidas, y dos `:key` iguales rompen el `v-for`. Es el mismo problema
   —y la misma salida— que el panal con sus 26 fotos en 34 celdas. */
const celdas = computed(() => props.items.map((it, i) => {
  const src = typeof it === 'string' ? it : it.src
  return {
    key: i,
    src,
    alt: typeof it === 'string' ? '' : (it.alt ?? ''),
    /* RECORTE O FOTOGRAFÍA, y lo decide la EXTENSIÓN. No es un atajo perezoso:
       es la misma regla que se usa al exportar. Un `.png` en un catálogo de
       zapatillas está ahí porque lleva canal alfa —si no, sería un `.jpg`, que
       pesa la mitad— así que la extensión ya ES la señal, y pedir además un
       prop `recorte: true` sería obligar a repetir a mano un dato que el
       nombre del fichero ya lleva encima.

       Cambia una sola cosa: cómo se encaja la imagen en el hexágono. La
       fotografía va a sangre (`cover`); el recorte va entero y centrado
       (`contain`), porque recortarle la puntera a un zapato que flota sobre el
       vidrio es exactamente lo que no se quiere ver. Ver `.pd__shot`.

       El día que haya catálogo real, esto lo dirá el backend en un campo y esta
       línea pasa a leerlo. Mientras tanto, la extensión no miente. */
    recorte: /\.png(\?|$)/i.test(src || ''),
  }
}))

const n = computed(() => celdas.value.length)
const idx = ref(0)
const actual = computed(() => celdas.value[idx.value] || null)

/**
 * La DISTANCIA de cada celda al centro, por el camino más corto — la misma de
 * <ProductReel>, y por el mismo motivo: sin esto, al pasar de la última a la
 * primera la celda cruzaría todo el encuadre en vez de entrar por el lado que
 * le toca.
 *
 * `>=` y no `>` en el primer tope: con un número PAR de celdas, la que cae justo
 * a la mitad está a la misma distancia por los dos caminos, y sin esto se
 * quedaba siempre a la derecha y el puesto izquierdo vacío. Hoy son SIETE y el
 * caso no se da, pero la lista es un prop: en cuanto alguien pase ocho, vuelve.
 */
function distancia(i) {
  const total = n.value
  let d = i - idx.value
  if (d >= total / 2) d -= total
  if (d < -total / 2) d += total
  return d
}

/* TRES puestos y no cinco. La columna del carrusel mide la mitad de la página,
   así que a partir del segundo vecino la celda cae debajo de la flecha. El resto
   sigue en el DOM —para que la foto esté decodificada cuando le toque— pero
   fuera del encuadre. */
function claseDe(i, celda) {
  const d = distancia(i)
  const a = Math.abs(d)
  return {
    'pd__cell': true,
    'is-recorte': !!celda?.recorte,
    'is-focus': d === 0,
    'is-side': a === 1,
    'is-left': d < 0,
    'is-right': d > 0,
    'is-away': a > 1,
  }
}

function ir(paso) {
  if (!n.value) return
  idx.value = (idx.value + paso + n.value) % n.value
  emit('change', idx.value)
}

/* Tocar una celda del lado la trae al centro; en el centro, abre. Es lo que se
   espera de algo que se ve a medias, y ahorra buscar la flecha. */
function traer(i) {
  const d = distancia(i)
  if (d !== 0) { ir(d); return }
  emit('select', idx.value)
}

/* ── el gesto ──────────────────────────────────────────────────────────────
   Arrastre horizontal, que en teléfono es lo único cómodo. Se decide en
   `pointerup` y no durante el movimiento: el salto entre posiciones ya está
   animado por CSS, y seguir al dedo píxel a píxel pediría interpolar las
   transformaciones a mano. 40 px separan el arrastre del toque. */
const desdeX = ref(null)

function abajo(e) { desdeX.value = e.clientX }
function arriba(e) {
  if (desdeX.value === null) return
  const dx = e.clientX - desdeX.value
  desdeX.value = null
  if (Math.abs(dx) > 40) ir(dx < 0 ? 1 : -1)
}

function tecla(e) {
  if (e.key === 'ArrowLeft') { ir(-1); e.preventDefault() }
  if (e.key === 'ArrowRight') { ir(1); e.preventDefault() }
}

onMounted(() => {
  idx.value = Math.min(Math.max(0, props.initial), Math.max(0, n.value - 1))
})
</script>

<template>
  <section v-if="celdas.length" class="pd" :style="estilo">
    <div class="pd__grid">
      <!-- ── la hoja izquierda ───────────────────────────────────────────
           TARJETA SÓLIDA, no vidrio. El paspartú blanco lo hace el `padding`
           de la propia tarjeta: la foto no se pega al borde, y ese margen es
           lo que la lee como copia montada y no como un recorte del fondo. -->
      <figure class="pd__plate">
        <img
          class="pd__photo"
          :src="plate.src"
          :alt="plate.alt"
          width="1080"
          height="1350"
          fetchpriority="high"
          decoding="async"
        >
      </figure>

      <!-- ── la hoja derecha ─────────────────────────────────────────────── -->
      <div
        class="pd__reel"
        role="group"
        aria-roledescription="carrusel"
        aria-label="Galería"
        tabindex="0"
        @keydown="tecla"
        @pointerdown="abajo"
        @pointerup="arriba"
        @pointercancel="desdeX = null"
      >
        <!-- `sheet` y no el material base, exactamente como el panal: son celdas
             que se REPITEN, y lo caro del material no es el velo sino la lente
             — un `feDisplacementMap` con su mapa `data:` por instancia, contra
             un presupuesto medido de ≈9 piezas. Con `sheet`, `useGlassLens` se
             rinde al montar y no crea ni el nodo `<filter>` ni sus cuatro
             observadores.

             Y tiene que ser <GlassSurface> y no un `<button>` pelado, que es
             como estuvo y no funcionaba: `--lg-spec`, `--lg-ang` y `--lg-elev`
             viven en `.av-glass`, NO en `:root` — sólo el radio está ahí. Sin
             la clase del material esas tres variables no resuelven, y una
             declaración con una custom property sin resolver es inválida en
             tiempo de cálculo: el navegador la tira ENTERA y en silencio. El
             anillo salía `background-image: none` y la elevación `filter: none`
             — o sea, hexágonos sin filo y sin sombra. Medido en el DOM. -->
        <div class="pd__track">
          <GlassSurface
            v-for="(c, i) in celdas"
            :key="c.key"
            variant="sheet"
            tag="button"
            type="button"
            :class="claseDe(i, c)"
            :tabindex="distancia(i) === 0 ? 0 : -1"
            :aria-hidden="Math.abs(distancia(i)) > 1"
            :aria-label="distancia(i) === 0 ? 'Ver detalle' : 'Traer al centro'"
            @click="traer(i)"
          >
            <img
              class="pd__shot"
              :src="c.src"
              :alt="c.alt"
              width="1080"
              height="1350"
              :loading="i < 2 ? 'eager' : 'lazy'"
              decoding="async"
            >
          </GlassSurface>
        </div>

        <!-- Las flechas, de vidrio como las del rollo y las de la barra: son la
             capa que flota sobre la pieza, que es para lo que existe el
             material. Y aquí sí tienen qué doblar — detrás pasan el grano y las
             celdas de los lados. -->
        <GlassSurface :radius="999" class="pd__arrow pd__arrow--prev">
          <button type="button" aria-label="Anterior" @click="ir(-1)">
            <span class="av-glyph"><ChevronLeft :stroke-width="1.8" /></span>
          </button>
        </GlassSurface>

        <GlassSurface :radius="999" class="pd__arrow pd__arrow--next">
          <button type="button" aria-label="Siguiente" @click="ir(1)">
            <span class="av-glyph"><ChevronRight :stroke-width="1.8" /></span>
          </button>
        </GlassSurface>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pd {
  position: relative;
  overflow: hidden;

  /* EL PLANO CLARO. Sólido, sin degradado: las fotos ya traen su propio lila y
     una rampa detrás competiría con ellas. */
  background-color: var(--pd-bg);

  /* EL RELLENO, EL HUECO Y LA FLECHA SALEN A TOKEN porque `--pd-w` los NECESITA
     para una cuenta — ver más abajo. Con los números sueltos, esa cuenta sería
     una copia que se queda atrás el día que uno de los tres se mueva.

     Se acortaron —estaban en `4vw` y 1360 px de ancho máximo, que a 1440 dejaba
     58 px de aire muerto a cada lado— pero NO hasta el borde: hubo un paso por
     `2.4vw` / 1600 px y se echó atrás. Una sección sin texto quiere sitio para
     la imagen; lo que no quiere es que las piezas toquen el filo.

     Y hay un mínimo que no es de gusto sino de geometría: la sección lleva
     `overflow: hidden` por el grano, así que **el relleno tiene que ser mayor
     que el alcance de la sombra de la lámina** o la sombra sale cortada en
     recto, que se lee peor que no tener sombra. Ese alcance está calculado en
     `--pd-aire`, y los mínimos de aquí lo respetan. */
  --pd-pad:   var(--av-gutter);
  --pd-gap:   clamp(16px, 2.4vw, 40px);
  --pd-max:   1480px;
  --pd-arrow: 46px;
  /* HASTA DÓNDE LLEGA LA SOMBRA de la lámina, hacia abajo, que es su lado
     largo: desplazamiento 30 + medio desenfoque 31 − extensión 22 = 39 px. Se
     redondea a 42 y de ahí sale el mínimo del relleno vertical, porque la
     sección lleva `overflow: hidden` y una sombra que llegue más lejos que el
     relleno sale cortada en recto — que se lee peor que no tener sombra.

     Este número NO es decorativo: cada vez que se toca `box-shadow` en
     `.pd__plate` hay que rehacer la cuenta aquí. Subió de 28 a 42 al subirle
     la intensidad a la sombra. */
  --pd-aire:  42px;
  padding: clamp(var(--pd-aire), 4.6vh, 64px) var(--pd-pad);

  /* ── LA ALTURA DE LA FILA ───────────────────────────────────────────────
     Una sola medida para las dos hojas, y por eso está aquí arriba y no dentro
     de cada una: la lámina y el carrusel tienen que medir lo mismo o el díptico
     deja de ser un díptico. La lámina la llena entera y recorta la foto; el
     hexágono del centro se dimensiona aparte, por ancho.

     `vh` y no `svh`: esta pieza NO se come el viewport —el rollo y el acordeón
     sí, y ahí la diferencia entre `svh` y `vh` decide si la página avanza de
     pantalla en pantalla—, así que aquí sólo es una proporción cómoda. */
  --pd-h: clamp(380px, 64vh, 620px);

  /* ── EL HEXÁGONO ────────────────────────────────────────────────────────
     `--pd-w` es lo único que se toca para cambiar la escala: el alto sale de
     él por la proporción del hexágono regular.

     En `vw` y no en unidades de contenedor. La columna mide la mitad de la
     página, así que el ancho de la página ya la describe — y `container-type`
     aplicaría contención sobre el ancestro de las flechas, que es justo el tipo
     de propiedad que hay que mirar dos veces cuando debajo hay `backdrop-filter`
     (contención de PINTADO crea un backdrop root; la de tamaño no, pero no vale
     la pena tener que acordarse). El panal se dimensiona igual, con un clamp
     en `vw`.

     Y NO es sólo un `clamp`: es el mínimo entre lo que se querría y lo que CABE.
     `--pd-col` es el ancho real de la columna del carrusel, y de su mitad hay
     que descontar la flecha y un poco de aire; lo que quede tiene que dar para
     el medio-vano, que es `desplazamiento + escala/2` = 0.90 + 0.29 = **1.19**
     anchos de celda. Despejado, sale el techo.

     El 1.19 va escrito y no derivado porque `--pd-shift` es un porcentaje y CSS
     no puede dividir por él; si esos dos tokens se tocan, este número se toca
     con ellos y por eso están anotados a un palmo el uno del otro.

     Esto es lo que deja SUBIR el `vw` sin miedo — de 13 a 15— sabiendo que en
     ningún ancho el vecino se va a meter por debajo de la flecha. Con el número
     suelto, subirlo era apostar.

     15 y no 17. Con 17 el carrusel se comía la columna entera y la pieza pasaba
     de estar holgada a estar apretada: el hexágono ganaba 25 px y perdía los 20
     de aire que lo separan de la flecha. El encargo era ampliar el carrusel, no
     llenarlo — el 15 lo deja un 15% más grande que el original con el aire
     intacto.

     LOS 18 px DE AIRE son 8 de holgura y 10 de BARRA DE SCROLL. `100vw` incluye
     la barra y la sección no: a 1440 con barra clásica, `--pd-col` se pasaba 7.5
     px y el vecino acababa a 6 px de la flecha en vez de a los 14 que decía la
     cuenta — medido. No hay forma limpia en CSS de restar la barra, así que se
     reserva. Se paga en unos pocos píxeles de hexágono y se cobra en que la
     cuenta nunca se queda corta. */
  --pd-col:   calc((min(100vw - 2 * var(--pd-pad), var(--pd-max)) - var(--pd-gap)) / 2);
  --pd-w:     min(15vw,
                  calc((var(--pd-col) * .5 - var(--pd-arrow) - 18px) / 1.19));
  /* PUNTA ARRIBA, la del panal: 2/√3 = 1.1547, la de un hexágono REGULAR. Es la
     misma nota de <ProductHoneycomb> y por la misma razón — estirarlo rompe el
     encaje de los biseles. */
  --pd-ratio: 1.1547;
  --pd-hex-h: calc(var(--pd-w) * var(--pd-ratio));
  /* El grosor del filo. 1.5 px es el `padding` con el que el material dibuja su
     anillo — mismo número, para que la celda no tenga un filo más gordo ni más
     fino que la lámina de al lado. */
  --pd-rim:   1.5px;

  /* ── LOS DOS PLANOS ─────────────────────────────────────────────────────
     `--pd-shift` es el desplazamiento del vecino y va en % del ANCHO DE LA
     PROPIA CELDA, no de la columna: `translateX` en porcentaje se resuelve
     contra la caja de borde del elemento SIN escalar, y va primero en la cadena
     — así que 90% es 90% de `--pd-w` pase lo que pase con el `scale` que viene
     detrás.

     Y 90 sale de una cuenta, no del ojo: con el vecino a 0.58, los bordes
     quedan separados 0.90 − 0.5 − 0.29 = 0.11 anchos, unos 21 px con la celda
     grande. Menos de eso y los hexágonos se tocan por los hombros. */
  --pd-shift:      90%;
  --pd-side-scale: 0.58;
  --pd-side-blur:  5px;
  --pd-side-fade:  0.50;
}

/* EL GRANO — ver la cabecera. Va en un `::before` porque necesita OPACIDAD
   propia, y va DEBAJO de todo en orden de pintado: un `backdrop-filter` sólo ve
   lo que se pintó antes que él, así que si fuera encima, ni la lámina ni las
   flechas lo recogerían. De ahí el `z-index: 1` de la retícula. */
.pd::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: var(--pd-grain);
  opacity: var(--pd-grain-a);
  pointer-events: none;
}

/* ── la retícula ──────────────────────────────────────────────────────────
   DOS COLUMNAS IGUALES. La lámina se lleva la mitad, que es lo pedido; el hueco
   se lo reparten las dos, así que cada una acaba en algo menos del 50% real —
   y eso es lo correcto: «mitad» describe el reparto, no un ancho al píxel.

   `stretch` en las dos, y ahí está el centrado: las dos hojas miden lo mismo de
   alto y arrancan y acaban en la misma línea, así que el par queda centrado sin
   que haya que centrar nada a mano — la lámina llena su columna y el hexágono
   se centra dentro de la suya. */
.pd__grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* LA FILA VA ESCRITA, y no es de adorno: `minmax(0, 1fr)` la hace DEFINIDA.
     Sin ella la fila es implícita y `auto`, o sea que la mide su contenido — y
     el contenido es una foto de 1080×1350 cuyo `height: 100%` no resuelve
     contra una fila indefinida, así que cae a su alto intrínseco. Medido a
     1440: la fila daba 820 px dentro de una retícula de 630 y la lámina se
     salía 190 px por abajo, que el `overflow: hidden` de la sección recortaba
     en silencio.

     El `0` del `minmax` es la otra mitad: `1fr` por sí solo tiene mínimo
     automático y volvería a crecer con el contenido. */
  grid-template-rows: minmax(0, 1fr);
  gap: var(--pd-gap);
  align-items: stretch;
  height: var(--pd-h);
  max-width: var(--pd-max);
  margin-inline: auto;
}

/* ── la lámina ────────────────────────────────────────────────────────────
   Llena su columna entera y la foto la llena a ella: sin margen propio y SIN
   RELLENO, para que arranque y termine en la misma línea que el carrusel de al
   lado y no quede ni un filo blanco alrededor de la imagen.

   Hubo un paspartú blanco de ~16 px y se quitó. La idea era leer la foto como
   copia montada; en la práctica, con una fotografía a color que llega hasta sus
   propios bordes, el filo blanco no montaba nada — recortaba. Lo que despega la
   pieza del lila es la sombra, no un marco.

   El blanco SE QUEDA de fondo aunque no se vea: es lo que hay debajo mientras la
   foto carga, y una tarjeta que aparece en blanco y se rellena se lee mucho
   mejor que un agujero transparente por el que asoma el lila.

   `overflow: hidden` porque ahora es él quien recorta: sin relleno, las esquinas
   de la foto son las esquinas de la tarjeta, y una imagen no sigue el radio de
   su padre por sí sola.

   LA SOMBRA VA TEÑIDA DE VIOLETA, no negra. Sobre un fondo de color, una sombra
   neutra se lee como suciedad gris; teñida hacia el tono del fondo pero mucho
   más oscura, se lee como sombra. Y son dos capas por lo de siempre — una larga
   y muy abierta que da la ALTURA, otra corta y pegada que da el CONTACTO. Sin la
   segunda, la tarjeta no flota: levita.

   Subida de intensidad: la primera pasó de .38 a .55 y la segunda de .22 a .34,
   con radios más largos. Estaba calibrada como si el fondo fuera claro-neutro y
   el lila es un color medio — una sombra al 38% sobre él casi no se separa. Al
   subir, el alcance crece, y eso lo tiene que saber el relleno de la sección:
   ver `--pd-aire`. */
.pd__plate {
  margin: 0;
  /* SIN `height: 100%`. Con la fila ya definida, `align-items: stretch` le da a
     la lámina un alto definitivo — y hace falta que venga de ahí y no de un
     porcentaje: un `height: 100%` deja de estirar el elemento (pasa a tener
     alto propio) y la foto de dentro vuelve a medir contra algo indefinido. */
  min-height: 0;
  background: #FFFFFF;
  border-radius: clamp(14px, 1.5vw, 26px);
  overflow: hidden;
  box-shadow:
    0 30px 62px -22px rgba(46, 28, 84, .55),
    0 6px 16px -6px rgba(46, 28, 84, .34);
}

/* A SANGRE DE LA TARJETA. Sin relleno que descontar, `height: 100%` es el alto
   entero de la lámina, que la fila ya dejó definido.

   `cover` y no `contain`: la foto es 4:5 y la tarjeta es casi cuadrada, así que
   `contain` dejaría dos franjas de blanco arriba y abajo — y ahora que no hay
   paspartú, esas franjas no se leerían como marco sino como un fallo de
   encuadre. Recortada, el zapato se queda centrado, que es donde está.

   `border-radius: inherit` y no un número propio: el radio de la tarjeta es un
   `clamp`, así que copiarlo aquí sería mantener dos veces la misma curva y
   verlas separarse el día que una se toque. El `overflow` del padre ya recorta;
   esto es el cinturón, para los motores que lo resuelven al revés. */
.pd__photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

/* ── el carrusel ──────────────────────────────────────────────────────────── */
.pd__reel {
  position: relative;
  /* el `tabindex` lo hace enfocable para el teclado, pero no queremos el anillo
     del navegador sobre media pieza */
  outline: none;
  /* el arrastre horizontal es nuestro; el vertical sigue siendo de la página */
  touch-action: pan-y;
}

/* Las celdas son absolutas sobre un mismo centro; lo que las coloca es la
   transformación, no el flujo. Así las seis comparten origen y el movimiento
   entre puestos es una sola interpolación. */
.pd__track {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

/* ── la celda ─────────────────────────────────────────────────────────────
   EL HEXÁGONO DEL PANAL: misma geometría y mismo filo, leído del material —
   `--lg-spec` y `--lg-ang`, nunca redefinidos. Si el filo del sistema cambia,
   este cambia con él.

   La ELEVACIÓN es lo único que ya no sale de ahí: en vez de `--lg-elev` lleva la
   sombra violeta de la lámina, para que las dos hojas floten igual. Ver el
   `filter` de abajo.

   VA CON `>` DESDE LA PISTA, y no es cosmético: la celda ES `.av-glass`, que
   declara `position: relative`. Un selector de una sola clase empata con él en
   especificidad y quien gane lo decide el ORDEN de las hojas — que en Nuxt
   depende de si el CSS global entra antes o después del `<style scoped>` de la
   pieza. `.pd__track > .pd__cell` sube a (0,2,0) y deja de ser una apuesta.

   LA IMAGEN LLENA LA CELDA ENTERA. Hubo un paspartú de vidrio de un 3.5% del
   ancho y se quitó: dejaba una banda hexagonal de material alrededor de la foto
   y lo que hacía era encoger el hexágono por dentro, no enmarcarlo.

   Y quitarlo no deja al vidrio sin trabajo, porque hay DOS clases de celda:

     · la FOTOGRAFÍA (`.jpg`) es opaca y tapa el material entero. Lo que queda
       del sistema es el filo especular por encima y la elevación por debajo —
       que es exactamente lo que el panal documenta que pasa sobre un fondo sin
       detalle: de las cuatro capas del vidrio sólo trabaja el filo.
     · el RECORTE (`.png`) tiene fondo transparente, así que el zapato flota
       sobre el material y se ven las cuatro capas: velo, desenfoque, filo y
       sombra. Es la celda del panal, literalmente.

   Por eso entra un `.png` en la lista por defecto: para que las dos se puedan
   comparar una al lado de la otra sin cambiar nada. */
.pd__track > .pd__cell {
  position: absolute;
  width: var(--pd-w);
  height: var(--pd-hex-h);
  border: 0;
  padding: 0;
  background: none;
  cursor: pointer;


  /* `clip-path` y no una máscara ni un cuadrado girado: recorta la caja entera,
     así que la foto de dentro sale con forma de hexágono en vez de quedar un
     hexágono dibujado encima de una foto rectangular.

     PUNTA ARRIBA — la «rotación» del panal. Un hexágono con punta arriba es el
     de lado plano girado 30°, y el 25% y el 75% son sus cuatro vértices
     laterales. Son los mismos seis puntos de <ProductHoneycomb>. */
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);

  /* LA ELEVACIÓN DE LA CELDA — la del PANAL, copiada valor por valor de
     `.ph__cell`: dos capas por `--lg-elev`, la del material. Estuvo un rato con
     la sombra violeta de la lámina y no era: la tarjeta es una pieza de papel
     sobre el lila y quiere una sombra de objeto; el hexágono es una pieza de
     VIDRIO y su sombra es parte del material, igual que su filo. Que las dos
     hojas no compartan sombra es correcto — comparten sistema, no acabado.

     Va en `drop-shadow` y no en `box-shadow` porque el segundo sigue la caja
     RECTANGULAR y dibujaría una sombra cuadrada detrás de un hexágono;
     `drop-shadow` sigue el canal alfa, o sea la silueta ya recortada — y en el
     recorte `.png`, la silueta del propio zapato. Lo que se pierde en la
     traducción es el `spread` negativo, que `drop-shadow` no tiene: se compensa
     con radios más cortos, igual que en el panal.

     EL TOKEN SE DECLARA AQUÍ Y NO EN `.pd`, y esto costó un `filter: none`
     medido en el DOM. Un `var()` dentro de una CUSTOM PROPERTY se sustituye
     donde la propiedad se DECLARA, no donde se usa: el valor computado de
     `--pd-elev` es su valor especificado con las variables ya resueltas. En
     `.pd` no existe `--lg-elev` —vive en `.av-glass`— así que el token nacía
     inválido, se heredaba vacío, y `filter: var(--pd-elev)` caía al valor
     inicial, que es `none`. Ni sombra en las celdas ni aviso en consola.

     Declarado en la celda, que SÍ es `.av-glass`, `--lg-elev` resuelve y las
     tres reglas que lo usan —base, vecino y foco de teclado— lo comparten. */
  --pd-elev:
    drop-shadow(0 calc(var(--lg-elev) * 2px) calc(var(--lg-elev) * 4px)
      rgba(20, 14, 0, calc(var(--lg-elev) * .42)))
    drop-shadow(0 calc(var(--lg-elev) * 6px) calc(var(--lg-elev) * 12px)
      rgba(20, 14, 0, calc(var(--lg-elev) * .28)));
  filter: var(--pd-elev);

  transition:
    transform .58s cubic-bezier(.22, 1, .36, 1),
    filter    .58s cubic-bezier(.22, 1, .36, 1),
    opacity   .58s cubic-bezier(.22, 1, .36, 1);
}

/* EL CUERPO DEL VIDRIO ES QUIEN LLEVA LA FOTO, y va en ABSOLUTO a `inset: 0`.
   `__back`, `__veil` y `__spec` ya son absolutos y llenan la celda; `__body` es
   la única capa en flujo, así que sin esto se encogería al tamaño de la imagen
   y la celda se quedaría con el hexágono a medio llenar. */
.pd__track > .pd__cell :deep(.av-glass__body) {
  position: absolute;
  inset: 0;
  display: block;
}

/* A SANGRE DE LA CELDA. Sin `clip-path` propio: el `clip-path` de la celda
   recorta TAMBIÉN a sus descendientes, así que ponerlo otra vez aquí era dibujar
   el mismo hexágono dos veces. */
.pd__shot {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

/* EL RECORTE VA ENTERO Y CENTRADO, no a sangre. `cover` en un `.png` con fondo
   transparente escala el zapato hasta cubrir el hexágono y le corta la puntera
   y el talón por los biseles — justo lo que no se quiere ver en la única celda
   donde el material se ve entero.

   Y lleva relleno porque el hexágono NO es su caja: sólo tiene el ancho completo
   en la banda del centro y se cierra en punta arriba y abajo. Los porcentajes de
   `padding` se resuelven todos contra el ANCHO —también los verticales—, así que
   15% y 12% son 32 y 26 px en una celda de 216: el zapato se queda dentro de la
   banda ancha y no toca ningún bisel. Es el mismo motivo del 78% del panal,
   escrito como margen en vez de como escala. */
.pd__track > .pd__cell.is-recorte .pd__shot {
  object-fit: contain;
  padding: 15% 12%;
}

/* EL ANILLO ES UN POLÍGONO CON AGUJERO: se traza el hexágono exterior y después
   el interior, y `evenodd` deja pintado sólo lo que hay entre los dos. Así el
   filo tiene grosor constante en toda la vuelta — incluidas las diagonales, que
   es donde la máscara de `padding` del material no puede seguir a un polígono.

   Los factores del hexágono interior no son mágicos. Meter los lados `t` hacia
   dentro en un hexágono regular da otro hexágono semejante, y como el alto es
   2/√3 del ancho, la reducción vertical es `t · 1.1547` en cada punta y
   `t · 0.5774` en cada hombro. Con eso el anillo mide `--pd-rim` en cualquier
   dirección. Es literalmente el bloque de `.ph__cell::after`. */
.pd__track > .pd__cell::after {
  content: "";
  position: absolute;
  inset: 0;
  /* por encima de `__body`, que es la capa 3 — igual que en el panal */
  z-index: 4;
  pointer-events: none;

  background: linear-gradient(var(--lg-ang),
    rgba(255, 255, 255, calc(var(--lg-spec) * 1))    0%,
    rgba(255, 255, 255, calc(var(--lg-spec) * .86))  8%,
    rgba(255, 255, 255, calc(var(--lg-spec) * .62)) 18%,
    rgba(255, 255, 255, calc(var(--lg-spec) * .36)) 30%,
    rgba(255, 255, 255, calc(var(--lg-spec) * .21)) 42%,
    rgba(255, 255, 255, calc(var(--lg-spec) * .17)) 50%,
    rgba(255, 255, 255, calc(var(--lg-spec) * .21)) 58%,
    rgba(255, 255, 255, calc(var(--lg-spec) * .36)) 70%,
    rgba(255, 255, 255, calc(var(--lg-spec) * .62)) 82%,
    rgba(255, 255, 255, calc(var(--lg-spec) * .86)) 92%,
    rgba(255, 255, 255, calc(var(--lg-spec) * 1))  100%);

  clip-path: polygon(evenodd,
    /* hexágono exterior */
    50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%,
    /* interior, metido `--pd-rim` */
    50% calc(var(--pd-rim) * 1.1547),
    calc(100% - var(--pd-rim)) calc(25% + var(--pd-rim) * .5774),
    calc(100% - var(--pd-rim)) calc(75% - var(--pd-rim) * .5774),
    50% calc(100% - var(--pd-rim) * 1.1547),
    var(--pd-rim) calc(75% - var(--pd-rim) * .5774),
    var(--pd-rim) calc(25% + var(--pd-rim) * .5774));
}

/* EL FOCO. Escala 1, nítido y por delante. */
.pd__track > .pd__cell.is-focus {
  z-index: 3;
  transform: scale(1);
  opacity: 1;
}

/* LOS VECINOS. Encogen, se difuminan y se apagan a la vez — un solo cambio
   leído como distancia. */
/* El vecino lleva la MISMA elevación; lo que lo aleja es el desenfoque y la
   opacidad, no una sombra distinta. Y la sombra se encoge sola con él: el
   `drop-shadow` se calcula en el espacio local de la celda y el `scale` de
   después lo arrastra. */
.pd__track > .pd__cell.is-side {
  z-index: 2;
  opacity: var(--pd-side-fade);
  filter: blur(var(--pd-side-blur)) var(--pd-elev);
}
.pd__track > .pd__cell.is-side.is-left {
  transform: translateX(calc(var(--pd-shift) * -1)) scale(var(--pd-side-scale));
}
.pd__track > .pd__cell.is-side.is-right {
  transform: translateX(var(--pd-shift)) scale(var(--pd-side-scale));
}

/* FUERA DEL ENCUADRE. `visibility` y no `display`: la foto sigue decodificada,
   así que cuando entre no parpadea — el mismo motivo por el que el rollo apila
   sus ítems en vez de cambiar el `src`. */
.pd__track > .pd__cell.is-away {
  z-index: 0;
  visibility: hidden;
  opacity: 0;
  transform: scale(var(--pd-side-scale));
  pointer-events: none;
}

@media (hover: hover) and (pointer: fine) {
  .pd__track > .pd__cell.is-side:hover { opacity: .78; }
}

/* El foco del teclado no puede ir por `outline`: el `clip-path` lo recorta y no
   se ve nada. Se marca con un halo, que sí sobrevive porque va en el mismo
   `filter` que la elevación. */
.pd__track > .pd__cell:focus-visible {
  outline: none;
  filter: drop-shadow(0 0 0 2px rgba(255, 255, 255, .92)) var(--pd-elev);
}

/* ── las flechas ─────────────────────────────────────────────────────────── */
.pd__arrow {
  position: absolute;
  top: 50%;
  z-index: 4;
  width: var(--pd-arrow);
  height: var(--pd-arrow);
  transform: translateY(-50%);
}
.pd__arrow--prev { left: 0; }
.pd__arrow--next { right: 0; }

.pd__arrow :deep(.av-glass__body) { height: 100%; }
.pd__arrow button {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
}
.pd__arrow :deep(svg) { width: 19px; height: 19px; }

/* ══ teléfono ════════════════════════════════════════════════════════════
   UNA COLUMNA. Dos hojas de media pantalla en 390 px son dos hojas de 180: la
   lámina deja de leerse y el hexágono del centro cae por debajo de los 100 px,
   que es donde una foto de zapatilla deja de reconocerse. Es el mismo suelo por
   el que el acordeón se tumba y por el que el panal baja a cuatro columnas.

   Apiladas, la lámina va arriba —es el plano largo, y es lo que abre— y el
   carrusel debajo, donde el pulgar llega. */
@media (max-width: 860px) {
  .pd {
    --pd-pad:   clamp(16px, 4.4vw, 30px);
    --pd-arrow: 44px;
    /* el mismo suelo de sombra que en ancho — ver `--pd-aire` */
    padding: clamp(var(--pd-aire), 4vh, 44px) var(--pd-pad);

    /* LA MISMA CUENTA DE ARRIBA, con la única variable que cambia: aquí la
       columna del carrusel es la retícula ENTERA, no la mitad. Se reescribe
       `--pd-col` y `--pd-w` se recalcula solo — que es exactamente para lo que
       está partida en dos.

       Importa porque aquí no sobra sitio: con un `30vw` a ojo el vecino se
       metía 5 px POR DEBAJO de la flecha, medido a 375.

       SIN SUELO a propósito: por debajo de ~340 px el hexágono se queda
       pequeño, y eso es preferible a que la flecha le muerda una esquina.
       Encogerse se lee como una pantalla estrecha; solaparse, como un fallo. */
    --pd-col: min(100vw - 2 * var(--pd-pad), var(--pd-max));
    --pd-w:   min(30vw,
                  calc((var(--pd-col) * .5 - var(--pd-arrow) - 14px) / 1.19));
  }

  .pd__grid {
    grid-template-columns: 1fr;
    /* `auto` para la lámina y el resto para el carrusel: la lámina lleva su
       proporción escrita y el carrusel se queda con lo que sobre, en vez de
       repartir la altura a medias entre una foto y unos hexágonos. */
    grid-template-rows: auto 1fr;
    gap: clamp(12px, 3vw, 24px);
    height: auto;
  }

  /* Con la fila ya sin altura fija, la lámina necesita traer la suya. 4:5 es la
     proporción nativa de la foto, así que aquí NO se recorta nada — al revés
     que en escritorio, donde la fila manda y `cover` recorta.

     `height: auto` deshace el `100%` de escritorio: con la fila en `auto`, un
     alto porcentual no se resuelve contra nada y se lleva por delante la
     proporción. */
  .pd__plate { aspect-ratio: 4 / 5; max-height: 54vh; height: auto; }

  /* El carrusel deja de ser una columna que se estira y pasa a tener su propio
     alto: el del hexágono más aire para la sombra. */
  .pd__reel { height: calc(var(--pd-hex-h) + clamp(24px, 6vw, 48px)); }

}

/* ── accesibilidad ────────────────────────────────────────────────────────
   Sin movimiento: el carrusel sigue funcionando, sólo que el cambio es
   instantáneo. Se quita la transición, no la funcionalidad. */
@media (prefers-reduced-motion: reduce) {
  .pd__track > .pd__cell { transition: none; }
}
</style>

<script setup>
/**
 * <ProductHoneycomb> — el panal.
 *
 * Celdas hexagonales de vidrio sobre negro sólido, cada una con un producto. Las
 * filas pares van desplazadas media celda, que es lo que convierte una retícula
 * en un panal.
 *
 *   fila 1   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡      9
 *   fila 2    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡       8 · desplazada media celda
 *   fila 3   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡      9
 *   fila 4    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡       8      = 34 celdas
 *
 * En teléfono son 4 columnas y diez filas — las MISMAS 34 celdas, ninguna se
 * queda fuera. Ver `.ph__comb`.
 *
 * Es una pieza de CATÁLOGO, no de ficha: enseña variedad de un vistazo. No hay
 * nombre ni precio en la celda — a 150 px no caben y no es lo que se mira.
 *
 * EL FONDO ES NEGRO SÓLIDO y la ILUMINACIÓN DEL MATERIAL es lo que dibuja las
 * celdas. Este componente probó antes un gris plano y una rampa con grano; el
 * recorrido vale la pena porque explica cómo está hecha la celda:
 *
 * Sobre un fondo liso, de las cuatro capas del vidrio sólo trabaja una — el
 * FILO. El desenfoque de un plano es el mismo plano y la lente refracta lo mismo
 * que había. Así que la pieza se sostiene entera sobre el filo especular, que
 * es exactamente la iluminación que tienen la barra y los demás componentes.
 *
 * Y ahí está el problema que hubo que resolver: **el filo del material se dibuja
 * con una máscara sobre el `border-radius`**, así que sobre un `clip-path` de
 * polígono no sigue al hexágono — queda un anillo rectangular cortado en
 * diagonal. No es que no valga: es que no puede.
 *
 * Se reproduce sobre el hexágono con SUS MISMOS VALORES — las once paradas del
 * degradado, `--lg-spec`, `--lg-ang`, `--lg-elev`— leídos del material, nunca
 * redefinidos. Si el filo del sistema cambia, este cambia con él. Ver
 * `.ph__cell`.
 */
import { COLORWAYS } from '~/assets/js/colorways'
import { GRAIN_URL, GRAIN_DEFAULT } from '~/assets/js/backgrounds'

const props = defineProps({
  /**
   * Las fotos, en orden de lectura. Por defecto 34 celdas repartidas entre los
   * 26 recortes que hay — el panal pide más celdas de las que hay zapatos, y en
   * prototipo se repiten.
   *
   * Las ocho repetidas NO van pegadas a su original: se toman con paso 3
   * (índices 1, 4, 7, 10…) para que ninguna copia caiga al lado ni justo debajo
   * de su gemela, que es donde el ojo las caza. Con catálogo real esto
   * desaparece solo: se pasan 34 ids y ya está.
   *
   * Acepta dos formas y es a propósito: una cadena es una ruta suelta —el caso
   * del prototipo, donde no hay catálogo— y un objeto `{ src, alt, id }` es lo
   * que mandará el backend. Así el día que haya ids reales no hay que tocar el
   * componente, sólo lo que se le pasa.
   */
  items: {
    type: Array,
    default: () => {
      const HAY = 26
      const foto = n => `/products/panel/panel-${String(n + 1).padStart(2, '0')}.webp`
      return Array.from({ length: 34 },
        (_, i) => foto(i < HAY ? i : ((i - HAY) * 3 + 1) % HAY))
    },
  },
  /**
   * El plano de detrás. SÓLIDO y negro fuerte: `#050506` es la primera parada de
   * la rampa `negro` de marca, no un negro inventado.
   *
   * Sin degradado a propósito — se probó y la rampa competía con el filo. Sobre
   * negro plano, la iluminación del vidrio es lo único que se ve, y es justo lo
   * que tiene que verse.
   */
  bg: { type: String, default: '#050506' },
  /** el grano, 0–100. Ver la cabecera: no es textura, es lo que el vidrio dobla. */
  grain: { type: Number, default: GRAIN_DEFAULT },
})

const emit = defineEmits(['pick'])

/* Normaliza las dos formas de `items` a una sola, para que la plantilla no
   tenga que preguntar. */
const fotos = computed(() => props.items.map((it, i) => {
  const o = typeof it === 'string' ? { src: it } : { ...it }
  const cw = o.id ? COLORWAYS[o.id] : null
  return {
    /* La clave es la POSICIÓN y no el id: con 26 fotos en 34 celdas hay ids
       repetidos, y dos `:key` iguales rompen el `v-for`. */
    key: i,
    id: o.id ?? i,
    src: o.src ?? cw?.frames?.[0]?.src,
    /* El `alt` vacío no es un descuido: el panal es DECORATIVO mientras no haya
       nombre real detrás de cada celda. Un lector que anuncie treinta y cuatro
       veces «zapatilla» no informa, estorba. Con backend, el nombre entra aquí
       y el `alt` deja de estar vacío solo. */
    alt: o.alt ?? cw?.name ?? '',
  }
}))

/* NO HAY REPARTO EN FILAS, y esa ausencia es el cambio que hace que el panal
 * funcione igual en las dos medidas.
 *
 * Antes las filas eran elementos y cuántas celdas iban en cada una lo decía un
 * prop. En escritorio bien; en teléfono, nueve por fila no caben en 390 px, así
 * que había que ESCONDER celdas con CSS y se quedaban doce zapatos fuera.
 * Cambiar el reparto por medida obligaba a decidirlo en JS — y eso mueve la
 * decisión al cliente: el servidor no sabe el ancho, pinta un reparto y el
 * navegador tiene que corregirlo al hidratar.
 *
 * Ahora las celdas son una lista PLANA y las filas nacen de `flex-wrap`. Cuántas
 * caben lo dice el ancho del contenedor, o sea CSS puro — nueve en escritorio,
 * cuatro en teléfono— y las 34 se pintan siempre en las dos. Lo que costaba doce
 * zapatos escondidos ahora no cuesta nada.
 *
 * Lo único que se pierde es el prop `pattern`: con celdas que fluyen, el
 * desplazamiento de las filas pares se marca con `:nth-child`, y un selector no
 * puede leer una custom property. Los dos números viven en el CSS y tienen que
 * cuadrar entre ellos — está escrito allí. */
const estilo = computed(() => ({
  '--ph-bg': props.bg,
  '--ph-grain': GRAIN_URL,
  '--ph-grain-a': props.grain / 100,
}))
</script>

<template>
  <section class="ph" :style="estilo">
    <!-- `sheet` y no el material base, y no es una preferencia: son 34
         instancias contra un presupuesto medido de ≈9 con lente. Cada lente es
         un `feDisplacementMap` con su mapa `data:` propio.

         Y hay una segunda razón, geométrica: el filo especular del material se
         dibuja con una máscara sobre el `border-radius`, así que con un
         `clip-path` de polígono NO seguiría al hexágono — quedaría un anillo
         rectangular recortado en diagonal por las esquinas. `sheet` apaga el
         marco, así que ese anillo no llega a pintarse encima del bueno.

         El filo SÍ hace falta — sobre negro plano es lo único que dibuja la
         celda— y se reproduce en `.ph__cell::after` con los valores del material.
         Ver el bloque de allí. -->
    <div class="ph__comb">
      <GlassSurface
        v-for="foto in fotos"
        :key="foto.key"
        variant="sheet"
        tag="button"
        type="button"
        class="ph__cell"
        @click="emit('pick', foto.id)"
      >
        <img
          class="ph__shot"
          :src="foto.src"
          :alt="foto.alt"
          width="182"
          height="134"
          loading="lazy"
          decoding="async"
        >
      </GlassSurface>
    </div>
  </section>
</template>

<style scoped>
.ph {
  /* ── la geometría, toda desde aquí ──────────────────────────────
     `--ph-w` es lo único que se toca para cambiar la escala: el alto, el ancho
     del panal, el paso vertical y el desplazamiento salen todos de él. */
  --ph-w:     clamp(88px, 10vw, 150px);
  /* PUNTA ARRIBA (pointy-top): el hexágono girado 30° respecto al de lado plano.
     La proporción de uno regular es 2/√3 = 1.1547, y aquí sí conviene que sea la
     regular — con punta arriba, el desplazamiento de media celda y el paso
     vertical de 3/4 sólo encajan si el hexágono no está deformado. Estirarlo
     abre huecos en rombo entre filas. */
  --ph-ratio: 1.1547;
  --ph-h:     calc(var(--ph-w) * var(--ph-ratio));
  --ph-gap:   clamp(5px, .7vw, 10px);
  /* El grosor del filo. 1.5 px es el `padding` con el que el material dibuja su
     anillo — mismo número, para que la celda no tenga un filo más gordo ni más
     fino que la barra. */
  --ph-rim:   1.5px;

  /* CUÁNTO SE PISAN LAS FILAS. Un cuarto del alto: con punta arriba, el triángulo
     superior de un hexágono encaja exactamente en el hueco que dejan dos de la
     fila de arriba, y ese encaje es lo que convierte tiras en panal. Menos que
     eso deja el fondo asomando en rombos. */
  --ph-pull:  calc(var(--ph-h) * .25 - var(--ph-gap));

  /* CUÁNTAS COLUMNAS. Este número y el `:nth-child` de más abajo TIENEN que
     cuadrar: el período es (2 × columnas − 1) y el primer desplazado es
     (columnas + 1). Con 9 → 17n + 10. Con 4 → 7n + 5.
     No se puede derivar uno del otro porque un selector no lee custom
     properties, así que van juntos y con esta nota entre los dos. */
  --ph-cols:  9;

  position: relative;
  padding: clamp(16px, 2.6vw, 34px) clamp(10px, 2vw, 26px);
  overflow: hidden;

  background-color: var(--ph-bg);
}

/* EL GRANO, y no es textura decorativa: es lo que el vidrio dobla.

   Va en un `::before` y no como segunda capa de `background` porque necesita
   OPACIDAD propia — un `background-image` no la tiene, y bajarla mezclando el
   color en el SVG lo ata a la rampa que haya debajo.

   Y va DEBAJO de las celdas en orden de pintado. Si fuera encima, el
   `backdrop-filter` no lo recogería: un backdrop sólo ve lo que se pintó antes
   que él. De ahí el `z-index: 1` del panal. */
.ph::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--ph-grain);
  opacity: var(--ph-grain-a);
  pointer-events: none;
}

.ph__comb {
  /* EL ANCHO ES EL QUE DECIDE CUÁNTAS COLUMNAS HAY, y por eso va escrito y no
     heredado: se le da exactamente lo que ocupan `--ph-cols` celdas con sus
     huecos, así que la décima no cabe y `flex-wrap` la baja. Cambiar de medida
     es cambiar `--ph-cols`; no hay que tocar el marcado ni esconder nada.

     El medio píxel es holgura contra el redondeo: el navegador calcula en
     fracciones y una fila que suma EXACTAMENTE el ancho disponible puede perder
     su última celda por una milésima. Con .5px no hay empate posible, y sigue
     estando muy lejos de dejar entrar una celda de más. */
  width: calc(var(--ph-cols) * var(--ph-w)
              + (var(--ph-cols) - 1) * var(--ph-gap) + .5px);
  margin-inline: auto;

  /* por encima del grano — ver `.ph::before` */
  position: relative;
  z-index: 1;

  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  /* `column-gap` suelto y `row-gap: 0`: el hueco entre filas NO es un hueco, es
     un solape, y lo pone el `margin-bottom` negativo de la celda. `gap` no
     admite valores negativos — la declaración entera se descarta en silencio, y
     las filas se quedan apiladas sin encajar. */
  column-gap: var(--ph-gap);
  row-gap: 0;

  /* Devuelve el hueco que el `margin-bottom` de la última fila se lleva. Sin
     esto, la fila de abajo se sale del contenedor y se la come el `overflow`. */
  padding-bottom: var(--ph-pull);
}

.ph__cell {
  width: var(--ph-w);
  height: var(--ph-h);
  flex: none;
  /* Encoge la LÍNEA, no la celda: en un contenedor con `wrap`, el alto de cada
     línea es el del mayor de sus elementos MÁS sus márgenes. Con el margen
     negativo, cada línea mide `alto − pull`, que es justo el paso de 3/4. */
  margin-bottom: calc(var(--ph-pull) * -1);

  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  padding: 0;
  background: none;
  cursor: pointer;

  /* EL HEXÁGONO. `clip-path` y no una máscara SVG ni un cuadrado girado porque
     `clip-path` recorta TAMBIÉN el `backdrop-filter`: lo que queda es vidrio con
     forma de hexágono, no un hexágono dibujado encima de un vidrio rectangular.

     PUNTA ARRIBA. El 25% y el 75% son los hombros: un hexágono regular con punta
     arriba tiene sus cuatro vértices laterales a un cuarto y a tres cuartos del
     alto. */
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);

  /* Y LA ELEVACIÓN, también la del material: sus dos capas de sombra con
     `--lg-elev`. Va en `drop-shadow` y no en `box-shadow` porque el segundo
     sigue la caja rectangular y dibujaría una sombra cuadrada detrás de un
     hexágono; `drop-shadow` sigue el canal alfa, o sea la silueta ya recortada.
     Lo que se pierde en la traducción es el `spread` negativo, que `drop-shadow`
     no tiene: se compensa con radios más cortos. */
  filter:
    drop-shadow(0 calc(var(--lg-elev) * 2px) calc(var(--lg-elev) * 4px)
      rgba(20, 14, 0, calc(var(--lg-elev) * .42)))
    drop-shadow(0 calc(var(--lg-elev) * 6px) calc(var(--lg-elev) * 12px)
      rgba(20, 14, 0, calc(var(--lg-elev) * .28)));

  transition: transform .32s cubic-bezier(.22, 1, .36, 1),
              filter    .32s ease;
}

/* EL FILO DEL MATERIAL, sobre el hexágono — y ENCIMA del vidrio, no detrás.
 *
 * DÓNDE VA importa más que cómo se dibuja, y aquí estuvo el error: el anillo
 * estaba puesto como FONDO de la celda, o sea por debajo de las capas del
 * vidrio. Pero el velo es translúcido —.38— y el desenfoque también recoge lo
 * que hay detrás, así que ese degradado blanco se veía A TRAVÉS de toda la celda
 * y no sólo en el margen: iluminaba el zapato por dentro y la pieza parecía un
 * degradado, no un filo. El material lo pinta en su capa superior (`__spec`) por
 * esta misma razón.
 *
 * EL ANILLO ES UN POLÍGONO CON AGUJERO: se traza el hexágono exterior y después
 * el interior, y `evenodd` deja pintado sólo lo que hay entre los dos. Así el
 * filo tiene grosor constante en toda la vuelta — incluidas las diagonales, que
 * es donde la máscara del material falla sobre un polígono.
 *
 * Los factores del hexágono interior no son mágicos. Meter los lados `t` hacia
 * dentro en un hexágono regular da otro hexágono semejante, y como el alto es
 * 2/√3 del ancho, la reducción vertical es `t · 1.1547` en cada punta y
 * `t · 0.5774` en cada hombro. Con eso el anillo mide `--ph-rim` en cualquier
 * dirección.
 *
 * Las once paradas y `--lg-spec` / `--lg-ang` son las del material, leídas. */
.ph__cell::after {
  content: "";
  position: absolute;
  inset: 0;
  /* por encima de `__body`, que es la capa 3 */
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
    /* interior, metido `--ph-rim` */
    50% calc(var(--ph-rim) * 1.1547),
    calc(100% - var(--ph-rim)) calc(25% + var(--ph-rim) * .5774),
    calc(100% - var(--ph-rim)) calc(75% - var(--ph-rim) * .5774),
    50% calc(100% - var(--ph-rim) * 1.1547),
    var(--ph-rim) calc(75% - var(--ph-rim) * .5774),
    var(--ph-rim) calc(25% + var(--ph-rim) * .5774));
}

/* EL DESPLAZAMIENTO DE LAS FILAS PARES. Con celdas que fluyen no hay un elemento
   «fila» al que dárselo, así que se le da a la PRIMERA CELDA de cada fila par y
   ella arrastra a las demás.

   El período es (2 × columnas − 1) porque una fila impar y una par suman eso, y
   el primer desplazado es (columnas + 1). Ver la nota de `--ph-cols`.

   Media celda MÁS medio hueco: el vértice de abajo tiene que caer en el centro
   del hueco de arriba, y ese centro está a medio PASO, no a media celda. */
.ph__comb > :nth-child(17n + 10) {
  margin-left: calc((var(--ph-w) + var(--ph-gap)) * .5);
}

@media (hover: hover) and (pointer: fine) {
  .ph__cell:hover {
    transform: translateY(-3px) scale(1.045);
    filter: drop-shadow(0 6px 14px rgba(0, 0, 0, .38));
  }
}

/* El foco no puede ir por `outline`: el `clip-path` lo recorta y no se ve nada.
   Se marca con la misma elevación del hover más un halo, que sí sobreviven. */
.ph__cell:focus-visible {
  outline: none;
  transform: translateY(-3px) scale(1.045);
  filter: drop-shadow(0 0 0 2px rgba(255, 255, 255, .9))
          drop-shadow(0 6px 14px rgba(0, 0, 0, .38));
}

/* Las capas del vidrio van a `inset: 0` — SIN meterlas hacia dentro y sin
   recorte propio. Estuvieron a `--ph-rim` para dejar asomar por detrás el
   anillo; ahora el anillo va encima, en `.ph__cell::after`, así que ese hueco
   no sólo sobra: dejaba un borde sin velo.

   Y no necesitan `clip-path` porque la celda ya recorta a sus hijos.

   Tampoco llevan el resplandor interior del material. Es un `box-shadow: inset`
   y esos siguen la caja RECTANGULAR: sobre un hexágono aparecía sólo en los dos
   lados rectos y como luz metida hacia dentro, que es justo lo que no se quiere
   aquí — la iluminación tiene que quedarse en el borde. */

/* El cuerpo del vidrio es la ÚNICA capa en flujo — `__back`, `__veil` y `__spec`
   van en absoluto— así que es él quien tiene que llenar la celda y centrar la
   foto. Sin esto se encoge al tamaño de la imagen y el `78%` se mide contra sí
   mismo, que no converge en nada. */
.ph__cell :deep(.av-glass__body) {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.ph__shot {
  display: block;
  /* 78% y no 100%: el hexágono sólo tiene su ancho completo en el CENTRO, y una
     foto a ras de caja se saldría por los cuatro biseles. Las 26 fotos comparten
     caja unión, así que centrar la caja centra la tinta y todas quedan a la
     misma escala.

     `width`/`height` van declarados en el HTML por lo de siempre — una imagen
     `lazy` sin proporción intrínseca mide CERO hasta que llega el fichero. */
  width: 78%;
  height: auto;
  pointer-events: none;
}

/* ══ teléfono ═══════════════════════════════════════════════════════
   CUATRO columnas y las filas que hagan falta — diez, para las mismas 34 celdas.
   Ninguna se queda fuera, que es la diferencia con la versión anterior: aquella
   escondía las que no cabían y perdía doce zapatos.

   Y todo lo que cambia son dos números que tienen que cuadrar entre ellos:
   `--ph-cols: 4` y el `:nth-child(7n + 5)` — período 2×4−1 = 7, primer
   desplazado 4+1 = 5. El ancho del contenedor hace el resto.

   Nueve zapatillas en 390 px serían celdas de 40: a ese tamaño no se reconoce
   ninguna, que es el mismo motivo por el que el acordeón se tumba en móvil. */
@media (max-width: 640px) {
  .ph {
    --ph-w:    clamp(70px, 22.5vw, 96px);
    --ph-cols: 4;
  }

  .ph__comb > :nth-child(17n + 10) { margin-left: 0; }
  .ph__comb > :nth-child(7n + 5) {
    margin-left: calc((var(--ph-w) + var(--ph-gap)) * .5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ph__cell { transition: none; }
}
</style>

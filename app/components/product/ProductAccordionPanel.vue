<script setup>
/**
 * Un panel de <ProductAccordion>. No se usa suelto.
 *
 * Existe como componente propio por UNA razón concreta: `useFitText` es un
 * composable con `onMounted` y `ResizeObserver`, así que necesita una instancia
 * por panel. Llamarlo dentro de un `v-for` del padre no es posible.
 *
 * EL RECORTE — lo único no obvio de la pieza.
 * El cuerpo tiene el ancho del panel EXPANDIDO y va centrado en absoluto; el
 * panel recorta con `overflow: hidden`. Así, al contraerse, el producto se
 * recorta por los dos lados en vez de encogerse: es una ventana que se cierra,
 * no una foto que mengua. Todo lo demás del componente sale de ahí.
 *
 * Los colores NO son suyos: llegan como custom properties `--ps-*` que el padre
 * pinta con `toCss(id)`. Un producto tiene un color, no dos según dónde se
 * pinte, así que se reusan los del showcase en vez de inventar unos `--pa-*`.
 */
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import { COLORWAYS, DEFAULT_COLORWAY } from '~/assets/js/colorways'
import { useFitText } from '~/composables/useFitText'

const props = defineProps({
  /** clave de COLORWAYS */
  cwId: { type: String, required: true },
  /** lo pinta el padre: es el panel señalado */
  isOpen: { type: Boolean, default: false },
  /** la primera foto se precarga; las demás esperan */
  eager: { type: Boolean, default: false },
  /** cuánto del ancho de su caja llena el texto gigante */
  fill: { type: Number, default: 0.9 },
  /** este panel se ha comido el acordeón y enseña la ficha completa */
  isDetail: { type: Boolean, default: false },
  /** hay OTRO panel en detalle: éste queda plegado a cero */
  isCollapsed: { type: Boolean, default: false },
})

const emit = defineEmits(['pick', 'back', 'buy'])

/* La talla elegida vive AQUÍ y no arriba: es del producto que se está mirando,
   y al cerrar el detalle se va con él. Cuando haya carrito de verdad, subirá. */
const talla = ref(null)
watch(() => props.isDetail, abierto => { if (!abierto) talla.value = null })

const cw = computed(() => COLORWAYS[props.cwId] || COLORWAYS[DEFAULT_COLORWAY])
const shot = computed(() => cw.value.frames?.[0]?.src)
/* en caja de frase (R1). `short` distingue el colorway; `name` los repetiría */
const word = computed(() => cw.value.short || cw.value.name)

/* La caja del texto es `.pa__body`, que mide siempre lo mismo —el ancho del
   expandido— aunque el panel se contraiga. Por eso el texto no baila al abrir
   y cerrar: lo que cambia es el recorte, no su caja. */
const body = ref(null)
const wordEl = ref(null)
useFitText(wordEl, body, props.fill)

/* El panel se expande por tres vías y sólo una es estado de JS: el tap. El
   hover y el foco los resuelve CSS, que es lo correcto — el ratón no tiene por
   qué escribir estado — pero entonces `aria-expanded` se quedaba en `false` con
   el panel abierto de par en par.

   Se sigue el FOCO y no el hover porque quien lee ese atributo navega con
   teclado: para él, foco y apertura son la misma cosa. Un ratón no consulta
   aria. */
const focused = ref(false)
const expanded = computed(() => props.isOpen || focused.value)

/* Sólo cuenta el foco que el navegador considera VISIBLE — el de teclado. Un
   clic con el ratón también enfoca el enlace, pero ahí el panel no se abre, y
   `aria-expanded` tiene que decir lo que se ve, no lo que pasó. */
function onFocus(e) {
  focused.value = e.target.matches(':focus-visible')
}

/* Con el detalle abierto el panel ya no es un enlace — se está mirando lo que
   el enlace llevaba — así que no hace nada. Y cuando sí lo es, el `preventDefault`
   es de prototipo: el detalle se abre aquí mismo, no en otra página. */
function onClick(e) {
  if (props.isDetail) return
  e.preventDefault()
  emit('pick', props.cwId)
}
</script>

<template>
  <!-- Es un <a> con href real, no un botón decorativo: se puede abrir en otra
       pestaña y un lector lo anuncia como lo que es. El `preventDefault` es de
       prototipo — la ruta de producto todavía no existe, así que el padre
       recoge el `pick` y decide.

       SIEMPRE es un <a>, también en detalle, y NO un `<component :is>` que
       alterne con `<div>`: cambiar de etiqueta hace que Vue destruya el
       elemento y cree otro, y un elemento recién creado no tiene estado previo
       del que transicionar — al cerrar el detalle el panel saltaba del 100% al
       25% de golpe mientras los otros tres sí animaban, y eso se lee como que
       algo se quedó colgado.

       En detalle sólo se le quita el `href`: un <a> sin él no es enlace, no
       recibe foco y no se anuncia como tal — que es justo lo que hace falta,
       porque ya estás viendo lo que el enlace llevaba. -->
  <a
    class="pa__panel"
    :class="{ 'is-open': isOpen, 'is-detail': isDetail }"
    :inert="isCollapsed || undefined"
    :href="isDetail ? undefined : '/producto/' + cwId"
    :aria-expanded="isDetail ? undefined : expanded"
    @click="onClick"
    @focus="onFocus"
    @blur="focused = false"
  >
    <span ref="body" class="pa__body">
      <!-- decoración: su contenido ya está en el alt de la foto -->
      <span ref="wordEl" class="pa__word" aria-hidden="true">{{ word }}</span>

      <!-- `width`/`height` son la CAJA UNIÓN del recorte, la misma para los
           cuatro — 647×636, que es la tinta más ancha por la más alta con 46 px
           de margen a cada lado. Ese margen no es estético: sin él el Chicago,
           cuya tinta medía exactamente el alto del lienzo, tocaba el borde y
           era el primero en verse cortado al contraerse el panel mientras los
           otros tres aún tenían aire. Cuatro zapatos a la misma escala tienen
           que tener también el mismo aire. No son decorativos: en el acordeón tumbado la foto se
           dimensiona por el alto (`height: 100%; width: auto`), y una imagen
           `lazy` que aún no ha cargado no tiene proporción intrínseca — medía
           CERO de ancho y la fila salía vacía hasta que llegaba el fichero.
           Con la proporción declarada la caja está desde el primer pintado, y
           de paso no hay salto de layout al cargar. -->
      <img
        v-if="shot"
        class="pa__shot"
        :src="shot"
        :alt="cw.name + ' — ' + cw.line"
        width="647"
        height="636"
        :loading="eager ? 'eager' : 'lazy'"
        :fetchpriority="eager ? 'high' : 'auto'"
        decoding="async"
      >

    </span>

    <!-- La descripción y la ficha cuelgan del PANEL, no del cuerpo, y eso es
         estructural: el cuerpo mide siempre lo que mide el panel ABIERTO — es
         lo que recorta la foto — así que anclar el texto ahí le daba márgenes
         medidos contra una caja que casi nunca coincide con lo que se ve.
         Colgando del panel, el margen es el mismo en cualquier estado.

         Y cada una en su esquina: la descripción arriba a la izquierda, el
         nombre, el precio y el botón abajo a la derecha. Antes compartían
         bloque y caían encima del zapato. -->
    <span class="pa__line">{{ cw.line }}</span>

    <span class="pa__text">
      <span class="pa__name">{{ cw.name }}</span>
      <span class="pa__price">{{ cw.price }}</span>
      <!-- VIDRIO ESTÁNDAR — velo negro, el material sin variantes. Es el mismo
           en las cards, en el detalle y en las tallas, en cualquier medida: una
           sola pieza de vidrio para todo el componente.

           Con velo negro y texto blanco el botón se despega igual sobre los
           cuatro planos de color. La variante `light` se probó y se descartó:
           invierte a tinta oscura lo que va encima — es su diseño — y el propio
           `glass.css` avisa de que está calibrada para glífos, no para texto. -->
      <GlassSurface :radius="999" tag="span" class="pa__cta">
        <span class="pa__cta-in">Ver detalles <ArrowRight :stroke-width="1.8" /></span>
      </GlassSurface>
    </span>

    <!-- ── el detalle ────────────────────────────────────────────
         Mismo panel, mismo zapato, mismo título detrás: lo único que entra es la
         información que no cabía. Por eso no navega a ningún sitio — se sigue
         mirando lo mismo, sólo que de cerca. -->
    <div v-if="isDetail" class="pa__detail">
      <GlassSurface :radius="999" tag="div" class="pa__back">
        <!-- `.stop`: el clic no sigue subiendo hasta el <a> del panel. Hoy el
             manejador de arriba ya se protege solo, pero dejar que un botón de
             cerrar burbujee hasta el elemento que abre es pedirle a dos piezas
             que se pongan de acuerdo para siempre. -->
        <button type="button" @click.stop="emit('back')">
          <ArrowLeft :stroke-width="2" /> Regresar
        </button>
      </GlassSurface>

      <div class="pa__dcol pa__dcol--l">
        <h3 class="pa__dtitle">{{ cw.name }}</h3>
        <p class="pa__dprice">{{ cw.price }}</p>
        <p v-if="cw.blurb" class="pa__dblurb">{{ cw.blurb }}</p>
      </div>

      <div v-if="cw.sizes?.length" class="pa__dcol pa__dcol--r">
        <p class="pa__dsizes-t">Tallas disponibles</p>
        <div class="pa__dsizes" role="group" aria-label="Tallas disponibles">
          <GlassSurface
            v-for="t in cw.sizes"
            :key="t"
            :radius="999"
         
            tag="span"
            class="pa__dsize"
          >
            <button type="button" :aria-pressed="t === talla" @click.stop="talla = t">
              <!-- la selección del sistema, la misma que el ítem activo de la
                   barra: sobre el velo negro es LUZ, el mismo vidrio un poco
                   más encendido. -->
              <span v-if="t === talla" class="av-glass-sel" aria-hidden="true" />
              {{ t }}
            </button>
          </GlassSurface>
        </div>

        <GlassSurface :radius="999" tag="div" class="pa__buy">
          <button type="button" @click.stop="emit('buy', { id: cwId, size: talla })">
            Comprar ahora
          </button>
        </GlassSurface>
      </div>
    </div>
  </a>
</template>

<style scoped>
/* El ancho lo pone el PADRE con `--pa-w`: su CSS scoped alcanza la raíz de este
   componente, que es justo esta etiqueta. Aquí sólo va lo de dentro. */
.pa__panel {
  /* ── la tinta de la ficha ──────────────────────────────────────
     BLANCA en TODAS las medidas, y no la `--ps-ink` del colorway. Va aquí
     arriba, fuera de cualquier `@media`, justamente para eso: la ficha se lee
     igual en los cuatro planos y en cualquier pantalla, en vez de cambiar de
     tinta según el panel o el ancho.

     La jerarquía no se pierde — se mantiene con ALFA y no con otro color: el
     nombre a blanco puro, la descripción y el precio al 72%, que es el mismo
     «medio iluminado» que usa el material para lo secundario. */
  --pa-on-surface:      #FFFFFF;
  --pa-on-surface-soft: rgba(255, 255, 255, .72);

  /* ── el hueco de la barra ─────────────────────────────────────
     El acordeón es una pieza a pantalla completa y la barra es `fixed`: cuando
     la sección llena el viewport, la barra le flota encima. Sin reservar su
     hueco, el título y el botón de volver acababan DEBAJO de la barra.

     `--av-nav-space` es el mismo token que reserva el resto de la app, no un
     número nuevo. Y se aplica ARRIBA Y ABAJO por igual: abajo no hay nada que
     esquivar, pero un texto pegado al borde inferior contra otro que arranca 90
     px más abajo se lee torcido. Simétrico se lee como un encuadre. */
  --pa-pad-x: clamp(16px, 3cqw, 34px);
  --pa-pad-y: var(--av-nav-space);

  position: relative;
  overflow: hidden;           /* ← el recorte */
  display: block;
  height: 100%;
  background: var(--ps-surface);
  color: var(--ps-ink);
  text-decoration: none;
  /* `flex-basis` y no `grid-template-columns`: es una LONGITUD, interpola en
     todos lados sin sorpresas y no depende de soporte reciente.

     El VALOR lo escribe el padre en `--pa-w`, que es quien sabe cuántos
     hermanos hay. Aquí sólo se fija que el panel no crezca ni encoja — el
     tamaño es el que se le da, no el que negocie con los vecinos.

     La transición va sobre `--pa-w` y NO sobre `flex-basis`: la variable está
     registrada con `@property` en el padre, así que el navegador sabe
     interpolarla y `flex-basis` la sigue. */
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: var(--pa-w);
  transition: --pa-w .5s cubic-bezier(.22, 1, .36, 1);
}

/* La caja del contenido mide lo que mide el panel ABIERTO y no se mueve nunca.
   Es lo que hace que al contraerse el producto se recorte simétricamente por
   los dos lados en vez de encogerse. */
.pa__body {
  position: absolute;
  inset-block: 0;
  left: 50%;
  transform: translateX(-50%);
  /* `cqw` y no `vw`: es el % del ANCHO DEL ACORDEÓN, no del viewport, así que
     funciona igual dentro de un contenedor con márgenes. */
  width: var(--pa-body);
  /* La caja se ensancha CON el panel, no de golpe. Al abrir el detalle pasa de
     40cqw a 100cqw, y sin transición saltaba a lo ancho mientras el panel
     todavía estaba a medio abrir: se veía un corte, como si dentro hubiera otro
     componente con sus propias medidas. Mismo tiempo y misma curva que el
     reparto del acordeón — una sola cosa moviéndose. */
  transition: width .5s cubic-bezier(.22, 1, .36, 1);
  display: flex;
  flex-direction: column;
  /* la ficha está fuera del flujo, así que el único hijo aquí es la foto */
  justify-content: center;
  padding: clamp(16px, 3cqw, 34px);
}

/* ── el texto gigante ──────────────────────────────────────────────────────
   Detrás de todo y sólo en el expandido. Su tamaño lo mide `useFitText` contra
   `.pa__body`, con `fill` 0.9 y no el 0.995 del showcase: aquí hay que dejar
   aire lateral o la palabra choca con el recorte del panel vecino. */
.pa__word {
  position: absolute;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);
  font-size: 12cqw;           /* punto de partida; useFitText lo reescala */
  font-weight: 900;
  letter-spacing: -.055em;
  line-height: .8;
  white-space: nowrap;
  color: var(--ps-word);
  /* SIEMPRE visible, también en los paneles contraídos. No es un estado: es el
     título del colorway, y recortado por el panel vecino es justo el efecto —
     la palabra cruza el acordeón entero y cada panel enseña su trozo. */
  opacity: 1;
  pointer-events: none;
}

/* ── el producto ───────────────────────────────────────────────────────────
   Va en flujo y se lleva el alto que sobra. La sombra la pone el CSS y sigue la
   silueta recortada: dos, una corta y densa que lo ancla y otra larga y difusa
   que lo separa del plano. Una sola sombra media es lo que se lee como mancha
   gris — el gris viene de que su borde tiene la misma dureza en todo el
   recorrido, no de que sea poco negra. */
.pa__shot {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  object-fit: contain;
  /* CENTRADO en reposo, en los dos ejes. Su caja es el cuerpo entero — la ficha
     está fuera del flujo — así que «centro» es el centro del panel de verdad.

     Y al abrirse se corre a la izquierda con `object-position`, NO con
     `transform`. La diferencia importa: `transform` mueve la CAJA, así que el
     zapato se salía por el borde y el `overflow: hidden` del panel se lo
     comía. `object-position` mueve la imagen DENTRO de una caja que no se
     mueve — imposible que se salga, por mucho que se desplace.

     Mismo tiempo y misma curva que el ancho del panel: el zapato y su panel se
     mueven como una sola cosa, no como dos animaciones a destiempo. */
  object-position: center;
  transition: object-position .5s cubic-bezier(.22, 1, .36, 1);
  filter:
    drop-shadow(0 10px 12px rgba(0, 0, 0, .26))
    drop-shadow(0 38px 46px rgba(0, 0, 0, .34));
}

/* ── el bloque de texto ────────────────────────────────────────────────────
   Entra con retardo respecto al ancho: si aparece a la vez se lee como que el
   texto empuja al panel; con 180 ms se lee como consecuencia. El número es
   sensación, no cálculo. */
/* Se queda donde siempre — abajo a la izquierda del cuerpo — pero FUERA DEL
   FLUJO. Es lo que permite que el zapato esté centrado en el panel entero: en
   flujo, la ficha ocupaba su sitio aunque estuviera invisible y le robaba al
   zapato la mitad de abajo.

   Los `clamp` son los mismos que el padding del cuerpo, así que visualmente
   cae exactamente donde caía antes.

   Entra con retardo respecto al ancho: si aparece a la vez se lee como que el
   texto empuja al panel; con 180 ms se lee como consecuencia. El número es
   sensación, no cálculo. */
.pa__text {
  position: absolute;
  left: auto;
  right: var(--pa-pad-x);
  bottom: var(--pa-pad-y);
  display: flex;
  flex-direction: column;
  /* a la derecha de verdad: el bloque se alinea a su borde y el texto también,
     o el nombre largo dejaría el precio descolgado a la izquierda */
  align-items: flex-end;
  text-align: right;
  gap: 2px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity .28s ease .18s, transform .28s ease .18s;
}

/* Escala propia, no la de la barra: esto es display, no interfaz — la excepción
   está escrita en la regla R2. Sin versales y sin el trazo ancho que las
   acompañaba (R1). */
/* Arriba a la izquierda, en su propia esquina. Fuera del flujo como la ficha —
   si no, le quitaría al zapato su mitad de arriba y el centrado se iría.
   Entra igual que la ficha pero desde ARRIBA: cada esquina asoma desde su
   lado. */
.pa__line {
  position: absolute;
  top: var(--pa-pad-y);
  left: var(--pa-pad-x);
  right: var(--pa-pad-x);
  font-size: 10.5px;
  letter-spacing: .01em;
  color: var(--pa-on-surface-soft);
  /* que no empuje: si no cabe, se corta */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity .28s ease .18s, transform .28s ease .18s;
}
.pa__name {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -.02em;
  color: var(--pa-on-surface);
}
.pa__price {
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--pa-on-surface-soft);
}

/* El vidrio se encarga del fondo; aquí sólo va la caja y el contenido. El
   `align-self` es para que la píldora mida lo que mide su texto y no se estire
   al ancho de la columna. */
.pa__cta {
  align-self: flex-start;
  margin-top: 14px;
}
.pa__cta-in {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  /* el mismo blanco que el nombre y el precio: la ficha entera va a una sola
     tinta, en cualquier medida y sobre cualquier panel */
  color: var(--pa-on-surface);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: -.01em;
  white-space: nowrap;
}
.pa__cta-in :deep(svg) { width: 14px; height: 14px; }

/* ── abierto ─────────────────────────────────────────────────────────────
   Las TRES vías de apertura tienen que revelar el contenido, no sólo el tap.
   El ancho lo reparte el padre y el contenido lo revela cada panel, pero los
   disparadores son los mismos: si aquí sólo estuviera `.is-open`, con el ratón
   el panel se abriría VACÍO — que es exactamente lo que hacía. */
.pa__panel.is-open .pa__shot,
.pa__panel:focus-visible .pa__shot { object-position: 14% center; }
.pa__panel.is-open .pa__text,
.pa__panel:focus-visible .pa__text,
.pa__panel.is-open .pa__line,
.pa__panel:focus-visible .pa__line { opacity: 1; transform: none; }

/* El hover sólo donde hay puntero fino, igual que el reparto del ancho: si los
   dos criterios se separan, hay anchos que no casan con lo que se ve. */
@media (hover: hover) and (pointer: fine) {
  .pa__panel:hover .pa__shot { object-position: 14% center; }
  .pa__panel:hover .pa__text,
  .pa__panel:hover .pa__line { opacity: 1; transform: none; }
}

/* ── al abrir el detalle ──────────────────────────────────────────────────
   La ficha corta SE APAGA, no se desmonta. Con `v-if` desaparecía de un
   fotograma al siguiente mientras el panel seguía ensanchándose, y ese salto es
   parte del «corte»: lo que tiene que verse es una card creciendo, no una card
   sustituida por otra.

   Va al final de la cascada para ganarle a las reglas de hover y de `is-open`:
   con el detalle abierto el panel también está señalado, así que sin esto la
   ficha corta seguiría encendida debajo del detalle. */
.pa__panel.is-detail .pa__line,
.pa__panel.is-detail .pa__text {
  opacity: 0;
  pointer-events: none;
  transition: opacity .18s ease;
}

/* ══ teléfono ─ el recorte gira 90° ═══════════════════════════════
   El acordeón se tumba, así que la idea entera se gira con él: el cuerpo pasa
   de tener ANCHO fijo y recortarse por los lados, a tener ALTO fijo — el del
   panel abierto — y recortarse por arriba y por abajo. Sigue siendo una ventana
   que se abre, sólo que ahora se abre hacia abajo.

   Y de paso el contenido se ordena en fila: el zapato manda sobre el alto de su
   fila y la ficha se pone a su lado, que es el sitio que en vertical no existía
   y en horizontal sobra. */
@media (max-width: 640px) {
  .pa__body {
    inset-block: auto;
    inset-inline: 0;
    top: 50%;
    left: auto;
    transform: translateY(-50%);
    width: auto;
    height: var(--pa-body-h);
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    padding: 0 clamp(14px, 4vw, 24px);
  }

  /* La caja ocupa la fila entera y la foto se mueve DENTRO, igual que en
     escritorio: mismo mecanismo, mismo motivo — así no hay forma de que se
     salga del recorte. Lo que la limita es el ALTO de la fila, que es lo que ha
     ganado al tumbarse el acordeón. */
  .pa__shot {
    flex: 1;
    width: 100%;
    height: 100%;
    min-width: 0;
  }

  /* En una fila no caben tres bloques: la DESCRIPCIÓN se va. Es lo primero que
     sobra — el nombre ya dice qué es y el colorway se ve en la foto. */
  .pa__line { display: none; }

  /* La ficha pasa a ocupar la card entera con un margen Único por los cuatro
     lados, y reparte por dentro: nombre y precio arriba a la izquierda, el
     botón abajo a la derecha. Un solo número de margen — `--pa-pad-m` — para
     que ninguna de las dos esquinas quede más pegada al borde que la otra. */
  /* Una fila mide 211 px: los 90 del hueco de la barra por arriba y por abajo
     no dejarían nada. Las cards vuelven a su margen corto — sólo la primera
     queda bajo la barra, y ahí lo que hay es la foto, que no molesta. El
     DETALLE sí lo respeta, porque ahí sí ocupa la pantalla entera. */
  .pa__text {
    --pa-pad-m: clamp(12px, 3.5vw, 20px);
    inset: var(--pa-pad-m);
    align-items: flex-start;
    text-align: left;
  }
  /* `margin-top: auto` en el botón y NO `space-between` en el contenedor: con
     `space-between` y tres hijos, el hueco se reparte entre los TRES y el
     precio se iba al centro de la card, despegado de su nombre. Empujando sólo
     el botón, nombre y precio se quedan juntos arriba como estaban. */
  .pa__cta {
    align-self: flex-end;
    margin-top: auto;
  }

  /* el texto gigante no entra: a lo ancho de una fila `useFitText` lo pondría
     enorme y taparia el zapato, y no hay hueco vertical donde bajarlo */
  .pa__word { display: none; }

  .pa__name { font-size: 15px; }
  .pa__line { font-size: 10px; }
  .pa__cta-in { padding: 8px 13px; }
}


/* El cambio es instantáneo, no se elimina: la funcionalidad se queda. */
@media (prefers-reduced-motion: reduce) {
  .pa__panel, .pa__word, .pa__text, .pa__line,
  .pa__body, .pa__shot { transition: none; }
  .pa__detail { animation: none; }
}

/* ══ el detalle ═══════════════════════════════════════════════
   Se monta ENCIMA del panel, no dentro del cuerpo: el cuerpo es la caja que
   recorta la foto y aquí no hay nada que recortar. Tres zonas y el zapato en
   medio, que ya estaba.

   El cuerpo pasa a medir el ancho entero del acordeón: con el panel al 100% ya
   no hay recorte que hacer, y dejarlo en 40cqw dejaría el zapato pegado a la
   izquierda. */
.pa__panel.is-detail .pa__body { width: 100cqw; }
.pa__panel.is-detail .pa__shot { object-position: center; }

/* El detalle entra CUANDO el panel ya casi ha terminado de abrirse — 250 ms de
   los 500. Aparecer a la vez que el ancho se lee como que el contenido empuja
   al panel; aparecer después, como que el panel le hizo sitio.

   Es una ANIMACIÓN CSS y no un `<Transition>` de Vue, y la diferencia importa:
   `<Transition>` secuencia sus clases con `requestAnimationFrame` y no retira
   el nodo hasta que la salida termina. Si no hay fotogramas — pestaña de fondo,
   `prefers-reduced-motion`, una salida interrumpida — el detalle se queda
   montado encima y no hay forma de volver. Con `v-if` el desmontaje es
   inmediato e incondicional, y la animación sólo decora la entrada: si no corre,
   lo peor que pasa es que aparezca de golpe. */
@keyframes pa-detail-in {
  from { opacity: 0 }
  to   { opacity: 1 }
}
.pa__detail { animation: pa-detail-in .3s ease .25s both; }

.pa__detail {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  /* `auto` para la fila del botón de volver y `1fr` para el resto, que se
     estira hasta el borde. SIN `align-content: start`: eso hacía que la fila
     `1fr` se quedara en el alto de su contenido, y entonces el `align-self: end`
     de la columna de tallas no tenía contra qué alinearse — se iba casi mil
     píxeles por debajo del panel. */
  grid-template-rows: auto 1fr;
  gap: clamp(12px, 2cqw, 24px);
  padding: var(--pa-pad-y) var(--pa-pad-x);
  /* el grid no puede comerse el clic del zapato ni tapar nada que no sea suyo */
  pointer-events: none;
}
.pa__detail > * { pointer-events: auto; }

/* Regresar: arriba a la izquierda, y la flecha mira a la IZQUIERDA — se
   retrocede en el mismo plano, no se sube a otro sitio. */
.pa__back {
  grid-column: 1 / -1;
  justify-self: start;
}
.pa__back button,
.pa__buy button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: none;
  padding: 10px 18px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .01em;
  color: var(--pa-on-surface);
  cursor: pointer;
}
.pa__back :deep(svg) { width: 15px; height: 15px; }

.pa__dcol { display: flex; flex-direction: column; align-self: start; }
.pa__dcol--l { max-width: 34ch; }
/* la columna de tallas se va abajo a la derecha, como en la referencia */
.pa__dcol--r { grid-column: 2; align-self: end; align-items: flex-end; text-align: right; }

.pa__dtitle {
  margin: 0;
  font-size: clamp(20px, 2.6cqw, 34px);
  font-weight: 800;
  letter-spacing: -.02em;
  line-height: 1.05;
  color: var(--pa-on-surface);
}
.pa__dprice {
  margin: 6px 0 0;
  font-size: clamp(16px, 1.9cqw, 24px);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--pa-on-surface);
}
.pa__dblurb {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--pa-on-surface-soft);
}

.pa__dsizes-t {
  margin: 0 0 12px;
  font-size: clamp(14px, 1.6cqw, 20px);
  font-weight: 700;
  letter-spacing: -.01em;
  color: var(--pa-on-surface);
}
.pa__dsizes {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  /* seis por fila: 6×56 + 5×8 = 376 */
  max-width: 376px;
}

/* CAJA FIJA, y ahí está el detalle que se veía mal: dejadas a su contenido, un
   «9» y un «10.5» miden distinto y la rejilla queda descuadrada. Todas iguales
   — el ancho lo pone la más larga — y `tabular-nums` para que además los
   dígitos ocupen lo mismo entre sí.

   COSTE: son diez instancias de vidrio, más las dos de los botones. Está por
   encima del presupuesto que fija el material (~9 por vista), y se acepta
   porque sólo existen mientras el detalle está abierto y sólo hay un detalle a
   la vez. Si en un móvil de gama media se nota, lo primero que cae es la lente
   de estas diez. */
.pa__dsize {
  width: 56px;
  height: 40px;
  flex: none;
}
.pa__dsize button {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: inherit;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--pa-on-surface);
  cursor: pointer;
}

.pa__buy { margin-top: 18px; align-self: flex-end; }

/* ── el detalle en teléfono ─────────────────────────────────────
   Una columna: no hay ancho para dos y el zapato necesita el suyo. */
@media (max-width: 640px) {
  /* Una columna: no hay ancho para dos y el zapato necesita el suyo.

     Y el encuadre lo marcan las DOS barras que el componente no controla: la
     del sitio arriba y la del navegador abajo. La pieza mide `100svh`, que ya
     descuenta la del navegador, pero un texto pegado a ese borde se lee
     igual de apretado — el borde de la pantalla no es el borde útil. Así que
     arriba y abajo se reserva lo mismo que en escritorio, `--av-nav-space`, y
     el diálogo respira por los dos lados. */
  .pa__detail {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto 1fr;
    padding: var(--av-nav-space) clamp(14px, 4vw, 24px);
  }
  .pa__dcol--r { grid-column: 1; align-items: flex-start; text-align: left; }
  .pa__dsizes { justify-content: flex-start; }
  .pa__dblurb { display: none; }   /* no cabe, y el nombre ya orienta */
  .pa__buy { align-self: flex-start; }

  /* EL ZAPATO SUBE. Arriba sólo hay un botón y dos líneas de texto, así que no
     hace falta reservarle media pantalla: se le da la banda alta y el tercio
     de abajo queda entero para las tallas y el botón de comprar, que es lo que
     se toca.

     Se deja de centrar (`transform: none`) y se le da una banda EXPLÍCITA: del
     22% al 62% del alto del panel. En porcentaje y no en píxeles porque el alto
     de un teléfono varía mucho y lo que tiene que mantenerse es la proporción
     entre las tres zonas, no una distancia. */
  .pa__panel.is-detail .pa__body {
    inset-block: auto;
    top: 22%;
    height: 40%;
    transform: none;
  }
}
</style>

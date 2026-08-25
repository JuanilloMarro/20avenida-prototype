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
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-vue-next'
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

/**
 * EL `href` NO SE PINTA HASTA QUE HAY QUIEN LO CANCELE. Aquí estaba el 404.
 *
 * El panel es un <a> con destino real y el clic lo cancela — el detalle se abre
 * aquí mismo. Pero entre que el servidor manda el HTML y que Vue engancha el
 * manejador hay una ventana en la que el enlace ya está pintado y no lo cancela
 * nadie: un clic ahí lo sigue el navegador, se va a /producto/<id>, que no es
 * una ruta que exista, y el servidor devuelve `Page not found`. Por eso el error
 * llegaba con traza de SERVIDOR y no de cliente: era una carga entera.
 *
 * En desarrollo esa ventana dura lo que tarde Vite en servir los módulos, que
 * son segundos, y por eso aparecía a rat os y no siempre.
 *
 * Se arregla desde el HTML, no desde el manejador: sin `href`, un <a> no tiene
 * comportamiento de activación y no hay nada que cancelar. Se le pone después
 * de montar, cuando el `preventDefault` ya está puesto. El primer render del
 * cliente coincide con el del servidor — los dos sin `href` — así que no hay
 * desajuste de hidratación.
 */
const montado = ref(false)
onMounted(() => { montado.value = true })

/* Sólo cuenta el foco que el navegador considera VISIBLE — el de teclado. Un
   clic con el ratón también enfoca el enlace, pero ahí el panel no se abre, y
   `aria-expanded` tiene que decir lo que se ve, no lo que pasó. */
function onFocus(e) {
  focused.value = e.target.matches(':focus-visible')
}

/* El `preventDefault` va PRIMERO, antes de cualquier salida: el detalle se abre
   aquí mismo, no en otra página, y con el detalle ya abierto tampoco hay a dónde
   ir. Cancelar de entrada cuesta nada — sin `href` no cancela nada — y ahorra
   tener que acordarse de que la salida de arriba deja el enlace vivo. */
function onClick(e) {
  e.preventDefault()
  if (props.isDetail) return
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
    :href="isDetail || !montado ? undefined : '/producto/' + cwId"
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
        <!-- `.stop.prevent`, y las DOS hacen falta — aquí estaba el 404.
             `.stop` corta la subida hasta el <a> del panel, que es lo que se
             quiere: un botón de cerrar no debe pasar por el elemento que abre.
             Pero al cortarla, el `preventDefault` del panel YA NO CORRE, y el
             botón vive dentro del <a>: quien cancela la navegación tiene que ser
             él mismo.

             Y no basta con que en detalle el <a> no tenga `href`. Este clic
             borra el detalle, Vue repinta en el microtask siguiente — antes de
             que el navegador decida qué hacer con el clic — y le devuelve el
             `href` al <a>. Para cuando toca la acción por defecto, el enlace
             existe otra vez y el navegador se iba a /producto/<id>, que no es
             una ruta: 404. `.prevent` lo mata en el sitio. -->
        <button type="button" @click.stop.prevent="emit('back')">
          <ArrowLeft :stroke-width="2" /> Regresar
        </button>
      </GlassSurface>

      <div class="pa__dcol pa__dcol--l">
        <h3 class="pa__dtitle">{{ cw.name }}</h3>
        <p class="pa__dprice">{{ cw.price }}</p>
        <p v-if="cw.blurb" class="pa__dblurb">{{ cw.blurb }}</p>
      </div>

      <div v-if="cw.sizes?.length" class="pa__dcol pa__dcol--r">
        <!-- ETIQUETA, no encabezado. La referencia pone «SELECT SIZE (US)» en
             cuerpo pequeño y espaciado, y ese cambio de rango es el que
             importa: antes esto era un título de 20 px que competía con el
             precio, y lo que dice no es una sección — es la instrucción de lo
             que hay debajo. Pequeña y espaciada se lee como etiqueta y deja el
             peso donde tiene que estar.

             Y el «(US)» no es adorno: una talla 9 significa dos pies distintos
             según la escala, así que la unidad es parte del dato. -->
        <p class="pa__dsizes-t">Selecciona tu talla (US)</p>
        <div class="pa__dsizes" role="group" aria-label="Selecciona tu talla, escala US">
          <GlassSurface
            v-for="t in cw.sizes"
            :key="t"
            :radius="22"
            tag="span"
            class="pa__dsize"
          >
            <!-- `.stop.prevent` por lo mismo que el de volver: dentro del <a>,
                 quien corta la burbuja se queda sin el `preventDefault` de
                 arriba y tiene que cancelar por su cuenta. -->
            <button type="button" :aria-pressed="t === talla" @click.stop.prevent="talla = t">
              <!-- la selección del sistema, la misma que el ítem activo de la
                   barra: sobre el velo negro es LUZ, el mismo vidrio un poco
                   más encendido. -->
              <span v-if="t === talla" class="av-glass-sel" aria-hidden="true" />
              {{ t }}
            </button>
          </GlassSurface>
        </div>

        <GlassSurface :radius="999" tag="div" class="pa__buy">
          <!-- LA BOLSA VA DELANTE, como la flecha de «Regresar» y al revés que
               la de «Ver detalles». No es una inconsistencia: una flecha que
               apunta a donde se va cierra la frase y por eso va detrás; un
               glifo que dice QUÉ es esto —una compra— la abre, y se lee antes
               que el texto. Es además la misma bolsa de la barra, así que el
               carrito se reconoce sin leer. -->
          <button type="button" @click.stop.prevent="emit('buy', { id: cwId, size: talla })">
            <ShoppingBag :stroke-width="2" /> Comprar ahora
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
  /* EL MISMO MARGEN QUE EL ROLLO — `clamp(16px, 4vw, 64px)` allí, y aquí en
     `cqw` porque el acordeón es contenedor de consulta y su ancho es el del
     viewport: los dos dan 57.6 en un monitor de 1440. Estaba en `3cqw` con tope
     34 y la ficha se leía pegada a las orillas al lado del rollo, que es la
     pieza de al lado en la misma página.

     Afecta SÓLO a lo que vive en el detalle —título, precio, descripción,
     tallas y los dos botones—; el plano de color, el zapato y la palabra
     gigante del fondo van a sangre y no lo tocan. */
  --pa-pad-x: clamp(16px, 4cqw, 64px);
  /* Con FALLBACK, y es lo unico que este componente le pide al anfitrion. Una
     custom property que no existe no resuelve, y una declaracion que no resuelve
     se cae al valor inicial: el hueco de la barra pasaba a 0 y el titulo se iba
     debajo de ella. Con el respaldo, la pieza se monta sola en cualquier repo y
     sigue reservando un hueco razonable; donde SI exista el token, manda el del
     anfitrion. 87px = 16 de aire + 55 de barra + 16 de aire, que es lo que vale
     hoy resuelto. */
  --pa-pad-y: var(--av-nav-space, 87px);

  /* EL ALTO DE LA BANDA DE EMPALME. `--pa-pad-y` y no un número suelto: la banda
     tiene que MORIR justo donde empieza el contenido. `.pa__line` se posa a
     `top: var(--pa-pad-y)`, así que con esta medida el degradado llega a cero en
     el píxel en que aparece el primer texto — y ese texto es blanco al 72%, que
     sobre la niebla clara del empalme perdería contraste si le quedara encima
     aunque fuera un 20%. El aire de arriba del panel ya estaba vacío; la banda
     no ocupa nada que no estuviera libre.
     El acordeón la pone a 0 en los paneles que no tocan el borde. */
  --pa-blend-h: var(--pa-pad-y);

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
/* ── el empalme con la pieza de encima ─────────────────────────────────────
   Una banda del color de la sección anterior que se desvanece hacia abajo, para
   que el borde entre las dos piezas no sea una línea. El color lo hereda de
   `--pa-blend`, que escribe el acordeón; sin vecino es `transparent` y aquí no
   se ve nada.

   DÓNDE ESTÁ EN EL ORDEN DE PINTADO es lo único delicado de esta regla, y sale
   gratis: un `::before` va el PRIMERO en orden de árbol, así que se pinta
   encima del fondo del panel —que es un `background`— y DEBAJO de `.pa__body`,
   `.pa__line` y `.pa__text`, que son hermanos posicionados con `z-index: auto`
   y por tanto se pintan en orden de árbol, después. O sea: la niebla tiñe el
   plano de color y no toca ni al zapato, ni a la palabra gigante, ni a una sola
   letra. Ponerle un `z-index` a esto lo rompería.

   SEIS PARADAS Y NO DOS. Un degradado de dos paradas baja la opacidad en línea
   recta, y el ojo no ve la transparencia: ve LUMINOSIDAD. Una rampa lineal deja
   un canto perceptible justo donde acaba —el «banding» del final— porque los
   últimos tramos siguen aportando color a saltos iguales cuando ya casi no
   queda. Las paradas de abajo son una curva de salida (rápido al principio,
   larguísimo al final): a mitad de banda ya sólo queda el 22%, y ese resto se
   arrastra hasta cero sin que se vea dónde termina.

   `color-mix` Y NO `rgb(from var(--pa-blend) r g b / .72)`, que es la forma
   corta y la que pedía el cuerpo. Sin vecino, `--pa-blend` vale `transparent`, y
   `transparent` es negro con alfa cero: la sintaxis relativa le saca sus canales
   —r=0, g=0, b=0— y les pone el alfa de la parada, así que la banda se pintaba
   NEGRA en el caso de «no hay nada que fundir». `color-mix` mezcla el color
   entero, alfa incluido, y mezclar transparente con transparente sigue siendo
   transparente. */
.pa__panel::before {
  content: "";
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: var(--pa-blend-h);
  pointer-events: none;
  background: linear-gradient(to bottom,
    var(--pa-blend)                                    0%,
    color-mix(in srgb, var(--pa-blend) 72%, transparent) 22%,
    color-mix(in srgb, var(--pa-blend) 42%, transparent) 42%,
    color-mix(in srgb, var(--pa-blend) 18%, transparent) 62%,
    color-mix(in srgb, var(--pa-blend)  5%, transparent) 82%,
    transparent                                        100%);
}

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
  /* MAYÚSCULAS, y es la ÚNICA excepción del sistema a la regla de «primera
     mayúscula y el resto minúsculas». Está pedida y es consciente, no un
     descuido, así que conviene dejar escrito por qué se puede aquí y no en
     ningún otro sitio:

     esto no es texto, es TEXTURA. Lleva `aria-hidden`, ningún lector lo
     anuncia, no se puede seleccionar ni buscar, y a 300 px de cuerpo detrás de
     un zapato no se lee como una palabra sino como un plano de fondo. La regla
     existe para que los TÍTULOS y las etiquetas no griten; una marca de agua no
     grita, hace de pared.

     Va por `text-transform` y NO cambiando el dato: `cw.short` sigue siendo
     «Pino» para todo lo demás — el `alt` de la foto, la ficha, lo que venga.
     Aquí sólo cambia cómo se dibuja.

     `useFitText` no se entera y no tiene que enterarse: mide `scrollWidth` con
     el estilo ya aplicado, así que reescala solo con las letras más anchas. */
  text-transform: uppercase;

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

/* EL ZAPATO CEDE UN 10% AL ABRIRSE, y no es por espacio: es por JERARQUÍA. En
   la ficha entran un título y un precio que en el panel cerrado no existían, y
   con el zapato a tamaño completo esos dos textos se leen como pies de foto.
   Bajándolo un escalón, la ficha tiene tres piezas de peso parecido en vez de
   una grande y dos notas.

   `scale` y no un `width` menor: el ancho lo pone `.pa__body`, que es la caja
   que recorta, y tocarlo movería el recorte. `scale` encoge lo PINTADO y deja
   la caja donde está — que además es lo único que puede animarse en la GPU sin
   provocar reflujo en mitad de la apertura del panel.

   Sólo en la ficha. En el acordeón cerrado los cuatro zapatos se comparan entre
   sí y ahí no hay texto que compita: encogerlos allí sería quitar sin dar. */
.pa__panel.is-detail .pa__shot {
  object-position: center;
  transform: scale(.9);
}

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
  /* EL ALTO DEL BOTÓN DE VOLVER, en un token porque lo usan DOS sitios que
     tienen que cuadrar: el propio botón y la fila que le guarda el hueco.

     Y le guarda el hueco aunque el botón ya no esté ahí. El botón se fue abajo
     a la izquierda, y si esta fila pasara a `auto` se quedaría en cero: el
     título subiría 38 px de golpe al abrir la ficha, que es justo lo que no se
     quiere — el título tiene que quedarse donde está. Con la fila escrita, la
     banda de arriba sigue midiendo lo mismo y sólo cambia quién la ocupa: nadie.

     La segunda fila sigue en `1fr`. SIN `align-content: start`: eso hacía que se
     quedara en el alto de su contenido, y entonces el `align-self: end` de la
     columna de tallas no tenía contra qué alinearse — se iba casi mil píxeles
     por debajo del panel. */
  --pa-back-h: var(--av-action-h);
  grid-template-rows: var(--pa-back-h) 1fr;
  gap: clamp(12px, 2cqw, 24px);
  padding: var(--pa-pad-y) var(--pa-pad-x);
  /* el grid no puede comerse el clic del zapato ni tapar nada que no sea suyo */
  pointer-events: none;
}
.pa__detail > * { pointer-events: auto; }

/* REGRESAR: ABAJO A LA IZQUIERDA. La flecha sigue mirando a la izquierda — se
   retrocede en el mismo plano, no se sube a otro sitio.

   Estuvo arriba y bajó a la esquina opuesta a «Comprar ahora», que está abajo a
   la derecha. Las dos salidas de la ficha —volver y comprar— quedan en la misma
   línea del ojo y a la misma altura de la mano, cada una en su extremo: no se
   confunden y no hay que buscarlas en dos sitios distintos de la pantalla.

   Comparte celda con la columna de la izquierda —el título, el precio y la
   descripción— y no se pisan porque tiran a extremos contrarios: aquella va
   pegada arriba (`align-self: start`) y ésta abajo. Aun así, la columna reserva
   por debajo el alto del botón; ver `.pa__dcol--l`. */
.pa__back {
  grid-row: 2;
  grid-column: 1;
  align-self: end;
  justify-self: start;
  /* explícito, para que el botón mida EXACTAMENTE lo que la fila de arriba le
     sigue guardando — ver `--pa-back-h` */
  height: var(--pa-back-h);
}
.pa__back button { height: 100%; padding-block: 0; }
/* PÍLDORAS, y a propósito. Pasaron por la esquina de Apple con el resto de la
   ficha y se devolvieron: el redondeo de superelipse existe para distinguir un
   control que se ELIGE —una talla, que es una casilla de una rejilla— de uno que
   se PULSA. «Regresar» y «Comprar ahora» son acciones, y en esta casa una acción
   es una píldora: las flechas del rollo, los botones de la barra, el «Ver
   detalles» de este mismo panel. La ficha gana en que las dos cosas dejan de
   parecerse.

   El alto vuelve a salir del relleno. Estuvo fijo en 46 mientras llevaron 22 px
   de esquina —por debajo de 44 el navegador los recortaba— y con radio de
   píldora esa restricción desaparece: un 999 se ajusta a cualquier alto. */
/* LOS DOS BOTONES, con los tokens de acción del sistema: mismo alto, mismo
   relleno, mismo cuerpo, mismo glifo y el MISMO ANCHO MÍNIMO. Son las dos
   salidas de la ficha y están a la misma altura de la mano; si uno fuera más
   ancho, el ojo lo leería como el principal.

   Y son los mismos números que los tres botones del rollo, que es la pieza de
   al lado: una acción que cambia de tamaño según en qué componente esté se lee
   como tres acciones distintas. Ver `--av-action-*` en `tokens.css`. */
.pa__back,
.pa__buy { min-width: var(--av-action-w); }
.pa__back button,
.pa__buy button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--av-action-gap);
  width: 100%;
  height: var(--av-action-h);
  border: 0;
  background: none;
  padding: 0 var(--av-action-px);
  font-family: inherit;
  font-size: var(--av-action-fs);
  font-weight: 500;
  letter-spacing: -.005em;
  color: var(--pa-on-surface);
  cursor: pointer;
}
/* Los dos glifos de la ficha miden LO MISMO, 15 px, y esa es toda la regla: son
   las dos salidas del panel y están a la misma altura, así que si uno fuera más
   grande que el otro una de las dos parecería la importante. El tamaño sale del
   cuerpo del texto que llevan al lado (12 px) — un pelo por encima, que es lo
   que hace que un icono de trazo pese igual que una mayúscula. */
.pa__back :deep(svg),
.pa__buy :deep(svg) { width: 15px; height: 15px; }

/* LAS DOS COLUMNAS VAN A LA FILA 2 ESCRITA, no por colocación automática, y eso
   dejó de ser opcional en cuanto el botón de volver se fue abajo.

   Antes el botón ocupaba `grid-column: 1 / -1` en la fila 1 y empujaba a las dos
   columnas a la 2 sin que nadie tuviera que decirlo. Al bajarlo, la fila 1 quedó
   libre y la colocación automática metió ahí lo primero que encontró: el título
   subió 62 px y «Comprar ahora» se fue a la esquina de ARRIBA a la derecha.
   Medido — título en 87 donde tenía que estar en 149.

   Con la fila escrita, la de arriba se queda vacía guardando su hueco, que es
   justo para lo que existe. */
.pa__dcol { display: flex; flex-direction: column; grid-row: 2; align-self: start; }
/* El hueco que se le guarda al botón de volver, que vive en esta misma celda
   pero pegado abajo. Sin él, una descripción larga se le metería por debajo — no
   pasa con el copy de hoy, pero el copy es dato y el dato cambia. */
.pa__dcol--l {
  /* LA COLUMNA TAMBIÉN ESCRITA, por lo mismo que la fila. Con sólo la fila
     fijada, la colocación automática la mandó a la SEGUNDA columna —el botón de
     volver ya ocupaba la primera— y el título se fue al lado derecho, encima de
     las tallas. Aquí no queda ni un hueco a la suerte. */
  grid-column: 1;
  max-width: 34ch;
  padding-bottom: calc(var(--pa-back-h) + clamp(12px, 2cqw, 24px));
}
/* la columna de tallas se va abajo a la derecha, como en la referencia */
.pa__dcol--r { grid-row: 2; grid-column: 2; align-self: end; align-items: flex-end; text-align: right; }

/* TÍTULO Y PRECIO SUBEN UN ESCALÓN — el título de 34 a 46 y el precio de 24 a
   32 en su tope. La referencia los tiene casi al mismo peso que el producto, y
   con los tamaños anteriores la ficha se leía como una etiqueta pegada a una
   foto en vez de como una ficha.

   Los dos se mueven JUNTOS y en la misma proporción (×1.35): el precio no es un
   dato secundario del título, es la otra mitad de la decisión. Si uno sube y el
   otro no, el precio pasa a leerse como una nota al pie. */
.pa__dtitle {
  margin: 0;
  font-size: clamp(26px, 3.5cqw, 46px);
  font-weight: 800;
  letter-spacing: -.02em;
  line-height: 1.05;
  color: var(--pa-on-surface);
}
.pa__dprice {
  margin: 8px 0 0;
  font-size: clamp(20px, 2.6cqw, 32px);
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
  margin: 0 0 10px;
  font-size: 11.5px;
  font-weight: 600;
  /* ESPACIADO POSITIVO, al revés que todo lo demás del sistema. A cuerpo grande
     el interletrado se cierra para que la palabra sea un bloque; a 11.5 px pasa
     lo contrario — las letras se apelmazan y la etiqueta se lee como una mancha.
     Abrirla es lo que la convierte en etiqueta. */
  letter-spacing: .07em;
  /* Al 72%, el «medio iluminado» del sistema: la etiqueta orienta, no informa. */
  color: var(--pa-on-surface-soft);
}
.pa__dsizes {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  /* el ancho no cambia con la altura: siguen siendo cinco de 56 y cuatro huecos */
  /* CINCO por fila, como la referencia: 5×56 + 4×8 = 312. Eran seis, y con diez
     tallas eso dejaba una segunda fila de cuatro — una rejilla coja. Con cinco
     salen dos filas llenas, que es lo que hace que se lea como una tabla y no
     como una lista que se dobló donde cupo. */
  max-width: 312px;
}

/* ══ EL REDONDEO ══════════════════════════════════════════════════════════
   Las tallas dejan de ser píldoras y pasan a esquina de Apple. Lo que sigue es
   lo que hay detrás del número, porque «el redondeo de Apple» es una curva
   concreta y no una sensación:

   Apple tiene DOS estilos de esquina y sólo uno es el de esta pieza.
   `.circular` es un arco de círculo, el `border-radius` de toda la vida.
   `.continuous` —el de los controles del sistema y el de
   `RoundedRectangle(cornerRadius:style:.continuous)`— NO es un arco: es una
   SUPERELIPSE, |x|ⁿ + |y|ⁿ = 1 con n ≈ 4. Esa n es la diferencia: el arco entra
   en la curva de golpe y deja un punto donde la curvatura salta; la superelipse
   la reparte a lo largo del lado y por eso la esquina se ve «continua» en vez
   de pegada.

   Y no hace falta imitarla, porque CSS la tiene: `corner-shape: squircle` está
   definido en la especificación como EXACTAMENTE `superellipse(2)`, y ese 2 es
   el logaritmo en base 2 del exponente — o sea n = 2² = 4. La misma curva.

   (El squircle del icono de app es otra cosa: un trazado bezier ajustado a mano,
   más cerca de n ≈ 5. Aquí no aplica — esto son controles, no iconos.)

   ESTO ES SÓLO DE LAS TALLAS. Los dos botones de acción probaron esta esquina y
   volvieron a píldora: ver `.pa__back` / `.pa__buy`. Que sólo la lleve la talla
   es lo que la hace significar algo — una casilla que se ELIGE no se parece a un
   botón que se PULSA.

   EL RADIO, 22 px — y ESE NÚMERO OBLIGA A UNA ALTURA. Aquí está el detalle que
   no se ve venir: CSS no deja que dos radios de un mismo lado sumen más que el
   lado. Si suman de más, los escala TODOS por el mismo factor, en silencio.

   Con las tallas a 40 px de alto, dos radios de 22 suman 44 contra 40: el
   navegador los bajaba a 20, que es media caja, o sea **una píldora otra vez** —
   justo lo contrario de lo que se pedía. Medido: 22 pedidos, 20 pintados.

   Así que el alto sube a 48: por encima de 44, que es el mínimo para que 22
   quepa entero. De regalo, cruza el objetivo táctil de 44 px que a 40 no
   alcanzaba.

   QUÉ TAN REDONDO QUEDA, en números, porque es lo que hay que mirar para
   ajustarlo: a 48 de alto el máximo posible es 24, así que 22 es el 92% del
   camino a la píldora — muy blando, con 4 px de lado recto. Si algún día se
   quiere una esquina suave pero con rectángulo claro, el número a este alto está
   entre 14 y 16; 22 es el radio «natural» de un control de unos 60-70 px. Se
   toca aquí y en el `:radius` del <GlassSurface> de la talla.

   RESERVA: donde `corner-shape` no exista, queda el `border-radius` de siempre
   y la pieza es un rectángulo redondeado normal. Se degrada a la curva anterior,
   no a una esquina rota — por eso el radio va en el prop y la FORMA en un
   `@supports` aparte, y no las dos cosas juntas.

   CAJA FIJA, y ahí está el detalle que se veía mal: dejadas a su contenido, un
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
  /* 48 y no 40 — ver la nota del radio: por debajo de 44 el navegador recorta
     los 22 px de la esquina y la talla vuelve a ser una píldora. */
  height: 48px;
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

/* LA FORMA, aparte del radio — ver la nota larga de `.pa__dsize`.

   SÓLO LAS TALLAS. «Regresar» y «Comprar ahora» pasaron por aquí y salieron: son
   acciones y vuelven a ser píldoras. La superelipse se queda donde distingue
   algo — la casilla que se elige frente al botón que se pulsa.

   Va también a los DESCENDIENTES porque `corner-shape` no se hereda sola y el
   material apila cuatro capas dentro de cada pieza: el desenfoque, el velo, el
   especular y el cuerpo, todas con `border-radius: inherit`. Si la forma se
   quedara sólo en la raíz, las capas seguirían siendo rectángulos redondeados y
   asomarían por las esquinas.

   El `::after` del especular necesita su propia línea: es el anillo de 1.5 px
   del perímetro y un pseudo-elemento no entra en `:deep(*)`. Sin él, la pieza
   tendría cuerpo de superelipse y filo de arco — que es exactamente el defecto
   que se ve y no se sabe nombrar. */
@supports (corner-shape: squircle) {
  .pa__dsize { corner-shape: squircle; }
  .pa__dsize :deep(*) { corner-shape: inherit; }
  .pa__dsize :deep(.av-glass__spec)::after { corner-shape: inherit; }
}

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
    padding: var(--av-nav-space, 87px) clamp(14px, 4vw, 24px);
  }
  /* EL BOTÓN VUELVE ARRIBA, encima del título. En una columna, la esquina de
     abajo a la izquierda ya no es una esquina: es el final de una lista larga,
     debajo de las tallas y del botón de comprar. Volver quedaría a un scroll de
     distancia de donde se entró, y volver es lo que se hace cuando esto no era
     lo que se buscaba — tiene que estar antes, no después.

     Con él otra vez en la primera fila, la de arriba deja de ser un hueco
     guardado y vuelve a medirlo su contenido. */
  /* En una columna cada bloque vuelve a tener su propia fila, así que se
     deshace el `grid-row: 2` de escritorio y manda otra vez el orden del DOM. */
  .pa__detail { grid-template-rows: auto auto 1fr; }
  .pa__dcol { grid-row: auto; }
  .pa__back { grid-row: 1; align-self: start; height: auto; }
  .pa__back button { padding-block: 10px; }
  .pa__dcol--l { padding-bottom: 0; }

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

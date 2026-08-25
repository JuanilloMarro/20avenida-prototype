<script setup>
/**
 * <ProductAccordion> — cuatro paneles de color, uno por producto.
 *
 * Al señalar uno se expande y los demás se reparten lo que queda. El expandido
 * enseña el producto entero con su ficha; los contraídos, el producto recortado
 * y nada más.
 *
 *   reposo        ┌────┬────┬────┬────┐      25 · 25 · 25 · 25
 *   señalado #2   ┌──┬───────┬──┬──┐         20 · 40 · 20 · 20
 *
 * LA IDEA, y de donde sale todo lo demás: el panel contraído RECORTA el
 * producto; al expandirse no lo escala, lo DESTAPA. Es una ventana que se abre,
 * no una foto que crece. El recorte está en <ProductAccordionPanel>.
 *
 * Los planos son SÓLIDOS, como el showcase: son capa de contenido y ahí no va
 * vidrio. Lo que SÍ es vidrio son los controles que flotan sobre el plano de
 * color — el CTA de cada card, el botón de volver, el de comprar y las tallas —
 * y todos con el material ESTÁNDAR, velo negro y sin variantes, en las dos
 * disposiciones. Están en <ProductAccordionPanel>.
 *
 * Los datos son `colorways.js` tal cual — una entrada ya trae el color del
 * panel, la tinta, el acento, la foto, el nombre y el precio. Añadir un
 * producto es añadir un colorway, no tocar el componente.
 */
import { COLORWAYS, toCss } from '~/assets/js/colorways'

const props = defineProps({
  /** ids de colorways. 3–5; por encima de 5 el contraído deja de reconocerse. */
  items: { type: Array, required: true },
  /** % que ocupa el expandido. El resto se reparte entre los demás. */
  open: { type: Number, default: 40 },
  /** cuál arranca expandido. null = reposo, todos iguales. */
  initial: { type: String, default: null },
  /**
   * Alto de la pieza. A pantalla completa por defecto: la medida de diseño es
   * 1440×1024 y el acordeón se come el viewport entero, igual que el frame del
   * showcase que tiene encima.
   *
   * `svh` y NO `dvh` ni `vh`, y la diferencia sólo se nota en un teléfono de
   * verdad:
   *
   *   `vh`   el viewport con las barras RETRAÍDAS. Con la barra a la vista, lo
   *          de abajo queda debajo de ella — el último panel sale cortado.
   *   `dvh`  el viewport actual, que CAMBIA al scrollear. No corta, pero los
   *          cuatro paneles se redimensionan mientras el dedo se mueve y el
   *          reparto se ve temblar.
   *   `svh`  el viewport con las barras DESPLEGADAS: el más pequeño de los
   *          tres, y por eso el único estable. Nada se corta nunca y nada se
   *          mueve al scrollear. Lo que se paga es un hueco cuando la barra se
   *          retrae, y para una pieza de cuatro paneles es mejor trato.
   *
   * En escritorio los tres valen lo mismo: no hay barras dinámicas.
   */
  height: { type: String, default: '100svh' },
  /**
   * EL EMPALME CON LO QUE HAY ENCIMA. Se le pasa el id del colorway de la
   * sección anterior —hoy el del showcase— y el acordeón difumina ese color
   * sobre el borde de arriba de sus paneles, así que el corte entre las dos
   * piezas deja de ser una línea.
   *
   * Es un ID y no un color a pelo a propósito: el que está arriba es un
   * colorway, y pasar su id deja que sea `colorways.js` quien diga de qué color
   * es. Si mañana el showcase cambia de zapato, el empalme le sigue solo.
   *
   * Vacío por defecto — sin vecino no hay nada que fundir, y la pieza suelta
   * tiene que seguir teniendo su borde limpio.
   */
  blendFrom: { type: String, default: '' },
})

const emit = defineEmits(['select', 'buy'])

/* Los ids que no existen se caen aquí y no revientan el render: un colorway mal
   escrito deja tres paneles, no una página en blanco. */
const paneles = computed(() => props.items.filter(id => COLORWAYS[id]))

const activo = ref(props.initial)
watch(() => props.initial, v => { activo.value = v })

/**
 * El DETALLE. No es otra página: es el mismo acordeón con un panel comiéndose
 * el ancho entero y los otros tres plegados a cero.
 *
 * Se hace así y no navegando porque lo que se mira es lo mismo — el producto —
 * sólo que más de cerca. Una página nueva rompe esa continuidad y obliga a
 * volver a montarlo todo para enseñar una talla.
 */
const detalle = ref(null)

/* El temporizador de la vuelta — ver `volver()`. Se declara aquí, junto al
   estado que gobierna, porque `tocar()` también lo cancela. */
let volviendo = null

/**
 * TOCAR — el doble tap.
 *
 * Con puntero fino el hover ya expandió el panel, así que el usuario ya vio lo
 * que hay: el clic abre el detalle directo. En táctil no hay hover, así que el
 * primer toque EXPANDE y el segundo abre — si no, el primer toque dispararía el
 * detalle sin que se haya llegado a ver lo que se abrió.
 *
 * La consulta se hace al tocar y no al montar: un portátil táctil tiene las dos
 * entradas y lo que manda es con cuál se acaba de tocar.
 */
function tocar(id) {
  const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (fino || activo.value === id) {
    /* Se ESCRIBE el 40% antes de abrir. En escritorio el panel ya estaba a 40
       por el hover, pero eso es CSS puro: si el detalle arranca sin que el
       estado lo diga, el punto de partida de la animación depende de dónde
       esté el ratón en ese instante. Escribiéndolo, el recorrido es siempre el
       mismo — 40 → 100 — y al cerrar vuelve por donde vino. */
    clearTimeout(volviendo)
    activo.value = id
    detalle.value = id
    emit('select', id)
    return
  }
  activo.value = id
}

/* VOLVER — el camino de vuelta, y se hace en dos tiempos a propósito.
 *
 * Primero se suelta el detalle: el panel pasa de 100 a 40 y los otros tres de 0
 * a 20, así que las cuatro opciones REAPARECEN mientras la que se estaba
 * mirando sigue señalada. Es el mismo recorrido de la ida, al revés.
 *
 * Y cuando esa animación termina se suelta también la selección y los cuatro
 * quedan al 25%. Si se soltaran los dos a la vez, el panel iría de 100 a 25 de
 * un tirón y los otros de 0 a 25: se vería un salto, no una vuelta.
 *
 * El temporizador se cancela al abrir: si el usuario vuelve a entrar antes de
 * que termine, la selección no puede borrarse a media apertura. */
function volver() {
  detalle.value = null
  clearTimeout(volviendo)
  volviendo = setTimeout(() => { activo.value = null }, 520)
}

/* `Escape` cierra el detalle. No sustituye al botón — es la salida que un
   teclado espera encontrar, y de paso una segunda vía si el botón queda fuera
   de vista. */
function onKey(e) {
  if (e.key === 'Escape' && detalle.value !== null) volver()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearTimeout(volviendo)
})

/**
 * La geometría, calculada aquí y consumida por CSS.
 *
 * Se hace en JS porque depende de cuántos paneles hay, y CSS no sabe contar
 * hermanos para repartir. Lo que baja son longitudes ya resueltas.
 *
 *   contraído = (100 − abierto) / (n − 1)
 *   reposo    = 100 / n
 */
const geometria = computed(() => {
  const n = Math.max(1, paneles.value.length)
  const shut = n > 1 ? (100 - props.open) / (n - 1) : 100
  return {
    '--pa-h': props.height,
    '--pa-rest': (100 / n).toFixed(4) + '%',
    '--pa-open': props.open + '%',
    '--pa-shut': shut.toFixed(4) + '%',
    /* el ancho FIJO del cuerpo de cada panel: el del expandido. `cqw` lo mide
       contra el acordeón, no contra el viewport, así que da igual que la pieza
       tenga márgenes. */
    '--pa-body': props.open + 'cqw',
    '--pa-body-vw': props.open + 'vw',
    /* El gemelo del anterior para el acordeón tumbado: el ALTO fijo del cuerpo.
       Sale de multiplicar el alto de la pieza, y no de `cqh`, porque `cqh`
       exigiría `container-type: size` — contención en los dos ejes — y aquí
       basta con la del eje en línea. Un `calc()` sobre un valor que ya se
       conoce sale más barato que cambiar el tipo de contenedor. */
    '--pa-body-h': 'calc(' + props.height + ' * ' + (props.open / 100) + ')',
    /* El color del empalme. `transparent` cuando no hay vecino: el degradado se
       sigue pintando, pero de transparente a transparente, o sea nada. Mejor eso
       que una regla condicional — un valor que resuelve siempre no puede dejar
       la declaración a medias. */
    '--pa-blend': COLORWAYS[props.blendFrom]?.surface ?? 'transparent',
  }
})
</script>

<template>
  <section
    class="pa"
    :class="{ 'is-picking': activo !== null, 'is-detail': detalle !== null }"
    :style="geometria"
  >
    <ProductAccordionPanel
      v-for="(id, i) in paneles"
      :key="id"
      :cw-id="id"
      :is-open="id === activo"
      :is-detail="id === detalle"
      :is-collapsed="detalle !== null && id !== detalle"
      :eager="i === 0"
      :style="toCss(id)"
      @pick="tocar"
      @back="volver"
      @buy="emit('buy', $event)"
    />
  </section>
</template>

<style scoped>
.pa {
  /* LA CLAVE: convierte al acordeón en contenedor de consulta, y con eso `cqw`
     dentro de los paneles pasa a medir contra ESTA caja. Sin esto habría que
     usar `vw` y la pieza tendría que ir a sangre. */
  container-type: inline-size;
  display: flex;
  height: var(--pa-h);
  overflow: hidden;
}

/* ── el reparto ────────────────────────────────────────────

   `--pa-w` va REGISTRADA con `@property`. Sin registrar, una custom property es
   texto que se sustituye: el navegador no sabe que «del 25% al 40%» es un
   recorrido y no puede interpolarlo, así que una transición sobre ella no tiene
   nada que animar. Registrada pasa a ser una propiedad CON TIPO
   (`<length-percentage>`), el navegador la interpola, y `flex-basis` se limita
   a seguirla fotograma a fotograma.

   Por eso la transición va sobre `--pa-w` y no sobre `flex-basis`.

   El orden de estas reglas ES la lógica, así que no se pueden reordenar:
   primero se contraen todos, después se expande el señalado. Al tener la misma
   especificidad gana el último — y así cualquier motivo para abrir (tap, foco
   o ratón) le gana a cualquier motivo para cerrar.

   En móvil el acordeón es de FILAS, y `flex-basis` mide el eje principal: la
   misma declaración que reparte anchos en columnas reparte altos en filas. Por
   eso el reparto no se duplica más abajo. */
@property --pa-w {
  syntax: '<length-percentage>';
  inherits: false;
  initial-value: 25%;
}

.pa > * { --pa-w: var(--pa-rest); }

/* hay uno señalado: todos se contraen.

   `:has(:focus-visible)` y NO `:focus-within`, y la diferencia es justo la que
   se veía mal: al hacer clic, el navegador deja el foco puesto en el enlace, y
   `:focus-within` seguía casando después de soltar el ratón — el panel se
   quedaba abierto aunque el cursor ya estuviera lejos. En escritorio el ancho
   lo manda el HOVER y nada más; el clic sólo lleva al producto.

   `:focus-visible` sólo casa cuando el navegador decide que el foco debe
   verse, que en la práctica es navegando con teclado. Así el teclado sigue
   abriendo el panel — sin eso, con `Tab` sólo se vería el panel recortado — y
   el ratón no deja nada pegado. */
.pa.is-picking > *,
.pa:has(:focus-visible) > * { --pa-w: var(--pa-shut); }

/* El hover expande SÓLO donde hay puntero fino. Un portátil táctil cumple
   `hover: hover` pero no `pointer: fine`, y ahí el hover deja el acordeón
   pegado en un panel al salir. */
@media (hover: hover) and (pointer: fine) {
  .pa:hover > * { --pa-w: var(--pa-shut); }
}

/* y el señalado se abre — va después, así gana siempre */
.pa > .is-open,
.pa > *:focus-visible { --pa-w: var(--pa-open); }

@media (hover: hover) and (pointer: fine) {
  .pa > *:hover { --pa-w: var(--pa-open); }
}

/* ── el detalle ────────────────────────────────────────────────
   Uno se lo lleva todo y los otros se pliegan a cero. Va AL FINAL de la cascada
   — después del hover — porque mientras hay un detalle abierto el ratón no debe
   poder alterar nada: pasándolo por encima de un panel plegado, la regla de
   hover intentaría devolverlo al 40%.

   Los plegados no se ocultan con `visibility` ni con `display`: un ancho de cero
   con `overflow: hidden` ya no enseña nada, y quitarlos del pintado sólo
   serviría para que la animación de plegado no se viera. Para sacarlos del
   teclado y de los lectores está `inert`, que es exactamente para eso y no
   toca el pintado. */
.pa.is-detail > *          { --pa-w: 0%; }
.pa.is-detail > .is-detail { --pa-w: 100%; }
.pa.is-detail > *:not(.is-detail) { pointer-events: none; }

/* Fallback para navegadores sin container queries: `cqw` no resuelve y el
   cuerpo se queda sin ancho. Con `vw` funciona, a cambio de que la pieza tenga
   que ir a sangre para que el número cuadre. */
@supports not (container-type: inline-size) {
  .pa { --pa-body: var(--pa-body-vw); }
}

/* ══ teléfono ─ el acordeón se tumba ═══════════════════════════════
   FILAS, no columnas. Cuatro columnas en 390 px son tiras de 97, y ahí un
   zapato no se reconoce: la foto es casi cuadrada, así que lo que la limita es
   el lado corto, y en vertical el lado corto es ridículo. Tumbado, cada fila
   tiene los 390 px enteros de ancho y el zapato pasa a estar limitado por el
   ALTO de su fila — que es mucho más — y encima sobra sitio al lado para la
   ficha.

   El reparto no cambia ni se reescribe: 25 en reposo, 40 el abierto y 20 los
   demás. `flex-basis` mide el eje principal, y al girar el eje las mismas
   declaraciones pasan de repartir ancho a repartir alto. */
@media (max-width: 640px) {
  .pa { flex-direction: column; }

  /* Y EL EMPALME SE QUEDA SÓLO EN EL PRIMERO. En columnas los cuatro paneles
     tocan el borde de arriba de la pieza y los cuatro tienen que fundirse; en
     filas, el único que toca lo que hay encima es el primero. Sin esto, cada
     fila estrenaría su propia niebla clara a media pieza — cuatro cortes
     nuevos en vez del que se venía a quitar.

     Se apaga poniendo el alto de la banda a cero desde el PADRE, que es quien
     sabe cómo está tumbado; el panel sigue sin tener que enterarse de dónde
     está. Gana a la declaración del panel por especificidad y no por orden. */
  .pa > *:not(:first-child) { --pa-blend-h: 0px; }
}
</style>

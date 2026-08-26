<script setup>
/**
 * <ProductReel> — el rollo.
 *
 * Cinco zapatos a la vez, en tres planos de profundidad:
 *
 *              ░░    ░░░░    ██████    ░░░░    ░░
 *            extremo  lado    FOCO      lado  extremo
 *
 *                       Air Jordan 1
 *                    Yellow Ochre · Sail
 *                      [ Ver detalle → ]
 *                        ─ ── ─ ─ ─
 *
 * HUBO UN PRIMER PISO DE MARCAS y se quitó entero. La idea era encadenar dos
 * rollos —marcas → productos— y en la práctica metía dos pantallas donde el
 * usuario sólo quería una: el rollo es un ESCAPARATE, y un escaparate no pide
 * que elijas la marca antes de dejarte mirar. `assets/js/brands.js` se queda
 * con el mapa de marca → productos, que sigue siendo cierto y hará falta en la
 * Tienda; simplemente ya no lo usa esta pieza.
 *
 * QUÉ LO SEPARA DEL ACORDEÓN, que está justo encima en la landing: el acordeón
 * enseña CUATRO productos a la vez y deja comparar; el rollo enseña UNO y lo
 * pone en pedestal. El acordeón es una parrilla que se abre, esto es un
 * escaparate que gira.
 *
 * EL FONDO ES EL DEL ESCENARIO. No se pinta ninguno: la rampa oscura y el grano
 * ya están debajo, y sobre ellos el vidrio de las flechas y del botón tiene algo
 * que refractar. Pintar aquí un plano propio dejaría al material sin trabajo
 * — es lo que documenta `backgrounds.js` sobre el grano.
 *
 * EL GIRO ES CÍCLICO. Con pocos ítems y cinco visibles, un carrusel con topes
 * deja dos estados muertos —principio y final— donde una flecha no hace nada.
 * Girando en redondo no hay estado muerto y el gesto siempre responde. El precio
 * es que no se sabe dónde empieza la lista; para un escaparate eso no importa,
 * para un listado de resultados sí — y por eso el buscador NO gira.
 */
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-vue-next'
import { SNEAKERS, SNEAKER_IDS } from '~/assets/js/sneakers'
import { GRAIN_URL, GRAIN_DEFAULT } from '~/assets/js/backgrounds'
import { useFitText } from '~/composables/useFitText'

const props = defineProps({
  /**
   * Ids de `sneakers.js`, en orden de giro.
   *
   * SEIS, de dos marcas: tres adidas Samba y tres Nike Dunk Low. Alternadas y
   * no agrupadas — agrupadas, el rollo enseña tres Dunk seguidos y parece que
   * la tienda sólo vende eso.
   *
   * FUERON CATORCE. Se cayeron las cinco New Balance y los tres Veja al quitar
   * esas dos marcas del catálogo; el porqué está en `sneakers.js`. Y SEIS ES EL
   * MÍNIMO PRÁCTICO: el rollo enseña cinco a la vez, así que con seis se ve casi
   * todo de una y el giro deja de descubrir nada. Si hay que recortar más, lo
   * que falta es producto.
   *
   * **UN ROLLO, UN ENCUADRE.** Los seis comparten caja unión (1160×550), así
   * que se leen a la misma escala al pasar de uno a otro. Si los assets no
   * comparten caja, el zapato pega un salto de tamaño justo en el momento en
   * que se está mirando — que es el único momento que importa en esta pieza.
   *
   * Y la caja se normalizó por LARGO, no por alto: un 42 mide un 42 lo fabrique
   * quien lo fabrique, mientras que un Dunk es más alto de caña que un Samba.
   * Igualando alturas se perdería justo lo que distingue a un modelo de otro.
   * Ver `scripts/build-sneakers.py`.
   */
  items: {
    type: Array,
    default: () => SNEAKER_IDS,
  },
  /** Cuál arranca en el centro. */
  initial: { type: Number, default: 0 },
  /**
   * El plano de detrás. SÓLIDO y negro fuerte por defecto, el MISMO que el
   * panal: `#050506` es la primera parada de la rampa `negro` de marca, no un
   * negro inventado.
   *
   * Sin degradado a propósito — sobre negro plano, la iluminación del vidrio y
   * la silueta del zapato son lo único que se ve, y es justo lo que tiene que
   * verse. El escenario de la página trae una rampa y aquí se tapa: esta pieza
   * pone su propio suelo.
   *
   * ACEPTA TONOS CLAROS, y no de refilón: la landing le pasa el `surface` del
   * colorway del escaparate para que las dos piezas se lean como una sola —el
   * porqué está en `pages/index.vue`—. Cuando el tono es claro, la tinta de
   * todo lo que va suelto sobre el plano se da la vuelta sola; ver `claro`.
   * Lo que va sobre vidrio no se entera, y tampoco debe.
   *
   * Hexadecimal de 6 cifras. `luminancia()` no sabe leer otra cosa y ante la
   * duda deja la pieza en oscuro — o sea que un `rgb()` aquí no rompe nada,
   * pero tampoco hace lo que se espera.
   */
  bg: { type: String, default: '#050506' },
  /** el grano, 0–100. No es textura: es lo que el vidrio dobla. */
  grain: { type: Number, default: GRAIN_DEFAULT },
})

const emit = defineEmits(['select', 'change', 'buy'])

/**
 * Luminancia relativa de un `#rrggbb`, por el cálculo de la WCAG.
 *
 * Existe por una sola pregunta —¿el plano de detrás es claro?— y aun así es una
 * cuenta y no una lista de colores conocidos: `bg` entra por prop, así que el
 * día que la landing le pase otro tono, o que haya catálogo y cada sección
 * traiga el suyo, esto sigue siendo cierto sin tocarlo. Una lista habría que
 * mantenerla, y se quedaría atrás en silencio.
 *
 * Devuelve 0 si el color no es un hexadecimal de 6 cifras — o sea, se comporta
 * como el negro, que es el defecto de la pieza. Es el fallo correcto: si algún
 * día entra un `rgb()` o un `oklch()` por aquí, el rollo se queda como estaba
 * en vez de darse la vuelta a medias.
 */
function luminancia(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(String(hex).trim())
  if (!m) return 0
  const n = parseInt(m[1], 16)
  /* sRGB → lineal, canal a canal. El 0.03928 y el 2.4 no son ajustables: son
     la curva de la especificación. */
  const lin = c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const r = lin(((n >> 16) & 255) / 255)
  const g = lin(((n >> 8) & 255) / 255)
  const b = lin((n & 255) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * ¿EL PLANO DE DETRÁS ES CLARO? De esto depende la tinta de todo lo que se
 * pinta SUELTO sobre él: el título gigante, el nombre, el subtítulo, el precio
 * y la pista de móvil. Hasta ahora era blanca fija porque el fondo era negro
 * fijo; desde que la landing le pasa el mismo tono que el escaparate de arriba
 * —ver `pages/index.vue`— el fondo puede ser cualquier cosa y la tinta tiene
 * que seguirlo o la pieza se queda ilegible.
 *
 * LO QUE VA SOBRE VIDRIO NO PASA POR AQUÍ y se queda en `--av-on-glass-*`: las
 * flechas, el «Ver detalle», las tallas, «Regresar» y «Comprar». Ese material
 * lleva velo negro PROPIO, así que su contenido está siempre sobre oscuro dé
 * igual lo que tenga debajo — es justo el motivo de tener un material
 * estandarizado, y está escrito en `tokens.css`. Darles la vuelta a la vez que
 * al texto suelto los dejaría negro sobre negro.
 *
 * El corte en 0.5 y no en 0.18 ni en 0.4: es el punto donde el blanco y el
 * negro empatan en contraste sobre el mismo fondo, así que a cada lado gana el
 * que se elige.
 */
const claro = computed(() => luminancia(props.bg) > 0.5)

/**
 * El color del TÍTULO GIGANTE — el que vuela y el que llevan los zapatos de los
 * lados.
 *
 * Sobre plano oscuro es el `word` del colorway: un tono más claro que su propia
 * `surface`, pensado para leerse como una MASA encendida al fondo del encuadre,
 * no como un texto. Sobre plano claro esa misma masa se apaga —un verde medio
 * sobre un verde pálido deja de tener perfil— así que ahí la palabra pasa a la
 * tinta, y lo que le da la profundidad es el desenfoque, que ya estaba.
 *
 * Va por función y no por CSS porque `--rl-word` se escribe INLINE, elemento a
 * elemento: cada zapato del rollo lleva el suyo, así que un valor puesto en
 * `.rl` no llegaría nunca a ganarle.
 */
function tonoTitulo(cw) {
  return claro.value ? 'var(--rl-ink)' : cw?.word
}

const estilo = computed(() => ({
  '--rl-bg': props.bg,
  '--rl-grain': GRAIN_URL,
  '--rl-grain-a': props.grain / 100,
  /* LA TINTA DE LO QUE VA SUELTO SOBRE EL PLANO — ver `claro` justo arriba.

     La rama oscura apunta a los tokens de vidrio y no a `#FFFFFF` escrito a
     mano: es literalmente lo que la pieza renderizaba antes de que esto
     existiera, así que con el `bg` por defecto no cambia ni un píxel. La clara
     va al negro de la casa, el mismo `--av-ink` que usa el papel. */
  '--rl-ink': claro.value ? 'var(--av-ink)' : 'var(--av-on-glass-strong)',
  /* El segundo nivel —subtítulo, descripción, pista—. Sobre oscuro es el 72% de
     la casa; sobre claro, el 62% del negro: el mismo `--av-solid-fg-soft` con
     el que se pinta el texto secundario sobre papel, para que el sitio no tenga
     dos grises de segundo nivel. */
  '--rl-ink-soft': claro.value ? 'var(--av-solid-fg-soft)' : 'var(--av-on-glass)',
  /* El tercer nivel, el de FILO: los puntos apagados del contador. No es texto,
     así que no puede ir al gris del subtítulo —a ese peso una raya de 16×2 se
     lee como encendida— y necesita su propia parada. Mismo par de tokens que el
     resto: el filo sobre vidrio y el filo sobre papel. */
  '--rl-ink-hair': claro.value ? 'var(--av-solid-hair)' : 'var(--av-on-glass-hair)',
  ...(vuelo.value ? {
    '--rl-fly-x': vuelo.value.x + 'px',
    '--rl-fly-y': vuelo.value.y + 'px',
    '--rl-fly-s': vuelo.value.s,
  } : null),
}))

/* El producto completo de cada id, resuelto una vez. Si un id no existe se cae
   fuera en vez de pintar una tarjeta rota.

   SALE DE `sneakers.js` Y NO DE `colorways.js`, y la diferencia es el ENCUADRE:
   los seis de ahí comparten caja unión, que es lo que pide la regla de esta
   pieza — un rollo, un encuadre. `colorways.js` tiene otra caja, la del
   acordeón, así que un producto que saliera en las dos piezas necesitaría un
   recorte por pieza. Hoy no hay ninguno que salga en las dos. */
const productos = computed(() =>
  props.items.map(id => ({ id, ...SNEAKERS[id] })).filter(p => p.name))

const n = computed(() => productos.value.length)
const idx = ref(0)
const actual = computed(() => productos.value[idx.value] || null)

/**
 * La DISTANCIA de cada ítem al centro, por el camino más corto.
 *
 * Sin esto, al pasar del último al primero el ítem cruzaría todo el encuadre de
 * derecha a izquierda en vez de entrar por el lado que le toca. `d` se envuelve
 * a la mitad de la lista: con 5 ítems, el que está a 3 de distancia está en
 * realidad a -2.
 *
 * `>=` y no `>` en el primer tope: con un número PAR de ítems, el que cae justo
 * a la mitad está a la misma distancia por los dos caminos, y sin esto se
 * quedaba siempre en el extremo derecho y el izquierdo vacío.
 */
function distancia(i) {
  const total = n.value
  let d = i - idx.value
  if (d >= total / 2) d -= total
  if (d < -total / 2) d += total
  return d
}

/* CINCO puestos en escritorio —centro, dos vecinos y dos en los extremos— y
   tres en teléfono, donde los de los extremos se apagan por CSS. El resto
   existe en el DOM —para que la foto esté decodificada cuando le toque— pero
   sale del encuadre: `visibility: hidden` lo saca del pintado sin descargarlo. */
function claseDe(i) {
  const d = distancia(i)
  const a = Math.abs(d)
  return {
    'rl__item': true,
    'is-focus': d === 0,
    'is-side': a === 1,
    'is-far': a === 2,
    'is-left': d < 0,
    'is-right': d > 0,
    'is-away': a > 2,
  }
}

/* ── la ficha ──────────────────────────────────────────────────────────────
 * «Ver detalle» NO NAVEGA. Abre la ficha AQUÍ, sobre el mismo zapato, y se
 * vuelve con un botón — que es la misma idea del acordeón, con otro gesto: allí
 * un panel se come a sus tres hermanos; aquí el rollo se queda quieto y lo que
 * se mueve es el TÍTULO, que se va hacia atrás y se desenfoca detrás del zapato.
 *
 * EL ESTADO ES DE ESTA PIEZA y no del anfitrión, al revés que en el acordeón —
 * allí el padre lo necesita para plegar a los hermanos, aquí no hay hermanos que
 * plegar. `select` se sigue emitiendo al abrir, por si la página quiere
 * enterarse, pero no hace falta que haga nada con ello.
 *
 * MIENTRAS LA FICHA ESTÁ ABIERTA, EL ROLLO NO GIRA. Ni flechas, ni teclas, ni
 * arrastre: la ficha habla de UN producto, y cambiarlo por debajo dejaría el
 * precio de uno con el zapato de otro. Escape cierra, que es lo que se espera
 * de algo que se abrió encima. */
const ficha = ref(false)

/* LA TALLA ELEGIDA VIVE AQUÍ y se va al cerrar, igual que en el acordeón: es del
   producto que se está mirando. Si el rollo se cerrara conservándola, al abrir
   otro zapato aparecería preseleccionada una talla que nadie eligió para él —
   y esa es de las que llegan hasta el carrito sin que nadie se entere.
   Cuando haya carrito de verdad, esto sube. */
const talla = ref(null)
watch(ficha, abierta => { if (!abierta) talla.value = null })

function abrir() {
  if (!actual.value) return
  ficha.value = true
  emit('select', actual.value.id)
}
function cerrar() { ficha.value = false }

function ir(paso) {
  if (!n.value || ficha.value) return
  idx.value = (idx.value + paso + n.value) % n.value
  emit('change', actual.value?.id)
}

/* Tocar un ítem del lado lo trae al centro. Es lo que el usuario espera de algo
   que ve a medias, y ahorra tener que buscar la flecha. En el centro, el toque
   hace lo que dice el botón: abrir la ficha. */
function traer(i) {
  if (ficha.value) return
  const d = distancia(i)
  if (d !== 0) { ir(d); return }
  abrir()
}

/* ══ EL VUELO DEL TÍTULO ═══════════════════════════════════════════════════
 *
 * HAY UN SOLO TÍTULO VISIBLE y es el grande. El `<h2>` del pie —el que se lee
 * en el escaparate— está ahí en flujo pero con la tinta apagada: no se ve, sólo
 * GUARDA EL SITIO. Encima de él, calcado, va `.rl__title`, que es el que se ve
 * siempre y el que viaja al fondo al abrir la ficha.
 *
 * POR QUÉ AL REVÉS Y NO EL <h2> DIRECTAMENTE, que era lo natural: el nombre vive
 * dentro de `.rl__deck`, que tiene `z-index: 4`. Un descendiente NO PUEDE salirse
 * del contexto de apilado de su antepasado, así que desde ahí el título jamás
 * podría pasar por detrás del zapato —`z-index: 3` dentro del escenario— hiciera
 * lo que hiciera con su propio z-index. Moverlo de sitio en el DOM a mitad de
 * gesto cancela la transición. Así que el que viaja tiene que NACER en el
 * escenario, y el del pie se queda de ranura.
 *
 * Y ASÍ NO HAY FUNDIDO ENTRE DOS TEXTOS: antes eran dos —el pequeño se apagaba
 * mientras el grande se encendía— y por muy bien que cuadre, eso es un
 * fundido, no un viaje. Ahora sólo hay uno y lo único que cambia es dónde está.
 *
 * LA MEDIDA. El título se dibuja a tamaño GRANDE siempre y en reposo se encoge
 * y se desplaza hasta calzar exactamente sobre la ranura. Los tres números
 * —desplazamiento en x, en y, y escala— salen de comparar las dos cajas, no de
 * un ajuste a ojo: la escala es el ancho de la ranura entre el ancho sin
 * transformar del título, y el desplazamiento, la distancia entre sus centros.
 *
 * TODO SE MIDE EN CAJAS DE DISPOSICIÓN —`offsetLeft`/`offsetTop`/`offsetWidth`—
 * y NUNCA con `getBoundingClientRect()`. Las dos razones son distintas y las dos
 * costaron:
 *
 *   · el título ya está transformado, así que el rect devolvería su ancho ya
 *     encogido y la escala saldría siempre 1;
 *   · la ranura vive dentro de `.rl__card`, que ENTRA CON UNA ANIMACIÓN —
 *     `rl-in`, que la desplaza 9 px. La primera medida cae justo mientras esa
 *     animación corre, así que el rect devolvía la posición animada y el calco
 *     quedaba 9 px por debajo de su sitio. Medido: ranura en 666 contra título
 *     en 675.
 *
 * Los offsets son geometría de DISPOSICIÓN: ni las transformaciones ni las
 * animaciones los tocan, y tampoco el scroll. Es la misma medida antes, durante
 * y después de que la tarjeta entre.
 *
 * Para que el calco sea exacto, el título copia del `<h2>` el peso y el
 * interletrado. El interletrado va en `em`, así que escala solo — si fuera en
 * píxeles, el calco se rompería en cuanto cambiara el tamaño.
 *
 * HASTA QUE HAY MEDIDA, MANDA EL <h2>: la clase `is-volando` no está, el nombre
 * se ve y el título no. Es lo que pinta el servidor y lo que queda si el JS no
 * llega. Al hidratar se cambian los papeles en el mismo fotograma y con las dos
 * cajas ya calzadas, así que no se ve el relevo.
 */
const seccion = ref(null)
const escenario = ref(null)
const tituloEl = ref(null)
/* Las dos copias del nombre — teléfono y escritorio. Sólo una está en pantalla;
   cuál, lo dice una media query, así que no se puede saber desde aquí: se
   preguntan las dos y gana la que tenga caja. */
const ranuraArriba = ref(null)
const ranuraAbajo = ref(null)
const vuelo = ref(null)
/* EL CALZADO NO SE ANIMA, y esto era un fallo de verdad: al escribirse los
   `--rl-fly-*` por primera vez, el título ya tenía transición puesta, así que la
   colocación inicial se veía como un deslizamiento del centro de la pantalla
   hasta el pie nada más cargar. Lo mismo en cada `resize`, que además cambia la
   ranura al cruzar la media query.

   La transición vive en `.is-calzado` y esa clase llega DESPUÉS de que el
   navegador ya haya calculado la posición nueva — ver el final de
   `medirVuelo()`. Colocar es instantáneo; sólo viaja el gesto de la ficha. */
const calzado = ref(false)
let ro = null

function ranuraVisible() {
  for (const el of [ranuraAbajo.value, ranuraArriba.value]) {
    if (el && el.offsetParent !== null && el.offsetWidth) return el
  }
  return null
}

/* La caja de un elemento en coordenadas de la SECCIÓN, subiendo por la cadena
   de `offsetParent`. Da igual que uno esté en flujo y el otro en absoluto: los
   dos acaban expresados contra el mismo origen, así que la resta es válida. */
function cajaEnSeccion(el) {
  let x = 0, y = 0, nodo = el
  while (nodo && nodo !== seccion.value) {
    x += nodo.offsetLeft
    y += nodo.offsetTop
    nodo = nodo.offsetParent
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

/* EL TÍTULO SE MIDE PARA LLENAR EL ANCHO, no se fija en `vw`.

   Con un `font-size` en `vw` el margen a los lados depende de cuántas letras
   tenga el nombre: «AIR JORDAN 1» llenaba el 74% del encuadre y «SAMBA OG»
   habría llenado la mitad. Midiendo y reescalando, todos llegan al mismo sitio
   — el borde del contenido, o sea con el margen de la sección respetado.

   La caja que se mide es el ESCENARIO y no la sección: el escenario va
   `align-self: stretch` dentro del relleno, así que su ancho ES el ancho de
   contenido. Usar la sección daría el ancho con relleno incluido y el título se
   saldría por los lados.

   Es la misma pieza que el texto gigante del showcase; ver `useFitText`. */
const { fit: ajustarTitulo } = useFitText(tituloEl, escenario, 1)

async function medirVuelo() {
  const slot = ranuraVisible()
  const t = tituloEl.value
  const st = escenario.value
  if (!slot || !t || !st || !t.offsetWidth) {
    vuelo.value = null
    calzado.value = false
    return
  }

  /* EL AJUSTE VA ANTES DE MEDIR, y el orden no es negociable: la escala del
     vuelo es `ancho de la ranura / ancho del título`, así que si el título
     cambia de cuerpo después, la escala queda calculada contra un ancho que ya
     no existe y el calco no cuadra. `useFitText` también se reajusta solo con
     su `ResizeObserver`, pero ahí el orden respecto a esta función no está
     garantizado; llamándolo aquí, sí. */
  ajustarTitulo()

  const a = cajaEnSeccion(slot)
  const b = cajaEnSeccion(st)

  /* Los dos cambios salen JUNTOS en el mismo repintado: se quita la transición
     y se escribe la posición nueva a la vez, así que la posición no tiene desde
     dónde animarse.

     El desplazamiento es entre CENTROS, no entre esquinas: el título se centra
     sobre el escenario con `translate(-50%, -50%)` y se escala desde su propio
     centro, así que su centro es el único punto que no se mueve con la escala.
     Con esquinas, el calco sólo cuadraría a escala 1. */
  calzado.value = false
  vuelo.value = {
    x: Math.round(a.x + a.w / 2 - (b.x + b.w / 2)),
    y: Math.round(a.y + a.h / 2 - (b.y + b.h / 2)),
    s: +(a.w / t.offsetWidth).toFixed(4),
  }

  await nextTick()
  /* Y AQUÍ EL PASO QUE PARECE INÚTIL Y NO LO ES: leer una medida obliga al
     navegador a recalcular estilo y disposición AHORA, con la transformación
     nueva ya puesta. Sin esta lectura, el navegador puede juntar este repintado
     con el siguiente —el que devuelve la transición— y entonces sí vería un
     cambio de valor con transición activa: el título volvería a deslizarse.
     No depende de fotogramas: `offsetWidth` es síncrono. */
  void tituloEl.value?.offsetWidth
  calzado.value = true
}

/* ── el gesto ──────────────────────────────────────────────────────────────
   Arrastre horizontal para teléfono. Se decide en `pointerup` y no durante el
   movimiento: un carrusel que sigue al dedo píxel a píxel pediría interpolar
   las transformaciones a mano, y aquí el salto entre posiciones ya está animado
   por CSS. Un umbral de 40 px separa el arrastre del toque. */
const desdeX = ref(null)

function abajo(e) { if (!ficha.value) desdeX.value = e.clientX }
function arriba(e) {
  if (desdeX.value === null) return
  const dx = e.clientX - desdeX.value
  desdeX.value = null
  if (Math.abs(dx) > 40) ir(dx < 0 ? 1 : -1)
}

function tecla(e) {
  if (e.key === 'Escape' && ficha.value) { cerrar(); e.preventDefault(); return }
  if (ficha.value) return
  if (e.key === 'ArrowLeft') { ir(-1); e.preventDefault() }
  if (e.key === 'ArrowRight') { ir(1); e.preventDefault() }
}

onMounted(() => {
  idx.value = Math.min(Math.max(0, props.initial), Math.max(0, n.value - 1))

  /* Tres momentos en los que la medida cambia, y ninguno es opcional:

     · al montar, en cuanto el DOM está pintado;
     · cuando cambian las tipografías. Una web font que llega tarde reescribe el
       ancho del nombre, y con él la escala. `document.fonts.ready` es la señal
       exacta; sin ella el calco se quedaba con la medida de la letra de
       reserva y el título aparecía un pelo corrido;
     · al cambiar de tamaño la sección — no sólo porque los `clamp` se muevan,
       sino porque la media query cambia CUÁL de las dos ranuras está en
       pantalla, y esa es la más importante de las tres.

     LO ÚLTIMO VA POR PARTIDA DOBLE — evento y observador — y conviene decir por
     qué NO, para no repetir el razonamiento equivocado: no es que `resize` sea
     poco fiable. Lo parecía, porque en pruebas el título se quedaba calzado con
     los números de escritorio en una ventana de teléfono; medido, la causa era
     otra y ya está documentada en `useGlassLens`: con la pestaña sin componer
     fotogramas NO entrega ninguno de los dos — un `ResizeObserver` nuevo sobre
     esta misma sección recibió cero avisos con el viewport cambiando de 375 a
     1440. En un navegador a la vista, `resize` solo habría bastado.

     El observador se queda igualmente, por lo mismo que la lente lleva cuatro:
     `resize` sólo se entera de la VENTANA, y esta pieza depende del tamaño de
     su propia caja. El día que viva dentro de algo que cambie de ancho sin que
     cambie la ventana, el evento no se entera y el observador sí. Y un título
     mal calzado no falla en silencio: se ve.

     No se pisan: la guarda de `medirVuelo` recalcula lo mismo, y como el título
     va en absoluto, medirlo no cambia el tamaño de nada — no hay bucle. */
  nextTick(medirVuelo)
  document.fonts?.ready.then(medirVuelo)
  window.addEventListener('resize', medirVuelo)
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(medirVuelo)
    if (seccion.value) ro.observe(seccion.value)
    /* Y AL PROPIO TÍTULO, que es lo que faltaba y se pilló midiendo.

       `useFitText` trae su observador y reescribe el cuerpo del título por su
       cuenta. Si ese reajuste llega DESPUÉS del último `medirVuelo`, la escala
       del calco —`ancho de la ranura / ancho del título`— se queda calculada
       contra un ancho que ya no existe, y el título deja de calzar sobre su
       ranura. Visto: cuerpo en 7.53 px y el título pintado a 82 donde la ranura
       medía 460.

       Observando el título, cualquier reajuste suyo vuelve a disparar la
       medida. No hay bucle: `medirVuelo` llama a `ajustarTitulo()`, que es
       idempotente —comprobado, dos pasadas seguidas dan el mismo cuerpo—, así
       que la segunda vuelta no cambia el tamaño y el observador no vuelve a
       emitir. */
    if (tituloEl.value) ro.observe(tituloEl.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', medirVuelo)
  ro?.disconnect()
})

/* Y al girar: el nombre del producto siguiente puede ser más largo, y la
   tarjeta se remonta por `:key` — o sea que las refs de las ranuras son otras.
   `nextTick` espera a que existan. */
watch(idx, () => nextTick(medirVuelo))
</script>

<template>
  <section
    v-if="productos.length"
    ref="seccion"
    class="rl"
    :class="{ 'is-ficha': ficha, 'is-volando': !!vuelo, 'is-calzado': calzado }"
    :style="estilo"
    role="group"
    aria-roledescription="carrusel"
    aria-label="Destacados"
    tabindex="0"
    @keydown="tecla"
    @pointerdown="abajo"
    @pointerup="arriba"
    @pointercancel="desdeX = null"
  >
    <!-- ── el nombre, SÓLO TELÉFONO ────────────────────────────────────────
         Va encima del zapato en pantalla estrecha y debajo en ancha, y no es
         capricho: en 375 px de ancho el zapato ocupa casi todo y el nombre
         arriba es lo primero que se lee; en escritorio el zapato es la pieza
         grande y el nombre trabaja mejor de pie de foto, junto al botón.

         Marcado duplicado con una copia en `display: none`, que es el patrón de
         la casa — la misma decisión que la barra de navegación.

         Lleva el `aria-live` porque es donde cambia el texto al girar. La copia
         de abajo NO lo lleva: dos regiones vivas anunciarían lo mismo dos
         veces. -->
    <div class="rl__head" aria-live="polite">
      <div :key="actual?.id" class="rl__card">
        <h2 ref="ranuraArriba" class="rl__name">{{ actual?.name }}</h2>
        <p class="rl__line">{{ actual?.line }}</p>
        <!-- EL PRECIO SE PINTA SIEMPRE y sólo se enciende en la ficha. Montarlo
             con `v-if` cambiaría el alto de la tarjeta justo mientras el título
             está volando hacia atrás, y el zapato daría un salto en medio del
             gesto. Ocupando su sitio desde el principio, lo único que se mueve
             es lo que tiene que moverse. -->
        <p class="rl__price">{{ actual?.price }}</p>
      </div>
    </div>

    <!-- ── el escenario ────────────────────────────────────────────────── -->
    <div ref="escenario" class="rl__stage">
      <!-- EL TÍTULO. Uno solo, y es éste: el `<h2>` del pie está en flujo pero
           con la tinta apagada y sólo le guarda el sitio. Ver la nota larga del
           bloque `EL VUELO DEL TÍTULO` en el script — ahí está por qué tiene que
           nacer aquí, dentro del escenario, y no en el pie.

           En reposo se encoge y se desplaza hasta calzar sobre esa ranura; al
           abrir la ficha vuelve a su sitio —centro del escenario, tamaño
           entero— y se desenfoca detrás del zapato. No hay dos textos
           fundiéndose: hay uno que se mueve.

           El desenfoque es lo que lo manda al fondo. Sin él, una palabra
           gigante detrás del zapato compite con la ficha; con él es profundidad
           de campo, y el ojo se queda donde tiene que quedarse.

           NO es `v-if`: vive siempre en el DOM y lo que cambia es una clase.
           Así el camino de vuelta es el de ida al revés. Un `<Transition>`
           también lo haría, pero encadena sus fases con `requestAnimationFrame`
           y en una pestaña de fondo se queda a medias; una transición CSS sobre
           una clase no tiene fases que dejar colgadas.

           `aria-hidden` porque el texto ya lo anuncia el `<h2>` de la ranura,
           que sigue en el árbol de accesibilidad — `opacity: 0` no lo saca, a
           diferencia de `visibility: hidden`. -->
      <p
        ref="tituloEl"
        class="rl__title"
        :style="{ '--rl-word': tonoTitulo(actual) }"
        aria-hidden="true"
      >{{ actual?.name }}</p>
      <button
        v-for="(p, i) in productos"
        :key="p.id"
        type="button"
        :class="claseDe(i)"
        :style="{ '--rl-word': tonoTitulo(p) }"
        :tabindex="distancia(i) === 0 ? 0 : -1"
        :aria-hidden="Math.abs(distancia(i)) > 1"
        :aria-label="distancia(i) === 0 ? `Ver detalle de ${p.name}` : `Traer al centro ${p.name}`"
        @click="traer(i)"
      >
        <img
          :src="p.frames?.[0]?.src"
          :alt="`${p.name} — ${p.line}`"
          :fetchpriority="i === 0 ? 'high' : 'auto'"
          decoding="async"
        >
      </button>
    </div>

    <!-- ── las flechas ─────────────────────────────────────────────────────
         Vidrio, como los botones de la barra: son la capa que flota sobre el
         escenario, que es exactamente para lo que existe el material. -->
    <GlassSurface :radius="999" class="rl__arrow rl__arrow--prev">
      <button type="button" aria-label="Anterior" @click="ir(-1)">
        <span class="av-glyph"><ChevronLeft :stroke-width="1.8" /></span>
      </button>
    </GlassSurface>

    <GlassSurface :radius="999" class="rl__arrow rl__arrow--next">
      <button type="button" aria-label="Siguiente" @click="ir(1)">
        <span class="av-glyph"><ChevronRight :stroke-width="1.8" /></span>
      </button>
    </GlassSurface>

    <!-- ── el pie ──────────────────────────────────────────────────────────
         El nombre otra vez —copia de escritorio— y el botón. -->
    <div class="rl__deck">
      <div class="rl__foot">
        <div :key="actual?.id" class="rl__card">
          <h2 ref="ranuraAbajo" class="rl__name">{{ actual?.name }}</h2>
          <p class="rl__line">{{ actual?.line }}</p>
          <!-- ver la nota de la copia de teléfono -->
          <p class="rl__price">{{ actual?.price }}</p>
        </div>
      </div>

      <!-- LA PISTA DEL GESTO, sólo en teléfono. Al quitar las flechas no queda
           nada que diga que el rollo gira, y un carrusel sin mando visible es
           un carrusel que nadie descubre. Es una línea sutil, no una
           instrucción: se lee si hace falta y se ignora si no. -->
      <p class="rl__pista">Desliza para ver más</p>

      <!-- La acción. Es de VIDRIO y no sólida, y aquí sí se puede: la regla dice
           que la acción principal no puede ser de vidrio porque su contraste no
           debe depender de la foto que pase detrás — pero detrás de esto no hay
           foto, hay la rampa oscura del escenario, que es un fondo conocido.

           La de verdad —«Añadir a la bolsa»— vive en la ficha de producto y ésa
           sí va sólida. Ésta sólo lleva a mirar. -->
      <GlassSurface :radius="999" class="rl__cta">
        <button type="button" :tabindex="ficha ? -1 : 0" @click="abrir">
          Ver detalle
          <ArrowRight :stroke-width="1.8" />
        </button>
      </GlassSurface>

      <!-- dónde estás dentro del rollo -->
      <ol class="rl__ticks" aria-hidden="true">
        <li v-for="(p, i) in productos" :key="p.id" :class="{ 'is-on': i === idx }" />
      </ol>
    </div>

    <!-- ── LA FICHA: TALLAS Y COMPRAR ───────────────────────────────────
         EN LA ESQUINA DE ABAJO A LA DERECHA, y el sitio es la mitad del
         encargo. Debajo del zapato ya hay una columna —subtítulo y precio— y
         apilar ahí las diez tallas y un botón habría empujado al zapato hacia
         arriba y convertido el escaparate en un formulario. Pero al abrir la
         ficha se apagan las flechas y se van los dos zapatos de los lados: ese
         tercio derecho queda VACÍO. Ocuparlo no quita nada a nadie.

         Así queda repartido, y cada cosa en una esquina distinta: regresar
         arriba a la izquierda, el título al fondo, el zapato en el centro, el
         nombre y el precio debajo, y la decisión —talla y compra— abajo a la
         derecha. Es el mismo reparto por esquinas del acordeón, que es lo que
         hace que las dos fichas del sitio se lean como la misma pieza.

         SIN ETIQUETA VISIBLE, que era lo pedido: sólo los botones. El grupo
         lleva `aria-label` porque una fila de números sueltos sí necesita
         decir qué es a quien no la ve.

         Montado siempre y apagado en reposo, como el resto del gesto: así se va
         animándose al cerrar en vez de desaparecer de golpe. -->
    <!-- ══ LA FICHA ═══════════════════════════════════════════════════════
         DOS COLUMNAS, 65 / 35.

         Izquierda: el nombre y, debajo, el zapato dentro de un panel. Derecha:
         precio, descripcion, tallas y las dos salidas.

         EL FONDO LO HACE EL ZAPATO, no el titulo. Antes el nombre viajaba hasta
         el centro y se desenfocaba detras; ahora el que se va al fondo es el
         propio zapato —crece y se difumina— y el nombre se queda donde se lee.
         Es la misma idea de profundidad con la pieza correcta: lo que se mira
         en una ficha de producto es el producto, y lo que puede permitirse
         estar fuera de foco es su copia grande.

         Montada siempre y apagada en reposo, como el resto del gesto: asi se va
         animando al cerrar en vez de desaparecer de golpe. -->
    <div class="rl__ficha">
      <!-- ── columna izquierda ─────────────────────────────────────────── -->
      <div class="rl__fcol rl__fcol--l">
        <h2 class="rl__ftitle">{{ actual?.name }}</h2>

        <!-- EL PANEL. Vidrio `light` —velo blanco— y no un relleno solido: es la
             unica pieza clara del sitio y aun asi sigue siendo el material de la
             casa, no un rectangulo pintado. Dentro no hay texto, asi que el velo
             claro no le quita contraste a nada.

             La sombra va DEBAJO y muy abierta: es lo que lo despega del zapato
             difuminado que tiene detras. Sin ella el panel y el fondo se leen
             en el mismo plano. -->
        <GlassSurface variant="light" class="rl__panel">
          <img
            :src="actual?.frames?.[0]?.src"
            :alt="`${actual?.name} — ${actual?.line}`"
            decoding="async"
          >
        </GlassSurface>
      </div>

      <!-- ── columna derecha ───────────────────────────────────────────── -->
      <div class="rl__fcol rl__fcol--r">
        <p class="rl__fprice">{{ actual?.price }}</p>
        <p v-if="actual?.blurb" class="rl__fblurb">{{ actual.blurb }}</p>

        <!-- SIN ETIQUETA VISIBLE. El grupo lleva `aria-label` porque una fila de
             numeros sueltos si necesita decir que es a quien no la ve. -->
        <div
          v-if="actual?.sizes?.length"
          class="rl__tallas"
          role="group"
          aria-label="Selecciona tu talla, escala US"
        >
          <!-- Mismo tamano y misma esquina que las tallas del acordeon — 48 px
               de alto y 22 de superelipse. Una talla es la misma casilla en las
               dos fichas; si cada una tuviera su forma, el sistema tendria dos
               maneras de decir lo mismo. -->
          <GlassSurface
            v-for="t in actual.sizes"
            :key="t"
            :radius="22"
            tag="span"
            class="rl__talla"
          >
            <button
              type="button"
              :tabindex="ficha ? 0 : -1"
              :aria-pressed="t === talla"
              @click="talla = t"
            >
              <span v-if="t === talla" class="av-glass-sel" aria-hidden="true" />
              {{ t }}
            </button>
          </GlassSurface>
        </div>

        <!-- LAS DOS SALIDAS, en una fila y en los extremos: volver a la
             izquierda y comprar a la derecha. Mismas medidas que todas las
             acciones del sitio — ver `--av-action-*`. -->
        <div class="rl__facciones">
          <GlassSurface :radius="999" class="rl__back">
            <button type="button" :tabindex="ficha ? 0 : -1" @click="cerrar">
              <ArrowLeft :stroke-width="1.8" />
              Regresar
            </button>
          </GlassSurface>

          <GlassSurface :radius="999" class="rl__comprar">
            <button
              type="button"
              :tabindex="ficha ? 0 : -1"
              @click="emit('buy', { id: actual?.id, size: talla })"
            >
              <ShoppingBag :stroke-width="1.8" /> Comprar ahora
            </button>
          </GlassSurface>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* TODO lo de dentro va centrado en el eje horizontal, y por eso `align-items`
   está aquí arriba y no repetido pieza a pieza: el nombre, el botón y el
   contador son una sola columna centrada. El escenario es la excepción y se
   estira (`align-self: stretch`) porque sus zapatos se colocan por
   transformación desde el centro, no por el flujo. */
.rl {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  /* el `tabindex` lo hace enfocable para el teclado, pero no queremos el anillo
     del navegador sobre una sección entera */
  outline: none;
  /* el arrastre horizontal es nuestro; el vertical sigue siendo de la página */
  touch-action: pan-y;

  /* NEGRO PLANO, el mismo del panal. Tapa la rampa del escenario a propósito:
     sobre negro liso lo único que se ve es la silueta del zapato y el filo del
     vidrio, que es lo que tiene que verse. */
  background-color: var(--rl-bg);

  /* EL MISMO ALTO QUE EL ACORDEÓN, literalmente: `100svh`. Las dos piezas se
     comen el viewport entero y tienen que medir lo mismo o la página deja de
     avanzar de pantalla en pantalla — verificado sobre la página real.

     `svh` y no `dvh` ni `vh`: el razonamiento largo está en
     `ProductAccordion.vue` y es el mismo. Se probó con `lvh` para tapar el hueco
     que `svh` deja cuando la barra del navegador se retrae, y se descartó —
     rompía la igualdad con el acordeón, que es lo que importa. */
  height: 100svh;

  /* Arriba, lo que la barra fija del ecommerce ocupa sin estar en el flujo.
     Abajo, `--rl-suelo`: los 70 px donde se posa la barra del NAVEGADOR en
     teléfono. Nada que haya que leer o tocar entra en esas dos franjas. */
  --rl-suelo: 70px;
  padding:
    var(--av-nav-space, 87px)
    var(--av-gutter)
    calc(var(--rl-suelo) + env(safe-area-inset-bottom, 0px));

  /* ── los tres planos, en tokens ────────────────────────────────────────
     Salen a variable porque son SENSACIÓN y se ajustan mirando: el desenfoque
     y cuánto encogen es lo único que decide si la pieza se lee como
     profundidad o como cinco fotos de distinto tamaño. */
  --rl-side-scale: 0.52;
  --rl-side-blur:  10px;
  --rl-side-fade:  0.42;
  --rl-far-scale:  0.30;
  --rl-far-blur:   17px;
  --rl-far-fade:   0.20;
  --rl-tilt:      -16deg;
  --rl-tilt-side: -26deg;

  /* ── LA FICHA ──────────────────────────────────────────────────────────
     Un solo tiempo para todo el gesto, porque es UN gesto: el título que se va
     hacia atrás, los vecinos que se apagan y la ficha que se enciende tienen
     que leerse como una sola cosa moviéndose, no como tres cosas que empiezan
     a la vez por casualidad. Si se toca, se toca aquí.

     .58s es el mismo tiempo que ya usa el giro del rollo — la pieza no tiene
     dos velocidades. Y la curva, la de la casa: entra rápido y se posa.

     El tiempo va SUELTO además de dentro de la abreviatura porque hay una
     propiedad que lo necesita a pelo: la `visibility` del botón de volver, que
     no interpola y se conmuta con un retardo del largo exacto del gesto. Con el
     número escrito dos veces, el día que se toque uno el botón desaparecería a
     destiempo. */
  --rl-flow-t:    .58s;
  --rl-flow:      var(--rl-flow-t) cubic-bezier(.22, 1, .36, 1);
  /* CUÁNTO SE DESENFOCA EL TÍTULO AL FONDO. 7 px sobre una letra de 173 la deja
     legible como forma y perfectamente ilegible como texto, que es lo que se
     quiere: profundidad de campo, no un texto borroso que invite a forzar la
     vista. Por debajo de 4 compite con el precio; por encima de 10 deja de
     leerse como una palabra y pasa a ser una mancha de color. */
  --rl-title-blur: 7px;

  /* EL CALCO, hasta que el JS mida — ver `medirVuelo()`. No son valores «por si
     acaso»: son lo que pinta el SERVIDOR, y con ellos el título arranca fuera
     de sitio. Por eso hasta que hay medida el título está apagado y quien se ve
     es el `<h2>`; estos tres sólo evitan que la declaración sea inválida. */
  --rl-fly-x: 0px;
  --rl-fly-y: 0px;
  --rl-fly-s: 1;

  /* ── LAS CINCO COLUMNAS ────────────────────────────────────────────────
       │ extremo │  opción  │   FOCO   │  opción  │ extremo │
       0        20        40        60        80       100vw

     `--rl-side-shift` es UNA columna hacia fuera, no un número a ojo. Antes era
     `33%`, y ese porcentaje se resolvía contra el ancho del propio zapato —125
     px en un monitor de 1440—, así que los tres se amontonaban en el tercio
     central y las dos quintas partes de los extremos quedaban vacías.

     `translateX` va el primero de la cadena, así que el desplazamiento se aplica
     en el espacio del padre y NO lo encoge el `scale` que viene detrás. Por eso
     puede ir en `vw` y significa lo que dice.

     LOS EXTREMOS NO VAN A DOS COLUMNAS SINO A 1.55, y esa es la diferencia
     entre una fila plana y un ROLLO: un carrete redondo visto de frente tiene a
     los de fuera girando hacia el fondo, así que su separación aparente se
     ENCOGE conforme se alejan del centro. Es la proyección de un cilindro,
     `sin θ`: con pasos de 40° sale 0 · 0.64 · 0.99, o sea que el segundo salto
     es la mitad del primero. Medido en tinta a 1425 de ancho: 105 px entre foco
     y vecino, 74 entre vecino y extremo. */
  --rl-col:        20vw;
  --rl-side-shift: var(--rl-col);
  --rl-far-shift:  calc(var(--rl-col) * 1.55);
}

/* EL GRANO, y no es textura decorativa: es lo que el vidrio dobla. Sobre un
   negro plano la lente no tiene detalle que doblar y las flechas se leerían
   como cristal limpio — está escrito en `backgrounds.js`.

   Va en un `::before` y no como segunda capa de `background` porque necesita
   OPACIDAD propia. Y va DEBAJO de todo en orden de pintado: un `backdrop-filter`
   sólo ve lo que se pintó antes que él, así que si fuera encima, el vidrio no
   lo recogería. */
.rl::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: var(--rl-grain);
  opacity: var(--rl-grain-a);
  pointer-events: none;
}

/* ── el escenario ─────────────────────────────────────────────────────────── */
.rl__stage {
  z-index: 1;
  position: relative;
  align-self: stretch;
  flex: 1;
  min-height: 0;
  display: grid;
  place-items: center;
}

/* Cada zapato es un botón absoluto en el centro; lo que lo coloca es la
   transformación, no el layout. Así los cinco comparten el mismo origen y el
   movimiento entre posiciones es una sola interpolación.

   La transición va sobre `transform`, `filter` y `opacity` — las tres se
   componen en GPU y ninguna dispara reflow. `cubic-bezier` con salida larga:
   el zapato entra rápido y se posa, que es lo que hace que parezca que pesa.

   EL ANCHO se mide por la TINTA, no por la caja: el recorte tiene margen
   transparente por los cuatro lados, así que la caja girada dice 351 px donde
   la tinta ocupa 250. Medir la caja dejaba el zapato pequeño para nada. */
.rl__item {
  position: absolute;
  width: min(25vw, 46vh, 440px);
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
  transition:
    transform .62s cubic-bezier(.22, 1, .36, 1),
    filter    .62s cubic-bezier(.22, 1, .36, 1),
    opacity   .62s cubic-bezier(.22, 1, .36, 1);
}
.rl__item img { display: block; width: 100%; height: auto; }

/* EL FOCO. Escala 1, sin desenfoque y por delante de los demás.
   La sombra proyectada es lo único que lo despega del fondo — no lleva vidrio
   detrás, porque un zapato recortado sobre la rampa ya tiene silueta. */
.rl__item.is-focus {
  z-index: 3;
  transform: rotate(var(--rl-tilt)) scale(1);
  filter: drop-shadow(0 26px 38px rgba(0, 0, 0, .55));
  opacity: 1;
}

/* LOS VECINOS. Una columna hacia fuera; encogen, se difuminan y se apagan a la
   vez — un solo cambio leído como distancia. */
.rl__item.is-side {
  z-index: 2;
  filter: blur(var(--rl-side-blur)) drop-shadow(0 14px 24px rgba(0, 0, 0, .40));
  opacity: var(--rl-side-fade);
}
.rl__item.is-side.is-left {
  transform: translateX(calc(var(--rl-side-shift) * -1))
             rotate(var(--rl-tilt-side))
             scale(var(--rl-side-scale));
}
.rl__item.is-side.is-right {
  transform: translateX(var(--rl-side-shift))
             rotate(var(--rl-tilt-side))
             scale(var(--rl-side-scale));
}

/* LOS EXTREMOS, el tercer escalón. No se pueden tocar: a esa escala y con ese
   desenfoque son fondo, no opción — quien quiera uno gira, que para eso están
   las flechas. */
.rl__item.is-far {
  z-index: 1;
  filter: blur(var(--rl-far-blur)) drop-shadow(0 10px 18px rgba(0, 0, 0, .34));
  opacity: var(--rl-far-fade);
  pointer-events: none;
}
.rl__item.is-far.is-left {
  transform: translateX(calc(var(--rl-far-shift) * -1))
             rotate(var(--rl-tilt-side))
             scale(var(--rl-far-scale));
}
.rl__item.is-far.is-right {
  transform: translateX(var(--rl-far-shift))
             rotate(var(--rl-tilt-side))
             scale(var(--rl-far-scale));
}

/* FUERA DEL ENCUADRE. `visibility` y no `display`: la foto sigue decodificada,
   así que cuando entre no parpadea — el mismo motivo por el que el showcase
   apila sus seis frames en vez de cambiar el `src`. */
.rl__item.is-away {
  z-index: 0;
  visibility: hidden;
  transform: scale(var(--rl-far-scale));
  opacity: 0;
}

/* ── EL TÍTULO ────────────────────────────────────────────────────────────
   El único que se ve. Detrás de los tres planos del rollo — `z-index: 0` contra
   el 1, 2 y 3 de los zapatos— así que el foco le pasa por delante sin apilar
   nada a mano. En reposo está calzado sobre la ranura del pie, que queda muy
   por debajo del zapato, así que ahí ese `z-index` no molesta a nadie.

   SIEMPRE SE DIBUJA A TAMAÑO GRANDE y en reposo se ENCOGE. Al revés —dibujarlo
   pequeño y agrandarlo— el texto se rasterizaría a 76 px y al llegar a 173
   estaría reventado. Chrome rerasteriza el texto escalado, así que encogiendo
   se ve nítido en los dos extremos.

   PESO E INTERLETRADO SON LOS DEL `<h2>`, no los de una palabra de display: el
   reposo tiene que ser un CALCO de la ranura, y con otra letra el calco no
   cuadraría por mucho que la escala fuera exacta. El interletrado va en `em`,
   así que escala solo.

   `translate(-50%, -50%)` es el centrado sobre el escenario; el `translate` que
   viene detrás es el viaje —en el espacio del padre, sin escalar, porque el
   `scale` va después— y el `scale`, el tamaño. La CADENA DE FUNCIONES ES LA
   MISMA en los dos estados y sólo cambian los valores: si cambiara la lista, el
   navegador no podría interpolar y el título saltaría en vez de viajar. */
.rl__title {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 0;
  margin: 0;
  /* SÓLO EL PUNTO DE PARTIDA: `useFitText` lo reescala en cuanto mide, para que
     la palabra llegue al borde del contenido diga lo que diga. Se deja un valor
     en `vw` y no uno cualquiera porque es lo que se ve mientras no hay medida
     —el primer pintado y el respaldo si el JS no corre— y a 12vw ya está cerca.

     VERSALES. Es la excepción a la regla de la casa —primera mayúscula y el
     resto minúsculas— y va escrita: aquí la palabra no es un título que se lee,
     es la MASA que ocupa el fondo del encuadre, y en caja baja las astas
     descendentes obligan a dejar aire por abajo que rompe la banda. La misma
     razón por la que un rótulo de tienda va en versales y un párrafo no. */
  font-size: clamp(40px, 12vw, 178px);
  text-transform: uppercase;
  font-weight: 800;
  /* EL TRAZO DE RÓTULO. Éste y `.rl__name` tienen que llevar el MISMO valor en
     `em`: la escala del vuelo es `ancho de la ranura / ancho del título`, y el
     trazo entra en los dos anchos. Con el mismo em la razón se mantiene al
     cambiar de cuerpo; con valores distintos, no. */
  letter-spacing: var(--av-track-display);
  line-height: .95;
  white-space: nowrap;
  /* Sobre plano oscuro, el color del colorway — el mismo `word` que pinta el
     escaparate y el acordeón. Sobre plano claro, la tinta. Lo decide
     `tonoTitulo()` y lo escribe la plantilla, elemento a elemento. */
  /* SIEMPRE BLANCO, como el de la ficha. Llevaba el `word` del colorway y con
     eso el nombre cambiaba de color en cada giro; un titulo no hace eso. */
  color: var(--av-on-glass-strong);
  pointer-events: none;

  /* apagado hasta que hay medida — ver `--rl-fly-x` */
  opacity: 0;
  transform: translate(-50%, -50%)
             translate(var(--rl-fly-x), var(--rl-fly-y))
             scale(var(--rl-fly-s));
  filter: blur(0px);
  /* SIN transición: colocarse es instantáneo. La transición la trae
     `.is-calzado`, que llega después — ver `medirVuelo()`. */
}

.rl.is-calzado .rl__title {
  transition:
    transform var(--rl-flow),
    filter    var(--rl-flow);
}

/* Con medida ya tomada se cambian los papeles: manda el título y el `<h2>` se
   queda de ranura. `opacity` y no `visibility` en el `<h2>`, a propósito: la
   segunda lo sacaría del árbol de accesibilidad y el nombre del producto dejaría
   de anunciarse — el título que se ve es `aria-hidden`, así que el único que
   habla es éste. */
.rl.is-volando .rl__title { opacity: 1; }
.rl.is-volando .rl__name  { opacity: 0; }

/* ══ LA FICHA: TALLAS Y COMPRAR ═══════════════════════════════════════════
   ABAJO A LA DERECHA. El motivo está en la plantilla; aquí sólo la geometría.

   `bottom` se posa en el mismo suelo que el resto de la pieza —`--rl-suelo`, los
   70 px donde se apoya la barra del navegador en teléfono— y `right`, en el
   mismo relleno lateral de la sección. No son números nuevos: son los que ya
   tenía el rollo, leídos.

   Apagado y sin eventos en reposo, como el resto del gesto. Sube 10 px al
   entrar: lo justo para que se lea como que llega, no como que se enciende. */
/* DOS COLUMNAS, 65 / 35. Ocupa la sección entera por dentro del relleno —los
   mismos números que el resto de la pieza, no unos nuevos— y se pone por encima
   del escenario, que en ficha ya sólo es el fondo difuminado.

   `align-items: center` en las dos: la columna de la derecha es más corta que
   la de la izquierda y alineada arriba se quedaba flotando en el aire. */
.rl__ficha {
  position: absolute;
  z-index: 4;
  inset:
    var(--av-nav-space, 87px)
    var(--av-gutter)
    calc(var(--rl-suelo) + env(safe-area-inset-bottom, 0px));

  display: grid;
  grid-template-columns: 65fr 35fr;
  align-items: center;
  gap: clamp(20px, 4vw, 64px);

  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  transition: opacity var(--rl-flow), transform var(--rl-flow);
}

.rl__fcol { display: flex; flex-direction: column; min-width: 0; }

/* ── columna izquierda: nombre y panel ──────────────────────────────────── */
.rl__fcol--l { gap: clamp(12px, 2vh, 26px); min-height: 0; }

/* El nombre. Grande pero NO gigante: el que llenaba el ancho era el que se iba
   al fondo, y ese papel lo hace ahora el zapato. Aquí es un título que se lee,
   así que manda la legibilidad y no la mancha. */
/* SIEMPRE BLANCO. El resto del rollo tine la tinta con el `word` del colorway
   —un tono del propio zapato— y para un titulo eso lo apaga: cambia de color
   con cada producto y en los tonos oscuros deja de leerse. El nombre es la
   pieza que siempre tiene que estar arriba del todo en contraste, asi que no
   depende del zapato que toque. */
.rl__ftitle {
  color: var(--av-on-glass-strong);
  margin: 0;
  font-size: clamp(28px, 3.6vw, 54px);
  font-weight: 800;
  letter-spacing: var(--av-track-display);
  line-height: .95;
  text-transform: uppercase;
  color: var(--rl-ink);
}

/* EL PANEL. Se lleva todo el alto que quede y la foto se ajusta dentro con
   `contain`: así el panel no cambia de forma según el recorte del zapato.

   La sombra va DEBAJO y muy abierta —0 34px 60px con desplazamiento hacia
   abajo— porque es lo que lo despega del zapato difuminado que tiene detrás.
   Sin ella los dos se leen en el mismo plano. */
.rl__panel {
  flex: 1;
  min-height: 0;
  box-shadow: 0 34px 60px -24px rgba(0, 0, 0, .75);
}
.rl__panel :deep(.av-glass__body) {
  display: grid;
  place-items: center;
  height: 100%;
  padding: clamp(14px, 2.2vw, 34px);
}
.rl__panel img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* ── columna derecha: precio, descripción, tallas y salidas ─────────────── */
/* TODO A LA DERECHA. Precio, descripción, tallas y botones acaban en la misma
   vertical —el margen derecho de la sección— y esa línea compartida es lo que
   hace que la columna se lea como un bloque y no como cuatro cosas apiladas.
   Con el contenido alineado a la izquierda, cada pieza terminaba donde le
   tocaba por su largo y el borde derecho quedaba dentado. */
.rl__fcol--r {
  gap: clamp(12px, 2vh, 22px);
  align-items: flex-end;
  text-align: right;
}

.rl__fprice {
  margin: 0;
  font-size: clamp(24px, 2.6vw, 38px);
  font-weight: 700;
  letter-spacing: var(--av-track);
  line-height: 1;
  color: var(--rl-ink);
}

.rl__fblurb {
  margin: 0;
  max-width: 42ch;
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: var(--av-track);
  color: var(--rl-ink-soft);
}

/* Las dos salidas, una en cada extremo de su fila: volver a la izquierda y
   comprar a la derecha. */
/* LOS DOS BOTONES JUNTOS Y PEGADOS AL MARGEN, sin hueco entre ellos. Estuvieron
   uno en cada extremo de la fila y con la columna ya justificada a la derecha
   eso rompía la vertical: «Regresar» se quedaba solo a la izquierda, fuera de
   la línea que comparten el precio, la descripción y las tallas.

   Sin separación porque son la misma decisión en dos mitades —salir o comprar—
   y pegados se leen como un control de dos partes; con hueco se leen como dos
   botones sueltos que casualmente están cerca. */
.rl__facciones {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0;
}

.rl__tallas {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  /* CINCO por fila: 5×56 + 4×8 = 312. El mismo reparto que el acordeón, y por
     el mismo motivo — con diez tallas, seis por fila deja una segunda fila de
     cuatro y la rejilla queda coja. */
  max-width: 312px;
}

/* CAJA FIJA: un «9» y un «10.5» miden distinto y la rejilla saldría descuadrada.
   Todas iguales —el ancho lo pone la más larga— y `tabular-nums` para que los
   dígitos ocupen lo mismo entre sí.

   48 de alto y 22 de esquina, exactamente como en el acordeón. Los 48 no son
   holgura: por debajo de 44, CSS recorta los dos radios de 22 a media caja y la
   talla vuelve a ser una píldora. Está medido y explicado en
   <ProductAccordionPanel>. */
.rl__talla {
  width: 56px;
  height: 48px;
  flex: none;
}
.rl__talla button {
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
  letter-spacing: var(--av-track);
  color: var(--av-on-glass-strong);
  cursor: pointer;
}

/* LA ESQUINA DE APPLE, sólo en las tallas — la misma decisión que el acordeón:
   una casilla que se ELIGE no puede parecerse a un botón que se PULSA.
   `corner-shape: squircle` está definido en la especificación como exactamente
   `superellipse(2)`, o sea exponente 4: la curva continua de Apple, no un arco.

   Va también a los descendientes porque no se hereda sola, y el `::after` del
   especular necesita su propia línea — un pseudo-elemento no entra en
   `:deep(*)`, y sin él la pieza tendría cuerpo de superelipse y filo de arco. */
@supports (corner-shape: squircle) {
  .rl__talla { corner-shape: squircle; }
  .rl__talla :deep(*) { corner-shape: inherit; }
  .rl__talla :deep(.av-glass__spec)::after { corner-shape: inherit; }
}

/* 16 y no los 15 de «Ver detalle» y «Regresar»: éste lleva el texto a 13.5 px y
   aquéllos a 12, así que el glifo sube con él. La proporción entre letra y
   trazo es lo que se mantiene igual, no el número de píxeles. */
.rl__comprar :deep(svg) { width: var(--av-action-ico); height: var(--av-action-ico); }
/* MISMA CAJA que «Regresar» y que «Ver detalle»: los tokens de acción, y con
   ellos el ancho mínimo. Tenía su propio 44 y su propio 22 de relleno, que es
   como acaban tres botones distintos pareciéndose sólo a medias. */
.rl__comprar { height: var(--av-action-h); min-width: var(--av-action-w); }
.rl__comprar :deep(.av-glass__body) { height: 100%; }
.rl__comprar button {
  display: flex;
  align-items: center;
  justify-content: center;
  /* el aire entre la bolsa y el texto, del token: el mismo que separa glifo de
     palabra en «Regresar» y en «Ver detalle» */
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
  color: var(--av-on-glass-strong);
  cursor: pointer;
}

/* ── las flechas ─────────────────────────────────────────────────────────── */
.rl__arrow {
  position: absolute;
  top: 50%;
  z-index: 4;
  width: 52px;
  height: 52px;
  transform: translateY(-50%);
}
.rl__arrow--prev { left: clamp(10px, 3vw, 40px); }
.rl__arrow--next { right: clamp(10px, 3vw, 40px); }

.rl__arrow :deep(.av-glass__body) { height: 100%; }
.rl__arrow button {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
}
.rl__arrow :deep(svg) { width: 20px; height: 20px; }

/* ── el nombre ────────────────────────────────────────────────────────────
   La copia de arriba es de teléfono y la de abajo, de escritorio. Sólo se ve
   una; el `display` lo decide la media query. */
.rl__head { display: none; }

/* `position: relative` porque el precio cuelga de su borde de abajo — ver
   `.rl__price`. */
.rl__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

/* Alto propio para que el escenario no cambie de tamaño cuando el nombre pase a
   dos líneas: el zapato daría un salto vertical al girar. */
.rl__foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-height: 118px;
}

/* SIN VERSALES: la referencia las llevaba —«GUCCI», «BALENCIAGA»— y aquí no.
   Primera mayúscula y el resto minúsculas, igual que el texto gigante del
   showcase pasó de `ADIDAS` a `Adidas`. */
.rl__name {
  margin: 0;
  /* VERSALES, como el título que vuela hasta aquí. Y no es cosmética: la
     escala del vuelo es `ancho de la ranura / ancho del título`, así que si uno
     fuera en caja baja y el otro en versales el calco se posaría con un tamaño
     que no es el de la ranura. Los dos se leen como el mismo texto porque lo
     son. */
  text-transform: uppercase;
  /* MÁS ANCHO que antes —6.2vw / 76 px— porque en reposo la palabra ocupaba un
     tercio del encuadre y se leía como un pie de foto en una pieza que se come
     la pantalla. A 8.4vw llena poco más de la mitad del ancho de contenido y ya
     pesa lo que tiene que pesar sin tapar al zapato.

     Es el ancho de la RANURA, así que también decide cuánto se encoge el título
     al posarse: subirlo aquí es acercar los dos estados. */
  font-size: clamp(34px, 8.4vw, 108px);
  font-weight: 800;
  /* EL MISMO em que `.rl__title` — ver la nota de allí; es el cálculo del
     vuelo el que obliga, no el gusto. */
  letter-spacing: var(--av-track-display);
  line-height: .95;
  color: var(--rl-ink);
}

/* SIN PRECIO. El rollo es un escaparate y su trabajo es dar ganas de abrir la
   ficha; el precio es información de decisión y vive donde se decide. */
.rl__line {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: var(--av-track);
  color: var(--rl-ink-soft);
}

/* EL PRECIO. Sólo en la ficha, y FUERA DEL FLUJO — colgado del borde de abajo
   de la tarjeta con `top: 100%`.

   Ese `position: absolute` es el que resuelve el problema de verdad. En flujo
   había dos salidas y las dos malas: montarlo con `v-if` cambia el alto de la
   tarjeta justo mientras el título vuela hacia atrás, y el zapato pega un salto
   en medio del gesto; dejarlo montado y apagado reserva ~28 px de hueco muerto
   bajo el subtítulo que se ven siempre, también en el escaparate. Fuera del
   flujo no ocupa nada cuando no está y no empuja nada cuando llega.

   Debajo caen el «Ver detalle» y el contador, pero en la ficha los dos están
   apagados, así que el sitio está libre justo cuando hace falta.

   Sube tres píxeles al encenderse: lo justo para que se lea como que ENTRA y no
   como que estaba ahí y se le subió el brillo.

   A cuerpo grande y en blanco sólido, no al 72%: es el único dato de la ficha
   que se consulta para DECIDIR, y darle el mismo peso que al subtítulo sería
   esconderlo. */
.rl__price {
  position: absolute;
  top: 100%;
  left: 50%;
  margin: 8px 0 0;
  white-space: nowrap;
  font-size: clamp(20px, 2.4vw, 30px);
  font-weight: 700;
  letter-spacing: var(--av-track);
  color: var(--rl-ink);

  opacity: 0;
  /* La cadena de funciones es la MISMA en los dos estados; sólo cambia el
     valor. Si cambiara la lista, el navegador no podría interpolar. */
  transform: translateX(-50%) translateY(3px);
  transition: opacity var(--rl-flow), transform var(--rl-flow);
}

/* ── el pie ───────────────────────────────────────────────────────────────── */
.rl__deck {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: none;
  margin-top: clamp(4px, 1.5vh, 18px);
}

/* La pista del gesto. Sólo teléfono — en escritorio están las flechas y decir
   «desliza» sobraría.

   12 px y no los 13.5 del sistema, y es la única excepción de la pieza: no es
   contenido, es una ayuda que tiene que poder ignorarse. Al mismo cuerpo que la
   línea del producto competiría con ella. */
.rl__pista { display: none; }

/* ESTUVO EN 38 «para no competir con el zapato», y ese razonamiento se cae en
   cuanto los tres botones de la pieza se miran juntos: el de comprar ya medía
   44 y éste 38, así que lo que se leía no era una jerarquía sino un descuadre.
   Si hubiera que bajarle el peso, se le baja al material o al cuerpo del texto
   —no al alto, que es lo único que comparte con los otros dos. Ahora sale de
   `--av-action-h`; ver la nota del token en `tokens.css`. */
.rl__cta {
  flex: none;
  /* El ancho común de las acciones. Ver `--av-action-w` en `tokens.css`: el
     alto, el cuerpo y el relleno ya estaban unificados y faltaba esto. */
  min-width: var(--av-action-w);
  height: var(--av-action-h);
}
.rl__cta :deep(.av-glass__body) { height: 100%; }
.rl__cta button {
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
  color: var(--av-on-glass-strong);
  cursor: pointer;
}
.rl__cta :deep(svg) { width: var(--av-action-ico); height: var(--av-action-ico); }

/* ── regresar ─────────────────────────────────────────────────────────────
   ABAJO A LA IZQUIERDA, en la esquina OPUESTA a la ficha — que vive abajo a la
   derecha. Estuvo arriba, pegado al hueco de la barra, y de ahí baja por lo
   mismo que ya bajó el de <ProductAccordionPanel>: las dos salidas de una ficha
   —volver y comprar— tienen que estar en la misma línea del ojo y a la misma
   altura de la mano, cada una en su extremo. Arriba, «Regresar» quedaba a media
   pantalla de «Comprar ahora» y había que buscarlo en un sitio distinto del que
   se estaba mirando; y encima compartía banda con la barra fija del sitio, así
   que dos cosas que no se parecen en nada se leían como una fila de botones.

   Los dos anclajes son los MISMOS NÚMEROS que la ficha lee en su esquina —el
   suelo de `--rl-suelo` y el relleno lateral de la sección—, no unos parecidos:
   así los dos botones se apoyan en la misma línea de base aunque uno de ellos
   cambie.

   Y ahora entra DESDE ABAJO, como la ficha (`translateY(10px)`), no desde
   arriba: las dos esquinas llegan a la vez y del mismo lado, que es lo que hace
   que se lean como un solo gesto y no como dos animaciones sueltas.

   Apagado y SIN EVENTOS cuando no hay ficha. `visibility` además de la
   opacidad, porque un botón invisible pero visible-para-el-DOM sigue siendo
   objetivo del ratón — antes eso importaba en el borde superior, por donde pasa
   el cursor al bajar la página; abajo importa igual, que es donde se posa al
   llegar. */
/* Ya no va absoluto en la esquina: vive dentro de la fila de acciones de la
   ficha, así que hereda de ella el encendido y el apagado y no necesita los
   suyos. Una pieza menos que sincronizar. */
.rl__back {
  flex: none;
  min-width: var(--av-action-w);
  height: var(--av-action-h);
}
.rl__back :deep(.av-glass__body) { height: 100%; }
.rl__back button {
  display: flex;
  align-items: center;
  /* CENTRADO, igual que el de la ficha del acordeon y que los otros dos de
     aqui. Con `min-width` en la pildora y sin esto, el contenido se quedaba
     pegado a la izquierda y los dos botones de la misma fila —uno con el texto
     centrado y otro no— no se leian como pareja. */
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
  color: var(--av-on-glass-strong);
  cursor: pointer;
}
.rl__back :deep(svg) { width: var(--av-action-ico); height: var(--av-action-ico); }

/* ── el contador ──────────────────────────────────────────────────────────── */
.rl__ticks {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.rl__ticks li {
  width: 16px;
  height: 2px;
  border-radius: 2px;
  background: var(--rl-ink-hair);
  transition: background-color .3s ease, width .3s ease;
}
.rl__ticks li.is-on {
  width: 26px;
  background: var(--rl-ink);
}

/* ── el cambio de nombre ──────────────────────────────────────────────────
   Animación de ENTRADA sobre `:key`, no `<Transition>`.

   `<Transition mode="out-in">` encadena: saca el nodo viejo, ESPERA a que su
   transición termine, y sólo entonces mete el nuevo. Esa espera depende de que
   el navegador componga frames — y si la pestaña se va a segundo plano justo en
   ese momento, `requestAnimationFrame` se para, la fase de salida no avanza y
   el nombre se queda congelado con el producto anterior mientras el zapato de
   detrás ya cambió. Se reprodujo midiendo: 0 frames en 300 ms y el nodo clavado
   en `leave-from`.

   Con `:key` el nodo viejo se destruye y el nuevo nace ya con su animación: no
   hay fase que esperar ni estado que se pueda quedar a medias. */
.rl__card { animation: rl-in .26s cubic-bezier(.22, 1, .36, 1) both; }
@keyframes rl-in {
  from { opacity: 0; transform: translateY(9px); }
}

/* ══ LA FICHA ABIERTA ═════════════════════════════════════════════════════
   Todo lo que cambia al pulsar «Ver detalle», junto y en un sitio. Ninguna de
   estas reglas monta ni desmonta nada: son las mismas piezas con otros valores,
   y por eso el camino de vuelta es gratis.

   Va al FINAL de la hoja para ganarle por orden a las reglas de estado del
   rollo —`.is-side`, `.is-far`— sin tener que subir la especificidad de cada
   una. */

/* El título vuelve a su sitio de verdad: centro del escenario, tamaño entero y
   al fondo. Los tres ceros no son «nada»: son el estado sin transformar, o sea
   el que el título tendría si nunca hubiera bajado a la ranura. */
/* EL TITULO YA NO VIAJA. Se queda calzado en su ranura y solo se apaga.

   Volaba al centro y se desenfocaba detras porque ese era el fondo de la ficha
   antigua; ahora el fondo lo hace el zapato, asi que el viaje ya no lleva a
   ninguna parte — y se notaba: al cerrar, el titulo volvia deslizandose desde
   el centro mientras todo lo demas solo se desvanecia, de modo que entrar y
   salir se veian distintos.

   Sin cambio de `transform` no hay nada que interpolar y las dos direcciones
   son el mismo fundido al reves. */

/* SE VAN LOS VECINOS. La ficha habla de UN zapato; dejar dos siluetas
   desenfocadas a los lados invita a girar, y girar está bloqueado. Se apagan en
   el sitio en vez de salir volando: el rollo no se deshace, se calla. */
.rl.is-ficha .rl__item:not(.is-focus) {
  opacity: 0;
  pointer-events: none;
}

/* EL ZAPATO SE VA AL FONDO. Crece y se difumina: pasa de ser el objeto que se
   mira a ser el plano sobre el que se lee la ficha. Es el papel que antes hacía
   el título, y cambiarlo de pieza es todo el rediseño — en una ficha de
   producto, lo que puede permitirse estar fuera de foco es la copia grande del
   producto, no su nombre.

   El desenfoque es el mismo `--rl-title-blur` que usaba el título: es el número
   que ya estaba calibrado para «esto está detrás». */
/* EL ZAPATO DE FONDO: centrado en la SECCION y lo mas grande que cabe sin que
   el desenfoque se salga.

   Centrado en los dos ejes — el escenario pasa a `absolute; inset: 0`, que se
   resuelve contra la caja de relleno ENTERA, asi que su centro es el de la
   seccion y no el del hueco que dejan la cabecera y el pie.

   El tamano lo pone el lado corto, el alto. La caja del zapato ya girada mide
   unos 440 px a 1440x900 y el desenfoque anade su radio por los cuatro
   costados; 1.55 es donde la suma toca el borde sin pasarse. Mas grande y el
   halo se corta contra el `overflow: hidden` de la seccion, y un desenfoque
   cortado en recto deja de leerse como profundidad. */
.rl.is-ficha .rl__stage {
  position: absolute;
  inset: 0;
}
.rl.is-ficha .rl__item.is-focus {
  transform: rotate(var(--rl-tilt)) scale(1.55);
  filter: blur(calc(var(--rl-title-blur) * 2.6));
  opacity: .34;
  pointer-events: none;
}

/* Y el título deja de viajar: en ficha se apaga, porque el nombre lo pone la
   columna de la izquierda. En reposo sigue haciendo lo de siempre. */
.rl.is-ficha .rl__title { opacity: 0; }

/* El nombre, la linea y el precio del pie se apagan enteros: la ficha trae los
   suyos y dos copias del mismo dato en pantalla es peor que ninguna. */
.rl.is-ficha .rl__head,
.rl.is-ficha .rl__foot {
  opacity: 0;
  transition: opacity var(--rl-flow);
}
.rl.is-ficha .rl__ficha {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

/* Se apaga TODO EL MANDO del carrusel: flechas, contador, la pista del gesto y
   el propio «Ver detalle», que ya cumplió. `pointer-events` además de la
   opacidad — un botón invisible que sigue respondiendo es peor que uno
   visible. */
.rl.is-ficha .rl__arrow,
.rl.is-ficha .rl__ticks,
.rl.is-ficha .rl__pista,
.rl.is-ficha .rl__cta {
  opacity: 0;
  pointer-events: none;
}
.rl__arrow,
.rl__ticks,
.rl__pista,
.rl__cta {
  transition: opacity var(--rl-flow);
}

/* ── teléfono ─────────────────────────────────────────────────────────────
   TRES puestos, no cinco: a 375 px los de los extremos caerían encima de las
   flechas y del borde. Se apagan con la misma regla que los que están fuera del
   encuadre — no hay una segunda forma de esconder un ítem.

   Y los vecinos vuelven al desplazamiento relativo al PROPIO ítem: aquí no hay
   cinco columnas que repartir, y `42%` es lo que a este ancho hace que se lean
   como profundidad y no como tres fotos. */
@media (max-width: 900px) {
  /* UNA COLUMNA. El 65/35 pide dos bloques de lectura uno al lado del otro y a
     375 px ninguno de los dos llega a ancho de lectura. Apilados, el orden es
     el mismo que se lee de arriba abajo en escritorio: nombre, zapato, precio,
     descripcion, tallas y las dos salidas. */
  .rl__ficha {
    grid-template-columns: minmax(0, 1fr);
    align-content: center;
    gap: clamp(14px, 2.4vh, 24px);
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .rl__panel { flex: none; max-height: 40svh; }
  .rl__tallas { max-width: none; }
  /* Las dos salidas siguen una en cada extremo, que es lo que las hace pareja
     tambien aqui. */
  .rl__facciones { --av-action-w: 130px; }

  .rl {
    --rl-side-scale: 0.42;
    --rl-side-blur:  7px;
    --rl-side-shift: 42%;
    /* El nombre arriba, el botón abajo, y el zapato flotando entre los dos sin
       que ninguno lo empuje — ver `.rl__stage`. */
    justify-content: space-between;
  }
  .rl__item { width: min(62vw, 34vh, 320px); }

  /* EL TÍTULO DEL FONDO, MÁS GRANDE EN PROPORCIÓN. A 12vw daba 238 px de ancho
     contra un zapato de 269: el zapato lo tapaba entero y el viaje terminaba en
     nada. A 17vw mide unos 337 y asoma por los dos lados, que es lo que hace que
     se lea como un título DETRÁS y no como un resto de algo.

     Y el desenfoque baja a 4: 7 px sobre una letra de 64 pesan lo que 19 sobre
     una de 173. El desenfoque tiene que ser proporcional a la letra o el título
     deja de ser una palabra al fondo y pasa a ser una mancha. */
  .rl { --rl-title-blur: 4px; }
  .rl__title { font-size: clamp(44px, 17vw, 96px); }
  .rl__item.is-far { visibility: hidden; opacity: 0; }

  /* EL ZAPATO, CENTRADO EN LA PANTALLA Y NO EN LO QUE SOBRA.
     En flujo, el escenario se quedaba con el hueco entre el nombre y el botón,
     y ese hueco no está centrado: arriba pesan los 87 px que reserva la barra
     del ecommerce más los 104 del nombre, y abajo sólo los 70 del suelo más el
     botón. La cuenta daba 203 contra 140, o sea el zapato 31 px por debajo del
     centro de la pantalla — que es justo lo que se veía.

     Sacándolo del flujo con `inset: 0` el escenario pasa a medir la caja de
     relleno ENTERA —el `position: absolute` se resuelve contra la padding box,
     no contra la de contenido—, así que su centro es el centro de la sección y
     el del viewport. El nombre y el botón siguen en flujo, por encima. */
  .rl__stage {
    position: absolute;
    inset: 0;
  }

  /* SIN FLECHAS: el gesto es el dedo. Un botón de 44 px sobre el zapato en una
     pantalla de 375 quita más de lo que da, y quien tiene dedos ya sabe
     deslizar — lo único que hacía falta era decírselo, y eso lo hace
     `.rl__pista`. El teclado sigue girando el rollo. */
  .rl__arrow { display: none; }

  /* El nombre sube encima del zapato y la copia del pie se apaga. */
  .rl__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    flex: none;
    min-height: 104px;
  }
  .rl__foot { display: none; }

  .rl__pista {
    display: block;
    margin: 0 0 2px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: var(--av-track);
    color: var(--rl-ink-soft);
    opacity: .6;
  }

  /* El alto y el ancho ya los pone el token, y son los mismos en los dos
     anchos: un boton que cambia de tamano con la ventana deja de ser el mismo
     boton. */

  /* LA FICHA SE CENTRA. A 375 px no hay tercio derecho que ocupar — la esquina
     de escritorio existe porque ahí sobra sitio, y aquí no sobra ninguno. Pasa
     a ser una banda al pie, centrada como todo lo demás de la pieza.

     `left` y `right` a la vez en vez de un `transform: translateX(-50%)`: el
     `transform` ya lo usa la propia entrada del bloque, y encadenar dos en la
     misma propiedad obligaría a repetir la cadena entera en los dos estados
     para que el navegador pudiera interpolar. Con los dos bordes anclados, el
     centrado lo hace el `align-items` y el `transform` queda libre. */
  .rl__ficha {
    left: clamp(16px, 4vw, 64px);
    right: clamp(16px, 4vw, 64px);
    align-items: center;
  }
  .rl__tallas { justify-content: center; margin-inline: auto; }
}

/* ── accesibilidad ────────────────────────────────────────────────────────
   Sin movimiento: el rollo sigue funcionando, sólo que el cambio es instantáneo.
   Se quita la transición, no la funcionalidad. */
@media (prefers-reduced-motion: reduce) {
  .rl__item,
  .rl__ticks li { transition: none; }
  .rl__card { animation: none; }

  /* La ficha SIGUE FUNCIONANDO: se quita el viaje, no el destino. El título
     aparece ya al fondo y desenfocado, el precio ya encendido y el botón de
     volver ya puesto. Lo único que se pierde es el recorrido, que es
     exactamente lo que aquí se pide perder.

     El desenfoque NO se toca: no es movimiento, es profundidad — sin él el
     título competiría con el precio también aquí. */
  .rl__title,
  .rl__ficha,
  .rl__price,
  .rl__back,
  .rl__arrow,
  .rl__ticks,
  .rl__pista,
  .rl__cta { transition: none; }
}
</style>

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
import { ChevronLeft, ChevronRight, ChevronDown, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-vue-next'
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
 * LA CAÍDA — cuántos píxeles tiene que BAJAR el zapato para quedar en el centro
 * de la sección al abrir la ficha. La escribe `medirVuelo()`.
 *
 * Vive en una medida y no en una regla de CSS porque el número depende del ALTO
 * DEL PIE, que es contenido: el nombre, la línea, el precio, el botón y el
 * contador. No hay forma de escribirlo a mano sin que quede desfasado el día que
 * cualquiera de esos cinco cambie de tamaño.
 */
const caida = ref(0)

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

  /* ── los tres colores que la ficha toma del PRODUCTO ──────────────────
     No son colores nuevos: son los que el catálogo ya trae para ese zapato, los
     mismos con los que el acordeón pinta su plano. La ficha no inventa una
     paleta, consume la que hay.

     `--rl-banner`  el plano de la franja — `surface`, el color del zapato.
     `--rl-bword`   la palabra escrita a lo largo de la franja. Sale del `word`
                    del propio colorway, que ya es «el surface un punto más
                    claro»; si faltara, un blanco muy bajo. Es FONDO, no rótulo:
                    tiene que reconocerse sin competir con el nombre del modelo.
     `--rl-accent`  el acento, y aquí sólo lo lleva el precio. Es el único dato
                    de la columna con color, y por eso se despega sin necesitar
                    más cuerpo ni más peso. */
  /* CUÁNTO BAJA EL ZAPATO AL ABRIR LA FICHA. Lo mide `medirVuelo` y el porqué
     está ahí: en reposo el escenario no ocupa la sección entera —el pie le come
     los de abajo— así que su centro está por encima del de la pieza. Este es el
     que falta. */
  '--rl-drop': caida.value + 'px',
  '--rl-banner': actual.value?.surface ?? '#222',
  '--rl-bword': actual.value?.word ?? 'rgba(255,255,255,.22)',
  '--rl-accent': actual.value?.accent ?? 'var(--av-y-400)',
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

/* ══ LA TALLA, EN DOS TIEMPOS ══════════════════════════════════
 *
 * Antes las diez tallas estaban a la vista siempre. Ahora hay un disparador que
 * dice «Seleccionar talla» y abre un panel con las disponibles; al elegir, el
 * panel se cierra y el rótulo pasa a «Talla seleccionada».
 *
 * Lo que se gana no es sitio: es que la ficha deje de pedir una decisión antes
 * de haber enseñado el producto. Diez casillas abiertas compiten con el zapato;
 * un botón, no.
 *
 * EL PANEL BAJA, y la flecha apunta abajo. Estuvo al revés —subía— por miedo a
 * que se saliera de la sección, y era miedo mal puesto: entre el disparador y la
 * descripción hay un hueco vacío que es exactamente donde tiene que caer. Bajando
 * lo ocupa en vez de taparse a sí mismo contra la barra.
 *
 * Y va en DOS COLUMNAS, no en cinco. Diez tallas en cinco columnas son dos filas
 * anchas y chatas que se comen el ancho de la columna de lectura; en dos son
 * cinco filas estrechas que caen justo en ese hueco. La forma del panel la manda
 * el sitio que tiene, no la cuenta de tallas. */
const tallasAbiertas = ref(false)

function elegirTalla(t) {
  talla.value = t
  tallasAbiertas.value = false
}

/* Se cierra solo en los dos casos en que quedarse abierto sería mentira: al
   cerrar la ficha, y al cambiar de producto — las tallas del panel son las de
   `actual`, y enseñar las de uno mientras se mira otro es peor que no enseñar
   ninguna. */
watch(ficha, abierta => { if (!abierta) tallasAbiertas.value = false })
watch(actual, () => { tallasAbiertas.value = false })

/* ¿Qué pone el rótulo. Dos estados y no tres: sin talla pide, con talla informa. */
const rotuloTalla = computed(() => talla.value ? 'Talla seleccionada' : 'Seleccionar talla')

/* LA MARCA Y EL MODELO, separados. La marca es dato (`brand` en `sneakers.js`);
   el modelo es el nombre sin ese prefijo — calculado y no guardado, para que las
   dos cadenas no puedan contradecirse. Si el nombre no empieza por la marca, se
   deja entero: más vale repetir la marca que borrar media palabra. */
const marca = computed(() => actual.value?.brand ?? '')

/* LA MARCA SE AJUSTA AL ANCHO DE SU COLUMNA, no lleva un cuerpo fijo. Con un
   `clamp` en vw, «Nike» —cuatro letras— dejaba la mitad de la columna vacía y
   «adidas» —seis— la llenaba: el mismo número da manchas distintas según la
   palabra. `useFitText` mide y reescala, que es lo que ya hacen el escaparate y
   el acordeón con su texto gigante. Un composable más no; el mismo.

   MEDIA COLUMNA, no la columna entera. A ancho completo la marca se comía la
   pieza, y una marca de más letras se habría estirado todavía más. Al 0.5 todas
   —de cuatro letras o de diez— ocupan la misma mitad, que es justamente la
   gracia de ajustar por MEDIDA en vez de por cuerpo fijo. */
const cajaMarca = ref(null)
const palabraMarca = ref(null)
const { fit: ajustarMarca } = useFitText(palabraMarca, cajaMarca, 0.5)

/* Y LA DEL BANNER SE AJUSTA AL ALTO. Es el mismo ajuste medido contra una caja
   GIRADA — ver `.rl__bbox`: la caja tiene el alto del banner por ancho, así que
   llenar su ancho es llenar el alto de la franja. Sin esto, la palabra quedaba
   flotando en medio con aire arriba y abajo, que es justo lo que no se quiere:
   tiene que tocar los dos bordes. */
const cajaBanner = ref(null)
const palabraBanner = ref(null)
const { fit: ajustarBanner } = useFitText(palabraBanner, cajaBanner, 1, 1)

/* Y SE REAJUSTAN AL CAMBIAR DE MARCA, que es lo que faltaba y se pilló midiendo:
 * girando de «Nike» a «adidas» la palabra de la franja se quedaba con el cuerpo
 * de la anterior —322 px medidos para cuatro letras— y con seis se salía por los
 * dos extremos, 737 px de largo en una franja de 720 y 244 de alto en 238.
 *
 * `useFitText` no puede enterarse solo: su `ResizeObserver` vigila LA CAJA, y la
 * caja no cambia de tamaño cuando cambia el texto de dentro. Observar la palabra
 * tampoco valdría —cambiarle el cuerpo cambia su ancho, y eso vuelve a disparar
 * al observador—, así que el aviso tiene que venir de quien sabe que el producto
 * ha cambiado: de aquí.
 *
 * `nextTick` porque el texto lo pinta Vue: medir antes de que el DOM tenga la
 * palabra nueva mide la vieja. */
watch(marca, () => nextTick(() => { ajustarMarca(); ajustarBanner() }))

/* `1, 1` — LLENA EL LARGO **Y** EL ANCHO, y manda el que se quede corto.
 *
 * LO QUE SE PIDE es que la letra toque los dos costados de la franja: que el alto
 * de mayúscula sea EXACTAMENTE el ancho de la franja, sin aire ni recorte a
 * ninguno de los dos lados. Como la palabra va girada, ese ancho es su ALTO, y
 * `fillH` es justamente el tope de alto de `useFitText` — medido contra la tinta
 * real, no contra la caja de línea.
 *
 * Estuvo en `1, 0`: sin tope de alto, o sea el largo mandando siempre. Eso deja
 * la palabra tocando arriba y abajo, pero a las marcas CORTAS les engorda tanto
 * la letra que se sale por los costados y la franja se la recorta — para que
 * «NIKE», cuatro letras, midiera los 720 px de largo hacía falta un cuerpo de 486
 * con 360 px de altura de mayúscula, contra una franja de 291.
 *
 * NO SE PUEDE TENER TODO A LA VEZ, y conviene tenerlo escrito: con una franja de
 * medidas fijas, sólo hay UNA proporción de palabra que llena el largo y el ancho
 * al mismo tiempo. Medido en Bebas, alto de mayúscula partido por largo:
 *
 *     NIKE     0.74 / 1.476 em  =  0.50
 *     ADIDAS   0.76 / 2.293 em  =  0.33   ← la más larga, la que manda
 *
 * (el largo lleva ya el trazo de `--av-track-display`, 0.02em por letra.)
 *
 * Así que la franja se dimensiona para la MÁS LARGA —ver `--rl-col-banner`: 0.33
 * de su propio alto— y con eso «adidas» llena las dos medidas a la vez. Las
 * cortas quedan capadas por el ancho: tocan los dos costados, que es lo pedido, y
 * dejan aire por los extremos del largo. El recorte, que era lo que se veía, ya
 * no puede pasar en ninguna marca. */
const modelo = computed(() => {
  const n = actual.value?.name ?? ''
  const m = marca.value
  return m && n.toLowerCase().startsWith(m.toLowerCase()) ? n.slice(m.length).trim() : n
})

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

  /* ── LA CAÍDA, ANTES QUE NADA Y FUERA DE LA GUARDA ────────────────────
     Son dos medidas distintas y una no depende de la otra: el vuelo necesita
     una ranura con el título ya ajustado, y esto sólo necesita el escenario. Si
     se midiera después de la guarda, cualquier pantalla en la que el título aún
     no esté listo dejaría el zapato sin su caída — y el zapato se ve siempre.

     LA CUENTA: centro de la sección menos centro del escenario. En reposo el
     escenario es un hijo en flujo y el pie —nombre, precio, botón y contador—
     le come los píxeles de abajo, así que su centro queda ALTO. La diferencia es
     justo lo que el zapato tiene que bajar en la ficha para acabar en el medio.

     En teléfono da cero solo, y no hay que escribir ninguna excepción: allí el
     escenario ya está en absoluto con `inset: 0`, o sea que su centro Y el de la
     sección son el mismo punto. */
  if (st && seccion.value) {
    const e = cajaEnSeccion(st)
    caida.value = Math.round(seccion.value.offsetHeight / 2 - (e.y + e.h / 2))
  }

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
  /* Escape cierra DE DENTRO HACIA FUERA: primero el panel de tallas y sólo
     después la ficha. Al revés, una tecla cerraría dos capas de golpe y se
     perdería la de arriba sin haberla visto cerrarse. */
  if (e.key === 'Escape' && tallasAbiertas.value) { tallasAbiertas.value = false; e.preventDefault(); return }
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

    <!-- ── EL BANNER VERTICAL ────────────────────────────────────────────
         Una franja del COLOR DEL ZAPATO con su marca escrita a lo largo, y la
         compra al pie.

         El color sale de `surface`, el mismo plano con el que el acordeón
         pinta ese producto: la ficha no inventa un color, usa el que el
         catálogo ya le da. Y la palabra va en un tono del propio plano —no en
         blanco— porque es fondo, no rótulo: se reconoce sin competir con el
         nombre del modelo, que es el que sí hay que leer.

         Va FUERA de la ficha, como hermana suya, y no dentro: tiene que medirse
         contra la SECCIÓN para llegar a sus bordes. Metida en la rejilla de la
         ficha sólo llegaba hasta donde llegara su `inset`. La franja toca los
         bordes; el TEXTO de dentro sigue respetando el hueco de la barra. -->
    <aside class="rl__banner">
      <!-- LA CAJA GIRADA. La palabra se escribe en horizontal dentro de una caja
           que mide lo que el banner pero al revés —su ancho es el alto de la
           franja— y la caja entera se gira un cuarto de vuelta. Así el ajuste de
           texto mide un ANCHO, que es lo único que sabe medir, y el resultado
           llena el ALTO de la franja.

           Con `writing-mode` la palabra también se pondría de canto, pero
           entonces su medida de ancho sería el grosor de la letra y el ajuste no
           tendría contra qué trabajar. -->
      <div ref="cajaBanner" class="rl__bbox" aria-hidden="true">
        <p ref="palabraBanner" class="rl__bword">{{ marca }}</p>
      </div>

      <GlassSurface :radius="999" class="rl__comprar">
        <!-- `aria-label` FIJO aunque la palabra se vea: en teléfono el rótulo se
             esconde y el botón se queda en glifo, y un botón de compra que no se
             anuncia es de los que no se pueden usar a ciegas. Escrito aquí y no
             sólo en el CSS para que no dependa de la medida. -->
        <button
          type="button"
          :tabindex="ficha ? 0 : -1"
          aria-label="Comprar ahora"
          @click="emit('buy', { id: actual?.id, size: talla })"
        >
          <ShoppingBag :stroke-width="1.8" />
          <span class="rl__clabel">Comprar ahora</span>
        </button>
      </GlassSurface>
    </aside>
    <!-- ══ LA FICHA ════════════════════════════════════════
         UNA COLUMNA DE LECTURA + EL ZAPATO + UN BANNER, en ese orden de
         izquierda a derecha.

         EL ZAPATO SE QUEDA NÍTIDO. Estuvo yéndose al fondo —creciendo a 1.55 y
         desenfocado a 18 px— para hacer de plano sobre el que leer la ficha. Se
         cambió: ahora sólo crece un poco. La transición se sigue notando —el
         zapato da un paso adelante— pero lo que se mira en una ficha de producto
         es EL PRODUCTO, y desenfocarlo era pedirle a la pieza principal que
         hiciera de fondo. El fondo lo hace ahora el banner.

         Cada cosa en una banda distinta y ninguna encima de otra: la lectura
         entra por la columna izquierda, el zapato ocupa el centro y la decisión
         —comprar— vive en el banner. Es el mismo reparto por zonas del acordeón,
         que es lo que hace que las dos fichas del sitio se lean como la misma
         pieza.

         Montada siempre y apagada en reposo, como el resto del gesto: así se va
         animando al cerrar en vez de desaparecer de golpe. -->
    <div class="rl__ficha">
      <!-- ── EL CUERPO: CUATRO BANDAS ──────────────────────────────────────
           Regresar arriba · marca, precio y talla debajo · el hueco donde vive
           el zapato · el nombre y la descripción al fondo.

           Todo pegado al MARGEN IZQUIERDO, en una sola vertical. El zapato
           ocupa el centro y el banner la derecha, así que la lectura entra por
           una columna y no se cruza con la foto en ningún punto. -->
      <div class="rl__fmain">
        <div ref="cajaMarca" class="rl__fdatos">
          <!-- LA MARCA, y a este cuerpo es la mancha de la ficha. Es el dato
               que se reconoce de lejos; el modelo se lee después, abajo. -->
          <p ref="palabraMarca" class="rl__fbrand">{{ marca }}</p>
          <p class="rl__fprice">{{ actual?.price }}</p>

          <!-- ── LA TALLA, EN DOS TIEMPOS ───────────────────────────────
               El rótulo cambia con el estado: pide antes de elegir e informa
               después. Ver `elegirTalla` en el script. -->
          <div v-if="actual?.sizes?.length" class="rl__tsel">
            <p class="rl__trot">{{ rotuloTalla }}</p>

            <GlassSurface :radius="999" tag="div" class="rl__tbtn">
              <button
                type="button"
                :tabindex="ficha ? 0 : -1"
                :aria-expanded="tallasAbiertas"
                aria-controls="rl-tallas"
                @click="tallasAbiertas = !tallasAbiertas"
              >
                <span class="rl__tval">{{ talla ?? '—' }}</span>
                <ChevronDown class="rl__tchev" :stroke-width="2" />
              </button>
            </GlassSurface>

            <!-- `v-show` Y NO `v-if`, y es la regla R5 del paquete: con `v-if`
                 el panel se monta y se destruye en cada apertura, su `<filter>`
                 SVG se crea y se borra cada vez y el navegador no llega a
                 resolver la referencia del `backdrop-filter`. El menú de la
                 barra estuvo sin deformación durante días exactamente por esto. -->
            <GlassSurface
              v-show="tallasAbiertas"
              id="rl-tallas"
              tag="div"
              class="rl__tpanel"
              role="group"
              aria-label="Tallas disponibles, escala US"
            >
              <GlassSurface
                v-for="t in actual.sizes"
                :key="t"
                :radius="22"
                tag="span"
                class="rl__talla"
              >
                <button
                  type="button"
                  :tabindex="tallasAbiertas ? 0 : -1"
                  :aria-pressed="t === talla"
                  @click="elegirTalla(t)"
                >
                  <span v-if="t === talla" class="av-glass-sel" aria-hidden="true" />
                  {{ t }}
                </button>
              </GlassSurface>
            </GlassSurface>
          </div>
        </div>

        <div class="rl__fpie">
          <h2 class="rl__ftitle">{{ modelo }}</h2>
          <p v-if="actual?.blurb" class="rl__fblurb">{{ actual.blurb }}</p>

          <!-- REGRESAR VA AQUÍ, al pie de la columna, y no arriba del todo: así
               queda a la misma altura que «Comprar ahora», que vive al pie de la
               franja. Las dos salidas de la ficha —irse o comprar— comparten
               línea aunque estén en extremos opuestos, y eso es lo que las hace
               leerse como pareja. Arriba, «Regresar» quedaba suelto. -->
          <GlassSurface :radius="999" class="rl__back">
            <button type="button" :tabindex="ficha ? 0 : -1" @click="cerrar">
              <ArrowLeft :stroke-width="1.8" />
              Regresar
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

  /* EL ANCHO DEL BANNER de la ficha. Bastante para que la palabra vertical se
     lea y poco para que siga siendo una franja y no una columna.

     Vive AQUÍ y no en `.rl__ficha` aunque sólo la ficha lo pinte: el escenario
     también lo necesita —lo resta de su `inset` para que el zapato se centre en
     el hueco que la franja deja— y el escenario es HERMANO de la ficha, no su
     hijo. Declarado abajo no lo vería. */
  /* ══ LAS TRES COLUMNAS DE LA FICHA: 25 / 50 / 25 ═══════════════════════
     Lectura · zapato · banner. Un solo número las gobierna: lo que mide una
     lateral. La del medio es lo que queda, y no hace falta escribirla.

     El 100% es la caja de relleno de la sección, así que hay que descontarle los
     dos márgenes ANTES de repartir — si no, las laterales salen más anchas de la
     cuenta y la del medio se come el reparto.

     LAS DOS LATERALES LLEVAN EL MISMO MARGEN. El banner estuvo pegado al borde
     derecho mientras la columna de lectura respetaba el suyo, y una pieza con
     margen en un lado y a sangre en el otro se lee torcida aunque cada mitad esté
     bien. */
  --rl-col-info:   calc((100% - 2 * var(--av-gutter)) * .25);

  /* LA FRANJA ES LA EXCEPCIÓN DEL REPARTO, y no por gusto: su ancho lo decide la
     PALABRA que lleva dentro, no la rejilla.

     Para que la letra girada toque los dos costados sin salirse, el ancho de la
     franja tiene que ser el alto de mayúscula del cuerpo que llena su largo. Esa
     proporción es una constante de la tipografía y de la marca más larga del
     catálogo —«adidas»: 0.76 em de alto contra 2.293 em de largo, o sea 0.33— y
     el largo de la franja es el alto de la sección. De ahí el `33svh`.
     El razonamiento completo está en `useFitText(palabraBanner…)`.

     Y VA EN `min()` CON EL CUARTO DE ANTES, que sigue siendo el techo: en una
     ventana muy baja el 33% del alto se queda por debajo del cuarto y manda él,
     que es lo que se quiere —la franja se estrecha—; en una muy alta manda el
     cuarto y lo único que pasa es que a «adidas» le sobra un poco de costado,
     que es el fallo suave de los dos posibles.

     A 1265×720 sale 238 px donde antes eran 291: la franja adelgaza y la
     columna del zapato se lo queda. */
  --rl-col-banner: min(calc((100% - 2 * var(--av-gutter)) * .25), 33svh);

  /* Cuánto crece el zapato al abrirse la ficha. Ver la nota de
     `.rl.is-ficha .rl__item.is-focus`. */
  --rl-ficha-scale: 1.75;
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
  /* EL `translateY(0)` NO SOBRA. La ficha le pone una caída aquí mismo —ver
     `.rl.is-ficha .rl__item.is-focus`— y dos listas de transformación con el
     mismo número de funciones y en el mismo orden se interpolan función a
     función, que es un recorrido predecible. Si una lleva tres y la otra dos, el
     navegador cae a descomponer matrices, y el camino entre las dos deja de ser
     el que se escribió. */
  transform: translateY(0px) rotate(var(--rl-tilt)) scale(1);
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
/* ══ LA FICHA ═══════════════════════════════════════════════════════════
   Columna de lectura + banner. El zapato no está en la rejilla: vive en
   `.rl__stage`, detrás, y ocupa el hueco que la columna le deja libre.

   El `inset` es el de siempre —el hueco de la barra arriba y el suelo del rollo
   abajo— y no unos números nuevos.

   Apagada y sin eventos en reposo, como el resto del gesto. Sube 10 px al
   entrar: lo justo para que se lea como que llega, no como que se enciende. */
.rl__ficha {
  /* El ancho del banner. Bastante para que la palabra vertical se lea y poco
     para que siga siendo una franja y no una columna. */
  position: absolute;
  z-index: 4;
  /* Ocupa SÓLO la primera columna. Antes se estiraba de margen a margen y dejaba
     hueco a la derecha con un `padding-right`; ahora su caja ES la columna, que
     es lo que hace que el reparto 25/50/25 sea una sola cuenta y no tres. */
  top: var(--av-nav-space, 87px);
  bottom: calc(var(--rl-suelo) + env(safe-area-inset-bottom, 0px));
  left: var(--av-gutter);
  width: var(--rl-col-info);

  /* UNA SOLA COLUMNA y un hueco reservado a la derecha. El banner ya no vive
     aquí dentro —es hermano de la ficha— porque tiene que medirse contra la
     SECCIÓN para sangrar hasta sus bordes; metido en la rejilla sólo llegaba
     hasta donde llegara el `inset`, y salirse a base de márgenes negativos
     obligaba a adivinar el relleno de `.rl`. Con `padding-right` la columna de
     lectura sigue sin meterse debajo de la franja y no hay ningún número que
     tenga que cuadrar con otro. */
  display: grid;
  grid-template-columns: minmax(0, 1fr);


  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  transition: opacity var(--rl-flow), transform var(--rl-flow);
}

/* CUATRO BANDAS: volver · datos · el hueco del zapato · el nombre.
   La tercera es un `1fr` VACÍO a propósito: es el sitio que la columna le cede
   al zapato. Sin ella, los datos y el nombre se juntarían en el centro y la
   foto quedaría detrás del texto. */
/* DOS BANDAS: datos arriba · el pie abajo. La tercera es `1fr` y el pie se pega a
   su final con `align-self: end`, así que el hueco que sobra queda EN MEDIO —
   que es el sitio que la columna le cede al zapato.

   Estuvo declarada con cuatro (`auto auto 1fr auto`) pensando en una banda vacía
   de separación, y era un error de bulto: sólo hay tres hijos, así que el pie
   caía en la banda `1fr` y la cuarta se quedaba a cero. Con `align-items: center`
   encima —que le llegaba desde la media query de teléfono— el resultado era la
   columna entera flotando en mitad de la ficha.

   `justify-items: start` encoge cada banda a su contenido, que es lo que se
   quiere para el botón de volver y para el disparador de la talla: un botón
   estirado a mil píxeles no es un botón. El pie se escapa de esa regla con su
   propio `justify-self` — con `start` la descripción se plegaba a 281 px. */
.rl__fmain {
  display: grid;
  grid-template-rows: auto 1fr;
  justify-items: start;
  gap: clamp(10px, 1.6vh, 20px);
  min-width: 0;
}

/* ANCHO COMPLETO DE LA COLUMNA, y no es cosmético: esta caja es contra la que se
   mide la marca para ajustar su cuerpo. Con `justify-items: start` en el padre se
   encogía a su contenido —114 px— y el ajuste se medía contra sí mismo: la
   palabra salía del tamaño que ya tenía, que es una regla de tres que no
   converge. */
.rl__fdatos {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1vh, 12px);
  min-width: 0;
}

/* LA MARCA. Es la mancha de la ficha — el dato que se reconoce de lejos, antes
   de leer nada. Por eso va al cuerpo más grande de la pieza y en versal.

   SIEMPRE BLANCA (o negra sobre claro): el resto del rollo tinta con el `word`
   del colorway —un tono del propio zapato— y para un título eso lo apaga,
   porque cambia con cada producto y en los tonos oscuros deja de leerse. */
.rl__fbrand {
  margin: 0;
  /* ABRAZA SU TEXTO, no la columna. `useFitText` mide `scrollWidth` para saber
     cuánto ocupa la palabra, y en un bloque estirado eso devuelve el ancho de la
     CAJA —327— en vez del de la tinta: la regla de tres salía 1 y el cuerpo no
     se movía del valor semilla. Encogido, `scrollWidth` vuelve a ser la palabra.
     El destino de la medida sigue siendo la columna, que es `.rl__fdatos`. */
  align-self: flex-start;
  /* SEMILLA. El cuerpo de verdad lo pone `useFitText` midiendo contra el ancho de
     la columna — ver `palabraMarca` en el script. Un `clamp` en vw dejaba «Nike»
     ocupando un tercio de la columna y «adidas» la mitad: el mismo número da
     manchas distintas según cuántas letras tenga la palabra. */
  font-size: 80px;
  font-weight: 800;
  letter-spacing: var(--av-track-display);
  line-height: .88;
  text-transform: uppercase;
  color: var(--rl-ink);
}

.rl__fprice {
  margin: 0;
  font-size: clamp(26px, 2.9vw, 42px);
  font-weight: 700;
  letter-spacing: var(--av-track);
  line-height: 1;
  /* EL PRECIO SÍ LLEVA COLOR, y es el único dato de la columna que lo lleva: el
     acento del propio zapato. Es lo que hace que se despegue del bloque sin
     necesitar más cuerpo ni más peso. */
  color: var(--rl-accent, var(--rl-ink));
}

/* ══ LA TALLA ══════════════════════════════════════════════════════════
   `relative` porque el panel se ancla a ESTA caja y no a la ficha: así sube
   pegado al disparador aunque la columna cambie de alto. */
.rl__tsel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-top: clamp(6px, 1.4vh, 16px);
}

/* El rótulo. Cuerpo de interfaz y no de display: es una etiqueta, no un
   título. Cambia de texto con el estado — ver `rotuloTalla` en el script. */
.rl__trot {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--rl-ink-soft);
}

/* EL DISPARADOR. Mismo alto que cualquier acción del sitio —`--av-action-h`—
   pero SIN `min-width`: aquí lo que se enseña es un número corto y una flecha,
   y estirarlo a los 164 de una acción dejaría un hueco vacío en medio. El alto
   sí se respeta, que es lo que hace que se lea como parte del mismo juego. */
.rl__tbtn { height: var(--av-action-h); }
.rl__tbtn :deep(.av-glass__body) { height: 100%; }
.rl__tbtn button {
  display: flex;
  align-items: center;
  gap: var(--av-action-gap);
  height: 100%;
  padding: 0 var(--av-action-px);
  border: 0;
  background: none;
  font-family: inherit;
  font-size: var(--av-action-fs);
  font-weight: 600;
  letter-spacing: var(--av-track);
  color: var(--av-on-glass-strong);
  cursor: pointer;
}
.rl__tval {
  font-variant-numeric: tabular-nums;
  min-width: 2.4ch;
  text-align: center;
}

/* LA FLECHA APUNTA ARRIBA porque el panel sube. No es decoración: es la promesa
   de dónde va a aparecer. Gira al abrirse para decir que ya está abierto. */
.rl__tchev {
  width: var(--av-action-ico);
  height: var(--av-action-ico);
  transition: transform .28s cubic-bezier(.22, 1, .36, 1);
}
.rl__tbtn button[aria-expanded="true"] .rl__tchev { transform: rotate(180deg); }

/* EL PANEL BAJA, y la flecha del disparador dice exactamente eso. Cae en el hueco
   que hay entre la talla y la descripción, que estaba vacío. */
.rl__tpanel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  z-index: 2;
  padding: 10px;
}
.rl__tpanel :deep(.av-glass__body) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  /* DOS por fila: 2×56 + 8 = 120. Y no cinco.
     Cinco columnas dan dos filas anchas y chatas que se comen el ancho entero de
     la columna de lectura —que ahora es un cuarto de la pieza, no la mitad— y
     dejan sin usar el hueco vertical. Dos dan cinco filas estrechas que caben
     justo en ese hueco. La forma del panel la manda el SITIO que tiene, no la
     cuenta de tallas. */
  width: 120px;
}

/* ══ EL PIE DE LA COLUMNA ══════════════════════════════════════════════ */
.rl__fpie {
  align-self: end;
  justify-self: stretch;
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.2vh, 14px);
  min-width: 0;
}

/* EL MODELO, sin la marca delante: ésa ya está arriba a triple cuerpo, así que
   aquí se lee «Dunk Low» y no «Nike Dunk Low». Ver `modelo` en el script. */
.rl__ftitle {
  margin: 0;
  font-size: clamp(24px, 2.7vw, 40px);
  font-weight: 800;
  letter-spacing: var(--av-track-display);
  line-height: .95;
  text-transform: uppercase;
  color: var(--rl-ink);
}

.rl__fblurb {
  margin: 0;
  /* SIN `max-width`. La medida de lectura la pone ya la columna —un cuarto de la
     pieza— y un tope encima la estrechaba todavía más. */
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: var(--av-track);
  color: var(--rl-ink-soft);
}

/* ══ EL BANNER ═════════════════════════════════════════════════════════
   SANGRA HASTA LOS BORDES DE LA SECCIÓN. Es la diferencia entre una franja y una
   tarjeta alta: una franja toca los bordes.

   Y se sale POR ABSOLUTO CON EXCESO —200 px de más por arriba y por abajo— en
   vez de con márgenes negativos que deshagan el `inset`. Se probó lo segundo y
   se quedaba corto: el `inset` de la ficha se resuelve contra la caja de relleno
   de la sección, así que deshacerlo deja fuera el propio relleno de `.rl` y la
   franja arrancaba 10 px por debajo del borde. Con exceso no hace falta saber
   cuánto relleno hay: sobra por los dos lados y el `overflow: hidden` de la
   sección lo recorta exactamente donde toca.

   La columna del banner NO desaparece de la rejilla al sacarlo del flujo: es una
   pista de ancho fijo, así que sigue reservando su hueco y la columna de lectura
   no se mete debajo.

   El color sale de `surface`, el mismo plano con el que el acordeón pinta ese
   producto: la ficha no inventa un color, usa el que el catálogo ya da. */
.rl__banner {
  position: absolute;
  /* Pegado arriba y abajo, CON MARGEN a la derecha — el mismo `--av-gutter` que
     respeta la columna de lectura por su lado. Estuvo con `right: 0` y la pieza
     quedaba a sangre por un lado y con margen por el otro. */
  top: 0;
  bottom: 0;
  right: var(--av-gutter);
  width: var(--rl-col-banner);

  /* Contenedor de consulta POR TAMAÑO, y no es decoración: es lo que le permite
     a la caja girada de dentro medirse con `cqh`/`cqw`, o sea intercambiar el
     alto y el ancho de la franja. Sin esto no hay forma de decirle a una caja
     «mide lo que mi alto» en CSS puro. */
  container-type: size;
  /* Por encima de la ficha: la compra vive aquí y tiene que recibir los clics. */
  z-index: 5;
  background: var(--rl-banner);
  overflow: hidden;

  /* Aparece y se va CON la ficha, con el mismo tiempo que todo lo demás del
     gesto. Montado siempre y apagado en reposo, como el resto de la pieza. */
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--rl-flow);
}
.rl.is-ficha .rl__banner {
  opacity: 1;
  pointer-events: auto;
}

/* LA PALABRA, A LO LARGO. `writing-mode` y no un `rotate`: el modo de escritura
   gira el TEXTO y deja que la caja siga siendo una caja normal, así que el
   centrado y el recorte funcionan solos. Con `transform` habría que recolocarla
   a mano cada vez que cambiara el alto.

   `sideways-lr` la deja legible de abajo a arriba, que es como se leen los lomos
   de los libros.

   EN UN TONO DEL PROPIO PLANO y no en blanco: es FONDO, no rótulo. Se reconoce
   sin competir con el nombre del modelo, que es el que sí hay que leer. */
/* El TEXTO no sangra: la franja se sale por los cuatro costados pero la palabra
   se centra en el hueco ÚTIL, el mismo que respeta la columna de lectura. Sin
   esto quedaba centrada contra una caja 400 px más alta que la sección y se
   leía descolgada hacia abajo. */
/* LA CAJA GIRADA. Mide lo que el banner pero con los ejes cambiados —su ancho es
   el alto de la franja— y se gira un cuarto de vuelta sobre su centro. Dos cosas
   salen de aquí:

     · el ajuste de texto puede trabajar, porque mide un ANCHO y ese ancho es el
       alto de la franja;
     · la palabra queda en horizontal en su propia caja, así que `line-height`,
       centrado y recorte se comportan como en cualquier otro sitio.

   `-90deg` la deja legible de abajo a arriba, como el lomo de un libro. */
.rl__bbox {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100cqh;
  height: 100cqw;
  transform: translate(-50%, -50%) rotate(-90deg);
  display: grid;
  place-items: center;
  pointer-events: none;
}

/* LA PALABRA TOCA LOS DOS BORDES de la franja, arriba y abajo, y por eso no lleva
   ningún hueco reservado: es FONDO, no rótulo, y un fondo que respeta márgenes
   deja de leerse como fondo. El cuerpo lo pone `useFitText` midiendo contra la
   caja de arriba — el `font-size` de aquí es sólo la semilla desde la que mide.

   EN UN TONO DEL PROPIO PLANO y no en blanco: tiene que reconocerse sin competir
   con el nombre del modelo, que es el que sí hay que leer. */
.rl__bword {
  margin: 0;
  font-size: 100px;
  font-weight: 800;
  /* El trazo de display de la casa, el mismo que cualquier otro titular. */
  letter-spacing: var(--av-track-display);
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--rl-bword);
}

/* LA COMPRA, AL PIE DEL BANNER. `absolute` para que el centrado de la palabra no
   la mueva, y separada del borde por el mismo suelo que usa el rollo. */
.rl__banner > .rl__comprar {
  position: absolute;
  bottom: calc(var(--rl-suelo) + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
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
/* EL CUERPO DEL VIDRIO TIENE QUE LLENAR LA CASILLA. Es la única capa del material
   que va en flujo —`__back`, `__veil` y `__spec` son absolutas— así que sin esto
   se encoge al tamaño de su contenido: el botón medía lo que el número, se
   apoyaba arriba a la izquierda y el número salía corrido dentro de la casilla en
   vez de centrado. El `width/height: 100%` del botón se medía contra una caja que
   se estaba midiendo a sí misma. */
.rl__talla :deep(.av-glass__body) {
  width: 100%;
  height: 100%;
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

/* ══ EL ZAPATO EN LA FICHA ═════════════════════════════════════════════
 *
 * SE QUEDA NÍTIDO Y SÓLO CRECE UN POCO. Esto es un cambio de criterio y merece
 * quedar escrito, porque antes hacía justo lo contrario.
 *
 * Estuvo yéndose al fondo: `scale(1.55)`, desenfoque de 18 px y opacidad .34,
 * para pasar de objeto que se mira a plano sobre el que se lee la ficha —el
 * papel que antes hacía el título—. La idea de profundidad era buena y la pieza
 * elegida, no: **en una ficha de producto lo que se mira es el producto**, y
 * desenfocarlo es pedirle a la pieza principal que haga de fondo. El fondo lo
 * hace ahora el banner, que para eso es una franja de color.
 *
 * 1.75, que es lo que llena la columna del medio. El zapato en reposo mide
 * `min(25vw, 46vh, 440px)` —316 px a 1265 de ancho— y la columna central son 568:
 * la regla de tres da 1.79 y se deja en 1.75 para que quede aire a los lados.
 *
 * Estuvo en 1.08 y se quedaba corto: la referencia es el detalle del acordeón,
 * donde el zapato ocupa el alto ENTERO del panel (medido: 1.09 veces su alto). A
 * 1.08 el paso adelante se notaba pero el zapato seguía siendo pequeño para una
 * ficha a pantalla completa.
 *
 * ── Y BAJA MIENTRAS CRECE, QUE ES LO ÚNICO QUE HACE QUE EL GESTO SE LEA ──
 *
 * EL ESCENARIO YA NO SE SACA DEL FLUJO AL ABRIR. Estuvo pasando a
 * `position: absolute; inset: 0` con la ficha, escrito con la idea de que así el
 * zapato se centraba en la sección sin restarle nada a nadie. La idea era buena
 * y el efecto, malo, porque esa cuenta se hizo sólo para el estado FINAL:
 *
 *   en reposo   el escenario es un hijo en flujo y el pie le come 200 px por
 *               abajo — medido: caja de 352 px que arranca en 87, o sea centro
 *               en 263 de una sección de 720;
 *   en ficha    con `inset: 0` la caja pasa a ser la sección entera y su centro,
 *               a 360.
 *
 * Esos 97 px de diferencia NO SE ANIMABAN. Un cambio de `position` y de `inset`
 * es disposición, no transformación: el navegador la aplica en el primer
 * repintado y sólo después empieza a interpolar la escala. Lo que se veía era
 * exactamente lo que se describía — el zapato daba un salto hacia abajo y desde
 * ahí, ya descolocado, empezaba a crecer.
 *
 * Ahora el escenario se queda donde está SIEMPRE y los 97 px son un
 * `translateY` más de la misma cadena. Sale gratis: `transform` ya estaba en la
 * transición, así que el crecer y el bajar son una sola interpolación con una
 * sola curva. El zapato arranca donde estaba, y mientras se hace grande se
 * desliza hasta el centro de la pieza.
 *
 * EL NÚMERO LO MIDE EL JS — `--rl-drop`, ver `medirVuelo()`. No puede ser una
 * constante: depende del alto del pie, y el pie es contenido.
 *
 * EL ORDEN DE LA CADENA IMPORTA. `translateY` va PRIMERO, así que se aplica en
 * el espacio del padre y no lo multiplica el `scale` que viene detrás: 97 px son
 * 97 px y no 97 × 1.75. Al revés, el zapato se pasaría de largo. */
.rl.is-ficha .rl__item.is-focus {
  transform:
    translateY(var(--rl-drop, 0px))
    rotate(var(--rl-tilt))
    scale(var(--rl-ficha-scale));
  filter: drop-shadow(0 30px 44px rgba(0, 0, 0, .58));
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
  /* ══ EL REPARTO CAMBIA: AQUÍ NO HAY 25/50/25 ═══════════════════════════
     Un cuarto de 390 px son 90, y en 90 px no cabe una columna de lectura: la
     marca, el precio y la descripción se salen todos. El reparto de tres
     columnas iguales es de escritorio.

     En teléfono manda otra regla: **la franja se queda con lo justo para su
     palabra y la lectura se lleva el resto**. El zapato sigue en medio de lo que
     queda —ver el `inset` del escenario más abajo—, así que las tres zonas
     siguen existiendo; lo que cambia es el reparto, no la idea.

     La franja no se puede quitar: la compra vive ahí, y es la única acción que
     esta ficha tiene que ofrecer siempre. */
  .rl {
    --rl-col-banner: clamp(64px, 22vw, 96px);
    --rl-col-info: calc(100% - 2 * var(--av-gutter) - var(--rl-col-banner) - 14px);
  }

  /* EL ZAPATO SE CENTRA EN LA PANTALLA, Y SE MONTA SOBRE LA FRANJA SI HACE
     FALTA. Estuvo restándole el ancho del banner —`inset: 0 var(--rl-col-banner)
     0 0`— para que no se le metiera debajo, y el precio era que el producto
     quedaba descentrado en la única pantalla donde el producto ES la pantalla.

     Aquí la prioridad se invierte respecto a escritorio: allí hay sitio para tres
     bandas y cada una respeta la suya; en 375 px no hay bandas que respetar, hay
     un zapato. Que pise la franja no es un defecto — la franja está DETRÁS
     (`z-index: 0`, justo abajo), así que lo que se ve montado es el zapato sobre
     su propio color, no un recorte contra una pieza de la interfaz.

     Y no le quita nada a la compra: el zapato es una imagen sin eventos, así que
     el botón de la franja sigue recibiendo los clics aunque le pase por encima. */

  /* EL BANNER, AL FONDO. En escritorio va por encima porque el zapato se queda
     en su columna y no llega a tocarlo; aquí el zapato es mucho más grande en
     proporción y se le monta encima, y una franja de color por delante del
     producto lo tapa. Detrás hace de fondo, que es su papel.

     La compra sigue recibiendo clics: el zapato es una imagen con
     `pointer-events: none`, así que lo que se le ponga encima no intercepta
     nada. */
  .rl__banner {
    z-index: 0;

    /* A SANGRE POR LA DERECHA. En escritorio la franja respeta el mismo margen
       que la columna de lectura, porque las dos son bandas de una rejilla y una
       pieza con margen a un lado y a sangre al otro se lee torcida. En teléfono
       no hay rejilla que respetar y ese margen es tierra de nadie: 16 px de
       fondo negro entre la franja y el filo de la pantalla que no llevan nada.

       Se los queda la franja —`right: 0` y el ancho crecido por lo mismo que se
       le quita al margen— así que el borde derecho de la pieza ES el borde de la
       pantalla y su borde izquierdo no se mueve: la columna de lectura conserva
       su sitio, que es la cuenta que hace `--rl-col-info`.

       Y la palabra crece con la franja: su cuerpo lo pone el ancho, así que los
       16 px van a la letra. */
    right: 0;
    width: calc(var(--rl-col-banner) + var(--av-gutter));
  }

  /* LA PALABRA SE AJUSTA IGUAL QUE EN ESCRITORIO, y aquí ya no hay excepción.

     Estuvo con un cuerpo fijo —`clamp(44px, 29vw, 116px) !important`— porque con
     el criterio de entonces, LLENAR EL LARGO, una franja de 86 px dejaba fuera
     cuatro quintas partes de la letra: lo que quedaba no era una palabra, era una
     raya. El cuerpo fijo tapaba ese recorte, pero también rompía lo que se pide
     en las dos medidas: que la letra toque los dos costados.

     Con el tope de alto puesto —ver `useFitText(palabraBanner…)`— el problema se
     va solo: la letra se cala al ancho de la franja, sea cual sea, así que ni se
     sale ni deja aire. Lo que cambia entre teléfono y escritorio es cuánto largo
     le sobra, no si se recorta. Una regla menos y el mismo criterio en todas las
     pantallas. */

  /* Y EL ZAPATO SE MODERA. A 1.75 medía 462 px de ancho contra los 304 que deja
     la franja: se salía por los dos lados y lo recortaba la sección. 1.15 lo deja
     dentro. La escala de escritorio no vale aquí porque la referencia tampoco es
     la misma — allí llena una columna del 50%, aquí llena lo que queda. */
  .rl { --rl-ficha-scale: 1.15; }

  /* LA COMPRA SE QUEDA EN GLIFO. 164 px de acción no caben en una franja de 96,
     y estirar la franja hasta que quepan se comería un cuarto de la pantalla.

     Se va la PALABRA y se queda el ALTO —44 px, el de cualquier acción del
     sitio— que es lo que la mantiene dentro del mismo juego. El botón sigue
     anunciándose entero: lleva `aria-label`, así que para un lector no cambia
     nada. Ver la plantilla. */
  .rl__banner > .rl__comprar { --av-action-w: 0px; min-width: 0; }
  .rl__comprar button { padding: 0; width: var(--av-action-h); justify-content: center; }
  .rl__clabel { display: none; }

  /* TRES POR FILA. El panel es el mismo que en escritorio —misma caja, mismo
     sitio, misma forma de abrirse— y lo único que cambia es cuántas tallas caben
     en cada línea: dos allí, tres aquí. La cuenta es la de siempre, el ancho
     manda el reparto: 3×56 + 2×8 = 184.

     ESTUVO EN 312, o sea cinco por fila, y el motivo era el alto: cinco por fila
     son dos filas y 124 px, y así el panel entraba de sobra entre el disparador y
     la barra del navegador. Tres por fila son cuatro filas y 236 px, que es casi
     el doble — cabe, pero es el número que hay que vigilar el día que la lista de
     tallas crezca. Con doce ya serían cuatro filas justas; con trece, cinco. */
  .rl__tpanel :deep(.av-glass__body) { width: 184px; }

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
  /* SIN `align-items: center`. Lo llevaba, y con la ficha convertida en una
     rejilla de una sola columna eso impedía que `.rl__fmain` se estirase: la
     columna medía lo que su contenido y quedaba flotando en mitad de la pantalla
     en vez de repartirse entre el borde de arriba y el de abajo. El centrado que
     aquel comentario buscaba lo hace ahora el reparto de bandas. */
  .rl__ficha {
    left: clamp(16px, 4vw, 64px);
    right: clamp(16px, 4vw, 64px);
  }
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

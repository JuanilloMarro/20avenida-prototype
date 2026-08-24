<script setup>
/**
 * Barra de navegación — material Velo negro, como todo lo demás.
 *
 * Dos disposiciones, y la diferencia no es sólo de tamaño:
 *
 *   ESCRITORIO   marca en su panel circular · píldora de enlaces centrada ·
 *                tres acciones arriba a la derecha. Cinco piezas separadas.
 *   MÓVIL        UNA sola barra, arriba también, y en un solo panel: buscar · bolsa ·
 *                favoritos · cuenta · ⋯. Los enlaces viven dentro del menú que
 *                abre el ⋯, y el buscador tiene su propio panel. Arriba no hay
 *                nada.
 *
 * Los dos paneles son a PANTALLA COMPLETA, y son la misma caja: mismo material,
 * mismo `--lg-r: 0`, mismo padding que esquiva notch y barra de gestos. Ni uno
 * ni otro cuelga de la barra ni se ciñe a su contenido — lo que hay dentro de
 * los dos es una tarea, no una lista corta de la que se elige de un vistazo:
 * buscar se escribe y se compara, y filtrar baja tres niveles. Un cuadro de
 * 300 px colgando de la esquina apretaba justo lo que necesitaba aire.
 *
 * Por qué en móvil la barra de arriba desaparece entera: con dos barras el
 * teléfono pedía dos decisiones a la vez y ninguna de las dos se leía como la
 * principal. Con una sola, y los enlaces detrás de un gesto, cada momento tiene
 * una acción. Y al abrir el menú se esconde también la barra: mientras el menú
 * está abierto no hay nada más que tocar — con el panel a pantalla completa no
 * queda ni fuera donde tocar, así que el cierre es una X explícita en su
 * cabecera, igual que en el buscador.
 *
 * TIPOGRAFÍA, tres reglas que valen para todo el componente:
 *   · NUNCA versales. Primera mayúscula y el resto minúsculas, sea un título,
 *     una etiqueta o una fila. Ni con `text-transform` ni escritas a mano.
 *   · UN SOLO TAMAÑO — 13.5 px, SIN EXCEPCIÓN — Y UN SOLO PESO — 500. Nada de
 *     negrita en ningún sitio, tampoco en los títulos («Menú», «Filtros», la
 *     rama abierta del recorrido). Ni siquiera el input del buscador se sale
 *     del tamaño: a 13.5 iOS hace zoom sobre la página entera al enfocarlo
 *     —por debajo de 16 lo hace siempre—, y se prefirió pagar ese zoom a que
 *     el input rompiera la única regla de tamaño del componente. La única
 *     excepción de PESO son los BADGES numéricos (el contador de la bolsa, la
 *     píldora del descuento): un número dentro de una burbuja no es texto
 *     corrido y no le aplica la regla.
 *   · Lo que separa un título de una fila es sólo el COLOR — blanco puro
 *     contra el 72% de siempre —, nunca el cuerpo ni el peso.
 *
 * Las dos disposiciones se resuelven en CSS, con el marcado duplicado y una de
 * las dos copias en `display: none`. Se podría hacer con un `matchMedia` y
 * `v-if`, pero eso mueve la decisión al cliente: el servidor no sabe el ancho,
 * renderiza una y el navegador tiene que corregirla al hidratar. Duplicar en
 * CSS lo resuelve en el primer pintado, y la copia oculta sale del árbol de
 * accesibilidad, así que tampoco hay botones repetidos para un lector.
 *
 * TODAS las piezas miden `--av-nav-h` (70 px). Un único token: cambiarlo mueve
 * todo a la vez y sigue alineado. A 70 px los topes casi no muerden — la lente
 * baja de 26 a 23.8 y la compresión de 82 a 76.2, o sea el 92% del material
 * real. A 46 px se quedaba en el 60%.
 *
 * Las barras son `fixed`: siguen visibles con el scroll hasta el final. Eso es
 * además lo que le da sentido al material — lo que refracta va cambiando
 * mientras el contenido pasa por debajo, y el velo negro no se inmuta.
 */
import {
  ShoppingBag, Heart, User, MoreHorizontal, Search, X,
  ChevronDown, ChevronRight, ArrowRight,
  House, Store, Percent, Sparkles, Info,
  Footprints, Shirt, Package,
} from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    default: () => ([
      /* El icono se usa en LAS DOS disposiciones: en las filas del menú de
         teléfono y, desde ahora, también en la píldora de escritorio. Sigue
         siendo opcional — unos `items` de fuera sin icono funcionan igual: el
         menú deja el hueco y alinea, y la píldora no pinta el `<span>`.

         Aquí SÓLO va lo que NAVEGA. Sneakers, Ropa y Accesorios estuvieron un
         rato en esta lista como botones que abrían un desplegable propio, y era
         un error de sitio: no son destinos, son por dónde se corta el catálogo,
         o sea filtros. Viven en `filters`, que es donde se filtra, y ahí
         reemplazan a los antiguos Hombre / Mujer / Productos.

         El orden no es alfabético ni casual, va de lo más vendedor a lo más
         administrativo: Tienda es a dónde lleva todo lo demás del panel — es el
         destino del recorrido de filtros —, Ofertas y Próximamente son las dos
         razones para volver a entrar, y Nosotros y Cuenta cierran. */
      { id: 'home', label: 'Inicio', to: '/', icon: House },
      { id: 'shop', label: 'Tienda', to: '/tienda', icon: Store },
      { id: 'sale', label: 'Ofertas', to: '/ofertas', icon: Percent },
      /* PLACEHOLDER — hoy no hay página detrás, igual que Tienda y Ofertas: el
         prototipo emite `select` y no navega a ninguna parte. */
      { id: 'soon', label: 'Próximamente', to: '/proximamente', icon: Sparkles },
      { id: 'about', label: 'Nosotros', to: '/about', icon: Info },
      /* Cuenta entra también aquí, no sólo como icono suelto en la barra: en
         móvil la barra desaparece con el menú abierto, así que sin esta fila no
         habría forma de llegar a la cuenta mientras el menú está abierto. */
      { id: 'account', label: 'Cuenta', to: '/account', icon: User },
    ]),
  },
  active: { type: String, default: 'home' },
  /** Nº de artículos en la bolsa. 0 = sin burbuja. */
  bag: { type: Number, default: 0 },
  /** Cuál de las tres acciones está seleccionada en la barra. */
  activeAction: { type: String, default: 'bag' },
  /** Sugerencias del buscador. PLACEHOLDER: hoy son literales; cuando haya
      endpoint salen de él o del historial del usuario. */
  suggestions: { type: Array, default: () => ['Samba OG', 'Originals', 'Novedades'] },
  /**
   * Lo que el buscador puede encontrar. Vacío por defecto y a propósito: la
   * barra no sabe nada del catálogo, se lo pasan. Hoy lo hace el escenario con
   * lo que hay en `colorways.js`; mañana lo hará un endpoint y esto no cambia.
   *
   * `{ id, name, line, price, priceWas?, discount?, image }`
   */
  catalog: { type: Array, default: () => [] },
  /**
   * Los filtros, en ÁRBOL: cada nodo es `{ id, label, icon?, children? }`. Con
   * `children` es una rama — se despliega debajo de sí misma. Sin `children` es
   * una HOJA, y una hoja no se marca: LLEVA A TIENDA con ese corte hecho.
   *
   * Eso es lo que son estos filtros — direccionamientos, no una casilla que se
   * enciende. El menú no es donde se filtra: es por donde se entra al catálogo
   * ya filtrado. Marcar y desmarcar aquí dentro obligaba a un segundo gesto —
   * un «ver resultados» al final— para algo que la propia hoja ya dice. Filtrar
   * de verdad, con varios cortes a la vez y sin salir, es cosa de Tienda, y ese
   * es otro tema.
   *
   * El ICONO va sólo en la raíz — Sneakers, Ropa, Accesorios. Más abajo son
   * marcas y cortes («Hombre», «Nike»), y ahí un icono o sería un logo, que no
   * toca, o sería decoración repetida. La columna del icono se reserva igual en
   * todos los niveles, así que las etiquetas siguen alineadas.
   *
   * La RAÍZ son las tres categorías de la tienda: Sneakers, Ropa y Accesorios.
   * Sustituyen a los antiguos Hombre / Mujer / Productos, que ya no existen —
   * hombre y mujer no desaparecieron, BAJARON un nivel: son cómo se corta cada
   * categoría, no la primera pregunta que se le hace al catálogo.
   *
   * Los ids llevan el prefijo de su rama («sneakers-hombre-nike») y no el
   * nombre suelto: son lo que viaja a Tienda, y un «nike» pelado no diría si
   * viene de sneakers o de ropa.
   *
   * «Niños» es PLACEHOLDER — «si hay», tal cual se pidió. En cuanto se confirme
   * el catálogo infantil real, esto es lo único que cambia.
   */
  filters: {
    type: Array,
    default: () => ([
      {
        id: 'sneakers', label: 'Sneakers', icon: Footprints, children: [
          {
            id: 'sneakers-hombre', label: 'Hombre', children: [
              { id: 'sneakers-hombre-nike', label: 'Nike' },
              { id: 'sneakers-hombre-adidas', label: 'Adidas' },
              { id: 'sneakers-hombre-puma', label: 'Puma' },
              { id: 'sneakers-hombre-new-balance', label: 'New Balance' },
              { id: 'sneakers-hombre-converse', label: 'Converse' },
              { id: 'sneakers-hombre-vans', label: 'Vans' },
            ],
          },
          {
            id: 'sneakers-mujer', label: 'Mujer', children: [
              { id: 'sneakers-mujer-nike', label: 'Nike' },
              { id: 'sneakers-mujer-adidas', label: 'Adidas' },
              { id: 'sneakers-mujer-puma', label: 'Puma' },
              { id: 'sneakers-mujer-new-balance', label: 'New Balance' },
            ],
          },
          {
            id: 'sneakers-ninos', label: 'Niños', children: [   // PLACEHOLDER
              { id: 'sneakers-ninos-nike', label: 'Nike' },
              { id: 'sneakers-ninos-adidas', label: 'Adidas' },
            ],
          },
        ],
      },
      {
        id: 'ropa', label: 'Ropa', icon: Shirt, children: [
          { id: 'ropa-hombre', label: 'Hombre' },
          { id: 'ropa-mujer', label: 'Mujer' },
        ],
      },
      {
        id: 'accesorios', label: 'Accesorios', icon: Package, children: [
          { id: 'accesorios-gorras', label: 'Gorras' },
          { id: 'accesorios-pines', label: 'Pines' },
          { id: 'accesorios-cintas', label: 'Cintas' },
          { id: 'accesorios-calcetines', label: 'Calcetines' },
        ],
      },
    ]),
  },
})

const emit = defineEmits(['select', 'open', 'search', 'filter'])

const actions = [
  { id: 'bag', icon: ShoppingBag, label: 'Bolsa' },
  { id: 'wishlist', icon: Heart, label: 'Favoritos' },
  { id: 'account', icon: User, label: 'Cuenta' },
]

/* La barra guarda su propia selección para que se vea funcionar en el prototipo;
   el `open` sigue saliendo fuera para quien lo quiera gobernar desde arriba. */
const picked = ref(props.activeAction)
watch(() => props.activeAction, v => { picked.value = v })

function openAction(id) {
  picked.value = id
  emit('open', id)
}

/* ── el menú ───────────────────────────────────────────────────────────────
   Va con `v-show`, igual que el buscador, y no duplicado en CSS: lo que decide
   no es el ancho de la ventana —que el servidor no sabe— sino un estado que
   arranca cerrado en los dos lados. No hay nada que corregir al hidratar.

   Estuvo con `v-if`, que ahorraba una capa de vidrio mientras el menú estaba
   cerrado, y salió caro: era la ÚNICA diferencia estructural que quedaba con el
   buscador, y era justo la que hacía que su lente no se viera. Con `v-if` el
   panel se monta y se destruye en cada apertura, así que su `<filter>` se crea
   y se borra cada vez — y el navegador no llega a resolver la referencia del
   `backdrop-filter` contra un nodo que acaba de aparecer.

   El coste —una instancia de vidrio de más en el árbol— es el mismo que ya paga
   el buscador, y oculta no compone nada: `display: none` no pinta
   `backdrop-filter` y el ResizeObserver de la lente se sale solo al medir 0. */
const menuOpen = ref(false)
const searchOpen = ref(false)

/* El RECORRIDO dentro del árbol de filtros: una pila de NODOS, no de ids — así
   la lista de la rama actual sale de leer el último elemento, sin volver a
   recorrer el árbol desde la raíz cada vez.

   Cómo se ve, que es lo que importa: al desplegar una rama sus HERMANAS
   DESAPARECEN y sus hijos salen JUSTO DEBAJO de ella. La rama abierta se queda
   arriba, y con ella todas las que llevaron hasta aquí, una debajo de otra y
   cada una un poco más adentro: eso es el recorrido, y es lo que dice en todo
   momento dónde está el usuario sin gastar una migaja de pan aparte.

   No es un acordeón: un acordeón deja abiertos varios niveles a la vez y hay
   que leer la sangría para saber qué cuelga de qué. Aquí sólo hay un camino
   abierto, y las tres o cuatro opciones que quedan a la vista son siempre las
   del nivel en el que estás. */
const filterPath = ref([])

const currentFilters = computed(() => filterPath.value.length
  ? filterPath.value.at(-1).children || []
  : props.filters)

/* Una rama se despliega. Una hoja NO se marca: es el final del recorrido, y el
   final del recorrido es Tienda con ese corte hecho — ver `pickFilter`. */
function openFilterNode(node) {
  if (node.children?.length) filterPath.value = [...filterPath.value, node]
  else pickFilter(node)
}

/* A dónde lleva una hoja. Se escribe entero y no sólo con el id de la hoja
   porque el `href` tiene que ser un destino de verdad aunque hoy no haya
   página detrás: es lo que ve el que abre en pestaña nueva o copia el enlace.

   PLACEHOLDER en la forma del parámetro — `?f=` con el id de la hoja — hasta
   que Tienda exista y diga cómo quiere recibirlos. */
function shopHref(node) {
  return `/tienda?f=${encodeURIComponent(node.id)}`
}

/* Tocar una fila del recorrido la CIERRA y devuelve a su nivel: `slice(0, i)`
   se lleva también al nodo `i`, que es justo lo que hace falta — al cerrar
   «Sneakers» vuelven a verse sus hermanas Ropa y Accesorios. Así la misma fila
   abre y cierra, y no hace falta un botón de volver aparte. */
function collapseTo(i) {
  filterPath.value = filterPath.value.slice(0, i)
}

function backFilters() {
  filterPath.value = filterPath.value.slice(0, -1)
}
/* Quien ABRIÓ el panel, para devolverle el foco al cerrarlo. Se guarda el
   elemento del evento y no una `ref` del template a propósito: desde que el
   menú y el buscador se abren también desde la barra de escritorio hay DOS
   botones para cada panel, y dos elementos con la misma `ref` dejan en la
   variable al último que se montó — que es justo el que está oculto por media
   query. El evento sí sabe cuál se tocó. */
const menuTrigger = ref(null)
const searchTrigger = ref(null)
const menuList = ref(null)
const searchInput = ref(null)
/* El OTRO campo, el de la barra de escritorio — la que vive en la cabecera. No
   son dos copias del mismo: `searchInput` es el del panel a pantalla completa,
   el único que hay en teléfono, y éste no tiene allí equivalente. Por eso cada
   uno lleva su `ref`, y por eso aquí no sirve el truco de arriba de guardar el
   elemento del evento — a este campo hay que poder darle y quitarle el foco
   desde fuera, sin que nadie lo acabe de tocar. */
const deskInput = ref(null)

/* Cuál de los dos campos manda AHORA MISMO. Se lo pregunta al DOM
   —`offsetParent` se queda en `null` en cuanto algo por encima está en
   `display: none`— y no a un `matchMedia('(min-width: 1280px)')`, que sería lo
   obvio.

   El motivo es que ese 1280 ya está escrito una vez, en el `@media` de abajo, y
   es un número que se ha movido y puede volver a moverse — sale de cuántos
   enlaces lleve la píldora, y ahí mismo queda anotado que con cuatro el corte
   volvería a 1024. Con `matchMedia` habría dos sitios obligados a decir lo
   mismo y nada que avise el día que dejen de decirlo, y el fallo además sería
   mudo: ni error ni nada roto a la vista, sólo el foco yéndose a donde no debe.
   Preguntando al elemento, quien decide sigue siendo el CSS — que es quien
   decide TODO lo demás en este componente.

   No es reactivo a propósito: con esto no se pinta nada, sólo se decide a dónde
   va el foco en el instante exacto de abrir o de cerrar. */
function isDeskSearch() {
  return !!deskInput.value?.offsetParent
}

/* Los dos paneles de vidrio, para pedirles que rehagan su lente en el momento
   exacto en que se muestran — ver `openSearch` y `openMenu`. El buscador lo
   necesita de verdad (vive con `v-show` y nace sin medir); el menú se monta ya
   visible y se sincroniza solo, pero lleva la misma llamada A PROPÓSITO: son la
   misma pieza haciendo lo mismo, y en cuanto uno de los dos se abre por un
   camino distinto empieza a divergir el comportamiento del material. */
const searchGlass = ref(null)
const menuGlass = ref(null)
const query = ref('')

/* Uno cada vez. Abrir uno cierra los otros sin devolver el foco — el foco se lo
   queda el que acaba de abrirse. */
const panelOpen = computed(() => menuOpen.value || searchOpen.value)

function openMenu(evt) {
  closeSearch(false)
  menuTrigger.value = evt?.currentTarget || null
  filterPath.value = []   // el menú siempre se abre por la raíz del árbol
  menuOpen.value = true
  nextTick(() => {
    /* el foco entra al panel: con la barra oculta no queda nada detrás que
       tocar, y dejarlo en un botón que acaba de desaparecer lo mandaba al body */
    menuList.value?.querySelector('a')?.focus()
    /* y la lente, igual que en `openSearch` — ver la nota junto a `menuGlass` */
    menuGlass.value?.sync()
  })
}

function closeMenu(refocus = true) {
  if (!menuOpen.value) return
  menuOpen.value = false
  if (refocus) nextTick(() => menuTrigger.value?.focus())
}

function pickLink(id) {
  emit('select', id)
  closeMenu()
}

/* Elegir una hoja CIERRA el menú y lleva a Tienda — se comporta como cualquier
   otra fila que navega, porque eso es lo que es. Antes se marcaba con un check
   y el menú se quedaba abierto para poder marcar varias; ese modelo pedía un
   «ver resultados» al final que nadie había pedido, y dejaba al usuario
   eligiendo dentro de un panel en vez de dentro de la tienda.

   Va con el CAMINO entero, no sólo la hoja: quien escuche esto necesita saber
   que «Nike» venía de Sneakers › Hombre, y reconstruirlo desde el id partiendo
   guiones sería adivinar. */
function pickFilter(node) {
  emit('filter', {
    node,
    path: [...filterPath.value, node],
    ids: [...filterPath.value.map(n => n.id), node.id],
    to: shopHref(node),
  })
  closeMenu()
}

/* «Limpiar» devuelve los filtros a su estado inicial: la raíz, con las tres
   categorías a la vista. Ya no hay nada aplicado que borrar — lo único que
   ensucia el panel es haber bajado, y esto sube de una vez en vez de cerrar
   rama por rama. */
function clearFilters() {
  filterPath.value = []
}

/* ── el buscador ───────────────────────────────────────────────────────────
   El panel se pinta con `v-show` y no con `v-if`, y no es un capricho: en iOS
   el teclado solo sube si el `.focus()` ocurre dentro del gesto que lo pidió.
   Con `v-if` el input todavía no existe en ese instante y el teclado no
   aparece. Con `v-show` el input está siempre en el DOM y lo único que cambia
   es su `display`, así que el `focus` del `nextTick` —que sigue siendo el mismo
   turno de tarea— sí lo levanta.

   Cuesta una instancia de vidrio de más en el árbol. Oculta no compone nada:
   `display: none` no pinta `backdrop-filter` y el ResizeObserver de la lente se
   sale solo al medir 0. */
function openSearch(evt) {
  closeMenu(false)
  searchTrigger.value = evt?.currentTarget || null
  searchOpen.value = true
  nextTick(() => {
    /* En escritorio el foco YA está donde tiene que estar —en la barra de la
       cabecera, que es quien acaba de abrir esto— y moverlo al campo de la
       ventana lo sacaría de debajo del cursor. En teléfono el del panel es el
       único campo que hay. */
    if (!isDeskSearch()) searchInput.value?.focus()
    /* Y la lente. Este panel vive con `v-show`, o sea que nace en
       `display: none` y ahi no hay nada que medir: su filtro se queda sin
       construir. Los observadores de la lente no lo rescatan de forma fiable
       —el de tamano y el de interseccion entregan dentro del ciclo de render—,
       asi que el unico que sabe con certeza que el panel acaba de mostrarse es
       quien lo muestra. Es aqui.

       Sintoma exacto cuando falta: el buscador se abre con velo y desenfoque
       pero SIN refraccion —se lee como cristal limpio— y la lente no aparece
       hasta que algo redimensiona la ventana y despierta al ResizeObserver. */
    searchGlass.value?.sync()
  })
}

function closeSearch(refocus = true) {
  if (!searchOpen.value) return
  searchOpen.value = false
  /* bajar el teclado a mano: si el input se queda con el foco, en Android sigue
     levantado sobre una barra que ya volvió a su sitio */
  searchInput.value?.blur()
  deskInput.value?.blur()
  kbInset.value = 0
  vvTop.value = 0
  /* En escritorio NO se devuelve el foco: el disparador es el propio campo de
     la barra, y enfocarlo dispara `@focus` y vuelve a abrir el panel. */
  if (refocus && !isDeskSearch()) nextTick(() => searchTrigger.value?.focus())
}

/* El filtrado es local y tonto — nombre y línea, sin acentos ni mayúsculas —
   porque el catálogo de hoy son dos entradas que llegan por prop. Cuando haya
   endpoint, lo que cambia es de dónde sale `catalog`, no esto. */
function norm(v) {
  return String(v || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

const results = computed(() => {
  const q = norm(query.value.trim())
  if (!q) return []
  return props.catalog.filter(p => norm(p.name + ' ' + p.line).includes(q))
})

function pickResult(p) {
  emit('search', { query: query.value.trim(), product: p })
  closeSearch()
}

function submitSearch() {
  const q = query.value.trim()
  if (!q) return
  emit('search', q)
  closeSearch()
}

function pickSuggestion(q) {
  query.value = q
  emit('search', q)
  closeSearch()
}

function closePanels() {
  closeMenu(false)
  closeSearch(false)
}

function onKey(e) {
  if (e.key !== 'Escape') return
  if (menuOpen.value && filterPath.value.length) { backFilters(); return }
  closeMenu()
  closeSearch()
}

/* ── el teclado ─────────────────────────────────────────────
   Con la barra ARRIBA el problema se encoge solo: el teclado sube desde abajo y
   ya no puede taparla. Quedan dos cosas, y ninguna es la de antes.

   `--av-kb` — cuánto del alto se come el teclado. Ya no empuja nada: sólo le
   recorta el techo al panel, que ahora crece hacia abajo y es lo único que
   puede llegar a chocar con él.

   `--av-vv` — iOS, además de encoger el viewport visual, lo DESPLAZA, y un
   `position: fixed` no se entera: la barra se va fuera de lo que el usuario ve.
   `visualViewport.offsetTop` es lo único que lo sabe, y sumándolo la barra se
   queda donde se la ve.

   Sin transición a propósito: el teclado ya trae la suya y una segunda encima
   se ve como que el panel lo persigue. */
const kbInset = ref(0)
const vvTop = ref(0)

function syncKeyboard() {
  const vv = window.visualViewport
  if (!vv || !searchOpen.value) { kbInset.value = 0; vvTop.value = 0; return }
  kbInset.value = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
  vvTop.value = Math.round(vv.offsetTop)
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.visualViewport?.addEventListener('resize', syncKeyboard)
  window.visualViewport?.addEventListener('scroll', syncKeyboard)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.visualViewport?.removeEventListener('resize', syncKeyboard)
  window.visualViewport?.removeEventListener('scroll', syncKeyboard)
})
</script>

<template>
  <!-- ── barra superior ──────────────────────────────────────────────────── -->
  <!-- Con un panel abierto desaparece, exactamente igual que la barra de
       teléfono y por dos motivos. El de siempre: mientras hay algo abierto no
       queda nada más que tocar. Y uno del material: el panel es `backdrop-filter`
       sobre todo lo que tiene debajo, así que una barra que siguiera ahí se
       vería refractada dentro del panel — vidrio detrás de vidrio, que es
       justo lo que el sistema no hace. -->
  <!-- Ya NO se esconde con el buscador abierto: en escritorio el buscador es
       una barra que vive DENTRO de esta cabecera, así que esconderla se llevaría
       por delante el campo donde se está escribiendo. En teléfono la cabecera no
       existe —`display: none`— y quien se esconde es `.av-bar`. -->
  <header class="av-nav">
    <!-- Marca y buscador van juntos, y por eso hay grupo: la cabecera es
         `space-between` con dos extremos, y el de la izquierda son estas dos
         piezas. -->
    <div class="av-nav__left">
      <!-- La marca, DENTRO de su panel circular. Estuvo suelta sobre el fondo
           un tiempo, apoyada en un halo propio; vuelve al vidrio para que en la
           cabecera no haya ninguna pieza con material distinto — todas heredan
           el mismo Velo negro y el mismo `--av-nav-h`.

           El recorte del rótulo es casi cuadrado, así que el círculo le corta
           las esquinas. Es a propósito y está aceptado: lo que importa es que
           la marca lea como parte del sistema. -->
      <GlassSurface
        :radius="999"
        tag="a"
        href="/"
        class="av-nav__brand"
        aria-label="20 Avenida — inicio"
        @click.prevent="emit('select', 'home')"
      >
        <!-- sin `size`: el alto lo pone `--av-mark-h`, que `.av-nav__brand` ata
             a `--av-nav-h`. Un número, no dos. -->
        <BrandMark />
      </GlassSurface>

      <!-- LA BARRA DE BÚSQUEDA — sólo escritorio y tableta. Aquí buscar no es un
           botón que abre una ventana: es un campo, siempre visible, y los
           resultados caen debajo con su mismo ancho. La ventana a pantalla
           completa se queda para el teléfono, donde sí tiene sentido porque no
           hay sitio para un desplegable.

           Va a la IZQUIERDA y no junto a los otros botones, y no es gusto: con
           la píldora centrada sobre la pantalla, el hueco de la derecha da 69 px
           a 1440 y 24 a 1280 — no cabe un campo de texto. El de la izquierda da
           265 y 215. Es el único sitio donde entra sin descentrar la píldora. -->
      <GlassSurface :radius="999" tag="form" class="av-nav__search" @submit.prevent="submitSearch">
        <span class="av-glyph av-nav__search-icon" aria-hidden="true">
          <Search :stroke-width="1.7" />
        </span>
        <input
          ref="deskInput"
          v-model="query"
          type="search"
          name="q"
          placeholder="Buscar"
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          enterkeyhint="search"
          aria-label="Buscar en la tienda"
          aria-controls="av-search"
          :aria-expanded="searchOpen"
          @focus="openSearch($event)"
        >
        <button
          v-if="query"
          type="button"
          class="av-nav__search-clear"
          aria-label="Borrar"
          @click="query = ''; deskInput?.focus()"
        >
          <span class="av-glyph"><X :stroke-width="2" /></span>
        </button>
      </GlassSurface>
    </div>

    <GlassSurface :radius="999" tag="nav" class="av-nav__pill" aria-label="Principal">
      <div class="av-nav__inner">
        <ul class="av-nav__links">
          <li v-for="item in items" :key="item.id">
            <a
              :href="item.to"
              class="av-nav__link"
              :class="{ 'is-active': item.id === active }"
              :aria-current="item.id === active ? 'page' : undefined"
              @click.prevent="emit('select', item.id)"
            >
              <span v-if="item.id === active" class="av-glass-sel" aria-hidden="true" />
              <!-- El icono va en su propio `<span class="av-glyph">`, NUNCA en
                   el `<a>`: `.av-glyph` lleva `filter: drop-shadow(...)` y un
                   ancestro con `filter` crea un backdrop root — la selección de
                   al lado se quedaría sin nada que refractar y dejaría de ser
                   vidrio. Como es HERMANO de `.av-glass-sel` y no su padre, no
                   la toca. -->
              <span v-if="item.icon" class="av-nav__icon av-glyph" aria-hidden="true">
                <component :is="item.icon" :stroke-width="1.7" />
              </span>
              {{ item.label }}
            </a>
          </li>
        </ul>
      </div>
    </GlassSurface>

    <!-- Las acciones sueltas: bolsa · favoritos · cuenta, cada una su propia
         `GlassSurface`. La lupa ya no está aquí — es la barra de la izquierda.

         El ⋯ tampoco, y es a propósito: el menú de tres puntos es una pieza de
         TELÉFONO. En escritorio los enlaces ya se ven enteros en la píldora del
         centro, así que un botón que los volviera a esconder sobraría. -->
    <div class="av-nav__actions">
      <GlassSurface
        v-for="a in actions"
        :key="a.id"
        :radius="999"
        class="av-nav__action"
      >
        <button type="button" :aria-label="a.label" @click="openAction(a.id)">
          <span class="av-glyph"><component :is="a.icon" :stroke-width="1.6" /></span>
          <span v-if="a.id === 'bag' && bag > 0" class="av-nav__badge av-glass-bubble">{{ bag }}</span>
        </button>
      </GlassSurface>

    </div>
  </header>

  <!-- ── la barra de móvil ─────────────────────────────
       UN solo panel: bolsa, favoritos, cuenta y el ⋯. El ⋯ es la última pieza
       de la misma barra y no un botón aparte — igual que el ☰ de una nav de
       escritorio vive dentro de la barra, no flotando al lado.

       El grupo existe para que el menú pueda anclarse al borde derecho del
       panel, que es donde está el ⋯ que lo abre. Sin él, un `right: 0` se iría
       al borde de la pantalla y el menú dejaría de salir de su botón.

       Con el menú abierto el panel se esconde con `visibility`, NO con
       `display`: así sale del árbol de accesibilidad igual —no hay botones
       invisibles que un lector anuncie— pero el grupo conserva su ancho, que es
       de lo que cuelga el menú. -->
  <!-- Con cualquiera de los dos paneles abiertos la barra desaparece: mientras
       hay algo abierto no queda nada más que tocar, y el panel ocupa su sitio
       en vez de convivir con ella. -->
  <div
    class="av-bar"
    :class="{ 'is-away': panelOpen }"
    :style="{ '--av-kb': kbInset + 'px', '--av-vv': vvTop + 'px' }"
  >
      <!-- Velo NEGRO, el de siempre. Se probó `variant="light"` aquí — velo
           blanco y glifos a tinta — y se descartó: la barra dejaba de leerse
           como parte del sistema. La variante se queda en `glass.css` para
           cuando haya botones que sí la quieran; ver docs/10-componentes.md. -->
      <GlassSurface :radius="999" tag="nav" class="av-bar__panel" aria-label="Acciones">
        <ul class="av-bar__list">
          <!-- Buscar va primero, como en cualquier tienda: es lo que hace el
               que ya sabe lo que quiere. No está en `actions` porque no emite
               `open` — abre su propio panel, igual que el ⋯. -->
          <li>
            <button
              type="button"
              class="av-bar__btn"
              aria-label="Buscar"
              aria-haspopup="true"
              aria-controls="av-search"
              :aria-expanded="searchOpen"
              @click="searchOpen ? closeSearch() : openSearch($event)"
            >
              <span class="av-glyph"><Search :stroke-width="1.7" /></span>
            </button>
          </li>

          <li v-for="a in actions" :key="a.id">
            <button
              type="button"
              class="av-bar__btn"
              :class="{ 'is-active': a.id === picked }"
              :aria-label="a.label"
              :aria-current="a.id === picked ? 'true' : undefined"
              @click="openAction(a.id)"
            >
              <span v-if="a.id === picked" class="av-glass-sel" aria-hidden="true" />
              <span class="av-glyph"><component :is="a.icon" :stroke-width="1.6" /></span>
              <span v-if="a.id === 'bag' && bag > 0" class="av-bar__badge av-glass-bubble">{{ bag }}</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              class="av-bar__btn"
              aria-label="Menú"
              aria-haspopup="true"
              aria-controls="av-menu"
              :aria-expanded="menuOpen"
              @click="menuOpen ? closeMenu() : openMenu($event)"
            >
              <span class="av-glyph"><MoreHorizontal :stroke-width="2" /></span>
            </button>
          </li>
        </ul>
      </GlassSurface>
  </div>

  <!-- ── el menú ──────────────────────────────────
       A PANTALLA COMPLETA, la misma caja que el buscador: `inset: 0`, sangre,
       `--lg-r: 0` y el mismo padding que esquiva notch y barra de gestos.

       Estuvo colgando de la esquina superior derecha, ceñido a su ítem más
       largo, y el ancho era el problema: los filtros bajan tres niveles y cada
       nivel añade sangría, así que «New Balance» dentro de Sneakers › Hombre
       partía en dos líneas en un panel de 244 px. Lo que hay dentro no es una
       lista corta de la que se elige de un vistazo: es un recorrido.

       Sin velo detrás que recoja el clic de fuera, porque ya no hay fuera. El
       cierre es la X de la cabecera — explícita y siempre en el mismo sitio. -->
  <GlassSurface
    v-show="menuOpen"
    ref="menuGlass"
    id="av-menu"
    class="av-menu"
    variant="panel"
    role="dialog"
    aria-modal="true"
    aria-label="Menú"
    :style="{ '--av-vv': vvTop + 'px' }"
  >
    <div class="av-menu__body">
      <!-- La cabecera es la del buscador con otro contenido: el nombre a la
           izquierda y la X a la derecha, a la misma altura y con la misma
           medida. Dos paneles hermanos no pueden cerrarse en sitios distintos.

           El nombre va a 13.5 en 500 como TODO lo demás del panel; lo que lo
           separa de una fila es sólo el color. -->
      <div class="av-menu__head">
        <p class="av-menu__heading">Menú</p>
        <button type="button" class="av-menu__close" aria-label="Cerrar" @click="closeMenu">
          <span class="av-glyph"><X :stroke-width="1.9" /></span>
        </button>
      </div>

      <!-- lo que NAVEGA: siempre completo y fuera del scroll — el usuario tiene
           que ver estas filas sin buscarlas, dure lo que dure el recorrido de
           filtros de debajo. -->
      <ul ref="menuList" class="av-menu__list av-menu__nav">
        <li v-for="item in items" :key="item.id">
          <a
            :href="item.to"
            class="av-menu__link"
            :class="{ 'is-active': item.id === active }"
            :aria-current="item.id === active ? 'page' : undefined"
            @click.prevent="pickLink(item.id)"
          >
            <span v-if="item.id === active" class="av-glass-sel" aria-hidden="true" />
            <span class="av-menu__icon av-glyph">
              <component :is="item.icon" v-if="item.icon" :stroke-width="1.7" />
            </span>
            {{ item.label }}
          </a>
        </li>
      </ul>

      <!-- los filtros: EXPLÍCITOS y con más alto que la navegación — son la
           parte que se explora, y explorar necesita sitio. Aquí viven Sneakers,
           Ropa y Accesorios: son por dónde se corta el catálogo, no destinos. -->
      <div v-if="filters.length" class="av-menu__filters">
        <div class="av-menu__section">
          <p class="av-menu__title">Filtros</p>
          <!-- Sale sólo cuando hay algo que limpiar, o sea cuando se ha bajado
               del primer nivel: en la raíz no habría a dónde volver. Ya no lleva
               burbuja de contador al lado — contaba filtros marcados, y aquí no
               se marca ninguno. -->
          <button
            v-if="filterPath.length"
            type="button"
            class="av-menu__clear"
            @click="clearFilters"
          >Limpiar</button>
        </div>

        <!-- UNA sola lista para el recorrido y para el nivel actual: son la
             misma columna, y partirla en dos `<ul>` le contaría a un lector de
             pantalla dos listas donde hay una. -->
        <ul class="av-menu__list av-menu__scroll">
          <!-- El recorrido: las ramas abiertas, una debajo de otra y cada una
               un poco más adentro. Tocarlas cierra esa rama y devuelve a su
               nivel — la misma fila abre y cierra. -->
          <li v-for="(node, i) in filterPath" :key="node.id">
            <button
              type="button"
              class="av-menu__link is-open"
              :style="{ '--av-depth': i }"
              aria-expanded="true"
              @click="collapseTo(i)"
            >
              <span class="av-menu__icon av-glyph">
                <component :is="node.icon" v-if="node.icon" :stroke-width="1.7" />
              </span>
              {{ node.label }}
              <ChevronDown class="av-menu__chev" :stroke-width="1.8" />
            </button>
          </li>

          <!-- Y las opciones del nivel en el que estamos, justo debajo de la
               rama que las abrió y un escalón más adentro que ella. Sus tías
               y sus primas no están: por eso se sabe siempre qué se está
               eligiendo.

               DOS etiquetas distintas, y no por capricho: una RAMA se despliega
               ahí mismo y no va a ninguna parte — `<button>` con `aria-expanded`.
               Una HOJA es el final del recorrido y LLEVA A TIENDA — `<a>` con su
               `href` de verdad, que es lo que hace que se pueda abrir en pestaña
               nueva y lo que un lector de pantalla anuncia como enlace. -->
          <li v-for="node in currentFilters" :key="node.id">
            <button
              v-if="node.children?.length"
              type="button"
              class="av-menu__link"
              :style="{ '--av-depth': filterPath.length }"
              aria-expanded="false"
              @click="openFilterNode(node)"
            >
              <span class="av-menu__icon av-glyph">
                <component :is="node.icon" v-if="node.icon" :stroke-width="1.7" />
              </span>
              {{ node.label }}
              <ChevronRight class="av-menu__chev" :stroke-width="1.8" />
            </button>
            <a
              v-else
              :href="shopHref(node)"
              class="av-menu__link"
              :style="{ '--av-depth': filterPath.length }"
              @click.prevent="pickFilter(node)"
            >
              <span class="av-menu__icon av-glyph">
                <component :is="node.icon" v-if="node.icon" :stroke-width="1.7" />
              </span>
              {{ node.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </GlassSurface>

  <!-- ── el buscador ────────────────────────────────────────────
       A pantalla completa y no colgando de la barra: buscar no es elegir de una
       lista corta, es una tarea con su propio sitio — se escribe, se mira, se
       compara. Un panel de 320 px no da para ver producto con foto.

       A SANGRE, sin bordes ni radio. Es la excepción del sistema y por eso se
       escribe: el resto de superficies dejan hueco para enseñar su esquina y su
       filo, pero buscar es una tarea que se come la pantalla — aquí el filo no
       tendría contra qué recortarse. El velo, la lente y el especular interior
       siguen siendo los mismos.

       Las TARJETAS de resultado van SÓLIDAS. No es una excepción ni una
       elección estética: es el §6 — el vidrio es de la capa que flota, y una
       lista de producto es capa de contenido. Encima, que el precio se lea no
       puede depender de la foto que pase por detrás.

       `v-show` y no `v-if` — ver la nota del script: es lo que hace que el
       teclado suba en iOS. -->
  <!-- Recoge el clic de fuera y sólo existe en escritorio: la ventana de
       teléfono se come la pantalla y no tiene «fuera». Transparente — oscurecer
       sería inventar una capa que el sistema no tiene. -->
  <div v-if="searchOpen" class="av-search__scrim" aria-hidden="true" @click="closeSearch" />

  <GlassSurface
    ref="searchGlass"
    v-show="searchOpen"
    id="av-search"
    class="av-search"
    variant="panel"
    role="dialog"
    aria-modal="true"
    aria-label="Buscar"
    :style="{ '--av-kb': kbInset + 'px', '--av-vv': vvTop + 'px' }"
  >
    <div class="av-search__body">
      <div class="av-search__head">
        <form class="av-search__field" @submit.prevent="submitSearch">
          <span class="av-glyph av-search__icon"><Search :stroke-width="1.8" /></span>
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            name="q"
            placeholder="Buscar"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
            enterkeyhint="search"
            aria-label="Buscar en la tienda"
          >
          <button
            v-if="query"
            type="button"
            class="av-search__clear"
            aria-label="Borrar"
            @click="query = ''; searchInput?.focus()"
          >
            <span class="av-glyph"><X :stroke-width="2" /></span>
          </button>
        </form>

        <button type="button" class="av-search__close" aria-label="Cerrar" @click="closeSearch">
          <span class="av-glyph"><X :stroke-width="1.9" /></span>
        </button>
      </div>

      <div class="av-search__scroll">
        <!-- sin escribir nada: las sugerencias. PLACEHOLDER hasta que haya
             endpoint — hoy son literales que llegan por prop. -->
        <template v-if="!query.trim()">
          <p v-if="suggestions.length" class="av-search__title">Sugerencias</p>
          <ul v-if="suggestions.length" class="av-search__sugs">
            <li v-for="q in suggestions" :key="q">
              <button type="button" class="av-search__sug" @click="pickSuggestion(q)">
                <span class="av-glyph av-search__icon"><Search :stroke-width="1.6" /></span>
                {{ q }}
              </button>
            </li>
          </ul>
        </template>

        <template v-else>
          <p class="av-search__title">Resultados</p>

          <ul v-if="results.length" class="av-search__results">
            <li v-for="p in results" :key="p.id">
              <!-- VIDRIO, y con el velo NEGRO de siempre — sin variante. Se
                   probó `light` (velo blanco, tinta negra) y se descartó
                   mirándolo: el texto en negro se leía peor. Con el velo negro
                   el contenido vuelve a ser blanco solo, porque los
                   `--av-on-glass-*` de la base ya son claros: la ficha no
                   escribe ni un color, cambia de material y el texto la sigue. -->
              <GlassSurface
                tag="button"
                type="button"
                variant="light"
                class="av-card"
                @click="pickResult(p)"
              >
                <span class="av-card__shot">
                  <img v-if="p.image" :src="p.image" :alt="p.name" loading="lazy" decoding="async">
                </span>
                <span class="av-card__text">
                  <span class="av-card__line">{{ p.line }}</span>
                  <span class="av-card__name">{{ p.name }}</span>
                  <span class="av-card__prices">
                    <b>{{ p.price }}</b>
                    <s v-if="p.priceWas">{{ p.priceWas }}</s>
                    <em v-if="p.discount">{{ p.discount }}</em>
                  </span>
                </span>
                <ChevronRight class="av-card__chev" :stroke-width="1.7" />
              </GlassSurface>
            </li>
          </ul>

          <p v-else class="av-search__empty">Nada para «{{ query.trim() }}».</p>

          <button v-if="results.length" type="button" class="av-search__all" @click="submitSearch">
            Ver todos los resultados
            <ArrowRight :stroke-width="1.8" />
          </button>
        </template>
      </div>
    </div>
  </GlassSurface>
</template>

<style scoped>
/* fixed, no sticky: sticky depende de que ningún ancestro tenga overflow, y en
   una tienda ese ancestro aparece tarde o temprano */
.av-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  /* Flex y no rejilla, porque la píldora ya no vive en una columna: va
     ABSOLUTA y centrada sobre la pantalla — ver `.av-nav__pill`. Aquí sólo
     quedan la marca y las acciones, una a cada extremo. */
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* Fluido y atado a los dos extremos, igual que el relleno de los enlaces:
     16 a 1440, 10 a 1024. Son seis píxeles que la píldora necesita justo en el
     corte y que arriba no se echan de menos.

     NO es `--av-nav-gap` — ese token también fija dónde se posa la barra y el
     padding de los paneles, y ahí no se toca nada. */
  /* Los dos salen de `tokens.css`: el desplegable del buscador es hermano de
     esta cabecera y necesita la misma cuenta para caer bajo la barra. */
  gap: var(--av-nav-lgap);
  padding: var(--av-nav-gap) var(--av-nav-pad);
  pointer-events: none;    /* el hueco entre piezas deja pasar el cursor */
}
.av-nav > * { pointer-events: auto; }
/* Marca y buscador, pegados. El hueco es el mismo `--av-nav-lgap` que separa
   los dos grupos de la cabecera, y tiene que serlo: es el número del que sale
   `--av-search-x`, o sea dónde cae el desplegable. */
.av-nav__left {
  display: flex;
  align-items: center;
  gap: var(--av-nav-lgap);
  min-width: 0;
}

/* ── la barra de búsqueda de escritorio ───────────────────────────────────
   Un campo, no un botón. Mide `--av-search-w`, el mismo ancho con el que cae
   el panel de resultados debajo. */
.av-nav__search {
  width: var(--av-search-w);
  height: var(--av-nav-h);
  flex: none;
}
/* La fila va en `__body` y no en la raíz — la raíz la ocupan las cuatro capas
   del material, que son `absolute`. Puesto arriba, el icono y la X se salían
   del campo por encima y por debajo. Es el mismo tropiezo que la ficha. */
.av-nav__search > :deep(.av-glass__body) {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 100%;
  padding: 0 16px;
}
.av-nav__search-icon { flex: none; }
.av-nav__search-icon :deep(svg) { width: 17px; height: 17px; }
.av-nav__search input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: none;
  outline: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.005em;
  color: var(--av-on-glass-strong);
}
.av-nav__search input::placeholder { color: var(--av-on-glass); }
.av-nav__search input::-webkit-search-cancel-button { display: none; }
.av-nav__search-clear {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex: none;
  border: 0;
  border-radius: 50%;
  background: none;
  padding: 0;
  cursor: pointer;
}
.av-nav__search-clear :deep(svg) { width: 14px; height: 14px; }

.av-nav__action {
  width: var(--av-nav-h);
  height: var(--av-nav-h);
  flex: none;
}
/* La marca, en su panel circular: mismo material y mismo alto que todo lo demás
   de la cabecera. Un número, no dos que haya que acordarse de mover a la vez. */
.av-nav__brand {
  width: var(--av-nav-h);
  height: var(--av-nav-h);
  flex: none;
}
/* El rótulo va MÁS PEQUEÑO que el círculo, no a ras: al 60% del alto quedan
   unos 11 px de aire a los lados y 4 en las esquinas, así que se ve que hay una
   burbuja y no un icono recortado. El recorte es casi cuadrado y su diagonal es
   lo que manda — a partir del 68% las esquinas empiezan a tocar el filo.

   El `overflow: hidden` se queda de red: hoy no recorta nada, pero si algún día
   entra un asset más alto no se saldrá de la burbuja. */
.av-nav__brand {
  --av-mark-h: calc(var(--av-nav-h) * .60);
}
.av-nav__brand > :deep(.av-glass__body) {
  display: grid;
  place-items: center;
  height: 100%;
  overflow: hidden;
}
/* CENTRADA SOBRE LA PANTALLA, no sobre el hueco que le dejan los vecinos.
   Estaba en la columna de en medio de una rejilla `auto 1fr auto` con
   `justify-self: center`, y esa columna NO está centrada: arranca después de la
   marca (58 px) y termina antes de las acciones (250). Su centro caía en 616 de
   1425 cuando el de la pantalla está en 712 — 96 px corrida a la izquierda, que
   es justo lo que se veía.

   `1fr auto 1fr` habría centrado la columna, pero un `1fr` no baja de su
   contenido: a 1024 las dos columnas laterales pedirían 250 cada una y la fila
   se desbordaría. Sacarla del flujo es lo único que centra de verdad sin
   reservar a los lados un sitio que no hay.

   El precio está en `@media`: fuera del flujo, la píldora ya no empuja a nadie,
   así que el solape hay que impedirlo con el ancho mínimo de la disposición.
   Ver la nota del corte más abajo. */
.av-nav__pill {
  position: absolute;
  left: 50%;
  top: var(--av-nav-top);
  transform: translateX(-50%);
  height: var(--av-nav-h);
}

.av-nav__pill > :deep(.av-glass__body) { height: 100%; }
/* `--av-nav-air` es el aire alrededor de la SELECCIÓN, y es UN número para los
   cuatro lados:

     · arriba y abajo   el enlace mide `--av-nav-h` menos dos veces el aire
     · a los lados      la píldora reserva ese aire de relleno interior, y entre
                        dos enlaces va el DOBLE, para que a cada selección le
                        toque lo mismo contra su vecina que contra el borde

   Antes eran tres números sin relación —13 de relleno vertical, 2 de hueco y 9
   de relleno de la píldora— y la selección quedaba a 4.5 px del filo de arriba
   y a 1 px de su vecina. */
.av-nav__inner {
  --av-nav-air: 5px;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 var(--av-nav-air);
}

.av-nav__links {
  display: flex;
  align-items: center;
  gap: calc(var(--av-nav-air) * 2);
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* el texto sobre vidrio va al mismo 72% que el glifo: es el mismo "medio
   iluminado".

   Sirve tanto para `<a>` (Inicio, Nosotros) como para `<button>` (Sneakers,
   Ropa, Accesorios — abren el desplegable, no navegan): de ahí `border: 0`,
   `background: none` y `font: inherit`, que un enlace no necesita pero un
   botón sí, y que no le hacen nada a un enlace por tenerlos de más. */
.av-nav__link {
  position: relative;
  display: flex;
  align-items: center;
  /* Relleno y hueco FLUIDOS, lo único de la píldora que lo es, y con la recta
     ATADA A LOS DOS EXTREMOS en vez de a un `vw` suelto:

       1440 → 20 px de relleno y 8 de hueco   (el ancho de referencia, intacto)
       1024 → 10 px y 6                       (el corte, donde justo cabe)

     De ahí los `2.4vw - 14.6px` y `1.2vw - 7.3px`: son la recta que pasa por
     esos dos puntos. Con un `1.4vw` limpio el relleno valía 14.3 a 1024 y la
     píldora se pasaba 27 px — el `clamp` mide el ANCHO DE LA VENTANA, no el
     hueco que le queda a la píldora, así que hay que apuntarlo a mano.

     Sin esto se recorta «Cuenta»: los enlaces son `nowrap` y la píldora vive en
     una columna `minmax(0, 1fr)`, así que al no caber no se encogen — se salen. */
  gap: clamp(6px, 1.2vw - 7.3px, 8px);
  /* El alto sale del AIRE, no de un relleno vertical: así la selección deja
     exactamente `--av-nav-air` arriba y abajo, sin depender de la altura de
     línea de la fuente. Y el relleno lateral bajó de 20 a 17 porque los huecos
     entre enlaces pasaron de 2 a 10 px: ese ancho hay que sacarlo de algún
     sitio o la píldora se come a los botones de la derecha. */
  height: calc(var(--av-nav-h) - var(--av-nav-air) * 2);
  padding-block: 0;
  /* 17 a 1440, 11 a 1280 — la recta que pasa por los dos. La pendiente es
     empinada a propósito: la píldora va centrada, así que su ancho se paga a
     los DOS lados, y el lado corto es ahora el izquierdo, donde viven la marca
     y la barra de búsqueda. En 160 px de ventana hay que soltar 72 px de
     píldora para que no alcance a la barra. */
  padding-inline: clamp(10px, 1.25vw - 6px, 12px);
  border: 0;
  border-radius: 999px;
  background: none;
  font: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: .005em;
  white-space: nowrap;
  color: var(--av-on-glass);
  text-decoration: none;
  cursor: pointer;
  transition: color .2s ease, background-color .2s ease;
}
.av-nav__link:hover { color: var(--av-on-glass-strong); background: var(--av-on-glass-hover); }

/* 16 y no los 21 del glifo de un botón de acción: allí el icono ES el botón,
   aquí acompaña a una letra de 13.5 y tiene que pesar menos que ella. `flex:
   none` porque un icono que se encoge dentro de un flex apretado deja de ser el
   mismo icono en cada enlace. */
.av-nav__icon { flex: none; }
.av-nav__icon :deep(svg) { width: 16px; height: 16px; }

/* El activo NO es un relleno sólido: lleva `.av-glass-sel`, que vuelve a
   frostar lo que hay detrás — ahora con el amarillo de marca — y queda como un
   panel cálido más claro que el velo.

   Y el texto del activo NO cambia: ni de color ni de grosor. Lo que marca la
   selección es el panel, y sólo el panel. */
.av-nav__link.is-active { color: var(--av-on-glass); }
.av-nav__link.is-active:hover { background: none; color: var(--av-on-glass); }

.av-nav__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  /* La misma recta: 10 a 1440, 6 a 1024. */
  gap: clamp(6px, .96vw - 3.9px, 10px);
}
/* `.av-glyph` va en un span alrededor del icono, NUNCA en el botón: la clase
   lleva `filter: drop-shadow(...)` y un ancestro con `filter` crea un backdrop
   root — el `backdrop-filter` de la burbuja y el de la selección se quedarían
   sin nada que refractar y dejarían de ser vidrio. */
.av-glyph { display: grid; place-items: center; }

.av-nav__action > :deep(.av-glass__body) { height: 100%; }
.av-nav__action button {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}

/* el amarillo de marca no se usa como fondo de página, pero sí como acento
   corto: aquí es exactamente eso, y en vidrio */
.av-nav__badge,
.av-bar__badge {
  position: absolute;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: var(--av-ink);
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  filter: none;          /* la burbuja no lleva el halo del glifo */
  opacity: 1;
}
.av-nav__badge { top: 12px; right: 10px; }
.av-bar__badge { top: 4px; right: 2px; }

/* ── la barra de móvil ────────────────────────────────────────
   No existe en escritorio. En móvil es la única barra que hay: las
   acciones + el ⋯, dos piezas separadas por un hueco.

   El posicionamiento lo lleva el CONTENEDOR y no cada pieza — así el ⋯ no
   puede pisar al panel cuando la pantalla se estrecha, que es justo lo que pasa
   a 375 px si uno se centra y el otro se ancla a la derecha. */
/* Sólo la BARRA se apaga en escritorio. El menú NO: es la misma pieza en los
   dos anchos y quien decide si se ve es `v-show`, igual que en el buscador. */
.av-bar { display: none; }
.av-bar__list {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  margin: 0;
  padding: 0 8px;
  list-style: none;
}
.av-bar__btn {
  position: relative;
  display: grid;
  place-items: center;
  /* 56 y no 64: con buscar y el ⋯ dentro son CINCO piezas, y a 64 el panel se
     iba a 360 px — en un 375 quedaban 7 px de margen a cada lado. A 56 la barra
     mide 320 y respira en los tres teléfonos. Sigue muy por encima de los 44
     de un objetivo táctil. */
  width: 56px;
  /* menos 10 y no menos 14: con la barra a 55 esto da 45 px y el objetivo
     táctil sigue por encima de los 44. A menos-14 caía a 41. */
  height: calc(var(--av-nav-h) - 10px);
  border: 0;
  border-radius: 999px;
  background: none;
  padding: 0;
  cursor: pointer;
}

/* El corte entre las dos disposiciones. Ha subido dos veces y las dos por lo
   mismo: lo que la píldora pide creció.

     900   → sólo texto, y la píldora se centraba en el hueco libre.
     1023  → entran los iconos: +143 px de píldora.
     1279  → la píldora se centra en la PANTALLA, no en el hueco.

   El último es el que manda ahora y no es un número a ojo. Centrada de verdad,
   la píldora reparte su ancho a los dos lados del centro, y el lado corto es el
   de las acciones: necesita `ancho/2 + acciones + hueco + margen ≤ mitad de la
   pantalla`. Medido, lo que le sobra al borde derecho:

     1024 → −60    1100 → −37    1180 → −14
     1280 → +15    1366 → +43    1440 → +68

   O sea que por debajo de ~1240 la píldora se mete debajo de los botones. Y no
   se arregla apretando: quitar margen lateral da 15 px y bajar los botones a 48
   otros 28 — 43 de los 60 que faltan, y encima rompería el alto único de la
   barra.

   Lo que sí lo arreglaría es una píldora más corta: con cuatro enlaces en vez
   de seis sobran ~115 px y el corte podría volver a 1024. Es una decisión de
   contenido, no de CSS.

   Por debajo queda la barra de teléfono, que es una disposición completa y ya
   aprobada — no un escritorio recortado. */
@media (max-width: 1279px) {
  /* La barra de arriba desaparece ENTERA — marca, píldora y acciones. En
     teléfono hay una sola barra, arriba igual que en escritorio. Los enlaces y
     los filtros se van al menú del ⋯. */
  .av-nav { display: none; }

  .av-bar {
    display: flex;
    justify-content: center;
    position: fixed;
    z-index: 50;
    left: 0;
    right: 0;
    /* El mismo token del que sale `--av-nav-space`, que es el hueco que el
       contenido reserva arriba. Uno solo: la barra no puede desalinearse del
       hueco que reserva.

       `--av-vv` lo escribe el script y vale 0 salvo cuando iOS desplaza el
       viewport visual al subir el teclado. Sin él la barra se iría fuera de lo
       que el usuario ve, porque un `fixed` no se entera de ese desplazamiento. */
    top: calc(var(--av-nav-top) + var(--av-vv, 0px));
    height: var(--av-nav-h);
    pointer-events: none;    /* el hueco a los lados deja pasar el cursor */
  }
  .av-bar > * { pointer-events: auto; }
  /* Con `visibility` y no `display` porque sale igual del árbol de
     accesibilidad — nada de botones invisibles que un lector siga anunciando —
     y no obliga a recalcular el hueco que la barra reserva. */
  .av-bar.is-away { visibility: hidden; }

  .av-bar__panel { height: 100%; }
}

/* ── el menú ────────────────────────
   FUERA del `@media`, igual que el buscador y por el mismo motivo: quien
   decide si se ve es `v-show`, no el ancho de la ventana.

   Estuvo dentro del bloque de teléfono, y eso hacía que el material de PANEL
   —el de la lente ancha, el que de verdad se dobla— existiera sólo por debajo
   de 900 px. Escritorio y tableta se quedaban con las píldoras de la barra,
   donde el tope recorta la lente al 34% del lado corto y de los 80 px de la
   variante no queda nada. No era una diferencia de tamaño: era otro material.
   Sacándolo de aquí los tres anchos abren la MISMA superficie, con la misma
   deformación, porque es literalmente el mismo elemento.

   A PANTALLA COMPLETA — la misma caja que el buscador. La CAJA se repite
   aquí (`inset`, `z-index`, `display`) porque son dos paneles que hoy
   coinciden, no uno con dos nombres. El MATERIAL no: ése lo piden los dos por
   nombre con `variant="panel"` y vive en `glass.css`, porque un material
   copiado a mano en dos sitios deja de estar estandarizado en cuanto alguien
   toca uno solo.

   Antes colgaba de la esquina superior derecha, con `width: max-content` y un
   suelo de 244 px. Cayó por el ancho: con el recorrido de filtros cada nivel
   mete sangría, y «New Balance» dentro de Sneakers › Hombre ya no cabía en
   una línea.

   Con `inset: 0` se va también todo el cálculo de altura que vivía aquí: el
   `height: calc(100dvh - ...)` estaba para estirar un panel que no llegaba al
   suelo. Uno que sí llega no lo necesita.

   Y se va el velo de fuera: ya no hay fuera. El cierre es la X de la
   cabecera. */
.av-menu {
  position: fixed;
  inset: 0;
  z-index: 55;
  display: flex;
  /* `inset: 0` deja fuera la barra de scroll de la página: un `fixed` se mide
     contra el bloque contenedor inicial, que en escritorio es 15 px más
     estrecho que la ventana, y esos 15 px de página asomando por la derecha son
     el «margen» que se veía. `100vw` SÍ incluye la barra, así que el panel la
     tapa y llega al borde físico. No provoca scroll horizontal: un `fixed` no
     cuenta para el desbordamiento del documento. */
  width: 100vw;

  /* La misma caja que el buscador. El material también, y ahora se ve que lo
     es: los dos piden `variant="panel"` en vez de repetir sus tokens. */
}
/* `>`, por lo mismo que en `.av-search`: el selector descendiente alcanzaba al
   cuerpo de cualquier vidrio anidado. */
.av-menu > :deep(.av-glass__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;   /* sin esto un hijo con scroll no deja encoger al padre */
  min-width: 0;    /* y sin esto no encoge en el otro eje — ver `.av-search` */
}
/* `flex: 1` es lo que le falta a un hijo único de un flex column para
   estirarse a la altura del padre — sin esto el panel medía 812 px pero el
   cuerpo se quedaba en lo que sus hijos pidieran, y los filtros nunca veían
   el alto que `.av-menu` les había dado. */
.av-menu__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  /* El MISMO padding del buscador, hasta la última variable: los dos llegan
     al borde físico, así que lo que esquiva el notch, la barra de gestos y el
     desplazamiento del viewport visual de iOS es esto y sólo esto. */
  padding:
    calc(var(--av-nav-top) + var(--av-vv, 0px))
    var(--av-nav-gap)
    calc(var(--av-nav-gap) + env(safe-area-inset-bottom, 0px));
}

/* La cabecera: el nombre y la X. Repite la del buscador en alto y en medidas
   porque es la misma pieza haciendo lo mismo — dos paneles hermanos no pueden
   cerrarse en sitios distintos. */
.av-menu__head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
  padding-bottom: 14px;
}
/* 13.5 como todo lo demás del panel, y en el MISMO peso — 500, el único que
   hay en todo el sistema desde que se quitó la negrita de en medio. Lo que
   lo separa de una fila es sólo el COLOR: blanco puro contra el 72% de una
   opción. Y sin versales: primera mayúscula y el resto minúsculas. */
.av-menu__heading {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.005em;
  color: var(--av-on-glass-strong);
}
.av-menu__close {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  margin-left: auto;
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
}
.av-menu__close :deep(svg) { width: 22px; height: 22px; }

/* Lo que navega NO scrollea y NO se encoge: `flex: none` de sobra porque
   nadie le pide que crezca, pero lo digo aquí porque es la regla — estas
   filas tienen que verse enteras siempre, pase lo que pase con los filtros. */
.av-menu__nav { flex: none; }

/* Los filtros se llevan lo que sobra: `flex: 1` es lo que hace que tengan
   «mayor proporción de altura» sin escribir un número fijo que se desajuste
   en cada teléfono. Column para que la cabecera se quede quieta y sólo la
   lista de debajo scrollee. */
.av-menu__filters {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.av-menu__list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Sólo la lista de filtros scrollea, y sólo cuando la rama actual no cabe
   — con 3 o 4 hermanos no hace falta, pero un teléfono en horizontal tiene
   poco alto y ahí sí entra en juego. */
.av-menu__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;   /* el scroll no se contagia a la página */
  scrollbar-width: none;
}
.av-menu__scroll::-webkit-scrollbar { display: none; }

/* Mismo 72% que el glifo: sobre el velo el texto no cambia de tono por estar
   en otro sitio.

   LA LETRA A 13.5 px — el tamaño único de todo el texto de menú, títulos
   incluidos — y con ella lo demás a la misma proporción — icono, hueco y
   relleno suben todos junto con el texto, porque una fila no puede tener una
   letra grande y un icono que se quedó gritando el tamaño de antes.

   El ALTO no sube con lo demás, y es la única pieza que no escala: 44 px es
   el mínimo de un objetivo táctil y ya sobraba de margen a 10.5 px, así que
   a 13.5 sigue sobrando — no hace falta pedirle más al pulgar. Sirve también
   para `<button>` (cada fila de filtro lo es), de ahí `border`, `background`,
   `font` y `text-align`: cosas que un `<a>` no necesita pero un botón sí.

   `--av-depth` es el nivel de la fila dentro del recorrido, y lo escribe la
   plantilla. Sangra 15 px por nivel: bastante para que se lea de un vistazo
   de quién cuelga cada fila, poco para que a tres niveles el texto no se haya
   ido a la mitad de la pantalla. Va en el padding y no en un margen para que
   el fondo del `:hover` y el panel del seleccionado sigan llegando al borde
   de la fila — lo que se sangra es el texto, no la fila. */
.av-menu__link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 44px;
  padding: 0 13px 0 calc(13px + var(--av-depth, 0) * 15px);
  border: 0;
  border-radius: var(--lg-r-base);
  background: none;
  font: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.005em;
  white-space: nowrap;
  color: var(--av-on-glass);
  text-decoration: none;
  text-align: left;
  cursor: pointer;
}
/* El icono reserva su hueco aunque no haya icono: así las etiquetas quedan en
   la misma columna con `items` de fuera que no traigan ninguno. */
.av-menu__icon { width: 18px; flex: none; }
.av-menu__icon :deep(svg) { width: 18px; height: 18px; }

/* El activo lleva `.av-glass-sel`, igual que la píldora de escritorio, y el
   texto NO cambia: lo que marca la selección es el panel y sólo el panel. Es
   la misma excepción de 01-velo-negro.md §7 aplicada al mismo caso — el ítem
   activo de una navegación. */
.av-menu__link.is-active { color: var(--av-on-glass); }

/* Una rama ABIERTA — una fila del recorrido. Sin negrita, como todo lo
   demás: se distingue por el CHEVRON mirando hacia abajo y por el COLOR —
   blanco puro, porque es dónde está el usuario, no una opción más de la
   lista — nunca por el peso ni por el cuerpo de la letra. */
.av-menu__link.is-open {
  color: var(--av-on-glass-strong);
}
.av-menu__link.is-open .av-menu__chev { opacity: .8; }

/* la rama lleva el chevron pegado al borde derecho de su propia fila, no del
   panel — el `margin-left: auto` empuja dentro del botón, no fuera de él */
.av-menu__chev {
  margin-left: auto;
  width: 15px;
  height: 15px;
  flex: none;
  opacity: .5;
}

/* ── la sección de filtros ────────────────────────────────────
   Un filo de luz la separa del menú — no una caja: encajonarla dentro del
   panel sería dibujar una superficie sobre otra, y aquí no hay dos
   superficies, hay dos cosas dentro de la misma. */
.av-menu__section {
  display: flex;
  align-items: center;
  gap: 7px;
  flex: none;
  margin: 8px 0 5px;
  /* Sin relleno lateral: «Filtros» tiene que arrancar EXACTAMENTE donde
     arranca «Menú», y los dos cuelgan ya del padding de `__body`. Tenía 10 px
     de más y se notaban — dos títulos del mismo panel con dos márgenes
     distintos se ven torcidos aunque nadie sepa decir por qué.

     Las FILAS sí van 13 px más adentro, y no es incoherencia: una fila tiene
     fondo al pasar por encima y ese fondo necesita respirar por dentro. Un
     título no tiene caja. */
  padding: 10px 0 0;
  border-top: 1px solid var(--av-on-glass-hair);
}
/* Ya no hay botón de volver: la fila del recorrido abre y cierra su propia
   rama, así que el camino de vuelta está donde estaba el de ida. Un botón
   aparte era una segunda forma de hacer lo mismo, y la peor de las dos — no
   decía a qué nivel volvía.

   Y el título ya no cambia: dice «Filtros» siempre. Dónde estás lo dice el
   recorrido de debajo, que es donde está pasando. */
.av-menu__title {
  margin: 0;
  /* MISMO tamaño y MISMO peso que `.av-menu__link` — 13.5 en 500, sin
     excepción: nada de negrita en el sistema. Lo que lo distingue de una
     fila es sólo el COLOR — blanco puro contra el 72%. */
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.005em;
  color: var(--av-on-glass-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* MISMO color que el título al que acompaña — blanco puro, no el 72% de una
   fila: están en la misma línea y a dos tonos parecía que uno de los dos se
   había apagado. Ya no hay diferencia de peso con el título — los dos en 500,
   como todo el panel —, así que lo que dice que «Limpiar» se puede tocar es
   sólo el SUBRAYADO. */
.av-menu__clear {
  margin-left: auto;
  flex: none;
  border: 0;
  background: none;
  padding: 2px 0;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.005em;
  color: var(--av-on-glass-strong);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

/* ══ el buscador ─ ventana emergente a sangre ════════════════════════
   Fuera del `@media` a propósito: quien decide si se ve es `v-show`, no el
   ancho. Cuando el escritorio tenga su botón de buscar, esto ya funciona.

   PANTALLA COMPLETA, sin bordes ni radio, y es la única superficie del sistema
   que lo hace. El resto dejan hueco para enseñar su esquina y su filo; buscar
   se come la pantalla y ahí el filo no tendría contra qué recortarse. Velo,
   lente y especular interior siguen siendo los mismos — lo único que cambia es
   el radio, que es justo lo que el material expone.

   Como la caja llega al borde físico, lo que esquiva el notch, la barra de
   gestos, el teclado y el desplazamiento del viewport visual es el PADDING. */
.av-search {
  position: fixed;
  inset: 0;
  z-index: 58;
  display: flex;
  /* `inset: 0` deja fuera la barra de scroll de la página: un `fixed` se mide
     contra el bloque contenedor inicial, que en escritorio es 15 px más
     estrecho que la ventana, y esos 15 px de página asomando por la derecha son
     el «margen» que se veía. `100vw` SÍ incluye la barra, así que el panel la
     tapa y llega al borde físico. No provoca scroll horizontal: un `fixed` no
     cuenta para el desbordamiento del documento. */
  width: 100vw;

  /* A SANGRE: `inset: 0`, sin bordes, sin radio. Toda la pantalla.

     El MATERIAL de este panel ya no se escribe aquí: lo pide por nombre con
     `variant="panel"` y vive en `glass.css`. Estuvieron los tres tokens
     copiados a mano en este bloque Y en el del menú, con la única garantía de
     que alguien se acordara de tocar los dos a la vez. */
}
/* `>` y NO descendiente, y esto costó un rato: dentro del panel hay OTRA
   `GlassSurface` —la ficha de resultado— y `.av-search .av-glass__body` también
   alcanzaba a la suya. La ficha heredaba `flex-direction: column` del buscador
   y se pintaba en columna: la foto arriba, el texto debajo y el chevron al
   final, centrados. Cada superficie manda sobre SU cuerpo y sobre ninguno más. */
.av-search > :deep(.av-glass__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  /* `min-width: 0` por lo mismo que el `min-height`, pero en el otro eje: el
     panel es un flex en FILA y su cuerpo es el ítem, así que con el `auto` de
     por defecto no puede encoger por debajo del contenido más ancho que tenga
     dentro. Con el panel a sangre (375) nunca se notó porque sobraba sitio; al
     flotar (343) el cuerpo se quedaba en 370 y las tarjetas de resultado
     sobresalían por el filo derecho. */
  min-width: 0;
}
.av-search__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  /* La caja llega al borde FÍSICO, así que lo que esquiva el notch, la barra de
     gestos, el teclado y el desplazamiento del viewport visual de iOS es este
     padding y sólo él. */
  padding:
    calc(var(--av-nav-top) + var(--av-vv, 0px))
    var(--av-nav-gap)
    calc(var(--av-nav-gap) + env(safe-area-inset-bottom, 0px) + var(--av-kb, 0px));
}

.av-search__head { display: flex; align-items: center; gap: 10px; }

/* El campo lleva relleno SÓLIDO, no otra capa de vidrio: es exactamente lo que
   manda el §6 para lo que va encima del material. Un `rgba` plano no refracta
   nada, así que no compite con el panel que lo sostiene. */
.av-search__field {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  height: 46px;
  padding: 0 12px;
  /* El mismo radio que el material — `--lg-r`, la base. La regla del sistema
     es que lo redondeado sea siempre lo mismo, y esto es lo primero que se
     compara con el vidrio porque va encima de él. */
  border-radius: var(--lg-r-base);
  background: var(--av-on-glass-hover);
}
.av-search__icon { flex: none; }
.av-search__icon :deep(svg) { width: 18px; height: 18px; }

/* El texto que el usuario escribe sube a blanco puro: es lo único del diálogo
   que ha puesto él, y tiene que despegarse del marcador de posición, que se
   queda en el 72% de siempre.

   A 13.5, como todo el sistema — se decidió así aun sabiendo el coste: por
   debajo de 16px iOS hace zoom sobre toda la página al enfocar el campo. Es un
   zoom que se puede deshacer a mano, y se prefirió eso a que el input rompiera
   la única regla de tamaño que tiene el componente. */
.av-search__field input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: none;
  outline: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.005em;
  color: var(--av-on-glass-strong);
}
.av-search__field input::placeholder { color: var(--av-on-glass); }
/* la X nativa de `type=search` sobra: ya hay una, y la de Chrome es negra */
.av-search__field input::-webkit-search-cancel-button { display: none; }

.av-search__clear,
.av-search__close {
  display: grid;
  place-items: center;
  flex: none;
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
}
.av-search__clear { width: 26px; height: 26px; border-radius: 50%; }
.av-search__clear :deep(svg) { width: 16px; height: 16px; }
.av-search__close { width: 40px; height: 40px; }
.av-search__close :deep(svg) { width: 22px; height: 22px; }

/* lo único que scrollea es la lista; la cabecera se queda */
.av-search__scroll {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  padding-top: 18px;
}
.av-search__scroll::-webkit-scrollbar { display: none; }

/* Mismo papel que `.av-menu__title` y por tanto mismo tamaño y mismo peso:
   13.5 en 500, el único cuerpo y el único peso que hay en los dos paneles. Lo
   que lo separa de una fila es el COLOR — nada de negrita, nada de versales. */
.av-search__title {
  margin: 0 0 10px;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.005em;
  color: var(--av-on-glass-strong);
}

.av-search__sugs,
.av-search__results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.av-search__sugs { gap: 1px; }

.av-search__sug {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--lg-r-base);
  background: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.01em;
  text-align: left;
  color: var(--av-on-glass);
  cursor: pointer;
}

.av-search__empty {
  margin: 0;
  font-size: 13.5px;
  color: var(--av-on-glass);
}

.av-search__all {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 18px 0 0 auto;
  border: 0;
  background: none;
  padding: 6px 2px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.01em;
  color: var(--av-on-glass-strong);
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}
.av-search__all :deep(svg) { width: 16px; height: 16px; }

/* ── la tarjeta de resultado ──────────────────────────────────────
   VIDRIO `light` —velo blanco, el mismo de los botones claros— con el texto en
   BLANCO.

   Es la única pieza que rompe una variante por dentro, y se escribe porque hay
   que saberlo: `light` existe justamente para mover el velo Y el contenido a la
   vez —velo claro, contenido a tinta— y aquí se le devuelven los cuatro
   `--av-on-glass-*` a claro.

   El número, para que esté en algún sitio: medido sobre el panel del buscador,
   el velo `light` compone un gris de ~140 y el blanco encima da 3.3:1, por
   debajo del 4.5 de AA (la tinta sobre ese mismo gris daba 6.0). Si hay que
   subirlo sin cambiar el color de la letra, el botón es BAJAR `--lg-veil-a` de
   la variante —menos velo blanco, fondo más oscuro—. No se toca desde aquí
   porque `light` es compartida.

   Deja de valer `--av-solid-*`. Esos son los tonos del PAPEL, y aquí ya no hay
   papel debajo del texto: hay velo.

   Escrito porque contradice al §6 —«nada de vidrio en la capa de contenido, y
   nada de vidrio sobre vidrio»— y la contradicción es a propósito, pedida:
   sobre el panel a pantalla completa la ficha blanca sólida era el único objeto
   opaco de todo el sistema y se leía como un parche. Lo que la regla protege es
   que el precio se lea, y eso lo sigue garantizando el velo, que es FIJO: no se
   adapta a la foto que pase por detrás.

   Lo que sigue en pie de la regla: son dos capas compuestas más por resultado.
   Con la lista corta del buscador va sobrado; en una grilla larga de producto,
   no — ahí las fichas vuelven a ser sólidas. */
.av-card {
  display: block;
  width: 100%;
  border: 0;
  padding: 0;
  background: none;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  /* Los cuatro tokens de contenido, de vuelta a claro. `.av-glass--light` los
     acaba de poner a tinta y aquí se deshace. Van como TOKENS y no como un
     `color` suelto para que los hijos —línea, nombre, precio, chevron y la caja
     de la foto— sigan sin escribir ni un color propio. */
  --av-on-glass:        rgba(255, 255, 255, .72);
  --av-on-glass-strong: #FFFFFF;
  --av-on-glass-hover:  rgba(255, 255, 255, .10);
  --av-on-glass-hair:   rgba(255, 255, 255, .14);
  color: var(--av-on-glass-strong);
}
/* La fila vive en `__body`, no en la raíz: la raíz la ocupan las cuatro capas
   del material y son `absolute`, así que el flex tiene que estar por dentro. */
.av-card > :deep(.av-glass__body) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
}
/* La foto va SUELTA, sin caja debajo. Tenía un recuadro redondeado con
   `--av-on-glass-hair` de fondo y sumaba una tercera superficie a la pila
   —panel de vidrio, ficha de vidrio y encima el recuadro—: tres velos apilados
   para enmarcar un PNG que ya viene recortado. El recuadro no aportaba nada que
   la ficha no hiciera ya, así que se cae y queda sólo el zapato. `place-items`
   sigue centrándolo dentro de los 62 px. */
.av-card__shot {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  flex: none;
}
.av-card__shot img { width: 100%; height: 100%; object-fit: contain; }

/* La tarjeta tenía cuatro cuerpos distintos — 10.5, 14.5, 14 y 12.5 — y ahora
   tiene uno: 13.5, el mismo del resto del panel, y en el MISMO peso: 500, sin
   negrita en ningún sitio. Lo que ordena la tarjeta es el COLOR: el nombre y el
   precio en el tono fuerte, la línea y el precio tachado en el suave. Que sea
   lo más importante no lo dice el tamaño, ni ahora el peso — lo dice el tono.
   La única negrita que queda en la tarjeta es la píldora del descuento, y es
   la misma excepción que cualquier badge — un número dentro de una burbuja, no
   texto corrido. */
.av-card__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.av-card__line {
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.005em;
  color: var(--av-on-glass);
  /* una línea y con puntos suspensivos: el nombre largo no puede empujar al
     precio fuera de la tarjeta */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.av-card__name {
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.005em;
  color: var(--av-on-glass-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.av-card__prices { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.av-card__prices b { font-size: 13.5px; font-weight: 500; color: var(--av-on-glass-strong); font-variant-numeric: tabular-nums; }
.av-card__prices s { font-size: 13.5px; color: var(--av-on-glass); }
/* El amarillo de marca como acento corto, que es para lo que sirve — el mismo
   papel que la burbuja del contador en la barra. */
/* La burbuja del descuento es la única de la tarjeta que se sale de los 13.5,
   y no por jerarquía: a 13.5 la píldora amarilla medía casi tanto como la foto
   del producto. Es la misma excepción que el contador de la bolsa — un número
   dentro de una burbuja, no texto. */
.av-card__prices em {
  font-style: normal;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--av-y-400);
  color: var(--av-ink);
  font-size: 11px;
  font-weight: 700;
}
.av-card__chev { width: 18px; height: 18px; flex: none; color: var(--av-on-glass); }

/* ══ el buscador en ESCRITORIO Y TABLETA ═══════════════════════════════════
   Aquí no es una ventana: es una barra en la cabecera y un desplegable que cae
   debajo con su mismo ancho. La ventana a pantalla completa se queda para el
   teléfono, donde no hay sitio para colgar nada de nada.

   La misma pieza sirve para los dos casos y sólo cambia su caja, que es la
   razón de que esto sea una media query y no un segundo componente: el
   contenido —sugerencias, resultados, «ver todos»— es idéntico.

   Dónde cae: `--av-search-x` es `relleno + marca + hueco`, exactamente donde el
   flujo coloca la barra, y `--av-search-w` es su ancho. Los dos viven en
   `tokens.css` justamente para que la barra y el desplegable no puedan
   desalinearse — leen el mismo par de números. */
.av-search__scrim { display: none; }

@media (min-width: 1280px) {
  /* recoge el clic de fuera; va por debajo del panel y por encima de todo lo
     demás, y transparente a propósito */
  .av-search__scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 57;
    background: none;
  }

  .av-search {
    /* deshace el `inset: 0` y el `100vw` de la ventana */
    inset: auto;
    top: calc(var(--av-nav-top) + var(--av-nav-h) + 8px);
    left: var(--av-search-x);
    width: var(--av-search-w);
    height: auto;
    max-height: min(58vh, 520px);

    /* Y deshace la GEOMETRÍA de la variante `panel`, que es de superficies que
       se comen la pantalla: aquí la pieza mide 240 px de ancho y una lente de
       80 se la comería entera. Vuelve a la base — radio del sistema, lente de
       26, compresión de 82 — y recupera el marco, porque un desplegable sí
       tiene esquina y sí se despega de lo que hay debajo. */
    --lg-r:     var(--lg-r-base);
    --lg-edge:  26px;
    --lg-scale: 82;
    --lg-frame: 1;
  }

  /* el campo ya está en la cabecera; aquí sobra, y con él la X de cerrar */
  .av-search__head { display: none; }

  .av-search__body { padding: 10px; }
  .av-search__scroll { padding-top: 0; }
  .av-search__title { margin-bottom: 6px; padding: 0 2px; }
  .av-search__all { margin-top: 10px; }

  /* La ficha se estrecha con el panel: a 240 px la foto de 62 se comía la
     mitad. 44 deja sitio al nombre, que es lo que se lee. */
  .av-card__shot { width: 44px; height: 44px; }
  .av-card > :deep(.av-glass__body) { gap: 10px; padding: 8px 10px; }
  .av-card__chev { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .av-search__scroll { scroll-behavior: auto; }
}
</style>

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
 * Los dos paneles salen del mismo sitio y con el mismo material, y se
 * diferencian en el ancho porque se diferencian en lo que piden: el menú se
 * ciñe a su ítem más largo y cuelga del borde derecho, que es donde está el ⋯;
 * el buscador ocupa el ancho entero de la barra, porque un campo de texto
 * necesita sitio donde escribir.
 *
 * Por qué en móvil la barra de arriba desaparece entera: con dos barras el
 * teléfono pedía dos decisiones a la vez y ninguna de las dos se leía como la
 * principal. Con una sola, y los enlaces detrás de un gesto, cada momento tiene
 * una acción. Y al abrir el menú se esconde también la barra: mientras el menú
 * está abierto no hay nada más que tocar.
 *
 * La marca se va ARRIBA A LA DERECHA DEL PANEL. No es decoración: es lo único
 * que queda de identidad cuando la barra de arriba ya no está, y ahí aparece
 * justo cuando el usuario está mirando el menú.
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
  ChevronLeft, ChevronRight, ArrowRight, Check,
  House, Store, Sparkles, Info,
} from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    default: () => ([
      /* El icono es para el menú de móvil — la píldora de escritorio es sólo
         texto y lo ignora. Es opcional: unos `items` de fuera sin icono siguen
         funcionando, el menú deja el hueco y alinea igual. */
      { id: 'home', label: 'Inicio', to: '/', icon: House },
      { id: 'shop', label: 'Productos', to: '/shop', icon: Store },
      { id: 'new', label: 'Próximamente', to: '/new', icon: Sparkles },
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
   * Los filtros, en ÁRBOL: cada nodo es `{ id, label, children? }`. Sin
   * `children` es una hoja — se marca como aplicado. Con `children` es una
   * rama — lleva a sus hijos, nunca se aplica ella misma.
   *
   * `Mujer` es hoja hoy porque sus subcategorías todavía no están definidas
   * (PLACEHOLDER): en cuanto existan, basta con darle `children` y pasa a
   * comportarse como `Hombre` sin tocar nada más.
   */
  filters: {
    type: Array,
    default: () => ([
      {
        id: 'hombre', label: 'Hombre', children: [
          {
            id: 'calzado', label: 'Calzado', children: [
              { id: 'nike', label: 'Nike' },
              { id: 'adidas', label: 'Adidas' },
              { id: 'puma', label: 'Puma' },
              { id: 'new-balance', label: 'New Balance' },
            ],
          },
          { id: 'ropa', label: 'Ropa' },
          { id: 'accesorios', label: 'Accesorios' },
        ],
      },
      { id: 'mujer', label: 'Mujer' },
      { id: 'productos', label: 'Productos' },
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
   Este SÍ va con `v-if` y no duplicado en CSS, al revés que las dos
   disposiciones: aquí lo que decide no es el ancho de la ventana —que el
   servidor no sabe— sino un estado que arranca cerrado en los dos lados. No hay
   nada que corregir al hidratar, y cerrado no cuesta una capa de vidrio. */
const menuOpen = ref(false)
const searchOpen = ref(false)
/* Los filtros aplicados. Viven aquí y se emiten enteros: el prototipo tiene que
   poder enseñar el estado sin que nadie de fuera lo gobierne, y quien quiera
   gobernarlo escucha `filter` y recibe la lista completa. */
const applied = ref([])

/* El recorrido dentro del árbol de filtros: una pila de NODOS, no de ids — así
   el título y la lista de la rama actual salen de leer el último elemento, sin
   volver a recorrer el árbol desde la raíz cada vez.

   Al elegir una rama, sus hermanas no se colapsan: DESAPARECEN, y sólo queda
   lo de dentro más un botón para volver. Es la diferencia entre un acordeón y
   un recorrido — aquí no hay dos niveles abiertos a la vez, hay uno solo, y
   siempre se sabe cuál. */
const filterPath = ref([])

const currentFilters = computed(() => filterPath.value.length
  ? filterPath.value.at(-1).children || []
  : props.filters)

const filterTitle = computed(() => filterPath.value.length
  ? filterPath.value.at(-1).label
  : 'Filtros')

function openFilterNode(node) {
  if (node.children?.length) filterPath.value = [...filterPath.value, node]
  else toggleFilter(node.id)
}

function backFilters() {
  filterPath.value = filterPath.value.slice(0, -1)
}
const moreBtn = ref(null)
const searchBtn = ref(null)
const menuList = ref(null)
const searchInput = ref(null)
const query = ref('')

/* Uno cada vez. Abrir uno cierra el otro sin devolver el foco — el foco se lo
   queda el que acaba de abrirse. */
const panelOpen = computed(() => menuOpen.value || searchOpen.value)

function openMenu() {
  closeSearch(false)
  filterPath.value = []   // el menú siempre se abre por la raíz del árbol
  menuOpen.value = true
  /* el foco entra al panel: con la barra oculta no queda nada detrás que tocar,
     y dejarlo en un botón que acaba de desaparecer lo mandaba al body */
  nextTick(() => menuList.value?.querySelector('a')?.focus())
}

function closeMenu(refocus = true) {
  if (!menuOpen.value) return
  menuOpen.value = false
  if (refocus) nextTick(() => moreBtn.value?.focus())
}

function pickLink(id) {
  emit('select', id)
  closeMenu()
}

/* Los filtros NO cierran el menú ni llevan a otro sitio: se marcan ahí mismo y
   se siguen viendo los que ya hay puestos. Es la diferencia entre elegir y
   navegar — elegir varios seguidos no puede costar cuatro aperturas. */
function isApplied(id) { return applied.value.includes(id) }

function toggleFilter(id) {
  applied.value = isApplied(id)
    ? applied.value.filter(x => x !== id)
    : [...applied.value, id]
  emit('filter', [...applied.value])
}

function clearFilters() {
  applied.value = []
  emit('filter', [])
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
function openSearch() {
  closeMenu(false)
  searchOpen.value = true
  nextTick(() => searchInput.value?.focus())
}

function closeSearch(refocus = true) {
  if (!searchOpen.value) return
  searchOpen.value = false
  /* bajar el teclado a mano: si el input se queda con el foco, en Android sigue
     levantado sobre una barra que ya volvió a su sitio */
  searchInput.value?.blur()
  kbInset.value = 0
  vvTop.value = 0
  if (refocus) nextTick(() => searchBtn.value?.focus())
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
  <header class="av-nav">
    <!-- la marca, SIN panel: a la altura de la barra y suelta sobre el fondo.
         Se lee sola porque el recorte tiene alfa de verdad y el halo la despega
         de cualquier fondo — ya no depende de tener vidrio oscuro detrás. -->
    <a
      href="/"
      class="av-nav__brand"
      aria-label="20 Avenida — inicio"
      @click.prevent="emit('select', 'home')"
    >
      <BrandMark :size="58" />
    </a>

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
              {{ item.label }}
            </a>
          </li>
        </ul>
      </div>
    </GlassSurface>

    <!-- las tres acciones sueltas: sólo escritorio -->
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
      <GlassSurface :radius="999" tag="nav" class="av-bar__panel" aria-label="Acciones">
        <ul class="av-bar__list">
          <!-- Buscar va primero, como en cualquier tienda: es lo que hace el
               que ya sabe lo que quiere. No está en `actions` porque no emite
               `open` — abre su propio panel, igual que el ⋯. -->
          <li>
            <button
              ref="searchBtn"
              type="button"
              class="av-bar__btn"
              aria-label="Buscar"
              aria-haspopup="true"
              aria-controls="av-search"
              :aria-expanded="searchOpen"
              @click="searchOpen ? closeSearch() : openSearch()"
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
              ref="moreBtn"
              type="button"
              class="av-bar__btn"
              aria-label="Menú"
              aria-haspopup="true"
              aria-controls="av-menu"
              :aria-expanded="menuOpen"
              @click="menuOpen ? closeMenu() : openMenu()"
            >
              <span class="av-glyph"><MoreHorizontal :stroke-width="2" /></span>
            </button>
          </li>
        </ul>
      </GlassSurface>
  </div>

  <!-- El velo recoge el clic de fuera y va TRANSPARENTE: oscurecer sería
       inventar una capa que el sistema no tiene, y el panel ya se despega solo
       — para eso está el material —.

       `touch-action: none` es lo que impide que la página siga scrolleando por
       detrás. NO se toca `overflow` de nadie: un `overflow: hidden` en el body
       convertiría al escenario en contenedor de scroll y rompería el `sticky`
       del showcase, que es el bug que ya se pagó una vez. -->
  <!-- ── el menú ────────────────────────────────────────────────
       Se pega a la esquina superior derecha de la PANTALLA, no al borde del
       panel de la barra: atándolo al margen de la pantalla gana todo el ancho
       que la barra dejaba libre a su derecha.

       Y el margen es el MISMO por arriba que por la derecha — los dos son
       `--av-nav-gap`, el hueco donde se posaba la barra que acaba de
       esconderse. El panel no aparece en otro sitio: aparece en el suyo. -->
  <GlassSurface
    v-if="menuOpen"
    id="av-menu"
    tag="nav"
    class="av-menu"
    aria-label="Navegación"
    :style="{ '--av-vv': vvTop + 'px' }"
  >
    <div class="av-menu__body">
      <!-- el menú: SIEMPRE completo y fuera del scroll — el usuario tiene que
           ver las cinco opciones sin buscarlas, dure lo que dure la lista de
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

      <!-- los filtros: EXPLÍCITOS y con más alto que el menú — son la parte
           que se explora, y explorar necesita sitio. Se hunden en vez de
           desplegarse: al elegir una rama sus hermanas se van del todo y sólo
           queda lo de dentro, con un camino de vuelta arriba. -->
      <div v-if="filters.length" class="av-menu__filters">
        <div class="av-menu__section">
          <button
            v-if="filterPath.length"
            type="button"
            class="av-menu__back"
            aria-label="Volver"
            @click="backFilters"
          >
            <ChevronLeft :stroke-width="2.1" />
          </button>
          <p class="av-menu__title">{{ filterTitle }}</p>
          <!-- La misma burbuja del contador de la bolsa: el amarillo de marca
               como acento corto, que es para lo único que sirve. Cuenta el
               total aplicado, no lo que hay en la rama actual — se ve desde
               cualquier profundidad. -->
          <span v-if="applied.length" class="av-menu__count av-glass-bubble">{{ applied.length }}</span>
          <button
            v-if="applied.length"
            type="button"
            class="av-menu__clear"
            @click="clearFilters"
          >Limpiar</button>
        </div>

        <ul class="av-menu__list av-menu__scroll">
          <li v-for="node in currentFilters" :key="node.id">
            <button
              type="button"
              class="av-menu__link"
              :class="{ 'is-active': !node.children && isApplied(node.id) }"
              :aria-pressed="node.children ? undefined : isApplied(node.id)"
              @click="openFilterNode(node)"
            >
              <span v-if="!node.children && isApplied(node.id)" class="av-glass-sel" aria-hidden="true" />
              <span class="av-menu__icon av-glyph">
                <Check v-if="!node.children && isApplied(node.id)" :stroke-width="2.2" />
              </span>
              {{ node.label }}
              <ChevronRight v-if="node.children?.length" class="av-menu__chev" :stroke-width="1.8" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </GlassSurface>

  <div v-if="menuOpen" class="av-menu__scrim" aria-hidden="true" @click="closeMenu" />

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
  <GlassSurface
    v-show="searchOpen"
    id="av-search"
    class="av-search"
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
              <button type="button" class="av-card" @click="pickResult(p)">
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
              </button>
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
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: var(--av-nav-gap) clamp(16px, 3vw, 34px);
  pointer-events: none;    /* el hueco entre piezas deja pasar el cursor */
}
.av-nav > * { pointer-events: auto; }

.av-nav__action {
  width: var(--av-nav-h);
  height: var(--av-nav-h);
  flex: none;
}
/* la marca no lleva panel: es la pieza mas alta de la barra y por eso se nota */
.av-nav__brand {
  display: grid;
  place-items: center;
  height: var(--av-nav-h);
  flex: none;
  /* la marca es la pieza más alta de la barra y mide lo mismo que ella: un
     número, no dos que haya que acordarse de mover a la vez */
  --av-mark-h: var(--av-nav-h);
}
.av-nav__pill {
  height: var(--av-nav-h);
  justify-self: center;
  max-width: 100%;
}

.av-nav__pill :deep(.av-glass__body) { height: 100%; }
.av-nav__inner { display: flex; align-items: center; height: 100%; padding: 0 9px; }

.av-nav__links {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* el texto sobre vidrio va al mismo 72% que el glifo: es el mismo "medio
   iluminado" */
.av-nav__link {
  position: relative;
  display: block;
  padding: 13px 20px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: .005em;
  white-space: nowrap;
  color: var(--av-on-glass);
  text-decoration: none;
  transition: color .2s ease, background-color .2s ease;
}
.av-nav__link:hover { color: var(--av-on-glass-strong); background: var(--av-on-glass-hover); }

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
  gap: 10px;
}
/* `.av-glyph` va en un span alrededor del icono, NUNCA en el botón: la clase
   lleva `filter: drop-shadow(...)` y un ancestro con `filter` crea un backdrop
   root — el `backdrop-filter` de la burbuja y el de la selección se quedarían
   sin nada que refractar y dejarían de ser vidrio. */
.av-glyph { display: grid; place-items: center; }

.av-nav__action :deep(.av-glass__body) { height: 100%; }
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
.av-bar,
.av-menu,
.av-menu__scrim { display: none; }
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
  height: calc(var(--av-nav-h) - 14px);
  border: 0;
  border-radius: 999px;
  background: none;
  padding: 0;
  cursor: pointer;
}

@media (max-width: 900px) {
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

  /* ── el menú ────────────────────────────────────────────── */
  .av-menu__scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 50;
    background: none;
    touch-action: none;
  }

  .av-menu {
    position: fixed;
    /* Ocupa el sitio de la barra, que con el menú abierto ya no está:
       `--av-nav-top` es exactamente donde ella se posaba. */
    top: calc(var(--av-nav-top) + var(--av-vv, 0px));
    /* Al margen de la PANTALLA, no al borde del panel: así gana el ancho que la
       barra dejaba libre a su derecha en vez de morir en su borde.

       Y es el MISMO número que el de arriba — los dos salen de `--av-nav-gap`.
       Una esquina con dos márgenes distintos se ve torcida aunque nadie sepa
       decir por qué. */
    right: var(--av-nav-gap);
    z-index: 52;

    /* El ancho lo pone el contenido, con un suelo para aprovechar el sitio que
       ahora hay y un techo para que nunca toque el margen contrario. */
    width: max-content;
    min-width: 244px;
    max-width: calc(100vw - var(--av-nav-gap) * 2);

    /* HEIGHT, no max-height: el panel se ESTIRA hasta llenar el hueco entre la
       barra y el borde de abajo, no se encoge a su contenido. Es a propósito
       — los filtros piden más alto que el menú, y sin esto el panel se quedaba
       tan corto como sus cinco enlaces y no había dónde darles ese alto.

       Descuenta lo que ya se llevó la barra, el teclado si estuviera, y deja el
       hueco de siempre al final. Nunca pasa del borde porque la altura sale de
       restar, no de un tope.

       `display: flex` sobre `.av-glass` es seguro: las tres capas del material
       son `position: absolute`, así que no son ítems de flex y no se enteran. El
       único ítem es `__body`. */
    display: flex;
    height: calc(100dvh - var(--av-nav-top) - var(--av-kb, 0px) - var(--av-nav-gap));
  }
  .av-menu :deep(.av-glass__body) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;   /* sin esto un hijo con scroll no deja encoger al padre */
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
    padding: 8px;
  }

  /* El menú NO scrollea y NO se encoge: `flex: none` de sobra porque nadie le
     pide que crezca, pero lo digo aquí porque es la regla — estas cinco filas
     tienen que verse enteras siempre, pase lo que pase con los filtros. */
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

     LA LETRA A 10.5 px, y con ella lo demás a la misma proporción — icono,
     hueco y relleno bajan todos junto con el texto, porque una fila no puede
     tener una letra pequeña y un icono que sigue gritando el tamaño de antes.

     El ALTO no baja con lo demás, y es la única pieza que no escala: 44 px es
     el mínimo de un objetivo táctil, y bajar de ahí no libera espacio de
     verdad — lo que hace es que el dedo falle. El alto que se gana viene del
     relleno y el icono, no de pedirle menos al pulgar. */
  .av-menu__link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 44px;
    padding: 0 10px;
    border-radius: var(--lg-r-base);
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: -.005em;
    white-space: nowrap;
    color: var(--av-on-glass);
    text-decoration: none;
  }
  /* El icono reserva su hueco aunque no haya icono: así las etiquetas quedan en
     la misma columna con `items` de fuera que no traigan ninguno. */
  .av-menu__icon { width: 14px; flex: none; }
  .av-menu__icon :deep(svg) { width: 14px; height: 14px; }

  /* El activo lleva `.av-glass-sel`, igual que la píldora de escritorio, y el
     texto NO cambia: lo que marca la selección es el panel y sólo el panel. Es
     la misma excepción de 01-velo-negro.md §7 aplicada al mismo caso — el ítem
     activo de una navegación. */
  .av-menu__link.is-active { color: var(--av-on-glass); }

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
    padding: 10px 10px 0;
    border-top: 1px solid var(--av-on-glass-hair);
  }
  /* Volver un nivel. Redonda y pequeña a propósito: no compite con el título,
     que es lo que dice dónde estás — esto sólo dice que se puede salir. */
  .av-menu__back {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    flex: none;
    margin-left: -4px;
    border: 0;
    border-radius: 50%;
    background: none;
    padding: 0;
    color: var(--av-on-glass-strong);
    cursor: pointer;
  }
  .av-menu__back :deep(svg) { width: 15px; height: 15px; }

  .av-menu__title {
    margin: 0;
    /* No escala con `.av-menu__link`: es un título, no una fila, y a 10.5 se
       confundiría con los ítems que títula. */
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: var(--av-on-glass);
    /* el título cambia («Filtros» → «Calzado») y puede ser más largo que el
       hueco que queda junto al contador y «Limpiar» */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* la misma pieza que la burbuja de la bolsa, con las mismas medidas */
  .av-menu__count {
    display: grid;
    place-items: center;
    min-width: 18px;
    height: 18px;
    flex: none;
    padding: 0 5px;
    border-radius: 999px;
    color: var(--av-ink);
    font-size: 10px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .av-menu__clear {
    margin-left: auto;
    flex: none;
    border: 0;
    background: none;
    padding: 2px 0;
    font-family: inherit;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: -.01em;
    color: var(--av-on-glass);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  /* Un filtro puesto se marca con `.av-glass-sel` y un check en la columna del
     icono — la misma selección que el ítem activo de la barra, y el texto
     tampoco cambia. Lo que marca la selección es el panel, y sólo el panel. */
  .av-menu__link[aria-pressed='true'] { color: var(--av-on-glass); }
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
  --lg-r: 0px;
}
.av-search :deep(.av-glass__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.av-search__body {
  display: flex;
  flex-direction: column;
  min-height: 0;
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
   queda en el 72% de siempre. */
.av-search__field input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: none;
  outline: none;
  font-family: inherit;
  font-size: 16px;   /* por debajo de 16 iOS hace zoom solo al enfocar */
  font-weight: 500;
  letter-spacing: -.01em;
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

.av-search__title {
  margin: 0 0 10px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--av-on-glass);
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
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -.01em;
  text-align: left;
  color: var(--av-on-glass);
  cursor: pointer;
}

.av-search__empty {
  margin: 0;
  font-size: 14px;
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
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -.01em;
  color: var(--av-on-glass-strong);
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}
.av-search__all :deep(svg) { width: 16px; height: 16px; }

/* ── la tarjeta de resultado ──────────────────────────────────────
   SÓLIDA, y no es una elección estética: el §6 dice que el vidrio es de la capa
   que flota y que las tarjetas de una lista son contenido. Además el precio no
   puede depender de la foto que pase por detrás. Sobre papel manda
   `--av-solid-*`, nunca los tonos de encima del velo. */
.av-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: var(--lg-r-base);
  background: var(--av-solid-bg);
  color: var(--av-solid-fg);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.av-card__shot {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  flex: none;
  border-radius: var(--lg-r-base);
  overflow: hidden;
  background: var(--av-solid-hair);
}
.av-card__shot img { width: 100%; height: 100%; object-fit: contain; }

.av-card__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.av-card__line {
  font-size: 10.5px;
  letter-spacing: .04em;
  color: var(--av-solid-fg-soft);
  /* una línea y con puntos suspensivos: el nombre largo no puede empujar al
     precio fuera de la tarjeta */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.av-card__name {
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.av-card__prices { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.av-card__prices b { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
.av-card__prices s { font-size: 12.5px; color: var(--av-solid-fg-soft); }
/* El amarillo de marca como acento corto, que es para lo que sirve — el mismo
   papel que la burbuja del contador en la barra. */
.av-card__prices em {
  font-style: normal;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--av-y-400);
  color: var(--av-ink);
  font-size: 11px;
  font-weight: 700;
}
.av-card__chev { width: 18px; height: 18px; flex: none; color: var(--av-solid-fg-soft); }

@media (prefers-reduced-motion: reduce) {
  .av-search__scroll { scroll-behavior: auto; }
}
</style>

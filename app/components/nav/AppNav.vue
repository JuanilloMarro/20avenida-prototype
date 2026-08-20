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
  House, Store, Sparkles, LayoutGrid, Info, Mail,
} from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    default: () => ([
      /* El icono es para el menú de móvil — la píldora de escritorio es sólo
         texto y lo ignora. Es opcional: unos `items` de fuera sin icono siguen
         funcionando, el menú deja el hueco y alinea igual. */
      { id: 'home', label: 'Home', to: '/', icon: House },
      { id: 'shop', label: 'Shop', to: '/shop', icon: Store },
      { id: 'new', label: 'New Arrivals', to: '/new', icon: Sparkles },
      { id: 'collections', label: 'Collections', to: '/collections', icon: LayoutGrid },
      { id: 'about', label: 'About', to: '/about', icon: Info },
      { id: 'contact', label: 'Contact', to: '/contact', icon: Mail },
    ]),
  },
  active: { type: String, default: 'home' },
  /** Nº de artículos en la bolsa. 0 = sin burbuja. */
  bag: { type: Number, default: 0 },
  /** Cuál de las tres acciones está seleccionada en la barra. */
  activeAction: { type: String, default: 'bag' },
  /** Sugerencias del buscador. PLACEHOLDER: hoy son literales; cuando haya
      catálogo salen de él o del historial del usuario. */
  suggestions: { type: Array, default: () => ['Samba OG', 'Originals', 'Novedades'] },
})

const emit = defineEmits(['select', 'open', 'search'])

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
  if (e.key === 'Escape') { closeMenu(); closeSearch() }
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
      <BrandMark :size="70" />
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
  <div
    class="av-bar"
    :class="{ 'is-away': panelOpen }"
    :style="{ '--av-kb': kbInset + 'px', '--av-vv': vvTop + 'px' }"
  >
    <div class="av-bar__group">
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

      <!-- ── el menú ─────────────────────────────────────────
           Cuelga del borde derecho del panel y crece hacia abajo: sale de su
           botón. Su ancho lo pone el ítem más largo — un menú de seis palabras no
           necesita la pantalla entera, y ocupando menos deja ver dónde estabas. -->
      <GlassSurface
        v-if="menuOpen"
        id="av-menu"
        :radius="22"
        tag="nav"
        class="av-menu"
        aria-label="Navegación"
      >
        <div class="av-menu__body">
          <!-- la marca, arriba a la derecha. Va sin panel: dentro del menú
               sería vidrio sobre vidrio. -->
          <a
            href="/"
            class="av-menu__brand"
            aria-label="20 Avenida — inicio"
            @click.prevent="pickLink('home')"
          >
            <BrandMark :size="30" />
          </a>

          <ul ref="menuList" class="av-menu__list">
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
        </div>
      </GlassSurface>

      <!-- ── el buscador ────────────────────────────────────────
           Mismo sitio y mismo material que el menú, pero ocupa el ancho entero
           del panel: un campo de texto necesita sitio y el menú no.
           `v-show` y no `v-if` — ver la nota del script: es lo que hace que el
           teclado suba en iOS. -->
      <GlassSurface
        v-show="searchOpen"
        id="av-search"
        :radius="22"
        class="av-search"
        role="search"
      >
        <div class="av-search__body">
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

          <ul v-if="suggestions.length" class="av-search__list">
            <li v-for="q in suggestions" :key="q">
              <button type="button" class="av-search__sug" @click="pickSuggestion(q)">
                <span class="av-glyph av-search__icon"><Search :stroke-width="1.6" /></span>
                {{ q }}
              </button>
            </li>
          </ul>
        </div>
      </GlassSurface>
    </div>
  </div>

  <!-- El velo recoge el clic de fuera y va TRANSPARENTE: oscurecer sería
       inventar una capa que el sistema no tiene, y el panel ya se despega solo
       — para eso está el material —.

       `touch-action: none` es lo que impide que la página siga scrolleando por
       detrás. NO se toca `overflow` de nadie: un `overflow: hidden` en el body
       convertiría al escenario en contenedor de scroll y rompería el `sticky`
       del showcase, que es el bug que ya se pagó una vez. -->
  <div v-if="panelOpen" class="av-menu__scrim" aria-hidden="true" @click="closePanels" />
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
.av-search,
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
     teléfono hay una sola barra, arriba igual que en escritorio. Los seis
     enlaces se van al menú del ⋯. */
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
    pointer-events: none;
  }
  /* con el menú abierto el grupo sube por encima del velo: el velo es 50 y el
     menú vive DENTRO de este contenedor, así que sube todo junto */
  .av-bar.is-away { z-index: 51; }

  /* El ancla del menú. Sin `transform` ni `z-index` a propósito: los dos crean
     contexto de apilado y el de arriba además puede dejar al `backdrop-filter`
     de dentro sin nada que refractar. `position: relative` sin más no crea
     ninguno de los dos. */
  .av-bar__group {
    position: relative;
    display: flex;
    height: 100%;
    pointer-events: auto;
  }
  .av-bar.is-away .av-bar__panel { visibility: hidden; }
  /* el hueco que deja el panel invisible no puede comerse el clic de fuera */
  .av-bar.is-away .av-bar__group { pointer-events: none; }
  .av-bar.is-away .av-menu,
  .av-bar.is-away .av-search { pointer-events: auto; }

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
    position: absolute;
    right: 0;   /* al borde derecho del panel, que es donde está el ⋯ */
    top: 0;     /* apoyado en la barra, creciendo hacia abajo */
    z-index: 51;

    /* El ancho lo pone el contenido — lo marca «New Arrivals» — con un suelo
       para que no salga apretado y un techo para que nunca toque los bordes.
       Un menú de seis palabras no necesita la pantalla entera: ocupando menos
       se sigue viendo dónde estabas, que es la mitad de para qué sirve. */
    width: max-content;
    min-width: 224px;
    max-width: calc(100vw - var(--av-nav-gap) * 2);

    /* Nunca más alto que la pantalla. Un teléfono en horizontal tiene 390 px de
       alto y los seis ítems piden más: el panel se salía por arriba y lo primero
       que se comía era la marca. Aquí el panel se para y la LISTA scrollea por
       dentro — la marca se queda quieta arriba, que es donde tiene que estar.

       `display: flex` sobre `.av-glass` es seguro: las tres capas del material
       son `position: absolute`, así que no son ítems de flex y no se enteran. El
       único ítem es `__body`. */
    display: flex;
    max-height: calc(100dvh - var(--av-nav-top) - var(--av-kb, 0px) - var(--av-nav-gap));
  }
  .av-menu :deep(.av-glass__body) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;   /* sin esto un hijo con scroll no deja encoger al padre */
  }
  .av-menu__body {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 8px;
  }

  /* la marca, arriba a la derecha */
  .av-menu__brand {
    display: flex;
    justify-content: flex-end;
    padding: 2px 8px 8px;
  }

  .av-menu__list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin: 0;
    padding: 0;
    list-style: none;
    /* sólo entra en juego cuando el panel ya tocó su techo */
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;   /* el scroll no se contagia a la página */
    scrollbar-width: none;
  }
  .av-menu__list::-webkit-scrollbar { display: none; }

  /* Mismo 72% que el glifo y que los enlaces de escritorio: sobre el velo el
     texto no cambia de tono por estar en otro sitio.
     48 px de alto — por encima de los 44 que pide un objetivo táctil. */
  .av-menu__link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 13px;
    min-height: 48px;
    padding: 0 14px;
    border-radius: 13px;
    font-size: 15.5px;
    font-weight: 500;
    letter-spacing: -.01em;
    white-space: nowrap;
    color: var(--av-on-glass);
    text-decoration: none;
  }
  /* El icono reserva su hueco aunque no haya icono: así las etiquetas quedan en
     la misma columna con `items` de fuera que no traigan ninguno. */
  .av-menu__icon { width: 20px; flex: none; }
  .av-menu__icon :deep(svg) { width: 20px; height: 20px; }

  /* El activo lleva `.av-glass-sel`, igual que la píldora de escritorio, y el
     texto NO cambia: lo que marca la selección es el panel y sólo el panel. Es
     la misma excepción de 01-velo-negro.md §7 aplicada al mismo caso — el ítem
     activo de una navegación. */
  .av-menu__link.is-active { color: var(--av-on-glass); }
}

  /* ── el buscador ─────────────────────────────────────────────
     Ocupa el ancho entero del panel del que sale — `left: 0; right: 0` — y no
     el ancho de su contenido como el menú: un campo de texto necesita sitio
     donde escribir, una lista de seis palabras no. */
  .av-search {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 51;
    display: flex;
    max-height: calc(100dvh - var(--av-nav-top) - var(--av-kb, 0px) - var(--av-nav-gap));
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
    padding: 8px;
  }

  /* El campo lleva relleno SÓLIDO, no otra capa de vidrio: es exactamente lo
     que manda el §6 para lo que va encima del material. Un `rgba` plano no
     refracta nada, así que no compite con el panel que lo sostiene. */
  .av-search__field {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 46px;
    padding: 0 12px;
    border-radius: 13px;
    background: var(--av-on-glass-hover);
  }
  .av-search__icon { flex: none; }
  .av-search__icon :deep(svg) { width: 18px; height: 18px; }

  /* El texto que el usuario escribe sube a blanco puro: es lo único de todo el
     panel que él ha puesto ahí, y tiene que despegarse del marcador de
     posición, que se queda en el 72% de siempre. */
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

  .av-search__clear {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    flex: none;
    border: 0;
    border-radius: 50%;
    background: none;
    padding: 0;
    cursor: pointer;
  }
  .av-search__clear :deep(svg) { width: 16px; height: 16px; }

  .av-search__list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin: 8px 0 0;
    padding: 0;
    list-style: none;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
  }
  .av-search__list::-webkit-scrollbar { display: none; }

  .av-search__sug {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 44px;
    padding: 0 12px;
    border: 0;
    border-radius: 12px;
    background: none;
    font-family: inherit;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: -.01em;
    text-align: left;
    color: var(--av-on-glass);
    cursor: pointer;
  }
</style>

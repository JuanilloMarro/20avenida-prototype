<script setup>
/**
 * Barra de navegación — material Velo negro, como todo lo demás.
 *
 * Dos disposiciones, y la diferencia no es sólo de tamaño:
 *
 *   ESCRITORIO   marca en su panel circular · píldora de enlaces centrada ·
 *                tres acciones arriba a la derecha. Cinco piezas separadas.
 *   MÓVIL        la píldora sigue centrada arriba y con lo mismo dentro, pero
 *                la marca se mete DENTRO de ella; y las tres acciones bajan a
 *                un dock inferior centrado, en un único panel.
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
import { ShoppingBag, Heart, User } from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    default: () => ([
      { id: 'home', label: 'Home', to: '/' },
      { id: 'shop', label: 'Shop', to: '/shop' },
      { id: 'new', label: 'New Arrivals', to: '/new' },
      { id: 'collections', label: 'Collections', to: '/collections' },
      { id: 'about', label: 'About', to: '/about' },
      { id: 'contact', label: 'Contact', to: '/contact' },
    ]),
  },
  active: { type: String, default: 'home' },
  /** Nº de artículos en la bolsa. 0 = sin burbuja. */
  bag: { type: Number, default: 0 },
  /** Cuál de las tres acciones está seleccionada en el dock. */
  activeAction: { type: String, default: 'bag' },
})

const emit = defineEmits(['select', 'open'])

const actions = [
  { id: 'bag', icon: ShoppingBag, label: 'Bolsa' },
  { id: 'wishlist', icon: Heart, label: 'Favoritos' },
  { id: 'account', icon: User, label: 'Cuenta' },
]

/* El dock guarda su propia selección para que se vea funcionar en el prototipo;
   el `open` sigue saliendo fuera para quien lo quiera gobernar desde arriba. */
const picked = ref(props.activeAction)
watch(() => props.activeAction, v => { picked.value = v })

function openAction(id) {
  picked.value = id
  emit('open', id)
}
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
        <!-- la misma marca, dentro de la píldora: sólo móvil -->
        <a
          href="/"
          class="av-nav__mark"
          aria-label="20 Avenida — inicio"
          @click.prevent="emit('select', 'home')"
        >
          <BrandMark :size="42" />
        </a>

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

  <!-- ── dock inferior: sólo móvil ───────────────────────────────────────── -->
  <GlassSurface :radius="999" tag="nav" class="av-dock" aria-label="Acciones">
    <ul class="av-dock__list">
      <li v-for="a in actions" :key="a.id">
        <button
          type="button"
          class="av-dock__btn"
          :class="{ 'is-active': a.id === picked }"
          :aria-label="a.label"
          :aria-current="a.id === picked ? 'true' : undefined"
          @click="openAction(a.id)"
        >
          <span v-if="a.id === picked" class="av-glass-sel" aria-hidden="true" />
          <span class="av-glyph"><component :is="a.icon" :stroke-width="1.6" /></span>
          <span v-if="a.id === 'bag' && bag > 0" class="av-dock__badge av-glass-bubble">{{ bag }}</span>
        </button>
      </li>
    </ul>
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
}
.av-nav__pill {
  height: var(--av-nav-h);
  justify-self: center;
  max-width: 100%;
}

.av-nav__pill :deep(.av-glass__body) { height: 100%; }
.av-nav__inner { display: flex; align-items: center; height: 100%; padding: 0 9px; }

/* la marca dentro de la píldora sólo existe en móvil */
.av-nav__mark { display: none; }

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
.av-dock__badge {
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
.av-dock__badge { top: 4px; right: 2px; }

/* ── dock inferior ─────────────────────────────────────────────────────────
   Oculto en escritorio. En móvil es la única barra de acciones. */
.av-dock { display: none; }
.av-dock__list {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  margin: 0;
  padding: 0 8px;
  list-style: none;
}
.av-dock__btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 64px;
  height: calc(var(--av-nav-h) - 14px);
  border: 0;
  border-radius: 999px;
  background: none;
  padding: 0;
  cursor: pointer;
}

@media (max-width: 900px) {
  /* la marca se mete dentro de la píldora y su panel suelto desaparece */
  .av-nav { grid-template-columns: minmax(0, 1fr); justify-items: center; }
  .av-nav__brand { display: none; }
  .av-nav__actions { display: none; }
  .av-nav__mark {
    display: grid;
    place-items: center;
    height: 100%;
    flex: none;
    margin-right: 6px;
  }

  /* los seis enlaces no caben en un teléfono: la píldora se desplaza en
     horizontal por dentro, sin barra a la vista */
  .av-nav__inner { max-width: 100%; overflow-x: auto; scrollbar-width: none; }
  .av-nav__inner::-webkit-scrollbar { display: none; }
  .av-nav__link { padding: 13px 14px; }

  .av-dock {
    display: block;
    position: fixed;
    z-index: 50;
    left: 50%;
    transform: translateX(-50%);
    bottom: calc(var(--av-nav-gap) + env(safe-area-inset-bottom, 0px));
    height: var(--av-nav-h);
  }
}
</style>
